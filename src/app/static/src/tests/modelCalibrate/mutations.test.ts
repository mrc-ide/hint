import {expectAllMutationsDefined} from "../testHelpers";
import {ModelCalibrateMutation, mutations} from "../../app/store/modelCalibrate/mutations";
import {
    mockCalibrateResultResponse,
    mockError,
    mockModelCalibrateState,
    mockWarning,
} from "../mocks";
import {VersionInfo, ComparisonPlotResponse} from "../../app/generated";
import {DynamicFormMeta} from "@reside-ic/vue-next-dynamic-form";

describe("ModelCalibrate mutations", () => {
    afterEach(() => {
        vi.clearAllMocks();
    });

    it("all mutation types are defined", () => {
        expectAllMutationsDefined(ModelCalibrateMutation, mutations);
    });

    it("sets Ready", () => {
        const state = mockModelCalibrateState();
        expect(state.ready).toBe(false);
        mutations[ModelCalibrateMutation.Ready](state);
        expect(state.ready).toBe(true);
    });

    it("FetchingModelCalibrateOptions sets fetching to true", () => {
        const state = mockModelCalibrateState();
        mutations[ModelCalibrateMutation.FetchingModelCalibrateOptions](state);
        expect(state.fetching).toBe(true);
    });

    it("ModelCalibrateOptionsFetched sets expected state values", () => {
        const state = mockModelCalibrateState({fetching: true, optionsFormMeta: {controlSections: []}});
        const payload = {controlSections: [{label: "TEST SECTION", controlGroups: []}]};
        mutations[ModelCalibrateMutation.ModelCalibrateOptionsFetched](state, {payload});
        expect(state.fetching).toBe(false);
        expect(state.optionsFormMeta).toStrictEqual(payload);
    });

    it("Update sets expected state values", () => {
        const state = mockModelCalibrateState({complete: true, optionsFormMeta: {controlSections: []}});
        const payload = {controlSections: [{label: "TEST SECTION", controlGroups: []}]};
        mutations[ModelCalibrateMutation.Update](state, payload);
        expect(state.complete).toBe(false);
        expect(state.optionsFormMeta).toBe(payload);
    });

    it("CalibrateStarted sets calibrateId, calibrating to true, error to null", () => {
        const state = mockModelCalibrateState({
            error: mockError("TEST ERROR"),
            complete: true,
            status: ["TEST STATUS"] as any,
            result: {data: "TEST DATA"} as any,
            fetchedIndicators: ["prev"]
        });
        const payload = {id: "123"} as any;
        mutations[ModelCalibrateMutation.CalibrateStarted](state, {payload});
        expect(state.calibrateId).toBe("123");
        expect(state.calibrating).toBe(true);
        expect(state.error).toBeNull();
        expect(state.complete).toBe(false);
        expect(state.status).toStrictEqual({});
        expect(state.generatingCalibrationPlot).toBe(false);
        expect(state.calibratePlotResult).toBe(null);
        expect(state.comparisonPlotResult).toBe(null);
        expect(state.result).toBe(null);
        expect(state.fetchedIndicators).toStrictEqual([]);
    });

    it("CalibrateStatusUpdate sets status, resets error", () => {
        const state = mockModelCalibrateState({error: mockError("TEST ERROR")});
        const payload = ["TEST PAYLOAD"] as any;
        mutations[ModelCalibrateMutation.CalibrateStatusUpdated](state, {payload});
        expect(state.status).toStrictEqual(payload);
        expect(state.error).toBeNull();
    });

    it("CalibrateStatusUpdate stops polling if status is done", () => {
        const state = mockModelCalibrateState({statusPollId: 99});
        const payload = {done: true} as any;
        const spy = vi.spyOn(window, "clearInterval");

        mutations[ModelCalibrateMutation.CalibrateStatusUpdated](state, {payload});
        expect(state.statusPollId).toBe(-1);
        expect(spy).toHaveBeenCalledTimes(1);
        expect(spy).toHaveBeenCalledWith(99);
    });

    it("Calibrated sets complete to true", () => {
        const state = mockModelCalibrateState({calibrating: true});
        mutations[ModelCalibrateMutation.Calibrated](state);
        expect(state.complete).toBe(true);
        expect(state.calibrating).toBe(false);
    });

    it("sets version", () => {
        const state = mockModelCalibrateState();
        const mockVersion: VersionInfo = {
            hintr: "1",
            naomi: "2",
            rrq: "3"
        };
        mutations[ModelCalibrateMutation.SetModelCalibrateOptionsVersion](state, {payload: mockVersion});
        expect(state.version).toStrictEqual(mockVersion);
    });

    it("sets error", () => {
        const state = mockModelCalibrateState();
        const error = mockError("TEST ERROR");
        mutations[ModelCalibrateMutation.SetError](state, {payload: error});
        expect(state.error).toBe(error);
        expect(state.calibrating).toBe(false);
    });

    it("sets comparisonPlotError", () => {
        const state = mockModelCalibrateState();
        const error = mockError("TEST ERROR");
        mutations[ModelCalibrateMutation.SetComparisonPlotError](state, {payload: error});
        expect(state.comparisonPlotError).toBe(error);
        expect(state.calibrating).toBe(false);
    });

    it("SetError stops polling", () => {
        const state = mockModelCalibrateState({statusPollId: 99});
        const error = mockError("TEST ERROR");
        const spy = vi.spyOn(window, "clearInterval");

        mutations[ModelCalibrateMutation.SetError](state, {payload: error});
        expect(state.statusPollId).toBe(-1);
        expect(spy).toHaveBeenCalledTimes(1);
        expect(spy).toHaveBeenCalledWith(99);
    });

    it("sets error stops calibration plot being generated", () => {
        const state = mockModelCalibrateState({ generatingCalibrationPlot: true });
        const error = mockError("TEST ERROR");
        mutations[ModelCalibrateMutation.SetError](state, {payload: error});
        expect(state.generatingCalibrationPlot).toBe(false);
    });

    it("sets options", () => {
        const state = mockModelCalibrateState();
        const options = { "testOption": "testValue" };
        mutations[ModelCalibrateMutation.SetOptionsData](state, {payload: options});
        expect(state.options).toBe(options);
    });

    it("recovers selected calibrate options from state when reloading", () => {
        // In this scenario we have recovered calibration options from the state JSON in
        // the uploaded model output but, we've not fetched the form data yet.
        const options = {"spectrum_plhiv_calibration_level": "national"}
        const state = mockModelCalibrateState({options: options});
        const payload = {controlSections: [{
            label: "Calibrate section",
            controlGroups: [{
                "label": "Adjust to spectrum PLHIV",
                "controls": [{
                    "name": "spectrum_plhiv_calibration_level",
                    "type": "select",
                    "options": [{"id": "none", "label": "None"}, {"id": "national", "label": "National"}],
                    "value": "none"
                }]
            }]
        }]};

        mutations[ModelCalibrateMutation.ModelCalibrateOptionsFetched](state, {payload: payload});

        const expected = {controlSections: [{
                label: "Calibrate section",
                controlGroups: [{
                    "label": "Adjust to spectrum PLHIV",
                    "controls": [{
                        "name": "spectrum_plhiv_calibration_level",
                        "type": "select",
                        "options": [{"id": "none", "label": "None"}, {"id": "national", "label": "National"}],
                        "value": "national"
                    }]
                }]
            }]};
        expect(state.optionsFormMeta).toStrictEqual(expected);
    });

    it("invalid option in state is still set when loading from output zip", () => {
        // In this scenario we have recovered calibration options from the state JSON in
        // the uploaded model output but, we've not fetched the form data yet.
        const options = {"spectrum_plhiv_calibration_level": "unknown"}
        const state = mockModelCalibrateState({options: options});
        const payload = {controlSections: [{
                label: "Calibrate section",
                controlGroups: [{
                    "label": "Adjust to spectrum PLHIV",
                    "controls": [{
                        "name": "spectrum_plhiv_calibration_level",
                        "type": "select",
                        "options": [{"id": "none", "label": "None"}, {"id": "national", "label": "National"}],
                        "value": "none"
                    }]
                }]
            }]};

        mutations[ModelCalibrateMutation.ModelCalibrateOptionsFetched](state, {payload: payload});

        const expected = {controlSections: [{
                label: "Calibrate section",
                controlGroups: [{
                    "label": "Adjust to spectrum PLHIV",
                    "controls": [{
                        "name": "spectrum_plhiv_calibration_level",
                        "type": "select",
                        "options": [{"id": "none", "label": "None"}, {"id": "national", "label": "National"}],
                        "value": "unknown"
                    }]
                }]
            }]};
        expect(state.optionsFormMeta).toStrictEqual(expected);
        expect(state.fetching).toBe(false);
    });

    it("PollingForStatusStarted sets statusPollId", () => {
        const state = mockModelCalibrateState();
        mutations[ModelCalibrateMutation.PollingForStatusStarted](state, {payload: 99});
        expect(state.statusPollId).toBe(99);
    });

    it("sets calibration plot started and resets error and previous plot", () => {
        const state = mockModelCalibrateState({error: mockError("TEST ERROR"), calibratePlotResult: {}});
        mutations[ModelCalibrateMutation.CalibrationPlotStarted](state);
        expect(state.generatingCalibrationPlot).toBe(true);
        expect(state.calibratePlotResult).toBe(null);
        expect(state.error).toBe(null);
    });

    it("sets calibration plot data", () => {
        const state = mockModelCalibrateState({generatingCalibrationPlot: true});
        const payload = { data: "TEST DATA" };
        mutations[ModelCalibrateMutation.SetPlotData](state, {payload});
        expect(state.calibratePlotResult).toStrictEqual({ payload });
        expect(state.generatingCalibrationPlot).toBe(false);
    });

    it("sets comparison plot started and resets error and previous plot", () => {
        const state = mockModelCalibrateState({comparisonPlotError: mockError("TEST ERROR"), comparisonPlotResult: {} as ComparisonPlotResponse});
        mutations[ModelCalibrateMutation.ComparisonPlotStarted](state);
        expect(state.comparisonPlotResult).toBe(null);
        expect(state.comparisonPlotError).toBe(null);
    });

    it("sets comparison plot data", () => {
        const state = mockModelCalibrateState();
        const payload = {data: "TEST DATA"};
        mutations[ModelCalibrateMutation.SetComparisonPlotData](state, {payload});
        expect(state.comparisonPlotResult).toStrictEqual({payload});
    });

    it("sets and clears metadata", () => {
        const testState = mockModelCalibrateState();
        const metadata = {plottingMetadata: "Test metadata", warnings: [mockWarning()]}
        mutations.MetadataFetched(testState, {payload: metadata});
        expect(testState.warnings).toEqual([mockWarning()]);
        expect(testState.metadata).toEqual(metadata);
        mutations.ClearWarnings(testState);
        expect(testState.warnings).toEqual([]);
    });

    it("resets polling id", () => {
        const state = mockModelCalibrateState({statusPollId: 1000});
        mutations[ModelCalibrateMutation.ResetIds](state);
        expect(state.statusPollId).toEqual(-1);
    });

    it("accumulates result data", () => {
        const state = mockModelCalibrateState();
        const data1 = {data: [{indicator: "plhiv", value: 1}]}
        const dataWithType1 = {
            ...data1,
            indicatorId: "plhiv"
        };
        mutations[ModelCalibrateMutation.CalibrateResultFetched](state, {payload: dataWithType1});
        expect(state.result).toStrictEqual(data1);
        expect(state.fetchedIndicators).toStrictEqual(["plhiv"]);

        const data2 = {data: [{indicator: "plhiv", value: 2}]}
        const dataWithType2 = {
            ...data2,
            indicatorId: "plhiv"
        };
        mutations[ModelCalibrateMutation.CalibrateResultFetched](state, {payload: dataWithType2});

        const expected = {
            data: [
                {indicator: "plhiv", value: 1},
                {indicator: "plhiv", value: 2}
            ]
        };
        expect(state.result).toStrictEqual(expected);
        expect(state.fetchedIndicators).toStrictEqual(["plhiv"]);

        const data3 = {data: [{indicator: "prevalence", value: 3}]}
        const dataWithType3 = {
            ...data3,
            indicatorId: "prevalence"
        };
        mutations[ModelCalibrateMutation.CalibrateResultFetched](state, {payload: dataWithType3});

        const expected2 = {
            data: [
                {indicator: "plhiv", value: 1},
                {indicator: "plhiv", value: 2},
                {indicator: "prevalence", value: 3}
            ]
        };
        expect(state.result).toStrictEqual(expected2);
        expect(state.fetchedIndicators).toStrictEqual(["plhiv", "prevalence"]);
    });
});
