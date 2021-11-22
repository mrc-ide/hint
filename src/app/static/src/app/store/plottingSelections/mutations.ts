import {Mutation, MutationTree} from 'vuex';
import {
    PlottingSelectionsState,
    BarchartSelections,
    BubblePlotSelections,
    ChoroplethSelections, ScaleSelections, ColourScalesState
} from "./plottingSelections";
import {PayloadWithType, Dict} from "../../types";
import {DataType} from "../surveyAndProgram/surveyAndProgram";
import {FilterOption} from "../../generated";

type PlottingSelectionsMutation = Mutation<PlottingSelectionsState>

export interface PlottingSelectionsMutations {
    updateCalibratePlotSelections: PlottingSelectionsMutation,
    updateBarchartSelections: PlottingSelectionsMutation,
    updateBubblePlotSelections: PlottingSelectionsMutation,
    updateSAPChoroplethSelections: PlottingSelectionsMutation,
    updateOutputChoroplethSelections: PlottingSelectionsMutation,
    updateSAPColourScales: PlottingSelectionsMutation,
    updateOutputColourScales: PlottingSelectionsMutation,
    updateOutputBubbleSizeScales: PlottingSelectionsMutation
}

export const mutations: MutationTree<PlottingSelectionsState> & PlottingSelectionsMutations = {
    updateCalibratePlotSelections(state: PlottingSelectionsState, action: PayloadWithType<Partial<BarchartSelections>>) {
        state.calibratePlot = {...state.calibratePlot, ...action.payload};
    },
    updateBarchartSelections(state: PlottingSelectionsState, action: PayloadWithType<Partial<BarchartSelections>>) {
        const selectedFilterOptions: Dict<FilterOption[]> = {}
        console.log("payload", action?.payload)
        if (action?.payload?.selectedFilterOptions && Object.keys(action.payload.selectedFilterOptions).length > 0){
            Object.keys(action.payload.selectedFilterOptions).map(function(key, index) {
                function compare( a: FilterOption, b: FilterOption ) {
                    if ( a.id < b.id ){
                      return -1;
                    }
                    if ( a.id > b.id ){
                      return 1;
                    }
                    return 0;
                }
                console.log("property", key, action.payload.selectedFilterOptions![key])
                const options = [...action.payload.selectedFilterOptions![key]]
                console.log("sorted options", options.sort( compare ))
                selectedFilterOptions[key] = options.sort( compare );
              })
            state.barchart = {...state.barchart, ...action.payload, selectedFilterOptions};
        } else {
            state.barchart = {...state.barchart, ...action.payload};
        }
        console.log("barchart state", state.barchart)
    },
    updateBubblePlotSelections(state: PlottingSelectionsState, action: PayloadWithType<Partial<BubblePlotSelections>>) {
        state.bubble = {...state.bubble, ...action.payload};
    },
    updateSAPChoroplethSelections(state: PlottingSelectionsState, action: PayloadWithType<Partial<ChoroplethSelections>>) {
        state.sapChoropleth = {...state.sapChoropleth, ...action.payload}
    },
    updateOutputChoroplethSelections(state: PlottingSelectionsState, action: PayloadWithType<Partial<ChoroplethSelections>>) {
        state.outputChoropleth = {...state.outputChoropleth, ...action.payload}
    },
    updateSAPColourScales(state: PlottingSelectionsState, action: PayloadWithType<[DataType, ScaleSelections]>) {
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
    updateOutputColourScales(state: PlottingSelectionsState, action: PayloadWithType<ScaleSelections>) {
        state.colourScales.output = action.payload;
    },
    updateOutputBubbleSizeScales(state: PlottingSelectionsState, action: PayloadWithType<ScaleSelections>) {
        state.bubbleSizeScales.output = action.payload;
    }
};
