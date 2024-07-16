import {ModelCalibrateState} from "./modelCalibrate";
import {ActionContext, ActionTree} from "vuex";
import {DynamicFormData, DynamicFormMeta} from "@reside-ic/vue-next-dynamic-form";
import {api} from "../../apiService";
import {RootState} from "../../root";
import {ModelCalibrateMutation} from "./mutations";
import {
    CalibrateMetadataResponse,
    CalibratePlotResponse,
    ComparisonPlotResponse,
    ModelStatusResponse,
    ModelSubmitResponse
} from "../../generated";
import {DownloadResultsMutation} from "../downloadResults/mutations";
import {commitPlotDefaultSelections, filtersAfterUseShapeRegions} from "../plotSelections/utils";
import {commitInitialScaleSelections} from "../plotState/utils";

export interface ModelCalibrateActions {
    fetchModelCalibrateOptions: (store: ActionContext<ModelCalibrateState, RootState>) => void
    submit: (store: ActionContext<ModelCalibrateState, RootState>, options: DynamicFormData) => void
    poll: (store: ActionContext<ModelCalibrateState, RootState>) => void
    getResult: (store: ActionContext<ModelCalibrateState, RootState>) => void
    getComparisonPlot: (store: ActionContext<ModelCalibrateState, RootState>) => void
    resumeCalibrate: (store: ActionContext<ModelCalibrateState, RootState>) => void
}

export const actions: ActionTree<ModelCalibrateState, RootState> & ModelCalibrateActions = {

    async fetchModelCalibrateOptions(context) {
        const {commit, rootState} = context;
        commit(ModelCalibrateMutation.FetchingModelCalibrateOptions);
        const response = await api<ModelCalibrateMutation, ModelCalibrateMutation>(context)
            .withSuccess(ModelCalibrateMutation.ModelCalibrateOptionsFetched)
            .ignoreErrors()
            .get<DynamicFormMeta>(`calibrate/options/${rootState.baseline.iso3}`);

        if (response) {
            commit({type: ModelCalibrateMutation.SetModelCalibrateOptionsVersion, payload: response.version});
        }
    },

    async submit(context, options) {
        const {commit, dispatch, state, rootState} = context;
        const modelRunId = rootState.modelRun.modelRunId;
        const version = state.version;

        commit({type: ModelCalibrateMutation.SetOptionsData, payload: options});

        const response = await api<ModelCalibrateMutation, ModelCalibrateMutation>(context)
            .withSuccess(ModelCalibrateMutation.CalibrateStarted)
            .withError(ModelCalibrateMutation.SetError)
            .postAndReturn<ModelSubmitResponse>(`calibrate/submit/${modelRunId}`, {options, version});

        if (response) {
            commit({type: `downloadResults/${DownloadResultsMutation.ResetIds}`}, {root: true});
            await dispatch("poll");
        }
    },

    async poll(context) {
        const {commit} = context;
        const id = setInterval(() => {
            getCalibrateStatus(context);
        }, 2000);

        commit({type: "PollingForStatusStarted", payload: id});
    },

    async getResult(context) {
        const {commit, state} = context;

        if (state.status.done) {
            await getResultMetadata(context);
        }
        commit(ModelCalibrateMutation.Ready);
    },

    async getCalibratePlot(context) {
        const {commit, state, rootState} = context;
        const calibrateId = state.calibrateId;
        commit(ModelCalibrateMutation.CalibrationPlotStarted);

        const response = await api<ModelCalibrateMutation, ModelCalibrateMutation>(context)
            .ignoreSuccess()
            .withError(ModelCalibrateMutation.SetError)
            .freezeResponse()
            .get<CalibratePlotResponse>(`calibrate/plot/${calibrateId}`);

        if (response) {
            commit(ModelCalibrateMutation.SetCalibratePlotResult, response.data);
            await commitPlotDefaultSelections(response.data.metadata, commit, rootState);
            commit(ModelCalibrateMutation.CalibratePlotFetched);
        }
    },

    async getComparisonPlot(context) {
        const {commit, state, rootState} = context;
        const calibrateId = state.calibrateId;
        commit(ModelCalibrateMutation.ComparisonPlotStarted);

        const response = await api<ModelCalibrateMutation, ModelCalibrateMutation>(context)
            .withError(ModelCalibrateMutation.SetComparisonPlotError)
            .ignoreSuccess()
            .get<ComparisonPlotResponse>(`model/comparison/plot/${calibrateId}`);

        if (response) {
            commit(ModelCalibrateMutation.SetComparisonPlotData, response.data);
            const metadata= response.data.metadata
            metadata.filterTypes = filtersAfterUseShapeRegions(metadata.filterTypes, rootState);
            await commitPlotDefaultSelections(metadata, commit, rootState);
        }
    },

    async resumeCalibrate(context) {
        const {dispatch, state} = context;
        if (state.calibrating && !state.complete && state.calibrateId) {
            await dispatch("poll");
        }
    }
};

export const getResultMetadata = async function (context: ActionContext<ModelCalibrateState, RootState>) {
    const {commit, dispatch, state, rootState} = context;
    const calibrateId = state.calibrateId;

    const response = await api<ModelCalibrateMutation, ModelCalibrateMutation>(context)
        .ignoreSuccess()
        .withError(ModelCalibrateMutation.SetError)
        .get<CalibrateMetadataResponse>(`calibrate/result/metadata/${calibrateId}`);

    if (response) {
        const data = response.data;
        data.filterTypes = filtersAfterUseShapeRegions(data.filterTypes, rootState);
        commit({type: ModelCalibrateMutation.MetadataFetched, payload: data});

        await commitPlotDefaultSelections(data, commit, rootState);
        commitInitialScaleSelections(data.indicators, commit);

        commit(ModelCalibrateMutation.Calibrated);
        await dispatch("getCalibratePlot");
        await dispatch("getComparisonPlot");
    }
}

export const getCalibrateStatus = async function (context: ActionContext<ModelCalibrateState, RootState>) {
    const {dispatch, state} = context;
    const calibrateId = state.calibrateId;
    return api<ModelCalibrateMutation, ModelCalibrateMutation>(context)
        .withSuccess(ModelCalibrateMutation.CalibrateStatusUpdated)
        .withError(ModelCalibrateMutation.SetError)
        .get<ModelStatusResponse>(`calibrate/status/${calibrateId}`)
        .then(() => {
            if (state.status && state.status.done) {
                dispatch("getResult");
            }
        });
};
