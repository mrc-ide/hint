import {mockADRState, mockAxios, mockBaselineState, mockError, mockFailure, mockRootState, mockSuccess} from "../mocks";
import {actions} from "../../app/store/adr/actions";
import {ADRMutation} from "../../app/store/adr/mutations";
import {BaselineMutation} from "../../app/store/baseline/mutations";

describe("ADR actions", () => {
    const state = mockADRState();
    const rootState = mockRootState();

    beforeEach(() => {
        // stop apiService logging to console
        console.log = vi.fn();
        mockAxios.reset();
    });

    it("fetches key", async () => {
        mockAxios.onGet(`/adr/key/`)
            .reply(200, mockSuccess("1234"));

        const commit = vi.fn();

        await actions.fetchKey({commit, state, rootState} as any);

        expect(commit.mock.calls[0][0])
            .toStrictEqual({
                type: ADRMutation.UpdateKey,
                payload: "1234"
            });
    });

    it("fetches sso login method", async () => {
        mockAxios.onGet(`/sso`)
            .reply(200, mockSuccess(true));

        const commit = vi.fn();
        const dispatch = vi.fn()

        await actions.ssoLoginMethod({commit, dispatch, state, rootState} as any);

        expect(commit).toHaveBeenCalledTimes(1)
        expect(commit).toHaveBeenCalledWith({
            type: ADRMutation.SetSSOLogin,
            payload: true
        });

        expect(dispatch).toHaveBeenCalledTimes(1)
        expect(dispatch).toHaveBeenCalledWith("getDatasets");
    });

    it("saves key", async () => {
        mockAxios.onPost(`/adr/key/`)
            .reply(200, mockSuccess("1234"));

        const commit = vi.fn();

        await actions.saveKey({commit, state, rootState} as any, "1234");

        expect(commit.mock.calls[0][0])
            .toStrictEqual({
                type: ADRMutation.SetKeyError,
                payload: null
            });
        expect(commit.mock.calls[1][0])
            .toStrictEqual({
                type: ADRMutation.UpdateKey,
                payload: "1234"
            });
    });

    it("deletes key", async () => {
        mockAxios.onDelete(`/adr/key/`)
            .reply(200, mockSuccess(null));

        const commit = vi.fn();

        await actions.deleteKey({commit, state, rootState} as any);

        expect(commit.mock.calls[0][0])
            .toStrictEqual({
                type:ADRMutation.SetKeyError,
                payload: null
            });
        expect(commit.mock.calls[1][0])
            .toStrictEqual({
                type: ADRMutation.UpdateKey,
                payload: null
            });
    });

    it("fetches datasets", async () => {
        mockAxios.onGet(`/adr/datasets/`)
            .reply(200, mockSuccess([1]));

        const commit = vi.fn();

        await actions.getDatasets({commit, state, rootState} as any);

        expect(commit.mock.calls.length).toBe(4);
        expect(commit.mock.calls[0][0])
            .toStrictEqual({
                type: ADRMutation.SetFetchingDatasets,
                payload: true
            });
        expect(commit.mock.calls[1][0])
            .toStrictEqual({
                type: ADRMutation.SetADRError,
                payload: null
            });
        expect(commit.mock.calls[2][0])
            .toStrictEqual({
                type: ADRMutation.SetDatasets,
                payload: [1]
            });
        expect(commit.mock.calls[3][0])
            .toStrictEqual({
                type: ADRMutation.SetFetchingDatasets,
                payload: false
            });
    });

    it("resets datasets and commits error fetching if error response", async () => {
        mockAxios.onGet(`/adr/datasets/`)
            .reply(500, mockFailure("error"));

        const commit = vi.fn();

        await actions.getDatasets({commit, state, rootState} as any);

        expect(commit.mock.calls.length).toBe(4);
        expect(commit.mock.calls[0][0])
            .toStrictEqual({
                type: ADRMutation.SetFetchingDatasets,
                payload: true
            });
        expect(commit.mock.calls[1][0])
            .toStrictEqual({
                type: ADRMutation.SetADRError,
                payload: null
            });
        expect(commit.mock.calls[2][0])
            .toStrictEqual({
                type: ADRMutation.SetADRError,
                payload: mockError("error")
            });
        expect(commit.mock.calls[3][0])
            .toStrictEqual({
                type: ADRMutation.SetFetchingDatasets,
                payload: false
            });
    });

    it("fetches releases", async () => {
        mockAxios.onGet(`/adr/datasets/123/releases/`)
            .reply(200, mockSuccess([1]));

        const commit = vi.fn();

        await actions.getReleases({commit, state, rootState} as any, "123");

        expect(commit.mock.calls.length).toBe(1);
        expect(commit.mock.calls[0][0])
            .toStrictEqual({
                type: ADRMutation.SetReleases,
                payload: [1]
            });
    });

    it("releases failure sets error response", async () => {
        mockAxios.onGet(`/adr/datasets/123/releases/`)
            .reply(500, mockFailure("error"));

        const commit = vi.fn();

        await actions.getReleases({commit, state, rootState} as any, "123");

        expect(commit.mock.calls.length).toBe(1);
        expect(commit.mock.calls[0][0])
            .toStrictEqual({
                type: BaselineMutation.BaselineError,
                payload: mockError("error")
            });
    });

    it("fetches schemas", async () => {
        mockAxios.onGet(`/adr/schemas/`)
            .reply(200, mockSuccess({baseUrl: "adr.com"}));

        const commit = vi.fn();

        await actions.getSchemas({commit, state, rootState} as any);

        expect(commit.mock.calls[0][0])
            .toEqual({
                type: ADRMutation.SetSchemas,
                payload: {baseUrl: "adr.com"}
            });
    });

    it("getUserCanUpload does nothing if no selected dataset", async () => {
        const commit = vi.fn();
        const root = mockRootState({
            baseline: mockBaselineState()
        });

        await actions.getUserCanUpload({commit, state, rootState: root} as any);

        expect(commit.mock.calls.length).toBe(0);
        expect(mockAxios.history.get.length).toBe(0);
    });

    it("getUserCanUpload fetches updateable dataset and commits when user can upload", async () => {
        const commit = vi.fn();
        const root = mockRootState({
            baseline: mockBaselineState({selectedDataset: {organization: {id: "test-org"}} as any})
        });
        const updateableOrgs = [{id: "other-org"}, {id: "test-org"}];
        mockAxios.onGet(`adr/orgs?permission=update_dataset`)
            .reply(200, mockSuccess(updateableOrgs));

        await actions.getUserCanUpload({commit, state, rootState: root} as any);

        expect(commit.mock.calls.length).toBe(1);
        expect(commit.mock.calls[0][0]).toStrictEqual({type: "SetUserCanUpload", payload: true});
    });

    it("getUserCanUpload fetches updateable dataset and commits when user cannot upload", async () => {
        const commit = vi.fn();
        const root = mockRootState({
            baseline: mockBaselineState({selectedDataset: {organization: {id: "test-org"}} as any})
        });
        const updateableOrgs = [{id: "other-org"}, {id: "other-org-2"}];
        mockAxios.onGet(`adr/orgs?permission=update_dataset`)
            .reply(200, mockSuccess(updateableOrgs));

        await actions.getUserCanUpload({commit, state, rootState: root} as any);

        expect(commit.mock.calls.length).toBe(1);
        expect(commit.mock.calls[0][0]).toStrictEqual({type: "SetUserCanUpload", payload: false});
    });

    it("getUserCanUpload commits error", async () => {
        const commit = vi.fn();
        const root = mockRootState({
            baseline: mockBaselineState({selectedDataset: {organization: {id: "test-org"}} as any})
        });
        mockAxios.onGet(`adr/orgs?permission=update_dataset`)
            .reply(500, mockFailure("test-error"));

        await actions.getUserCanUpload({commit, state, rootState: root} as any);
        expect(commit.mock.calls.length).toBe(1);
        expect(commit.mock.calls[0][0].type).toBe("ADRError");
        expect(commit.mock.calls[0][0].payload).toStrictEqual(mockError("test-error"));
    });

    it("getUserCanUpload dispatches getDataset to set organisation if necessary", async () => {
        const root = mockRootState({
            baseline: mockBaselineState({selectedDataset: {id: "test-dataset", release: "2.0"}} as any)
        });
        const organization = {id: "test-org"};
        const dispatch = vi.fn().mockImplementation((mutation, payload) => {
            if (mutation === "getDataset" && payload.id === "test-dataset" && payload.release === "2.0") {
                root.baseline.selectedDataset!.organization = organization;
            }
        });
        const commit = vi.fn();

        mockAxios.onGet(`adr/orgs?permission=update_dataset`)
            .reply(200, mockSuccess([{id: "test-org"}]));

        await actions.getUserCanUpload({commit, state, rootState: root, dispatch} as any);

        expect(commit.mock.calls.length).toBe(1);
        expect(commit.mock.calls[0][0]).toStrictEqual({type: "SetUserCanUpload", payload: true});
    });

    it("fetches dataset without release", async () => {
        const state = mockADRState({schemas: {baseUrl: "adr.com"} as any});
        mockAxios.onGet(`/adr/datasets/abc123`)
            .reply(200, mockSuccess({
                id: "abc123",
                resources: [],
                organization: {}
            }));

        const commit = vi.fn();

        await actions.getDataset({commit, state, rootState} as any, {id: "abc123"});

        expect(commit.mock.calls.length).toBe(2);
        expect(commit.mock.calls[0][0]).toBe("baseline/SetDataset");
        expect(commit.mock.calls[0][1].id).toBe("abc123");
        expect(commit.mock.calls[1][0]).toBe("baseline/SetRelease");
        expect(commit.mock.calls[1][1]).toBe(null);
    });

    it("fetches dataset with release", async () => {
        const state = mockADRState({schemas: {baseUrl: "adr.com"} as any});
        mockAxios.onGet(`/adr/datasets/abc123?release=V+1.0`)
            .reply(200, mockSuccess({
                id: "abc123",
                resources: [],
                organization: {}
            }));

        const commit = vi.fn();
        const release = {
            id: "V 1.0",
            name: "releaseName",
            notes: "releaseNotes",
            activity_id: "activityId"
        }

        await actions.getDataset({commit, state, rootState} as any, {id: "abc123", release});

        expect(commit.mock.calls.length).toBe(2);
        expect(commit.mock.calls[0][0]).toBe("baseline/SetDataset");
        expect(commit.mock.calls[0][1].id).toBe("abc123");
        expect(commit.mock.calls[0][1].release).toStrictEqual(release.id);
        expect(commit.mock.calls[1][0]).toBe("baseline/SetRelease");
        expect(commit.mock.calls[1][1]).toBe(release);
    });

});
