import {actions} from "../../app/store/downloadResults/actions";
import {rootState} from "./integrationTest";
import {DOWNLOAD_TYPE} from "../../app/types";
import {formatToLocalISODateTime} from "../../app/utils";

describe(`download results actions integration`, () => {

    it.skip(`can download comparison output report`, async () => {
        const commit = vi.fn();
        const dispatch = vi.fn();
        const root = {
            ...rootState,
            modelCalibrate: {calibrateId: "calibrate123"}
        };

        const state = {comparison: {downloadId: 123, error: null, complete: true}}

        await actions.downloadComparisonReport({commit, dispatch, state, rootState: root} as any);

        expect(commit.mock.calls.length).toBe(1);
        expect(commit.mock.calls[0][0]["type"]).toBe("ComparisonError");
        expect(commit.mock.calls[0][0]["payload"].detail).toEqual("Missing some results")
        expect(commit.mock.calls[0][0]["payload"].error).toEqual("FAILED_TO_RETRIEVE_RESULT")
    })

    it(`can prepare summary report for download`, async () => {
        const commit = vi.fn();
        const dispatch = vi.fn();
        const root = {
            ...rootState,
            modelCalibrate: {calibrateId: "calibrate123"}
        };

        await actions.prepareSummaryReport({commit, dispatch, state: {summary: {}}, rootState: root} as any);

        // passing an invalid calibrateId so this will return an error
        // but the expected error message confirms
        // that we're hitting the correct endpoint
        expect(commit.mock.calls.length).toBe(2);
        expect(commit.mock.calls[0][0]["type"]).toBe("SetFetchingDownloadId");
        expect(commit.mock.calls[0][0]["payload"]).toBe(DOWNLOAD_TYPE.SUMMARY);
        expect(commit.mock.calls[1][0]["type"]).toBe("SummaryError");
        expect(commit.mock.calls[1][0]["payload"].detail).toBe("Failed to fetch result");
    })

    it(`can poll summary report for status update`, (done) => {
        const commit = vi.fn();
        const dispatch = vi.fn();
        const root = {
            ...rootState,
            modelCalibrate: {calibrateId: "calibrate123"}
        };

        const state = {summary: {downloadId: 123}}

        actions.poll({commit, dispatch, state, rootState: root} as any, DOWNLOAD_TYPE.SUMMARY);

        setTimeout(() => {
            expect(commit.mock.calls.length).toBe(2);
            expect(commit.mock.calls[0][0]["type"]).toBe("PollingStatusStarted");
            expect(commit.mock.calls[0][0]["payload"].downloadType).toBe(DOWNLOAD_TYPE.SUMMARY);
            expect(commit.mock.calls[0][0]["payload"].pollId).toBeGreaterThan(-1);

            expect(commit.mock.calls[1][0]["type"]).toBe("SummaryReportStatusUpdated");
            expect(commit.mock.calls[1][0]["payload"].status).toBe("MISSING");
            done()

        }, 3100)
    })

    it(`can prepare spectrum output for download`, async () => {
        const commit = vi.fn();
        const dispatch = vi.fn();
        const root = {
            ...rootState,
            modelCalibrate: {calibrateId: "calibrate123"}
        };

        const getter = {
            projectState: {
                state: {
                    datasets: {
                        anc: {"filename": "anc", "path": "uploads/ancHash"},
                        pjnz: {"filename": "pjnz", "path": "uploads/pjnzHash"},
                        population: {"filename": "population", "path": "uploads/populationHash"},
                        programme: {"filename": "program", "path": "uploads/programHash"},
                        shape: {"filename": "shape", "path": "uploads/shapeHash"},
                        survey: {"filename": "survey", "path": "uploads/surveyHash"}
                    },
                    model_fit: {"id": "", "options": {}},
                    calibrate: {"id": "", "options": {}},
                    version: {"hintr": "1.0.0", "naomi": "2.0.0", "rrq": "1.1.1"},
                },
                notes: {
                    project_notes: {
                        name: "My project 123",
                        updated: formatToLocalISODateTime("2022-06-09T13:56:19.280Z"),
                        note: "These are my project notes"
                    },
                    version_notes: [
                        {
                            name: "My project 123",
                            updated: formatToLocalISODateTime("2022-06-09T13:56:19.280Z"),
                            note: "Notes specific to this version"
                        },
                        {
                            name: "My project 123",
                            updated: formatToLocalISODateTime("2022-06-09T13:56:19.280Z"),
                            note: "Notes from the first version"
                        }
                    ]
                }
            }
        }

        await actions.prepareSpectrumOutput({
            commit, dispatch,
            state: {spectrum: {}},
            rootState: root,
            rootGetters: getter
        } as any);

        expect(commit.mock.calls.length).toBe(2);
        expect(commit.mock.calls[0][0]["type"]).toBe("SetFetchingDownloadId");
        expect(commit.mock.calls[0][0]["payload"]).toBe(DOWNLOAD_TYPE.SPECTRUM);
        expect(commit.mock.calls[1][0]["type"]).toBe("SpectrumError");
        expect(commit.mock.calls[1][0]["payload"].detail).toBe("Failed to fetch result");
    })

    it(`can poll spectrum output for status update`, (done) => {
        const commit = vi.fn();
        const dispatch = vi.fn();
        const root = {
            ...rootState,
            modelCalibrate: {calibrateId: "calibrate123"}
        };

        const state = {spectrum: {downloadId: 123}}

        actions.poll({commit, dispatch, state, rootState: root} as any, DOWNLOAD_TYPE.SPECTRUM);

        setTimeout(() => {
            expect(commit.mock.calls.length).toBe(2);
            expect(commit.mock.calls[0][0]["type"]).toBe("PollingStatusStarted");
            expect(commit.mock.calls[0][0]["payload"].downloadType).toBe(DOWNLOAD_TYPE.SPECTRUM);
            expect(commit.mock.calls[0][0]["payload"].pollId).toBeGreaterThan(-1);

            expect(commit.mock.calls[1][0]["type"]).toBe("SpectrumOutputStatusUpdated");
            expect(commit.mock.calls[1][0]["payload"].status).toBe("MISSING");
            done()

        }, 3100)
    })

    it(`can prepare coarse output for download`, async () => {
        const commit = vi.fn();
        const dispatch = vi.fn();
        const root = {
            ...rootState,
            modelCalibrate: {calibrateId: "calibrate123"}
        };

        await actions.prepareCoarseOutput({commit, dispatch, state: {coarseOutput: {}}, rootState: root} as any);

        expect(commit.mock.calls.length).toBe(2);
        expect(commit.mock.calls[0][0]["type"]).toBe("SetFetchingDownloadId");
        expect(commit.mock.calls[0][0]["payload"]).toBe(DOWNLOAD_TYPE.COARSE);
        expect(commit.mock.calls[1][0]["type"]).toBe("CoarseOutputError");
        expect(commit.mock.calls[1][0]["payload"].detail).toBe("Failed to fetch result");
    })

    it(`can poll coarseOutput for status update`, (done) => {
        const commit = vi.fn();
        const dispatch = vi.fn();
        const root = {
            ...rootState,
            modelCalibrate: {calibrateId: "calibrate123"}
        };

        const state = {coarseOutput: {downloadId: 123}}

        actions.poll({commit, dispatch, state, rootState: root} as any, DOWNLOAD_TYPE.COARSE);

        setTimeout(() => {
            expect(commit.mock.calls.length).toBe(2);
            expect(commit.mock.calls[0][0]["type"]).toBe("PollingStatusStarted");
            expect(commit.mock.calls[0][0]["payload"].downloadType).toBe(DOWNLOAD_TYPE.COARSE);
            expect(commit.mock.calls[0][0]["payload"].pollId).toBeGreaterThan(-1);

            expect(commit.mock.calls[1][0]["type"]).toBe("CoarseOutputStatusUpdated");
            expect(commit.mock.calls[1][0]["payload"].status).toBe("MISSING");
            done()

        }, 3100)
    })

    it(`can prepare comparison output for download`, async () => {
        const commit = vi.fn();
        const dispatch = vi.fn();
        const root = {
            ...rootState,
            modelCalibrate: {calibrateId: "calibrate123"}
        };

        await actions.prepareComparisonOutput({commit, dispatch, state: {comparison: {}}, rootState: root} as any);

        expect(commit.mock.calls.length).toBe(2);
        expect(commit.mock.calls[0][0]["type"]).toBe("SetFetchingDownloadId");
        expect(commit.mock.calls[0][0]["payload"]).toBe(DOWNLOAD_TYPE.COMPARISON);
        expect(commit.mock.calls[1][0]["type"]).toBe("ComparisonError");
        expect(commit.mock.calls[1][0]["payload"].detail).toBe("Failed to fetch result");
    })

    it(`can poll comparison output for status update`, (done) => {
        const commit = vi.fn();
        const dispatch = vi.fn();
        const root = {
            ...rootState,
            modelCalibrate: {calibrateId: "calibrate123"}
        };

        const state = {comparison: {downloadId: 123}}

        actions.poll({commit, dispatch, state, rootState: root} as any, DOWNLOAD_TYPE.COMPARISON);

        setTimeout(() => {
            expect(commit.mock.calls.length).toBe(2);
            expect(commit.mock.calls[0][0]["type"]).toBe("PollingStatusStarted");
            expect(commit.mock.calls[0][0]["payload"].downloadType).toBe(DOWNLOAD_TYPE.COMPARISON);
            expect(commit.mock.calls[0][0]["payload"].pollId).toBeGreaterThan(-1);

            expect(commit.mock.calls[1][0]["type"]).toBe("ComparisonOutputStatusUpdated");
            expect(commit.mock.calls[1][0]["payload"].status).toBe("MISSING");
            done()

        }, 3100)
    })

    it(`does not poll comparison output for status update when downloadId is empty`, (done) => {
        const commit = vi.fn();
        const dispatch = vi.fn();
        const root = {
            ...rootState,
            modelCalibrate: {calibrateId: "calibrate123"}
        };

        const state = {comparison: {downloadId: ""}}

        actions.poll({commit, dispatch, state, rootState: root} as any, DOWNLOAD_TYPE.COMPARISON);

        setTimeout(() => {
            expect(commit.mock.calls.length).toBe(2);
            expect(commit.mock.calls[0][0]["type"]).toBe("PollingStatusStarted");
            expect(commit.mock.calls[0][0]["payload"].downloadType).toBe(DOWNLOAD_TYPE.COMPARISON);
            expect(commit.mock.calls[0][0]["payload"].pollId).toBeGreaterThan(-1);

            expect(commit.mock.calls[1][0]["type"]).toBe("ComparisonError");
            expect(commit.mock.calls[1][0]["payload"].detail).toContain("Otherwise please contact support at naomi-support@imperial.ac.uk");
            done()

        }, 3100)
    })
})
