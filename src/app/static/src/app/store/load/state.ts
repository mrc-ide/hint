import {Error, ProjectRehydrateResultResponse} from "../../generated";

// NB We define state and initialLoadState in separate file to the load module to 
// avoid circular dependency issues when calling root emptyState from 
// load/actions

export enum LoadingState { NotLoading, SettingFiles, UpdatingState, LoadFailed }

export interface LoadState {
    loadingState: LoadingState,
    loadError: Error | null,
    rehydrateId: string
    preparing: boolean
    statusPollId: number
    complete: boolean
    rehydrateResult: ProjectRehydrateResultResponse
    newProjectName: string
}

export const initialLoadState = (): LoadState => {
    return {
        loadingState: LoadingState.NotLoading,
        loadError: null,
        rehydrateId: "",
        preparing: false,
        statusPollId: -1,
        complete: false,
        rehydrateResult: {} as ProjectRehydrateResultResponse,
        newProjectName: ""
    }
};
