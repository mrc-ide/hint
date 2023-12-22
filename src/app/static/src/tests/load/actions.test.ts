import {
    mockAxios, mockCalibrateResultResponse,
    mockError,
    mockFailure,
    mockLoadState, mockModelCalibrateState,
    mockOptionsFormMeta,
    mockRootState,
    mockSuccess
} from "../mocks";
import {actions} from "../../app/store/load/actions";
import {LoadingState} from "../../app/store/load/state";
import {addCheckSum} from "../../app/utils";
import {localStorageManager} from "../../app/localStorageManager";
import {currentHintVersion} from "../../app/hintVersion";
import {ProjectRehydrateStatusResponse} from "../../app/generated";
import {DynamicControlType} from "@reside-ic/vue-next-dynamic-form";
import {RootState} from "../../app/root";
import {router} from "../../app/router";
import { Mock } from "vitest";
import { flushPromises } from "@vue/test-utils";

const rootState = mockRootState();

describe("Load actions", () => {

    beforeEach(() => {
        mockAxios.reset();
        // stop apiService logging to console
        console.log = vi.fn();
        console.info = vi.fn();
    });

    afterEach(() => {
        (console.log as Mock).mockClear();
        (console.info as Mock).mockClear();
    });

    beforeAll(() => {
        vi.useFakeTimers();
    });
    afterAll(() => {
        vi.useRealTimers();
    });

    it("load reads blob and dispatches setFiles action", async () => {
        const dispatch = vi.fn();
        const file = new File(["Test File Contents"], "testFile")
        actions.load({dispatch, rootState} as any, file);

        vi.advanceTimersByTime(2000);
        await flushPromises();

        expect(dispatch.mock.calls[0][0]).toEqual("setFiles");
        expect(dispatch.mock.calls[0][1].savedFileContents).toEqual("Test File Contents");
    });

    it("clears loading state", async () => {
        const commit = vi.fn();
        await actions.clearLoadState({commit, rootState} as any);
        expect(commit.mock.calls[0][0]).toStrictEqual({type: "LoadStateCleared", payload: null});
    });

    it("loadVersion sets files and updates store state", async () => {
        mockAxios.onPost(`/session/files/`)
            .reply(200, mockSuccess({}));
        const commit = vi.fn();
        const dispatch = vi.fn();
        const state = mockLoadState({loadingState: LoadingState.UpdatingState});

        const routerSpy = vi.spyOn(router, "push");

        actions.loadFromVersion({commit, dispatch, state, rootState} as any, {
            files: "files",
            state: JSON.stringify({stepper: {}})
        });
        await flushPromises();
        expect(commit.mock.calls[0][0]).toStrictEqual({type: "SettingFiles", payload: null});
        expect(commit.mock.calls[1][0]).toStrictEqual({type: "UpdatingState", payload: {}});

        expect(mockAxios.history.post[0].url).toBe("/session/files/");
        expect(mockAxios.history.post[0].data).toBe("files");

        expect(dispatch.mock.calls[0][0]).toBe("updateStoreState");
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
            }
        });

        expect(routerSpy).not.toHaveBeenCalled();
    });

    it("loadVersion pushes home route if not already there", async () => {
        mockAxios.onPost(`/session/files/`)
            .reply(200, mockSuccess({}));
        const commit = vi.fn();
        const dispatch = vi.fn();
        const state = mockLoadState({loadingState: LoadingState.UpdatingState});

        const routerSpy = vi.spyOn(router, "push");
        await router.push("/projects");

        actions.loadFromVersion({commit, dispatch, state, rootState} as any, {
            files: "files",
            state: JSON.stringify({stepper: {}})
        });

        expect(routerSpy).toHaveBeenCalledTimes(2);
        expect(routerSpy.mock.calls[1][0]).toBe("/");
    });

    it("updates store state after successful setFiles post", async () => {

        mockAxios.onPost(`/session/files/`)
            .reply(200, mockSuccess({}));

        const commit = vi.fn();
        const state = mockLoadState({loadingState: LoadingState.UpdatingState});
        const dispatch = vi.fn();
        const rootGetters = {isGuest: true};
        const fileContents = addCheckSum(JSON.stringify({files: "TEST FILES", state: {"version": currentHintVersion, stepper: {}}}));
        await actions.setFiles({commit, state, dispatch, rootState, rootGetters} as any,
            {savedFileContents: fileContents}
        );

        expect(commit.mock.calls[0][0]).toStrictEqual({type: "SettingFiles", payload: null});
        expect(commit.mock.calls[1][0]).toStrictEqual({type: "UpdatingState", payload: {}});

        //should also hand on to updateState action
        expect(dispatch.mock.calls[0][0]).toEqual("updateStoreState");
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

    it("if not guest, creates project and updates saved State before setting files", async () => {
        mockAxios.onPost(`/session/files/`)
            .reply(200, mockSuccess({}));

        const commit = vi.fn();
        const state = mockLoadState({loadingState: LoadingState.UpdatingState, projectName: "new project"});
        const dispatch = vi.fn();
        const testRootState = {
            version: currentHintVersion,
            projects: {
                currentProject: "TEST PROJECT",
                currentVersion: "TEST VERSION"
            }
        };
        const rootGetters = {isGuest: false};
        const fileContents = addCheckSum(JSON.stringify({
            files: "TEST FILES",
            state: {version: currentHintVersion, projects: {}, stepper: {}}
        }));

        await actions.setFiles({commit, state, dispatch, rootState: testRootState, rootGetters} as any,
            {savedFileContents: fileContents}
        );

        expect(dispatch.mock.calls[0][0]).toEqual("projects/createProject");
        expect(dispatch.mock.calls[0][1]).toEqual({name: "new project"});
        expect(dispatch.mock.calls[0][2]).toStrictEqual({root: true});

        expect(commit.mock.calls[0][0]).toStrictEqual({type: "SettingFiles", payload: null});
        expect(commit.mock.calls[1][0]).toStrictEqual({type: "UpdatingState", payload: {}});

        //should also hand on to updateState action, with updated project state
        expect(dispatch.mock.calls[1][0]).toEqual("updateStoreState");
        expect(dispatch.mock.calls[1][1]).toStrictEqual(
            {
                version: currentHintVersion,
                projects: {
                    currentProject: "TEST PROJECT",
                    currentVersion: "TEST VERSION",
                    previousProjects: []
                },
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
                }
            });
    });

    it("calls loadFailed mutation with invalid checksum", async () => {

        mockAxios.onPost(`/session/files/`)
            .reply(400, mockFailure("Test error"));

        const commit = vi.fn();
        const state = mockLoadState({loadingState: LoadingState.NotLoading});
        const dispatch = vi.fn();
        const fileContents = '["badchecksum", {"files": "TEST FILES", "state": "TEST STATE"}]';
        await actions.setFiles({commit, state, dispatch, rootState} as any,
            {savedFileContents: fileContents}
        );

        expect(commit.mock.calls[0][0]).toStrictEqual({type: "SettingFiles", payload: null});
        expect(commit.mock.calls[1][0]).toStrictEqual({
            type: "LoadFailed",
            payload: {detail: "The file contents are corrupted."}
        });

        //should not hand on to updateState action
        expect(dispatch.mock.calls.length).toEqual(0);
    });

    it("calls loadFailed mutation after unsuccessful setFiles post", async () => {

        mockAxios.onPost(`/session/files/`)
            .reply(400, mockFailure("Test error"));

        const commit = vi.fn();
        const state = mockLoadState({loadingState: LoadingState.LoadFailed});
        const dispatch = vi.fn();
        const rootGetters = {isGuest: true};
        const fileContents = addCheckSum(JSON.stringify({files: "TEST FILES", state: {version: currentHintVersion, stepper: {}}}));
        await actions.setFiles({commit, state, dispatch, rootState, rootGetters} as any,
            {savedFileContents: fileContents}
        );

        expect(commit.mock.calls[0][0]).toStrictEqual({type: "SettingFiles", payload: null});
        expect(commit.mock.calls[1][0]).toStrictEqual({type: "LoadFailed", payload: mockError("Test error")});

        //should not hand on to updateState action
        expect(dispatch.mock.calls.length).toEqual(0);
    });

    it("calls loadFailed mutation when loaded state's version is not current", async () => {
        mockAxios.onPost(`/session/files/`)
            .reply(200, mockSuccess({}));

        const commit = vi.fn();
        const state = mockLoadState({loadingState: LoadingState.UpdatingState});
        const dispatch = vi.fn();
        const rootGetters = {isGuest: true};
        const fileContents = addCheckSum(JSON.stringify({files: "TEST FILES", state: {"version": "0.0.0"}}));
        await actions.setFiles({commit, state, dispatch, rootState, rootGetters} as any,
            {savedFileContents: fileContents}
        );

        expect(commit.mock.calls[0][0]).toStrictEqual({type: "SettingFiles", payload: null});
        expect(commit.mock.calls[1][0].type).toStrictEqual("LoadFailed");
        expect(commit.mock.calls[1][0].payload).toStrictEqual({detail: "Unable to load file created by older version of the application."});

        //should not hand on to updateState action
        expect(dispatch.mock.calls.length).toEqual(0);
    });

    it("calls loadFailed mutation when loaded state does not contain a version", async () => {
        mockAxios.onPost(`/session/files/`)
            .reply(200, mockSuccess({}));

        const commit = vi.fn();
        const state = mockLoadState({loadingState: LoadingState.UpdatingState});
        const dispatch = vi.fn();
        const rootGetters = {isGuest: true};
        const fileContents = addCheckSum(JSON.stringify({files: "TEST FILES", state: {}}));
        await actions.setFiles({commit, state, dispatch, rootState, rootGetters} as any,
            {savedFileContents: fileContents}
        );

        expect(commit.mock.calls[0][0]).toStrictEqual({type: "SettingFiles", payload: null});
        expect(commit.mock.calls[1][0].type).toStrictEqual("LoadFailed");
        expect(commit.mock.calls[1][0].payload).toStrictEqual({detail: "Unable to load file created by older version of the application."});

        //should not hand on to updateState action
        expect(dispatch.mock.calls.length).toEqual(0);
    });

    it("can load file when state differs by minor version", async () => {

        mockAxios.onPost(`/session/files/`)
            .reply(200, mockSuccess({}));

        const commit = vi.fn();
        const state = mockLoadState({loadingState: LoadingState.UpdatingState});
        const dispatch = vi.fn();
        const rootGetters = {isGuest: true};
        const fileContents = addCheckSum(JSON.stringify({
            files: "TEST FILES",
            state: {"version": "3.0.0", stepper: {}}
        }));
        await actions.setFiles({commit, state, dispatch, rootState, rootGetters} as any,
            {savedFileContents: fileContents}
        );

        expect(commit.mock.calls[0][0]).toStrictEqual({type: "SettingFiles", payload: null});
        expect(commit.mock.calls[1][0]).toStrictEqual({type: "UpdatingState", payload: {}});
        expect(dispatch.mock.calls[0][0]).toEqual("updateStoreState");
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
            "version": "3.0.0"
        });
    });


    it("updateStoreState saves file state to local storage and reloads page", async () => {
        const mockSaveToLocalStorage = vi.fn();
        localStorageManager.savePartialState = mockSaveToLocalStorage;

        const mockLocationReload = vi.fn();
        delete (window as any).location
        delete (window as any).location
        window.location = {reload: mockLocationReload} as any;

        const testState = mockRootState();
        await actions.updateStoreState({rootState} as any, testState);

        expect(mockSaveToLocalStorage.mock.calls[0][0]).toStrictEqual(testState);
        expect(mockLocationReload.mock.calls.length).toBe(1);
    });

    it("extracts calibrate options from dynamicFormMeta and saves and loads file state", async () => {
        const mockSaveToLocalStorage = vi.fn();
        localStorageManager.savePartialState = mockSaveToLocalStorage;

        const mockLocationReload = vi.fn();
        delete (window as any).location
        window.location = {reload: mockLocationReload} as any;

        const testState = mockRootState({
            modelCalibrate: mockModelCalibrateState({
                result: mockCalibrateResultResponse(),
                optionsFormMeta: mockOptionsFormMeta({
                    controlSections: [{
                        label: "Test Section",
                        description: "Just a test section",
                        controlGroups: [{
                            controls: [
                                {
                                    name: "TestValue",
                                    type: "number" as DynamicControlType,
                                    required: false,
                                    min: 0,
                                    max: 10,
                                    value: 5
                                },
                                {
                                    name: "TestValue2",
                                    type: "number" as DynamicControlType,
                                    required: false,
                                    min: 0,
                                    max: 10,
                                    value: 6
                                }
                            ]
                        }]
                    }]
                })
            })
        });

        await actions.updateStoreState({rootState} as any, testState);

        const root = mockSaveToLocalStorage.mock.calls[0][0] as RootState
        expect(root.modelCalibrate.options).toStrictEqual({"TestValue": 5, "TestValue2": 6});
        expect(mockLocationReload.mock.calls.length).toBe(1);
    });

    it("does not extracts calibrate options from dynamicFormMeta if model has not been calibrated", async () => {
        const mockSaveToLocalStorage = vi.fn();
        localStorageManager.savePartialState = mockSaveToLocalStorage;

        const mockLocationReload = vi.fn();
        delete (window as any).location
        window.location = {reload: mockLocationReload} as any;

        const testState = mockRootState({
            modelCalibrate: mockModelCalibrateState({
                optionsFormMeta: mockOptionsFormMeta({
                    controlSections: [{
                        label: "Test Section",
                        description: "Just a test section",
                        controlGroups: [{
                            controls: [
                                {
                                    name: "TestValue",
                                    type: "number" as DynamicControlType,
                                    required: false,
                                    min: 0,
                                    max: 10,
                                    value: 5
                                },
                                {
                                    name: "TestValue2",
                                    type: "number" as DynamicControlType,
                                    required: false,
                                    min: 0,
                                    max: 10,
                                    value: 6
                                }
                            ]
                        }]
                    }]
                })
            })
        });

        await actions.updateStoreState({rootState} as any, testState);

        const root = mockSaveToLocalStorage.mock.calls[0][0] as RootState
        expect(root.modelCalibrate.options).toStrictEqual({});
        expect(mockLocationReload.mock.calls.length).toBe(1);
    });

    it("calibrate options returns empty object if no options to extract from dynamic form meta", async () => {
        const mockSaveToLocalStorage = vi.fn();
        localStorageManager.savePartialState = mockSaveToLocalStorage;

        const mockLocationReload = vi.fn();
        delete (window as any).location
        window.location = {reload: mockLocationReload} as any;

        const testState = mockRootState({
            modelCalibrate: mockModelCalibrateState({
                optionsFormMeta: mockOptionsFormMeta({
                    controlSections: []
                })
            })
        });

        await actions.updateStoreState({rootState} as any, testState);

        const root = mockSaveToLocalStorage.mock.calls[0][0] as RootState
        expect(root.modelCalibrate.options).toStrictEqual({});
        expect(mockLocationReload.mock.calls.length).toBe(1);
    });

    it("can prepare rehydrate and dispatches poll action", async () => {
        mockAxios.onPost("rehydrate/submit")
            .reply(200, mockSuccess(true));

        const file = new File(["TEST"], "testFile.zip")
        const fomData = new FormData()
        fomData.append("file", file)

        const dispatch = vi.fn();
        const commit = vi.fn();
        actions.preparingRehydrate({dispatch, commit, rootState} as any, fomData);
        await flushPromises();
        expect(mockAxios.history.post.length).toBe(1)
        expect(mockAxios.history.post[0]["url"]).toBe("rehydrate/submit")
        expect(commit.mock.calls.length).toBe(2)
        expect(commit.mock.calls[0][0].type).toBe("StartPreparingRehydrate")
        expect(commit.mock.calls[1][0].type).toBe("PreparingRehydrate")
        expect(commit.mock.calls[1][0].payload).toBeTruthy()
        expect(dispatch.mock.calls.length).toBe(1)
        expect(dispatch.mock.calls[0][0]).toEqual("pollRehydrate");
    });

    const rehydrateResultResponse = {
        state: {
            datasets: {
                pjnz: {
                    path: "uploads/test.csv",
                    filename: "test"
                },
                population: {
                    path: "uploads/test.csv",
                    filename: "test"
                },
                shape: {
                    path: "uploads/test.csv",
                    filename: "test"
                },
                anc: {
                    path: "uploads/test.csv",
                    filename: "test"
                },
                survey: {
                    path: "uploads/test.csv",
                    filename: "test"
                },
                programme: {
                    path: "uploads/test.csv",
                    filename: "test"
                }
            },
            calibrate: {
                id: "123",
                options: {}
            },
            model_fit: {
                id: "100",
                options: {}
            },
            version: {hintr: "1", naomi: "2", rrq: "3"}
        }
    }

    const RunningStatusResponse: ProjectRehydrateStatusResponse = {
        id: "db0c4957aea4b32c507ac02d63930110",
        done: true,
        progress: ["Generating summary report"],
        status: "COMPLETE",
        success: true,
        queue: 0
    }

    it("can pollRehydrate status and dispatches PollingStatusStarted action", async () => {
        mockAxios.onGet(`rehydrate/status/1`)
            .reply(200, mockSuccess(RunningStatusResponse));

        mockAxios.onGet(`rehydrate/result/1`)
            .reply(200, mockSuccess(rehydrateResultResponse));

        mockAxios.onPost(`session/files/`)
            .reply(200, mockSuccess({}));

        const sessionFilesPayload = {
            pjnz: {
                hash: "test.csv",
                filename: "test"
            },
            population: {
                hash: "test.csv",
                filename: "test"
            },
            shape: {
                hash: "test.csv",
                filename: "test"
            },
            anc: {
                hash: "test.csv",
                filename: "test"
            },
            survey: {
                hash: "test.csv",
                filename: "test"
            },
            programme: {
                hash: "test.csv",
                filename: "test"
            }
        }

        const commit = vi.fn();
        const dispatch = vi.fn()
        const rootGetters = {isGuest: false}
        const state = mockLoadState({rehydrateId: "1", projectName: "testProject"} as any)
        actions.pollRehydrate({commit, dispatch, rootState, state, rootGetters} as any);

        vi.advanceTimersByTime(2000);
        await flushPromises();

        expect(mockAxios.history.get.length).toBe(2)
        expect(mockAxios.history.get[0]["url"]).toBe("rehydrate/status/1")
        expect(mockAxios.history.get[1]["url"]).toBe("rehydrate/result/1")
        expect(mockAxios.history.post.length).toBe(1)
        expect(mockAxios.history.post[0]["url"]).toBe("/session/files/")
        expect(JSON.parse(mockAxios.history.post[0]["data"])).toStrictEqual(sessionFilesPayload)
        expect(commit.mock.calls.length).toBe(4)
        expect(commit.mock.calls[0][0].type).toBe("RehydratePollingStarted")
        expect(commit.mock.calls[0][0].payload).toBeGreaterThan(1)
        expect(commit.mock.calls[1][0].type).toBe("RehydrateStatusUpdated")
        expect(commit.mock.calls[1][0].payload).toStrictEqual(RunningStatusResponse)
        expect(commit.mock.calls[2][0].type).toBe("RehydrateResult")
        expect(commit.mock.calls[2][0].payload).toStrictEqual(rehydrateResultResponse)
        expect(commit.mock.calls[3][0].type).toBe("UpdatingState")
        expect(commit.mock.calls[3][0].payload).toStrictEqual({})
        expect(dispatch.mock.calls.length).toBe(2)
        expect(dispatch.mock.calls[0][0]).toBe("projects/createProject")
        expect(dispatch.mock.calls[0][1]).toStrictEqual({
            name: "testProject",
            isUploaded: true
        })

        expect(dispatch.mock.calls[1][0]).toBe("updateStoreState")
        const root: RootState = dispatch.mock.calls[1][1]

        //Baseline
        expect(root.baseline.pjnz).toStrictEqual(sessionFilesPayload.pjnz)
        expect(root.baseline.population).toStrictEqual(sessionFilesPayload.population)
        expect(root.baseline.shape).toStrictEqual(sessionFilesPayload.shape)

        //SurveyAndProgram
        expect(root.surveyAndProgram.anc).toStrictEqual(sessionFilesPayload.anc)
        expect(root.surveyAndProgram.survey).toStrictEqual(sessionFilesPayload.survey)
        expect(root.surveyAndProgram.program).toStrictEqual(sessionFilesPayload.programme)

        //Model Options
        expect(root.modelOptions.options).toStrictEqual(rehydrateResultResponse.state.model_fit.options)
        expect(root.modelOptions.valid).toBe(true)

        //ModelRun
        expect(root.modelRun.modelRunId).toStrictEqual(rehydrateResultResponse.state.model_fit.id)
        expect(root.modelRun.status).toStrictEqual({success: true, done: true})

        //Calibrate
        expect(root.modelCalibrate.options).toStrictEqual(rehydrateResultResponse.state.calibrate.options)
        expect(root.modelCalibrate.calibrateId).toStrictEqual(rehydrateResultResponse.state.calibrate.id)
        expect(root.modelCalibrate.status).toStrictEqual({success: true, done: true})

        //Project
        expect(root.projects.currentProject).toBe(null)
        expect(root.projects.currentVersion).toBe(null)

        //Version
        expect(root.hintrVersion.hintrVersion).toStrictEqual(rehydrateResultResponse.state.version)

        //Steps
        expect(root.stepper.activeStep).toBe(6)
    });

    it("Update store states and does not dispatch create project action when user is guest", async () => {
        mockAxios.onGet(`rehydrate/status/1`)
            .reply(200, mockSuccess(RunningStatusResponse));

        mockAxios.onGet(`rehydrate/result/1`)
            .reply(200, mockSuccess(rehydrateResultResponse));

        mockAxios.onPost(`session/files/`)
            .reply(200, mockSuccess({}));

        const commit = vi.fn();
        const dispatch = vi.fn()
        const rootGetters = {isGuest: true}
        const state = mockLoadState({rehydrateId: "1"} as any)
        actions.pollRehydrate({commit, dispatch, rootState, state, rootGetters} as any);
        vi.advanceTimersByTime(2000);
        await flushPromises();
        expect(commit.mock.calls.length).toBe(4)
        expect(commit.mock.calls[2][0].type).toBe("RehydrateResult")
        expect(commit.mock.calls[2][0].payload).toStrictEqual(rehydrateResultResponse)
        expect(commit.mock.calls[3][0].type).toBe("UpdatingState")
        expect(commit.mock.calls[3][0].payload).toStrictEqual({})
        expect(dispatch.mock.calls.length).toStrictEqual(1)
        expect(dispatch.mock.calls[0][0]).toBe("updateStoreState")
    });

    it("calls RehydrateResultError when polling errored", async () => {
        mockAxios.onGet(`rehydrate/status/1`)
            .reply(500, mockFailure("ERROR"));

        const commit = vi.fn();
        const dispatch = vi.fn()
        const state = mockLoadState({rehydrateId: "1"} as any)
        actions.pollRehydrate({commit, rootState, state, dispatch} as any);

        vi.advanceTimersByTime(2000);
        await flushPromises();

        expect(commit.mock.calls.length).toBe(2)
        expect(commit.mock.calls[0][0].type).toBe("RehydratePollingStarted")
        expect(commit.mock.calls[0][0].payload).toBeGreaterThan(1)
        expect(commit.mock.calls[1][0].type).toBe("RehydrateResultError")
        expect(commit.mock.calls[1][0].payload).toStrictEqual(mockError("ERROR"))
        expect(dispatch).not.toHaveBeenCalled()
    });
});
