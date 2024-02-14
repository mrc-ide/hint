<template>
    <single-select :options="controlOptions"
                   :model-value="selected"
                   :placeholder="placeholder"
                   @update:model-value="updateControlSelection"/>
</template>

<script lang="ts">
import { SingleSelect } from "@reside-ic/vue-nested-multiselect";
import {computed, defineComponent, PropType, ref} from 'vue';
import i18next from "i18next";
import {useStore} from "vuex";
import {RootState} from "../../root";
import {FilterOption} from "../../generated";
import {PlotName} from "../../store/plotSelections/plotSelections";
import { PlotSelectionActionUpdate } from "../../store/plotSelections/actions";

export default defineComponent({
    props: {
        plotControlId: String,
    },
    setup(props) {
        const store = useStore<RootState>();

        const activePlot = computed(() => {
            return store.state.modelOutput.selectedTab;
        });

        const controlOptions = computed(() => {
            return store.state.modelCalibrate.metadata!.plotSettingsControl[activePlot.value].plotSettings
                .find(f => f.id === props.plotControlId)!.options;
        });

        const selected = computed(() => {
            const plotName: PlotName = store.state.modelOutput.selectedTab;
            const controls =  store.state.plotSelections[plotName].controls
            return controls.find(control => control.id == props.plotControlId)!.selection[0]?.id;
        });

        const updateControlSelection = (newSelection: FilterOption) => {
            store.dispatch("plotSelections/updateSelections", {
                payload: {
                    plot: activePlot.value,
                    selection: {
                        plotSetting: {
                            id: props.plotControlId,
                            options: [newSelection]
                        }
                    }
                } as PlotSelectionActionUpdate
            });
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
