<template>
    <div>
        <ul class="nav nav-tabs">
            <li v-for="plotName of plotNames" :key="plotName">
                <a class="nav-link"
                   :class="selectedPlot === plotName ? 'active': ''"
                   v-translate="plotName"
                   @click="switchTab(plotName)"></a>
            </li>
        </ul>
        <div class="row">
            <div class="mt-2 col-md-3">
                <plot-control-set/>
                <h4 v-translate="'filters'"/>
                <filter-set/>
            </div>
            <choropleth class="col-md-9" v-if="selectedPlot === 'choropleth'"/>
            <bubble class="col-md-9" v-if="selectedPlot === 'bubble'"/>
            <barchart class="col-md-9" v-if="selectedPlot === 'barchart'"
                :show-error-bars="false"/>
        </div>
    </div>
</template>

<script lang="ts">
import {computed, defineComponent} from "vue";
import FilterSet from "../plots/FilterSet.vue";
import PlotControlSet from "../plots/PlotControlSet.vue";
import {PlotName, plotNames} from "../../store/plotSelections/plotSelections";
import {useStore} from "vuex";
import {RootState} from "../../root";
import { ModelOutputMutation } from "../../store/modelOutput/mutations";
import Choropleth from "../plots/choropleth/Choropleth.vue";
import Bubble from "../plots/bubble/Bubble.vue";
import Barchart from "../plots/bar/Barchart.vue";

export default defineComponent({

    setup() {
        const store = useStore<RootState>();
        const selectedPlot = computed(() => store.state.modelOutput.selectedTab);
        const switchTab = (plotName: PlotName) => store.commit(`modelOutput/${ModelOutputMutation.TabSelected}`, {payload: plotName});
        return {
            plotNames,
            selectedPlot,
            switchTab,
        }
    },

    components: {
        Barchart,
        Choropleth,
        Bubble,
        FilterSet,
        PlotControlSet
    }
})
</script>
