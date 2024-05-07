import {
    mockAxios,
    mockBaselineState, mockCalibrateResultResponse,
    mockError,
    mockFailure,
    mockModelCalibrateState,
    mockModelRunState,
    mockRootState,
    mockSuccess,
    mockWarning
} from "../mocks";
import {actions} from "../../app/store/modelCalibrate/actions";
import {ModelCalibrateMutation} from "../../app/store/modelCalibrate/mutations";
import {freezer} from "../../app/utils";
import {switches} from "../../app/featureSwitches";
import {DownloadResultsMutation} from "../../app/store/downloadResults/mutations";
import { ModelOutputTabs } from "../../app/types";
import { Mock } from "vitest";
import { flushPromises } from "@vue/test-utils";

const rootState = mockRootState();
describe("ModelCalibrate actions", () => {
    beforeEach(() => {
        // stop apiService logging to console
        console.log = vi.fn();
        mockAxios.reset();
    });

    afterEach(() => {
        (console.log as Mock).mockClear();
    });

    beforeAll(() => {
        vi.useFakeTimers();
    })

    afterAll(() => {
        vi.useRealTimers();
    })

    it("fetchModelCalibrateOptions fetches options and commits mutations", async () => {
        const commit = vi.fn();
        const root = {
            ...rootState,
            baseline: mockBaselineState({iso3: "MWI"})
        }
        const state = mockModelCalibrateState();
        mockAxios.onGet("/calibrate/options/MWI").reply(200, mockSuccess("TEST", "v1"));

        await actions.fetchModelCalibrateOptions({commit, state, rootState: root} as any);

        expect(commit.mock.calls.length).toBe(3);
        expect(commit.mock.calls[0][0]).toBe(ModelCalibrateMutation.FetchingModelCalibrateOptions);
        expect(commit.mock.calls[1][0].type).toBe(ModelCalibrateMutation.ModelCalibrateOptionsFetched);
        expect(commit.mock.calls[1][0].payload).toBe("TEST");
        expect(commit.mock.calls[2][0].type).toBe(ModelCalibrateMutation.SetModelCalibrateOptionsVersion);
        expect(commit.mock.calls[2][0].payload).toBe("v1")
    });

    it("submit action calls submit endpoint, commits mutations and starts polling", async () => {
        const commit = vi.fn();
        const dispatch = vi.fn();
        const mockVersion = {naomi: "1.0.0", hintr: "1.0.0", rrq: "1.0.0"};
        const state = mockModelCalibrateState({version: mockVersion});
        const root = mockRootState({
            modelRun: mockModelRunState({modelRunId: "123A"})
        });
        const mockOptions = {"param_1": "value 1"};
        const url = `calibrate/submit/123A`;
        mockAxios.onPost(url).reply(200, mockSuccess("TEST"));
        const freezeSpy = vi.spyOn(freezer, "deepFreeze");
        await actions.submit({commit, dispatch, state, rootState: root} as any, mockOptions);

        expect(mockAxios.history.post.length).toBe(1);
        expect(mockAxios.history.post[0].url).toBe(url);
        expect(JSON.parse(mockAxios.history.post[0].data)).toStrictEqual({version: mockVersion, options: mockOptions});

        expect(commit.mock.calls.length).toBe(3);
        expect(commit.mock.calls[0][0].type).toBe(ModelCalibrateMutation.SetOptionsData);
        expect(commit.mock.calls[0][0].payload).toEqual(mockOptions);
        expect(commit.mock.calls[1][0].type).toBe(ModelCalibrateMutation.CalibrateStarted);
        expect(commit.mock.calls[2][0].type).toBe(`downloadResults/${DownloadResultsMutation.ResetIds}`);
        expect(commit.mock.calls[2][1]).toEqual({root: true});
        expect(dispatch.mock.calls.length).toBe(1);
        expect(dispatch.mock.calls[0][0]).toBe("poll");
    });

    it("submit action commits error on unsuccessful request", async () => {
        const commit = vi.fn();
        const dispatch = vi.fn();
        const mockVersion = {naomi: "1.0.0", hintr: "1.0.0", rrq: "1.0.0"};
        const state = mockModelCalibrateState({version: mockVersion});
        const root = mockRootState({
            modelRun: mockModelRunState({modelRunId: "123A"})
        });

        const testError = mockError("TEST ERROR");
        mockAxios.onPost(`/calibrate/submit/123A`).reply(400, mockFailure("TEST ERROR"));
        await actions.submit({commit, dispatch, state, rootState: root} as any, {});

        expect(commit.mock.calls.length).toBe(2);
        expect(commit.mock.calls[0][0].type).toBe(ModelCalibrateMutation.SetOptionsData);
        expect(commit.mock.calls[0][0].payload).toEqual({});
        expect(commit.mock.calls[1][0].type).toBe(ModelCalibrateMutation.SetError);
        expect(commit.mock.calls[1][0].payload).toStrictEqual(testError);
        expect(dispatch.mock.calls.length).toBe(0);
    });

    it("poll commits status when successfully fetched", async () => {
        mockAxios.onGet(`/calibrate/status/1234`)
            .reply(200, mockSuccess("TEST DATA"));

        const commit = vi.fn();
        const dispatch = vi.fn();
        const state = mockModelCalibrateState({calibrateId: "1234"});

        actions.poll({commit, dispatch, state, rootState} as any);
        vi.advanceTimersByTime(2000);
        await flushPromises();
        expect(commit.mock.calls.length).toBe(2);
        expect(commit.mock.calls[0][0].type).toBe("PollingForStatusStarted");
        expect(+commit.mock.calls[0][0].payload).toBeGreaterThan(-1);
        expect(commit.mock.calls[1][0].type).toBe("CalibrateStatusUpdated");
        expect(commit.mock.calls[1][0].payload).toBe("TEST DATA");
        expect(dispatch.mock.calls.length).toBe(0);
    });

    it("poll commits error when unsuccessful fetch", async () => {
        mockAxios.onGet(`/calibrate/status/1234`)
            .reply(500, mockFailure("Test Error"));

        const commit = vi.fn();
        const dispatch = vi.fn();
        const state = mockModelCalibrateState({calibrateId: "1234"});

        actions.poll({commit, dispatch, state, rootState} as any);
        vi.advanceTimersByTime(2000);
        await flushPromises();
        expect(commit.mock.calls.length).toBe(2);
        expect(commit.mock.calls[0][0].type).toBe("PollingForStatusStarted");

        expect(commit.mock.calls[1][0]).toStrictEqual({
            type: "SetError",
            payload: mockError("Test Error")
        });
        expect(dispatch.mock.calls.length).toBe(0);
    });

    it("poll dispatches getResult when status done", async () => {
        mockAxios.onGet(`/calibrate/status/1234`)
            .reply(200, mockSuccess("TEST DATA"));

        const commit = vi.fn();
        const dispatch = vi.fn();
        const state = mockModelCalibrateState({calibrateId: "1234", status: {done: true, success: false} as any});

        actions.poll({commit, dispatch, state, rootState} as any);
        vi.advanceTimersByTime(2000);
        await flushPromises();
        expect(commit.mock.calls.length).toBe(2);
        expect(commit.mock.calls[0][0].type).toBe("PollingForStatusStarted");
        expect(commit.mock.calls[1][0].type).toBe("CalibrateStatusUpdated");

        expect(dispatch.mock.calls.length).toBe(1);
        expect(dispatch.mock.calls[0][0]).toBe("getResult");
    });

    it("getResult commits result and warnings when successfully fetched, sets default plotting selections, and dispatches getCalibratePlot and getComparisonPlot", async () => {
        switches.modelCalibratePlot = true;
        const testResult = {
            plottingMetadata: {
                barchart: {
                    defaults: {
                        indicator_id: "test indicator",
                        x_axis_id: "test_x",
                        disaggregate_by_id: "test_dis",
                        selected_filter_options: {"test_name": ["test_value"]}
                    },
                    indicators: []
                }
            },
            uploadMetadata: {
                outputZip: {description: "spectrum output info"},
                outputSummary: {description: "summary output info"}
            },
            warnings: [mockWarning()]
        };

        const mockResultDataResponse = {
            data: "TEST"
        }
        const mockResponse = mockSuccess(testResult);
        mockAxios.onGet(`/calibrate/result/metadata/1234`)
            .reply(200, mockResponse);
        mockAxios.onGet(`/calibrate/result/data/1234/all`)
            .reply(200, mockResultDataResponse);

        const commit = vi.fn();
        const dispatch = vi.fn();
        const spy = vi.spyOn(freezer, "deepFreeze");
        const state = mockModelCalibrateState({
            calibrateId: "1234",
            status: {
                success: true,
                done: true
            } as any
        });

        await actions.getResult({commit, state, rootState, dispatch} as any);

        expect(commit.mock.calls.length).toBe(4);
        expect(commit.mock.calls[0][0]).toStrictEqual({
            type: "MetadataFetched",
            payload: testResult
        });
        expect(commit.mock.calls[1][0]).toStrictEqual({
            type: "plottingSelections/updateBarchartSelections",
            payload: {
                indicatorId: "test indicator",
                xAxisId: "test_x",
                disaggregateById: "test_dis",
                selectedFilterOptions: {"test_name": ["test_value"]}
            }
        });

        //Test that a selected filter options array can be modified ie is not frozen
        const options = commit.mock.calls[1][0].payload.selectedFilterOptions["test_name"];
        options.push("another value");
        expect(options.length).toBe(2);

        expect(commit.mock.calls[2][0]).toBe("Calibrated");
        expect(commit.mock.calls[3][0]).toBe("Ready");
        expect(dispatch.mock.calls[0][0]).toBe("getCalibratePlot");
        expect(dispatch.mock.calls[1][0]).toBe("getComparisonPlot");

        expect(spy).toHaveBeenCalledWith(mockResponse);
    });

    it("getResult metadata does not dispatch getCalibratePlot if switch is off", async () => {
        switches.modelCalibratePlot = false;
        const testResult = {
            data: "TEST DATA",
            plottingMetadata: {
                barchart: {
                    defaults: {
                        indicator_id: "test indicator",
                        x_axis_id: "test_x",
                        disaggregate_by_id: "test_dis",
                        selected_filter_options: {
                            type: [{id: "test", label: "test"}]
                        }
                    },
                    indicators: []
                }
            },
            uploadMetadata: {
                outputZip: {description: "spectrum output info"},
                outputSummary: {description: "summary output info"}
            }
        };
        mockAxios.onGet(`/calibrate/result/metadata/1234`)
            .reply(200, mockSuccess(testResult));

        const commit = vi.fn();
        const dispatch = vi.fn();
        const state = mockModelCalibrateState({
            calibrateId: "1234",
            status: {
                success: true,
                done: true
            } as any
        });

        await actions.getResult({commit, state, rootState, dispatch} as any);

        expect(dispatch.mock.calls.length).toBe(1);
        expect(dispatch.mock.calls[0][0]).toBe("getComparisonPlot");
    });

    it("getResult does not fetch when status is not done", async () => {
        mockAxios.onGet(`/calibrate/result/1234`)
            .reply(200, mockSuccess("Test result"));

        const commit = vi.fn();
        const dispatch = vi.fn();
        const state = mockModelCalibrateState({
            calibrateId: "1234",
            status: {
                success: false,
                done: false
            } as any
        });

        await actions.getResult({commit, dispatch, state, rootState} as any);

        expect(mockAxios.history.get.length).toBe(0);

        expect(commit.mock.calls.length).toBe(1);
        expect(commit.mock.calls[0][0]).toBe("Ready");
    });

    it("getResultData commits result when fetching data", async () => {

        const mockResultDataResponse = {
            data: "PREVALENCE DATA"
        }
        mockAxios.onGet(`/calibrate/result/data/1234/prevalence`)
            .reply(200, mockResultDataResponse);

        const commit = vi.fn();
        const dispatch = vi.fn();
        const state = mockModelCalibrateState({
            calibrateId: "1234",
            status: {
                success: true,
                done: true
            } as any,
            result: mockCalibrateResultResponse(),
            fetchedIndicators: ["mock"]
        });

        await actions.getResultData({commit, state, rootState, dispatch} as any, {payload: {}, tab: ModelOutputTabs.Map});

        // doesn't set tab loading because of the timeout
        expect(commit.mock.calls.length).toBe(2);

        expect(commit.mock.calls[0][0]["type"]).toBe("CalibrateResultFetched");
        expect(commit.mock.calls[0][0]["payload"]["payload"]).toStrictEqual({});
        expect(commit.mock.calls[0][0]["payload"]["data"]).toBe("PREVALENCE DATA");

        expect(commit.mock.calls[1][0]).toBe("modelOutput/SetTabLoading");
        expect(commit.mock.calls[1][1].payload).toStrictEqual({tab: ModelOutputTabs.Map, loading: false});
        expect(commit.mock.calls[1][2]["root"]).toBe(true);
    });

    it("getResultData commits error when unsuccessful data fetch", async () => {
        mockAxios.onGet(`/calibrate/result/data/1234/prevalence`)
            .reply(500, mockFailure("Test Error"));

        const commit = vi.fn();
        const dispatch = vi.fn();
        const state = mockModelCalibrateState({
            calibrateId: "1234",
            status: {
                success: true,
                done: true
            } as any
        });

        await actions.getResultData({commit, dispatch, state, rootState} as any, {payload: {}, tab: ModelOutputTabs.Map});

        expect(commit.mock.calls.length).toBe(2);
        expect(commit.mock.calls[0][0]).toStrictEqual({
            type: "SetError",
            payload: mockError("Test Error")
        });
    });

    it("getResultData does not fetch when status is not done", async () => {
        const mockResultDataResponse = {
            data: "PREVALENCE DATA"
        }
        mockAxios.onGet(`/calibrate/result/data/1234/prevalence`)
            .reply(200, mockResultDataResponse);

        const commit = vi.fn();
        const dispatch = vi.fn();
        const state = mockModelCalibrateState({
            calibrateId: "1234",
            status: {
                success: false,
                done: false
            } as any
        });

        await actions.getResultData({commit, dispatch, state, rootState} as any, {payload: {}, tab: ModelOutputTabs.Map});

        expect(mockAxios.history.get.length).toBe(0);
        expect(commit.mock.calls.length).toBe(0);
    });

    it("getCalibratePlot fetches the calibrate plot data and sets it when successful", async () => {
        const testResult = {data: "TEST DATA"};
        mockAxios.onGet(`/calibrate/plot/1234`)
            .reply(200, mockSuccess(testResult));

        const commit = vi.fn();
        const state = mockModelCalibrateState({
            calibrateId: "1234",
            status: {
                success: true,
                done: true
            } as any
        });

        await actions.getCalibratePlot({commit, state, rootState} as any);

        expect(commit.mock.calls.length).toBe(2);
        expect(commit.mock.calls[0][0]).toStrictEqual("CalibrationPlotStarted");
        expect(commit.mock.calls[1][0]).toBe("SetPlotData");
        expect(commit.mock.calls[1][1]).toStrictEqual({data: "TEST DATA"});
        expect(mockAxios.history.get.length).toBe(1);
    });

    it("getCalibratePlot commits error with unsuccessful fetch", async () => {
        const testResult = {data: "TEST DATA"};
        mockAxios.onGet(`/calibrate/plot/1234`)
            .reply(500, mockFailure("Test Error"));

        const commit = vi.fn();
        const state = mockModelCalibrateState({
            calibrateId: "1234",
            status: {
                success: true,
                done: true
            } as any
        });

        await actions.getCalibratePlot({commit, state, rootState} as any);

        expect(commit.mock.calls.length).toBe(2);
        expect(commit.mock.calls[0][0]).toStrictEqual("CalibrationPlotStarted");
        expect(commit.mock.calls[1][0]).toStrictEqual({
            type: "SetError",
            payload: mockError("Test Error")
        });
        expect(mockAxios.history.get.length).toBe(1);
    });

    it("getComparisonPlot fetches the comparison plot data and sets it with default filter values when successful", async () => {
        const testResult = {
            data: "TEST DATA",
            plottingMetadata: {
                barchart: {
                    defaults: {
                        indicator_id: "test indicator",
                        x_axis_id: "test_x",
                        disaggregate_by_id: "test_dis",
                        selected_filter_options: {"test_name": ["test_value"]}
                    }
                }
            }
        };
        mockAxios.onGet(`/model/comparison/plot/1234`)
            .reply(200, mockSuccess(testResult));

        const commit = vi.fn();
        const state = mockModelCalibrateState({
            calibrateId: "1234",
            status: {
                success: true,
                done: true
            } as any
        });

        await actions.getComparisonPlot({commit, state, rootState} as any);

        expect(commit.mock.calls.length).toBe(3);
        expect(commit.mock.calls[0][0]).toStrictEqual("ComparisonPlotStarted");
        expect(commit.mock.calls[1][0]["type"]).toBe("plottingSelections/updateComparisonPlotSelections");
        expect(commit.mock.calls[1][0]["payload"]).toStrictEqual({
            indicatorId: "test indicator",
            xAxisId: "test_x",
            disaggregateById: "test_dis",
            selectedFilterOptions: {"test_name": ["test_value"]}
        });
        expect(commit.mock.calls[2][0]).toBe("SetComparisonPlotData");
        expect(commit.mock.calls[2][1]).toStrictEqual(testResult);
        expect(mockAxios.history.get.length).toBe(1);
    });

    it("getComparisonPlot commits error with unsuccessful fetch", async () => {
        const testResult = {data: "TEST DATA"};
        mockAxios.onGet(`/model/comparison/plot/1234`)
            .reply(500, mockFailure("Test Error"));

        const commit = vi.fn();
        const state = mockModelCalibrateState({
            calibrateId: "1234",
            status: {
                success: true,
                done: true
            } as any
        });

        await actions.getComparisonPlot({commit, state, rootState} as any);

        expect(commit.mock.calls.length).toBe(2);
        expect(commit.mock.calls[0][0]).toStrictEqual("ComparisonPlotStarted");
        expect(commit.mock.calls[1][0]).toStrictEqual({
            type: "SetComparisonPlotError",
            payload: mockError("Test Error")
        });
        expect(mockAxios.history.get.length).toBe(1);
    });

    it("resume calibrate starts polling if calibration started but no result fetched", async () => {
        const dispatch = vi.fn();
        const initialState = mockModelCalibrateState();
        await actions.resumeCalibrate({dispatch, state: initialState} as any);

        expect(dispatch.mock.calls.length).toBe(0);

        const completeState = mockModelCalibrateState(
            {calibrating: false, complete: true, calibrateId: "123"});
        await actions.resumeCalibrate({dispatch, state: completeState} as any);

        expect(dispatch.mock.calls.length).toBe(0);

        const incompleteState = mockModelCalibrateState(
            {calibrating: true, complete: false, calibrateId: "123"});
        await actions.resumeCalibrate({dispatch, state: incompleteState} as any);

        expect(dispatch.mock.calls.length).toBe(1);
        expect(dispatch.mock.calls[0][0]).toBe("poll");

        // Following state should not be possible but checking for completeness
        const brokenState = mockModelCalibrateState(
            {calibrating: true, complete: false, calibrateId: ""});
        await actions.resumeCalibrate({dispatch, state: completeState} as any);

        // No new polls
        expect(dispatch.mock.calls.length).toBe(1);
    });
});
