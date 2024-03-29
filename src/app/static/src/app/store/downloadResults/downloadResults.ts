import {RootState} from "../../root";
import {Module} from "vuex";
import {actions} from "./actions";
import {mutations} from "./mutations";
import {DownloadResultsDependency} from "../../types";

export interface DownloadResultsState {
    spectrum: DownloadResultsDependency
    coarseOutput: DownloadResultsDependency
    summary: DownloadResultsDependency
    comparison: DownloadResultsDependency
    agyw: DownloadResultsDependency
}

export const initialDownloadResults = {
    fetchingDownloadId: false,
    downloadId: "",
    preparing: false,
    statusPollId: -1,
    complete: false,
    error: null,
    downloadError: null,
    metadataError: null
}

export const initialDownloadResultsState = (): DownloadResultsState => {
    return {
        spectrum: {...initialDownloadResults},
        coarseOutput: {...initialDownloadResults},
        summary: {...initialDownloadResults},
        comparison: {...initialDownloadResults},
        agyw: {...initialDownloadResults},
    }
}

export const downloadResults: Module<DownloadResultsState, RootState> = {
    namespaced: true,
    state: {...initialDownloadResultsState()},
    actions,
    mutations
}
