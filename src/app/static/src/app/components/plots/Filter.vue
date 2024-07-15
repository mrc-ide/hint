<template>
    <div :key="`${plot}.${filter.filterId}`">
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
    </div>
</template>

<script lang="ts">
import { SingleSelect, MultiSelect } from "@reside-ic/vue-nested-multiselect";
import {PropType, computed, defineComponent} from 'vue';
import i18next from "i18next";
import { useStore } from "vuex";
import { RootState } from "../../root";
import { FilterOption } from "../../generated";
import { PlotSelectionActionUpdate, getMetadataFromPlotName } from "../../store/plotSelections/actions";
import { PlotName } from "../../store/plotSelections/plotSelections";

export default defineComponent({
    props: {
        stateFilterId: {
            type: String,
            required: true
        },
        plot: {
            type: String as PropType<PlotName>,
            required: true
        }
    },
    setup(props) {
        const store = useStore<RootState>();

        const filter = computed(() => {
            return store.state.plotSelections[props.plot].filters
                .find(f => f.stateFilterId === props.stateFilterId)!;
        })

        const options = computed(() => {
            const metadata = getMetadataFromPlotName(store.state, props.plot);
            return metadata.filterTypes.find(f => f.id === filter.value.filterId)!.options;
        });

        const selected = computed(() => {
            return filter.value.selection.map((s: FilterOption) => s.id);
        });

        const updateSelection = (newSelection: FilterOption | FilterOption[]) => {
            store.dispatch("plotSelections/updateSelections", {
                payload: {
                    plot: props.plot,
                    selection: {
                        filter: {
                            id: props.stateFilterId,
                            options: Array.isArray(newSelection) ? newSelection : [newSelection]
                        }
                    }
                } as PlotSelectionActionUpdate
            }, { root: true });
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
