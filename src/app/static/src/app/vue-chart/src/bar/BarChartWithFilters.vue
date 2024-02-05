<template>
    <div>
        <div v-if="initialised" class="row">
            <div class="col-md-3" :class="scaleToScreen ? 'fit-filter' : ''">
                <div id="indicator-fg" class="form-group">
                    <label class="font-weight-bold">{{filterConfig.indicatorLabel || "Indicator"}}</label>
                    <hint-tree-select :multiple=false
                                 :clearable="false"
                                 :options="indicators"
                                 v-model="indicatorId"
                                 :normalizer="normalizeIndicators"></hint-tree-select>
                </div>
                <div v-if="!xAxisIsFixed" id="x-axis-fg" class="form-group">
                    <label class="font-weight-bold">{{filterConfig.xAxisLabel || "X Axis"}}</label>
                    <hint-tree-select :multiple=false
                                 :clearable="false"
                                 :options="filterXaxisOptions"
                                 v-model="xAxisId"></hint-tree-select>
                </div>
                <div v-if="!disaggregateIsFixed" id="disagg-fg" class="form-group">
                    <label class="font-weight-bold">{{filterConfig.disaggLabel || "Disaggregate by"}}</label>
                    <hint-tree-select :multiple=false
                                 :clearable="false"
                                 :options="filterDisaggregateOptions"
                                 v-model="disaggregateById"></hint-tree-select>
                </div>
                <hr/>
                <h3 v-if="anyFiltersShown">{{filterConfig.filterLabel || "Filters"}}</h3>

                <template
                v-for="filter, index in filterConfig.filters"
                :key="index">
                <div v-if="filterIsShown(filter.id)">
                    <div :id="'filter-' + filter.id"
                    class="form-group">
                        <filter-select 
                        :value="getSelectedFilterOptions(filter.id)"
                        :is-disaggregate-by="filter.id === selections.disaggregateById"
                        :is-x-axis="filter.id === selections.xAxisId"
                        :label="filter.label"
                        :options="filter.options"
                        @update:filter-select="changeFilter(filter.id, $event)"></filter-select>
                    </div>
                </div>
            </template>
            </div>
            <div v-if="!!xAxisLabel" id="chart" class="col-md-9" :class="scaleToScreen ? 'fit-chart' : ''">
                <bar-chart-with-errors
                        :data="processedOutputData"
                        :chart-data="processedOutputData"
                        :xLabel="xAxisLabel"
                        :yLabel="indicatorLabel"
                        :yFormat="formatValueFunction"
                        :show-errors="showRangesInTooltips"
                        :show-error-bars="showErrorBars"
                        style="width: 100%; height: 100%;"></bar-chart-with-errors>
                <div v-if="showNoDataMessage" id="noDataMessage" class="px-3 py-2 noDataMessage">
                    <span class="lead">
                        <strong>{{ noDataMessage }}</strong>
                    </span>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
    import HintTreeSelect from "../../../components/HintTreeSelect.vue";
    import BarChartWithErrors from "./BarChartWithErrors.vue";
    import FilterSelect from "./FilterSelect.vue";
    import {AxisConfig, BarchartIndicator, BarchartSelections, Dict, Filter, FilterConfig, FilterOption} from "./types";
    import {getProcessedOutputData, toFilterLabelLookup} from "./utils";
    import { ComputedGetter, PropType, defineComponent } from "vue";

    interface Props {
        chartData: any[],
        filterConfig: FilterConfig,
        indicators: BarchartIndicator[],
        selections: BarchartSelections,
        formatFunction: (value: string | number, indicator: BarchartIndicator) => string,
        showRangesInTooltips?: boolean,
        xAxisConfig?: AxisConfig | null,
        disaggregateByConfig?: AxisConfig | null
        noDataMessage?: string | null
    }

    interface Methods {
        normalizeIndicators: (node: BarchartIndicator) => FilterOption,
        changeSelections: (newSelections: Partial<BarchartSelections>) => void,
        changeFilter: (filterId: any, selectedOptions: any) => void,
        getSelectedFilterOptions: (filterId: string) => FilterOption[],
        filterIsShown: (filterId: string) => boolean
    }

    interface Computed {
        indicatorId: {
            get: ComputedGetter<string>
            set: (newVal: string) => void
        },
        xAxisId: {
            get: ComputedGetter<string>
            set: (newVal: string) => void
        },
        disaggregateById: {
            get: ComputedGetter<string>
            set: (newVal: string) => void
        },
        xAxisLabel: ComputedGetter<string>
        indicatorLabel: ComputedGetter<string>
        filtersAsOptions: ComputedGetter<FilterOption[]>
        indicator: ComputedGetter<BarchartIndicator>
        processedOutputData: ComputedGetter<any>
        xAxisLabels: ComputedGetter<string[]>
        xAxisValues: ComputedGetter<string[]>
        xAxisLabelLookup: ComputedGetter<Dict<string>>
        barLabelLookup: ComputedGetter<Dict<string>>
        initialised: ComputedGetter<boolean>
        formatValueFunction: ComputedGetter<(value: string | number) => string>
        anyFiltersShown: ComputedGetter<boolean>
        showNoDataMessage: ComputedGetter<boolean>
        filterDisaggregateOptions: ComputedGetter<FilterOption[]>
        filterXaxisOptions: ComputedGetter<FilterOption[]>
        xAxisIsFixed: ComputedGetter<boolean | null>
        disaggregateIsFixed: ComputedGetter<boolean | null>
    }

    type ComputedExtends<T> = {
        [K in keyof T]: T[K]
    }

    export default defineComponent({
        name: "BarChart",
        props: {
            chartData: {
                type: Array as PropType<any[]>,
                required: true
            },
            filterConfig: {
                type: Object as PropType<FilterConfig>,
                required: true
            },
            indicators: {
                type: Array as PropType<BarchartIndicator[]>,
                required: true
            },
            selections: {
                type: Object as PropType<BarchartSelections>,
                required: true
            },
            formatFunction: {
                type: Function as PropType<(value: string | number, indicator: BarchartIndicator) => string>,
                required: true
            },
            xAxisConfig: {
                type: Object as PropType<AxisConfig | null>,
                required: false,
                default: null
            },
            disaggregateByConfig: {
                type: Object as PropType<AxisConfig | null>,
                required: false,
                default: null
            },
            showRangesInTooltips: {
                type: Boolean,
                required: false,
                default: false
            },
            noDataMessage: {
                type: String as PropType<string | null>,
                required: false,
                default: null
            },
            showErrorBars: {
                type: Boolean,
                required: false,
                default: false
            },
            scaleToScreen: {
                type: Boolean,
                required: false,
                default: false
            }
        },
        computed: {
            disaggregateIsFixed() {
                return this.disaggregateByConfig && this.disaggregateByConfig.fixed
            },
            xAxisIsFixed() {
                return this.xAxisConfig && this.xAxisConfig.fixed
            },
            indicatorId: {
                get() {
                    return this.selections.indicatorId;
                },
                set(value: string) {
                    this.changeSelections({indicatorId: value});
                }
            },
            xAxisId: {
                get() {
                    return this.selections.xAxisId;
                },
                set(value: string) {
                    this.changeSelections({xAxisId: value});
                }
            },
            disaggregateById: {
                get() {
                    return this.selections.disaggregateById;
                },
                set(value: string) {
                    this.changeSelections({disaggregateById: value});
                }
            },
            xAxisLabel() {
                const filter = this.filtersAsOptions.find((f: FilterOption) => f.id == this.selections.xAxisId);
                return filter ? filter.label : "";
            },
            indicatorLabel() {
                return this.indicator ? this.indicator.name : "";
            },
            xAxisLabels() {
                const options = this.selections.selectedFilterOptions[this.selections.xAxisId];
                return options ? options.map((o: FilterOption) => o.label) : [];
            },
            xAxisValues() {
                const options = this.selections.selectedFilterOptions[this.selections.xAxisId];
                return options ? options.map((o: FilterOption) => o.id) : [];
            },
            barLabelLookup() {
                return toFilterLabelLookup(this.selections.selectedFilterOptions[this.selections.disaggregateById] || []);
            },
            xAxisLabelLookup() {
                return toFilterLabelLookup(this.selections.selectedFilterOptions[this.selections.xAxisId] || []);
            },
            filtersAsOptions(): FilterOption[] {
                return this.filterConfig.filters.map((f: Filter) => ({id: f.id, label: f.label}))
            },
            filterXaxisOptions() {
                if (this.disaggregateIsFixed) {
                    return this.filtersAsOptions.filter((f: FilterOption) => f.id !== this.disaggregateById)
                }
                return this.filtersAsOptions
            },
            filterDisaggregateOptions() {
                if (this.xAxisIsFixed) {
                    return this.filtersAsOptions.filter((f: FilterOption) => f.id !== this.xAxisId)
                }
                return this.filtersAsOptions
            },
            processedOutputData() {
                return this.initialised ? getProcessedOutputData(
                    this.chartData,
                    this.selections.xAxisId,
                    this.selections.disaggregateById,
                    this.indicator,
                    this.filterConfig.filters,
                    this.selections.selectedFilterOptions,
                    this.barLabelLookup,
                    this.xAxisLabelLookup,
                    this.xAxisLabels,
                    this.xAxisValues) : null;
            },
            indicator() {
                return this.indicators.find((i: BarchartIndicator) => i.indicator == this.selections.indicatorId)!
            },
            formatValueFunction() {
                if (this.formatFunction) {
                    return (value: string | number) => this.formatFunction(value, this.indicator);
                } else {
                    return (value: string | number) => value.toString();
                }
            },
            initialised() {
                const unsetFilters = this.filterConfig.filters.filter((f: Filter) => !this.selections.selectedFilterOptions[f.id]);
                return !!this.selections.indicatorId && !!this.selections.xAxisId && !!this.selections.disaggregateById
                    && unsetFilters.length == 0;
            },
            anyFiltersShown() {
                return this.filterConfig.filters.some((f: Filter) => this.filterIsShown(f.id));
            },
            showNoDataMessage() {
                return this.noDataMessage && this.processedOutputData  && !this.processedOutputData?.datasets.length
            }
        },
        methods: {
            normalizeIndicators(node: BarchartIndicator) {
                return {id: node.indicator, label: node.name};
            },
            changeSelections(newSelections: Partial<BarchartSelections>) {
                this.$emit("update:selections", {...this.selections, ...newSelections});
            },
            changeFilter(filterId: any, selectedOptions: any) {
                const newSelectedFilterOptions = {...this.selections.selectedFilterOptions};
                newSelectedFilterOptions[filterId] = selectedOptions;
                this.changeSelections({...this.selections, selectedFilterOptions: newSelectedFilterOptions});
            },
            getSelectedFilterOptions(filterId: string) {
                return (this.selections.selectedFilterOptions[filterId]) || [];
            },
            filterIsShown(filterId: string) {
                const filterHiddenForConfig = (config: AxisConfig | null, relevantFilterId: string) => {
                    return (filterId === relevantFilterId) && config && config.hideFilter;
                };
                return !filterHiddenForConfig(this.xAxisConfig, this.xAxisId) &&
                    !filterHiddenForConfig(this.disaggregateByConfig, this.disaggregateById);
            }
        },
        beforeMount() {
            //If selections have not been initialised, refresh them, and emit changed events
            if (!this.selections.indicatorId) {
                this.indicatorId = this.indicators[0].indicator;
            }

            if (!this.selections.xAxisId) {
                this.xAxisId = this.filterConfig.filters[0].id;
            }

            if (!this.selections.disaggregateById) {
                this.disaggregateById = this.filterConfig.filters[1].id;
            }

            if (Object.keys(this.selections.selectedFilterOptions).length < 1) {
                const defaultSelected = this.filterConfig.filters.reduce((obj: any, current: Filter) => {
                    obj[current.id] = [current.options[0]];
                    return obj;
                }, {} as Dict<FilterOption[]>);
                this.changeSelections({selectedFilterOptions: defaultSelected});
            }
        },
        components: {
            BarChartWithErrors,
            HintTreeSelect,
            FilterSelect
        }
    });
</script>

<style scoped>
.fit-filter {
    height: fit-content;
}

.fit-chart {
    height: min(850px, 85vh);
}
</style>
