import {localStorageManager} from "../../app/localStorageManager";
import Vuex from "vuex";

describe("DataExploration", () => {
    afterEach(() => {
        vi.clearAllMocks();
    });

    it("deletes state from main app, and loads state for explore, from local storage on load", async () => {
        const  mockDeleteState = vi.fn();
        localStorageManager.deleteState = mockDeleteState;
        const mockGetState = vi.fn();
        localStorageManager.getState = mockGetState;
        const mockSaveState = vi.fn();
        localStorageManager.saveState = mockSaveState;

        const mockConsoleLog = vi.fn();
        console.log = mockConsoleLog;

        const module = await import("../../app/store/dataExploration/dataExploration");
        expect(mockDeleteState.mock.calls[0][0]).toBe(false);
        expect(mockGetState.mock.calls[0][0]).toBe(true);

        // Also check persistState plugin is functioning
        expect(mockSaveState.mock.calls.length).toBe(0);
        const store = new Vuex.Store(module.storeOptions);
        store.commit({type: "baseline/Ready", payload: null});
        expect(mockConsoleLog.mock.calls[0][0]).toBe("baseline/Ready");
        expect(mockSaveState.mock.calls[0][0]).toStrictEqual(module.storeOptions.state);
    });
});
