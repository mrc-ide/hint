import {actions} from "../../app/store/load/actions";
import {login, rootState} from "./integrationTest";
import {actions as baselineActions} from "../../app/store/baseline/actions";
import {ShapeResponse} from "../../app/generated";
import {getFormData} from "./helpers";

describe("load actions", () => {

    let shape: any = {};
    const realLocation = window.location;

    beforeAll(async () => {
        await login();
        const commit = jest.fn();
        const formData = getFormData("../testdata/malawi.geojson");

        await baselineActions.uploadShape({commit, dispatch: jest.fn(), rootState} as any, formData);
        shape = (commit.mock.calls[1][0]["payload"] as ShapeResponse);

        const mockLocationReload = jest.fn();
        delete (window as any).location;
        window.location = {reload: mockLocationReload} as any;
    });

    afterAll(() => {
        window.location = realLocation;
    });

    it("can submit model output ZIP file", async () => {
        const commit = jest.fn();
        const dispatch = jest.fn()
        const formData = getFormData("output.zip");
        const state = {rehydrateId: "1"}

        await actions.preparingRehydrate({commit, dispatch, state, rootState} as any, formData);

        expect(commit.mock.calls[0][0].type).toBe("StartPreparingRehydrate");
        expect(commit.mock.calls[1][0].type).toBe("PreparingRehydrate");
        expect(commit.mock.calls[1][0].payload).not.toBeNull();
    });

    it("can poll model output ZIP status", (done) => {
        const commit = jest.fn();
        const dispatch = jest.fn()
        const state = {rehydrateId: "1"}

        actions.pollRehydrate({commit, dispatch, state, rootState} as any);

        setTimeout(() => {
            expect(commit.mock.calls.length).toBe(2)
            expect(commit.mock.calls[0][0].type).toBe("RehydratePollingStarted");
            expect(commit.mock.calls[0][0].payload).toBeGreaterThan(-1);
            expect(commit.mock.calls[1][0].type).toBe("RehydrateStatusUpdated");
            expect(commit.mock.calls[1][0]["payload"].status).toBe("MISSING");
            done();
        }, 3100)
    });
});
