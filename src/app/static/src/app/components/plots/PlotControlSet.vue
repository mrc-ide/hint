<template>

    <div class="form-group" v-for="control of plotControls" :key="control.id">
        <label class="font-weight-bold">{{control.label}}</label>
        <plot-control :plot-control-id="control.id" :plot="plot"/>
    </div>
    <hr v-if="plotControls.length > 0" class="mt-1 mb-2"/>

</template>

<script lang="ts">
import {PropType, computed, defineComponent} from 'vue';
import {useStore} from "vuex";
import {RootState} from "../../root";
import PlotControl from "./PlotControl.vue";
import {PlotName} from "../../store/plotSelections/plotSelections";

export default defineComponent({
    components: {
        PlotControl
    },
    props: {
        plot: {
            type: String as PropType<PlotName>,
            required: true
        }
    },
    setup(props) {
        const store = useStore<RootState>();
        const plotControls = computed(() => {
            return store.state.plotSelections[props.plot].controls;
        });

        return {
            plotControls
        }
    }
})

</script>
