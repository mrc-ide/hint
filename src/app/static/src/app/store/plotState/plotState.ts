import { mutations } from "./mutations";
import {Dict} from "../../types";

export interface PlotState {
    input: InputPlotState,
    output: OutputPlotState
}

export interface InputPlotState {
    colourScales: ScaleSelections
}

export interface OutputPlotState {
    colourScales: ScaleSelections,
    sizeScales: ScaleSelections
}

export type ScaleSelections = Dict<ScaleSettings>;

export interface ScaleSettings {
    type: ScaleType
    customMin: number,
    customMax: number
}

export enum ScaleType {Default, Custom, DynamicFiltered}

export enum Scale {Colour = "Colour", Size = "Size"}

export const initialPlotState = (): PlotState => {
    return {
        input: {
            colourScales: {}
        },
        output: {
            colourScales: {},
            sizeScales: {}
        }
    }
}

export const initialScaleSettings = (): ScaleSettings => {
    return {
        type: ScaleType.DynamicFiltered,
        customMin: 0,
        customMax: 0
    }
};

export const plotState = {
    namespaced: true,
    state: initialPlotState(),
    mutations
};
