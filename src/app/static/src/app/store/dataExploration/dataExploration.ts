import {Language} from "../translations/locales";
import {currentHintVersion} from "../../hintVersion";
import {hintrVersion, HintrVersionState, initialHintrVersionState} from "../hintrVersion/hintrVersion";
import {adr, ADRState, initialADRState} from "../adr/adr";
import {genericChart, GenericChartState, initialGenericChartState} from "../genericChart/genericChart";
import {ADRUploadState, initialADRUploadState} from "../adrUpload/adrUpload";
import {baseline, BaselineState, initialBaselineState} from "../baseline/baseline";
import {initialMetadataState, metadata, MetadataState} from "../metadata/metadata";
import {
    initialSurveyAndProgramState,
    surveyAndProgram,
    SurveyAndProgramState
} from "../surveyAndProgram/surveyAndProgram";
import {
    initialPlottingSelectionsState,
    plottingSelections,
    PlottingSelectionsState
} from "../plottingSelections/plottingSelections";
import {errors, ErrorsState, initialErrorsState} from "../errors/errors";
import {localStorageManager} from "../../localStorageManager";
import {MutationPayload, Store, StoreOptions} from "vuex";
import {TranslatableState} from "../../types";
import {mutations} from "./mutations";
import {getters} from "./getters";
import {actions} from "./actions";
import {dataExplorationStepper, initialDataExplorationStepperState, StepperState} from "../stepper/stepper";

declare const currentUser: string;

export interface DataExplorationState extends TranslatableState {
    version: string,
    adr: ADRState,
    genericChart: GenericChartState,
    adrUpload: ADRUploadState,
    hintrVersion: HintrVersionState,
    baseline: BaselineState,
    metadata: MetadataState,
    surveyAndProgram: SurveyAndProgramState,
    plottingSelections: PlottingSelectionsState,
    stepper: StepperState,
    errors: ErrorsState,
    currentUser: string,
    dataExplorationMode: boolean
}

export const initialDataExplorationState = (): DataExplorationState => {
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
        stepper: initialDataExplorationStepperState(),
        surveyAndProgram: initialSurveyAndProgramState(),
        plottingSelections: initialPlottingSelectionsState(),
        errors: initialErrorsState(),
        currentUser: currentUser,
        dataExplorationMode: true
    }
};

localStorageManager.deleteState(false); //Clear state in other mode if it exists
const existingState = localStorageManager.getState(true);

const persistState = (store: Store<DataExplorationState>): void => {
    store.subscribe((mutation: MutationPayload, state: DataExplorationState) => {
        console.log(mutation.type);
        localStorageManager.saveState(state);
    })
};

export const storeOptions: StoreOptions<DataExplorationState> = {
    state: {...initialDataExplorationState(), ...existingState},
    modules: {
        adr,
        genericChart,
        baseline: baseline(existingState),
        metadata: metadata(existingState),
        surveyAndProgram: surveyAndProgram(existingState),
        plottingSelections: plottingSelections(existingState) as any,
        stepper: dataExplorationStepper(existingState),
        errors,
        hintrVersion: hintrVersion(existingState)
    },
    mutations,
    getters,
    actions,
    plugins: [persistState]
};
