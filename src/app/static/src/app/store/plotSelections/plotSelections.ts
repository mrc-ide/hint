import { CalibrateMetadataResponse, FilterOption, FilterRef } from "../../generated";
import { mutations } from "./mutations";
import { actions } from "./actions";

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
}

export const initialPlotSelectionsState = (): PlotSelectionsState => {
    const emptySelections: PlotSelectionsState[PlotName] = { controls: [], filters: [] };
    return Object.fromEntries(plotNames.map(plot => [plot, emptySelections])) as PlotSelectionsState;
}

export const plotSelections = {
    namespaced: true,
    state: initialPlotSelectionsState(),
    mutations,
    actions
};
