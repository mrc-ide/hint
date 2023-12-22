import VueFeather from 'vue-feather';
import registerTranslations from "../../../app/store/translations/registerTranslations";
import Vuex from 'vuex';
import {emptyState} from "../../../app/root";
import {flushPromises, shallowMount} from "@vue/test-utils";
import GenericChart from "../../../app/components/genericChart/GenericChart.vue";
import DataSource from "../../../app/components/genericChart/dataSelectors/DataSource.vue";
import FiltersComp from "../../../app/components/plots/Filters.vue";
// Mock the import of plotly to avoid import failures in non-browser context
vi.mock("plotly.js-basic-dist", () => ({
    newPlot: vi.fn()
}));
import Plotly from "../../../app/components/genericChart/Plotly.vue";
import {mockGenericChartState, mockSuccess} from "../../mocks";
import {GenericChartState} from "../../../app/store/genericChart/genericChart";
import ErrorAlert from "../../../app/components/ErrorAlert.vue";
import LoadingSpinner from "../../../app/components/LoadingSpinner.vue";
import {expectTranslated, mountWithTranslate, shallowMountWithTranslate} from "../../testHelpers";
import {GenericChartMetadataResponse} from "../../../app/types";
import {actions} from "../../../app/store/genericChart/actions";
import {mutations} from "../../../app/store/genericChart/mutations";
import {mockAxios} from "../../mocks";
import GenericChartTable from "../../../app/components/genericChart/GenericChartTable.vue";
import DownloadIndicator from "../../../app/components/downloadIndicator/DownloadIndicator.vue";
import { nextTick } from "vue";

describe("GenericChart component", () => {

    const metadata: GenericChartMetadataResponse = {
        "test-chart": {
            datasets: [
                {
                    id: "dataset1",
                    label:"Dataset 1",
                    url: "/dataset1",
                    filters: [
                        {id: "age", source: "data", allowMultiple: false},
                        {id: "year", source: "data", allowMultiple: true}
                    ]
                },
                {
                    id: "dataset2",
                    label:"Dataset 2",
                    url: "/dataset2",
                    filters: [
                        {id: "year", source: "data", allowMultiple: false}
                    ]
                },
                {
                    id: "dataset3",
                    label:"Dataset 3",
                    url: "/dataset3",
                    filters: [
                        {id: "type", source: "data", allowMultiple: false}
                    ]
                }
            ],
            dataSelectors: {
                dataSources: [
                    {id: "visible1", type: "editable", label: "First", datasetId: "dataset1", showFilters: true, showIndicators: false},
                    {id: "visible2", type: "editable", label: "Second", datasetId: "dataset2", showFilters: false, showIndicators: false},
                    {id: "hidden", type: "fixed", datasetId: "dataset3", showFilters: true, showIndicators: false}
                ]
            },
            chartConfig: [{
                id: "scatter",
                label: "Scatter",
                description: "inputTimeSeriesDescription",
                config: "Test Chart Config"
            }]
        }
    };

    const datasets =  {
        dataset1: {
            data: [
                {age: "1", year: "2020", value: 1},
                {age: "1", year: "2021", value: 2},
                {age: "2", year: "2020", value: 3},
                {age: "2", year: "2021", value: 4}
            ],
            metadata: {
                columns: [
                    {
                        id: "age",
                        column_id: "age",
                        label: "Age",
                        values: [
                            {id: "1", label: "1"},
                            {id: "2", label: "2"}
                        ]
                    },
                    {
                        id: "year",
                        column_id: "year",
                        label: "Year",
                        values: [
                            {id: "2020", label: "2020"},
                            {id: "2021", label: "2021"}
                        ]
                    }
                ],
                defaults: {
                    selected_filter_options: {
                        age: [{id: "1", label: "1"}],
                        year: [{id: "2021", label: "2021"}]
                    }
                }
            }
        },
        dataset2: {
            data: [
                {age: "10", year: "2020", value: 10},
                {age: "10", year: "2021", value: 20},
                {age: "20", year: "2020", value: 30},
                {age: "20", year: "2021", value: 40}
            ],
            metadata: {
                columns: [
                    {
                        id: "age",
                        column_id: "age",
                        label: "Age",
                        options: [
                            {id: "10", label: "10"},
                            {id: "20", label: "20"}
                        ]
                    },
                    {
                        id: "year",
                        column_id: "year",
                        label: "Year",
                        options: [
                            {id: "2020", label: "2020"},
                            {id: "2021", label: "2021"}
                        ]
                    }
                ],
                defaults: {
                    selected_filter_options: {
                        age: [{id: "10", label: "10"}],
                        year: [{id: "2020", label: "2020"}]
                    }
                }
            }
        },
        dataset3: {
            data: [{type: "test", value: "test"}],
            metadata: {
                columns: [
                    {
                        id: "type",
                        column_id: "type",
                        label: "Type",
                        values: [{id: "test", label: "test"}]
                    }
                ],
                defaults: {
                    selected_filter_options: {
                        type: [{id: "test", label: "test"}]
                    }
                }
            }
        }
    } as any;

    beforeEach(() => {
        mockAxios.reset();
        vi.resetAllMocks();
    });

    const data = {
        chartId: "test-chart",
        availableDatasetIds: ["dataset1", "dataset2", "dataset3"]
    };

    const getWrapper = (
        state: Partial<GenericChartState> = {}, metadataProp: GenericChartMetadataResponse = metadata, ChartPropsData = data) => {
        const store = new Vuex.Store({
            state: emptyState(),
            modules: {
                genericChart: {
                    namespaced: true,
                    state: mockGenericChartState(state),
                    actions, // Use real actions and mutations so state is updated with fetched datasets, to avoid errors
                    mutations
                }
            }
        });

        const props = {
            ...ChartPropsData,
            metadata: metadataProp
        };

        registerTranslations(store);
        return shallowMountWithTranslate(GenericChart, store, {global: {plugins: [store]}, props});
    };

    it("renders as expected without chart data", (done) => {
        mockAxios.onGet(`/dataset1`)
            .reply(200, mockSuccess({metadata: {defaults: {}}}));
        mockAxios.onGet(`/dataset2`)
            .reply(200, mockSuccess({metadata: {defaults: {}}}));
        mockAxios.onGet(`/dataset3`)
            .reply(200, mockSuccess({metadata: {defaults: {}}}));

        const wrapper = getWrapper();
        setTimeout(() => {
            expect(wrapper.findAllComponents(DataSource).length).toBe(0);
            expect(wrapper.findAllComponents(FiltersComp).length).toBe(0);
            expect(wrapper.findComponent(Plotly).exists()).toBe(false);
            expect(wrapper.findComponent(LoadingSpinner).attributes("size")).toBe("lg");
            expectTranslated(wrapper.find("h2"), "Loading your data", "Chargement de vos données",
                "A carregar os seus dados", wrapper.vm.$store);
            done();
        });
    });

    it("renders as expected with chart data", (done) => {
        const state = {datasets};
        const wrapper = getWrapper(state);

        setTimeout(() => {
            const dataSources = wrapper.findAllComponents(DataSource);
            expect(dataSources.length).toBe(2); //It should not show non-editable data sources

            expect(dataSources[0].props("config")).toStrictEqual(
                {
                    id: "visible1",
                    type: "editable",
                    label: "First",
                    datasetId: "dataset1",
                    showFilters: true,
                    showIndicators: false
                }
            );
            expect(dataSources[0].props("datasets")).toStrictEqual(metadata["test-chart"].datasets);
            expect(dataSources[0].props("value")).toBe("dataset1");

            expect(dataSources[1].props("config")).toStrictEqual(
                {
                    id: "visible2",
                    type: "editable",
                    label: "Second",
                    datasetId: "dataset2",
                    showFilters: false,
                    showIndicators: false
                }
            );
            expect(dataSources[1].props("datasets")).toStrictEqual(metadata["test-chart"].datasets);
            expect(dataSources[1].props("value")).toBe("dataset2");

            const filters = wrapper.findAllComponents(FiltersComp);
            expect(filters.length).toBe(2);
            expect(filters[0].props("filters")).toStrictEqual([
                {
                    id: "age",
                    column_id: "age",
                    label: "Age",
                    allowMultiple: false,
                    options: [
                        {id: "1", label: "1"},
                        {id: "2", label: "2"}
                    ]
                },
                {
                    id: "year",
                    column_id: "year",
                    label: "Year",
                    allowMultiple: true,
                    options: [
                        {id: "2020", label: "2020"},
                        {id: "2021", label: "2021"}
                    ]
                }
            ],);
            expect(filters[0].props("selectedFilterOptions")).toStrictEqual(datasets.dataset1.metadata.defaults.selected_filter_options);
            expect(filters[1].props("filters")).toStrictEqual( [
                {
                    id: "type",
                    column_id: "type",
                    label: "Type",
                    allowMultiple: false,
                    options: [{id: "test", label: "test"}]
                }
            ]);
            expect(filters[1].props("selectedFilterOptions")).toStrictEqual(datasets.dataset3.metadata.defaults.selected_filter_options);

            const plotly = wrapper.findComponent(Plotly);
            expect(plotly.props("chartData")).toStrictEqual({
                visible1: [{age: "1", year: "2021", value: 2}],
                visible2: [
                    {age: "10", year: "2020", value: 10},
                    {age: "20", year: "2020", value: 30}
                ],
                hidden: [{type: "test", value: "test"}]
            });
            expect(plotly.props("layoutData")).toStrictEqual({yAxisFormat: ""});
            expect((plotly.element as HTMLElement).style.height).toBe("100%");

            expect(wrapper.findComponent(ErrorAlert).exists()).toBe(false);
            expect(wrapper.find("#empty-generic-chart-data").exists()).toBe(false);

            expect(wrapper.find("#page-controls").exists()).toBe(false);

            done();
        });
    });

    it("renders as expected with empty chart data", (done) => {
        const datasetsWithNoMatchingData = {
            dataset1: {
                metadata: datasets.dataset1.metadata,
                data: [
                    {age: "1", year: "1920", value: 1},
                    {age: "1", year: "1921", value: 2},
                    {age: "2", year: "1920", value: 3},
                    {age: "2", year: "1921", value: 4}
                ],
                warnings: []
            },
            dataset2: {
                metadata: datasets.dataset2.metadata,
                data: [
                    {age: "10", year: "1020", value: 10},
                    {age: "10", year: "1921", value: 20},
                    {age: "20", year: "1920", value: 30},
                    {age: "20", year: "1921", value: 40}
                ],
                warnings: []
            },
            dataset3: {
                metadata: datasets.dataset3.metadata,
                data: [],
                warnings: []
            }
        };
        const state = {datasets: datasetsWithNoMatchingData};
        const wrapper = getWrapper(state);
        setTimeout(() => {
            expect(wrapper.findComponent(Plotly).exists()).toBe(false);
            const noDataDiv = wrapper.find("#empty-generic-chart-data");
            expectTranslated(noDataDiv,
                "No data are available for the selected combination. Please review the combination of filter values selected.",
               "Aucune donnée n'est disponible pour la combinaison sélectionnée. Veuillez examiner la combinaison de valeurs de filtre sélectionnée.",
                "Não existem dados disponíveis para a combinação selecionada. Por favor, reveja a combinação dos valores de filtro selecionados.",
                wrapper.vm.$store
            );

            expect(wrapper.findAllComponents(DataSource).length).toBe(2);
            const filters = wrapper.findAllComponents(FiltersComp);
            expect(filters.length).toBe(2);
            expect(filters[0].props("filters")).toStrictEqual([
                {
                    id: "age",
                    column_id: "age",
                    label: "Age",
                    allowMultiple: false,
                    options: [
                        {id: "1", label: "1"},
                        {id: "2", label: "2"}
                    ]
                },
                {
                    id: "year",
                    column_id: "year",
                    label: "Year",
                    allowMultiple: true,
                    options: [
                        {id: "2020", label: "2020"},
                        {id: "2021", label: "2021"}
                    ]
                }
            ],);
            expect(filters[0].props("selectedFilterOptions")).toStrictEqual(datasets.dataset1.metadata.defaults.selected_filter_options);
            expect(filters[1].props("filters")).toStrictEqual( [
                {
                    id: "type",
                    column_id: "type",
                    label: "Type",
                    allowMultiple: false,
                    options: [{id: "test", label: "test"}]
                }
            ]);
            expect(filters[1].props("selectedFilterOptions")).toStrictEqual(datasets.dataset3.metadata.defaults.selected_filter_options);

            done();
        });
    });

    it("does not render DataSource component when available datasetIds length is not greater than 1", async () => {
        const state = {datasets};
        const reducedMetadata = {
            "test-chart": {
                datasets: metadata["test-chart"].datasets,
                dataSelectors: {
                    dataSources: [
                        {
                            id: "visible1",
                            type: "editable",
                            label: "First",
                            datasetId: "dataset1",
                            showFilters: true,
                            showIndicators: false
                        },
                        {id: "hidden", type: "fixed", datasetId: "dataset2", showFilters: true, showIndicators: false}
                    ]
                },
                chartConfig: metadata["test-chart"].chartConfig
            }
        } as any;

        const props = {
            chartId: "test-chart",
            availableDatasetIds: ["dataset1"]
        };

        const wrapper = getWrapper(state, reducedMetadata, props);
        await flushPromises();
        const dataSources = wrapper.findComponent(DataSource);
        expect(dataSources.exists()).toBe(false);
    });

    it("sets data source's datasetId if default is not available, and hides datasource picker if only one available dataset", async () => {
        const state = {datasets};
        const reducedMetadata =  {
            "test-chart": {
                datasets: [metadata["test-chart"].datasets[0]],
                dataSelectors: {
                    dataSources: [
                        {id: "visible1", type: "editable", label: "First", datasetId: "dataset1", showFilters: true, showIndicators: false},
                        {id: "hidden", type: "fixed", datasetId: "dataset2", showFilters: true, showIndicators: false}
                    ]
                },
                chartConfig: metadata["test-chart"].chartConfig
            }
        } as any;

        const props = {
            chartId: "test-chart",
            availableDatasetIds: ["dataset2"]
        };

        const wrapper = getWrapper(state, reducedMetadata, props);
        await flushPromises();
        const dataSources = wrapper.findComponent(DataSource);
        expect(dataSources.exists()).toBe(false);
        const vm = wrapper.vm as any
        expect(vm.dataSourceSelections.visible1.datasetId).toEqual("dataset2")
        expect(vm.dataSourceSelections.hidden.datasetId).toEqual("dataset2")
    });

    it("updates filter selections and chart data on filters update", (done) => {
        const state = {datasets};
        const wrapper = getWrapper(state);

        setTimeout(() => {
            const dataset1Filters = wrapper.findAllComponents(FiltersComp)[0];
            const newFilterSelections = {
                age: [{id: "2", label: "2"}],
                year: [{id: "2020", label: "2020"}]
            };
            dataset1Filters.vm.$emit("update:filters", newFilterSelections);

            setTimeout(() => {
                expect(dataset1Filters.props("selectedFilterOptions")).toStrictEqual(newFilterSelections);
                const chartData = wrapper.findComponent(Plotly).props("chartData");
                expect(chartData).toStrictEqual({
                    visible1: [{age: "2", year: "2020", value: 3}],
                    visible2: [
                        {age: "10", year: "2020", value: 10},
                        {age: "20", year: "2020", value: 30}
                    ],
                    hidden: [{type: "test", value: "test"}]
                });
                done();
            });
        });
    });

    it("sets plotly layoutData and height based on subplot config", (done) => {
        const subplotsMetadata: GenericChartMetadataResponse = {
            "test-chart": {
                datasets: [
                    {id: "dataset1", label:"Dataset 1", url: "/dataset1"}
                ],
                dataSelectors: {
                    dataSources: [
                        {id: "data", type: "editable", label: "First", datasetId: "dataset1", showFilters: true, showIndicators: false},
                    ]
                },
                subplots: {
                    columns: 2,
                    distinctColumn: "area",
                    heightPerRow: 100,
                    subplotsPerPage: 99
                },
                chartConfig: [{
                    id: "scatter",
                    config: "Test Chart Config"
                }]
            }
        } as any;
        const subplotDatasets = {
            dataset1: {
                data: [
                    {type: "test", area:"a", value: 1},
                    {type: "test", area:"b",value: 2},
                    {type: "test", area:"c",value: 3},
                    {type: "test", area:"d",value: 4},
                    {type: "test", area:"e",value: 5}
                ],
                metadata: {
                    columns: [
                        {
                            id: "type",
                            column_id: "type",
                            label: "Type",
                            allowMultiple: false,
                            options: [
                                {id: "test", label: "test"},
                                {id: "other", label: "other"}
                            ]
                        }
                    ],
                    defaults: {
                        selected_filter_options: {
                            type: [{id: "test", label: "test"}]
                        }
                    }
                }
            }
        } as any;
        const state = {datasets: subplotDatasets};

        const wrapper = getWrapper(state, subplotsMetadata);
        setTimeout(() => {
            const dataSources = wrapper.findAllComponents(DataSource);
            expect(dataSources.length).toBe(1);
            const filters = wrapper.findAllComponents(FiltersComp);
            expect(filters.length).toBe(1);

            const plotly = wrapper.findComponent(Plotly);
            // 5 values of distinctColumn, so should be 3 rows of 2 columns
            expect(plotly.props("layoutData")).toStrictEqual({
                subplots: {
                    columns: 2,
                    distinctColumn: "area",
                    heightPerRow: 100,
                    subplotsPerPage: 99,
                    rows: 3
                },
                yAxisFormat: ""
            });
            expect((plotly.element as HTMLElement).style.height).toBe("370px");
            done();
        });
    });

    it("sets plotly and table Format based on configured valueFormatColumn selected option", (done) => {
        const valueFormatMetadata: GenericChartMetadataResponse = {
            "test-chart": {
                datasets: [
                    {id: "dataset1", label:"Dataset 1", url: "/dataset1", table: {}}
                ],
                dataSelectors: {
                    dataSources: [
                        {id: "data", type: "editable", label: "First", datasetId: "dataset1", showFilters: true, showIndicators: false},
                    ]
                },
                valueFormatColumn: "plot_type",
                chartConfig: [{
                    id: "scatter",
                    config: "Test Chart Config"
                }]
            }
        } as any;
        const valueFormatDatasets = {
            dataset1: {
                data: [
                    {type: "test", area:"a", plot_type: "p1"},
                    {type: "test", area:"b", plot_type: "p2"}
                ],
                metadata: {
                    columns: [
                        {
                            id: "type",
                            column_id: "type",
                            label: "Type",
                            allowMultiple: false,
                            options: [
                                {id: "test", label: "test"},
                                {id: "other", label: "other"}
                            ]
                        },
                        {
                            id: "plot_type",
                            column_id: "plot_type",
                            label: "Plot",
                            options: [
                                {id: "p1", label: "plot 1", format: "0.0%"},
                                {id: "p2", label: "plot 2", format: "0"}
                            ]
                        }
                    ],
                    defaults: {
                        selected_filter_options: {
                            type: [{id: "test", label: "test"}],
                            plot_type: [{id: "p1", label: "plot 1", format: "0.0%"}]
                        }
                    }
                }
            }
        } as any;
        const state = {datasets: valueFormatDatasets};

        const wrapper = getWrapper(state, valueFormatMetadata);
        setTimeout(() => {
            const plotly = wrapper.findComponent(Plotly);
            expect(plotly.props("layoutData")).toStrictEqual({
                yAxisFormat: ".1%"
            });
            expect(wrapper.findComponent(GenericChartTable).props("valueFormat")).toBe(".1%");
            expect(wrapper.findComponent(DownloadIndicator).props()).toEqual(
                {
                    unfilteredData: [
                        {
                            area: "a",
                            plot_type: "p1",
                            type: "test"
                        },
                        {
                            area: "b",
                            plot_type: "p2",
                            type: "test"
                        }
                    ],
                    filteredData: [
                        {
                            area: "a",
                            plot_type: "p1",
                            type: "test"
                        },
                        {
                            area: "b",
                            plot_type: "p2",
                            type: "test"
                        }
                    ]
                })
            done();
        });
    });

    it("fetches default datasets, and sets default selections, on mount", (done) => {
        mockAxios.onGet(`/dataset1`)
            .reply(200, mockSuccess(datasets.dataset1));
        mockAxios.onGet(`/dataset2`)
            .reply(200, mockSuccess(datasets.dataset2));
        mockAxios.onGet(`/dataset3`)
            .reply(200, mockSuccess(datasets.dataset3));

        const wrapper = getWrapper();
        setTimeout(() => {
            expect(mockAxios.history.get.length).toBe(3);
            expect(mockAxios.history.get[0].url).toBe("/dataset1");
            expect(mockAxios.history.get[1].url).toBe("/dataset2");
            expect(mockAxios.history.get[2].url).toBe("/dataset3");

            expect((wrapper.vm as any).$data.dataSourceSelections).toStrictEqual({
                visible1: {
                    datasetId: "dataset1",
                    selectedFilterOptions: {
                        age: [{id: "1", label: "1"}],
                        year: [{id: "2021", label: "2021"}]
                    }
                },
                visible2: {
                    datasetId: "dataset2",
                    selectedFilterOptions: {
                        age: [{id: "10", label: "10"}],
                        year: [{id: "2020", label: "2020"}]
                    }
                },
                hidden: {
                    datasetId: "dataset3",
                    selectedFilterOptions: {
                        type: [{id: "test", label: "test"}]
                    }
                }
            });

            done();
        });
    });

    it("fetches dataset on data source value change, and sets default selections, if dataset does not exist in state", (done) => {
        const datasets1And3 = {
            dataset1: datasets.dataset1,
            dataset3: datasets.dataset3
        };
        const reducedMetadata =  {
            "test-chart": {
                datasets: metadata["test-chart"].datasets,
                dataSelectors: {
                    dataSources: [
                        {id: "visible1", type: "editable", label: "First", datasetId: "dataset1", showFilters: true, showIndicators: false},
                        {id: "hidden", type: "fixed", datasetId: "dataset3", showFilters: true, showIndicators: false}
                    ]
                },
                chartConfig: metadata["test-chart"].chartConfig
            }
        } as any;

        mockAxios.onGet(`/dataset2`)
            .reply(200, mockSuccess(datasets.dataset2));

        const wrapper = getWrapper({datasets: datasets1And3}, reducedMetadata);
        setTimeout(async () => {
            await wrapper.findAllComponents(DataSource)[0].vm.$emit("update", "dataset2");

            // expect filter selections to have been set to null while ensure dataset
            expect((wrapper.vm as any).$data.dataSourceSelections.visible1.selectedFilterOptions).toBe(null);
            setTimeout(() => {
                expect(mockAxios.history.get.length).toBe(1);
                expect(mockAxios.history.get[0].url).toBe("/dataset2");
                expect((wrapper.vm as any).$data.dataSourceSelections).toStrictEqual({
                    visible1: {
                        datasetId: "dataset2",
                        selectedFilterOptions: {
                            age: [{id: "10", label: "10"}],
                            year: [{id: "2020", label: "2020"}]
                        }
                    },
                    hidden: {
                        datasetId: "dataset3",
                        selectedFilterOptions: {
                            type: [{id: "test", label: "test"}]
                        }
                    }
                });
                done();
            });
        });
    });

    it("does not fetch default dataset on mount if it already exists in state", () => {
        const state = {datasets};
        getWrapper(state);
        setTimeout(() => {
            expect(mockAxios.history.get.length).toBe(0);
        });
    });

    it("does not fetch default dataset on data source value change if it already exists in state", (done) => {
        const state = {datasets};
        const wrapper = getWrapper(state);
        setTimeout(() => {
            wrapper.findAllComponents(DataSource)[0].vm.$emit("update", "dataset2");
            setTimeout(() => {
                expect(mockAxios.history.get.length).toBe(0);
                done();
            });
        });
    });

    it("renders error", () => {
        const genericChartError = {error: "TEST-ERROR"} as any;
        const wrapper = getWrapper( {datasets, genericChartError});
        expect(wrapper.findComponent(ErrorAlert).props("error")).toStrictEqual(genericChartError);
    });

    it("does not render table if no table config for data source's dataset", () => {
        const state = {datasets};
        const wrapper = getWrapper(state);

        setTimeout(() => {
            expect(wrapper.findAllComponents(GenericChartTable).length).toBe(0);
        });
    });

    it("renders table if table config exists for data source's dataset", (done) => {
        const tableConfig1 = {
            columns: [
                {
                    data: {columnId: "age", labelFilterId: null},
                    header: {type: "filterLabel", filterId: "age"}
                }
            ]
        };
        const tableConfig2 = {
            columns: [
                {
                    data: {columnId: "year", labelFilterId: "year"},
                    header: {type: "filterLabel", filterId: "year"}
                }
            ]
        };

        const customMetadata = {
            "test-chart": {
                ...metadata["test-chart"],
                datasets: [
                    {...metadata["test-chart"].datasets[0], table: tableConfig1},
                    {...metadata["test-chart"].datasets[1], table: tableConfig2},
                    metadata["test-chart"].datasets[2]
                ] as any
            }
        };
        const state = {datasets};
        const wrapper = getWrapper(state, customMetadata);

        setTimeout(() => {
            const tables = wrapper.findAllComponents(GenericChartTable);
            expect(tables.length).toBe(2);
            expect(tables[0].props("tableConfig")).toStrictEqual(tableConfig1);
            expect(tables[0].props("filteredData")).toStrictEqual([{age: "1", year: "2021", value: 2}]);
            expect(tables[0].props("columns")).toStrictEqual(datasets.dataset1.metadata.columns);
            expect(tables[0].props("selectedFilterOptions")).toStrictEqual(datasets.dataset1.metadata.defaults.selected_filter_options);
            expect(tables[0].props("valueFormat")).toBe("");

            expect(tables[1].props("tableConfig")).toStrictEqual(tableConfig2);
            expect(tables[1].props("filteredData")).toStrictEqual([
                {age: "10", year: "2020", value: 10},
                {age: "20", year: "2020", value: 30}
            ]);
            expect(tables[1].props("columns")).toStrictEqual(datasets.dataset2.metadata.columns);
            expect(tables[1].props("selectedFilterOptions")).toStrictEqual(datasets.dataset2.metadata.defaults.selected_filter_options);
            expect(tables[0].props("valueFormat")).toBe("");

            done();
        });
    });

    const pagedMetadata: GenericChartMetadataResponse = {
        "test-chart": {
            datasets: [
                {
                    id: "dataset1",
                    label:"Dataset 1",
                    url: "/dataset1",
                    filters: [
                        {id: "type", source: "data", allowMultiple: false}
                    ],
                }
            ],
            dataSelectors: {
                dataSources: [
                    {id: "data", type: "editable", label: "First", datasetId: "dataset1", showFilters: true, showIndicators: false},
                ]
            },
            subplots: {
                columns: 2,
                distinctColumn: "area",
                heightPerRow: 100,
                subplotsPerPage: 2
            },
            chartConfig: [{
                id: "scatter",
                config: "Test Chart Config"
            }]
        }
    } as any;
    const pagedDatasets = {
        dataset1: {
            data: [
                {type: "test", area:"a", year: "2020", value: 1},
                {type: "test", area:"b", year: "2020", value: 2},
                {type: "test", area:"c", year: "2020", value: 3},
                {type: "test", area:"d", year: "2020", value: 4},
                {type: "test", area:"e", year: "2020", value: 5},
                {type: "test", area:"a", year: "2021", value: 1.1},
                {type: "test", area:"b", year: "2021", value: 2.1},
                {type: "test", area:"c", year: "2021", value: 3.1},
                {type: "test", area:"d", year: "2021", value: 4.1},
                {type: "test", area:"e", year: "2021", value: 5.1},
                {type: "other", area:"f", year: "2020", value: 6}
            ],
            metadata: {
                columns: [
                    {
                        id: "type",
                        column_id: "type",
                        label: "Type",
                        options: [
                            {id: "test", label: "test"},
                            {id: "other", label: "other"}
                        ]
                    }
                ],
                defaults: {
                    selected_filter_options: {
                        type: [{id: "test", label: "test"}]
                    }
                }
            }
        }
    } as any;

    it("renders paging controls and first page of data when there are multiple pages", (done) => {
        const state = {datasets: pagedDatasets};

        const wrapper = getWrapper(state, pagedMetadata);
        setTimeout(() => {
            const store = wrapper.vm.$store;
            const dataSources = wrapper.findAllComponents(DataSource);
            expect(dataSources.length).toBe(1);
            const filters = wrapper.findAllComponents(FiltersComp);
            expect(filters.length).toBe(1);

            const pageControls = wrapper.find("#page-controls");
            const previous = pageControls.find("button#previous-page");
            const feather = previous.findComponent(VueFeather);
            expect(feather.attributes("type")).toBe("chevron-left");
            expect(feather.attributes("size")).toBe("20");
            expectTranslated(previous, "Previous page",
                "Page précédente", "Página anterior", store, "aria-label");
            expect((previous.element as HTMLButtonElement).disabled).toBe(true);

            const next = pageControls.find("button#next-page");
            const feather2 = next.findComponent(VueFeather);
            expect(feather2.attributes("type")).toBe("chevron-right");
            expect(feather2.attributes("size")).toBe("20");
            expectTranslated(next, "Next page",
                "Page suivante", "Próxima página", store, "aria-label");
            expect((next.element as HTMLButtonElement).disabled).toBe(false);

            expectTranslated(pageControls.find("#page-number"), "Page 1 of 3",
                "Page 1 sur 3", "Pagina 1 de 3", store);

            const plotly = wrapper.findComponent(Plotly);
            expect(plotly.props("chartData")).toStrictEqual({
                data: [
                    {type: "test", area:"a", year: "2020", value: 1, page: 1},
                    {type: "test", area:"b", year: "2020", value: 2, page: 1},
                    {type: "test", area:"a", year: "2021", value: 1.1, page: 1},
                    {type: "test", area:"b", year: "2021", value: 2.1 ,page: 1}
                ]
            });
            expect(plotly.props("layoutData")).toStrictEqual({
                subplots: {
                    columns: 2,
                    distinctColumn: "area",
                    heightPerRow: 100,
                    subplotsPerPage: 2,
                    rows: 1
                },
                yAxisFormat: ""
            });

            done();
        });
    });

    it("next page button loads next page", async () => {
        const state = {datasets: pagedDatasets};

        const wrapper = getWrapper(state, pagedMetadata);
        await flushPromises();
        const chartContainerEl = wrapper.find(".chart-container").element as HTMLElement;
        chartContainerEl.scrollTop = 100;

        const next = wrapper.find("#next-page");

        // Move to Page 2
        await next.trigger("click");
        const store = wrapper.vm.$store;
        await expectTranslated(wrapper.find("#page-number"), "Page 2 of 3",
            "Page 2 sur 3", "Pagina 2 de 3", store);

        expect((wrapper.find("#next-page").element as HTMLButtonElement).disabled).toBe(false);
        expect((wrapper.find("#previous-page").element as HTMLButtonElement).disabled).toBe(false);

        const plotly = wrapper.findComponent(Plotly);
        expect(plotly.props("chartData")).toStrictEqual({
            data: [
                {type: "test", area:"c", year: "2020", value: 3, page: 2},
                {type: "test", area:"d", year: "2020", value: 4, page: 2},
                {type: "test", area:"c", year: "2021", value: 3.1, page: 2},
                {type: "test", area:"d", year: "2021", value: 4.1, page: 2}
            ]
        });
        expect(chartContainerEl.scrollTop).toBe(0);

        // Move to Page 3
        await next.trigger("click");
        await expectTranslated(wrapper.find("#page-number"), "Page 3 of 3",
            "Page 3 sur 3", "Pagina 3 de 3", store);

        expect((wrapper.find("#next-page").element as HTMLButtonElement).disabled).toBe(true);
        expect((wrapper.find("#previous-page").element as HTMLButtonElement).disabled).toBe(false);

        expect(plotly.props("chartData")).toStrictEqual({
            data: [
                {type: "test", area:"e", year: "2020", value: 5, page: 3},
                {type: "test", area:"e", year: "2021", value: 5.1, page: 3}
            ]
        });
    });

    it("previous page button loads previous page", async () => {
        const state = {datasets: pagedDatasets};

        const wrapper = getWrapper(state, pagedMetadata);
        await flushPromises();
        // Move to Page 2
        await wrapper.find("#next-page").trigger("click");
        const store = wrapper.vm.$store;
        await expectTranslated(wrapper.find("#page-number"), "Page 2 of 3",
            "Page 2 sur 3", "Pagina 2 de 3", store);

        // Move back to Page 1
        const chartContainerEl = wrapper.find(".chart-container").element as HTMLElement;
        chartContainerEl.scrollTop = 100;

        await wrapper.find("#previous-page").trigger("click");
        await expectTranslated(wrapper.find("#page-number"), "Page 1 of 3",
            "Page 1 sur 3", "Pagina 1 de 3", store);

        expect((wrapper.find("#next-page").element as HTMLButtonElement).disabled).toBe(false);
        expect((wrapper.find("#previous-page").element as HTMLButtonElement).disabled).toBe(true);

        expect(wrapper.findComponent(Plotly).props("chartData")).toStrictEqual({
            data: [
                {type: "test", area: "a", year: "2020", value: 1, page: 1},
                {type: "test", area: "b", year: "2020", value: 2, page: 1},
                {type: "test", area: "a", year: "2021", value: 1.1, page: 1},
                {type: "test", area: "b", year: "2021", value: 2.1, page: 1}
            ]
        });

        expect(chartContainerEl.scrollTop).toBe(0);
    });

    it("pages reset when data source changes", async () => {
        const secondDataset = {
            data: [
                {type: "test", area:"aa", value: 10},
                {type: "test", area:"bb",value: 20},
                {type: "test", area:"cc",value: 30},
                {type: "other", area:"ff",value: 60}
            ],
            metadata: {
                columns: [
                    {
                        id: "type",
                        column_id: "type",
                        label: "Type",
                        options: [
                            {id: "test", label: "test"},
                            {id: "other", label: "other"}
                        ]
                    }
                ],
                defaults: {
                    selected_filter_options: {
                        type: [{id: "test", label: "test"}]
                    }
                }
            }
        } as any;
        const datasets = {...pagedDatasets, dataset2: secondDataset};
        const state = {datasets};

        const metadata = {
            "test-chart": {
                ...pagedMetadata["test-chart"],
                datasets: [
                    ...pagedMetadata["test-chart"].datasets,
                    {
                        id: "dataset2",
                        label:"Dataset 2",
                        url: "/dataset2",
                        filters: [
                            {id: "type", source: "data", allowMultiple: false}
                        ],
                    }
                ]
            }
        };

        mockAxios.onGet(`/dataset2`)
            .reply(200, mockSuccess(secondDataset));

        const wrapper = getWrapper(state, metadata);
        await flushPromises();
        // Move to Page 2
        await wrapper.find("#next-page").trigger("click");
        const store = wrapper.vm.$store;
        await nextTick();
        await expectTranslated(wrapper.find("#page-number"), "Page 2 of 3",
            "Page 2 sur 3", "Pagina 2 de 3", store);

        wrapper.findAllComponents(DataSource)[0].vm.$emit("update", "dataset2");
        await nextTick();
        expect((wrapper.vm as any).$data.dataSourceSelections.data.datasetId).toBe("dataset2");
        await nextTick();
        await expectTranslated(wrapper.find("#page-number"), "Page 1 of 2",
            "Page 1 sur 2", "Pagina 1 de 2", store);

        expect((wrapper.find("#next-page").element as HTMLButtonElement).disabled).toBe(false);
        expect((wrapper.find("#previous-page").element as HTMLButtonElement).disabled).toBe(true);

        const plotly = wrapper.findComponent(Plotly);
        expect(plotly.props("chartData")).toStrictEqual({
            data: [
                {type: "test", area:"aa", value: 10, page: 1},
                {type: "test", area:"bb", value: 20, page: 1}
            ]
        });
    });

    it("pages reset when selected filter options change", async () => {
        const state = {datasets: pagedDatasets};
        const wrapper = getWrapper(state, pagedMetadata);
        await flushPromises();
        const nextPage = wrapper.find("#next-page");
        // Move to Page 2
        await nextPage.trigger("click");
        const store = wrapper.vm.$store;
        await expectTranslated(wrapper.find("#page-number"), "Page 2 of 3",
            "Page 2 sur 3", "Pagina 2 de 3", store);
        const dataset1Filters = wrapper.findAllComponents(FiltersComp)[0];
        const newFilterSelections = {
            type: [{id: "other"}]
        };
        dataset1Filters.vm.$emit("update:filters", newFilterSelections);
        await nextTick();

        expect(wrapper.find("#page-controls").exists()).toBe(false);
        expect((wrapper.vm as any).currentPage).toBe(1);
        expect((wrapper.vm as any).totalPages).toBe(1);
        const plotly = wrapper.findComponent(Plotly);
        expect(plotly.props("chartData")).toStrictEqual({
            data: [
                {type: "other", area: "f", year: "2020", value: 6, page: 1}
            ]
        });
    });


    it("no paging is applied when subplots not defined", (done) => {
        const state = {datasets: pagedDatasets};

        const metadataWithoutSubplots = {
            "test-chart": {
                ...pagedMetadata["test-chart"],
                subplots: undefined
            }
        };
        const wrapper = getWrapper(state, metadataWithoutSubplots);
        setTimeout(() => {
            const store = wrapper.vm.$store;
            const dataSources = wrapper.findAllComponents(DataSource);
            expect(dataSources.length).toBe(1);
            const filters = wrapper.findAllComponents(FiltersComp);
            expect(filters.length).toBe(1);

            expect(wrapper.find("#page-controls").exists()).toBe(false);

            const plotly = wrapper.findComponent(Plotly);
            expect(plotly.props("chartData")).toStrictEqual({
                data:  [
                    {type: "test", area:"a", year: "2020", value: 1},
                    {type: "test", area:"b", year: "2020", value: 2},
                    {type: "test", area:"c", year: "2020", value: 3},
                    {type: "test", area:"d", year: "2020", value: 4},
                    {type: "test", area:"e", year: "2020", value: 5},
                    {type: "test", area:"a", year: "2021", value: 1.1},
                    {type: "test", area:"b", year: "2021", value: 2.1},
                    {type: "test", area:"c", year: "2021", value: 3.1},
                    {type: "test", area:"d", year: "2021", value: 4.1},
                    {type: "test", area:"e", year: "2021", value: 5.1}
                ]
            });

            done();
        });
    });

    it("displays chart description", (done) => {
        const state = {datasets};
        const wrapper = getWrapper(state);

        setTimeout(() => {
            const description = wrapper.find("#chart-description");
            expectTranslated(description,
                "Values are shown in red when they differ from the previous or subsequent value by more than 25%, and in black otherwise.",
                "Les valeurs sont affichées en rouge lorsqu'elles diffèrent de la valeur précédente ou suivante de plus de 25 %, et en noir dans le cas contraire.",
                "Os valores são mostrados em vermelho quando diferem do valor anterior ou subsequente em mais de 25% e em preto, caso contrário.",
                wrapper.vm.$store);
            expect(description.classes()).toContain("text-muted");
            done();
        });
    });

    it("does not show chart description if none in config", (done) => {
        const noDescMetadata = {
            "test-chart": {
                ...metadata["test-chart"],
                chartConfig: [{
                    ...metadata["test-chart"].chartConfig[0],
                    description: undefined
                }]
            }
        };

        const state = {datasets};
        const wrapper = getWrapper(state, noDescMetadata);

        setTimeout(() => {
            expect(wrapper.find("#chart-description").exists()).toBe(false);
            done();
        });
    });

});
