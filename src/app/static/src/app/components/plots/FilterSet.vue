<template>

    <div class="form-group" v-for="f of filters" :key="f.stateFilterId">
        <label class="font-weight-bold">{{f.label}}</label>
        <!-- For some reason using filter is saying no component registered
        with this name, no idea why so using capital Filter -->
        <Filter :state-filter-id="f.stateFilterId"/>
    </div>

</template>

<script lang="ts">
import {computed, defineComponent} from 'vue';
import {useStore} from "vuex";
import {RootState} from "../../root";
import Filter from "./Filter.vue";
import {PlotName} from "../../store/plotSelections/plotSelections";

export default defineComponent({
    components: {
        Filter
    },
    setup() {
        const store = useStore<RootState>();
        const filters = computed(() => {
            const plotName: PlotName = store.state.modelOutput.selectedTab
            return store.state.plotSelections[plotName].filters;
        });

        return {
            filters
        }
    }
})

</script>
