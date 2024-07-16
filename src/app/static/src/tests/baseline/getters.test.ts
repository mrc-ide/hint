import {baselineGetters} from "../../app/store/baseline/baseline";
import {
    mockADRState,
    mockBaselineState,
    mockDatasetResource,
    mockPopulationResponse,
    mockRootState,
    mockShapeResponse
} from "../mocks";
import {ShapeResponse} from "../../app/generated";
import {Dict} from "../../app/types";

it("is complete iff all files are present", () => {
    let state = mockBaselineState({
        validatedConsistent: true,
        country: "AFG",
        iso3: "AFG",
        shape: mockShapeResponse(),
        population: mockPopulationResponse()
    });
    expect(baselineGetters.complete(state)).toBe(true);

    state = mockBaselineState({
        country: "AFG",
        iso3: "AFG",
        shape: mockShapeResponse(),
        population: mockPopulationResponse()
    });
    expect(baselineGetters.complete(state)).toBe(false);

    state = mockBaselineState({
        validatedConsistent: true,
        iso3: "AFG",
        shape: mockShapeResponse(),
        population: mockPopulationResponse()
    });
    expect(baselineGetters.complete(state)).toBe(false);

    state = mockBaselineState({
        validatedConsistent: true,
        country: "AFG",
        shape: mockShapeResponse(),
        population: mockPopulationResponse()
    });
    expect(baselineGetters.complete(state)).toBe(false);

    state = mockBaselineState({
        validatedConsistent: true,
        country: "AFG",
        iso3: "AFG",
        population: mockPopulationResponse()
    });
    expect(baselineGetters.complete(state)).toBe(false);

    state = mockBaselineState({
        validatedConsistent: true,
        country: "AFG",
        iso3: "AFG",
        shape: mockShapeResponse()
    });
    expect(baselineGetters.complete(state)).toBe(false);
});

it("selectedDatasetAvailableResources only returns resources that the user has permissions for (ie, exists in relevant dataset)", () => {
    const resources = [
        {resource_type: "inputs-unaids-spectrum-file"},
        {resource_type: "inputs-unaids-population"},
        {resource_type: "inputs-unaids-geographic"},
        {resource_type: "inputs-unaids-survey"},
        {resource_type: "inputs-unaids-art"},
        {resource_type: "inputs-unaids-anc"}
    ]

    const selectedDataset = {
        id: "id1",
        title: "Some data",
        url: "www.adr.com/naomi-data/some-data",
        organization: {id: "org-id"},
        resources: {
            pjnz: mockDatasetResource(),
            program: mockDatasetResource(),
            pop: null,
            survey: null,
            shape: null,
            anc: null,
            vmmc: null
        }
    }

    const datasets = [
        {
            id: "id1",
            title: "Some data",
            organization: {title: "org", id: "org-id"},
            name: "some-data",
            type: "naomi-data",
            resources
        }
    ]

    let state = mockBaselineState({
        selectedDataset
    });
    let rootState = mockRootState({
        adr: mockADRState({
            datasets
        })
    })

    const getters = vi.fn()
    expect(baselineGetters.selectedDatasetAvailableResources(state, getters, rootState)).toStrictEqual(selectedDataset.resources);

    state = mockBaselineState({
        selectedDataset
    });
    rootState = mockRootState({
        adr: mockADRState({
            datasets: [
                {
                    id: "id1",
                    title: "Some data",
                    organization: {title: "org", id: "org-id"},
                    name: "some-data",
                    type: "naomi-data",
                    resources: [
                        {resource_type: "inputs-unaids-spectrum-file"}
                    ]
                }
            ]
        })
    })
    expect(baselineGetters.selectedDatasetAvailableResources(state, getters, rootState)).toStrictEqual({
        ...selectedDataset.resources,
        program: null
    });
});

it("areaIdToLevelMap returns map of area ID to level", () => {
    const shape = {
        data: {
            "type": "FeatureCollection",
            "features": [
                {
                    "properties": {
                        "area_id": "MWI_1_1",
                        "area_level": 1
                    }
                },
                {
                    "properties": {
                        "area_id": "MWI_2_1",
                        "area_level": 2
                    }
                },
                {
                    "properties": {
                        "area_id": "MWI_2_2",
                        "area_level": 2
                    }
                }
            ]
        },
        type: "shape",
        hash: "1234.csv",
        filename: "test.csv",
        filters: {
            level_labels: [{id: 1, area_level_label: "Country", display: true}],
            regions: {label: "Malawi", id: "1", children: []}
        }
    } as ShapeResponse

    let state = mockBaselineState({
        shape
    });

    const expected = {
        "MWI_1_1": 1,
        "MWI_2_1": 2,
        "MWI_2_2": 2
    } as Dict<number>
    expect(baselineGetters.areaIdToLevelMap(state)).toStrictEqual(expected);
})

it("areaIdToLevelMap returns empty if no shape data or properties", () => {
    let state = mockBaselineState();
    expect(baselineGetters.areaIdToLevelMap(state)).toStrictEqual({});

    const shape = {
        data: {
            "type": "FeatureCollection",
            "features": [
                {
                    "type": "feature",
                    "geometry": {}
                },
                {
                    "type": "feature",
                    "geometry": {}
                }
            ]
        },
        type: "shape",
        hash: "1234.csv",
        filename: "test.csv",
        filters: {
            level_labels: [{id: 1, area_level_label: "Country", display: true}],
            regions: {label: "Malawi", id: "1", children: []}
        }
    } as ShapeResponse

    state = mockBaselineState({
        shape
    });

    expect(baselineGetters.areaIdToLevelMap(state)).toStrictEqual({});
});
