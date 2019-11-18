import {ActionContext, ActionTree} from 'vuex';
import {BaselineState} from "./baseline";
import {RootState} from "../../root";
import {api} from "../../apiService";
import {PjnzResponse, ValidateBaselineResponse} from "../../generated";

export type BaselineActionTypes = "PJNZUpdated" | "ShapeUpdated" | "PopulationUpdated" | "Validated"
export type BaselineErrorActionTypes =
    "PJNZUploadError"
    | "ShapeUploadError"
    | "PopulationUploadError"
    | "BaselineError"

export interface BaselineActions {
    uploadPJNZ: (store: ActionContext<BaselineState, RootState>, formData: FormData) => void
    uploadShape: (store: ActionContext<BaselineState, RootState>, formData: FormData) => void,
    uploadPopulation: (store: ActionContext<BaselineState, RootState>, formData: FormData) => void,
    deletePJNZ: (store: ActionContext<BaselineState, RootState>) => void
    deleteShape: (store: ActionContext<BaselineState, RootState>) => void,
    deleteAll: (store: ActionContext<BaselineState, RootState>) => void,
    deletePopulation: (store: ActionContext<BaselineState, RootState>) => void,
    getBaselineData: (store: ActionContext<BaselineState, RootState>) => void
    validate: (store: ActionContext<BaselineState, RootState>) => void
}

export const actions: ActionTree<BaselineState, RootState> & BaselineActions = {

    async uploadPJNZ({commit, dispatch, state}, formData) {
        commit({type: "PJNZUpdated", payload: null});
        await api<BaselineActionTypes, BaselineErrorActionTypes>(commit)
            .withSuccess("PJNZUpdated")
            .withError("PJNZUploadError")
            .postAndReturn<PjnzResponse>("/baseline/pjnz/", formData)
            .then(() => {
                dispatch('metadata/getPlottingMetadata', state.iso3, {root: true});
                dispatch('validate');
            });
    },

    async uploadShape({commit, dispatch}, formData) {
        commit({type: "ShapeUpdated", payload: null});
        await api<BaselineActionTypes, BaselineErrorActionTypes>(commit)
            .withSuccess("ShapeUpdated")
            .withError("ShapeUploadError")
            .postAndReturn<PjnzResponse>("/baseline/shape/", formData)
            .then(() => {
                dispatch('validate');
            });
    },

    async uploadPopulation({commit, dispatch}, formData) {
        commit({type: "PopulationUpdated", payload: null});
        await api<BaselineActionTypes, BaselineErrorActionTypes>(commit)
            .withSuccess("PopulationUpdated")
            .withError("PopulationUploadError")
            .postAndReturn<PjnzResponse>("/baseline/population/", formData)
            .then(() => {
                dispatch('validate');
            });
    },

    async deletePJNZ({commit, dispatch}) {
        await api(commit)
            .delete("/baseline/pjnz/")
            .then(() => {
                commit({type: "PJNZUpdated", payload: null});
                dispatch("surveyAndProgram/deleteAll", {}, {root: true});
            });
    },

    async deleteShape({commit, dispatch}) {
        await api(commit)
            .delete("/baseline/shape/")
            .then(() => {
                commit({type: "ShapeUpdated", payload: null});
                dispatch("surveyAndProgram/deleteAll", {}, {root: true});
            });
    },

    async deletePopulation({commit, dispatch}) {
        await api(commit)
            .delete("/baseline/population/")
            .then(() => {
                commit({type: "PopulationUpdated", payload: null});
                dispatch("surveyAndProgram/deleteAll", {}, {root: true});
            });
    },

    async deleteAll(store) {
        await Promise.all([
            actions.deletePJNZ(store),
            actions.deleteShape(store),
            actions.deletePopulation(store)
        ]);
    },

    async getBaselineData({commit, dispatch}) {
        await Promise.all([
            api<BaselineActionTypes, BaselineErrorActionTypes>(commit)
                .ignoreErrors()
                .withSuccess("PJNZUpdated")
                .get<PjnzResponse>("/baseline/pjnz/"),
            api<BaselineActionTypes, BaselineErrorActionTypes>(commit)
                .ignoreErrors()
                .withSuccess("PopulationUpdated")
                .get<PjnzResponse>("/baseline/population/"),
            api<BaselineActionTypes, BaselineErrorActionTypes>(commit)
                .ignoreErrors()
                .withSuccess("ShapeUpdated")
                .get<PjnzResponse>("/baseline/shape/")
        ]);

        await dispatch('validate');

        commit({type: "Ready", payload: true});
    },

    async validate({commit}) {
        commit({type: "Validating", payload: null});
        await api<BaselineActionTypes, BaselineErrorActionTypes>(commit)
            .withSuccess("Validated")
            .withError("BaselineError")
            .get<ValidateBaselineResponse>("/baseline/validate/");
    }
};
