import {ModelCalibrateState} from "./modelCalibrate";
import {scaleStepFromMetadata} from "../../components/plots/choropleth/utils";
import {RootState} from "../../root";

export const getters = {
    indicatorMetadata: (state: ModelCalibrateState, getters: any, rootState: RootState, rootGetters: any) => {
        const selectedIndicator = rootGetters["plotSelections/selectedIndicator"];
        return state.metadata!.indicators.find(i => i.indicator == selectedIndicator)!
    },
    scaleStep: (state: ModelCalibrateState, getters: any) => {
        return scaleStepFromMetadata(getters["indicatorMetadata"])
    }
};
