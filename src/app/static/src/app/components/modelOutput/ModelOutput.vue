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
        <div class="mt-2">
            <plot-control-set/>
            <h4 v-translate="'filters'"/>
            <filter-set/>
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

export default defineComponent({

    setup() {
        const store = useStore<RootState>();
        const selectedPlot = computed(() => store.state.modelOutput.selectedTab);
        const switchTab = (plotName: PlotName) => store.commit(`modelOutput/${ModelOutputMutation.TabSelected}`, {payload: plotName})
        return {
            plotNames,
            selectedPlot,
            switchTab
        }
    },

    components: {
        FilterSet,
        PlotControlSet
    }
})
</script>
