<template>
    <div>
        <Bar :data="chartData" :options="chartOptions"/>
<!--        <div v-if="showNoDataMessage" id="noDataMessage" class="px-3 py-2 noDataMessage">-->
<!--            <span class="lead">-->
<!--                <strong>{{ noDataMessage }}</strong>-->
<!--            </span>-->
<!--        </div>-->
    </div>
</template>

<script lang="ts">
import {Bar} from 'vue-chartjs';
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js';
import annotationPlugin from "chartjs-plugin-annotation";
import {useStore} from "vuex";
import {RootState} from "../../../root";
import {computed, defineComponent, onMounted, ref, watch} from "vue";
import {PlotData} from "../../../store/plotData/plotData";
import {
    plotDataToChartData,
    BarChartData,
    getErrorLineAnnotations,
    buildTooltipCallback
} from "./utils";
import {formatOutput} from "../utils";
import {FilterOption} from "../../../generated";
ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, annotationPlugin);

export default defineComponent({
    props: {
        showErrorBars: {
            type: Boolean,
            required: false,
            default: false
        }
    },
    setup(props) {
        const store = useStore<RootState>();

        const indicatorMetadata = store.getters["modelCalibrate/barchartIndicatorMetadata"];
        const areaIdToLevelMap = store.getters["baseline/areaIdToLevelMap"];
        const controlSelectionFromId = store.getters["plotSelections/controlSelectionFromId"];
        const filterSelectionFromId = store.getters["plotSelections/filterSelectionFromId"];
        const filterIdToColumnId = store.getters["modelCalibrate/filterIdToColumnId"];

        const plotData = computed<PlotData>(() => store.state.plotData.barchart);
        const chartData = ref<BarChartData>({datasets:[], labels: [], maxValuePlusError: 0});
        const disaggregateBy = ref<FilterOption | null>(null);
        const xAxis = ref<FilterOption | null>(null);
        const disaggregateId = ref<string | null>(null);
        const xAxisId = ref<string | null>(null);
        const areaLevel = ref<string | undefined | null>(null);
        const disaggregateSelections = ref<FilterOption[]>([]);
        const xAxisSelections = ref<FilterOption[]>([]);
        const updateChart = () => {
            console.log("updating chart")
            console.log("features", store.state.baseline.shape?.data?.features)
            console.log("plotdata", plotData.value)
            disaggregateBy.value = controlSelectionFromId("barchart", "disagg_by");
            xAxis.value = controlSelectionFromId("barchart", "x_axis");
            console.log("xaxis is ", xAxis.value)
            if (!disaggregateBy.value || !xAxis.value) {
                return
            }
            disaggregateId.value = filterIdToColumnId(disaggregateBy.value.id)
            xAxisId.value = filterIdToColumnId(xAxis.value.id)
            areaLevel.value = store.state.plotSelections.barchart.filters.find(f => f.filterId == "detail")?.selection[0]?.id
            disaggregateSelections.value = filterSelectionFromId("barchart", disaggregateBy.value.id)
            xAxisSelections.value = filterSelectionFromId("barchart", xAxis.value.id)
            console.log("filter types", store.state.modelCalibrate.metadata!.filterTypes)
            console.log("xaxjs jd", xAxisId.value)
            const xAxisOptions = store.state.modelCalibrate.metadata!.filterTypes.find(f => f.id === xAxis.value!.id)!.options
            if (disaggregateId.value && xAxisId.value && areaLevel.value && plotData.value) {
                console.log("disaggregate selections", disaggregateSelections.value)
                console.log("xaxis ID", xAxisId.value)
                console.log("xaxis selections", xAxisSelections.value)
                chartData.value = plotDataToChartData(plotData.value, indicatorMetadata,
                        disaggregateId.value, disaggregateSelections.value,
                        xAxisId.value, xAxisSelections.value, xAxisOptions,
                        areaLevel.value, areaIdToLevelMap);
            }
        }
        const filterSelections = computed(() => {
            console.log("found new filters", store.state.plotSelections.barchart.filters)
            return store.state.plotSelections.barchart.filters
        })
        watch(filterSelections, updateChart, {onTrigger: event => console.log(event)})

        onMounted(() => {
            updateChart()
        });

        const chartOptions = computed(() => {

            const baseChartOptions = {
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: buildTooltipCallback(indicatorMetadata, props.showErrorBars)
                        }
                    }
                },
                responsive: true,
                maintainAspectRatio: false
            }

            if (props.showErrorBars) {

                const errorLines = getErrorLineAnnotations(chartData.value);

                return {
                    ...baseChartOptions,
                    plugins: {
                        ...baseChartOptions.plugins,
                        annotation: {
                            annotations: errorLines
                        },
                        // legend: {
                        //     onClick: this.customLegendClick
                        // }
                    },
                    scales: {
                        y: {
                            max: chartData.value.maxValuePlusError * 1.1,
                            ticks: {
                                callback: ((value: number | string) => {
                                    return value == chartData.value.maxValuePlusError * 1.1 ? "" :
                                        formatOutput(value,
                                            indicatorMetadata.value.format,
                                            indicatorMetadata.value.scale,
                                            indicatorMetadata.value.accuracy)
                                })
                            }
                        }
                    },
                    // animation: {
                    //     onComplete: this.showAllErrorBars
                    // }
                }
            } else {
                return baseChartOptions
            }
        });

        return {
            chartData,
            chartOptions
        }
    },
    components: {
        Bar
    }
})
</script>
