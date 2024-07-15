import {mockDownloadResultsDependency, mockDownloadResultsState, mockError} from "../mocks";
import {DownloadResultsMutation, mutations} from "../../app/store/downloadResults/mutations";
import {DOWNLOAD_TYPE} from "../../app/types";
import {DownloadStatusResponse} from "../../app/generated";

describe(`download results mutations`, () => {

    const downloadStartedPayload = {id: "P123"}
    const error = mockError("TEST FAILED")
    const errorMsg = {detail: "TEST FAILED", error: "OTHER_ERROR"}
    const CompleteStatusResponse: DownloadStatusResponse = {
        id: "db0c4957aea4b32c507ac02d63930110",
        done: true,
        progress: ["Generating summary report"],
        status: "COMPLETE",
        success: true,
        queue: 0
    }

    afterEach(() => {
        vi.useRealTimers();
    })

    it("sets summary download started on SummaryDownloadStarted", () => {
        const state = mockDownloadResultsState();
        mutations[DownloadResultsMutation.PreparingSummaryReport](state, {payload: downloadStartedPayload});
        expect(state.summary.preparing).toBe(true);
        expect(state.summary.downloadId).toBe("P123");
        expect(state.summary.complete).toBe(false);
        expect(state.summary.error).toBe(null);
    });

    it("sets summary download error, clears interval on SummaryError", () => {
        vi.useFakeTimers();
        const clearInterval = vi.spyOn(window, "clearInterval");
        const state = mockDownloadResultsState({
            summary: mockDownloadResultsDependency({statusPollId: 1})
        });
        mutations[DownloadResultsMutation.SummaryError](state, {payload: error});
        expect(state.summary.preparing).toBe(false);
        expect(state.summary.error).toEqual(errorMsg);
        expect(state.spectrum.error).toBe(null);
        expect(state.coarseOutput.error).toBe(null);
        expect(state.comparison.error).toEqual(null);
        expect(state.agyw.error).toEqual(null);
        expect(state.summary.statusPollId).toBe(-1);
        expect(clearInterval.mock.calls[0][0]).toBe(1);
    });

    it("sets summary download metadata error", () => {
        const state = mockDownloadResultsState();
        mutations[DownloadResultsMutation.SummaryMetadataError](state, {payload: error});
        expect(state.summary.metadataError).toEqual(errorMsg);
    });

    it("sets poll started for summary download on PollingStatusStarted", () => {
        const state = mockDownloadResultsState();
        const payload = {pollId: 123, downloadType: DOWNLOAD_TYPE.SUMMARY}
        mutations[DownloadResultsMutation.PollingStatusStarted](state, {payload: payload});
        expect(state.summary.statusPollId).toBeGreaterThan(-1);
    });

    it("sets summary download error", () => {
        const state = mockDownloadResultsState();
        mutations[DownloadResultsMutation.SummaryOutputDownloadError](state, {payload: error});
        expect(state.summary.downloadError).toEqual(errorMsg);
    });

    it("sets fetchingDownloadId for summary download on SetFetchingDownloadId", () => {
        const state = mockDownloadResultsState();
        const payload = DOWNLOAD_TYPE.SUMMARY
        mutations[DownloadResultsMutation.SetFetchingDownloadId](state, {payload: payload});
        expect(state.summary.fetchingDownloadId).toBe(true);
    });

    it("set summary status to complete, clears interval on SummaryDownloadStatusUpdated", () => {
        vi.useFakeTimers();
        const clearInterval = vi.spyOn(window, "clearInterval");
        const state = mockDownloadResultsState({
            summary: {
                preparing: true,
                complete: false,
                error: mockError(),
                downloadError: null,
                statusPollId: 123,
                downloadId: "111",
                fetchingDownloadId: false,
                metadataError: null
            }
        });
        mutations[DownloadResultsMutation.SummaryReportStatusUpdated](state, {payload: CompleteStatusResponse});
        expect(state.summary.preparing).toBe(false);
        expect(state.summary.complete).toBe(true);
        expect(state.summary.error).toBe(null);
        expect(state.summary.metadataError).toBe(null);
        expect(state.summary.statusPollId).toBe(-1);
        expect(state.summary.downloadId).toBe("111");
        expect(clearInterval.mock.calls[0][0]).toBe(123);
    });

    it("sets spectrum download started on SpectrumDownloadStarted", () => {
        const state = mockDownloadResultsState();
        mutations[DownloadResultsMutation.PreparingSpectrumOutput](state, {payload: downloadStartedPayload});
        expect(state.spectrum.preparing).toBe(true);
        expect(state.spectrum.downloadId).toBe("P123");
        expect(state.spectrum.complete).toBe(false);
        expect(state.spectrum.error).toBe(null);
    });

    it("sets spectrum download error on SpectrumError", () => {
        vi.useFakeTimers();
        const clearInterval = vi.spyOn(window, "clearInterval");
        const state = mockDownloadResultsState({
            spectrum: mockDownloadResultsDependency({statusPollId: 123})
        });
        mutations[DownloadResultsMutation.SpectrumError](state, {payload: error});
        expect(state.spectrum.preparing).toBe(false);
        expect(state.spectrum.error).toEqual(errorMsg);
        expect(state.coarseOutput.error).toBe(null);
        expect(state.summary.error).toBe(null);
        expect(state.comparison.error).toEqual(null);
        expect(state.agyw.error).toEqual(null);
        expect(clearInterval.mock.calls[0][0]).toBe(123);
    });

    it("sets spectrum download metadata error", () => {
        const state = mockDownloadResultsState();
        mutations[DownloadResultsMutation.SpectrumMetadataError](state, {payload: error});
        expect(state.spectrum.metadataError).toEqual(errorMsg);
    });

    it("sets poll started for spectrum download on PollingStatusStarted", () => {
        const state = mockDownloadResultsState();
        const payload = {pollId: 123, downloadType: DOWNLOAD_TYPE.SPECTRUM}
        mutations[DownloadResultsMutation.PollingStatusStarted](state, {payload: payload});
        expect(state.spectrum.statusPollId).toBeGreaterThan(-1);
    });

    it("sets fetchingDownloadId for spectrum download on SetFetchingDownloadId", () => {
        const state = mockDownloadResultsState();
        const payload = DOWNLOAD_TYPE.SPECTRUM
        mutations[DownloadResultsMutation.SetFetchingDownloadId](state, {payload: payload});
        expect(state.spectrum.fetchingDownloadId).toBe(true);
    });

    it("sets spectrum download error", () => {
        const state = mockDownloadResultsState();
        mutations[DownloadResultsMutation.SpectrumOutputDownloadError](state, {payload: error});
        expect(state.spectrum.downloadError).toEqual(errorMsg);
    });

    it("set spectrum status to complete, clears interval on SpectrumDownloadStatusUpdated", () => {
        vi.useFakeTimers();
        const clearInterval = vi.spyOn(window, "clearInterval");
        const state = mockDownloadResultsState({
            spectrum: {
                preparing: true,
                complete: false,
                error: mockError(),
                downloadError: null,
                statusPollId: 123,
                downloadId: "111",
                fetchingDownloadId: false,
                metadataError: null
            }
        });
        mutations[DownloadResultsMutation.SpectrumOutputStatusUpdated](state, {payload: CompleteStatusResponse});
        expect(state.spectrum.complete).toBe(true);
        expect(state.spectrum.preparing).toBe(false);
        expect(state.spectrum.error).toBe(null);
        expect(state.spectrum.metadataError).toBe(null);
        expect(state.spectrum.statusPollId).toBe(-1);
        expect(state.spectrum.downloadId).toBe("111");
        expect(clearInterval.mock.calls[0][0]).toBe(123);
    });

    it("sets coarseOutput download started on CoarseOutputDownloadStarted", () => {
        const state = mockDownloadResultsState();
        mutations[DownloadResultsMutation.PreparingCoarseOutput](state, {payload: downloadStartedPayload});
        expect(state.coarseOutput.preparing).toBe(true);
        expect(state.coarseOutput.downloadId).toBe("P123");
        expect(state.coarseOutput.complete).toBe(false);
        expect(state.coarseOutput.error).toBe(null);
    });

    it("sets coarseOutput download error on CoarseOutputError", () => {
        vi.useFakeTimers();
        const clearInterval = vi.spyOn(window, "clearInterval");
        const state = mockDownloadResultsState({
            coarseOutput: mockDownloadResultsDependency({
                statusPollId: 123
            })
        });
        mutations[DownloadResultsMutation.CoarseOutputError](state, {payload: error});
        expect(state.coarseOutput.preparing).toBe(false);
        expect(state.coarseOutput.error).toEqual(errorMsg);
        expect(state.spectrum.error).toBe(null);
        expect(state.summary.error).toBe(null);
        expect(state.comparison.error).toEqual(null);
        expect(state.agyw.error).toEqual(null);
        expect(clearInterval.mock.calls[0][0]).toBe(123);
    });

    it("sets coarseOutput download metadata error", () => {
        const state = mockDownloadResultsState();
        mutations[DownloadResultsMutation.CoarseOutputMetadataError](state, {payload: error});
        expect(state.coarseOutput.metadataError).toEqual(errorMsg);
    });

    it("sets poll started for coarseOutput download on PollingStatusStarted", () => {
        const state = mockDownloadResultsState();
        const payload = {pollId: 123, downloadType: DOWNLOAD_TYPE.COARSE}
        mutations[DownloadResultsMutation.PollingStatusStarted](state, {payload: payload});
        expect(state.coarseOutput.statusPollId).toBeGreaterThan(-1);
    });

    it("sets fetchingDownloadId for coarseOutput download on SetFetchingDownloadId", () => {
        const state = mockDownloadResultsState();
        const payload = DOWNLOAD_TYPE.COARSE
        mutations[DownloadResultsMutation.SetFetchingDownloadId](state, {payload: payload});
        expect(state.coarseOutput.fetchingDownloadId).toBe(true);
    });

    it("sets coarseOutput download error", () => {
        const state = mockDownloadResultsState();
        mutations[DownloadResultsMutation.CoarseOutputDownloadError](state, {payload: error});
        expect(state.coarseOutput.downloadError).toEqual(errorMsg);
    });

    it("set coarseOutput status to complete, clears interval on CoarseOutputDownloadStatusUpdated", () => {
        vi.useFakeTimers();
        const clearInterval = vi.spyOn(window, "clearInterval");
        const state = mockDownloadResultsState({
            coarseOutput: {
                preparing: true,
                complete: false,
                error: mockError(),
                downloadError: null,
                statusPollId: 123,
                downloadId: "111",
                fetchingDownloadId: false,
                metadataError: null
            }
        });
        mutations[DownloadResultsMutation.CoarseOutputStatusUpdated](state, {payload: CompleteStatusResponse});
        expect(state.coarseOutput.complete).toBe(true);
        expect(state.coarseOutput.preparing).toBe(false);
        expect(state.coarseOutput.error).toBe(null);
        expect(state.coarseOutput.metadataError).toBe(null);
        expect(state.coarseOutput.statusPollId).toBe(-1);
        expect(state.coarseOutput.downloadId).toBe("111");
        expect(clearInterval.mock.calls[0][0]).toBe(123);
    });

    it("sets comparison download started on ComparisonDownloadStarted", () => {
        const state = mockDownloadResultsState();
        mutations[DownloadResultsMutation.PreparingComparisonOutput](state, {payload: downloadStartedPayload});
        expect(state.comparison.preparing).toBe(true);
        expect(state.comparison.downloadId).toBe("P123");
        expect(state.comparison.complete).toBe(false);
        expect(state.comparison.error).toBe(null);
    });

    it("sets comparison download error on ComparisonError", () => {
        vi.useFakeTimers();
        const clearInterval = vi.spyOn(window, "clearInterval");
        const state = mockDownloadResultsState({
            comparison: mockDownloadResultsDependency({statusPollId: 123})
        });
        mutations[DownloadResultsMutation.ComparisonError](state, {payload: error});
        expect(state.comparison.preparing).toBe(false);
        expect(state.comparison.error).toEqual(errorMsg);
        expect(state.coarseOutput.error).toBe(null);
        expect(state.summary.error).toBe(null);
        expect(state.spectrum.error).toBe(null);
        expect(clearInterval.mock.calls[0][0]).toBe(123);
    });

    it("sets comparison download metadata error", () => {
        const state = mockDownloadResultsState();
        mutations[DownloadResultsMutation.ComparisonOutputMetadataError](state, {payload: error});
        expect(state.comparison.metadataError).toEqual(errorMsg);
    });

    it("sets comparison download error", () => {
        const state = mockDownloadResultsState();
        mutations[DownloadResultsMutation.ComparisonDownloadError](state, {payload: error});
        expect(state.comparison.downloadError).toEqual(errorMsg);
    });

    it("sets poll started for comparison download on PollingStatusStarted", () => {
        const state = mockDownloadResultsState();
        const payload = {pollId: 123, downloadType: DOWNLOAD_TYPE.COMPARISON}
        mutations[DownloadResultsMutation.PollingStatusStarted](state, {payload: payload});
        expect(state.comparison.statusPollId).toBeGreaterThan(-1);
    });

    it("sets fetchingDownloadId for comparison download on SetFetchingDownloadId", () => {
        const state = mockDownloadResultsState();
        const payload = DOWNLOAD_TYPE.COMPARISON
        mutations[DownloadResultsMutation.SetFetchingDownloadId](state, {payload: payload});
        expect(state.comparison.fetchingDownloadId).toBe(true);
    });

    it("set comparison status to complete, clears interval on ComparisonDownloadStatusUpdated", () => {
        vi.useFakeTimers();
        const clearInterval = vi.spyOn(window, "clearInterval");
        const state = mockDownloadResultsState({
            comparison: {
                preparing: true,
                complete: false,
                error: mockError(),
                statusPollId: 123,
                downloadId: "111",
                downloadError: mockError("test"),
                fetchingDownloadId: false,
                metadataError: null
            }
        });
        mutations[DownloadResultsMutation.ComparisonOutputStatusUpdated](state, {payload: CompleteStatusResponse});
        expect(state.comparison.complete).toBe(true);
        expect(state.comparison.preparing).toBe(false);
        expect(state.comparison.error).toBe(null);
        expect(state.comparison.error).toBe(null);
        expect(state.comparison.metadataError).toBe(null);
        expect(state.comparison.statusPollId).toBe(-1);
        expect(state.comparison.downloadId).toBe("111");
        expect(clearInterval.mock.calls[0][0]).toBe(123);
    });

    it("sets AGYW download started on PreparingAgywTool", () => {
        const state = mockDownloadResultsState();
        mutations[DownloadResultsMutation.PreparingAgywTool](state, {payload: downloadStartedPayload});
        expect(state.agyw.preparing).toBe(true);
        expect(state.agyw.downloadId).toBe("P123");
        expect(state.agyw.complete).toBe(false);
        expect(state.agyw.error).toBe(null);
    });

    it("sets AGYW download error on AgywError", () => {
        vi.useFakeTimers();
        const clearInterval = vi.spyOn(window, "clearInterval");
        const state = mockDownloadResultsState({
            agyw: mockDownloadResultsDependency({statusPollId: 123})
        });
        mutations[DownloadResultsMutation.AgywError](state, {payload: error});
        expect(state.agyw.preparing).toBe(false);
        expect(state.agyw.error).toEqual(errorMsg);
        expect(state.coarseOutput.error).toBe(null);
        expect(state.summary.error).toBe(null);
        expect(state.spectrum.error).toBe(null);
        expect(state.comparison.error).toEqual(null);
        expect(clearInterval.mock.calls[0][0]).toBe(123);
    });

    it("sets AGYW download error", () => {
        const state = mockDownloadResultsState();
        mutations[DownloadResultsMutation.AgywDownloadError](state, {payload: error});
        expect(state.agyw.downloadError).toEqual(errorMsg);
    });

    it("sets poll started for AGYW download on PollingStatusStarted", () => {
        const state = mockDownloadResultsState();
        const payload = {pollId: 123, downloadType: DOWNLOAD_TYPE.AGYW}
        mutations[DownloadResultsMutation.PollingStatusStarted](state, {payload: payload});
        expect(state.agyw.statusPollId).toBeGreaterThan(-1);
    });

    it("sets fetchingDownloadId for AGYW download on SetFetchingDownloadId", () => {
        const state = mockDownloadResultsState();
        const payload = DOWNLOAD_TYPE.AGYW
        mutations[DownloadResultsMutation.SetFetchingDownloadId](state, {payload: payload});
        expect(state.agyw.fetchingDownloadId).toBe(true);
    });

    it("set AGYW status to complete, clears interval on AgywStatusUpdated", () => {
        vi.useFakeTimers();
        const clearInterval = vi.spyOn(window, "clearInterval");
        const state = mockDownloadResultsState({
            agyw: {
                preparing: true,
                complete: false,
                error: mockError(),
                statusPollId: 123,
                downloadId: "111",
                downloadError: mockError("test"),
                fetchingDownloadId: false,
                metadataError: null
            }
        });
        mutations[DownloadResultsMutation.AgywStatusUpdated](state, {payload: CompleteStatusResponse});
        expect(state.agyw.complete).toBe(true);
        expect(state.agyw.preparing).toBe(false);
        expect(state.agyw.error).toBe(null);
        expect(state.agyw.error).toBe(null);
        expect(state.agyw.metadataError).toBe(null);
        expect(state.agyw.statusPollId).toBe(-1);
        expect(state.agyw.downloadId).toBe("111");
        expect(clearInterval.mock.calls[0][0]).toBe(123);
    });

    it("resets download ids", () => {
        vi.useFakeTimers();
        const clearInterval = vi.spyOn(window, "clearInterval");

        const state = mockDownloadResultsState({
            spectrum: mockDownloadResultsDependency({downloadId: "1", statusPollId: 1}),
            summary: mockDownloadResultsDependency({downloadId: "2", statusPollId: 2}),
            coarseOutput: mockDownloadResultsDependency({downloadId: "3", statusPollId: 3}),
            comparison: mockDownloadResultsDependency({downloadId: "4", statusPollId: 4}),
            agyw: mockDownloadResultsDependency({downloadId: "5", statusPollId: 5}),
        })
        mutations[DownloadResultsMutation.ResetIds](state);
        expect(state.spectrum.downloadId).toBe("");
        expect(state.summary.downloadId).toBe("");
        expect(state.coarseOutput.downloadId).toBe("");
        expect(state.comparison.downloadId).toBe("");
        expect(state.agyw.downloadId).toBe("");

        expect(state.spectrum.statusPollId).toBe(-1);
        expect(state.summary.statusPollId).toBe(-1);
        expect(state.coarseOutput.statusPollId).toBe(-1);
        expect(state.comparison.statusPollId).toBe(-1);
        expect(state.agyw.statusPollId).toBe(-1);

        expect(clearInterval.mock.calls[0][0]).toBe(1);
        expect(clearInterval.mock.calls[1][0]).toBe(2);
        expect(clearInterval.mock.calls[2][0]).toBe(3);
        expect(clearInterval.mock.calls[3][0]).toBe(4);
        expect(clearInterval.mock.calls[4][0]).toBe(5);
    })

});
