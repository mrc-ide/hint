import {MutationTree} from "vuex";
import {emptyState, RootState} from "../../root";
import {initialModelOptionsState} from "../modelOptions/modelOptions";
import {initialModelRunState} from "../modelRun/modelRun";
import {initialModelOutputState} from "../modelOutput/modelOutput";
import {initialPlottingSelectionsState} from "../plottingSelections/plottingSelections";
import {initialLoadState} from "../load/load";
import {initialMetadataState} from "../metadata/metadata";
import {initialErrorsState} from "../errors/errors";
import {initialBaselineState} from "../baseline/baseline";
import {DataType, initialSurveyAndProgramState} from "../surveyAndProgram/surveyAndProgram";
import {PayloadWithType, Project} from "../../types";
import {mutations as languageMutations} from "../language/mutations";
import {initialProjectsState} from "../projects/projects";
import {router} from '../../router';
import {initialModelCalibrateState} from "../modelCalibrate/modelCalibrate";

export enum RootMutation {
    Reset = "Reset",
    ResetSelectedDataType = "ResetSelectedDataType",
    ResetOptions = "ResetOptions",
    ResetOutputs = "ResetOutputs",
    SetProject = "SetProject"
}

export const mutations: MutationTree<RootState> = {
    [RootMutation.Reset](state: RootState, action: PayloadWithType<number>) {

        const maxValidStep = action.payload;

        //We treat the final group of steps 5-7 together - all rely on modelCalibrate and its result. If we're calling Reset
        //at all we assume that these steps will be invalidated but earlier steps may be retainable
        const resetState: RootState = {
            version: state.version,
            hintrVersion: state.hintrVersion,
            language: state.language,
            adr: state.adr,
            baseline: maxValidStep < 1 ? initialBaselineState() : state.baseline,
            metadata: maxValidStep < 1 ? initialMetadataState() : state.metadata,
            surveyAndProgram: maxValidStep < 2 ? initialSurveyAndProgramState() : state.surveyAndProgram,
            modelOptions: maxValidStep < 3 ? initialModelOptionsState() : state.modelOptions,
            modelRun: maxValidStep < 4 ? initialModelRunState() : state.modelRun,
            modelCalibrate: initialModelCalibrateState(),
            modelOutput: initialModelOutputState(),
            plottingSelections: initialPlottingSelectionsState(),
            stepper: state.stepper,
            load: initialLoadState(),
            errors: initialErrorsState(),
            projects: initialProjectsState(),
            currentUser: state.currentUser
        };
        Object.assign(state, resetState);

        const maxAccessibleStep = maxValidStep < 5 ? Math.max(maxValidStep, 1) : 5;
        if (state.stepper.activeStep > maxAccessibleStep) {
            state.stepper.activeStep = maxAccessibleStep;
        }

        state.surveyAndProgram.ready = true;
        state.baseline.ready = true;
        state.modelRun.ready = true;
        state.modelCalibrate.ready = true;
    },

    [RootMutation.SetProject](state: RootState, action: PayloadWithType<Project>) {
        const resetState: RootState = {
            ...emptyState(),
            language: state.language,
            hintrVersion: state.hintrVersion,
            adr: state.adr,
            projects: {
                ...initialProjectsState(),
                currentProject: action.payload,
                currentVersion: action.payload.versions[0]
            }
        };

        Object.assign(state, resetState);

        state.surveyAndProgram.ready = true;
        state.baseline.ready = true;
        state.modelRun.ready = true;
        state.modelCalibrate.ready = true;

        router.push("/");
    },

    [RootMutation.ResetSelectedDataType](state: RootState) {
        //TODO: Should this move to SAP since we're removing output from DataType?
        const dataAvailable = (dataType: DataType | null) => {
            if (dataType == null) {
                return true
            }
            switch (dataType) {
                case DataType.ANC:
                    return !!state.surveyAndProgram.anc;
                case DataType.Program:
                    return !!state.surveyAndProgram.program;
                case DataType.Survey:
                    return !!state.surveyAndProgram.survey;
            }
        };

        if (!dataAvailable(state.surveyAndProgram.selectedDataType)) {

            const availableData: number[] = Object.keys(DataType)
                .filter(k => !isNaN(Number(k)) && dataAvailable(Number(k)))
                .map(k => Number(k));

            state.surveyAndProgram.selectedDataType = availableData.length > 0 ? availableData[0] : null;
        }
    },

    [RootMutation.ResetOptions](state: RootState) {
        Object.assign(state.modelOptions, initialModelOptionsState());
    },

    [RootMutation.ResetOutputs](state: RootState) {
        Object.assign(state.modelRun, initialModelRunState());
        state.modelRun.ready = true;
        Object.assign(state.modelCalibrate, initialModelCalibrateState());
        state.modelCalibrate.ready = true;
        Object.assign(state.modelOutput, initialModelOutputState());
        const sapSelections = state.plottingSelections.sapChoropleth;
        const colourScales = state.plottingSelections.colourScales;
        Object.assign(state.plottingSelections, {
            ...initialPlottingSelectionsState(),
            sapChoropleth: sapSelections,
            colourScales: colourScales
        });
    },

    ...languageMutations

};
