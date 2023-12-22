import {actions} from "../../app/store/projects/actions";
import {login, rootState} from "./integrationTest";
import {ProjectsMutations} from "../../app/store/projects/mutations";
import {RootMutation} from "../../app/store/root/mutations";
import {initialProjectsState} from "../../app/store/projects/projects";
import {emptyState} from "../../app/root";

describe("Projects actions", () => {
    beforeAll(async () => {
        await login();
    });

    const projectPayload = {name: "v1"}

    it("can check user exists", async () => {
        let result = await actions.userExists({rootState} as any, "test.user@example.com");
        expect(result).toBe(true);

        result = await actions.userExists({rootState} as any, "bad.user@example.com");
        expect(result).toBe(false);
    });

    it("can clone project", async () => {
        const commit = vi.fn();
        const dispatch = vi.fn();
        await actions.createProject({commit: vi.fn(), dispatch, rootState, state: initialProjectsState()} as any, projectPayload);
        await actions.cloneProject({commit, rootState, state: initialProjectsState()} as any,
            {projectId: 1, emails: ["test.user@example.com"]});

        expect(dispatch.mock.calls[0][0]).toBe("getProjects");
        expect(commit.mock.calls.length).toBe(2);
        expect(commit.mock.calls[0][0]["type"]).toBe(ProjectsMutations.CloningProject);
        expect(commit.mock.calls[0][0]["payload"]).toBe(true);

        expect(commit.mock.calls[1][0]["type"]).toBe(ProjectsMutations.CloningProject);
        expect(commit.mock.calls[1][0]["payload"]).toBe(null);
    });

    it("can create project", async () => {
        const commit = vi.fn();
        const dispatch = vi.fn();
        await actions.createProject({commit, dispatch, rootState, state: initialProjectsState()} as any, projectPayload);

        expect(commit.mock.calls.length).toBe(5);
        expect(commit.mock.calls[0][0]["type"]).toBe("downloadResults/ResetIds");
        expect(commit.mock.calls[1][0]["type"]).toBe("modelCalibrate/ResetIds");
        expect(commit.mock.calls[2][0]["type"]).toBe("modelRun/ResetIds");
        expect(commit.mock.calls[3][0]["type"]).toBe(ProjectsMutations.SetLoading);
        expect(commit.mock.calls[3][0]["payload"]).toBe(true);

        expect(commit.mock.calls[4][0]["type"]).toBe(RootMutation.SetProject);
        const createdProject = commit.mock.calls[4][0]["payload"];
        expect(createdProject.id).toBeTruthy();
        expect(createdProject.name).toBe("v1");
        expect(createdProject.versions.length).toBe(1);
        expect(dispatch.mock.calls[0][0]).toBe("getProjects");
    });

    it("can save version", async () => {
        const commit = vi.fn();
        const dispatch = vi.fn()
        const state = initialProjectsState();
        const rootState = {...emptyState(), projects: state}
        await actions.createProject({commit, dispatch, rootState, state} as any, projectPayload);

        const createdProject = commit.mock.calls[4][0]["payload"];
        expect(dispatch.mock.calls[0][0]).toBe("getProjects");
        state.currentProject = createdProject;
        state.currentVersion = createdProject.versions[0];

        await actions.queueVersionStateUpload({commit, rootState, state} as any);
        await new Promise((r) => setTimeout(r, 2500))
        expect(commit.mock.calls.length).toBe(11);
        expect(commit.mock.calls[5][0]["type"]).toBe(ProjectsMutations.ClearQueuedVersionUpload);
        expect(commit.mock.calls[6][0]["type"]).toBe(ProjectsMutations.SetQueuedVersionUpload);
        expect(commit.mock.calls[7][0]["type"]).toBe(ProjectsMutations.ClearQueuedVersionUpload);
        expect(commit.mock.calls[8][0]["type"]).toBe(ProjectsMutations.SetVersionUploadInProgress);
        expect(commit.mock.calls[8][0]["payload"]).toBe(true);
        expect(commit.mock.calls[9][0]["type"]).toBe(ProjectsMutations.VersionUploadSuccess);
        expect(commit.mock.calls[10][0]["type"]).toBe(ProjectsMutations.SetVersionUploadInProgress);
        expect(commit.mock.calls[10][0]["payload"]).toBe(false);
    });

    it("can create new version", async () => {
        const commit = vi.fn();
        const dispatch = vi.fn();
        const state = initialProjectsState();
        const rootState = {...emptyState(), projects: state}
        await actions.createProject({commit, dispatch, rootState, state} as any, projectPayload);

        const createdProject = commit.mock.calls[4][0]["payload"];
        expect(dispatch.mock.calls[0][0]).toBe("getProjects");
        state.currentProject = createdProject;
        state.currentVersion = createdProject.versions[0];

        await actions.newVersion({commit, rootState, state} as any, "version note");
        await new Promise((r) => setTimeout(r, 500))
        expect(commit.mock.calls.length).toBe(9);
        expect(commit.mock.calls[5][0]["type"]).toBe(ProjectsMutations.SetVersionUploadInProgress);
        expect(commit.mock.calls[5][0]["payload"]).toBe(true);
        expect(commit.mock.calls[6][0]["type"]).toBe(ProjectsMutations.VersionUploadSuccess);
        expect(commit.mock.calls[7][0]["type"]).toBe(ProjectsMutations.SetVersionUploadInProgress);
        expect(commit.mock.calls[7][0]["payload"]).toBe(false);
        expect(commit.mock.calls[8][0]["type"]).toBe(ProjectsMutations.VersionCreated);

        const newVersion = commit.mock.calls[8][0]["payload"];
        expect(newVersion.id).toBeTruthy();
        expect(newVersion.id).not.toEqual(createdProject.versions[0].id);
    });

    it("can load version", async () => {
        const state = initialProjectsState();
        const rootState = {...emptyState(), projects: state}
        const commit = vi.fn();
        const dispatch = vi.fn();
        await actions.createProject({commit, dispatch, rootState, state} as any, projectPayload);

        const createdProject = commit.mock.calls[4][0]["payload"];
        expect(dispatch.mock.calls[0][0]).toBe("getProjects");
        state.currentProject = createdProject;
        state.currentVersion = createdProject.versions[0];

        await actions.queueVersionStateUpload({commit, rootState, state} as any);

        const projectId = createdProject.id;
        const versionId = createdProject.versions[0].id;
        await new Promise((r) => setTimeout(r, 2400))

        await actions.loadVersion({commit, dispatch, state, rootState} as any, {projectId: projectId, versionId});
        await new Promise((r) => setTimeout(r, 400))
        expect(dispatch.mock.calls[1][0]).toBe("load/loadFromVersion");
        const fetchedVersion = dispatch.mock.calls[1][1];
        expect(fetchedVersion.state).toBeTruthy();
        expect(fetchedVersion.files).toBeTruthy();
    });

    it("can delete project", async () => {
        const state = initialProjectsState();
        const commit = vi.fn();
        const dispatch = vi.fn();
        await actions.createProject({commit, dispatch, rootState, state} as any, projectPayload);
        expect(commit.mock.calls.length).toBe(5);
        expect(dispatch.mock.calls[0][0]).toBe("getProjects");

        const createdProject = commit.mock.calls[4][0]["payload"];
        state.currentProject = createdProject;
        state.currentVersion = createdProject.versions[0];

        await actions.deleteProject({commit, dispatch, state, rootState} as any, state.currentProject!.id);
        expect(commit.mock.calls.length).toBe(6);
        expect(commit.mock.calls[5][0]).toStrictEqual({type: ProjectsMutations.ClearCurrentVersion});
        expect(dispatch.mock.calls[1][0]).toBe("getProjects");
    });

    it("can delete version", async () => {
        const state = initialProjectsState();
        const commit = vi.fn();
        const dispatch = vi.fn();
        await actions.createProject({commit, dispatch, rootState, state} as any, projectPayload);
        expect(commit.mock.calls.length).toBe(5);
        expect(dispatch.mock.calls[0][0]).toBe("getProjects");

        const createdProject = commit.mock.calls[4][0]["payload"];
        state.currentProject = createdProject;
        state.currentVersion = createdProject.versions[0];

        const ids = {projectId: state.currentProject!.id, versionId: state.currentVersion!.id};
        await actions.deleteVersion({commit, dispatch, state, rootState} as any, ids);
        expect(commit.mock.calls.length).toBe(6);
        expect(commit.mock.calls[5][0]).toStrictEqual({type: ProjectsMutations.ClearCurrentVersion});
        expect(dispatch.mock.calls[1][0]).toBe("getProjects");
    });

    it("can promote version", async () => {
        const state = initialProjectsState();
        const commit = vi.fn();
        const dispatch = vi.fn();

        await actions.createProject({commit, dispatch, rootState, state} as any, projectPayload);
        expect(commit.mock.calls.length).toBe(5);
        expect(dispatch.mock.calls[0][0]).toBe("getProjects");

        const createdProject = commit.mock.calls[4][0]["payload"];
        state.currentProject = createdProject;
        state.currentVersion = createdProject.versions[0];
        const versionPayload = {
            version: {projectId: state.currentProject!.id, versionId: state.currentVersion!.id},
            name: "newProject",
            note: "new note"
        };

        const newCommit = vi.fn();
        await actions.promoteVersion({newCommit, dispatch, state, rootState} as any, versionPayload);
        expect(newCommit.mock.calls.length).toBe(0);
        expect(dispatch.mock.calls[1][0]).toBe("getProjects");
    });

    it("can update version note", async () => {
        const state = initialProjectsState();
        const commit = vi.fn();
        const dispatch = vi.fn();

        await actions.createProject({commit, dispatch, rootState, state} as any, projectPayload);
        expect(commit.mock.calls.length).toBe(5);
        expect(dispatch.mock.calls[0][0]).toBe("getProjects");

        const createdProject = commit.mock.calls[4][0]["payload"];
        state.currentProject = createdProject;
        state.currentVersion = createdProject.versions[0];
        const versionPayload = {
            version: {projectId: state.currentProject!.id, versionId: state.currentVersion!.id},
            note: 'updated Version note'
        };

        await actions.updateVersionNote({commit, dispatch, state, rootState} as any, versionPayload);
        expect(dispatch.mock.calls.length).toBe(2);
        expect(dispatch.mock.calls[1][0]).toBe("getProjects");
    });

    it("can update project note", async () => {
        const state = initialProjectsState();
        const commit = vi.fn();
        const dispatch = vi.fn();

        await actions.createProject({commit, dispatch, rootState, state} as any, projectPayload);
        expect(commit.mock.calls.length).toBe(5);
        expect(dispatch.mock.calls[0][0]).toBe("getProjects");

        const createdProject = commit.mock.calls[4][0]["payload"];
        state.currentProject = createdProject;
        const projectPayloadLocal = {
            projectId: state.currentProject!.id,
            note: 'updated Project note'
        };

        await actions.updateProjectNote({commit, dispatch, state, rootState} as any, projectPayloadLocal);
        expect(dispatch.mock.calls.length).toBe(2);
        expect(dispatch.mock.calls[1][0]).toBe("getProjects");
    });

    it("can rename project", async () => {
        const state = initialProjectsState();
        const commit = vi.fn();
        const dispatch = vi.fn();

        await actions.createProject({commit, dispatch, rootState, state} as any, projectPayload);
        expect(commit.mock.calls.length).toBe(5);
        expect(dispatch.mock.calls[0][0]).toBe("getProjects");

        const createdProject = commit.mock.calls[4][0]["payload"];
        state.currentProject = createdProject;
        state.currentVersion = createdProject.versions[0];
        const projectPayloadLocal = {
            projectId: state.currentProject!.id,
            note: "rename project test",
            name: 'renamedProject'
        };

        await actions.renameProject({commit, dispatch, state, rootState} as any, projectPayloadLocal);
        expect(commit.mock.calls.length).toBe(5);
        expect(dispatch.mock.calls.length).toBe(3);
        expect(dispatch.mock.calls[1][0]).toBe("getCurrentProject");
        expect(dispatch.mock.calls[2][0]).toBe("getProjects");
    });

});
