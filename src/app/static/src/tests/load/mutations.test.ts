import {mutations} from "../../app/store/load/mutations";
import {LoadingState} from "../../app/store/load/state";
import {mockError, mockLoadState} from "../mocks";

describe("Load mutations", () => {
    it("SettingFiles updates loading state correctly", () => {
        const testState = mockLoadState();
        mutations.SettingFiles(testState, null);
        expect(testState.loadingState).toBe(LoadingState.SettingFiles);
    });

    it("UpdatingState updates loading state correctly", () => {
        const testState = mockLoadState();
        mutations.UpdatingState(testState, null);
        expect(testState.loadingState).toBe(LoadingState.UpdatingState);
        expect(testState.loadError).toBe(null);
    });

    it("LoadStateCleared updates loading state correctly and clears error", () => {
        const testState = mockLoadState();
        mutations.LoadStateCleared(testState, null);
        expect(testState.loadingState).toBe(LoadingState.NotLoading);
        expect(testState.loadError).toBe(null);
    });

    it("LoadFailed updates loading state correctly and sets error", () => {
        const testState = mockLoadState();
        const error = mockError("TEST ERROR");
        mutations.LoadFailed(testState, {type: "LoadFailed", payload: error});
        expect(testState.loadingState).toBe(LoadingState.LoadFailed);
        expect(testState.loadError).toBe(error);
        expect(testState.rehydrateResult).toEqual({})
    });

    it("set RehydrateResult state", () => {
        const payload = {rehydrateResult: "TEST"} as any
        const testState = mockLoadState();
        mutations.RehydrateResult(testState, {type: "RehydrateResult", payload: payload});
        expect(testState.rehydrateResult).toEqual({"rehydrateResult": "TEST"});
    });

    it("set PreparingRehydrate state", () => {
        const payload = {id: "1"} as any
        const testState = mockLoadState();
        mutations.PreparingRehydrate(testState, {type: "prepareRehydrate", payload: payload});
        expect(testState.rehydrateId).toEqual( "1");
    });

    it("set ModelOutputStatusUpdated state", () => {
        const payload = {done: true} as any
        const testState = mockLoadState({statusPollId: 4});
        mutations.RehydrateStatusUpdated(testState, {type: "ModelOutputStatusUpdated", payload: payload});
        expect(testState.loadError).toEqual(null);
        expect(testState.statusPollId).toEqual(-1);
    });

    it("set PollingStatusStarted state", () => {
        const testState = mockLoadState();
        mutations.RehydratePollingStarted(testState, {type: "ModelOutputStatusUpdated", payload: 20});
        expect(testState.loadError).toEqual(null);
        expect(testState.statusPollId).toEqual(20);
    });

    it("set RehydrateResultError state", () => {
        const error = mockError("TEST ERROR");
        const testState = mockLoadState({statusPollId: 10});
        mutations.RehydrateResultError(testState, {type: "RehydrateResultError", payload: error});
        expect(testState.loadError).toBe(error);
        expect(testState.statusPollId).toEqual(-1);
    });

    it("set new Project name state", () => {
        const testState = mockLoadState();
        mutations.SetNewProjectName(testState,  "project name");
        expect(testState.newProjectName).toBe("project name");
    });

    it("set RehydrateCancel state", () => {
        const testState = mockLoadState({
            statusPollId: 10,
            preparing: true,
            loadingState: LoadingState.SettingFiles
        });
        mutations.RehydrateCancel(testState, {type: "RehydrateCancel"});
        expect(testState.preparing).toEqual(false);
        expect(testState.loadingState).toEqual(LoadingState.NotLoading);
        expect(testState.statusPollId).toEqual(-1);
    });

    it("StartPreparingRehydrate sets preparing state", () => {
        const testState = mockLoadState();
        mutations.StartPreparingRehydrate(testState, null);
        expect(testState.loadingState).toBe(LoadingState.SettingFiles);
        expect(testState.preparing).toBe(true);
    });

});
