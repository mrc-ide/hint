import {mockProjectsState} from "../mocks";
import {mutations, ProjectsMutations} from "../../app/store/projects/mutations";
import {router} from "../../app/router";
import {Mock} from "vitest";

describe("Projects mutations", () => {
    const testNow = Date.now();

    beforeAll(() => {
        vi.useFakeTimers();
        vi.setSystemTime(testNow);
    });

    afterAll(() => {
        vi.useRealTimers();
    });

    const mockProject = {
        id: 1,
        name: "v1",
        versions: [{id: "OLD VERSION", created: "old created time", updated: "old updated time", versionNumber: 1}]
    };

    const consoleSpy = vi.fn();

    beforeEach(() => {
        console.error = consoleSpy;
    });

    afterEach(() => {
        (console.error as Mock).mockClear();
    });

    it("sets cloningProject and resets error", () => {
        const state = mockProjectsState({cloneProjectError: "test error" as any});

        mutations[ProjectsMutations.CloningProject](state, {payload: true});
        expect(state.cloningProject).toBe(true);
        expect(state.cloneProjectError).toBe(null);

        mutations[ProjectsMutations.CloningProject](state, {payload: null});
        expect(state.cloningProject).toBe(false);
    });

    it("sets cloneProjectError and resets cloningProject", () => {
        const state = mockProjectsState({cloningProject: true});

        mutations[ProjectsMutations.CloneProjectError](state, {payload: "error"});
        expect(state.cloningProject).toBe(false);
        expect(state.cloneProjectError).toBe("error");
    });

    it("sets loading", () => {
        const state = mockProjectsState({error: "test error"} as any);

        mutations[ProjectsMutations.SetLoading](state, {payload: true});
        expect(state.loading).toBe(true);
        expect(state.error).toBe(null);

        mutations[ProjectsMutations.SetLoading](state, {payload: false});
        expect(state.loading).toBe(false);
    });

    it("sets error", () => {
        const state = mockProjectsState({loading: true});

        const error = {error: "error", detail: "detail"};
        mutations[ProjectsMutations.ProjectError](state, {payload: error});

        expect(state.error).toBe(error);
        expect(state.loading).toBe(false);
    });

    it("sets previous projects", () => {
        const state = mockProjectsState({loading: true});
        mutations[ProjectsMutations.SetPreviousProjects](state, {payload: ["TEST VERSION"]});

        expect(state.previousProjects).toStrictEqual(["TEST VERSION"]);
        expect(state.loading).toBe(false);
    });

    it("sets version upload in progress", () => {
        const state = mockProjectsState();
        mutations[ProjectsMutations.SetVersionUploadInProgress](state, {payload: true});
        expect(state.versionUploadInProgress).toBe(true);
    });

    it("sets interval id of queued upload", () => {
        const state = mockProjectsState();
        mutations[ProjectsMutations.SetQueuedVersionUpload](state, {payload: 123});
        expect(state.queuedVersionUploadIntervalId).toBe(123);
    });

    it("clears interval of queued upload", () => {
        vi.useFakeTimers();
        vi.spyOn(window, "clearInterval")
        const state = mockProjectsState({queuedVersionUploadIntervalId: 123});
        mutations[ProjectsMutations.ClearQueuedVersionUpload](state);
        expect(state.queuedVersionUploadIntervalId).toBe(-1);
        expect(clearInterval).toHaveBeenCalledTimes(1);
        expect(clearInterval).toHaveBeenLastCalledWith(123);
    });

    it("VersionUploadSuccess sets versionTime", () => {
        const state = mockProjectsState();
        mutations[ProjectsMutations.VersionUploadSuccess](state);
        expect(state.versionTime!.valueOf()).toEqual(testNow);
    });

    it("sets created version as current", () => {
        const state = mockProjectsState({currentProject: mockProject});

        const newVersion = {id: "NEW VERSION", created: "new time", updated: "new time"};
        mutations[ProjectsMutations.VersionCreated](state, {payload: newVersion});

        expect(state.currentVersion).toBe(newVersion);
        expect(state.currentProject!.versions.length).toBe(2);
        expect(state.currentProject!.versions[1]).toBe(newVersion);
    });

    it("clears current version", () => {
        const state = mockProjectsState({currentProject: mockProject, currentVersion: mockProject.versions[0]});

        mutations[ProjectsMutations.ClearCurrentVersion](state);
        expect(state.currentProject).toBeNull();
        expect(state.currentVersion).toBeNull();
    });

    it("pushes router to projects if logged in user and currentProject not set", () => {
        const state = mockProjectsState({currentProject: null, currentVersion: null});
        const mockRouterPush = vi.fn();
        router.push = mockRouterPush;
        mutations[ProjectsMutations.SetCurrentProject](state, {payload: false})

        expect(mockRouterPush.mock.calls.length).toBe(1);
        expect(mockRouterPush.mock.calls[0][0]).toBe("/projects");
    });
});
