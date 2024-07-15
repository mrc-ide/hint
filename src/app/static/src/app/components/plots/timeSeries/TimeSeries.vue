<template>
    <div class="col-9 time-series">
        <div :key="spaceNeededForPlots" class="chart-container" ref="chartContainer" style="height: 640px;">
            <plotly class="chart"
                    :chart-data="chartDataForPage"
                    :layout="layout"
                    :style="{ height: spaceNeededForPlots }"
                    :page-number="pageNumber"/>
        </div>
        <page-control v-if="totalPages > 1"
                      class="page-controls"
                      :page-number="pageNumber"
                      :total-pages="totalPages"
                      @back="pageNumber--"
                      @next="pageNumber++"/>
    </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref, watch } from 'vue';
import { useStore } from 'vuex';
import { RootState } from '../../../root';
import { InputPlotName } from '../../../store/plotSelections/plotSelections';
import { GenericChartColumnValue } from '../../../types';
import { numeralJsToD3format } from "./utils";
import Plotly from "./Plotly.vue";
import PageControl from './PageControl.vue';
import { InputTimeSeriesData } from '../../../generated';
import { InputTimeSeriesKey } from "../../../store/plotData/plotData";

const plot = "timeSeries" as InputPlotName;

export default defineComponent({
    components: {
        Plotly,
        PageControl
    },
    setup() {
        const store = useStore<RootState>();
        const pageNumber = ref<number>(0);
        watch(() => store.state.plotSelections[plot], () => pageNumber.value = 0)
        const chartMetadata = computed(() => {
            // TODO change metadata so it has key of timeSeries
            return store.state.genericChart.genericChartMetadata!["input-time-series"];
        });

        const valueFormat = computed(() => {
            const { valueFormatColumn } = chartMetadata.value;
            if (!valueFormatColumn) return "";
            const plotTypeFilter = store.state.plotSelections[plot].filters.find(f => f.stateFilterId === "plotType")!;
            const selectionId = plotTypeFilter.selection[0].id;
            const filterType = store.state.metadata.reviewInputMetadata!.filterTypes.find(ft => ft.id === plotTypeFilter.filterId)!;
            const { format } = filterType.options.find(op => op.id === selectionId) as GenericChartColumnValue;
            if (!format) return "";
            return numeralJsToD3format(format);
        });

        const chartData = computed(() => store.state.plotData[plot] as InputTimeSeriesData);

        const distinctPlots = computed(() => {
            if (!chartMetadata.value.subplots) return [];
            const { distinctColumn } = chartMetadata.value.subplots;
            return chartData.value.reduce((dp, data) => {
                // will be string as distinct plots are defined by area_id
                const value = data[distinctColumn as InputTimeSeriesKey] as string;
                return [...dp, ...dp.includes(value) ? [] : [value]];
            }, [] as string[]);
        });

        const totalPages = computed(() => {
            const { subplots } = chartMetadata.value;
            return subplots ? Math.ceil(distinctPlots.value.length / subplots.subplotsPerPage) : 1;
        });

        const visiblePlots = computed(() => {
            if (!chartMetadata.value.subplots) return [];
            const { subplotsPerPage } = chartMetadata.value.subplots;
            const startIndex = pageNumber.value * subplotsPerPage;
            const endIndex = (pageNumber.value + 1) * subplotsPerPage;
            return distinctPlots.value.slice(startIndex, endIndex);
        });

        const chartDataForPage = computed(() => {
            if (!chartMetadata.value.subplots) return chartData.value;
            const { distinctColumn } = chartMetadata.value.subplots;
            return chartData.value.reduce((vcd, data) => {
                const value = data[distinctColumn as InputTimeSeriesKey] as string;
                return [...vcd, ...visiblePlots.value.includes(value) ? [data] : []];
            }, [] as InputTimeSeriesData);
        })

        const rows = computed(() => {
            return chartMetadata.value.subplots ?
                Math.ceil(visiblePlots.value.length / chartMetadata.value.subplots.columns) :
                null;
        });

        const spaceNeededForPlots = computed(() => {
            return chartMetadata.value.subplots ?
                `${Math.min((chartMetadata.value.subplots.heightPerRow * rows.value!) + 70, 640)}px` :
                "100%";
        });

        const layout = computed(() => {
            return {
                yAxisFormat: valueFormat.value,
                ...chartMetadata.value.subplots ?
                    { subplots: {...chartMetadata.value.subplots, rows: rows.value} } :
                    {}
            };
        });

        return {
            chartDataForPage,
            layout,
            spaceNeededForPlots,
            pageNumber,
            totalPages
        }
    }
})
</script>

<style scoped>
.time-series {
    position: relative;
    margin-top: 0.75rem;
    padding: 0;
}

.chart-container {
    border: transparent;
    overflow-y: hidden;
}

.page-controls {
    position: absolute;
    bottom: 0;
    margin-bottom: 0;
    width: 100%;
    justify-content: center;
}
</style>
