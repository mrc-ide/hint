<template>
    <multi-select v-if="filter.multiple"
                  :options="options"
                  :model-value="selected"
                  :placeholder="placeholder"
                  @update:model-value="updateSelection"/>
    <single-select v-else
                   :options="options"
                   :model-value="selected?.at(0)"
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
import { PlotSelectionActionUpdate } from "../../store/plotSelections/actions";

export default defineComponent({
    props: {
        stateFilterId: String,
    },
    setup(props) {
        const store = useStore<RootState>();

        const activePlot = computed(() => {
            return store.state.modelOutput.selectedTab;
        });

        const filter = computed(() => {
            return store.state.plotSelections[activePlot.value].filters
                .find(f => f.stateFilterId === props.stateFilterId)!;
        })

        const options = computed(() => {
            return store.state.modelCalibrate.metadata!.filterTypes.find(f => f.id === filter.value.filterId)!.options
        });

        const selected = computed(() => {
            return filter.value.selection.map((s: FilterOption) => s.id);
        });

        const updateSelection = (newSelection: FilterOption | FilterOption[]) => {
            store.dispatch("plotSelections/updateSelections", {
                payload: {
                    plot: activePlot.value,
                    selection: {
                        filter: {
                            filterId: props.stateFilterId,
                            options: Array.isArray(newSelection) ? newSelection : [newSelection]
                        }
                    }
                } as PlotSelectionActionUpdate
            });
        };

        const placeholder = computed(() => {
            return i18next.t("select", store.state.language);
        });

        return {
            filter,
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
