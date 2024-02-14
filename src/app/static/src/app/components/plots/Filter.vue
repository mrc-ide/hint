<template>

    <multi-select v-if="multiple"
                  :options="options"
                  :model-value="selected"
                  :placeholder="placeholder"
                  @update:model-value="updateSelection"/>
    <single-select v-else
                   :options="options"
                   :model-value="selected[0]"
                   :placeholder="placeholder"
                   @update:model-value="updateSelection"/>

</template>

<script lang="ts">
import { SingleSelect, MultiSelect } from "@reside-ic/vue-nested-multiselect";
import {computed, defineComponent} from 'vue';
import i18next from "i18next";
import { useStore } from "vuex";
import { RootState } from "../../root";
import { FilterOption } from "../../generated";
import { PlotName } from "../../store/plotSelections/plotSelections";

export default defineComponent({
    props: {
        stateFilterId: String,
    },
    setup(props) {
        const store = useStore<RootState>();

        const filter = computed(() => {
            const plotName: PlotName = store.state.modelOutput.selectedTab;
            return store.state.plotSelections[plotName].filters.find(f => f.stateFilterId === props.stateFilterId)!;
        })

        const options = computed(() => {
            return store.state.modelCalibrate.metadata!.filterTypes.find(f => f.id === filter.value.filterId)!.options
        });

        const selected = computed(() => {
            return filter.value.selection.map((s: FilterOption) => s.id);
        });

        const updateSelection = (newSelection: FilterOption | FilterOption[]) => {
            // TODO: dispatch event and update the selectedOptions in state
            console.log("Dispatching action to update selection in state " + JSON.stringify(newSelection));
        };

        const placeholder = computed(() => {
            return i18next.t("select", store.state.language);
        });

        return {
            multiple: filter.value.multiple,
            options,
            selected,
            updateSelection,
            placeholder
        }
    },

    components: {
        SingleSelect,
        MultiSelect
    }
})

</script>
