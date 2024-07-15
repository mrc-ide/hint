import { MutationTree } from "vuex";
import { PlotName, PlotSelectionsState } from "./plotSelections";
import { PayloadWithType } from "../../types";
import { Error } from "../../generated";

export enum PlotSelectionsMutations {
    updatePlotSelection = "updatePlotSelection",
    setError = "setError"
}

export type PlotSelectionUpdate = {
    plot: PlotName,
    selections: PlotSelectionsState[PlotName]
}

export const mutations: MutationTree<PlotSelectionsState> = {
    [PlotSelectionsMutations.updatePlotSelection](state: PlotSelectionsState, action: PayloadWithType<PlotSelectionUpdate>) {
        state[action.payload.plot] = action.payload.selections;
    },

    [PlotSelectionsMutations.setError](state: PlotSelectionsState, action: PayloadWithType<Error>) {
        state.error = action.payload;
    }
};