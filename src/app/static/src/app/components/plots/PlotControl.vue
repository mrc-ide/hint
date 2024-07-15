<template>
    <div :key="`${plot}.${plotControlId}`">
        <single-select :options="controlOptions"
                   :model-value="selected"
                   :placeholder="placeholder"
                   @update:model-value="updateControlSelection"/>
    </div>
</template>

<script lang="ts">
import { SingleSelect } from "@reside-ic/vue-nested-multiselect";
import {computed, defineComponent, PropType} from 'vue';
import i18next from "i18next";
import {useStore} from "vuex";
import {RootState} from "../../root";
import {FilterOption} from "../../generated";
import {PlotName} from "../../store/plotSelections/plotSelections";
import { getMetadataFromPlotName, PlotSelectionActionUpdate } from "../../store/plotSelections/actions";

export default defineComponent({
    props: {
        plotControlId: {
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

        const controlOptions = computed(() => {
            const metadata = getMetadataFromPlotName(store.state, props.plot);
            return metadata.plotSettingsControl[props.plot].plotSettings
                .find(f => f.id === props.plotControlId)!.options
        });

        const selected = computed(() => {
            const controls = store.state.plotSelections[props.plot].controls
            return controls.find(control => control.id == props.plotControlId)!.selection[0]?.id;
        });

        const updateControlSelection = (newSelection: FilterOption) => {
            store.dispatch("plotSelections/updateSelections", {
                payload: {
                    plot: props.plot,
                    selection: {
                        plotSetting: {
                            id: props.plotControlId,
                            options: [newSelection]
                        }
                    }
                } as PlotSelectionActionUpdate
            }, { root: true });
        };

        const placeholder = computed(() => {
            return i18next.t("select", store.state.language);
        });

        return {
            controlOptions,
            selected,
            updateControlSelection,
            placeholder
        }
    },

    components: {
        SingleSelect
    }
})

</script>
