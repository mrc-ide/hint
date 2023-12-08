import {FilterOption} from "../../generated";
import {Module} from "vuex";
import {mutations} from "./mutations";
import {getters} from "./getters";
import {Dict} from "../../types";
import {DataExplorationState} from "../dataExploration/dataExploration";
import {actions} from "./actions";
import { RootState } from "../../root";

export interface PlottingSelectionsState {
    calibratePlot: BarchartSelections,
    comparisonPlot: BarchartSelections,
    barchart: BarchartSelections,
    bubble: BubblePlotSelections,
    table: TableSelections,
    sapChoropleth: ChoroplethSelections,
    outputChoropleth: ChoroplethSelections,
    colourScales: ColourScalesState,
    bubbleSizeScales: BubbleSizeScalesState
}

export interface BarchartSelections {
    indicatorId: string,
    xAxisId: string,
    disaggregateById: string,
    selectedFilterOptions: Dict<FilterOption[]>
}

export interface UnadjustedBarchartSelections {
    indicator_id: string,
    x_axis_id: string,
    disaggregate_by_id: string,
    selected_filter_options: Dict<FilterOption[]>
}

export interface BubblePlotSelections {
    colorIndicatorId: string,
    sizeIndicatorId: string,
    selectedFilterOptions: Dict<FilterOption[]>,
    detail: number
}

export interface ChoroplethSelections {
    indicatorId: string,
    selectedFilterOptions: Dict<FilterOption[]>,
    detail: number
}

export interface TableSelections {
    preset: string,
    indicator: string,
    selectedFilterOptions: Dict<FilterOption[]>,
}

export interface ColourScalesState {
    survey: ScaleSelections,
    anc: ScaleSelections,
    program: ScaleSelections,
    output: ScaleSelections
}

export interface BubbleSizeScalesState {
    output: ScaleSelections
}

export enum ScaleType {Default, Custom, DynamicFull, DynamicFiltered}

export type ScaleSelections = Dict<ScaleSettings>;

export interface ScaleSettings {
    type: ScaleType
    customMin: number,
    customMax: number
}

export const initialCalibratePlotSelections = (): BarchartSelections => {
    return {
        indicatorId: "",
        xAxisId: "",
        disaggregateById: "",
        selectedFilterOptions: {}
    }
};

export const initialComparisonPlotSelections = (): BarchartSelections => {
    return {
        indicatorId: "",
        xAxisId: "",
        disaggregateById: "",
        selectedFilterOptions: {}
    }
};

export const initialBarchartSelections = (): BarchartSelections => {
    return {
        indicatorId: "",
        xAxisId: "",
        disaggregateById: "",
        selectedFilterOptions: {}
    }
};

export const initialBubblePlotSelections = (): BubblePlotSelections => {
    return {
        colorIndicatorId: "",
        sizeIndicatorId: "",
        selectedFilterOptions: {},
        detail: -1
    };
};

export const initialChorplethSelections = (): ChoroplethSelections => {
    return {
        indicatorId: "",
        selectedFilterOptions: {},
        detail: -1
    };
};

export const initialTableSelections = (): TableSelections => {
    return {
        preset: "",
        indicator: "",
        selectedFilterOptions: {},
    };
};

export const initialScaleSettings = (): ScaleSettings => {
    return {
        type: ScaleType.DynamicFiltered,
        customMin: 0,
        customMax: 0
    }
};

export const initialColourScalesState = (): ColourScalesState => {
    return {
        survey: {},
        anc: {},
        program: {},
        output: {}
    }
};


export const initialBubbleSizeScalesState = (): BubbleSizeScalesState => {
    return {
        output: {}
    }
};


export const initialPlottingSelectionsState = (): PlottingSelectionsState => {
    return {
        calibratePlot: initialCalibratePlotSelections(),
        comparisonPlot: initialComparisonPlotSelections(),
        barchart: initialBarchartSelections(),
        bubble: initialBubblePlotSelections(),
        table: initialTableSelections(),
        sapChoropleth: initialChorplethSelections(),
        outputChoropleth: initialChorplethSelections(),
        colourScales: initialColourScalesState(),
        bubbleSizeScales: initialBubbleSizeScalesState()
    }
};

const namespaced = true;

export const plottingSelections = (existingState: Partial<DataExplorationState> | null): Module<PlottingSelectionsState, RootState> => {
    return {
        namespaced,
        state: {...initialPlottingSelectionsState(), ...existingState && existingState.plottingSelections},
        mutations,
        getters,
        actions
    }
};
