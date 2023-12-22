import Vuex from 'vuex';
import ModelOutput from "../../../app/components/modelOutput/ModelOutput.vue";
import {
    mockBaselineState, mockCalibrateResultResponse,
    mockComparisonPlotResponse,
    mockError,
    mockModelCalibrateState,
    mockShapeResponse
} from "../../mocks";
import {mutations as modelOutputMutations} from "../../../app/store/modelOutput/mutations";
import {actions as modelOutputActions} from "../../../app/store/modelOutput/actions";
import {mutations as plottingSelectionMutations} from "../../../app/store/plottingSelections/mutations";
import {actions as plottingSelectionActions} from "../../../app/store/plottingSelections/actions";
import registerTranslations from "../../../app/store/translations/registerTranslations";
import {emptyState} from "../../../app/root";
import {inactiveFeatures} from "../../../app/main";
import BarChartWithFilters from '../../../app/vue-chart/src/bar/BarChartWithFilters.vue';
import {ModelOutputState} from "../../../app/store/modelOutput/modelOutput";
import Choropleth from "../../../app/components/plots/choropleth/Choropleth.vue";
import BubblePlot from "../../../app/components/plots/bubble/BubblePlot.vue";
import OutputTable from "../../../app/components/outputTable/OutputTable.vue"
import {expectTranslated, shallowMountWithTranslate} from "../../testHelpers";
import {BarchartIndicator, Filter, ModelOutputTabs} from "../../../app/types";
import AreaIndicatorsTable from "../../../app/components/plots/table/AreaIndicatorsTable.vue";
import ErrorAlert from "../../../app/components/ErrorAlert.vue";
import LoadingTab from '../../../app/components/modelOutput/LoadingTab.vue';

function getStore(modelOutputState: Partial<ModelOutputState> = {}, partialGetters = {}, partialSelections = {}, barchartFilters: any = ["TEST BAR FILTERS"], comparisonPlotFilters: any = ["TEST COMPARISON FILTERS"], comparisonPlotError: any = null) {
    const store = new Vuex.Store({
        state: emptyState(),
        modules: {
            baseline: {
                namespaced: true,
                state: mockBaselineState({
                    shape: mockShapeResponse({
                        data: {
                            features: ["TEST FEATURES"] as any
                        } as any,
                        filters: {
                            level_labels: ["TEST LEVEL LABELS"] as any
                        }
                    })
                })
            },
            modelCalibrate: {
                namespaced: true,
                state: mockModelCalibrateState(
                    {
                        result: mockCalibrateResultResponse({data: ["TEST DATA"] as any}),
                        comparisonPlotResult: mockComparisonPlotResponse({data: ["TEST COMPARISON DATA"] as any}),
                        comparisonPlotError
                    }
                ),
                actions: {
                    getResultData: vi.fn()
                }
            },
            modelOutput: {
                namespaced: true,
                state: {
                    selectedTab: "",
                    loading: {
                        map: false,
                        bar: false,
                        comparison: false,
                        bubble: false,
                        table: false
                    },
                    ...modelOutputState,
                },
                getters: {
                    barchartIndicators: vi.fn().mockReturnValue(["TEST BARCHART INDICATORS"]),
                    barchartFilters: vi.fn().mockReturnValue(barchartFilters),
                    comparisonPlotIndicators: vi.fn().mockReturnValue(["TEST COMPARISON INDICATORS"]),
                    comparisonPlotFilters: vi.fn().mockReturnValue(comparisonPlotFilters),
                    bubblePlotIndicators: vi.fn().mockReturnValue(["TEST BUBBLE INDICATORS"]),
                    bubblePlotFilters: vi.fn().mockReturnValue(["TEST BUBBLE FILTERS"]),
                    choroplethFilters: vi.fn().mockReturnValue(["TEST CHORO FILTERS"]),
                    choroplethIndicators: vi.fn().mockReturnValue(["TEST CHORO INDICATORS"]),
                    countryAreaFilterOption: vi.fn().mockReturnValue({TEST: "TEST countryAreaFilterOption"}),
                    comparisonPlotDefaultSelections: vi.fn().mockReturnValue(["TEST comparisonPlotDefaultSelections"]),
                    ...partialGetters
                },
                mutations: modelOutputMutations,
                actions: modelOutputActions
            },
            plottingSelections: {
                namespaced: true,
                state: {
                    barchart: {
                        detail: null,
                        indicatorId: "TestIndicator",
                        xAxisId: "region",
                        disaggregateById: "age",
                        selectedFilterOptions: {
                            region: [{id: "r1", label: "region 1"}],
                            age: [{id: "a1", label: "0-4"}]
                        }
                    },
                    comparisonPlot: {
                        detail: null,
                        indicatorId: "TestIndicator",
                        xAxisId: "age",
                        disaggregateById: "source",
                        selectedFilterOptions: {
                            region: [{id: "r1", label: "region 1"}],
                            age: [{id: "a1", label: "0-4"}]
                        }
                    },
                    bubble: {test: "TEST BUBBLE SELECTIONS"} as any,
                    outputChoropleth: {test: "TEST CHORO SELECTIONS"} as any,
                    colourScales: {
                        output: {test: "TEST OUTPUT COLOUR SCALES"} as any
                    },
                    bubbleSizeScales: {
                        output: {test: "TEST OUTPUT BUBBLE SIZE SCALES"} as any
                    },
                    table: {
                        indicator: "TestIndicator"
                    },
                    ...partialSelections
                },
                mutations: plottingSelectionMutations,
                actions: plottingSelectionActions
            },
            downloadResults: {
                namespaced: true,
                actions: {
                    prepareOutputs: vi.fn()
                }
            }
        }
    });
    registerTranslations(store);
    return store;
}

declare let currentUser: string;
currentUser = "guest";

describe("ModelOutput component", () => {
    beforeAll(async () => {
        inactiveFeatures.splice(0, inactiveFeatures.length);
    });

    it("renders choropleth", async () => {
        const store = getStore({selectedTab: ModelOutputTabs.Map});
        const wrapper = shallowMountWithTranslate(ModelOutput, store, {global: {plugins: [store]}});

        const choro = wrapper.findComponent(Choropleth);
        expect(choro.props().areaFilterId).toBe("area");
        expect(choro.props().filters).toStrictEqual(["TEST CHORO FILTERS"]);
        expect(choro.props().selections).toStrictEqual({test: "TEST CHORO SELECTIONS"});
        expect(choro.props().indicators).toStrictEqual(["TEST CHORO INDICATORS"]);
        expect(choro.props().colourScales).toStrictEqual({test: "TEST OUTPUT COLOUR SCALES"});
    });

    it("renders bubble plot", () => {
        const store = getStore({selectedTab: ModelOutputTabs.Bubble});
        const wrapper = shallowMountWithTranslate(ModelOutput, store, {global: {plugins: [store]}});

        const bubble = wrapper.findComponent(BubblePlot);
        expect(bubble.props().areaFilterId).toBe("area");
        expect(bubble.props().filters).toStrictEqual(["TEST BUBBLE FILTERS"]);
        expect(bubble.props().selections).toStrictEqual({test: "TEST BUBBLE SELECTIONS"});
        expect(bubble.props().indicators).toStrictEqual(["TEST BUBBLE INDICATORS"]);
        expect(bubble.props().colourScales).toStrictEqual({test: "TEST OUTPUT COLOUR SCALES"});
        expect(bubble.props().sizeScales).toStrictEqual({test: "TEST OUTPUT BUBBLE SIZE SCALES"});
    });

    it("renders barchart", () => {
        const store = getStore({selectedTab: ModelOutputTabs.Bar});
        const wrapper = shallowMountWithTranslate(ModelOutput, store, {global: {plugins: [store]}});
        const vm = wrapper.vm as any;

        const barchart = wrapper.findComponent(BarChartWithFilters);
        expect(barchart.props().chartData).toStrictEqual(["TEST DATA"]);
        expect(barchart.props().filterConfig).toBe(vm.barchartFilterConfig);
        expect(barchart.props().indicators).toStrictEqual(["TEST BARCHART INDICATORS"]);
        expect(barchart.props().selections).toBe(vm.barchartSelections);
        expect(barchart.props().formatFunction).toBe(vm.formatBarchartValue);
        expect(barchart.props().showRangesInTooltips).toBe(true);
        expect(barchart.props().noDataMessage).toBe("No data are available for the selected combination." +
            " Please review the combination of filter values selected.");
    });

    it("renders table", () => {
        const store = getStore({selectedTab: ModelOutputTabs.Table});
        const wrapper = shallowMountWithTranslate(ModelOutput, store, {global: {plugins: [store]}});
        const table = wrapper.findComponent(OutputTable);
        expect(table.exists()).toBe(true);

    });

    it("renders comparison plot", () => {
        const store = getStore({selectedTab: ModelOutputTabs.Comparison});
        const wrapper = shallowMountWithTranslate(ModelOutput, store, {global: {plugins: [store]}});
        const vm = wrapper.vm as any;

        expect(wrapper.findAllComponents(BarChartWithFilters).length).toBe(1);
        const comparisonPlot = wrapper.findComponent(BarChartWithFilters);
        expect(comparisonPlot.props().chartData).toStrictEqual(["TEST COMPARISON DATA"]);
        expect(comparisonPlot.props().filterConfig).toBe(vm.comparisonPlotFilterConfig);
        expect(comparisonPlot.props().indicators).toStrictEqual(["TEST COMPARISON INDICATORS"]);
        expect(comparisonPlot.props().selections).toBe(vm.comparisonPlotSelections);
        expect(comparisonPlot.props().formatFunction).toBe(vm.formatBarchartValue);
        expect(comparisonPlot.props().showRangesInTooltips).toBe(true);
        expect(comparisonPlot.props().disaggregateByConfig).toStrictEqual({fixed: true, hideFilter: true});
        expect(comparisonPlot.props().noDataMessage).toBe("No data are available for the selected combination." +
            " Please review the combination of filter values selected.");
    });

    it("renders comparison plot error", () => {
        const error = mockError("comparison plot error occurred")
        const store = getStore({selectedTab: ModelOutputTabs.Comparison}, {}, {}, [], [], error);
        const wrapper = shallowMountWithTranslate(ModelOutput, store, {global: {plugins: [store]}});
        expect(wrapper.findAllComponents(ErrorAlert).length).toBe(1);
        expect(wrapper.findComponent(ErrorAlert).props().error).toStrictEqual(error);
    });

    it("renders loading component when loading state true", () => {
        const store = getStore({
            selectedTab: ModelOutputTabs.Map,
            loading: {
                map: true,
                comparison: false,
                table: false,
                bar: false,
                bubble: false
            }
        });
        const wrapper = shallowMountWithTranslate(ModelOutput, store, {global: {plugins: [store]}});
        expect(wrapper.find("#choropleth-container").findComponent(LoadingTab).exists()).toBe(true);
        expect(wrapper.findAllComponents(LoadingTab).length).toBe(1);
    });

    it("does not render comparison plot if no there are no comparison plot indicators", () => {
        const store = getStore({selectedTab: ModelOutputTabs.Comparison}, {comparisonPlotIndicators: vi.fn().mockReturnValue([])});
        const wrapper = shallowMountWithTranslate(ModelOutput, store, {global: {plugins: [store]}});
        expect(wrapper.findAllComponents(BarChartWithFilters).length).toBe(1);
    });

    it("if no selected tab in state, defaults to select Barchart tab", () => {
        const store = getStore();
        const wrapper = shallowMountWithTranslate(ModelOutput, store, {global: {plugins: [store]}});

        const activeTab = wrapper.find("a.active");
        expectTranslated(activeTab, "Map", "Carte", "Mapa", store);
    });

    it("gets selected tab from state", () => {
        const store = getStore({selectedTab: ModelOutputTabs.Bar});
        const wrapper = shallowMountWithTranslate(ModelOutput, store, {global: {plugins: [store]}});

        const activeTab = wrapper.find("a.active");
        expectTranslated(activeTab, "Bar", "Barre", "Bar", store);
    });

    it("can change tabs", async () => {
        const store = getStore();
        const wrapper = shallowMountWithTranslate(ModelOutput, store, {
            global: {
                plugins: [store]
            }
        });
        expect(wrapper.findAll(".nav-link").length).toBe(5);

        expect(wrapper.find(".nav-link.active").text()).toBe("Map");

        expect(wrapper.find("#barchart-container").exists()).toBe(false);
        expect(wrapper.find("barchart-stub").exists()).toBe(false);

        expect(wrapper.find("#table-container").exists()).toBe(false);
        expect(wrapper.find("output-table-stub").exists()).toBe(false);

        expect(wrapper.findAll("#choropleth-container").length).toBe(1);
        expect(wrapper.findAll("choropleth-stub").length).toBe(1);

        expect(wrapper.find("#comparison-container").exists()).toBe(false);
        expect(wrapper.find("barchart-stub").exists()).toBe(false);

        expect(wrapper.find("#bubble-plot-container").exists()).toBe(false);
        expect(wrapper.find("bubble-plot-stub").exists()).toBe(false);

        //should invoke mutation
        await wrapper.findAll(".nav-link")[1].trigger("click");

        expect(wrapper.find(".nav-link.active").text()).toBe("Bar");

        expect(wrapper.findAll("#barchart-container").length).toBe(1);
        expect(wrapper.find("#barchart-container").classes()).toEqual(["col-md-12"]);
        expect(wrapper.findAllComponents(BarChartWithFilters).length).toBe(1);

        expect(wrapper.find("#table-container").exists()).toBe(false);
        expect(wrapper.find("output-table-stub").exists()).toBe(false);

        expect(wrapper.find("#choropleth-container").exists()).toBe(false);
        expect(wrapper.find("choropleth-stub").exists()).toBe(false);

        expect(wrapper.find("#comparison-container").exists()).toBe(false);
        expect(wrapper.find("barchart-stub").exists()).toBe(false);

        expect(wrapper.find("#bubble-plot-container").exists()).toBe(false);
        expect(wrapper.find("bubble-plot-stub").exists()).toBe(false);

        await wrapper.findAll(".nav-link")[2].trigger("click");

        expect(wrapper.find(".nav-link.active").text()).toBe("Table");

        expect(wrapper.find("#barchart-container").exists()).toBe(false);
        expect(wrapper.find("barchart-stub").exists()).toBe(false);

        expect(wrapper.findAll("#table-container").length).toBe(1);
        expect(wrapper.findAll("output-table-stub").length).toBe(1);

        expect(wrapper.find("#choropleth-container").exists()).toBe(false);
        expect(wrapper.find("choropleth-stub").exists()).toBe(false);

        expect(wrapper.find("#comparison-container").exists()).toBe(false);
        expect(wrapper.find("barchart-stub").exists()).toBe(false);

        expect(wrapper.find("#bubble-plot-container").exists()).toBe(false);
        expect(wrapper.find("bubble-plot-stub").exists()).toBe(false);

        await wrapper.findAll(".nav-link")[3].trigger("click");

        expect(wrapper.find(".nav-link.active").text()).toBe("Comparison");

        expect(wrapper.find("#barchart-container").exists()).toBe(false);
        expect(wrapper.find("barchart-stub").exists()).toBe(false);

        expect(wrapper.find("#table-container").exists()).toBe(false);
        expect(wrapper.find("output-table-stub").exists()).toBe(false);

        expect(wrapper.find("#choropleth-container").exists()).toBe(false);
        expect(wrapper.find("choropleth-stub").exists()).toBe(false);

        expect(wrapper.findAll("#comparison-container").length).toBe(1);
        expect(wrapper.find("#comparison-container").classes()).toEqual(["col-md-12"]);
        expect(wrapper.findAllComponents(BarChartWithFilters).length).toBe(1);

        expect(wrapper.find("#bubble-plot-container").exists()).toBe(false);
        expect(wrapper.find("bubble-plot-stub").exists()).toBe(false);

        await wrapper.findAll(".nav-link")[4].trigger("click");

        expect(wrapper.find(".nav-link.active").text()).toBe("Bubble");

        expect(wrapper.find("#barchart-container").exists()).toBe(false);
        expect(wrapper.find("barchart-stub").exists()).toBe(false);

        expect(wrapper.find("#table-container").exists()).toBe(false);
        expect(wrapper.find("output-table-stub").exists()).toBe(false);

        expect(wrapper.find("#choropleth-container").exists()).toBe(false);
        expect(wrapper.find("choropleth-stub").exists()).toBe(false);

        expect(wrapper.find("#comparison-container").exists()).toBe(false);
        expect(wrapper.find("barchart-stub").exists()).toBe(false);

        expect(wrapper.findAll("#bubble-plot-container").length).toBe(1);
        expect(wrapper.findAll("bubble-plot-stub").length).toBe(1);
    });

    it("computes chartdata", () => {
        const store = getStore();
        const wrapper = shallowMountWithTranslate(ModelOutput, store, {
            global: {
                plugins: [store]
            }
        });
        const vm = (wrapper as any).vm;

        expect(vm.chartdata).toStrictEqual(["TEST DATA"]);
    });

    it("computes barchart selections", () => {
        const store = getStore();
        const wrapper = shallowMountWithTranslate(ModelOutput, store, {
            global: {
                plugins: [store]
            }
        });
        const vm = (wrapper as any).vm;

        expect(vm.barchartSelections).toStrictEqual({
            detail: null,
            indicatorId: "TestIndicator",
            xAxisId: "region",
            disaggregateById: "age",
            selectedFilterOptions: {
                region: [{id: "r1", label: "region 1"}],
                age: [{id: "a1", label: "0-4"}]
            }
        });
    });

    it("computes comparison plot selections", () => {
        const store = getStore();
        const wrapper = shallowMountWithTranslate(ModelOutput, store, {
            global: {
                plugins: [store]
            }
        });
        const vm = (wrapper as any).vm;

        expect(vm.comparisonPlotSelections).toStrictEqual({
            detail: null,
            indicatorId: "TestIndicator",
            xAxisId: "age",
            disaggregateById: "source",
            selectedFilterOptions: {
                region: [{id: "r1", label: "region 1"}],
                age: [{id: "a1", label: "0-4"}]
            }
        });
    });

    it("computes barchart filters", () => {
        const store = getStore();
        const wrapper = shallowMountWithTranslate(ModelOutput, store, {
            global: {
                plugins: [store]
            }
        });
        const vm = (wrapper as any).vm;

        expect(vm.barchartFilterConfig).toStrictEqual({
            indicatorLabel: "Indicator",
            xAxisLabel: "X Axis",
            disaggLabel: "Disaggregate by",
            filterLabel: "Filters",
            filters: ["TEST BAR FILTERS"]
        });
    });

    it("computes comparison plot filters", () => {
        const store = getStore();
        const wrapper = shallowMountWithTranslate(ModelOutput, store, {
            global: {
                plugins: [store]
            }
        });
        const vm = (wrapper as any).vm;

        expect(vm.comparisonPlotFilterConfig).toStrictEqual({
            indicatorLabel: "Indicator",
            xAxisLabel: "X Axis",
            disaggLabel: "Disaggregate by",
            filterLabel: "Filters",
            filters: ["TEST COMPARISON FILTERS"]
        });
    });

    it("computes bubble plot indicators", () => {
        const store = getStore();
        const wrapper = shallowMountWithTranslate(ModelOutput, store, {
            global: {
                plugins: [store]
            }
        });
        const vm = (wrapper as any).vm;

        expect(vm.bubblePlotIndicators).toStrictEqual(["TEST BUBBLE INDICATORS"]);
    });

    it("computes bubble plot selections", () => {
        const store = getStore();
        const wrapper = shallowMountWithTranslate(ModelOutput, store, {
            global: {
                plugins: [store]
            }
        });
        const vm = (wrapper as any).vm;

        expect(vm.bubblePlotSelections).toStrictEqual({test: "TEST BUBBLE SELECTIONS"});
    });

    it("computes bubble plot filters", () => {
        const store = getStore();
        const wrapper = shallowMountWithTranslate(ModelOutput, store, {
            global: {
                plugins: [store]
            }
        });
        const vm = (wrapper as any).vm;

        expect(vm.bubblePlotFilters).toStrictEqual(["TEST BUBBLE FILTERS"]);
    });


    it("computes default comparison selections", () => {
        const store = getStore();
        const wrapper = shallowMountWithTranslate(ModelOutput, store, {
            global: {
                plugins: [store]
            }
        });
        const vm = (wrapper as any).vm;

        expect(vm.comparisonPlotDefaultSelections).toStrictEqual(["TEST comparisonPlotDefaultSelections"]);
    });

    it("computes features", () => {
        const store = getStore();
        const wrapper = shallowMountWithTranslate(ModelOutput, store, {
            global: {
                plugins: [store]
            }
        });
        const vm = (wrapper as any).vm;

        expect(vm.features).toStrictEqual(["TEST FEATURES"]);
    });

    it("computes feature levels", () => {
        const store = getStore();
        const wrapper = shallowMountWithTranslate(ModelOutput, store, {
            global: {
                plugins: [store]
            }
        });
        const vm = (wrapper as any).vm;

        expect(vm.featureLevels).toStrictEqual(["TEST LEVEL LABELS"]);
    });

    it("commits updated colour scale from choropleth", () => {
        const store = getStore({selectedTab: ModelOutputTabs.Map});
        const wrapper = shallowMountWithTranslate(ModelOutput, store, {
            global: {
                plugins: [store]
            }
        });

        const choro = wrapper.findComponent(Choropleth);
        const newColourScales = {test: "NEW COLOUR SCALES"};
        choro.vm.$emit("update-colour-scales", newColourScales);
        expect(store.state.plottingSelections.colourScales.output).toStrictEqual(newColourScales);
    });

    it("commits updated colour scale from bubble plot", () => {
        const store = getStore({selectedTab: ModelOutputTabs.Bubble});
        const wrapper = shallowMountWithTranslate(ModelOutput, store, {
            global: {
                plugins: [store]
            }
        });

        const bubble = wrapper.findComponent(BubblePlot);
        const bubbleColourScales = {test: "NEW BUBBLE COLOUR SCALES"};
        bubble.vm.$emit("update-colour-scales", bubbleColourScales);
        expect(store.state.plottingSelections.colourScales.output).toStrictEqual(bubbleColourScales);
    });

    it("commits updated size scale from bubble plot", () => {
        const store = getStore({selectedTab: ModelOutputTabs.Bubble});
        const wrapper = shallowMountWithTranslate(ModelOutput, store, {
            global: {
                plugins: [store]
            }
        });

        const bubble = wrapper.findComponent(BubblePlot);
        const bubbleSizeScales = {test: "NEW BUBBLE SIZE SCALES"};
        bubble.vm.$emit("update-colour-scales", bubbleSizeScales);
        expect(store.state.plottingSelections.colourScales.output).toStrictEqual(bubbleSizeScales);
    });

    it("commits updated selections from barchart and orders them according to filter", async () => {
        const testBarchartFilters = [
            {
                id: "region",
                options: [
                    {id: "r1", label: "region 1"},
                    {id: "r0", label: "region 0"},
                    {id: "r2", label: "region 2"}
                ]
            }
        ]
        const store = getStore({selectedTab: ModelOutputTabs.Bar}, {}, {}, testBarchartFilters);
        const wrapper = shallowMountWithTranslate(ModelOutput, store, {
            global: {
                plugins: [store]
            }
        });
        const currentBarchartSelections = store.state.plottingSelections.barchart

        const barchart = wrapper.findComponent(BarChartWithFilters);
        const barchartSelections = {
            selectedFilterOptions: {
                region: [
                    {id: "r1", label: "region 1"},
                    {id: "r0", label: "region 0"},
                    {id: "r2", label: "region 2"}
                ],
                age: [
                    {id: "a1", label: "0-4"},
                ]
            },
            xAxisId: "region"
        };

        const expectedBarchartSelections = {...currentBarchartSelections}
        expectedBarchartSelections.selectedFilterOptions.region = testBarchartFilters[0].options

        barchart.vm.$emit("update:selections", barchartSelections);
        expect(store.state.plottingSelections.barchart).toStrictEqual(expectedBarchartSelections);
    });

    it("commits updated selections from comparison plot and orders them according to filter", () => {
        const testComparisonPlotFilters = [
            {
                id: "region",
                options: [
                    {id: "r1", label: "region 1"},
                    {id: "r0", label: "region 0"},
                    {id: "r2", label: "region 2"}
                ]
            }
        ]
        const store = getStore({selectedTab: ModelOutputTabs.Comparison}, {}, {}, testComparisonPlotFilters);
        const wrapper = shallowMountWithTranslate(ModelOutput, store, {
            global: {
                plugins: [store]
            }
        });
        const currentComparisonPlotSelections = store.state.plottingSelections.comparisonPlot

        const comparisonPlot = wrapper.findComponent(BarChartWithFilters);
        const comparisonPlotSelections = {
            selectedFilterOptions: {
                region: [
                    {id: "r1", label: "region 1"},
                    {id: "r0", label: "region 0"},
                    {id: "r2", label: "region 2"}
                ],
                age: [
                    {id: "a1", label: "0-4"},
                ]
            },
            xAxisId: "age"
        };

        const expectedComparisonPlotSelections = {...currentComparisonPlotSelections}
        expectedComparisonPlotSelections.selectedFilterOptions.region = testComparisonPlotFilters[0].options

        comparisonPlot.vm.$emit("update:selections", comparisonPlotSelections);
        expect(store.state.plottingSelections.comparisonPlot).toStrictEqual(expectedComparisonPlotSelections);
    });

    it("commits updated selections from barchart as normal if no matching xAxis key is provided", () => {
        const testBarchartFilters = [
            {
                id: "region",
                options: [
                    {id: "r1", label: "region 1"},
                    {id: "r0", label: "region 0"},
                    {id: "r2", label: "region 2"}
                ]
            }
        ]
        const store = getStore({selectedTab: ModelOutputTabs.Bar}, {}, {}, testBarchartFilters);
        const wrapper = shallowMountWithTranslate(ModelOutput, store, {
            global: {
                plugins: [store]
            }
        });
        const currentBarchartSelections = store.state.plottingSelections.barchart

        const barchart = wrapper.findComponent(BarChartWithFilters);
        const barchartSelections = {
            selectedFilterOptions: {
                region: [
                    {id: "r1", label: "region 1"},
                    {id: "r0", label: "region 0"},
                    {id: "r2", label: "region 2"}
                ],
                age: [
                    {id: "a1", label: "0-4"},
                ]
            },
        };

        const expectedBarchartSelections = {...currentBarchartSelections}
        expectedBarchartSelections.selectedFilterOptions.region = barchartSelections.selectedFilterOptions.region

        barchart.vm.$emit("update:selections", barchartSelections);
        expect(store.state.plottingSelections.barchart).toStrictEqual(expectedBarchartSelections);
    });

    it("commits updated selections from comparison plot as normal if no matching xAxis key is provided", () => {
        const testComparisonPlotFilters = [
            {
                id: "region",
                options: [
                    {id: "r1", label: "region 1"},
                    {id: "r0", label: "region 0"},
                    {id: "r2", label: "region 2"}
                ]
            }
        ]
        const store = getStore({selectedTab: ModelOutputTabs.Bar}, {}, {}, testComparisonPlotFilters);
        const wrapper = shallowMountWithTranslate(ModelOutput, store, {
            global: {
                plugins: [store]
            }
        });
        const currentComparisonPlotSelections = store.state.plottingSelections.comparisonPlot

        const comparisonPlot = wrapper.findComponent(BarChartWithFilters);
        const comparisonPlotSelections = {
            selectedFilterOptions: {
                region: [
                    {id: "r1", label: "region 1"},
                    {id: "r0", label: "region 0"},
                    {id: "r2", label: "region 2"}
                ],
                age: [
                    {id: "a1", label: "0-4"},
                ]
            },
        };

        const expectedComparisonPlotSelections = {...currentComparisonPlotSelections}
        expectedComparisonPlotSelections.selectedFilterOptions.region = comparisonPlotSelections.selectedFilterOptions.region

        comparisonPlot.vm.$emit("update:selections", comparisonPlotSelections);
        expect(store.state.plottingSelections.comparisonPlot).toStrictEqual(expectedComparisonPlotSelections);
    });

    it("commits updated selections from barchart as normal if no barchart filters are provided", () => {
        const testBarchartFilters: Filter[] = []
        const store = getStore({selectedTab: ModelOutputTabs.Bar}, {}, {}, testBarchartFilters);
        const wrapper = shallowMountWithTranslate(ModelOutput, store, {
            global: {
                plugins: [store]
            }
        });
        const currentBarchartSelections = store.state.plottingSelections.barchart

        const barchart = wrapper.findComponent(BarChartWithFilters);
        const barchartSelections = {
            selectedFilterOptions: {
                region: [
                    {id: "r1", label: "region 1"},
                    {id: "r0", label: "region 0"},
                    {id: "r2", label: "region 2"}
                ],
                age: [
                    {id: "a1", label: "0-4"},
                ]
            },
            xAxisId: "region"
        };

        const expectedBarchartSelections = {...currentBarchartSelections}
        expectedBarchartSelections.selectedFilterOptions.region = barchartSelections.selectedFilterOptions.region

        barchart.vm.$emit("update:selections", barchartSelections);
        expect(store.state.plottingSelections.barchart).toStrictEqual(expectedBarchartSelections);
    });

    it("commits updated selections from comparison plot as normal if no barchart filters are provided", () => {
        const testComparisonPlotFilters: Filter[] = []
        const store = getStore({selectedTab: ModelOutputTabs.Bar}, {}, {}, testComparisonPlotFilters);
        const wrapper = shallowMountWithTranslate(ModelOutput, store, {
            global: {
                plugins: [store]
            }
        });
        const currentComparisonPlotSelections = store.state.plottingSelections.comparisonPlot

        const comparisonPlot = wrapper.findComponent(BarChartWithFilters);
        const comparisonPlotSelections = {
            selectedFilterOptions: {
                region: [
                    {id: "r1", label: "region 1"},
                    {id: "r0", label: "region 0"},
                    {id: "r2", label: "region 2"}
                ],
                age: [
                    {id: "a1", label: "0-4"},
                ]
            },
            xAxisId: "region"
        };

        const expectedComparisonPlotSelections = {...currentComparisonPlotSelections}
        expectedComparisonPlotSelections.selectedFilterOptions.region = comparisonPlotSelections.selectedFilterOptions.region

        comparisonPlot.vm.$emit("update:selections", comparisonPlotSelections);
        expect(store.state.plottingSelections.comparisonPlot).toStrictEqual(expectedComparisonPlotSelections);
    });

    it("commits default selections from comparison plot when indicator changes", async () => {

        const comparisonDefaultSelections = [
            {
                "indicator_id": "prevalence",
                "selected_filter_options": {},
                "x_axis_id": "sex",
                "disaggregate_by_id": "source"
            },
            {
                "indicator_id": "art_coverage",
                "selected_filter_options": {},
                "x_axis_id": "sex",
                "disaggregate_by_id": "source"
            }
        ]

        const store = getStore({selectedTab: ModelOutputTabs.Comparison}, {
            comparisonPlotDefaultSelections: vi.fn().mockReturnValue(comparisonDefaultSelections)
        }, {});
        const wrapper = shallowMountWithTranslate(ModelOutput, store, {
            global: {
                plugins: [store]
            }
        });
        const currentComparisonPlotSelections = store.state.plottingSelections.comparisonPlot

        const comparisonPlot = wrapper.findComponent(BarChartWithFilters);
        const comparisonPlotSelections = {
            indicatorId: "prevalence"
        };

        comparisonPlot.vm.$emit("update:selections", comparisonPlotSelections);
        expect(currentComparisonPlotSelections.xAxisId).toBe("age")
        expect(store.state.plottingSelections.comparisonPlot)
            .toStrictEqual({
                detail: null,
                disaggregateById: "source",
                indicatorId: "prevalence",
                selectedFilterOptions: {},
                xAxisId: "sex"
            });
    });

    it("does not commits default selections from comparison plot when indicator is re-selected", () => {

        const comparisonDefaultSelections = [
            {
                "indicator_id": "TestIndicator",
                "selected_filter_options": {},
                "x_axis_id": "age",
                "disaggregate_by_id": "source"
            }
        ]

        const store = getStore({selectedTab: ModelOutputTabs.Comparison}, {
            comparisonPlotDefaultSelections: vi.fn().mockReturnValue(comparisonDefaultSelections)
        }, {});
        const wrapper = shallowMountWithTranslate(ModelOutput, store, {
            global: {
                plugins: [store]
            }
        });
        const currentComparisonPlotSelections = store.state.plottingSelections.comparisonPlot

        const comparisonPlot = wrapper.findComponent(BarChartWithFilters);
        const comparisonPlotSelections = {
            indicatorId: "TestIndicator"
        };

        comparisonPlot.vm.$emit("update:selections", comparisonPlotSelections);
        expect(store.state.plottingSelections.comparisonPlot).toStrictEqual(currentComparisonPlotSelections);
    });

    it("commits updated selections from barchart and orders them according to nested filter", () => {
        const testBarchartFilters = [
            {
                id: "region",
                options: [{
                    children: [
                        {id: "r0", children: [{id: "r0.0"}]},
                        {id: "r1", children: [{id: "r1.0"}]},
                        {id: "r2"}]
                }
                ]
            }
        ]
        const store = getStore({selectedTab: ModelOutputTabs.Bar}, {}, {}, testBarchartFilters);
        const wrapper = shallowMountWithTranslate(ModelOutput, store, {
            global: {
                plugins: [store]
            }
        });
        const currentBarchartSelections = store.state.plottingSelections.barchart

        const barchart = wrapper.findComponent(BarChartWithFilters);
        const barchartSelections = {
            selectedFilterOptions: {
                region: [
                    {id: "r1", label: "region 1"},
                    {id: "r0", label: "region 0"},
                    {id: "r2", label: "region 2"},
                    {id: "r0.0", label: "region 0.0"},
                    {id: "r1.0", label: "region 1.0"}
                ],
                age: [
                    {id: "a1", label: "0-4"},
                ]
            },
            xAxisId: "region"
        };

        const expectedBarchartSelections = {...currentBarchartSelections}
        expectedBarchartSelections.selectedFilterOptions.region = [
            {id: "r0", label: "region 0"},
            {id: "r1", label: "region 1"},
            {id: "r2", label: "region 2"},
            {id: "r0.0", label: "region 0.0"},
            {id: "r1.0", label: "region 1.0"}
        ]

        barchart.vm.$emit("update:selections", barchartSelections);
        expect(store.state.plottingSelections.barchart).toStrictEqual(expectedBarchartSelections);
    });

    it("commits updated selections from comparison plot and orders them according to nested filter", () => {
        const testComparisonPlotFilters = [
            {
                id: "region",
                options: [{
                    children: [
                        {id: "r0", children: [{id: "r0.0"}]},
                        {id: "r1", children: [{id: "r1.0"}]},
                        {id: "r2"}]
                }
                ]
            }
        ]
        const store = getStore({selectedTab: ModelOutputTabs.Bar}, {}, {}, testComparisonPlotFilters);
        const wrapper = shallowMountWithTranslate(ModelOutput, store, {
            global: {
                plugins: [store]
            }
        });
        const currentComparisonPlotSelections = store.state.plottingSelections.comparisonPlot

        const comparisonPlot = wrapper.findComponent(BarChartWithFilters);
        const comparisonPlotSelections = {
            selectedFilterOptions: {
                region: [
                    {id: "r1", label: "region 1"},
                    {id: "r0", label: "region 0"},
                    {id: "r2", label: "region 2"},
                    {id: "r0.0", label: "region 0.0"},
                    {id: "r1.0", label: "region 1.0"}
                ],
                age: [
                    {id: "a1", label: "0-4"},
                ]
            },
            xAxisId: "region"
        };

        const expectedComparisonPlotSelections = {...currentComparisonPlotSelections}
        expectedComparisonPlotSelections.selectedFilterOptions.region = [
            {id: "r0", label: "region 0"},
            {id: "r1", label: "region 1"},
            {id: "r2", label: "region 2"},
            {id: "r0.0", label: "region 0.0"},
            {id: "r1.0", label: "region 1.0"}
        ]

        comparisonPlot.vm.$emit("update:selections", comparisonPlotSelections);
        expect(store.state.plottingSelections.comparisonPlot).toStrictEqual(expectedComparisonPlotSelections);
    });

    it("renders choropleth table", () => {
        const store = getStore({selectedTab: ModelOutputTabs.Map});
        const wrapper = shallowMountWithTranslate(ModelOutput, store, {global: {plugins: [store]}});

        const table = wrapper.findComponent(AreaIndicatorsTable);
        expect(table.props().areaFilterId).toBe("area");
        expect(table.props().filters).toStrictEqual(["TEST CHORO FILTERS"]);
        expect(table.props().selections).toStrictEqual({test: "TEST CHORO SELECTIONS"});
        expect(table.props().indicators).toStrictEqual(["TEST CHORO INDICATORS"]);
        expect(table.props().tableData).toStrictEqual(["TEST DATA"]);
        expect(table.props().countryAreaFilterOption).toStrictEqual({TEST: "TEST countryAreaFilterOption"});
    });

    it("renders choropleth table with correct indicator props", () => {
        const store = getStore({selectedTab: ModelOutputTabs.Map},
            {
                choroplethIndicators: vi.fn().mockReturnValue(
                    [
                        {"indicator": "prevalence", "indicator_value": "2"},
                        {"indicator": "art_coverage", "indicator_value": "4"}
                    ]
                )
            },
            {
                outputChoropleth: {indicatorId: "art_coverage"}
            });
        const wrapper = shallowMountWithTranslate(ModelOutput, store, {global: {plugins: [store]}});

        const table = wrapper.findComponent(AreaIndicatorsTable);
        expect(table.props().selections).toStrictEqual({indicatorId: "art_coverage"});
        expect(table.props().indicators).toStrictEqual([{"indicator": "art_coverage", "indicator_value": "4"}]);
    });

    it("renders bubble plot table", () => {
        const store = getStore({selectedTab: ModelOutputTabs.Bubble});
        const wrapper = shallowMountWithTranslate(ModelOutput, store, {global: {plugins: [store]}});

        const table = wrapper.findComponent(AreaIndicatorsTable);
        expect(table.props().areaFilterId).toBe("area");
        expect(table.props().filters).toStrictEqual(["TEST BUBBLE FILTERS"]);
        expect(table.props().selections).toStrictEqual({test: "TEST BUBBLE SELECTIONS"});
        expect(table.props().indicators).toStrictEqual(["TEST BUBBLE INDICATORS", "TEST BUBBLE INDICATORS"]);
        expect(table.props().tableData).toStrictEqual(["TEST DATA"]);
        expect(table.props().countryAreaFilterOption).toStrictEqual({TEST: "TEST countryAreaFilterOption"});
    });

    it("renders bubble plot table with correct indicator props", () => {
        const store = getStore(
            {
                selectedTab: ModelOutputTabs.Bubble
            },
            {
                bubblePlotIndicators: vi.fn().mockReturnValue(
                    [
                        {"indicator": "prevalence", "indicator_value": "2"},
                        {"indicator": "art_coverage", "indicator_value": "4"},
                        {"indicator": "current_art", "indicator_value": "6"}
                    ]
                )
            },
            {
                bubble: {colorIndicatorId: "art_coverage", sizeIndicatorId: "current_art"}
            });
        const wrapper = shallowMountWithTranslate(ModelOutput, store, {global: {plugins: [store]}});

        const table = wrapper.findComponent(AreaIndicatorsTable);
        expect(table.props().selections).toStrictEqual({
            colorIndicatorId: "art_coverage",
            sizeIndicatorId: "current_art"
        });
        expect(table.props().indicators).toStrictEqual(
            [
                {
                    "indicator": "art_coverage",
                    "indicator_value": "4"
                },
                {
                    "indicator": "current_art",
                    "indicator_value": "6"
                }
            ]
        );
    });

    it("renders barchart table", () => {
        const store = getStore({selectedTab: ModelOutputTabs.Bar});
        const wrapper = shallowMountWithTranslate(ModelOutput, store, {global: {plugins: [store]}});

        const table = wrapper.findComponent(AreaIndicatorsTable);
        expect(table.props().areaFilterId).toBe("area");
        expect(table.props().filters).toStrictEqual(["TEST BAR FILTERS"]);
        expect(table.props().selections).toStrictEqual({
            detail: null,
            indicatorId: "TestIndicator",
            xAxisId: "region",
            disaggregateById: "age",
            selectedFilterOptions: {
                region: [{id: "r1", label: "region 1"}],
                age: [{id: "a1", label: "0-4"}]
            }
        });
        expect(table.props().tableData).toStrictEqual(["TEST DATA"]);
        expect(table.props().countryAreaFilterOption).toStrictEqual({TEST: "TEST countryAreaFilterOption"});
        expect(table.props().translateFilterLabels).toBe(true);
    });

    it("renders barchart table with correct indicator props", () => {
        const store = getStore({selectedTab: ModelOutputTabs.Bar}, {
                barchartIndicators: vi.fn().mockReturnValue(
                    [
                        {"indicator": "prevalence", "indicator_value": "2"},
                        {"indicator": "art_coverage", "indicator_value": "4"}
                    ]
                )
            },
            {
                barchart: {indicatorId: "art_coverage"}
            });
        const wrapper = shallowMountWithTranslate(ModelOutput, store, {global: {plugins: [store]}});

        const table = wrapper.findComponent(AreaIndicatorsTable);
        expect(table.props().selections).toStrictEqual({indicatorId: "art_coverage", detail: null});
        expect(table.props().indicators).toStrictEqual(
            [
                {"indicator": "art_coverage", "indicator_value": "4"}
            ]
        );
    });

    it("renders comparison plot table", () => {
        const store = getStore({selectedTab: ModelOutputTabs.Comparison});
        const wrapper = shallowMountWithTranslate(ModelOutput, store, {global: {plugins: [store]}});

        const table = wrapper.findComponent(AreaIndicatorsTable);
        expect(table.props().areaFilterId).toBe("area");
        expect(table.props().filters).toStrictEqual(["TEST COMPARISON FILTERS"]);
        expect(table.props().selections).toStrictEqual({
            detail: null,
            indicatorId: "TestIndicator",
            xAxisId: "age",
            disaggregateById: "source",
            selectedFilterOptions: {
                region: [{id: "r1", label: "region 1"}],
                age: [{id: "a1", label: "0-4"}]
            }
        });
        expect(table.props().tableData).toStrictEqual(["TEST COMPARISON DATA"]);
        expect(table.props().countryAreaFilterOption).toStrictEqual({TEST: "TEST countryAreaFilterOption"});
        expect(table.props().translateFilterLabels).toBe(false);
    });

    it("renders comparison plot table with correct indicator props", () => {
        const store = getStore({selectedTab: ModelOutputTabs.Comparison}, {
            comparisonPlotIndicators: vi.fn().mockReturnValue(
                [
                    {"indicator": "prevalence", "indicator_value": "2"},
                    {"indicator": "art_coverage", "indicator_value": "4"}
                ]
            )
        },
            {
                comparisonPlot: {indicatorId: "art_coverage"}
            });
        const wrapper = shallowMountWithTranslate(ModelOutput, store, {global: {plugins: [store]}});

        const table = wrapper.findComponent(AreaIndicatorsTable)
        expect(table.props().selections).toStrictEqual({indicatorId: "art_coverage"});
        expect(table.props().indicators).toStrictEqual(
            [
                {"indicator": "art_coverage", "indicator_value": "4"}
            ]
        );
    });

    it("formatBarchartValue formats value", () => {
        const store = getStore();
        const wrapper = shallowMountWithTranslate(ModelOutput, store, {
            global: {
                plugins: [store]
            }
        });

        const indicator: BarchartIndicator = {
            indicator: "testIndicator",
            value_column: "val_col",
            indicator_column: "ind_col",
            indicator_value: "",
            name: "Test Indicator",
            error_low_column: "err_lo",
            error_high_column: "err_hi",
            format: "0.00%",
            scale: 1,
            accuracy: null
        };
        expect((wrapper.vm as any).formatBarchartValue(0.29, indicator)).toBe("29.00%");

        indicator.format = "0";
        indicator.scale = 10;
        indicator.accuracy = 100;
        expect((wrapper.vm as any).formatBarchartValue(4231, indicator)).toBe("42300");
    });
});
