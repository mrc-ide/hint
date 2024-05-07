import {MutationPayload, Store, StoreOptions} from "vuex";
import {baseline, BaselineState, initialBaselineState} from "./store/baseline/baseline";
import {projects, initialProjectsState, ProjectsState} from "./store/projects/projects";
import {initialMetadataState, metadata, MetadataState} from "./store/metadata/metadata";
import {
    initialSurveyAndProgramState,
    surveyAndProgram,
    SurveyAndProgramState,
} from "./store/surveyAndProgram/surveyAndProgram";
import {initialModelRunState, modelRun, ModelRunState} from "./store/modelRun/modelRun";
import {initialStepperState, stepper, StepperState} from "./store/stepper/stepper";
import {initialLoadState, LoadState} from "./store/load/state";
import {load} from "./store/load/load";
import {initialModelOutputState, modelOutput, ModelOutputState} from "./store/modelOutput/modelOutput";
import {localStorageManager} from "./localStorageManager";
import {actions} from "./store/root/actions";
import {mutations, RootMutation} from "./store/root/mutations";
import {getters} from "./store/root/getters";
import {initialModelOptionsState, modelOptions, ModelOptionsState} from "./store/modelOptions/modelOptions";
import {ModelOptionsMutation, ModelOptionsUpdates} from "./store/modelOptions/mutations";
import {SurveyAndProgramMutation, SurveyAndProgramUpdates} from "./store/surveyAndProgram/mutations";
import {BaselineDatasetUpdates, BaselineMutation, BaselineUpdates} from "./store/baseline/mutations";
import {stripNamespace} from "./utils";
import {
    initialPlottingSelectionsState,
    plottingSelections,
    PlottingSelectionsState
} from "./store/plottingSelections/plottingSelections";
import {errors, ErrorsState, initialErrorsState} from "./store/errors/errors";
import {Language} from "./store/translations/locales";
import {modelCalibrate, initialModelCalibrateState, ModelCalibrateState} from "./store/modelCalibrate/modelCalibrate";
import {initialHintrVersionState, hintrVersion, HintrVersionState} from "./store/hintrVersion/hintrVersion";
import {currentHintVersion} from "./hintVersion";
import {ModelRunMutation, ModelRunUpdates} from "./store/modelRun/mutations";
import {adr, ADRState, initialADRState} from "./store/adr/adr";
import {adrUpload, ADRUploadState, initialADRUploadState} from "./store/adrUpload/adrUpload";

import {
    downloadResults,
    DownloadResultsState,
    initialDownloadResultsState
} from "./store/downloadResults/downloadResults";
import {ModelCalibrateMutation, ModelCalibrateUpdates} from "./store/modelCalibrate/mutations";
import {GenericChartState, initialGenericChartState, genericChart} from "./store/genericChart/genericChart";
import {Warning} from "./generated";
import {DownloadResultsMutation} from "./store/downloadResults/mutations";
import {
    downloadIndicator,
    DownloadIndicatorState,
    initialDownloadIndicatorState
} from "./store/downloadIndicator/downloadIndicator";
import { initialPlotSelectionsState, PlotSelectionsState, plotSelections } from "./store/plotSelections/plotSelections";
import { initialPlotDataState, PlotDataState, plotData } from "./store/plotData/plotData";
import { initialPlotState, PlotState, plotState } from "./store/plotState/plotState";
import {TranslatableState} from "./types";

export interface RootState extends TranslatableState {
    version: string,
    adr: ADRState,
    genericChart: GenericChartState,
    adrUpload: ADRUploadState,
    hintrVersion: HintrVersionState,
    baseline: BaselineState,
    metadata: MetadataState,
    surveyAndProgram: SurveyAndProgramState,
    modelOptions: ModelOptionsState
    modelRun: ModelRunState,
    modelCalibrate: ModelCalibrateState,
    modelOutput: ModelOutputState,
    plottingSelections: PlottingSelectionsState,
    // Output data used for plotting
    plotData: PlotDataState,
    // Control and filter selections for output plots
    plotSelections: PlotSelectionsState,
    // Colour and size scales selected by user in output plots
    plotState: PlotState,
    stepper: StepperState,
    load: LoadState,
    errors: ErrorsState,
    projects: ProjectsState
    currentUser: string,
    downloadResults: DownloadResultsState,
    downloadIndicator: DownloadIndicatorState,
    invalidSteps: number[]
}

export interface ReadyState {
    ready: boolean
}

export interface WarningsState {
    warnings: Warning[]
}

const persistState = (store: Store<RootState>): void => {
    store.subscribe((mutation: MutationPayload, state: RootState) => {
        // console.log(mutation.type);
        localStorageManager.saveState(state);

        const {dispatch} = store;
        const type = stripNamespace(mutation.type);
        if (type[0] !== "projects" && type[0] !== "errors") {
            dispatch("projects/queueVersionStateUpload", null, {root: true});
        }
    })
};

const resetState = (store: Store<RootState>): void => {
    store.subscribe((mutation: MutationPayload, state: RootState) => {

        if (state.baseline.ready
            && state.surveyAndProgram.ready
            && state.modelRun.ready
            && state.modelCalibrate.ready) {

            const type = stripNamespace(mutation.type);

            if (type[0] == "baseline") {
                if (BaselineDatasetUpdates.includes(type[1] as BaselineMutation)) {
                    // Reset options when a new dataset is uploaded.
                    if (state.baseline.selectedDatasetHasChanged) {
                        store.commit(RootMutation.ResetOptions);
                    }
                }

                if (BaselineUpdates.includes(type[1] as BaselineMutation)) {
                    store.commit(RootMutation.ResetSelectedDataType);
                    /** If data has been updated without changing the selected dataset,
                     *  retain model options, but reset their valid status to false in order to force revalidation
                     */
                    store.commit({type: `modelOptions/${ModelOptionsMutation.UnValidate}`}, {root:true});
                    store.commit(RootMutation.ResetOutputs);
                }
            }

            if (type[0] == "surveyAndProgram" && SurveyAndProgramUpdates.includes(type[1] as SurveyAndProgramMutation)) {
                store.commit(RootMutation.ResetSelectedDataType);
                store.commit({type: `modelOptions/${ModelOptionsMutation.UnValidate}`}, {root:true});
                store.commit(RootMutation.ResetOutputs);
            }

            if (type[0] == "modelOptions" && ModelOptionsUpdates.includes(type[1] as ModelOptionsMutation)) {
                store.commit(RootMutation.ResetOutputs);
            }

            if (type[0] == "modelRun" && ModelRunUpdates.includes(type[1] as ModelRunMutation)) {
                store.commit(RootMutation.ResetOutputs);
            }

            if (type[0] == "modelCalibrate" && ModelCalibrateUpdates.includes(type[1] as ModelCalibrateMutation)) {
                store.commit(
                    {type: `downloadResults/${DownloadResultsMutation.ResetIds}`},
                    {root: true});
                store.commit(RootMutation.ResetDownload);
            }
        }
    })
};

declare const currentUser: string;

export const emptyState = (): RootState => {
    return {
        language: Language.en,
        version: currentHintVersion,
        updatingLanguage: false,
        hintrVersion: initialHintrVersionState(),
        adr: initialADRState(),
        genericChart: initialGenericChartState(),
        adrUpload: initialADRUploadState(),
        baseline: initialBaselineState(),
        metadata: initialMetadataState(),
        surveyAndProgram: initialSurveyAndProgramState(),
        modelCalibrate: initialModelCalibrateState(),
        modelOptions: initialModelOptionsState(),
        modelOutput: initialModelOutputState(),
        modelRun: initialModelRunState(),
        stepper: initialStepperState(),
        load: initialLoadState(),
        plottingSelections: initialPlottingSelectionsState(),
        plotData: initialPlotDataState(),
        plotSelections: initialPlotSelectionsState(),
        plotState: initialPlotState(),
        errors: initialErrorsState(),
        projects: initialProjectsState(),
        currentUser: currentUser,
        downloadResults: initialDownloadResultsState(),
        downloadIndicator: initialDownloadIndicatorState(),
        invalidSteps: []
    }
};

const existingState = localStorageManager.getState();

export const storeOptions: StoreOptions<RootState> = {
    state: {...emptyState(), ...existingState},
    modules: {
        adr,
        genericChart,
        adrUpload,
        baseline: baseline(existingState),
        metadata: metadata(existingState),
        surveyAndProgram: surveyAndProgram(existingState),
        modelCalibrate: modelCalibrate(existingState),
        modelOptions: modelOptions(existingState),
        modelRun: modelRun(existingState),
        modelOutput: modelOutput(existingState),
        plottingSelections: plottingSelections(existingState),
        plotData,
        plotSelections,
        plotState,
        stepper: stepper(existingState),
        load,
        errors,
        projects,
        hintrVersion: hintrVersion(existingState),
        downloadResults,
        downloadIndicator
    },
    actions: actions,
    mutations: mutations,
    getters: getters,
    plugins: [persistState, resetState]
};
