import { shallowMount } from "@vue/test-utils";
import Vuex from "vuex";
import { mockBaselineState, mockModelCalibrateState, mockPlottingSelections } from "../../mocks";
import TableReshapeData from "../../../app/components/outputTable/TableReshapeData.vue";
import TableDisplay from "../../../app/components/outputTable/TableDisplay.vue";

const mockFilters = [
    {
        id: "rowFilter",
        column_id: "row_filter",
        label: "rowFilterLabel",
        options: [{id: "rowOp1", label: "rowOption1"}, {id: "rowOp2", label: "rowOption2"}]
    },
    {
        id: "colFilter",
        column_id: "col_filter",
        label: "colFilterLable",
        options: [{id: "colOp1", label: "colOption1"}, {id: "colOp2", label: "colOption2"}]
    },
    {
        id: "area",
        column_id: "area_id",
        label: "Area",
        options: []
    },
    {
        id: "age",
        column_id: "age_group",
        label: "Age",
        options: [{id: "ageOp1", label: "ageOption1"}, {id: "ageOp2", label: "ageOption2"}]
    },
];

describe("Output Table display table tests", () => {
    const createStore = (rowId: string) => new Vuex.Store({
        getters: {
            ["modelOutput/tableFilters"]: vi.fn().mockReturnValue(mockFilters)
        },
        modules: {
            modelCalibrate: {
                namespaced: true,
                state: mockModelCalibrateState({
                    metadata: {
                        tableMetadata: {
                            presets: [{
                                defaults: {
                                    id: "preset1",
                                    column: {
                                        id: "col_filter",
                                        label: "colLabel"
                                    },
                                    row: {
                                        id: rowId,
                                        label: rowId + "Label"
                                    },
                                    label: "Cool Preset"
                                },
                                filters: mockFilters
                            }]
                        },
                        plottingMetadata: {
                            barchart: {indicators: [], filters: []},
                            choropleth: {indicators: [{indicator: "pop", name: "Pop"}, {indicator: "pop2", name: "Pop2"}] as any, filters: []}
                        },
                        warnings: []
                    }
                })
            },
            plottingSelections: {
                namespaced: true,
                state: mockPlottingSelections({
                    table: {
                        preset: "preset1",
                        indicator: "pop",
                        selectedFilterOptions: {
                            rowFilter: [{id: "rowOp2", label: "rowOption2"}],
                            area: [{id: "place1", label: "Place1"}],
                            age: [{id: "ageOp1", label: "ageOption1"}],
                        }
                    }
                })
            },
            baseline: {
                namespaced: true,
                state: mockBaselineState({
                    shape: {
                        data: {
                            features: [
                                {
                                    properties: {
                                        area_id: "place1",
                                        area_name: "Place1"
                                    }
                                },
                                {
                                    properties: {
                                        area_id: "place2",
                                        area_name: "Place2"
                                    }
                                },
                            ],
                        }
                    } as any
                })
            }
        }
    });
    const getWrapper = (rowId = "row_filter") => {
        const store = createStore(rowId);
        return shallowMount(TableReshapeData, {
            props: {
                data: [
                    {
                        id: 1,
                        indicator: "pop",
                        row_filter: "rowOp2",
                        col_filter: "colOp2",
                        area_id: "place1",
                        age_group: "ageOp1",
                        mean: 0,
                        lower: -1,
                        upper: 1
                    },
                    {
                        id: 1,
                        indicator: "pop",
                        row_filter: "rowOp2",
                        col_filter: "colOp1",
                        area_id: "place1",
                        age_group: "ageOp1",
                        mean: 10,
                        lower: 9,
                        upper: 11
                    },
                    {
                        id: 1,
                        indicator: "pop",
                        row_filter: "rowOp2",
                        col_filter: "colOp1",
                        area_id: "place2",
                        age_group: "ageOp1",
                        mean: 5,
                        lower: 4,
                        upper: 6
                    }
                ]
            },
            global: {
                plugins: [store]
            }
        });
    };

    it("reshapes data as expected", () => {
        const wrapper = getWrapper();
        expect(wrapper.findComponent(TableDisplay).props("data")).toStrictEqual([
            {
                label: "rowOption2",
                lower_colOp1: 4,
                mean_colOp1: 5,
                upper_colOp1: 6,
                lower_colOp2: -1,
                mean_colOp2: 0,
                upper_colOp2: 1,
            }
        ]);
    });

    it("reshapes data as expected when area_id is preset row", () => {
        const wrapper = getWrapper("area_id");
        expect(wrapper.findComponent(TableDisplay).props("data")).toStrictEqual([
            {
                label: "Place1",
                lower_colOp1: 9,
                mean_colOp1: 10,
                upper_colOp1: 11,
                lower_colOp2: -1,
                mean_colOp2: 0,
                upper_colOp2: 1,
            },
            {
                label: "Place2",
                lower_colOp1: 4,
                mean_colOp1: 5,
                upper_colOp1: 6,
            }
        ]);
    });

    it("computes correct label", () => {
        const wrapper = getWrapper("row_filter");
        expect(wrapper.findComponent(TableDisplay).props("headerName")).toBe("row_filterLabel");
    });
});