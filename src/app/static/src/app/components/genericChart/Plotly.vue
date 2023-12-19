<template>
    <div>
        <div v-if="rendering" class="text-center mt-4" style="position: absolute; top: 0; width: 100%;">
            <loading-spinner size="lg"></loading-spinner>
            <h2 id="loading-message" v-translate="'loadingChart'"></h2>
        </div>
        <div id="chart" ref="chart" :style="style"></div>
    </div>
</template>

<script lang="ts">
    import Plotly from "plotly.js-basic-dist";
    import LoadingSpinner from "../LoadingSpinner.vue";
    import { PropType, defineComponent } from "vue";
    import { Dict } from "../../types";
    import { PlotColours } from "./utils"
    import i18next from "i18next";
    import {mapStateProp} from "../../utils";
    import {RootState} from "../../root";
    import {Language} from "../../store/translations/locales";
    import {InputTimeSeriesRow, InputTimeSeriesData} from "../../generated";

    const config = {
        responsive: false,
        scrollZoom: false,
        modeBarButtonsToRemove: [
            'zoom2d',
            'pan2d',
            'select2d',
            'lasso2d',
            'autoScale2d',
            'resetScale2d',
            'zoomIn2d',
            'zoomOut2d'
        ]
    };

    type ChartData = { data: InputTimeSeriesData } | null

    type Subplots = {
        columns: number,
        distinctColumn?: string,
        heightPerRow?: number,
        rows: number,
        subplotsPerPage?: number
    }

    type LayoutData = {
        subplots: Subplots,
        yAxisFormat: string
    }

    export default defineComponent({
        name: "Plotly",
        props: {
            chartData: {
                type: Object as PropType<ChartData>,
                required: true
            },
            layoutData: {
                type: Object as PropType<LayoutData>,
                required: true
            }
        },
        components: {
            LoadingSpinner
        },
        data: function() {
            return {
                rendering: false,
                layoutRequired: false
            };
        },
        computed: {
            style() {
                return {
                    width:'100%',
                    height: '100%',
                    visibility: this.rendering ? 'hidden' : 'visible'
                } as any;
            },
            currentLanguage: mapStateProp<RootState, Language>(null,
                (state: RootState) => state.language)
        },
        methods: {
            translate(word: string, args: any = null) {
                return i18next.t(word, {...args, lng: this.currentLanguage})
            },
            drawChart: async function() {
                this.rendering = true;
                const el = this.$refs.chart;
                const drawFunc = this.layoutRequired ? Plotly.newPlot : Plotly.react;
                this.layoutRequired = false;
                const drawData = await this.getData()
                await drawFunc(el as HTMLElement, drawData.data, drawData.layout, {...config as any});
                this.rendering = false;
            },
            getTooltipTemplate: function(plotData: (InputTimeSeriesRow | null)[], areaHierarchy: string) {
                const hierarchyText = areaHierarchy ? "<br>" + areaHierarchy : "";
                const tooltip = "%{x}, %{y}" + hierarchyText;
                return plotData.map((entry: InputTimeSeriesRow | null) => {
                    let missingIdsText = "";
                    if (entry?.missing_ids?.length) {
                        // If the area ID matches the missing_id then this is a synthetic value we have appended
                        // rather than an aggregate with some missing data. Show this with a slightly different
                        // message
                        if (entry.missing_ids.length == 1 && entry.missing_ids[0] == entry.area_id) {
                            missingIdsText = "<br>" + this.translate("timeSeriesMissingValue")
                        } else {
                            missingIdsText = "<br>" + this.translate("timeSeriesMissingAggregate",
                                {count: entry.missing_ids.length});
                        }
                    }
                    // Empty <extra></extra> tag removes the part of the hover where trace name is displayed in
                    // contrasting colour. See https://plotly.com/python/hover-text-and-formatting/
                    return tooltip + missingIdsText + "<extra></extra>";
                })
            },
            getScatterPoints: function(plotData: (InputTimeSeriesRow | null)[], areaName: string, areaHierarchy: string,
                                       index: number, baseColour: string, missingColour: string) {
                const hoverTemplate = this.getTooltipTemplate(plotData, areaHierarchy);
                const points: any = {
                    name: areaName,
                    showlegend: false,
                    x: plotData.map(x => x?.time_period),
                    y: plotData.map(x => x?.value ),
                    xaxis: `x${index+1}`,
                    yaxis: `y${index+1}`,
                    type: "scatter",
                    marker: {
                        color: plotData.map(x => x?.missing_ids?.length ? missingColour : baseColour),
                        line: {
                            width: 0.5,
                            color: baseColour
                        },
                    },
                    line: {
                        color: baseColour
                    },
                    hovertemplate: hoverTemplate
                }
                return points
            },
            getData: async function() {
                if (!this.chartData) {
                    return {data: [], layout: {}}
                }
                const dataByArea: Record<string, InputTimeSeriesData> = {};
                this.chartData.data.forEach(dataPoint => {
                    const areaId = dataPoint.area_id;
                    if (areaId in dataByArea) {
                        dataByArea[areaId].push(dataPoint);
                    } else {
                        dataByArea[areaId] = [dataPoint];
                    }
                })
                const areaIds = Object.keys(dataByArea);

                const numOfRows = this.layoutData?.subplots?.rows || 1;
                const subPlotHeight = 1/numOfRows * 0.6;
                const timePeriods = this.chartData.data.map(dataPoint => dataPoint.time_period).sort() || [];
                const firstXAxisVal = timePeriods[0];
                const lastXAxisVal = timePeriods[timePeriods.length - 1];

                const data: any = [];
                areaIds.forEach((id, index) => {
                    const areaData: InputTimeSeriesData = dataByArea[id];

                    const highlightedLineIndexes: boolean[] = [];
                    for (let i = 1; i < areaData.length; i++) {
                        const thisVal = areaData[i].value;
                        const prevVal = areaData[i - 1].value;

                        // Using != to check for null and undefined
                        const isHighlighted = !!((thisVal != null && prevVal != null && thisVal > 0)
                        && (thisVal > 1.25 * prevVal || thisVal < 0.75 * prevVal));

                        highlightedLineIndexes.push(isHighlighted);
                    }

                    const highlightsRequired = highlightedLineIndexes.some(v => v);

                    let highlight: (InputTimeSeriesRow | null)[] = [];
                    if (highlightsRequired) {
                        const interpolateIndexes: boolean[] = [];
                        for (let i = 0; i < highlightedLineIndexes.length - 1; i++) {
                            const interpolate = !!((i > 0)
                            && (highlightedLineIndexes[i - 1] && !highlightedLineIndexes[i] && highlightedLineIndexes[i + 1]))
                            interpolateIndexes.push(interpolate)
                        }

                        for (let i = 0; i < areaData.length; i++) {
                            const isHighlighted = (i === 0 && highlightedLineIndexes[0])
                            || (i === highlightedLineIndexes.length && highlightedLineIndexes[i - 1])
                            || (i > 0 && i < highlightedLineIndexes.length && (highlightedLineIndexes[i - 1] || highlightedLineIndexes[i]));

                            const dataPoint = isHighlighted ? areaData[i] : null;
                            highlight.push(dataPoint);
                            if (interpolateIndexes[i]) {
                                highlight.push(null);
                            }
                        }
                    }

                    const areaHierarchy = dataByArea[id][0].area_hierarchy;

                    const normalColorPoints = this.getScatterPoints(dataByArea[id], dataByArea[id][0].area_name,
                        areaHierarchy, index, PlotColours.DEFAULT, PlotColours.MISSING);
                    const highlightedPoints = this.getScatterPoints(highlight, dataByArea[id][0].area_name,
                        areaHierarchy, index, PlotColours.LARGE_CHANGE, PlotColours.LARGE_CHANGE_MISSING);

                    data.push(normalColorPoints);
                    data.push(highlightedPoints);
                });

                const baseLayout: Dict<any> = {
                    "margin": {"t": 32},
                    "dragmode": false,
                    "grid": {
                        "columns": this.layoutData.subplots.columns,
                        "rows": this.layoutData.subplots.rows,
                        "pattern": 'independent'
                    },
                    "annotations": areaIds.map((id, index) => {
                        return {
                            "text": dataByArea[id][0].area_name + " (" + id + ")",
                            "textfont": {},
                            "showarrow": false,
                            "x": 0.5,
                            "xanchor": "middle",
                            "xref": "x" + `${index+1}` + " domain",
                            "y": 1.1,
                            "yanchor": "middle",
                            "yref": "y" + `${index+1}` + " domain"
                        }
                    })
                };

                for (let i = 0; i < areaIds.length; i++) {
                    const row = Math.floor(i/this.layoutData.subplots.columns);
                    const maxOfData = Math.max(...dataByArea[areaIds[i]].map(d => d.value || 0));
                    baseLayout[`yaxis${i + 1}`] = {
                        "zeroline": false,
                        "tickformat": this.layoutData.yAxisFormat,
                        "tickfont": {
                            "color": "grey"
                        },
                        "domain": [
                            1 - (row/this.layoutData.subplots.rows),
                            1 - ((row/this.layoutData.subplots.rows) + subPlotHeight)
                        ],
                        "range": [-maxOfData * 0.1, maxOfData * 1.1],
                        "type": "linear"
                    };
                    baseLayout[`xaxis${i + 1}`] = {
                        "zeroline": false,
                        "tickvals": [firstXAxisVal, lastXAxisVal],
                        "tickfont": {
                            "color": "grey"
                        },
                        "autorange": true,
                        "type": "category"
                    };
                }

                return { data, layout: baseLayout }
            }
        },
        async mounted() {
            await this.drawChart();
        },
        watch: {
            chartData: {
                handler: async function() {
                    await this.drawChart();
                },
                deep: true
            },
            layoutData: function(newVal, oldVal) {
                if (oldVal?.subplots && newVal?.subplots && oldVal.subplots.rows != newVal.subplots.rows) {
                    this.layoutRequired = true;
                }
            }
        }
    });
</script>
