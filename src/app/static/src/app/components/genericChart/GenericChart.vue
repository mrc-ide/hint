<template>
    <div>
        <div class="row" v-if="chartData">
            <div class="col-3">
                <div v-for="ds in chartConfigValues.dataSourceConfigValues" :key="ds.config.id">
                    <data-source v-if="ds.editable && availableDatasetIds.length > 1"
                                 :config="ds.config"
                                 :datasets="chartMetadata.datasets"
                                 :value="ds.selections.datasetId"
                                 @update="updateDataSource(ds.config.id, $event)">
                    </data-source>
                    <filters-comp v-if="ds.config.showFilters && ds.filters && ds.selections.selectedFilterOptions"
                                :filters="ds.filters"
                                :selected-filter-options="ds.selections.selectedFilterOptions"
                                @update:filters="updateSelectedFilterOptions(ds.config.id, $event)">
                    </filters-comp>
                </div>
                <div id="chart-description"
                     v-if="chartConfigValues.description"
                     v-translate="chartConfigValues.description"
                     class="text-muted mt-4"></div>
            </div>
            <div class="col-9" style="position: relative;">
                <div class="chart-container" ref="chartContainer" :style="{height: chartHeight}">
                    <plotly class="chart"
                            v-if="!chartDataIsEmpty"
                           :chart-data="chartDataPage"
                           :layout-data="(chartConfigValues.layoutData as any)"
                           :style="{height: chartConfigValues.scrollHeight}"></plotly>
                    <div v-else class="mt-5" id="empty-generic-chart-data">
                        <div class="empty-chart-message px-3 py-2">
                            <span class="lead">
                                <strong v-translate="'noChartData'"></strong>
                            </span>
                         </div>
                     </div>
                </div>
                <div v-if="totalPages > 1" id="page-controls" class="text-center mt-2">
                    <button id="previous-page"
                            class="btn btn-sm mr-2"
                            :class="prevPageEnabled ? 'btn-red' : 'btn-secondary'"
                            v-translate:aria-label="'previousPage'"
                            :disabled="!prevPageEnabled"
                            @click="currentPage--">
                        <vue-feather type="chevron-left" size="20"></vue-feather>
                    </button>
                    <span id="page-number">
                        {{pageNumberText}}
                    </span>
                    <button id="next-page"
                            class="btn btn-sm ml-2"
                            :class="nextPageEnabled ? 'btn-red' : 'btn-secondary'"
                            v-translate:aria-label="'nextPage'"
                            :disabled="!nextPageEnabled"
                            @click="currentPage++">
                        <vue-feather type="chevron-right" size="20"></vue-feather>
                    </button>
                    <hr/>
                </div>
                <div v-for="dataSource in chartConfigValues.dataSourceConfigValues.filter(ds => ds.tableConfig)"
                     :key="dataSource.config.id">
                    <download-indicator :filtered-data="filteredDataWithoutPages ? filteredDataWithoutPages[dataSource.config.id] : []"
                                        :unfiltered-data="unfilteredData[dataSource.config.id]"></download-indicator>
                    <generic-chart-table :table-config="dataSource.tableConfig!"
                                         :filtered-data="chartData[dataSource.config.id]"
                                         :columns="dataSource.columns!"
                                         :selected-filter-options="dataSource.selections.selectedFilterOptions!"
                                         :value-format="valueFormat"
                    ></generic-chart-table>
                </div>
            </div>
        </div>
        <div class="row" v-if="!chartData">
            <div class="text-center col-12">
                <loading-spinner size="lg"></loading-spinner>
                <h2 id="loading-message" v-translate="'loadingData'"></h2>
            </div>
        </div>
        <div v-if="error" class="row">
            <error-alert :error="error"></error-alert>
        </div>
    </div>
</template>

<script lang="ts">
    import i18next from "i18next";
    import VueFeather from "vue-feather";
    import {
        DataSourceConfig,
        DatasetConfig,
        DatasetFilterConfig,
        Dict, DisplayFilter, GenericChartColumn, GenericChartColumnValue,
        GenericChartDataset,
        GenericChartMetadata,
        GenericChartMetadataResponse, GenericChartTableConfig
    } from "../../types";
    import DataSource from "./dataSelectors/DataSource.vue";
    import FiltersComp from "../plots/Filters.vue";
    import ErrorAlert from "../ErrorAlert.vue";
    import LoadingSpinner from "../LoadingSpinner.vue";
    import {mapActionByName, mapStateProp} from "../../utils";
    import {GenericChartState} from "../../store/genericChart/genericChart";
    import {getDatasetPayload} from "../../store/genericChart/actions";
    import {Error, FilterOption} from "../../generated";
    import Plotly from "./Plotly.vue";
    import {filterData, genericChartColumnsToFilters, numeralJsToD3format} from "./utils";
    import GenericChartTable from "./GenericChartTable.vue";
    import {Language} from "../../store/translations/locales";
    import {RootState} from "../../root";
    import DownloadIndicator from "../downloadIndicator/DownloadIndicator.vue";
    import { PropType, defineComponent } from "vue";

    interface DataSourceConfigValues {
        selections: DataSourceSelections
        editable: boolean
        config: DataSourceConfig
        filters: DisplayFilter[] | null
        columns: GenericChartColumn[] | null
        tableConfig: GenericChartTableConfig | undefined
    }

    interface ChartConfigValues {
        dataSourceConfigValues: DataSourceConfigValues[]
        layoutData: Dict<unknown>
        scrollHeight: string
        chartConfig: string
        description?: string
    }

    interface DataSourceSelections {
        datasetId: string,
        selectedFilterOptions: Dict<FilterOption[]> | null
    }

    interface Data {
        dataSourceSelections:  Dict<DataSourceSelections>
        currentPage: number
        totalPages: number
        finalPagePlotCount: number
    }

    interface Props {
        metadata: GenericChartMetadataResponse
        chartId: string
        chartHeight?: string
        availableDatasetIds: string[]
    }

    interface Computed {
        currentLanguage: Language
        datasets: Record<string, GenericChartDataset>
        error: Error | null
        chartMetadata: GenericChartMetadata
        valueFormat: string
        chartConfigValues: ChartConfigValues
        chartData: Dict<unknown[]> | null
        chartDataPage: Dict<unknown[]> | null
        chartDataIsEmpty: boolean
        filters: Dict<DisplayFilter[]>
        pageNumberText: string
        prevPageEnabled: boolean
        nextPageEnabled: boolean
        unfilteredData: Dict<unknown[]>
        filteredDataWithoutPages: Dict<unknown[]> | null
    }

    interface Methods {
        ensureDataset: (datasetId: string) => void,
        getDataset: (payload: getDatasetPayload) => void,
        setDataSourceDefaultFilterSelections: (dataSourceId: string, datasetId: string) => void,
        updateDataSource: (dataSourceId: string, datasetId: string) => void,
        updateSelectedFilterOptions: (dataSourceId: string, options: Dict<FilterOption[]> | null) => void
        addPageNumbersToData: (data: unknown[]) => unknown[]
    }

    const namespace = "genericChart";

    export default defineComponent({
        name: "GenericChart",
        props: {
            metadata: {
                type: Object as PropType<GenericChartMetadataResponse>,
                required: true
            },
            chartId: {
                type: String,
                required: true
            },
            chartHeight: {
                type: String,
                required: false
            },
            availableDatasetIds: {
                type: Array,
                required: true
            }
        },
        components: {
            DownloadIndicator,
            VueFeather,
            DataSource,
            FiltersComp,
            Plotly,
            GenericChartTable,
            ErrorAlert,
            LoadingSpinner
        },
        data: function(): Data {
            const chart = this.metadata[this.chartId];
            const dataSourceSelections = chart.dataSelectors.dataSources
            .reduce((running: Record<string, DataSourceSelections>, dataSource: DataSourceConfig) => Object.assign(running, {
                [dataSource.id]: {
                    datasetId: this.availableDatasetIds.find(id => id === dataSource.datasetId) || this.availableDatasetIds[0],
                    selectedFilterOptions: null
                }
            }), {})

            return {
                dataSourceSelections,
                currentPage: 1,
                totalPages: 1,
                finalPagePlotCount: 0
            }
        },
        computed: {
            currentLanguage: mapStateProp<RootState, Language>(null,
                (state: RootState) => state.language
            ),
            datasets:  mapStateProp<GenericChartState, Record<string, GenericChartDataset>>(namespace,
                (state: GenericChartState) => state.datasets),
            error: mapStateProp<GenericChartState, Error | null>(namespace,
                (state: GenericChartState) => state.genericChartError),
            chartMetadata() {
                return this.metadata[this.chartId]!;
            },
            filters() {
                // Convert 'columns' in the metadata section of all fetched datasets into filters which we can pass
                // to the Filters components. Build a dictionary keyed by dataset id, of related DisplayFilter[].
                const result = {} as Dict<DisplayFilter[]>;
                for (const datasetConfig of this.chartMetadata.datasets) {
                    const datasetId = datasetConfig.id;
                    if (!this.datasets[datasetId]) {
                        continue;
                    }

                    let filterColumns: GenericChartColumn[] = [];
                    if (datasetConfig.filters) {
                        // Only include columns which are configured as filters in the dataset config
                        const configuredFilterIds = datasetConfig.filters.map((filter: DatasetFilterConfig) => filter.id);
                        const allColumns = this.datasets[datasetId]?.metadata.columns || [];
                        filterColumns = allColumns.filter((column: GenericChartColumn) => configuredFilterIds.includes(column.id));
                    }
                    result[datasetId] = genericChartColumnsToFilters(filterColumns, datasetConfig.filters);
                }
                return result;
            },
            valueFormat() {
                const valueFormatColumn = this.chartMetadata.valueFormatColumn;
                if (valueFormatColumn) {
                    // We only support one value format at a time for now
                    const dataSourceConfig = this.chartMetadata.dataSelectors.dataSources[0];
                    const selections = this.dataSourceSelections[dataSourceConfig.id].selectedFilterOptions;
                    if (selections && selections[valueFormatColumn].length) {
                        const numeralJsFormat =  (selections[valueFormatColumn][0] as GenericChartColumnValue)?.format;
                        if (numeralJsFormat) {
                            return numeralJsToD3format(numeralJsFormat)
                        }
                    }
                }
                return "";
            },
            chartConfigValues() {
                const dataSourceConfigValues = this.chartMetadata.dataSelectors.dataSources.map((dataSourceConfig: DataSourceConfig) => {
                    const selections = this.dataSourceSelections[dataSourceConfig.id];
                    return {
                        selections,
                        editable: dataSourceConfig.type === "editable",
                        config: dataSourceConfig,
                        columns: this.datasets[selections.datasetId]?.metadata.columns,
                        filters: this.filters[selections.datasetId],
                        tableConfig: this.chartMetadata.datasets.find((d: DatasetConfig) => d.id === selections.datasetId)?.table
                    }
                });

                //Provide additional metadata relating to subplots (rows and columns)
                //and define scroll height
                const layoutData = {} as Dict<unknown>;
                let scrollHeight = "100%";
                const subplots = this.chartMetadata.subplots;
                if (subplots) {
                    const numberOfPlots = (this.currentPage === this.totalPages) ? this.finalPagePlotCount : subplots!.subplotsPerPage;
                    const rows = Math.ceil(numberOfPlots / subplots.columns);
                    layoutData.subplots = {
                        ...subplots,
                        rows
                    };
                    //Height per row plus enough to accommodate margin and padding
                    scrollHeight = `${(subplots.heightPerRow * rows) + 70}px`;
                }

                layoutData.yAxisFormat = this.valueFormat;

                // The metadata supports multiple chart types per chart e.g Scatter and Bar, but for now we only need to
                // support one chart type, so here we select the first config in the array
                const chartConfig = this.chartMetadata.chartConfig[0].config;
                const description = this.chartMetadata.chartConfig[0].description;

                return {
                    dataSourceConfigValues,
                    layoutData,
                    scrollHeight,
                    chartConfig,
                    description
                };
            },
            unfilteredData() {
                const result = {} as Dict<unknown[]>;

                for (const dataSource of this.chartMetadata.dataSelectors.dataSources) {
                    const dataSourceId = dataSource.id;
                    const dataSourceSelections = this.dataSourceSelections[dataSourceId];
                    const datasetId = dataSourceSelections.datasetId;
                    const unfilteredData = this.datasets[datasetId]?.data;

                    result[dataSourceId] = unfilteredData || null
                }

                return result
            },
            filteredDataWithoutPages() {
                const result = {} as Dict<unknown[]>;

                for (const dataSource of this.chartMetadata.dataSelectors.dataSources) {
                    const dataSourceId = dataSource.id;
                    const dataSourceSelections = this.dataSourceSelections[dataSourceId];
                    const datasetId = dataSourceSelections.datasetId;
                    const unfilteredData = this.datasets[datasetId]?.data;

                    const filters = this.filters[datasetId] || [];
                    const selectedFilterOptions = dataSourceSelections.selectedFilterOptions;

                    if (!unfilteredData || !selectedFilterOptions) {
                        return null; //Do not attempt to initialise if we are missing any datasets, or selections not initialised
                    }

                    result[dataSourceId] = filterData(unfilteredData, filters, selectedFilterOptions);
                }

                return result
            },
            chartData() {
                const result = this.filteredDataWithoutPages

                if (result && result["data"]) {
                    const dataWithPages = this.addPageNumbersToData(result["data"])
                    return {...result, data: dataWithPages};
                } else {
                    return result;
                }
            },
            chartDataIsEmpty() {
                return !this.chartData ||
                    !Object.values(this.chartData).some((e: any) => e.length);

            },
            chartDataPage() {
                if (this.chartData && this.chartMetadata.subplots) {
                    const data = this.chartData["data"].filter((row: any) => row["page"] == this.currentPage);
                    return {...this.chartData, data}
                } else {
                    return this.chartData;
                }
            },
            pageNumberText() {
                return i18next.t("pageNumber", {
                    currentPage: this.currentPage,
                    totalPages: this.totalPages,
                    lng: this.currentLanguage,
                });
            },
            prevPageEnabled() {
                return this.currentPage > 1;
            },
            nextPageEnabled() {
                return this.totalPages > this.currentPage;
            }
        },
        methods: {
            getDataset: mapActionByName(namespace, 'getDataset'),
            async ensureDataset(datasetId: string) {
                if (datasetId && !this.datasets[datasetId]) {
                    const datasetConfig = this.chartMetadata.datasets.find((dataset: DatasetConfig) => dataset.id === datasetId)!;
                    await this.getDataset({datasetId, url: datasetConfig.url});
                }
            },
            async updateDataSource(dataSourceId: string, datasetId: string) {
                //clear current datasource filter selections while we fetch & show spinner
                this.currentPage = 1;
                this.updateSelectedFilterOptions(dataSourceId, null);
                await this.ensureDataset(datasetId);
                this.setDataSourceDefaultFilterSelections(dataSourceId, datasetId);
            },
            setDataSourceDefaultFilterSelections(dataSourceId: string, datasetId: string) {
                const selectedFilterOptions = this.datasets[datasetId].metadata.defaults.selected_filter_options;
                if (selectedFilterOptions) {
                    this.dataSourceSelections[dataSourceId] = {
                        datasetId,
                        selectedFilterOptions
                    };
                }
            },
            updateSelectedFilterOptions(dataSourceId: string, options: Dict<FilterOption[]> | null) {
                this.currentPage = 1;
                this.dataSourceSelections[dataSourceId].selectedFilterOptions = options;
            },
            addPageNumbersToData(data: unknown[]): unknown[] {
                const subplots = this.chartMetadata.subplots;
                if (subplots) {
                    let pagePlotCount = 0;
                    let pageNum = 1;
                    const distinctValuePageNums : Dict<number> = {};
                    const subplotsPerPage = subplots.subplotsPerPage;
                    const dataWithPages =  data.map((row: any) => {
                        const distinctVal = row[subplots.distinctColumn].toString();
                        if (!Object.keys(distinctValuePageNums).includes(distinctVal)) {
                            pagePlotCount++;
                            if (pagePlotCount === subplotsPerPage + 1) {
                                pagePlotCount = 1;
                                pageNum++;
                            }
                            distinctValuePageNums[distinctVal] = pageNum;
                            return {...row, page: pageNum};
                        } else {
                            return {...row, page: distinctValuePageNums[distinctVal]};
                        }
                    });
                    this.finalPagePlotCount = pagePlotCount;
                    this.totalPages = pageNum;
                    return dataWithPages;
                } else {
                    return data;
                }
            }
        },
        watch: {
            currentPage() {
                if (this.$refs.chartContainer) {
                    (this.$refs.chartContainer as HTMLElement).scrollTop = 0;
                }
            }
        },
        async mounted() {
            for (const dataSourceValues of this.chartConfigValues.dataSourceConfigValues) {
                await this.ensureDataset(dataSourceValues.selections.datasetId);
                this.setDataSourceDefaultFilterSelections(dataSourceValues.config.id, dataSourceValues.selections.datasetId);
            }
        }
    });
</script>
