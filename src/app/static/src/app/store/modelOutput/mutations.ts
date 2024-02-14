import {MutationTree} from "vuex";
import {ModelOutputState} from "./modelOutput";
import {ModelOutputTabs, PayloadWithType} from "../../types";
import {PlotName} from "../plotSelections/plotSelections";

export enum ModelOutputMutation {
    TabSelected = "TabSelected",
    SetTabLoading = "SetTabLoading"
}

type TabLoading = {
    tab: ModelOutputTabs,
    loading: boolean
}

export const mutations: MutationTree<ModelOutputState> = {

    [ModelOutputMutation.TabSelected](state: ModelOutputState, payload: PayloadWithType<PlotName>) {
        state.selectedTab = payload.payload;
    },

    [ModelOutputMutation.SetTabLoading](state: ModelOutputState, payload: PayloadWithType<TabLoading>) {
        state.loading[payload.payload.tab] = payload.payload.loading;
    },
};
