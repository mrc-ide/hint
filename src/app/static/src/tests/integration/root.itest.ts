import {actions} from "../../app/store/root/actions";
import {ErrorReportManualDetails} from "../../app/types";
import {emptyState} from "../../app/root";

describe(`root actions`, () => {

    it("can post error report", async () => {
        const commit = vi.fn();

        const dispatch = vi.fn();

        const state = {
            ...emptyState(),
            baseline: {
                country: "Malawi"
            },
            modelRun: {
                modelRunId: "1234"
            },
            modelCalibrate: {
                calibrateId: "2022"
            },
            downloadResults: {
                spectrum: {
                    downloadId: "spectrum123"
                },
                summary: {
                    downloadId: "summary123"
                },
                coarseOutput: {
                    downloadId: "coarse123"
                },
                comparison: {
                    downloadId: "comparison123"
                }
            },
            projects: {currentProject: {name: "p1", id: 1, versions: []}}
        }

        const getters = {
            errors: []
        }

        const payload: ErrorReportManualDetails = {
            email: "test@example.com",
            stepsToReproduce: "steps to reproduce",
            section: "login",
            description: "test"
        }

        await actions.generateErrorReport({commit, rootState: state, getters, dispatch} as any, payload);
        expect(commit.mock.calls.length).toBe(3)
        expect(commit.mock.calls[0][0]).toStrictEqual({payload: true, type: "errors/SendingErrorReport"})
        expect(commit.mock.calls[1][0]).toStrictEqual(
            {
                payload: {
                    description: "OK",
                    statusCode: 200
                },
                type: "errors/ErrorReportSuccess"
            });
        expect(commit.mock.calls[2][0]).toStrictEqual({payload: false, type: "errors/SendingErrorReport"})

        expect(dispatch.mock.calls.length).toBe(1)
        expect(dispatch.mock.calls[0][0]).toEqual("projects/cloneProject")
        expect(dispatch.mock.calls[0][1]).toEqual(
            {
                "emails": ["naomi-support@imperial.ac.uk"],
                "projectId": 1
            })
    });
})