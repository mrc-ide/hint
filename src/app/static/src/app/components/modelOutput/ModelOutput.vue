<template>
    <div>
        <div class="row">
            <div class="col">
                <ul class="nav nav-tabs col-md-12 p-0">
                    <li v-for="tab in tabs" class="nav-item" :key="tab">
                        <a class="nav-link"
                           :class="selectedTab === tab ? 'active' :  ''"
                           v-on:click="tabSelected(tab)" v-translate="tab">
                        </a>
                    </li>
                </ul>
            </div>
        </div>
        <div class="row mt-2">
            <div v-if="selectedTab === modelOutputTabs.Map" id="choropleth-container" class="col-md-12">
                <loading-tab :loading="loading.map"/>
                <choropleth
                    :chartdata="chartdata"
                    :filters="choroplethFilters"
                    :features="features"
                    :feature-levels="featureLevels"
                    :indicators="choroplethIndicators"
                    :selections="choroplethSelections"
                    :include-filters="true"
                    area-filter-id="area"
                    :colour-scales="colourScales"
                    @update:selections="updateOutputChoroplethSelections({payload: $event})"
                    @update-colour-scales="updateOutputColourScales({payload: $event})"></choropleth>
                <div class="row mt-2">
                    <div class="col-md-3"></div>
                    <area-indicators-table class="col-md-9"
                                           :table-data="chartdata"
                                           :area-filter-id="areaFilterId"
                                           :filters="choroplethFilters"
                                           :countryAreaFilterOption="countryAreaFilterOption"
                                           :indicators="filteredChoroplethIndicators"
                                           :selections="choroplethSelections"
                                           :selectedFilterOptions="choroplethSelections.selectedFilterOptions"
                    ></area-indicators-table>
                </div>
            </div>

            <div v-if="selectedTab === modelOutputTabs.Bar" id="barchart-container" class="col-md-12">
                <loading-tab :loading="loading.bar"/>
                <bar-chart-with-filters
                    :chart-data="chartdata"
                    :filter-config="barchartFilterConfig"
                    :indicators="barchartIndicators"
                    :selections="barchartSelections"
                    :formatFunction="formatBarchartValue"
                    :showRangesInTooltips="true"
                    :no-data-message="noChartData"
                    :show-error-bars="true"
                    :scale-to-screen="true"
                    @update:selections="updateBarchartSelectionsAndXAxisOrder"></bar-chart-with-filters>
                <div class="row mt-2">
                    <div class="col-md-3"></div>
                    <area-indicators-table class="col-md-9"
                                           :table-data="chartdata"
                                           :area-filter-id="areaFilterId"
                                           :filters="barchartFilters"
                                           :countryAreaFilterOption="countryAreaFilterOption"
                                           :indicators="filteredBarchartIndicators"
                                           :selections="barchartSelections"
                                           :selectedFilterOptions="barchartSelections.selectedFilterOptions"
                    ></area-indicators-table>
                </div>
            </div>

            <div v-if="selectedTab === modelOutputTabs.Bubble" id="bubble-plot-container" class="col-md-12">
                <loading-tab :loading="loading.bubble"/>
                <bubble-plot :chartdata="chartdata" :features="features" :featureLevels="featureLevels"
                             :filters="bubblePlotFilters" :indicators="bubblePlotIndicators"
                             :selections="bubblePlotSelections"
                             area-filter-id="area"
                             :colour-scales="colourScales"
                             :size-scales="bubbleSizeScales"
                             @update:selections="updateBubblePlotSelections({payload: $event})"
                             @update-colour-scales="updateOutputColourScales({payload: $event})"
                             @update-size-scales="updateOutputBubbleSizeScales({payload: $event})"></bubble-plot>
                <div class="row mt-2">
                    <div class="col-md-3"></div>
                    <area-indicators-table class="col-md-9"
                                           :table-data="chartdata"
                                           :area-filter-id="areaFilterId"
                                           :filters="bubblePlotFilters"
                                           :countryAreaFilterOption="countryAreaFilterOption"
                                           :indicators="filteredBubblePlotIndicators"
                                           :selections="bubblePlotSelections"
                                           :selectedFilterOptions="bubblePlotSelections.selectedFilterOptions"
                    ></area-indicators-table>
                </div>
            </div>

            <div v-if="selectedTab === modelOutputTabs.Comparison" id="comparison-container" class="col-md-12">
                <loading-tab :loading="loading.comparison"/>
                <bar-chart-with-filters
                    :chart-data="comparisonPlotData"
                    :filter-config="comparisonPlotFilterConfig"
                    :disaggregate-by-config="{ fixed: true, hideFilter: true }"
                    :indicators="comparisonPlotIndicators"
                    :selections="comparisonPlotSelections"
                    :formatFunction="formatBarchartValue"
                    :showRangesInTooltips="true"
                    :no-data-message="noChartData"
                    :show-error-bars="true"
                    :scale-to-screen="true"
                    @update:selections="updateComparisonPlotSelectionsAndXAxisOrder"></bar-chart-with-filters>
                <div class="row mt-2">
                    <div class="col-md-3"></div>
                    <area-indicators-table class="col-md-9"
                                        :table-data="comparisonPlotData"
                                        :area-filter-id="areaFilterId"
                                        :filters="comparisonPlotFilters"
                                        :countryAreaFilterOption="countryAreaFilterOption"
                                        :indicators="filteredComparisonPlotIndicators"
                                        :selections="comparisonPlotSelections"
                                        :translate-filter-labels="false"
                                        :selectedFilterOptions="comparisonPlotSelections.selectedFilterOptions"
                    ></area-indicators-table>
                </div>
                <error-alert v-if="!!comparisonPlotError" :error="comparisonPlotError"></error-alert>
            </div>

            <div v-if="selectedTab === modelOutputTabs.Table" id="table-container" class="col-md-12">
                <loading-tab :loading="loading.table"/>
                <output-table></output-table>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
    import Choropleth from "../plots/choropleth/Choropleth.vue";
    import BubblePlot from "../plots/bubble/BubblePlot.vue";
    import AreaIndicatorsTable from "../plots/table/AreaIndicatorsTable.vue";
    import OutputTable from "../outputTable/OutputTable.vue"
    import {BarchartIndicator, Filter, FilterConfig, FilterOption} from "../../vue-chart/src/bar/types";
    import {BarChartWithFilters} from "../../vue-chart/src";
    import ErrorAlert from "../ErrorAlert.vue";
    import {
        mapGettersByNames,
        mapMutationsByNames,
        mapStateProp,
        mapStateProps,mapActionByName
    } from "../../utils";
    import {
        BarchartSelections,
        BubblePlotSelections,
        ChoroplethSelections, ScaleSelections,
        PlottingSelectionsState, UnadjustedBarchartSelections
    } from "../../store/plottingSelections/plottingSelections";
    import {ModelOutputState} from "../../store/modelOutput/modelOutput";
    import {Feature} from "geojson";
    import {BaselineState} from "../../store/baseline/baseline";
    import {Language, Translations} from "../../store/translations/locales";
    import {inactiveFeatures} from "../../main";
    import {RootState} from "../../root";
    import {LevelLabel, ModelOutputTabs} from "../../types";
    import {ChoroplethIndicatorMetadata, Error,} from "../../generated";
    import {
        formatOutput, 
        filterConfig,
        flattenXAxisFilterOptionIds,
        updateSelectionsAndXAxisOrder
    } from "../plots/utils";
    import {ModelCalibrateState} from "../../store/modelCalibrate/modelCalibrate";
    import i18next from "i18next";
    import { defineComponent } from "vue";
    import { switches } from "../../featureSwitches";
    import LoadingTab from "./LoadingTab.vue";

    const namespace = 'filteredData';

    interface Data {
        tabs: ModelOutputTabs[],
        areaFilterId: string
    }

    interface Methods {
        tabSelected: (tab: ModelOutputTabs) => void
        updateBarchartSelections: (data: { payload: BarchartSelections }) => void
        updateComparisonPlotSelections: (data: { payload: BarchartSelections }) => void
        updateBubblePlotSelections: (data: { payload: BubblePlotSelections}) => void
        updateOutputColourScales: (colourScales: ScaleSelections) => void
        updateOutputBubbleSizeScales: (colourScales: ScaleSelections) => void
        formatBarchartValue: (value: string | number, indicator: BarchartIndicator) => string
        updateBarchartSelectionsAndXAxisOrder: (data: BarchartSelections) => void
        updateComparisonPlotSelectionsAndXAxisOrder: (data: BarchartSelections) => void
        prepareOutputDownloads: () => void
    }

    interface Computed {
        barchartFilters: Filter[],
        comparisonPlotFilters: Filter[],
        bubblePlotFilters: Filter[],
        choroplethFilters: Filter[],
        countryAreaFilterOption: FilterOption,
        barchartIndicators: BarchartIndicator[],
        comparisonPlotIndicators: BarchartIndicator[],
        chartdata: any,
        comparisonPlotData: any
        barchartSelections: BarchartSelections& {detail: null},
        comparisonPlotSelections: BarchartSelections & {detail: null},
        bubblePlotSelections: BubblePlotSelections,
        choroplethSelections: ChoroplethSelections,
        selectedTab: ModelOutputTabs,
        features: Feature[],
        featureLevels: LevelLabel[]
        currentLanguage: Language,
        barchartFilterConfig: FilterConfig,
        comparisonPlotFilterConfig: FilterConfig
        colourScales: ScaleSelections,
        bubbleSizeScales: ScaleSelections,
        choroplethIndicators: ChoroplethIndicatorMetadata[],
        bubblePlotIndicators: ChoroplethIndicatorMetadata[],
        filteredChoroplethIndicators: ChoroplethIndicatorMetadata[],
        filteredBarchartIndicators: BarchartIndicator[],
        filteredBubblePlotIndicators: ChoroplethIndicatorMetadata[],
        filteredComparisonPlotIndicators: BarchartIndicator[],
        barchartFlattenedXAxisFilterOptionIds: string[]
        comparisonPlotFlattenedXAxisFilterOptionIds: string[]
        comparisonPlotError: Error | null
        noChartData: string
        comparisonPlotDefaultSelections: UnadjustedBarchartSelections[]
    }

    export default defineComponent({
        name: "ModelOutput",
        beforeMount() {
            const tab = this.selectedTab ? this.selectedTab : this.tabs[0]
            this.tabSelected(tab);
        },
        data: () => {
            const tabs: (keyof Translations)[] = [
                ModelOutputTabs.Map,
                ModelOutputTabs.Bar,
                ModelOutputTabs.Table,
                ModelOutputTabs.Comparison
            ];

            if (!inactiveFeatures.includes("BubblePlot")) {
                tabs.push(ModelOutputTabs.Bubble);
            }

            return {
                tabs: tabs,
                areaFilterId: "area"
            } as Data
        },
        computed: {
            modelOutputTabs() {
                return ModelOutputTabs
            },
            ...mapGettersByNames("modelOutput", [
                "barchartFilters", "barchartIndicators",
                "bubblePlotFilters", "bubblePlotIndicators",
                "choroplethFilters", "choroplethIndicators",
                "countryAreaFilterOption", "comparisonPlotIndicators",
                "comparisonPlotFilters", "comparisonPlotDefaultSelections"] as const),
            ...mapStateProps("plottingSelections", {
                barchartSelections: (state: PlottingSelectionsState) => state.barchart,
                comparisonPlotSelections: (state: PlottingSelectionsState) => state.comparisonPlot as BarchartSelections & {detail: null},
                bubblePlotSelections: (state: PlottingSelectionsState) => state.bubble,
                choroplethSelections: (state: PlottingSelectionsState) => state.outputChoropleth,
                colourScales: (state: PlottingSelectionsState) => state.colourScales.output,
                bubbleSizeScales: (state: PlottingSelectionsState) => state.bubbleSizeScales.output
            }),
            ...mapStateProps("baseline", {
                    features: (state: BaselineState) => state.shape!.data.features as Feature[],
                    featureLevels: (state: BaselineState) => state.shape!.filters.level_labels || []
                }
            ),
            ...mapStateProps("modelCalibrate", {
                comparisonPlotError: (state: ModelCalibrateState) => state.comparisonPlotError
            }),
            ...mapStateProps("modelOutput", {
                loading: (state: ModelOutputState) => state.loading
            }),
            filteredChoroplethIndicators() {
                return this.choroplethIndicators.filter((val: ChoroplethIndicatorMetadata) => val.indicator === this.choroplethSelections.indicatorId)
            },
            filteredBarchartIndicators() {
                return this.barchartIndicators.filter((val: BarchartIndicator) => val.indicator === this.barchartSelections.indicatorId)
            },
            filteredBubblePlotIndicators() {
                return [
                    ...this.bubblePlotIndicators.filter((val: ChoroplethIndicatorMetadata) => val.indicator === this.bubblePlotSelections.colorIndicatorId),
                    ...this.bubblePlotIndicators.filter((val: ChoroplethIndicatorMetadata) => val.indicator === this.bubblePlotSelections.sizeIndicatorId)
                ]
            },
            filteredComparisonPlotIndicators() {
                return this.comparisonPlotIndicators.filter((val: BarchartIndicator) => val.indicator === this.comparisonPlotSelections.indicatorId)
            },
            selectedTab: mapStateProp<ModelOutputState, string>("modelOutput", state => state.selectedTab),
            chartdata: mapStateProp<ModelCalibrateState, any>("modelCalibrate", state => {
                return state.result ? state.result.data : [];
            }),
            comparisonPlotData: mapStateProp<ModelCalibrateState, any>("modelCalibrate", state => {
                return state.comparisonPlotResult ? state.comparisonPlotResult.data : [];
            }),
            barchartSelections() {
                return {...this.$store.state.plottingSelections.barchart, detail: null}
            },
            currentLanguage: mapStateProp<RootState, Language>(null,
                (state: RootState) => state.language),
            barchartFilterConfig() {
                return filterConfig(this.currentLanguage, this.barchartFilters)
            },
            comparisonPlotFilterConfig() {
                return filterConfig(this.currentLanguage, this.comparisonPlotFilters)
            },
            barchartFlattenedXAxisFilterOptionIds() {
                return flattenXAxisFilterOptionIds(this.barchartSelections, this.barchartFilters)
            },
            comparisonPlotFlattenedXAxisFilterOptionIds() {
                return flattenXAxisFilterOptionIds(this.comparisonPlotSelections, this.comparisonPlotFilters)
            },
            noChartData() {
                return i18next.t("noChartData", this.currentLanguage)
            },
        },
        methods: {
            ...mapMutationsByNames("plottingSelections",
                ["updateComparisonPlotSelections", "updateOutputColourScales", "updateOutputBubbleSizeScales"] as const),
            tabSelected: mapActionByName<keyof Methods>("modelOutput", "updateSelectedTab"),
            updateBarchartSelections: mapActionByName<BarchartSelections>("plottingSelections", "updateBarchartSelections"),
            updateOutputChoroplethSelections: mapActionByName<ChoroplethSelections>("plottingSelections", "updateChoroplethSelections"),
            updateBubblePlotSelections: mapActionByName<BubblePlotSelections>("plottingSelections", "updateBubblePlotSelections"),
            formatBarchartValue: (value: string | number, indicator: BarchartIndicator) => {
                return formatOutput(value, indicator.format, indicator.scale, indicator.accuracy).toString();
            },
            updateBarchartSelectionsAndXAxisOrder(data: BarchartSelections) {
                updateSelectionsAndXAxisOrder(data, this.barchartSelections, this.barchartFlattenedXAxisFilterOptionIds, this.updateBarchartSelections)
            },
            updateComparisonPlotSelectionsAndXAxisOrder(data: BarchartSelections) {
                if (data.indicatorId && data.indicatorId !== this.comparisonPlotSelections.indicatorId) {
                    const selections = this.comparisonPlotDefaultSelections
                        .find((selection: UnadjustedBarchartSelections) => selection.indicator_id === data.indicatorId)

                    if (selections) {
                        const comparisonSelections = {
                            indicatorId: selections.indicator_id,
                            xAxisId: selections.x_axis_id,
                            disaggregateById: selections.disaggregate_by_id,
                            selectedFilterOptions: selections.selected_filter_options
                        }
                        this.updateComparisonPlotSelections({payload: comparisonSelections})
                    }

                } else {
                    updateSelectionsAndXAxisOrder(
                        data,
                        this.comparisonPlotSelections,
                        this.comparisonPlotFlattenedXAxisFilterOptionIds,
                        this.updateComparisonPlotSelections)
                }
            },
            prepareOutputDownloads: mapActionByName("downloadResults", "prepareOutputs")
        },
        mounted() {
            this.prepareOutputDownloads();
        },
        components: {
            BarChartWithFilters,
            BubblePlot,
            Choropleth,
            AreaIndicatorsTable,
            ErrorAlert,
            OutputTable,
            LoadingTab
        }
    })
</script>
