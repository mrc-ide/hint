import {actions} from "../../app/store/dataExploration/actions";
import {ErrorReportManualDetails} from "../../app/types";
import {initialDataExplorationState} from "../../app/store/dataExploration/dataExploration";

describe(`dataExploration actions`, () => {

    it("can post error report", async () => {
        const commit = vi.fn();

        const state = {
            ...initialDataExplorationState(),
            baseline: {
                country: "Malawi"
            }
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

        await actions.generateErrorReport({commit, rootState: state, getters} as any, payload);
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
    });
})