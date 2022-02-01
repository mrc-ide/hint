import {RootState} from "../../root";
import {Module} from "vuex";
import {actions} from "./actions";
import {mutations} from "./mutations";
import {DownloadResultsDependency} from "../../types";

export interface DownloadResultsState {
    spectrum: DownloadResultsDependency
    coarseOutput: DownloadResultsDependency
    summary: DownloadResultsDependency
}

export const initialDownloadResults = {
    downloadId: "",
    preparing: false,
    statusPollId: -1,
    complete: false,
    error: null
}

export enum DOWNLOAD_TYPE {
    SPECTRUM = "Spectrum",
    COARSE = "CoarseOutput",
    SUMMARY = "Summary"
}

export const initialDownloadResultsState = (): DownloadResultsState => {
    return {
        spectrum: {...initialDownloadResults},
        coarseOutput: {...initialDownloadResults},
        summary: {...initialDownloadResults}
    }
}

export const downloadResults: Module<DownloadResultsState, RootState> = {
    namespaced: true,
    state: {...initialDownloadResultsState()},
    actions,
    mutations

}