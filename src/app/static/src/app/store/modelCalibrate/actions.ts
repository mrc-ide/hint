import {ModelCalibrateState} from "./modelCalibrate";
import {ActionContext, ActionTree, Commit, Dispatch} from "vuex";
import {DynamicFormData, DynamicFormMeta} from "@reside-ic/vue-next-dynamic-form";
import {api} from "../../apiService";
import {RootState} from "../../root";
import {ModelCalibrateMutation} from "./mutations";
import {
    BarchartIndicator,
    CalibrateDataResponse,
    CalibrateMetadataResponse,
    CalibrateResultResponse,
    Filter,
    FilterOption,
    ModelResultResponse,
    ModelStatusResponse,
    ModelSubmitResponse
} from "../../generated";
import {switches} from "../../featureSwitches";
import {CalibrateResultWithType, Dict, ModelOutputTabs} from "../../types";
import {DownloadResultsMutation} from "../downloadResults/mutations";
import {PlottingSelectionsMutations} from "../plottingSelections/mutations";
import { ModelOutputMutation } from "../modelOutput/mutations";
import { FetchResultDataPayload } from "../plottingSelections/actions";
import { getPayloadWithNestedAreas } from "./utils";

type FilterDataPayload = {
    payload: FetchResultDataPayload,
    tab: ModelOutputTabs
}

export interface ModelCalibrateActions {
    fetchModelCalibrateOptions: (store: ActionContext<ModelCalibrateState, RootState>) => void
    submit: (store: ActionContext<ModelCalibrateState, RootState>, options: DynamicFormData) => void
    poll: (store: ActionContext<ModelCalibrateState, RootState>) => void
    getResult: (store: ActionContext<ModelCalibrateState, RootState>) => void
    getCalibratePlot: (store: ActionContext<ModelCalibrateState, RootState>) => void
    getComparisonPlot: (store: ActionContext<ModelCalibrateState, RootState>) => void
    resumeCalibrate: (store: ActionContext<ModelCalibrateState, RootState>) => void
    getResultData: (store: ActionContext<ModelCalibrateState, RootState>, payload: FilterDataPayload) => void
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
        const {commit, state} = context;
        const calibrateId = state.calibrateId;
        commit(ModelCalibrateMutation.CalibrationPlotStarted);

        const response = await api<ModelCalibrateMutation, ModelCalibrateMutation>(context)
            .ignoreSuccess()
            .withError(ModelCalibrateMutation.SetError)
            .freezeResponse()
            .get<ModelResultResponse>(`calibrate/plot/${calibrateId}`);

        if (response) {
            commit(ModelCalibrateMutation.SetPlotData, response.data);
        }
    },

    async getComparisonPlot(context) {
        const {commit, state} = context;
        const calibrateId = state.calibrateId;
        commit(ModelCalibrateMutation.ComparisonPlotStarted);

        const response = await api<ModelCalibrateMutation, ModelCalibrateMutation>(context)
            .withError(ModelCalibrateMutation.SetComparisonPlotError)
            .ignoreSuccess()
            .freezeResponse()
            .get<CalibrateResultResponse>(`model/comparison/plot/${calibrateId}`);

        if (response) {
            if (response.data) {
                selectFilterDefaults(response.data, commit, PlottingSelectionsMutations.updateComparisonPlotSelections)
            }
            commit(ModelCalibrateMutation.SetComparisonPlotData, response.data);
        }
    },

    async resumeCalibrate(context) {
        const {dispatch, state} = context;
        if (state.calibrating && !state.complete && state.calibrateId) {
            await dispatch("poll");
        }
    },

    async getResultData(context, payload) {
        const {payload: fetchPayload, tab} = payload;
        const {commit, state, rootGetters} = context;
        const calibrateId = state.calibrateId;
        if (!state.status.done) return;

        // temporary, necessary for map plot types to get nested area data points
        const payloadWithNestedAreas = getPayloadWithNestedAreas(fetchPayload, tab, rootGetters);

        const loadingTimeout = setTimeout(() => {
            commit(`modelOutput/${ModelOutputMutation.SetTabLoading}`, {payload:{tab, loading: true}}, {root: true});
        }, 300);

        const response = await api<ModelCalibrateMutation, ModelCalibrateMutation>(context)
            .ignoreSuccess()
            .withError(ModelCalibrateMutation.SetError)
            .freezeResponse()
            .postAndReturn<CalibrateDataResponse["data"]>(`calibrate/result/filteredData/${calibrateId}`, payloadWithNestedAreas);
        if (response) {
            commit({type: ModelCalibrateMutation.SetData, payload: response.data});
        }

        clearTimeout(loadingTimeout);
        commit(`modelOutput/${ModelOutputMutation.SetTabLoading}`, {payload:{tab, loading: false}}, {root: true});
    }
};

export const getResultMetadata = async function (context: ActionContext<ModelCalibrateState, RootState>) {
    const {commit, dispatch, state} = context;
    const calibrateId = state.calibrateId;

    const response = await api<ModelCalibrateMutation, ModelCalibrateMutation>(context)
        .ignoreSuccess()
        .withError(ModelCalibrateMutation.SetError)
        .freezeResponse()
        .get<CalibrateMetadataResponse>(`calibrate/result/metadata/${calibrateId}`);

    if (response) {
        const data = response.data;
        commit({type: ModelCalibrateMutation.MetadataFetched, payload: data});

        selectFilterDefaults(data, commit, PlottingSelectionsMutations.updateBarchartSelections)

        commit(ModelCalibrateMutation.Calibrated);

        if (switches.modelCalibratePlot) {
            dispatch("getCalibratePlot");
        }
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

const selectFilterDefaults = (data: CalibrateMetadataResponse, commit: Commit, mutationName: string) => {
    if (data?.plottingMetadata?.barchart?.defaults) {
        const defaults = data.plottingMetadata.barchart.defaults;
        const unfrozenDefaultOptions = Object.keys(defaults.selected_filter_options)
            .reduce((dict, key) => {
                dict[key] = [...defaults.selected_filter_options[key]];
                return dict;
            }, {} as Dict<FilterOption[]>);

        commit({
                type: `plottingSelections/${mutationName}`,
                payload: {
                    indicatorId: defaults.indicator_id,
                    xAxisId: defaults.x_axis_id,
                    disaggregateById: defaults.disaggregate_by_id,
                    selectedFilterOptions: unfrozenDefaultOptions
                }
            },
            {root: true});
    }
}
