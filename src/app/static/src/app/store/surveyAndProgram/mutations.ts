import {MutationTree} from 'vuex';
import {SurveyAndProgramDataState} from "./surveyAndProgram";
import {PayloadWithType} from "../../types";
import {AncResponse, ProgrammeResponse, SurveyResponse} from "../../generated";
import {ReadyState} from "../../root";

export enum SurveyAndProgramMutation {
    SurveyUpdated = "SurveyUpdated",
    SurveyError = "SurveyError",
    ProgramUpdated = "ProgramUpdated",
    ProgramError = "ProgramError",
    ANCUpdated = "ANCUpdated",
    ANCError = "ANCError",
    Ready = "Ready"
}

export const SurveyAndProgramUpdates = [
    SurveyAndProgramMutation.SurveyUpdated,
    SurveyAndProgramMutation.ProgramUpdated,
    SurveyAndProgramMutation.ANCUpdated
];

export const mutations: MutationTree<SurveyAndProgramDataState> = {
    [SurveyAndProgramMutation.SurveyUpdated](state: SurveyAndProgramDataState, action: PayloadWithType<SurveyResponse>) {
        state.survey = action.payload;
        state.surveyError = "";
    },

    [SurveyAndProgramMutation.SurveyError](state: SurveyAndProgramDataState, action: PayloadWithType<string>) {
        state.surveyError = action.payload;
    },

    [SurveyAndProgramMutation.ProgramUpdated](state: SurveyAndProgramDataState, action: PayloadWithType<ProgrammeResponse>) {
        state.program = action.payload;
        state.programError = "";
    },

    [SurveyAndProgramMutation.ProgramError](state: SurveyAndProgramDataState, action: PayloadWithType<string>) {
        state.programError = action.payload;
    },

    [SurveyAndProgramMutation.ANCUpdated](state: SurveyAndProgramDataState, action: PayloadWithType<AncResponse>) {
        state.anc = action.payload;
        state.ancError = "";
    },

    [SurveyAndProgramMutation.ANCError](state: SurveyAndProgramDataState, action: PayloadWithType<string>) {
        state.ancError = action.payload;
    },

    [SurveyAndProgramMutation.Ready](state: ReadyState) {
        state.ready = true;
    }
};
