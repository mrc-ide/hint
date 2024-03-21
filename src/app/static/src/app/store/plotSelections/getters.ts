import {PlotSelectionsState} from "./plotSelections";

export const getters = {
    choroplethColourIndicator: (state: PlotSelectionsState): string => {
        return state.choropleth.filters.find(f => f.stateFilterId === "indicator")!.selection[0].id;
    },
    bubbleColourIndicator: (state: PlotSelectionsState): string => {
        return state.bubble.filters.find(f => f.stateFilterId === "colourIndicator")!.selection[0].id;
    },
    bubbleSizeIndicator: (state: PlotSelectionsState): string => {
        return state.bubble.filters.find(f => f.stateFilterId === "sizeIndicator")!.selection[0].id;
    }
};
