import { CalibrateDataResponse } from "../../generated"
import { PlotName, plotNames } from "../plotSelections/plotSelections"
import { mutations } from "./mutations"

export type PlotData = CalibrateDataResponse["data"]

export type PlotDataState = {
    [P in PlotName]: PlotData
}

export const initialPlotDataState = (): PlotDataState => {
    const data: PlotData = []
    return Object.fromEntries(plotNames.map(plot => [plot, data])) as PlotDataState;
}

export const plotData = {
    namespaced: true,
    state: initialPlotDataState(),
    mutations
}
