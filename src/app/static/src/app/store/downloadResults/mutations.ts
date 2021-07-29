import {MutationTree} from "vuex";
import {DownloadResultsState, DOWNLOAD_TYPE} from "./downloadResults";
import {PayloadWithType, PollingStarted} from "../../types";
import {DownloadStatusResponse, DownloadSubmitResponse, Error} from "../../generated";

export enum DownloadResultsMutation {
    SpectrumDownloadStarted = "SpectrumDownloadStarted",
    SpectrumDownloadStatusUpdated = "SpectrumDownloadStatusUpdated",
    SpectrumDownloadComplete = "SpectrumDownloadComplete",
    SpectrumError = "SpectrumError",
    CoarseOutputDownloadStarted = "CoarseOutputDownloadStarted",
    CoarseOutputDownloadStatusUpdated = "CoarseOutputDownloadStatusUpdated",
    CoarseOutputError = "CoarseOutputError",
    CoarseOutputDownloadComplete = "CoarseOutputDownloadComplete",
    SummaryDownloadStarted = "SummaryDownloadStarted",
    SummaryDownloadStatusUpdated = "SummaryDownloadStatusUpdated",
    SummaryDownloadComplete = "SummaryDownloadComplete",
    SummaryError = "SummaryError",
    PollingStatusStarted = "PollingStatusStarted",
    StopPolling = "StopPolling"
}

export const mutations: MutationTree<DownloadResultsState> = {

    [DownloadResultsMutation.SpectrumDownloadStarted](state: DownloadResultsState, action: PayloadWithType<DownloadSubmitResponse>) {
        const downloadId = action.payload.id
        state.spectrum = {...state.spectrum, downloadId, downloading: true, complete: false, error: null}
    },

    [DownloadResultsMutation.SpectrumDownloadStatusUpdated](state: DownloadResultsState, action: PayloadWithType<DownloadStatusResponse>) {
        if (action.payload.done) {
            state.spectrum.complete = true;
            state.spectrum.downloading = false;
        }
        state.spectrum.status = action.payload;
        state.spectrum.error = null;
    },

    [DownloadResultsMutation.SpectrumDownloadComplete](state: DownloadResultsState, action: PayloadWithType<boolean>) {
        state.spectrum.complete = action.payload;
        state.spectrum.downloading = false;
    },

    [DownloadResultsMutation.SpectrumError](state: DownloadResultsState, action: PayloadWithType<Error>) {
        state.spectrum.error = action.payload
        state.spectrum.downloading = false
    },

    [DownloadResultsMutation.CoarseOutputDownloadStarted](state: DownloadResultsState, action: PayloadWithType<DownloadSubmitResponse>) {
        const downloadId = action.payload.id
        state.coarseOutput = {...state.coarseOutput, downloadId, downloading: true, complete: false, error: null}
    },

    [DownloadResultsMutation.CoarseOutputDownloadStatusUpdated](state: DownloadResultsState, action: PayloadWithType<DownloadStatusResponse>) {
        if (action.payload.done) {
            state.coarseOutput.complete = true;
            state.coarseOutput.downloading = false;
        }
        state.coarseOutput.status = action.payload;
        state.coarseOutput.error = null;
    },

    [DownloadResultsMutation.CoarseOutputDownloadComplete](state: DownloadResultsState, action: PayloadWithType<boolean>) {
        state.coarseOutput.complete = action.payload;
        state.coarseOutput.downloading = false;
    },

    [DownloadResultsMutation.CoarseOutputError](state: DownloadResultsState, action: PayloadWithType<Error>) {
        state.coarseOutput.error = action.payload
        state.coarseOutput.downloading = false
    },

    [DownloadResultsMutation.SummaryDownloadStarted](state: DownloadResultsState, action: PayloadWithType<DownloadSubmitResponse>) {
        const downloadId = action.payload.id
        state.summary = {...state.summary, downloadId, downloading: true, complete: false, error: null}
    },

    [DownloadResultsMutation.SummaryDownloadStatusUpdated](state: DownloadResultsState, action: PayloadWithType<DownloadStatusResponse>) {
        if (action.payload.done) {
            state.summary.complete = true;
            state.summary.downloading = false;
        }
        state.summary.status = action.payload;
        state.summary.error = null;
    },

    [DownloadResultsMutation.SummaryDownloadComplete](state: DownloadResultsState, action: PayloadWithType<boolean>) {
        state.summary.complete = action.payload;
        state.summary.downloading = false;
    },

    [DownloadResultsMutation.SummaryError](state: DownloadResultsState, action: PayloadWithType<Error>) {
        state.summary.error = action.payload
        state.summary.downloading = false
    },

    [DownloadResultsMutation.PollingStatusStarted](state: DownloadResultsState, action: PayloadWithType<PollingStarted>) {
        switch (action.payload.downloadType) {
            case DOWNLOAD_TYPE.SPECTRUM: {
                state.spectrum.statusPollId = action.payload.pollId
                break;
            }
            case DOWNLOAD_TYPE.COARSE: {
                state.coarseOutput.statusPollId = action.payload.pollId
                break;
            }
            case DOWNLOAD_TYPE.SUMMARY: {
                state.summary.statusPollId = action.payload.pollId
                break
            }
        }
    }
};