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

export default defineComponent({
    props: {
        plotControlId: String,
    },
    setup(props) {
        const store = useStore<RootState>();

        const controlOptions = computed(() => {
            const plotName: PlotName = store.state.modelOutput.selectedTab;
            return store.state.modelCalibrate.metadata!.plotSettingsControl[plotName].plotSettings.find(f => f.id === props.plotControlId)!.options;
        });

        const selected = computed(() => {
            const plotName: PlotName = store.state.modelOutput.selectedTab;
            const controls =  store.state.plotSelections[plotName].controls
            return controls.find(control => control.id == props.plotControlId)!.selection[0]?.id;
        });

        const updateControlSelection = (newSelection: FilterOption) => {
            // TODO: dispatch action to run the effects
            console.log("Dispatching action to update selected state " + newSelection.id);
        };

        const placeholder = computed(() => {
            return i18next.t("select", "en");
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
