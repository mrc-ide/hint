import {
    mockAxios,
    mockBaselineState,
    mockCalibrateMetadataResponse,
    mockComparisonPlotResponse,
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
import * as filter from "../../app/store/plotData/filter";
import {Scale} from "../../app/store/plotState/plotState";
import {Mock} from "vitest";
import {flushPromises} from "@vue/test-utils";

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
        vi.spyOn(freezer, "deepFreeze");
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

    it("getResult commits metadata and warnings, sets default plotting selections, and dispatches actions to get data", async () => {
        switches.modelCalibratePlot = true;

        const testResult = mockCalibrateMetadataResponse()
        const mockResponse = mockSuccess(testResult);
        mockAxios.onGet(`/calibrate/result/metadata/1234`)
            .reply(200, mockResponse);

        const commit = vi.fn();
        const dispatch = vi.fn();
        const getOutputFilteredDataSpy = vi
            .spyOn(filter, "getOutputFilteredData")
            .mockImplementation(async (payload, commit, rootState) => {});
        const state = mockModelCalibrateState({
            calibrateId: "1234",
            status: {
                success: true,
                done: true
            } as any
        });

        await actions.getResult({commit, state, rootState, dispatch} as any);

        expect(commit.mock.calls.length).toBe(9);
        expect(commit.mock.calls[0][0]).toStrictEqual({
            type: "MetadataFetched",
            payload: testResult
        });

        // Commits initial plot selections
        expect(commit.mock.calls[1][0]).toBe("plotSelections/updatePlotSelection");
        expect(commit.mock.calls[1][1]["payload"]).toStrictEqual({
            plot: "choropleth",
            selections: {
                controls: [],
                filters: []
            }
        });
        expect(commit.mock.calls[2][0]).toBe("plotSelections/updatePlotSelection");
        expect(commit.mock.calls[2][1]["payload"]).toStrictEqual({
            plot: "barchart",
            selections: {
                controls: [],
                filters: []
            }
        });
        expect(commit.mock.calls[3][0]).toBe("plotSelections/updatePlotSelection");
        expect(commit.mock.calls[3][1]["payload"]).toStrictEqual({
            plot: "table",
            selections: {
                controls: [],
                filters: []
            }
        });
        expect(commit.mock.calls[4][0]).toBe("plotSelections/updatePlotSelection");
        expect(commit.mock.calls[4][1]["payload"]).toStrictEqual({
            plot: "bubble",
            selections: {
                controls: [],
                filters: []
            }
        });

        // Commits initial scale selections
        expect(commit.mock.calls[5][0]).toStrictEqual({
            type: "plotState/setOutputScale",
            payload: {
                scale: Scale.Colour,
                selections: {}
            }
        });
        expect(commit.mock.calls[6][0]).toStrictEqual({
            type: "plotState/setOutputScale",
            payload: {
                scale: Scale.Size,
                selections: {}
            }
        });

        expect(commit.mock.calls[7][0]).toBe("Calibrated");
        expect(commit.mock.calls[8][0]).toBe("Ready");

        // Dispatches to get plot data
        expect(getOutputFilteredDataSpy.mock.calls.length).toBe(4) // The number of plots we have
        expect(dispatch.mock.calls[0][0]).toBe("getCalibratePlot");
        expect(dispatch.mock.calls[1][0]).toBe("getComparisonPlot");
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


    it("getComparisonPlot fetches the comparison plot data and sets it with default filter values when successful", async () => {
        const testResult = mockComparisonPlotResponse();
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
        expect(commit.mock.calls[1][0]).toStrictEqual("SetComparisonPlotData");
        expect(commit.mock.calls[1][1]).toStrictEqual(testResult);
        expect(commit.mock.calls[2][0]).toBe("plotSelections/updatePlotSelection");
        expect(commit.mock.calls[2][1]["payload"]).toStrictEqual({
            plot: "comparison",
            selections: {
                controls: [],
                filters: []
            }
        });
        expect(mockAxios.history.get.length).toBe(1);
    });

    it("getComparisonPlot commits error with unsuccessful fetch", async () => {
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
        await actions.resumeCalibrate({dispatch, state: brokenState} as any);

        // No new polls
        expect(dispatch.mock.calls.length).toBe(1);
    });
});
