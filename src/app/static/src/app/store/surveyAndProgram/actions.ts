import {ActionContext, ActionTree, Commit} from 'vuex';
import {RootState} from "../../root";
import {DataType} from "../filteredData/filteredData";
import {SurveyAndProgramDataState} from "./surveyAndProgram";
import {api} from "../../apiService";
import {AncResponse, ProgrammeResponse, SurveyResponse} from "../../generated";
import {SurveyAndProgramMutation} from "./mutations";

export interface SurveyAndProgramActions {
    uploadSurvey: (store: ActionContext<SurveyAndProgramDataState, RootState>, formData: FormData) => void,
    uploadProgram: (store: ActionContext<SurveyAndProgramDataState, RootState>, formData: FormData) => void,
    uploadANC: (store: ActionContext<SurveyAndProgramDataState, RootState>, formData: FormData) => void
    getSurveyAndProgramData: (store: ActionContext<SurveyAndProgramDataState, RootState>) => void;
    deleteSurvey: (store: ActionContext<SurveyAndProgramDataState, RootState>) => void
    deleteProgram: (store: ActionContext<SurveyAndProgramDataState, RootState>) => void
    deleteANC: (store: ActionContext<SurveyAndProgramDataState, RootState>) => void
    deleteAll: (store: ActionContext<SurveyAndProgramDataState, RootState>) => void
}

function commitSelectedDataTypeUpdated(commit: Commit, dataType: DataType) {
    commit("filteredData/SelectedDataTypeUpdated",
        {type: "SelectedDataTypeUpdated", payload: dataType}, {root: true})
}

export const actions: ActionTree<SurveyAndProgramDataState, RootState> & SurveyAndProgramActions = {

    async uploadSurvey({commit}, formData) {
        commit({type: "SurveyUpdated", payload: null});
        await api(commit)
            .withError(SurveyAndProgramMutation.SurveyError)
            .withSuccess(SurveyAndProgramMutation.SurveyUpdated)
            .postAndReturn<SurveyResponse>("/disease/survey/", formData)
            .then((response) => {
                if (response) {
                    commitSelectedDataTypeUpdated(commit, DataType.Survey);
                }
            });
    },

    async uploadProgram({commit}, formData) {
        commit({type: "ProgramUpdated", payload: null});
        await api(commit)
            .withError(SurveyAndProgramMutation.ProgramError)
            .withSuccess(SurveyAndProgramMutation.ProgramUpdated)
            .postAndReturn<ProgrammeResponse>("/disease/programme/", formData)
            .then((response) => {
                if (response) {
                    commitSelectedDataTypeUpdated(commit, DataType.Program);
                }
            });
    },

    async uploadANC({commit}, formData) {
        commit({type: "ANCUpdated", payload: null});
        await api(commit)
            .withError(SurveyAndProgramMutation.ANCError)
            .withSuccess(SurveyAndProgramMutation.ANCUpdated)
            .postAndReturn<ProgrammeResponse>("/disease/anc/", formData)
            .then((response) => {
                if (response) {
                    commitSelectedDataTypeUpdated(commit, DataType.ANC);
                }
            });
    },

    async deleteSurvey({commit}) {
        await api(commit)
            .delete("/disease/survey/")
            .then(() => {
                commit({type: "SurveyUpdated", payload: null});
            });
    },

    async deleteProgram({commit}) {
        await api(commit)
            .delete("/disease/programme/")
            .then(() => {
                commit({type: SurveyAndProgramMutation.ProgramUpdated, payload: null});
            });
    },

    async deleteANC({commit}) {
        await api(commit)
            .delete("/disease/anc/")
            .then(() => {
                commit({type: SurveyAndProgramMutation.ANCUpdated, payload: null});
            });
    },

    async deleteAll(store) {
        await Promise.all([
            actions.deleteSurvey(store),
            actions.deleteProgram(store),
            actions.deleteANC(store)
        ]);
    },

    async getSurveyAndProgramData({commit}) {

        await Promise.all(
            [api(commit)
                .ignoreErrors()
                .withSuccess(SurveyAndProgramMutation.SurveyUpdated)
                .get<SurveyResponse>("/disease/survey/"),
                api(commit)
                    .ignoreErrors()
                    .withSuccess(SurveyAndProgramMutation.ProgramUpdated)
                    .get<ProgrammeResponse>("/disease/programme/"),
                api(commit)
                    .ignoreErrors()
                    .withSuccess(SurveyAndProgramMutation.ANCUpdated)
                    .get<AncResponse>("/disease/anc/")]);

        commit({type: SurveyAndProgramMutation.Ready, payload: true});
    }
};
