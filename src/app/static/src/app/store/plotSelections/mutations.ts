import { MutationTree } from "vuex";
import { PlotName, PlotSelectionsState } from "./plotSelections";
import { PayloadWithType } from "../../types";

export enum PlotSelectionsMutations {
    updatePlotSelection = "updatePlotSelection"
}

export type PlotSelectionUpdate = {
    plot: PlotName,
    selections: PlotSelectionsState[PlotName]
}

export const mutations: MutationTree<PlotSelectionsState> = {
    [PlotSelectionsMutations.updatePlotSelection](state: PlotSelectionsState, action: PayloadWithType<PlotSelectionUpdate>) {
        state[action.payload.plot] = action.payload.selections;
    }
};