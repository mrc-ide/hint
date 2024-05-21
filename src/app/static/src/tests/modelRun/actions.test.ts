import {
    mockAxios,
    mockError,
    mockFailure,
    mockModelOptionsState,
    mockModelResultResponse,
    mockModelRunState,
    mockRootState,
    mockSuccess,
    mockWarning
} from "../mocks";
import {actions} from "../../app/store/modelRun/actions";
import {ModelStatusResponse} from "../../app/generated";
import {expectEqualsFrozen} from "../testHelpers";
import {ModelRunMutation} from "../../app/store/modelRun/mutations";
import {freezer} from "../../app/utils";
import {Mock} from "vitest";
import {flushPromises} from "@vue/test-utils";

const rootState = mockRootState();

describe("Model run actions", () => {

    beforeEach(() => {
        // stop apiService logging to console
        console.log = vi.fn();
        console.info = vi.fn();
        mockAxios.reset();
    });

    afterEach(() => {
        (console.log as Mock).mockClear();
        (console.info as Mock).mockClear();
    });

    beforeAll(() => {
        vi.useFakeTimers();
    })

    afterAll(() => {
        vi.useRealTimers();
    })

    it("passes model options and version from state", async () => {

        mockAxios.onPost(`/model/run/`)
            .reply(200, mockSuccess({id: "12345"}));

        const commit = vi.fn();
        const rootState = mockRootState({
            modelOptions: mockModelOptionsState({
                options: {1: "TEST"},
                version: "v1" as any
            })
        });

        const state = {
            statusPollId: -1
        };

        await actions.run({commit, rootState, state} as any);
        expect(JSON.parse(mockAxios.history.post[0].data))
            .toStrictEqual({options: {1: "TEST"}, version: "v1"})
    });

    it("commits run id after triggering a model run", async () => {

        mockAxios.onPost(`/model/run/`)
            .reply(200, mockSuccess({id: "12345"}));

        const state = {
            statusPollId: -1
        };

        const commit = vi.fn();
        await actions.run({commit, rootState, state} as any);
        expect(commit.mock.calls[0][0]).toStrictEqual({
            type: "StartedRunning",
            payload: true
        });
        expect(commit.mock.calls[1][0]).toStrictEqual({
            type: "ModelRunStarted",
            payload: {id: "12345"}
        });
    });

    it("if already polling, stops before triggering a new model run", async () => {
        mockAxios.onPost(`/model/run/`)
            .reply(200, mockSuccess({id: "12345"}));

        const state = {
            statusPollId: 9876
        };

        const commit = vi.fn();
        await actions.run({commit, rootState, state} as any);
        expect(commit.mock.calls[0][0]).toStrictEqual({
            type: "StartedRunning",
            payload: true
        });
        expect(commit.mock.calls[1][0]).toBe("RunCancelled");
        expect(commit.mock.calls[2][0]).toStrictEqual({
            type: "ModelRunStarted",
            payload: {id: "12345"}
        });
    });

    it("fetches model run result after polling when status is done", async () => {

        mockAxios.onGet(`/model/status/1234`)
            .reply(200, mockSuccess({}));
        mockAxios.onGet(`/model/result/1234`)
            .reply(200, mockSuccess({}));

        const state = mockModelRunState({status: {done: true} as ModelStatusResponse});
        const commit = vi.fn();
        const dispatch = vi.fn();

        actions.poll({commit, state, dispatch, rootState} as any, "1234");
        vi.advanceTimersByTime(2000);
        await flushPromises();
        expect(dispatch.mock.calls[0][0]).toStrictEqual("getResult");
        expect(dispatch.mock.calls[0][1]).toStrictEqual("1234");
    });

    it("does not fetch model run result after polling if done is not true", async () => {

        mockAxios.onGet(`/model/status/1234`)
            .reply(200, mockSuccess({}));
        mockAxios.onGet(`/model/result/1234`)
            .reply(200, mockSuccess({}));

        const state = mockModelRunState({status: {done: false} as ModelStatusResponse});
        const commit = vi.fn();
        const dispatch = vi.fn();

        actions.poll({commit, state, dispatch, rootState} as any, "1234");
        vi.advanceTimersByTime(2000);
        await flushPromises();
        expect(dispatch.mock.calls.length).toEqual(0);
    });

    it("poll commits status when successfully fetched", async () => {
        mockAxios.onGet(`/model/status/1234`)
            .reply(200, mockSuccess("TEST DATA"));
        mockAxios.onGet(`/model/result/1234`)
            .reply(200, mockSuccess({}));

        const commit = vi.fn();
        const state = mockModelRunState();

        actions.poll({commit, state, rootState} as any, "1234");
        vi.advanceTimersByTime(2000);
        await flushPromises();
        expect(commit.mock.calls[0][0].type).toBe("PollingForStatusStarted");
        expect(commit.mock.calls[1][0]).toStrictEqual({
            type: "RunStatusUpdated",
            payload: "TEST DATA"
        });
    });

    it("poll commits error when unsuccessful fetch", async () => {
        mockAxios.onGet(`/model/status/1234`)
            .reply(500, mockFailure("Test Error"));

        const commit = vi.fn();
        const state = mockModelRunState();

        actions.poll({commit, state, rootState} as any, "1234");
        vi.advanceTimersByTime(2000);
        await flushPromises();
        expect(commit.mock.calls[0][0].type).toBe("PollingForStatusStarted");
        expect(commit.mock.calls[1][0]).toStrictEqual({
            type: "RunStatusError",
            payload: mockError("Test Error")
        });
    });

    it("getResult commits result and warnings when successfully fetched", async () => {
        const mockResponse = mockSuccess(mockModelResultResponse({
            warnings: [mockWarning()]
        }));

        mockAxios.onGet(`/model/result/1234`)
            .reply(200, mockResponse);

        const commit = vi.fn();
        const spy = vi.spyOn(freezer, "deepFreeze");
        const state = mockModelRunState({
            modelRunId: "1234",
            status: {done: true} as ModelStatusResponse
        });

        await actions.getResult({commit, state, rootState} as any);

        expect(commit.mock.calls[0][0]).toStrictEqual({
            type: ModelRunMutation.WarningsFetched,
            payload: [mockWarning()]
        });
        expectEqualsFrozen(commit.mock.calls[1][0], {
            type: ModelRunMutation.RunResultFetched,
            payload: mockResponse.data
        });
        expect(commit.mock.calls[2][0]).toStrictEqual({
            type: "StartedRunning",
            payload: false
        });
        expect(commit.mock.calls[3][0]).toStrictEqual({
            type: "Ready",
            payload: true
        });
        expect(spy).toHaveBeenCalledWith(mockResponse);
    });

    it("getResult commits error when unsuccessful fetch", async () => {
        mockAxios.onGet(`/model/result/1234`)
            .reply(500, mockFailure("Test Error"));

        const commit = vi.fn();
        const state = mockModelRunState({modelRunId: "1234", status: {done: true, id: "1234"} as ModelStatusResponse});

        await actions.getResult({commit, state, rootState} as any);

        expect(commit.mock.calls.length).toBe(3)
        expect(commit.mock.calls[0][0]).toStrictEqual({
            type: "RunResultError",
            payload: mockError("Test Error")
        });
        expect(commit.mock.calls[1][0]).toStrictEqual({
            type: "StartedRunning",
            payload: false
        });
        expect(commit.mock.calls[2][0]).toStrictEqual({
            type: "Ready",
            payload: true
        });
    });

    it("getResult does not get result if done is not true", async () => {
        mockAxios.onGet(`/model/result/1234`)
            .reply(200, mockSuccess("TEST DATA"));

        const commit = vi.fn();
        const state = mockModelRunState({modelRunId: "1234", status: {done: false, id: "1234"} as ModelStatusResponse});

        await actions.getResult({commit, state, rootState} as any);

        expect(mockAxios.history.get.length).toBe(0);
        expect(commit.mock.calls[0][0]).toStrictEqual({
            type: "Ready",
            payload: true
        });
    });

    it("cancel run calls endpoint and commits mutation", async () => {
        const commit = vi.fn();
        const state = mockModelRunState({modelRunId: "123"});

        await actions.cancelRun({commit, state, rootState} as any);

        expect(mockAxios.history.post.length).toBe(1);
        expect(mockAxios.history.post[0].url).toBe("/model/cancel/123");

        expect(commit.mock.calls[0][0]).toStrictEqual({
            type: "RunCancelled",
            payload: null
        });
    });
});
