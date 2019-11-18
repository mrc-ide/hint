import {MutationPayload, Store, StoreOptions} from "vuex";
import {baseline, BaselineState, initialBaselineState} from "./store/baseline/baseline";
import {initialMetadataState, metadata, MetadataState} from "./store/metadata/metadata";
import {filteredData, FilteredDataState, initialFilteredDataState} from "./store/filteredData/filteredData";
import {
    initialSurveyAndProgramDataState,
    surveyAndProgram,
    SurveyAndProgramDataState,
} from "./store/surveyAndProgram/surveyAndProgram";
import {initialModelRunState, modelRun, ModelRunState} from "./store/modelRun/modelRun";
import {initialStepperState, stepper, StepperState} from "./store/stepper/stepper";
import {initialLoadState, load, LoadState} from "./store/load/load";
import {modelOutput, ModelOutputState} from "./store/modelOutput/modelOutput";
import {localStorageManager} from "./localStorageManager";
import {actions} from "./store/root/actions";
import {mutations} from "./store/root/mutations";
import {initialModelOptionsState, modelOptions, ModelOptionsState} from "./store/modelOptions/modelOptions";

export interface RootState {
    version: string;
    baseline: BaselineState,
    metadata: MetadataState,
    surveyAndProgram: SurveyAndProgramDataState,
    filteredData: FilteredDataState,
    modelOptions: ModelOptionsState
    modelRun: ModelRunState,
    modelOutput: ModelOutputState,
    stepper: StepperState,
    load: LoadState
}

export interface ReadyState {
    ready: boolean
}

const persistState = (store: Store<RootState>) => {
    store.subscribe((mutation: MutationPayload, state: RootState) => {
        console.log(mutation.type);
        localStorageManager.saveState(state);

        if (state.baseline.ready
            && state.surveyAndProgram.ready
            && state.modelRun.ready) {

            switch (mutation.type.split("/")[0]) {
                case "baseline":
                    if (mutation.type.indexOf("Updated") == -1) break;
                    store.commit({type: "ResetInputs"});
                case "surveyAndProgram":
                    if (mutation.type.indexOf("Updated") == -1) break;
                    store.commit({type: "ResetOptions"});
                case "modelOptions":
                    if (mutation.type.indexOf("update") == -1) break;
                    store.commit({type: "ResetOutputs"});
            }

        }
    })
};

export const emptyState = {
    version: '0.0.0',
    baseline: initialBaselineState,
    metadata: initialMetadataState,
    surveyAndProgram: initialSurveyAndProgramDataState,
    filteredData: initialFilteredDataState,
    modelOptions: initialModelOptionsState,
    modelOutput: {},
    modelRun: initialModelRunState,
    stepper: initialStepperState,
    load: initialLoadState,
};

export const storeOptions: StoreOptions<RootState> = {
    modules: {
        baseline,
        metadata,
        surveyAndProgram,
        filteredData,
        modelOptions,
        modelRun,
        modelOutput,
        stepper,
        load
    },
    actions: actions,
    mutations: mutations,
    plugins: [persistState]
};
