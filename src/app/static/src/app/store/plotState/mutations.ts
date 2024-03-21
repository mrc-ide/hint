import { MutationTree } from "vuex";
import { PayloadWithType } from "../../types";
import {PlotState, ScaleSettings} from "./plotState";

export interface UpdateScale {
    indicatorId: string
    newScaleSettings: ScaleSettings
}

export enum PlotStateMutations {
    updateOutputColourScales = "updateOutputColourScales",
    updateOutputSizeScales = "updateOutputSizeScales"
}

export const mutations: MutationTree<PlotState> = {
    [PlotStateMutations.updateOutputColourScales](state: PlotState, action: PayloadWithType<UpdateScale>) {
        const {indicatorId, newScaleSettings} = action.payload;
        const newColourScales = {...state.output.colourScales}
        newColourScales[indicatorId] = newScaleSettings
        state.output.colourScales = newColourScales;
    },

    [PlotStateMutations.updateOutputSizeScales](state: PlotState, action: PayloadWithType<UpdateScale>) {
        const {indicatorId, newScaleSettings} = action.payload;
        const newSizeScale = {...state.output.sizeScales}
        newSizeScale[indicatorId] = newScaleSettings
        state.output.sizeScales = newSizeScale;
    },
};
