import { MutationTree } from "vuex";
import { PayloadWithType } from "../../types";
import {PlotState, Scale, ScaleSelections, ScaleSettings} from "./plotState";

export interface UpdateScale {
    scale: Scale
    indicatorId: string
    newScaleSettings: ScaleSettings
}

export interface SetScale {
    scale: Scale
    selections: ScaleSelections
}

export enum PlotStateMutations {
    setOutputScale = "setOutputScale",
    updateOutputScale = "updateOutputScale",
}

export const mutations: MutationTree<PlotState> = {
    [PlotStateMutations.setOutputScale](state: PlotState, action: PayloadWithType<SetScale>) {
        if (action.payload.scale === Scale.Colour) {
            state.output.colourScales = action.payload.selections;
        } else if (action.payload.scale === Scale.Size) {
            state.output.sizeScales = action.payload.selections;
        }
    },
    [PlotStateMutations.updateOutputScale](state: PlotState, action: PayloadWithType<UpdateScale>) {
        const {scale, indicatorId, newScaleSettings} = action.payload;
        if (scale === Scale.Colour) {
            const newColourScales = structuredClone(state.output.colourScales);
            newColourScales[indicatorId] = newScaleSettings;
            state.output.colourScales = newColourScales;
        } else if (scale === Scale.Size) {
            const newSizeScale = structuredClone(state.output.sizeScales);
            newSizeScale[indicatorId] = newScaleSettings;
            state.output.sizeScales = newSizeScale;
        }
    },
};
