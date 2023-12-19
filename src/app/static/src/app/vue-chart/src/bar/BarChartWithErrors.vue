<template>
    <Bar :data="(chartData as any)" :options="chartOptions"/>
</template>

<script lang="ts">
import {Bar} from 'vue-chartjs';
import {BarChartData} from "./utils";
import { ChartDataSetsWithErrors } from "./types";
import { PropType, defineComponent, shallowReadonly } from 'vue';
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js';
import annotationPlugin from "chartjs-plugin-annotation";
ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, annotationPlugin);

// amount of padding chart js uses by default for each bar 
const barPercentage = 0.8;
const errorBarWeight = 1;

export default defineComponent({
    components: {
        Bar
    },
    data() {
        const showLabelErrorBars = this.chartData.datasets!.map(() => true);
        return {
            displayErrorBars: true,
            errorBarTimeout: null as any,
            showLabelErrorBars
        }
    },
    props: {
        chartData: {
            type: Object as PropType<BarChartData>,
            required: true
        },
        xLabel: {
            type: String,
            required: true
        },
        yLabel: {
            type: String,
            required: true
        },
        yFormat: {
            type: Function as PropType<(value: number | string) => string>,
            required: true
        },
        showErrors: {
            type: Boolean,
            required: true
        },
        showErrorBars: {
            type: Boolean,
            required: false,
            default: false
        }
    },
    computed: {
        chartDatasetLabels() {
            return JSON.stringify(this.chartData.datasets.map(x => x.label))
        },
        chartOptions() {
            const formatCallback = this.yFormat || ((value: number | string) => value);
            const chartData = this.chartData as any;
            const datasets = chartData.datasets as any[];

            const baseChartOptions = {
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: (context: any) => {
                                const {
                                    datasetIndex,
                                    dataset,
                                    raw: yLabel,
                                    label: xLabel
                                } = context;
                                let label = ((typeof datasetIndex !== "undefined") && dataset && dataset.label)
                                                || '';
                                if (label) {
                                    label += ': ';
                                }
    
                                if (yLabel) {
                                    label += formatCallback(yLabel);
                                }
    
                                let minus = null
                                let plus = null
    
                                if (this.showErrors && xLabel && typeof datasetIndex !== "undefined" && dataset) {
                                    const errorBars = (dataset as ChartDataSetsWithErrors).errorBars
                                    const xLabelErrorBars = errorBars ? errorBars[xLabel] : null
                                    if (xLabelErrorBars) {
                                        minus = xLabelErrorBars.minus
                                        plus = xLabelErrorBars.plus
                                    }
                                }
    
                                if ((typeof minus === "number") && (typeof plus === "number")) {
                                    label = `${label} (${formatCallback(minus)} - ${formatCallback(plus)})`
                                }
    
                                return label;
                            }
                        }
                    }
                },
                responsive: true,
                maintainAspectRatio: false
            }

            if (this.showErrorBars) {
                const errorLines = [] as any[];

                // the errorBars need to coordinate with what bar charts are visible
                // in chart js (users can click legend to hide certain bars)
                const visibleDatasetIndices = this.showLabelErrorBars.reduce(
                    (out: number[], bool: boolean, index: number) => bool ? out.concat(index) : out, 
                    []
                );

                const numOfDatasets = this.showLabelErrorBars.filter(x => x).length;
                const numOfLabels = chartData.labels.length;
                const numOfBars = numOfDatasets * numOfLabels;

                const halfBarWidth = barPercentage/(numOfDatasets * 2);

                visibleDatasetIndices.forEach((datasetId, indexDataset) => {
                    const dataset = datasets[datasetId];
                    if (!dataset) {
                        return
                    }
                    const errorBarData = dataset.errorBars;
                    const label = dataset.label;
                    Object.keys(errorBarData).forEach((xLabel) => {
                        const labelIndex = chartData.labels.indexOf(xLabel)
                        const barMidPoint = labelIndex + halfBarWidth * (indexDataset * 2 + 1) - barPercentage/2;

                        /*
                            This is the width of the horizontal bits on top and bottom of the error
                            bars. This formula address the problem of error bars being too wide
                            when there is only one or two bars on the chart. If we just set it to
                            a constant halfBarWidth * 0.3 then it is too big when there are a few
                            wide bars on the screen.

                            So when there are a few wide bars, numOfBars/(numOfBars + 10) is small
                            which solves our problem. When there are a lot of thin bars
                            numOfBars/(numOfBars + 10) is closer to 1 so we don't get very small
                            error bar widths
                        */
                        const errorBarWidth = (numOfBars/(numOfBars + 10)) * halfBarWidth * 0.3;

                        if (errorBarData[xLabel].minus && errorBarData[xLabel].plus) {
                            errorLines.push(this.getErrorLineConfig(
                                label,
                                barMidPoint,
                                barMidPoint,
                                errorBarData[xLabel].minus,
                                errorBarData[xLabel].plus,
                            ));
                            errorLines.push(this.getErrorLineConfig(
                                label,
                                barMidPoint - errorBarWidth,
                                barMidPoint + errorBarWidth,
                                errorBarData[xLabel].plus,
                                errorBarData[xLabel].plus,
                            ));
                            errorLines.push(this.getErrorLineConfig(
                                label,
                                barMidPoint - errorBarWidth,
                                barMidPoint + errorBarWidth,
                                errorBarData[xLabel].minus,
                                errorBarData[xLabel].minus,
                            ));
                        }
                    })
                });

                return {
                    ...baseChartOptions,
                    plugins: {
                        ...baseChartOptions.plugins,
                        annotation: {
                            annotations: errorLines
                        },
                        legend: {
                            onClick: this.customLegendClick
                        }
                    },
                    scales: {
                        y: {
                            max: this.chartData.maxValuePlusError * 1.1,
                            ticks: {
                                callback: ((value: number | string) => {
                                    return value == this.chartData.maxValuePlusError * 1.1 ? "" : formatCallback(value)
                                })
                            }
                        }
                    },
                    animation: {
                        onComplete: this.showAllErrorBars
                    }
                }
            } else {
                return baseChartOptions
            }
        }
    },
    methods: {
        hideAllErrorBars() {
            this.displayErrorBars = false;
        },
        showAllErrorBars() {
            this.displayErrorBars = true;
        },
        /*
            We need to pass a customLegendClick event into chartOptions so
            that our state can update when a user clicks on the legend and
            hides some bars. This is required to coordinate the chart with
            the error bars.
        */
        customLegendClick(e: Event, legendItem: any, legend: any) {
            const index = legendItem.datasetIndex;
            const ci = legend.chart;
            const isDatasetVisible = ci.isDatasetVisible(index);
            this.showLabelErrorBars[index] = !isDatasetVisible;
            legendItem.hidden = isDatasetVisible;
            if (isDatasetVisible) {
                setTimeout(() => {
                    ci.hide(index);
                }, 50);
            } else {
                setTimeout(() => {
                    ci.show(index);
                }, 50);
            }
        },
        getErrorLineConfig(
            label: string,
            xMin: number,
            xMax: number,
            yMin: number,
            yMax: number
        ) {
            return {
                borderColor: "#585858",
                drawTime: "afterDatasetsDraw",
                type: "line",
                label: {
                    content: label
                },
                display: this.displayErrorBars,
                xMin,
                xMax,
                yMin,
                yMax,
                borderWidth: errorBarWeight
            }
        }
    },
    mounted() {
        this.hideAllErrorBars()
    },
    watch: {
        chartData: {
            handler: function(newVal, oldVal) {
                this.hideAllErrorBars()
            },
            deep: true
        },
        chartDatasetLabels: {
            handler: function(newVal, oldVal) {
                this.showLabelErrorBars = this.chartData.datasets!.map(() => true)
            }
        },
        showLabelErrorBars: {
            handler: function(newVal, oldVal) {
                this.hideAllErrorBars()
            },
            deep: true
        }        
    }
})
</script>
