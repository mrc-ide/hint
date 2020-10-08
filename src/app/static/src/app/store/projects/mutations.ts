import {MutationTree} from "vuex";
import {ProjectsState} from "./projects";
import {PayloadWithType, Version, Project, VersionIds, CurrentProject} from "../../types";
import {Error} from "../../generated";

export enum ProjectsMutations {
    SetLoading = "SetLoading",
    SetPreviousProjects = "SetPreviousProjects",
    SetVersionUploadPending = "SetVersionUploadPending",
    ProjectError = "ProjectError",
    VersionCreated = "VersionCreated",
    VersionUploadSuccess = "VersionUploadSuccess",
    ClearCurrentVersion = "ClearCurrentVersion",
    SetCurrentProject = "SetCurrentProject"
}

export const mutations: MutationTree<ProjectsState> = {
    [ProjectsMutations.SetLoading](state: ProjectsState, action: PayloadWithType<boolean>) {
        state.error = null;
        state.loading = action.payload;
    },
    [ProjectsMutations.SetPreviousProjects](state: ProjectsState, action: PayloadWithType<Project[]>) {
        state.previousProjects = action.payload;
        state.loading = false;
    },
    [ProjectsMutations.SetVersionUploadPending](state: ProjectsState, action: PayloadWithType<boolean>) {
        state.versionUploadPending = action.payload;
    },
    [ProjectsMutations.ProjectError](state: ProjectsState, action: PayloadWithType<Error>) {
        state.error = action.payload;
        state.loading = false;
    },
    [ProjectsMutations.VersionCreated](state: ProjectsState, action: PayloadWithType<Version>) {
        const version = action.payload;
        state.currentProject!.versions.push(version);
        state.currentVersion = version;
    },
    [ProjectsMutations.VersionUploadSuccess](state: ProjectsState) {
        state.versionTime = new Date(Date.now());
    },
    [ProjectsMutations.ClearCurrentVersion](state: ProjectsState) {
        state.currentProject = null;
        state.currentVersion = null;
    },
    [ProjectsMutations.ClearCurrentVersion](state: ProjectsState, action: PayloadWithType<CurrentProject>) {
        state.currentProject = action.payload.project;
        state.currentVersion = action.payload.version;
    }
};
