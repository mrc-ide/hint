import { CalibrateMetadataResponse, Error, FilterOption, FilterRef } from "../../generated";
import { mutations } from "./mutations";
import { actions } from "./actions";
import { getters } from "./getters";

export type PlotName = keyof CalibrateMetadataResponse["plotSettingsControl"]
export const plotNames: PlotName[] = ["barchart", "choropleth", "bubble", "table"]

export type FilterSelection = {
    multiple: boolean
    selection: FilterOption[]
} & FilterRef

export type ControlSelection = {
    id: string,
    label: string,
    selection: FilterOption[]
}

export type PlotSelectionsState = {
    [P in PlotName]: {
        controls: ControlSelection[]
        filters: FilterSelection[]
    }
} & { error: Error }

export const initialPlotSelectionsState = (): PlotSelectionsState => {
    const emptySelections: PlotSelectionsState[PlotName] = { controls: [], filters: [] };
    const emptySelectionsArray = plotNames.map(plot => [plot, emptySelections]);
    return Object.fromEntries([...emptySelectionsArray, ["error", ""]]) as PlotSelectionsState;
}

export const plotSelections = {
    namespaced: true,
    state: initialPlotSelectionsState(),
    mutations,
    actions,
    getters
};
