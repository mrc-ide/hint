import {ModelCalibrateState} from "./modelCalibrate";
import {scaleStepFromMetadata} from "../../components/plots/utils";
import {RootState} from "../../root";

export const getters = {
    choroplethColourMetadata: (state: ModelCalibrateState, getters: any, rootState: RootState, rootGetters: any) => {
        const selectedIndicator = rootGetters["plotSelections/choroplethColourIndicator"];
        return state.metadata!.indicators.find(i => i.indicator == selectedIndicator)!
    },
    bubbleColourMetadata: (state: ModelCalibrateState, getters: any, rootState: RootState, rootGetters: any) => {
        const selectedIndicator = rootGetters["plotSelections/bubbleColourIndicator"];
        return state.metadata!.indicators.find(i => i.indicator == selectedIndicator)!
    },
    bubbleSizeMetadata: (state: ModelCalibrateState, getters: any, rootState: RootState, rootGetters: any) => {
        const selectedIndicator = rootGetters["plotSelections/bubbleSizeIndicator"];
        return state.metadata!.indicators.find(i => i.indicator == selectedIndicator)!
    },
    colourScaleStep: (state: ModelCalibrateState, getters: any, rootState: RootState) => {
        const activePlot = rootState.modelOutput.selectedTab;
        let indicator
        if (activePlot === "choropleth") {
            indicator = getters["choroplethColourMetadata"]
        } else {
            indicator = getters["bubbleColourMetadata"]
        }
        return scaleStepFromMetadata(indicator)
    },
    sizeScaleStep: (state: ModelCalibrateState, getters: any, rootState: RootState) => {
        return scaleStepFromMetadata(getters["bubbleSizeMetadata"])
    }
};
