import {ControlSelection, FilterSelection, PlotName, PlotSelectionsState} from "./plotSelections";
import {FilterOption} from "../../generated";

export const getters = {
    choroplethColourIndicator: (state: PlotSelectionsState): string => {
        return state.choropleth.filters.find(f => f.stateFilterId === "indicator")!.selection[0].id;
    },
    bubbleColourIndicator: (state: PlotSelectionsState): string => {
        return state.bubble.filters.find(f => f.stateFilterId === "colourIndicator")!.selection[0].id;
    },
    bubbleSizeIndicator: (state: PlotSelectionsState): string => {
        return state.bubble.filters.find(f => f.stateFilterId === "sizeIndicator")!.selection[0].id;
    },
    barchartIndicator: (state: PlotSelectionsState): string => {
        return state.barchart.filters.find(f => f.stateFilterId === "indicator")!.selection[0].id;
    },
    controlSelectionFromId: (state: PlotSelectionsState) => (plotName: PlotName, controlId: string): FilterOption | undefined => {
        return state[plotName].controls.find((f: ControlSelection) => f.id === controlId)?.selection[0]
    },
    filterSelectionFromId: (state: PlotSelectionsState) => (plotName: PlotName, filterId: string): FilterOption[] => {
        const filterSelection = state[plotName].filters.find((f: FilterSelection) => f.filterId === filterId);
        if (filterSelection === undefined) {
            return []
        } else {
            return filterSelection.selection
        }
    }
};
