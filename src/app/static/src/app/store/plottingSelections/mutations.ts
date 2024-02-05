import {MutationTree} from 'vuex';
import {
    PlottingSelectionsState,
    BarchartSelections,
    BubblePlotSelections,
    ChoroplethSelections, ScaleSelections, TableSelections
} from "./plottingSelections";
import {PayloadWithType} from "../../types";
import {DataType} from "../surveyAndProgram/surveyAndProgram";

export enum PlottingSelectionsMutations {
    updateCalibratePlotSelections = "updateCalibratePlotSelections",
    updateBarchartSelections = "updateBarchartSelections",
    updateComparisonPlotSelections = "updateComparisonPlotSelections",
    updateBubblePlotSelections = "updateBubblePlotSelections",
    updateSAPChoroplethSelections = "updateSAPChoroplethSelections",
    updateOutputChoroplethSelections = "updateOutputChoroplethSelections",
    updateSAPColourScales = "updateSAPColourScales",
    updateOutputColourScales = "updateOutputColourScales",
    updateOutputBubbleSizeScales = "updateOutputBubbleSizeScales",
    updateTableSelections = "updateTableSelections"
}

export const mutations: MutationTree<PlottingSelectionsState> = {
    [PlottingSelectionsMutations.updateCalibratePlotSelections](state: PlottingSelectionsState, action: PayloadWithType<Partial<BarchartSelections>>) {
        state.calibratePlot = {...state.calibratePlot, ...action.payload};
    },
    [PlottingSelectionsMutations.updateBarchartSelections](state: PlottingSelectionsState, action: PayloadWithType<BarchartSelections>) {
        state.barchart = {...state.barchart, ...action.payload};
    },
    [PlottingSelectionsMutations.updateComparisonPlotSelections](state: PlottingSelectionsState, action: PayloadWithType<BarchartSelections>) {
        state.comparisonPlot = {...state.comparisonPlot, ...action.payload};
    },
    [PlottingSelectionsMutations.updateBubblePlotSelections](state: PlottingSelectionsState, action: PayloadWithType<Partial<BubblePlotSelections>>) {
        state.bubble = {...state.bubble, ...action.payload};
    },
    [PlottingSelectionsMutations.updateTableSelections](state: PlottingSelectionsState, action: PayloadWithType<Partial<TableSelections>>) {
        state.table = {...state.table, ...action.payload};
        // should make this more general in the future by looking at the
        // filters per preset
        if (state.table.preset === "sex_by_5_year_age_group") {
            delete state.table.selectedFilterOptions.area_level
        } else {
            delete state.table.selectedFilterOptions.area_id
        }
    },
    [PlottingSelectionsMutations.updateSAPChoroplethSelections](state: PlottingSelectionsState, action: PayloadWithType<Partial<ChoroplethSelections>>) {
        state.sapChoropleth = {...state.sapChoropleth, ...action.payload}
    },
    [PlottingSelectionsMutations.updateOutputChoroplethSelections](state: PlottingSelectionsState, action: PayloadWithType<Partial<ChoroplethSelections>>) {
        state.outputChoropleth = {...state.outputChoropleth, ...action.payload}
    },
    [PlottingSelectionsMutations.updateSAPColourScales](state: PlottingSelectionsState, action: PayloadWithType<[DataType, ScaleSelections]>) {
        const value = action.payload[1];
        switch (action.payload[0]) {
            case DataType.Survey:
                state.colourScales.survey = value;
                break;
            case DataType.ANC:
                state.colourScales.anc = value;
                break;
            case DataType.Program:
                state.colourScales.program = value;
                break;
            default:

        }
    },
    [PlottingSelectionsMutations.updateOutputColourScales](state: PlottingSelectionsState, action: PayloadWithType<ScaleSelections>) {
        state.colourScales.output = action.payload;
    },
    [PlottingSelectionsMutations.updateOutputBubbleSizeScales](state: PlottingSelectionsState, action: PayloadWithType<ScaleSelections>) {
        state.bubbleSizeScales.output = action.payload;
    }
};
