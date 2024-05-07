import {useStore} from "vuex";
import {RootState} from "../../root";
import {Scale, ScaleSettings} from "../../store/plotState/plotState";
import {getIndicatorMetadata, scaleStepFromMetadata} from "./utils";
import {computed} from "vue";
import {PlotStateMutations} from "../../store/plotState/mutations";

export const useUpdateScale = () => {
    const store = useStore<RootState>();

    const getScaleStep = (scale: Scale) => {
        if (scale === Scale.Colour) {
            return colourScaleStep.value;
        } else if (scale === Scale.Size) {
            return sizeScaleStep.value;
        } else {
            throw new RangeError(`Scale type must be one of 'name' or 'colour', got ${scale}`)
        }
    };

    const colourScaleStep = computed(() => {
        const activePlot = store.state.modelOutput.selectedTab;
        let indicator
        if (activePlot === "choropleth") {
            indicator = getIndicatorMetadata(store, choroplethColourIndicator.value)
        } else {
            indicator = getIndicatorMetadata(store, bubbleColourIndicator.value)
        }
        return scaleStepFromMetadata(indicator)
    });

    const sizeScaleStep = computed(() => {
        return scaleStepFromMetadata(getIndicatorMetadata(store, bubbleSizeIndicator.value))
    });

    const choroplethColourIndicator = computed(() => {
        return store.state.plotSelections.choropleth.filters.find(f => f.stateFilterId === "indicator")!.selection[0].id;
    });

    const bubbleColourIndicator = computed(() => {
        return store.state.plotSelections.bubble.filters.find(f => f.stateFilterId === "colourIndicator")!.selection[0].id;
    });

    const bubbleSizeIndicator = computed(() => {
        return store.state.plotSelections.bubble.filters.find(f => f.stateFilterId === "sizeIndicator")!.selection[0].id;
    });

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
