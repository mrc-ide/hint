import {Mutation, MutationTree} from 'vuex';
import {LoadingState, LoadState} from "./state";
import {PayloadWithType} from "../../types";
import {
    Error, ProjectRehydrateResultResponse,
    ProjectRehydrateStatusResponse
    , ProjectRehydrateSubmitResponse
} from "../../generated";

type LoadMutation = Mutation<LoadState>

export interface LoadMutations {
    SettingFiles: LoadMutation,
    UpdatingState: LoadMutation,
    LoadFailed: LoadMutation,
    LoadStateCleared: LoadMutation,
    PreparingRehydrate: LoadMutation,
    StartPreparingRehydrate: LoadMutation,
    RehydrateStatusUpdated: LoadMutation,
    RehydratePollingStarted: LoadMutation,
    RehydrateResult: LoadMutation,
    RehydrateResultError: LoadMutation,
    SetNewProjectName: LoadMutation,
    RehydrateCancel: LoadMutation
}

export const mutations: MutationTree<LoadState> & LoadMutations = {
    SettingFiles(state: LoadState) {
        state.loadingState = LoadingState.SettingFiles;
    },
    SetNewProjectName(state: LoadState, projectName: string) {
        state.newProjectName = projectName
    },
    RehydrateCancel(state: LoadState) {
        state.preparing = false;
        state.loadingState = LoadingState.NotLoading;
        if (state.statusPollId > -1) {
            stopPolling(state);
        }
    },
    UpdatingState(state: LoadState) {
        state.loadingState = LoadingState.UpdatingState;
    },
    LoadFailed(state: LoadState, action: PayloadWithType<Error>) {
        state.loadingState = LoadingState.LoadFailed;
        state.loadError = action.payload;
    },
    LoadStateCleared(state: LoadState) {
        //For both load success and clear error
        state.loadingState = LoadingState.NotLoading;
        state.loadError = null;
    },
    RehydrateResult(state: LoadState, action: PayloadWithType<ProjectRehydrateResultResponse>) {
        state.rehydrateResult = action.payload;
        state.preparing = false;
        state.loadingState = LoadingState.NotLoading;
        state.loadError = null;
    },
    RehydrateResultError(state: LoadState, action: PayloadWithType<Error>) {
        state.loadError = action.payload;
        state.preparing = false;
        state.rehydrateResult = {} as ProjectRehydrateResultResponse
        state.loadingState = LoadingState.LoadFailed;
        if (state.statusPollId > -1) {
            stopPolling(state);
        }
    },
    PreparingRehydrate(state: LoadState, action: PayloadWithType<ProjectRehydrateSubmitResponse>) {
        state.rehydrateId = action.payload.id;
        state.complete = false;
        state.loadError = null;
    },
    StartPreparingRehydrate(state: LoadState) {
        state.preparing = true;
        state.loadingState = LoadingState.SettingFiles;
    },
    RehydrateStatusUpdated(state: LoadState, action: PayloadWithType<ProjectRehydrateStatusResponse>) {
        if (action.payload.done) {
            stopPolling(state);
        }
        state.loadError = null;
    },
    RehydratePollingStarted(state: LoadState, action: PayloadWithType<number>) {
        state.statusPollId = action.payload;
    }
};

const stopPolling = (state: LoadState) => {
    clearInterval(state.statusPollId);
    state.statusPollId = -1;
};
