import Vuex from 'vuex';
import ReviewInputs from "../../../app/components/reviewInputs/ReviewInputs.vue";
import {
    mockAncResponse,
    mockBaselineState, mockGenericChartState,
    mockPlottingSelections,
    mockProgramResponse,
    mockSurveyAndProgramState,
    mockSurveyResponse
} from "../../mocks";
import {DataType, SurveyAndProgramState} from "../../../app/store/surveyAndProgram/surveyAndProgram";
import registerTranslations from "../../../app/store/translations/registerTranslations";
import {emptyState} from "../../../app/root";
import {actions} from "../../../app/store/surveyAndProgram/actions";
import {mutations} from "../../../app/store/surveyAndProgram/mutations";
import {getters} from "../../../app/store/surveyAndProgram/getters";
import {mutations as selectionsMutations} from "../../../app/store/plottingSelections/mutations";
import {ScaleSelections, ScaleType} from "../../../app/store/plottingSelections/plottingSelections";
import {Language} from "../../../app/store/translations/locales";
import {expectTranslated, mountWithTranslate, shallowMountWithTranslate} from "../../testHelpers";
import GenericChart from "../../../app/components/genericChart/GenericChart.vue";
import {GenericChartState} from "../../../app/store/genericChart/genericChart";
import Choropleth from "../../../app/components/plots/choropleth/Choropleth.vue";
import AreaIndicatorsTable from "../../../app/components/plots/table/AreaIndicatorsTable.vue";
import { nextTick } from 'vue';
import Filters from '../../../app/components/plots/FilterSet.vue';
import Treeselect from "vue3-treeselect";
import HintTreeSelect from '../../../app/components/HintTreeSelect.vue';

describe("Survey and programme component", () => {

    const createStore = (surveyAndProgramState: Partial<SurveyAndProgramState> = {selectedDataType: DataType.Survey},
                            genericChartState: Partial<GenericChartState> = {}) => {
        const store = new Vuex.Store({
            state: emptyState(),
            modules: {
                surveyAndProgram: {
                    namespaced: true,
                    state: mockSurveyAndProgramState(surveyAndProgramState),
                    mutations: mutations,
                    actions: actions,
                    getters: getters
                },
                genericChart: {
                    namespaced: true,
                    state: mockGenericChartState(genericChartState)
                },
                baseline: {
                    namespaced: true,
                    state: mockBaselineState({
                        shape: {
                            data: {features: "TEST FEATURES" as any} as any,
                            filters: {
                                level_labels: "TEST LEVEL LABELS",
                                regions: {id: "country", children: [{id: "region 1"}, {id: "region 2"}]}
                            } as any
                        } as any
                    })
                },
                plottingSelections: {
                    namespaced: true,
                    state: mockPlottingSelections({
                        sapChoropleth: {selectedFilterOptions: "TEST SELECTIONS"} as any
                    }),
                    getters: {
                        selectedSAPColourScales: () => {
                            return {
                                prevalence: {
                                    type: ScaleType.Custom,
                                    customMin: 1,
                                    customMax: 2
                                }
                            } as ScaleSelections
                        }
                    },
                    mutations: selectionsMutations
                },
                metadata: {
                    namespaced: true,
                    getters: {
                        sapIndicatorsMetadata: () => {
                            return ["TEST INDICATORS"]
                        }
                    }
                }
            }
        });
        registerTranslations(store);
        return store;
    };

    it("renders tabs", () => {
        const store = createStore({
            anc: mockAncResponse()
        });
        const wrapper = shallowMountWithTranslate(ReviewInputs, store, {
            global: {
                plugins: [store]
            }
        });
        const tabItems = wrapper.findAll("li.nav-item a");
        expect(tabItems.length).toBe(2);
        expect(tabItems[0].classes()).toContain("active");
        expect(tabItems[1].classes()).not.toContain("active");
        expectTranslated(tabItems[0], "Time series", "Séries chronologiques", "Séries temporais", store);
        expectTranslated(tabItems[1], "Map", "Carte", "Mapa", store);
    });

    it("does not render time series tab when anc or program dataset is not available", () => {
        const store = createStore({});
        const wrapper = shallowMountWithTranslate(ReviewInputs, store, {
            global: {
                plugins: [store]
            }
        });
        const tabItems = wrapper.findAll("li.nav-item a");
        expect(tabItems.length).toBe(1)
        expect(tabItems[0].text()).not.toBe("Time series");
    });

    it("renders choropleth controls if there is a selected data type and selectedTab is 1", () => {
        const store = createStore({selectedDataType: DataType.Survey});
        const data = () => {
            return {selectedTab: 1};
        };
        const wrapper = shallowMountWithTranslate(ReviewInputs, store, {
            global: {
                plugins: [store]
            }, data
        });

        expect(wrapper.findAll("choropleth-stub").length).toBe(1);
        expect(wrapper.findComponent(GenericChart).exists()).toBe(false);
    });

    it("does not render choropleth controls if there is no selected data type", () => {
        const store = createStore({selectedDataType: null});
        const data = () => {
            return {selectedTab: 1};
        };
        const wrapper = shallowMountWithTranslate(ReviewInputs, store, {
            global: {
                plugins: [store]
            }, data
        });

        expect(wrapper.findAll("choropleth-stub").length).toBe(0);
        expect(wrapper.findAll("filters-stub").length).toBe(0);
    });

    it("renders choropleth as expected", () => {
        const store = createStore({
            selectedDataType: DataType.Survey,
            survey: {
                "data": "TEST DATA",
                "filters": {
                    "year": "TEST YEAR FILTERS"
                }
            } as any,
        });
        const data = () => {
            return {selectedTab: 1};
        };
        const wrapper = shallowMountWithTranslate(ReviewInputs, store, {
            global: {
                plugins: [store]
            }, data
        });
        const choro = wrapper.findComponent(Choropleth);
        expect(choro.props().areaFilterId).toBe("area");
        expect(choro.props().chartdata).toBe("TEST DATA");
        expect(choro.props().roundFormatOutput).toBe(false);
        expect(choro.props().filters[0]).toStrictEqual({
            id: "area",
            column_id: "area_id",
            label: "area",
            allowMultiple: true,
            options: [{id: "region 1"}, {id: "region 2"}]
        });
        expect(choro.props().filters[1]).toStrictEqual({
            id: "year",
            column_id: "year",
            label: "year",
            allowMultiple: false,
            options: "TEST YEAR FILTERS"
        });
        expect(choro.props().features).toBe("TEST FEATURES");
        expect(choro.props().featureLevels).toBe("TEST LEVEL LABELS");
        expect(choro.props().indicators).toStrictEqual(["TEST INDICATORS"]);
        expect(choro.props().selections).toStrictEqual({selectedFilterOptions: "TEST SELECTIONS"});
        expect(choro.props().colourScales).toEqual({
            prevalence: {
                type: ScaleType.Custom,
                customMin: 1,
                customMax: 2
            }
        });

    });

    it("renders time series tab and component when generic chart metadata exists and selectedTab is 1", () => {
        const genericChartMetadata = {value: "TEST"} as any;
        const store = createStore({
            program: mockProgramResponse()
        }, {
            genericChartMetadata
        });
        const wrapper = shallowMountWithTranslate(ReviewInputs, store, {
            global: {
                plugins: [store]
            }
        });
        const tabItems = wrapper.findAll("li.nav-item a");
        expect(tabItems[0].classes()).toContain("active");
        expect(tabItems[1].classes()).not.toContain("active");

        const genericChart  = wrapper.findComponent(GenericChart);
        expect(genericChart.props("chartId")).toBe("input-time-series");
        expect(genericChart.props("metadata")).toStrictEqual(genericChartMetadata);
        expect(genericChart.props("chartHeight")).toBe("600px");

        expect(wrapper.findComponent(Choropleth).exists()).toBe(false);
    });

    it("does not render generic chart component if generic chart metadata does not exist", () => {
        const store = createStore();
        const wrapper = shallowMountWithTranslate(ReviewInputs, store, {
            global: {
                plugins: [store]
            }
        });
        expect(wrapper.findComponent(GenericChart).exists()).toBe(false);
        expect(wrapper.findComponent(Choropleth).exists()).toBe(false);
    });

    it("can display generic chart tab and clicking tab item changes tab", async () => {
        const genericChartMetadata = {value: "TEST"} as any;
        const store = createStore({
                selectedDataType: DataType.Survey,
            anc: mockAncResponse()
            },
            {genericChartMetadata}
        );
        const wrapper = shallowMountWithTranslate(ReviewInputs, store, {
            global: {
                plugins: [store]
            }
        });

        const tabItems = wrapper.findAll("li.nav-item a");
        await tabItems[1].trigger("click");
        expect(tabItems[0].classes()).not.toContain("active");
        expect(tabItems[1].classes()).toContain("active");
        expect(wrapper.findComponent(GenericChart).exists()).toBe(false);
        expect(wrapper.findComponent(Choropleth).exists()).toBe(true);

        await tabItems[0].trigger("click");
        expect(tabItems[0].classes()).toContain("active");
        expect(tabItems[1].classes()).not.toContain("active");
        expect(wrapper.findComponent(GenericChart).exists()).toBe(true);
        expect(wrapper.findComponent(Choropleth).exists()).toBe(false);
    });

    it("updates state when choropleth selections change", async () => {
        const store = createStore();
        const wrapper = shallowMountWithTranslate(ReviewInputs, store, {
            global: {
                plugins: [store]
            }
        });
        (wrapper.vm as any).updateChoroplethSelections({payload: {selectedFilterOptions: "NEW TEST SELECTIONS"}});

        await nextTick();
        expect((wrapper.vm as any).plottingSelections).toStrictEqual({selectedFilterOptions: "NEW TEST SELECTIONS"});
    });

    it("data source is not rendered if no selected data type", () => {
        const store = createStore({selectedDataType: null});
        const wrapper = shallowMountWithTranslate(ReviewInputs, store, {
            global: {
                plugins: [store]
            }
        });
        expect(wrapper.find("#data-source").exists()).toBe(false);
    });

    it("renders data source header as expected", () => {
        const store = createStore();
        const data = () => {
            return {selectedTab: 1};
        };
        const wrapper = mountWithTranslate(ReviewInputs, store, {
            global: {
                plugins: [store],
                stubs: ["filters", "l-map", "area-indicators-table", "generic-chart"]
            }, data
        });
        const header = wrapper.find("#data-source h4");
        expectTranslated(header, "Data source", "Source de données", "Fonte de dados", store);
    });

    it("survey is included in data sources when survey data is present", async () => {
        await expectDataSource({survey: mockSurveyResponse(), selectedDataType: DataType.Survey},
            "Household survey", "Enquête de ménage", "Inquérito aos agregados familiares", "2");
    });

    it("programme (ART) is included in data sources when programme data is present", async () => {
        await expectDataSource({program: mockProgramResponse(), selectedDataType: DataType.Program},
            "ART", "TARV", "TARV", "1");
    });

    it("ANC is included in data sources when ANC data is present", async () => {
        await expectDataSource({anc: mockAncResponse(), selectedDataType: DataType.ANC},
            "ANC testing", "Test de clinique prénatale", "Teste da CPN", "0");
    });

    async function expectDataSource(state: Partial<SurveyAndProgramState>, englishName: string, frenchName: string,
                                    portugueseName: string, id: string) {
        const store = createStore(state);
        const data = () => {
            return {selectedTab: 1};
        };
        const wrapper = mountWithTranslate(ReviewInputs, store, {
            global: {
                plugins: [store],
                stubs: ["filters", "l-map", "area-indicators-table", "generic-chart"]
            }, data
        });
        let options = wrapper.findComponent(Treeselect).props("options");
        expect(options).toStrictEqual([{id, label: englishName}]);

        store.state.language = Language.fr;
        await nextTick();
        options = wrapper.findComponent(Treeselect).props("options");
        expect(options).toStrictEqual([{id, label:frenchName}]);

        store.state.language = Language.pt;
        await nextTick();
        options = wrapper.findComponent(Treeselect).props("options");
        expect(options).toStrictEqual([{id, label:portugueseName}]);
    }

    it("can select data source", async () => {
        const store = createStore(
            {
                anc: mockAncResponse(),
                survey: mockSurveyResponse(),
                program: mockProgramResponse(),
                selectedDataType: DataType.Program
            });
        const data = () => {
            return {selectedTab: 1};
        };
        const wrapper = mountWithTranslate(ReviewInputs, store, {
            global: {
                plugins: [store],
                stubs: ["filters", "l-map", "area-indicators-table", "generic-chart"]
            }, data
        });

        const dataSourceSelect = wrapper.findComponent(HintTreeSelect);
        expect(dataSourceSelect.props("modelValue")).toBe("1");
        expect(dataSourceSelect.props("options")!.length).toBe(3);

        dataSourceSelect.vm.$emit("update:modelValue", "0");
        await nextTick();
        expect(dataSourceSelect.props("modelValue")).toBe("0");
        expect((wrapper.vm as any).selectedDataType).toBe(DataType.ANC);

        dataSourceSelect.vm.$emit("update:modelValue", "2");
        await nextTick();
        expect(dataSourceSelect.props("modelValue")).toBe("2");
        expect((wrapper.vm as any).selectedDataType).toBe(DataType.Survey);

        dataSourceSelect.vm.$emit("update:modelValue", "1");
        await nextTick();
        expect(dataSourceSelect.props("modelValue")).toBe("1");
        expect((wrapper.vm as any).selectedDataType).toBe(DataType.Program);

        expect(wrapper.findAll("l-map-stub").length).toBe(1);
    });

    it("computes selectedDataType", () => {
        const store = createStore(
            {
                anc: mockAncResponse(),
                survey: mockSurveyResponse(),
                program: mockProgramResponse(),
                selectedDataType: DataType.Program
            });
        const wrapper = shallowMountWithTranslate(ReviewInputs, store, {
            global: {
                plugins: [store]
            }
        });
        expect((wrapper.vm as any).selectedDataType).toBe(DataType.Program);
    });

    it("set availableDatasetIds when anc and program are available", () => {
        const store = createStore(
            {
                anc: mockAncResponse(),
                survey: mockSurveyResponse(),
                program: mockProgramResponse()
            });
        const wrapper = shallowMountWithTranslate(ReviewInputs, store, {
            global: {
                plugins: [store]
            }
        });
        expect((wrapper.vm as any).availableDatasetIds).toEqual(["anc", "art"]);
    });

    it("sets anc as only available datasetId when program data is not available", () => {
        const store = createStore(
            {
                anc: mockAncResponse(),
                survey: mockSurveyResponse()
            });
        const wrapper = shallowMountWithTranslate(ReviewInputs, store, {
            global: {
                plugins: [store]
            }
        });
        expect((wrapper.vm as any).availableDatasetIds).toEqual(["anc"]);
    });

    it("renders table as expected", () => {
        const store = createStore({
            selectedDataType: DataType.Survey,
            survey: {
                "data": "TEST DATA",
                "filters": {
                    "year": "TEST YEAR FILTERS"
                }
            } as any,
        });
        const data = () => {
            return {selectedTab: 1};
        };
        const wrapper = shallowMountWithTranslate(ReviewInputs, store, {
            global: {
                plugins: [store]
            }, data
        });
        const table = wrapper.findComponent(AreaIndicatorsTable);
        expect(table.props().areaFilterId).toBe("area");
        expect(table.props().tableData).toBe("TEST DATA");
        expect(table.props().roundFormatOutput).toBe(false);
        expect(table.props().filters[0]).toStrictEqual({
            id: "area",
            column_id: "area_id",
            label: "area",
            allowMultiple: true,
            options: [{id: "region 1"}, {id: "region 2"}]
        });
        expect(table.props().filters[1]).toStrictEqual({
            id: "year",
            column_id: "year",
            label: "year",
            allowMultiple: false,
            options: "TEST YEAR FILTERS"
        });
        expect(table.props().indicators).toStrictEqual(["TEST INDICATORS"]);
        expect(table.props().selections).toStrictEqual({selectedFilterOptions: "TEST SELECTIONS"});
        expect(table.props().countryAreaFilterOption).toStrictEqual(
            {
                "children": [
                    {
                        "id": "region 1",
                    },
                    {
                        "id": "region 2",
                    },
                ],
                "id": "country",
            }
        );
    });

});
