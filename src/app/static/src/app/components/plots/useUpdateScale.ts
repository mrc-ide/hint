import {useStore} from "vuex";
import {RootState} from "../../root";
import {ScaleSettings} from "../../store/plotState/plotState";
import {computed} from "vue";
import {PlotStateMutations} from "../../store/plotState/mutations";

export const useUpdateScale = () => {
    const store = useStore<RootState>();

    const getScaleStep = (name: string) => {
        if (name === "colour") {
            return colourScaleStep.value;
        } else if (name === "size") {
            return sizeScaleStep.value;
        }
    };

    const colourScaleStep = computed(() => {
        return store.getters["modelCalibrate/colourScaleStep"];
    });

    const sizeScaleStep = computed(() => {
        return store.getters["modelCalibrate/sizeScaleStep"];
    });

    const choroplethColourIndicator = computed(() => {
        return store.getters["plotSelections/choroplethColourIndicator"];
    });

    const bubbleColourIndicator = computed(() => {
        return store.getters["plotSelections/bubbleColourIndicator"];
    });

    const updateOutputScale = (name: string, newScaleSettings: ScaleSettings) => {
        if (name === "colour") {
            updateOutputColourScale(newScaleSettings);
        } else if (name === "size") {
            updateOutputSizeScale(newScaleSettings);
        }
    };

    const updateOutputColourScale = (newScaleSettings: ScaleSettings) => {
        const activePlot = store.state.modelOutput.selectedTab;
        let indicatorId
        if (activePlot === "choropleth") {
            indicatorId = choroplethColourIndicator.value
        } else {
            indicatorId = bubbleColourIndicator.value
        }
        store.commit({
            type: `plotState/${PlotStateMutations.updateOutputColourScales}`,
            payload: {indicatorId: indicatorId, newScaleSettings}
        })
    };

    const bubbleSizeIndicator = computed(() => {
        return store.getters["plotSelections/bubbleSizeIndicator"];
    });

    const updateOutputSizeScale = (newScaleSettings: ScaleSettings) => {
        store.commit({
            type: 'plotState/updateOutputSizeScales',
            payload: {indicatorId: bubbleSizeIndicator.value, newScaleSettings}
        })
    };

    return {
        getScaleStep,
        updateOutputScale,
        updateOutputColourScale,
        updateOutputSizeScale
    }
};
