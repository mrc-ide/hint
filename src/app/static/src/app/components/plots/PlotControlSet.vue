<template>

    <div class="form-group" v-for="control of plotControls" :key="control.id">
        <label class="font-weight-bold">{{control.label}}</label>
        <plot-control :plot-control-id="control.id"/>
    </div>
    <hr v-if="plotControls.length > 0" class="mt-1 mb-2"/>

</template>

<script lang="ts">
import {computed, defineComponent} from 'vue';
import {useStore} from "vuex";
import {RootState} from "../../root";
import PlotControl from "./PlotControl.vue";
import {PlotName} from "../../store/plotSelections/plotSelections";

export default defineComponent({
    setup() {
        const store = useStore<RootState>();
        const plotControls = computed(() => {
            const plotName: PlotName = store.state.modelOutput.selectedTab
            return store.state.plotSelections[plotName].controls;
        });

        return {
            plotControls
        }
    },

    components: {
        PlotControl
    }
})

</script>
