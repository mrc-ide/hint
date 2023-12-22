import {actions} from "../../app/store/load/actions";
import {actions as projectActions} from "../../app/store/projects/actions";
import {mutations as projectMutations} from "../../app/store/projects/mutations";
import {mutations as modelCalibrateMutations} from "../../app/store/modelCalibrate/mutations";
import {mutations as modelRunMutations} from "../../app/store/modelRun/mutations";
import {mutations as rootMutations} from "../../app/store/root/mutations";
import {mutations as downloadResultsMutations} from "../../app/store/downloadResults/mutations";
import {initialDownloadResultsState} from "../../app/store/downloadResults/downloadResults";
import {addCheckSum} from "../../app/utils";
import {login, rootState} from "./integrationTest";
import {actions as baselineActions} from "../../app/store/baseline/actions";
import {ShapeResponse} from "../../app/generated";
import Vuex from "vuex";
import {emptyState} from "../../app/root";
import {localStorageManager} from "../../app/localStorageManager";
import {currentHintVersion} from "../../app/hintVersion";
import {getFormData} from "./helpers";
import { flushPromises } from "@vue/test-utils";

describe("load actions", () => {

    let shape: any = {};
    const realLocation = window.location;

    beforeAll(async () => {
        vi.useFakeTimers();
        await login();
        const commit = vi.fn();
        const formData = getFormData("../testdata/malawi.geojson");

        await baselineActions.uploadShape({commit, dispatch: vi.fn(), rootState} as any, formData);
        shape = (commit.mock.calls[1][0]["payload"] as ShapeResponse);

        const mockLocationReload = vi.fn();
        delete (window as any).location;
        window.location = {reload: mockLocationReload} as any;
    });

    afterAll(() => {
        window.location = realLocation;
        vi.useRealTimers();
    });

    it("can set files as guest user", async () => {
        const commit = vi.fn();
        const dispatch = vi.fn();
        const fakeState = JSON.stringify({
            files: {"shape": shape},
            state: {
                version: currentHintVersion,
                stepper: {}
            }
        });
        const fakeFileContents = addCheckSum(fakeState);
        const rootGetters = {isGuest: true};
        await actions.setFiles({commit, dispatch, state: {}, rootState, rootGetters} as any,
            {savedFileContents: fakeFileContents});
        
        expect(commit.mock.calls[0][0].type).toBe("SettingFiles");
        expect(commit.mock.calls[1][0].type).toBe("UpdatingState");
        expect(commit.mock.calls[1][0].payload).toEqual({
            shape: {
                hash: shape.hash,
                filename: shape.filename,
                fromAdr: false,
                resource_url: null
            }
        });
        expect(dispatch.mock.calls[0][1]).toStrictEqual({
            stepper: {
                steps: [
                    {
                        "number": 1,
                        "textKey": "uploadInputs"
                    },
                    {
                        "number": 2,
                        "textKey": "reviewInputs"
                    },
                    {
                        "number": 3,
                        "textKey": "modelOptions"
                    },
                    {
                        "number": 4,
                        "textKey": "fitModel"
                    },
                    {
                        "number": 5,
                        "textKey": "calibrateModel"
                    },
                    {
                        "number": 6,
                        "textKey": "reviewOutput"
                    },
                    {
                        "number": 7,
                        "textKey": "downloadResults"
                    }
                ]
            },
            "version": currentHintVersion
        });
    });

    it("can create project and set files as logged in user when uploading JSON file", async () => {
        const commit = vi.fn();
        const fakeState = JSON.stringify({
            files: {"shape": shape},
            state: {
                version: currentHintVersion,
                projects: {},
                baseline: "TEST BASELINE",
                stepper: {}
            }
        });
        const fakeFileContents = addCheckSum(fakeState);
        const rootGetters = {isGuest: false};

        const store = new Vuex.Store({
            state: emptyState(),
            mutations: rootMutations,
            modules: {
                projects: {
                    namespaced: true,
                    actions: projectActions,
                    mutations: projectMutations
                },
                load: {
                    namespaced: true,
                    actions
                },
                downloadResults: {
                    namespaced: true,
                    state: initialDownloadResultsState(),
                    mutations: downloadResultsMutations
                },
                modelCalibrate: {
                    namespaced: true,
                    mutations: modelCalibrateMutations
                },
                modelRun: {
                    namespaced: true,
                    mutations: modelRunMutations
                }
            }
        });

        const mockSaveToLocalStorage = vi.fn();
        localStorageManager.savePartialState = mockSaveToLocalStorage;

        const dispatch = ((store as any)._modulesNamespaceMap["load/"] as any).context.dispatch;

        await actions.setFiles({commit, dispatch, state: {}, rootState: store.state, rootGetters} as any,
            {savedFileContents: fakeFileContents});

        //we expect the non-mocked dispatch to have created a project, and to have invoked the local store manager to
        //save state
        expect(commit.mock.calls[0][0].type).toBe("SettingFiles");
        expect(commit.mock.calls[1][0].type).toBe("UpdatingState");
        expect(commit.mock.calls[1][0].payload)
            .toEqual({
                shape:
                    {
                        hash: shape.hash,
                        filename: shape.filename,
                        fromAdr: false,
                        resource_url: null
                    }
            });
        expect(mockSaveToLocalStorage.mock.calls[0][0].baseline).toBe("TEST BASELINE");
    });

    it("can submit model output ZIP file", async () => {
        const commit = vi.fn();
        const dispatch = vi.fn()
        const formData = getFormData("output.zip");
        const state = {rehydrateId: "1"}

        await actions.preparingRehydrate({commit, dispatch, state, rootState} as any, formData);

        expect(commit.mock.calls[0][0].type).toBe("StartPreparingRehydrate");
        expect(commit.mock.calls[1][0].type).toBe("PreparingRehydrate");
        expect(commit.mock.calls[1][0].payload).not.toBeNull();
    });

    it("can poll model output ZIP status", async () => {
        const commit = vi.fn();
        const dispatch = vi.fn()
        const state = {rehydrateId: "1"}

        actions.pollRehydrate({commit, dispatch, state, rootState} as any);

        vi.advanceTimersByTime(3000);
        await flushPromises();

        expect(commit.mock.calls.length).toBe(2)
        expect(commit.mock.calls[0][0].type).toBe("RehydratePollingStarted");
        expect(+commit.mock.calls[0][0].payload).toBeGreaterThan(-1);
        expect(commit.mock.calls[1][0].type).toBe("RehydrateStatusUpdated");
        expect(commit.mock.calls[1][0]["payload"].status).toBe("MISSING");
    });
});
