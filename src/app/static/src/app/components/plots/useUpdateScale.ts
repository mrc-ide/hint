import {Store, useStore} from "vuex";
import {RootState} from "../../root";
import {Scale, ScaleSettings} from "../../store/plotState/plotState";
import {getIndicatorMetadata, scaleStepFromMetadata} from "./utils";
import {computed} from "vue";
import {PlotStateMutations} from "../../store/plotState/mutations";
import { PlotName } from "../../store/plotSelections/plotSelections";

export const useUpdateScale = (activePlot: PlotName) => {
    const store = useStore<RootState>();

    const getScaleStepFromState = (store: Store<RootState>, stateFilterId: string) => {
        const indicator = store.state.plotSelections[activePlot].filters.find(f => f.stateFilterId === stateFilterId)!.selection[0].id;
        const indicatorMetadata = getIndicatorMetadata(store, activePlot, indicator);
        return scaleStepFromMetadata(indicatorMetadata);
    };

    const colourScaleStep = computed(() => {
        const indicatorStateFilterId = activePlot === "bubble" ? "colourIndicator" : "indicator";
        return getScaleStepFromState(store, indicatorStateFilterId);
    });

    const sizeScaleStep = computed(() => getScaleStepFromState(store, "sizeIndicator"));

    const getScaleStep = (scale: Scale) => {
        if (scale === Scale.Colour) {
            return colourScaleStep.value;
        } else if (scale === Scale.Size) {
            return sizeScaleStep.value;
        } else {
            throw new RangeError(`Scale type must be one of 'name' or 'colour', got ${scale}`)
        }
    };

    const updateOutputScale = (scale: Scale, indicatorId: string, newScaleSettings: ScaleSettings) => {
        store.commit({
            type: `plotState/${PlotStateMutations.updateOutputScale}`,
            payload: {scale, indicatorId, newScaleSettings}
        });
    };

    return {
        getScaleStep,
        updateOutputScale,
    }
};
