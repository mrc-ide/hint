import {
    CalibrateDataResponse,
    CalibratePlotData,
    ComparisonPlotData,
    InputTimeSeriesData,
    InputTimeSeriesRow
} from "../../generated"
import { PlotName, plotNames } from "../plotSelections/plotSelections"
import { mutations } from "./mutations"

export type PlotData = CalibrateDataResponse["data"] | InputTimeSeriesData | CalibratePlotData | ComparisonPlotData;
export type InputTimeSeriesKey = keyof InputTimeSeriesRow;
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
