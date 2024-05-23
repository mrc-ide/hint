import {Module} from "vuex";
import {RootState} from "../../root";
import {ModelOutputTabs} from "../../types";
import {mutations} from "./mutations";
import {OutputPlotName, outputPlotNames} from "../plotSelections/plotSelections";

const namespaced = true;

export interface ModelOutputState {
    selectedTab: OutputPlotName,
    loading: {
        [k in ModelOutputTabs]: boolean
    }
}

export const initialModelOutputState = (): ModelOutputState => {
    return {
        selectedTab: outputPlotNames[0],
        loading: {
            [ModelOutputTabs.Map]: false,
            [ModelOutputTabs.Bar]: false,
            [ModelOutputTabs.Comparison]: false,
            [ModelOutputTabs.Table]: false,
            [ModelOutputTabs.Bubble]: false
        }
    }
};

export const modelOutput = (existingState: Partial<RootState> | null): Module<ModelOutputState, RootState> => {
    return {
        namespaced,
        state: {...initialModelOutputState(), ...existingState && existingState.modelOutput},
        mutations,
    };
};
