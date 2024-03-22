import {PlotSelectionsState} from "./plotSelections";

export const getters = {
    selectedIndicator: (state: PlotSelectionsState): string => {
        return state.choropleth.filters.find(f => f.stateFilterId === "indicator")!.selection[0].id;
    }
};
