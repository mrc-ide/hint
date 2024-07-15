<template>
    <div class="form-group" v-for="f of filters" :key="f.stateFilterId">
        <div v-if="!f.hidden">
            <label class="font-weight-bold">{{f.label}}</label>
            <!-- For some reason using filter is saying no component registered
            with this name, no idea why so using capital Filter -->
            <Filter :state-filter-id="f.stateFilterId" :plot="plot"/>
        </div>
    </div>
</template>

<script lang="ts">
import {PropType, computed, defineComponent} from 'vue';
import {useStore} from "vuex";
import {RootState} from "../../root";
import Filter from "./Filter.vue";
import {PlotName} from "../../store/plotSelections/plotSelections";

export default defineComponent({
    components: {
        Filter
    },
    props: {
        plot:{
            type: String as PropType<PlotName>,
            required: true
        }
    },
    setup(props) {
        const store = useStore<RootState>();
        const filters = computed(() => {
            return store.state.plotSelections[props.plot].filters;
        });

        return {
            filters
        }
    }
})

</script>
