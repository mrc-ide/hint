import {MutationTree} from "vuex";
import {ModelOutputState} from "./modelOutput";
import {PayloadWithType} from "../../types";
import {OutputPlotName} from "../plotSelections/plotSelections";

export enum ModelOutputMutation {
    TabSelected = "TabSelected"
}

export const mutations: MutationTree<ModelOutputState> = {

    [ModelOutputMutation.TabSelected](state: ModelOutputState, payload: PayloadWithType<OutputPlotName>) {
        state.selectedTab = payload.payload;
    },
};
