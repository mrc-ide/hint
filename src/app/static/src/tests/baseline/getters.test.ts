import {baselineGetters} from "../../app/store/baseline/baseline";
import { mockBaselineState, mockError, mockPopulationResponse, mockShapeResponse, mockDataExplorationState, mockADRState, mockDatasetResource } from "../mocks";

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

it("is valid for data exploration iff consistent, no errors, and shape file is present", () => {
    let state = mockBaselineState({
        shape: mockShapeResponse(),
        validatedConsistent: true
    });
    expect(baselineGetters.validForDataExploration(state)).toBe(true);

    state = mockBaselineState({
        pjnzError: mockError(""),
        shape: mockShapeResponse(),
        validatedConsistent: true
    });
    expect(baselineGetters.validForDataExploration(state)).toBe(false);

    state = mockBaselineState({
        populationError: mockError(""),
        shape: mockShapeResponse(),
        validatedConsistent: true
    });
    expect(baselineGetters.validForDataExploration(state)).toBe(false);

    state = mockBaselineState({validatedConsistent: true});
    expect(baselineGetters.validForDataExploration(state)).toBe(false);

    state = mockBaselineState({
        shape: mockShapeResponse(),
        validatedConsistent: false
    });
    expect(baselineGetters.validForDataExploration(state)).toBe(false);
});

it("selectedDatasetAvailableResources only returns resources that the user has persmissions for (ie, exists in relevant dataset)", () => {
    const resources = [
        { resource_type: "inputs-unaids-spectrum-file" },
        { resource_type: "inputs-unaids-population" },
        { resource_type: "inputs-unaids-geographic" },
        { resource_type: "inputs-unaids-survey" },
        { resource_type: "inputs-unaids-art" },
        { resource_type: "inputs-unaids-anc" }
    ]

    const selectedDataset = {
        id: "id1",
        title: "Some data",
        url: "www.adr.com/naomi-data/some-data",
        organization: { id: "org-id" },
        resources: {
            pjnz: mockDatasetResource(),
            program: mockDatasetResource(),
            pop: null,
            survey: null,
            shape: null,
            anc: null
        }
    }

    const datasets = [
        {
            id: "id1",
            title: "Some data",
            organization: { title: "org", id: "org-id" },
            name: "some-data",
            type: "naomi-data",
            resources
        }
    ]

    let state = mockBaselineState({
        selectedDataset
    });
    let rootState = mockDataExplorationState({
        adr: mockADRState({
            datasets
        })
    })
    expect(baselineGetters.selectedDatasetAvailableResources(state, {}, rootState)).toStrictEqual(selectedDataset.resources);

    state = mockBaselineState({
        selectedDataset
    });
    rootState = mockDataExplorationState({
        adr: mockADRState({
            datasets: [
                {
                    id: "id1",
                    title: "Some data",
                    organization: { title: "org", id: "org-id" },
                    name: "some-data",
                    type: "naomi-data",
                    resources: [
                        { resource_type: "inputs-unaids-spectrum-file" }
                    ]
                }
            ]
        })
    })
    expect(baselineGetters.selectedDatasetAvailableResources(state, {}, rootState)).toStrictEqual({ ...selectedDataset.resources, program: null });
});
