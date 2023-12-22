const mocks = vi.hoisted(() => {
    return {
        deleteState: vi.fn(),
        getState: vi.fn(),
        saveState: vi.fn()
    }
});
vi.mock("../app/localStorageManager", () => {
    return {
        default: {},
        localStorageManager: {
            ...mocks
        }
    }
});
import {storeOptions} from "../app/root";
import Vuex from "vuex";

describe("Root", () => {
    afterEach(() => {
        vi.clearAllMocks();
    });

    it("deletes state from explore app, and loads state for main app, from local storage on load", async () => {
        const mockConsoleLog = vi.fn();
        console.log = mockConsoleLog;

        expect(mocks.deleteState).toHaveBeenCalledWith(true);
        expect(mocks.getState).toHaveBeenCalledWith(false);

        // Also check persistState plugin is functioning
        expect(mocks.saveState).toHaveBeenCalledTimes(0);
        const store = new Vuex.Store(storeOptions);
        store.commit({type: "baseline/Ready", payload: null});
        expect(mockConsoleLog.mock.calls[0][0]).toBe("baseline/Ready");
        expect(mocks.saveState.mock.calls[0][0]).toStrictEqual(storeOptions.state);
    });
});
