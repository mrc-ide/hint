import {localStorageManager} from "../app/localStorageManager";
import Vuex from "vuex";

describe("Root", () => {
    afterEach(() => {
        vi.clearAllMocks();
    });

    it("deletes state from explore app, and loads state for main app, from local storage on load", async () => {
        const mockDeleteState = vi.spyOn(localStorageManager, "deleteState");
        const mockGetState = vi.spyOn(localStorageManager, "getState");
        const mockSaveState = vi.spyOn(localStorageManager, "saveState");

        const mockConsoleLog = vi.fn();
        console.log = mockConsoleLog;

        const module = await import("../app/root");
        expect(mockDeleteState).toHaveBeenCalledWith(true);
        expect(mockGetState).toHaveBeenCalledWith(false);

        // Also check persistState plugin is functioning
        expect(mockSaveState).toHaveBeenCalledTimes(0);
        const store = new Vuex.Store(module.storeOptions);
        store.commit({type: "baseline/Ready", payload: null});
        expect(mockConsoleLog.mock.calls[0][0]).toBe("baseline/Ready");
        expect(mockSaveState.mock.calls[0][0]).toStrictEqual(module.storeOptions.state);
    });
});
