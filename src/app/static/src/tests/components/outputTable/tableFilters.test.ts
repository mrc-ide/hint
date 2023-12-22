import { shallowMount } from "@vue/test-utils";
import TableFilters from "../../../app/components/outputTable/TableFilters.vue";
import Vuex from "vuex";
import { mockModelCalibrateState, mockPlottingSelections } from "../../mocks";
import { SingleSelect } from "@reside-ic/vue-nested-multiselect";
import NewFilters from "../../../app/components/outputTable/NewFilters.vue";

const mockUpdateTableSelections = vi.fn();
const mockFilters = [{
    id: "id",
    column_id: "col_id",
    label: "Label",
    options: [{id: "op1", label: "option1"}, {id: "op2", label: "option2"}]
}];

describe("Output Table filters tests", () => {
    const createStore = () => new Vuex.Store({
        getters: {
            ["modelOutput/tableFilters"]: vi.fn().mockReturnValue(mockFilters)
        },
        modules: {
            plottingSelections: {
                namespaced: true,
                state: mockPlottingSelections(),
                actions: {
                    updateTableSelections: mockUpdateTableSelections
                }
            },
            modelCalibrate: {
                namespaced: true,
                state: mockModelCalibrateState({
                    metadata: {
                        tableMetadata: {
                            presets: [
                                {
                                    defaults: {
                                        column: {
                                            id: "col",
                                            label: "colLabel"
                                        },
                                        id: "preset1",
                                        label: "Label",
                                        row: {
                                            id: "row",
                                            label: "rowLabel"
                                        }
                                    },
                                    filters: [{
                                        column_id: "filter_test_col",
                                        id: "filter_test_id",
                                        label: "filter_test_label",
                                        options: [{id: "option_id", label: "option_label"}]
                                    }]
                                },
                                {
                                    defaults: {
                                        column: {
                                            id: "col2",
                                            label: "colLabel2"
                                        },
                                        id: "preset2",
                                        label: "Label2",
                                        row: {
                                            id: "row2",
                                            label: "rowLabel2"
                                        },
                                        selected_filter_options: {
                                            id: ["op2"]
                                        }
                                    },
                                    filters: [{
                                        column_id: "filter_test_col2",
                                        id: "filter_test_id2",
                                        label: "filter_test_label2",
                                        options: [{id: "option_id2", label: "option_label2"}]
                                    }]
                                }
                            ]
                        },
                        plottingMetadata: {
                            barchart: {indicators: [], filters: []},
                            choropleth: {indicators: [{indicator: "pop", name: "Pop"}, {indicator: "pop2", name: "Pop2"}] as any, filters: []}
                        },
                        warnings: []
                    },
                })
            }
        }
    });
    const getWrapper = () => {
        const store = createStore();
        return shallowMount(TableFilters, {
            global: {
                plugins: [store]
            }
        })
    };

    afterEach(() => {
        vi.resetAllMocks();
    });

    it("renders as expected", async () => {
        const wrapper = getWrapper();

        const dropdownDivs = wrapper.findAll(".form-group");
        expect(dropdownDivs.length).toBe(2);

        const presetDiv = dropdownDivs[0];
        const presetSelect = presetDiv.findComponent(SingleSelect);
        expect(presetSelect.props("options")).toStrictEqual([{id: "preset1", label: "Label"}, {id: "preset2", label: "Label2"}]);
        expect(presetSelect.props("modelValue")).toBe("");

        const indicatorDiv = dropdownDivs[1];
        const indicatorSelect = indicatorDiv.findComponent(SingleSelect);
        expect(indicatorSelect.props("options")).toStrictEqual([{id: "pop", label: "Pop"}, {id: "pop2", label: "Pop2"}]);
        expect(indicatorSelect.props("modelValue")).toBe("");

        const filterSelect = wrapper.findComponent(NewFilters);
        expect(filterSelect.props("filters")).toStrictEqual(mockFilters);
        expect(filterSelect.props("selectedFilterOptions")).toStrictEqual({});
    });

    test("changes to default selections for all dropdowns on mount", () => {
        const wrapper = getWrapper();
        expect(mockUpdateTableSelections.mock.calls.length).toBe(3);
        //preset
        expect(mockUpdateTableSelections.mock.calls[0][1].payload).toStrictEqual({ preset: "preset1" });
        // default filters based on presets
        expect(mockUpdateTableSelections.mock.calls[1][1].payload).toStrictEqual({ selectedFilterOptions: {id: [{id: "op1", label: "option1"}]} });
        // default indicator
        expect(mockUpdateTableSelections.mock.calls[2][1].payload).toStrictEqual({ indicator: "pop" });
    });

    test("change preset works as expected", () => {
        const wrapper = getWrapper();
        const singleSelects = wrapper.findAllComponents(SingleSelect);
        const presetSelect = singleSelects[0];
        presetSelect.vm.$emit("update:modelValue", {id: "preset2"});
        // 3 on mount + 2 now
        expect(mockUpdateTableSelections.mock.calls.length).toBe(5);
        expect(mockUpdateTableSelections.mock.calls[3][1].payload).toStrictEqual({ preset: "preset2" });
        expect(mockUpdateTableSelections.mock.calls[4][1].payload).toStrictEqual({ selectedFilterOptions: {id: [{id: "op2", label: "option2"}]} });
    });

    test("change indicator works as expected", () => {
        const wrapper = getWrapper();
        const singleSelects = wrapper.findAllComponents(SingleSelect);
        const indicatorSelect = singleSelects[1];
        indicatorSelect.vm.$emit("update:modelValue", {id: "pop2"});
        // 3 on mount + 1 now
        expect(mockUpdateTableSelections.mock.calls.length).toBe(4);
        expect(mockUpdateTableSelections.mock.calls[3][1].payload).toStrictEqual({ indicator: "pop2" });
    });

    test("change filter selections works as expected", () => {
        const wrapper = getWrapper();
        const filters = wrapper.findComponent(NewFilters);
        filters.vm.$emit("update:filters", {hey: [{id: "rand", label: "Rand"}]});
        // 3 on mount + 1 now
        expect(mockUpdateTableSelections.mock.calls.length).toBe(4);
        expect(mockUpdateTableSelections.mock.calls[3][1].payload).toStrictEqual({ selectedFilterOptions: {hey: [{id: "rand", label: "Rand"}]} });
    });
});