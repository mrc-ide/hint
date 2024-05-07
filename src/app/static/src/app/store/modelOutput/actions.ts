import {ActionContext, ActionTree} from "vuex";
import {ModelOutputMutation} from "./mutations";
import {Dict, ModelOutputTabs} from "../../types";
import {ModelOutputState} from "./modelOutput";
import {RootState} from "../../root";
import {getData, PayloadFilterOption} from "../plottingSelections/actions";

export interface ModelOutputActions {
    updateSelectedTab: (store: ActionContext<ModelOutputState, RootState>, tab: ModelOutputTabs) => void
}

const isObjEmpty = (object: object) => {
    return Object.keys(object).length === 0;
};

export const actions: ActionTree<ModelOutputState, RootState> & ModelOutputActions = {

    async updateSelectedTab(context, tab) {
        const { commit, rootState } = context;
        commit({type: ModelOutputMutation.TabSelected, payload: tab});
        if (tab !== ModelOutputTabs.Bar) return;
        let filterSelections: Dict<PayloadFilterOption[]> = {};
        if (!isObjEmpty(rootState.plottingSelections.barchart.selectedFilterOptions)) {
            filterSelections = {
                indicator: [{id: rootState.plottingSelections.barchart.indicatorId}],
                ...rootState.plottingSelections.barchart.selectedFilterOptions
            };
            await getData(context as any, filterSelections, tab);
        }
    },
};
