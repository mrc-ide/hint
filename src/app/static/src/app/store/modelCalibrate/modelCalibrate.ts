import {Module} from "vuex";
import {ReadyState, RootState, WarningsState} from "../../root";
import {DynamicFormData, DynamicFormMeta} from "@reside-ic/vue-next-dynamic-form";
import {mutations} from "./mutations";
import {actions} from "./actions";
import {getters} from "./getters";
import {
    VersionInfo,
    Error,
    CalibrateStatusResponse,
    CalibrateResultResponse,
    ComparisonPlotResponse,
    CalibrateDataResponse,
    CalibrateMetadataResponse,
    CalibratePlotResponse
} from "../../generated";

export interface ModelCalibrateState extends ReadyState, WarningsState {
    optionsFormMeta: DynamicFormMeta
    options: DynamicFormData
    fetching: boolean
    calibrateId: string
    statusPollId: number
    status: CalibrateStatusResponse
    calibrating: boolean
    complete: boolean
    generatingCalibrationPlot: boolean
    calibratePlotResult: CalibratePlotResponse | null,
    comparisonPlotResult: ComparisonPlotResponse | null,
    result: CalibrateDataResponse | CalibrateResultResponse | null
    fetchedIndicators: string[] | null
    version: VersionInfo
    error: Error | null
    comparisonPlotError: Error | null,
    metadata: CalibrateMetadataResponse | null
}

export const initialModelCalibrateState = (): ModelCalibrateState => {
    return {
        ready: false,
        optionsFormMeta: {controlSections: []},
        options: {},
        fetching: false,
        calibrateId: "",
        statusPollId: -1,
        status: {} as CalibrateStatusResponse,
        calibrating: false,
        complete: false,
        generatingCalibrationPlot: false,
        calibratePlotResult: null,
        comparisonPlotResult: null,
        result: null,
        fetchedIndicators: [],
        version: {hintr: "unknown", naomi: "unknown", rrq: "unknown"},
        error: null,
        comparisonPlotError: null,
        warnings: [],
        metadata: null
    }
};

const namespaced = true;

export const modelCalibrate = (existingState: Partial<RootState> | null): Module<ModelCalibrateState, RootState> => {
    return {
        namespaced,
        state: {...initialModelCalibrateState(), ...existingState && existingState.modelCalibrate, ready: false},
        mutations,
        actions,
        getters
    };
};
