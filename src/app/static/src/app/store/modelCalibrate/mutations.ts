import {MutationTree} from 'vuex';
import {ModelCalibrateState} from "./modelCalibrate";
import {DynamicFormData, DynamicFormMeta} from "@reside-ic/vue-next-dynamic-form";
import {CalibrateResultWithType, PayloadWithType} from "../../types";
import {parseAndFillForm} from "../../utils";
import {
    CalibrateMetadataResponse,
    CalibrateStatusResponse,
    CalibrateSubmitResponse,
    ComparisonPlotResponse,
    Error,
    VersionInfo,
} from "../../generated";

export enum ModelCalibrateMutation {
    FetchingModelCalibrateOptions = "FetchingModelCalibrateOptions",
    ModelCalibrateOptionsFetched = "ModelCalibrateOptionsFetched",
    SetModelCalibrateOptionsVersion = "SetModelCalibrateOptionsVersion",
    Update = "Update",
    CalibrateStarted = "CalibrateStarted",
    CalibrateStatusUpdated = "CalibrateStatusUpdated",
    Calibrated = "Calibrated",
    SetOptionsData = "SetOptionsData",
    SetError = "SetError",
    SetComparisonPlotError = "SetComparisonPlotError",
    PollingForStatusStarted = "PollingForStatusStarted",
    Ready = "Ready",
    CalibrationPlotStarted = "CalibrationPlotStarted",
    ComparisonPlotStarted = "ComparisonPlotStarted",
    SetPlotData = "SetPlotData",
    SetComparisonPlotData = "SetComparisonPlotData",
    CalibrateResultFetched = "CalibrateResultFetched",
    ClearWarnings = "ClearWarnings",
    ResetIds = "ResetIds",
    MetadataFetched = "MetadataFetched"
}

export const ModelCalibrateUpdates = [
    ModelCalibrateMutation.Calibrated
];


export const mutations: MutationTree<ModelCalibrateState> = {
    [ModelCalibrateMutation.Ready](state: ModelCalibrateState) {
        state.ready = true;
    },

    [ModelCalibrateMutation.FetchingModelCalibrateOptions](state: ModelCalibrateState) {
        state.fetching = true;
    },

    [ModelCalibrateMutation.ModelCalibrateOptionsFetched](state: ModelCalibrateState, action: PayloadWithType<DynamicFormMeta>) {
        parseAndFillForm(state.options, action.payload);
        state.optionsFormMeta = action.payload;
        state.fetching = false;
    },

    [ModelCalibrateMutation.Update](state: ModelCalibrateState, payload: DynamicFormMeta) {
        state.complete = false;
        state.optionsFormMeta = payload;
    },

    [ModelCalibrateMutation.CalibrateStarted](state: ModelCalibrateState, action: PayloadWithType<CalibrateSubmitResponse>) {
        state.calibrateId = action.payload.id;
        state.calibrating = true;
        state.complete = false;
        state.generatingCalibrationPlot = false;
        state.calibratePlotResult = null;
        state.comparisonPlotResult = null;
        state.error = null;
        state.fetchedIndicators = [];
        state.result = null;
        state.status = {} as CalibrateStatusResponse;
    },

    [ModelCalibrateMutation.CalibrateStatusUpdated](state: ModelCalibrateState, action: PayloadWithType<CalibrateStatusResponse>) {
        if (action.payload.done) {
            stopPolling(state);
        }
        state.status = action.payload;
        state.error = null;
    },

    [ModelCalibrateMutation.Calibrated](state: ModelCalibrateState) {
        state.complete = true;
        state.calibrating = false
    },

    [ModelCalibrateMutation.CalibrationPlotStarted](state: ModelCalibrateState) {
        state.generatingCalibrationPlot = true;
        state.calibratePlotResult = null;
        state.error = null;
    },

    [ModelCalibrateMutation.ComparisonPlotStarted](state: ModelCalibrateState) {
        state.comparisonPlotResult = null;
        state.comparisonPlotError = null;
    },

    [ModelCalibrateMutation.SetPlotData](state: ModelCalibrateState, action: PayloadWithType<any>) {
        state.generatingCalibrationPlot = false;
        state.calibratePlotResult = action;
    },

    [ModelCalibrateMutation.SetComparisonPlotData](state: ModelCalibrateState, action: ComparisonPlotResponse) {
        state.comparisonPlotResult = action;
    },

    [ModelCalibrateMutation.SetModelCalibrateOptionsVersion](state: ModelCalibrateState, action: PayloadWithType<VersionInfo>) {
        state.version = action.payload;
    },

    [ModelCalibrateMutation.SetOptionsData](state: ModelCalibrateState, action: PayloadWithType<DynamicFormData>) {
        state.options = action.payload;
    },

    [ModelCalibrateMutation.SetError](state: ModelCalibrateState, action: PayloadWithType<Error>) {
        state.error = action.payload;
        state.calibrating = false;
        state.generatingCalibrationPlot = false;
        if (state.statusPollId > -1) {
            stopPolling(state);
        }
    },

    [ModelCalibrateMutation.SetComparisonPlotError](state: ModelCalibrateState, action: PayloadWithType<Error>) {
        state.comparisonPlotError = action.payload;
    },

    [ModelCalibrateMutation.PollingForStatusStarted](state: ModelCalibrateState, action: PayloadWithType<number>) {
        state.statusPollId = action.payload;
    },

    [ModelCalibrateMutation.MetadataFetched](state: ModelCalibrateState,
                                             action: PayloadWithType<CalibrateMetadataResponse>) {
        state.warnings = action.payload.warnings
        state.metadata = action.payload
    },

    [ModelCalibrateMutation.ClearWarnings](state: ModelCalibrateState) {
        state.warnings = [];
    },

    [ModelCalibrateMutation.ResetIds](state: ModelCalibrateState) {
        stopPolling(state)
    },

    [ModelCalibrateMutation.CalibrateResultFetched](state: ModelCalibrateState, action: PayloadWithType<CalibrateResultWithType>) {
        if (!state.result) {
            state.result = JSON.parse(JSON.stringify({data: action.payload.data}));
        } else {
            state.result.data = [...state.result.data, ...action.payload.data];
        }
        if (!state.fetchedIndicators) {
            state.fetchedIndicators = [action.payload.indicatorId];
        } else {
            if (state.fetchedIndicators.indexOf(action.payload.indicatorId) == -1) {
                state.fetchedIndicators.push(action.payload.indicatorId);
            }
        }
    },
};

const stopPolling = (state: ModelCalibrateState) => {
    clearInterval(state.statusPollId);
    state.statusPollId = -1;
};
