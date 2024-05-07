<template>
    <div id="chart" ref="chart" style="width: 100%; height: 100%;"></div>
</template>

<script lang="ts">
import { PropType, computed, defineComponent, onMounted, ref, watch } from 'vue';
import { InputTimeSeriesData } from '../../../generated';
import { useStore } from 'vuex';
import { RootState } from '../../../root';
import { drawConfig, getScatterPointsFromAreaIds, Layout, getLayoutFromData } from "./utils";
import Plotly from "plotly.js-basic-dist";


export default defineComponent({
    props: {
        chartData: {
            type: Object as PropType<InputTimeSeriesData>,
            required: true
        },
        layout: {
            type: Object as PropType<Layout>,
            required: true
        },
        pageNumber: {
            type: Number,
            required: true
        }
    },
    setup(props) {
        const store = useStore<RootState>();
        const currentLanguage = computed(() => store.state.language);

        const getData = () => {
            if (!props.chartData) return { data: [], layout: {} };
            const dataByArea = props.chartData.reduce((obj, data) => {
                obj[data.area_id] = obj[data.area_id] || [];
                obj[data.area_id].push(data);
                return obj;
            }, {} as Record<string, InputTimeSeriesData>);
            const areaIds = Object.keys(dataByArea);
            const data = getScatterPointsFromAreaIds(areaIds, dataByArea, currentLanguage.value);
            const layout = getLayoutFromData(areaIds, dataByArea, props.layout, props.chartData);    
            return { data, layout };
        }

        const chart = ref<HTMLElement | null>(null);

        const drawChart = async () => {
            const drawData = getData();
            await Plotly.newPlot(chart.value!, drawData.data, drawData.layout, drawConfig as any);
        };

        onMounted(drawChart);
        watch(() => [store.state.plotSelections.timeSeries, props.pageNumber], drawChart);

        return {
            chart
        }
    }
});
</script>