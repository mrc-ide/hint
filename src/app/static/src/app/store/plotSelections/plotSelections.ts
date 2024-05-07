import { CalibrateMetadataResponse, Error, FilterOption, FilterRef, ReviewInputFilterMetadataResponse } from "../../generated";
import { mutations } from "./mutations";
import { actions } from "./actions";
import { getters } from "./getters";

export type OutputPlotName = keyof CalibrateMetadataResponse["plotSettingsControl"]
export type InputPlotName = keyof ReviewInputFilterMetadataResponse["plotSettingsControl"]

export const outputPlotNames: OutputPlotName[] = ["barchart", "bubble", "choropleth", "table"];
export const inputPlotNames: InputPlotName[] = ["timeSeries", "inputChoropleth"];

export type PlotName = OutputPlotName | InputPlotName
export const plotNames = [...outputPlotNames, ...inputPlotNames];

export enum PlotDataType { Output, TimeSeries, Input }

export const plotNameToDataType: Record<PlotName, PlotDataType> = {
    barchart: PlotDataType.Output,
    bubble: PlotDataType.Output,
    choropleth: PlotDataType.Output,
    table: PlotDataType.Output,
    timeSeries: PlotDataType.TimeSeries,
    inputChoropleth: PlotDataType.Input
}

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
