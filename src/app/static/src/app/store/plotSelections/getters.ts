import {ControlSelection, FilterSelection, PlotName, PlotSelectionsState} from "./plotSelections";
import {FilterOption} from "../../generated";

export const getters = {
    controlSelectionFromId: (state: PlotSelectionsState) => (plotName: PlotName, controlId: string): FilterOption | undefined => {
        return state[plotName].controls.find((f: ControlSelection) => f.id === controlId)?.selection[0]
    },
    filterSelectionFromId: (state: PlotSelectionsState) => (plotName: PlotName, filterId: string): FilterOption[] => {
        const filterSelection = state[plotName].filters.find((f: FilterSelection) => f.stateFilterId === filterId);
        if (filterSelection === undefined) {
            return []
        } else {
            return filterSelection.selection
        }
    }
};
