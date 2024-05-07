import {Module} from 'vuex';
import {actions} from './actions';
import {mutations} from './mutations';
import {ReadyState, WarningsState} from "../../root";
import {AncResponse, ProgrammeResponse, SurveyResponse, VmmcResponse, Error, Warning} from "../../generated";
import {getters} from "./getters";
import {RootState} from "../../root";

export enum DataType { ANC, Program, Survey, Vmmc}

export enum FileType {
    ANC = "anc",
    Programme = "programme",
    Survey = "survey",
    Shape = "shape"
}

export interface SAPWarnings {
    type: string,
    warnings: Warning[]
}

export interface SurveyAndProgramState extends ReadyState, WarningsState {
    selectedDataType: DataType | null
    survey: SurveyResponse | null
    surveyError: Error | null
    surveyErroredFile: string | null
    program: ProgrammeResponse | null
    programError: Error | null
    programErroredFile: string | null
    anc: AncResponse | null
    ancError: Error | null
    ancErroredFile: string | null
    vmmc: VmmcResponse | null
    vmmcError: Error | null
    vmmcErroredFile: string | null
    sapWarnings: SAPWarnings[]
}

export const initialSurveyAndProgramState = (): SurveyAndProgramState => {
    return {
        selectedDataType: null,
        survey: null,
        surveyError: null,
        surveyErroredFile: null,
        program: null,
        programError: null,
        programErroredFile: null,
        anc: null,
        ancError: null,
        ancErroredFile: null,
        vmmc: null,
        vmmcError: null,
        vmmcErroredFile: null,
        ready: false,
        warnings: [],
        sapWarnings: []
    }
};

const namespaced = true;

export const surveyAndProgram = (existingState: Partial<RootState> | null): Module<SurveyAndProgramState, RootState> => {
    return {
        namespaced,
        state: {...initialSurveyAndProgramState(), ...existingState && existingState.surveyAndProgram},
        getters,
        actions,
        mutations
    };
};
