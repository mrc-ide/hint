import {flushPromises, mount, shallowMount, VueWrapper} from "@vue/test-utils";
import Vuex, {Store} from "vuex";
import {
    mockAncResponse,
    mockBaselineState,
    mockError,
    mockFile,
    mockLoadState,
    mockMetadataState,
    mockModelRunState,
    mockPJNZResponse,
    mockPopulationResponse,
    mockProgramResponse, mockProjectsState,
    mockShapeResponse,
    mockSurveyAndProgramState,
    mockSurveyResponse
} from "../../mocks";
import {LoadingState} from "../../../app/store/load/state";
import FileMenu from "../../../app/components/header/FileMenu.vue";
import registerTranslations from "../../../app/store/translations/registerTranslations";
import {Language} from "../../../app/store/translations/locales";
import UploadNewProject from "../../../app/components/load/UploadNewProject.vue";
import {expectTranslated, mountWithTranslate} from "../../testHelpers";
import {switches} from "../../../app/featureSwitches";
import { nextTick } from "vue";

// jsdom has only implemented navigate up to hashes, hence appending a hash here to the base url
const mockCreateObjectUrl = jest.fn(() => "http://localhost#1234");
window.URL.createObjectURL = mockCreateObjectUrl;

function readAsText(reader:any, file: any) {
    return new Promise((resolve, reject) => {
        reader.onerror = reject;
        reader.onload = () => {
            resolve(reader.result);
        }
        reader.readAsText(file);
    });
}

describe("File menu", () => {

    // @ts-ignore
    global.File = class MockFile {
        filename: string;
        constructor(parts: (string | Blob | ArrayBuffer | ArrayBufferView)[], filename: string, properties ? : FilePropertyBag) {
          this.filename = filename;
        }
    }

    const testProjects = [{id: 2, name: "proj1", versions: []}];
    const mockGetProjects = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks()
    })

    const storeModules = {
        baseline: {
            namespaced: true,
            state: mockBaselineState({
                population: mockPopulationResponse({hash: "1csv", filename: "1.csv"}),
                pjnz: mockPJNZResponse({hash: "2csv", filename: "2.csv"}),
                shape: mockShapeResponse({hash: "3csv", filename: "3.csv"})
            })
        },
        surveyAndProgram: {
            namespaced: true,
            state: mockSurveyAndProgramState({
                survey: mockSurveyResponse({hash: "4csv", filename: "4.csv"}),
                program: mockProgramResponse({hash: "5csv", filename: "5.csv"}),
                anc: mockAncResponse({hash: "6csv", filename: "6.csv"})
            })
        },
        modelRun: {
            namespaced: true,
            state: mockModelRunState()
        },
        load: {
            namespaced: true,
            state: mockLoadState()
        },
        metadata: {
            namespaced: true,
            state: mockMetadataState()
        },
        projects: {
            namespaced: true,
            state: mockProjectsState({previousProjects: testProjects}),
            actions: {
                getProjects: mockGetProjects
            }
        }
    };

    const createStore = (customModules = {}, isGuest = true) => {
        const store = new Vuex.Store({
            state: {
                language: Language.en,
                updatingLanguage: false
            },
            getters: {
                isGuest: () => isGuest
            },
            modules: {
                ...storeModules,
                ...customModules
            }
        });
        registerTranslations(store);
        return store;
    };


    it("aria-label and link text are translated for outputZip load", async () => {
        const store = createStore();
        const wrapper = mountWithTranslate(FileMenu, store, {
            global: {
                plugins: [store]
            }, 
        });
        const link = wrapper.findAll(".dropdown-item")[0];
        await expectTranslated(link,
            "Load Model Outputs",
            "Charger les sorties du modèle",
            "Carregar Saídas do Modelo", store as any);
        const input = wrapper.find("#upload-zip")
        await expectTranslated(input,
            "Select file",
            "Sélectionner un fichier",
            "Selecionar ficheiro",
            store as any,
            "aria-label");
    });

    it("does not invoke preparingRehydrate action when file selected from dialog, when user is guest", async () => {
        const mockPreparingRehydrate = jest.fn();
        const wrapper = mount(FileMenu,
            {
                global: {
                    plugins: [createStore({
                        load: {
                            namespaced: true,
                            state: mockLoadState(),
                            actions: {
                                preparingRehydrate: mockPreparingRehydrate
                            }
                        }
                    })]
                }
            });

        const spy = jest.spyOn((wrapper.vm as any), "clearLoadZipInput")

        await wrapper.find("#upload-zip").trigger("change")
        expect(mockPreparingRehydrate.mock.calls.length).toEqual(0);
        expect((wrapper.findComponent("#load") as VueWrapper).props("open")).toBe(false);
        expect(spy).not.toHaveBeenCalled()
    });

    it("invokes load model output action when file selected from dialog and user is guest", async () => {
        const mockPreparingRehydrate = jest.fn()
        const wrapper = mount(FileMenu,
            {
                global: {
                    plugins: [createStore({
                        load: {
                            state: mockLoadState(),
                            namespaced: true,
                            actions: {
                                preparingRehydrate: mockPreparingRehydrate
                            }
                        }
                    })]
                },
            });

        const spy = jest.spyOn((wrapper.vm as any), "clearLoadZipInput")

        const testFile = mockFile("test filename", "test file contents", "application/zip");
        await triggerSelectZip(wrapper, testFile, "#upload-zip");
        expect(mockPreparingRehydrate.mock.calls.length).toBe(1);
        expect((wrapper.findComponent("#project-zip #load") as VueWrapper).props("open")).toBe(false);
        expect(spy).toHaveBeenCalledTimes(1)
    });

    it("does not open error modal if no load error", () => {
        const wrapper = shallowMount(FileMenu,
            {
                global: {
                    plugins: [createStore()]
                }
            });

        expect(wrapper.findComponent(UploadNewProject).attributes("open")).toBeFalsy();
    });

    it("error modal can be dismissed", async () => {
        const clearErrorMock = jest.fn();
        const store = createStore({
            load: {
                namespaced: true,
                state: mockLoadState({
                    loadingState: LoadingState.LoadFailed,
                    loadError: mockError("test error")
                }),
                actions: {
                    clearLoadState: clearErrorMock
                }
            }
        });

        const wrapper = mountWithTranslate(FileMenu, store, {
            global: {
                plugins: [store]
            }, 
        });

        const projectModal = wrapper.findComponent(UploadNewProject);

        const modal = projectModal.findAll(".modal")

        await modal[1].find(".btn").trigger("click");
        await expectTranslated(modal[1].find(".btn"), "OK", "OK", "OK", store as any);
        expect(clearErrorMock.mock.calls.length).toBe(1);
    });

    it("can get projects when user is logged in when file is uploaded", async () => {
        const store = createStore({
            load: {
                namespaced: true,
                state: mockLoadState()
            }
        }, false);
        const projectModal = await openUploadNewProject(store)
        await projectModal[0].find(".btn").trigger("click");
        expect(mockGetProjects).toHaveBeenCalled()
    });

    it("can open upload project modal and does not get projects as guest when file is uploaded", async () => {
        const mockPreparingRehydrate = jest.fn()
        const store = createStore({
            load: {
                namespaced: true,
                state: mockLoadState(),
                actions: {
                    preparingRehydrate: mockPreparingRehydrate
                }
            }
        });
        const projectModal = await openUploadNewProject(store)
        await projectModal[0].find(".btn").trigger("click");
        expect(mockGetProjects).not.toHaveBeenCalled()
        expect(mockPreparingRehydrate.mock.calls.length).toBe(1);
        expect(projectModal[0].props().openModal).toBe(false)
    });

    it("triggers preparingRehydrate action as non-guest when file is uploaded", async () => {
        const mockPreparingRehydrate = jest.fn()
        const mockProjectName = jest.fn()
        const store = createStore({
            load: {
                namespaced: true,
                state: mockLoadState(),
                actions: {
                    preparingRehydrate: mockPreparingRehydrate
                },
                mutations: {
                    SetProjectName: mockProjectName
                }
            }
        }, false);

        const wrapper = mountWithTranslate(FileMenu, store, {
            global: {
                plugins: [store]
            }, 
        });
        const testFile = mockFile("test.zip", "test file contents", "application/zip");
        await triggerSelectZip(wrapper, testFile, "#upload-zip");
        const projectZip = wrapper.find("#project-zip")
        expect((projectZip.findComponent("#load") as VueWrapper).props("open")).toBe(true);

        const confirmLoad = projectZip.find("#confirm-load-project")
        await projectZip.find("#project-name-input-zip").setValue("new uploaded project")
        await confirmLoad.trigger("click")

        expect(mockProjectName.mock.calls.length).toBe(1);
        expect(mockProjectName.mock.calls[0][1]).toBe("new uploaded project");
        expect((wrapper.vm as any).fileToLoad).toStrictEqual(testFile);
        expect(mockPreparingRehydrate.mock.calls.length).toBe(1);
        expect(projectZip.findComponent(UploadNewProject).props().openModal).toBe(false);
    });

    it("can render project upload zip props", async() => {
        const store = createStore({
            load: {
                namespaced: true,
                state: mockLoadState()
            }
        });

        const wrapper = mountWithTranslate(FileMenu, store, {
            global: {
                plugins: [store]
            }, 
        });

        const projectModal = wrapper.findComponent(UploadNewProject);

        expect(projectModal.exists()).toBeTruthy()
        expect(projectModal.props("cancelLoad")).toBeInstanceOf(Function)
        expect(projectModal.props("submitLoad")).toBeInstanceOf(Function)
        expect(projectModal.props("openModal")).toBe(false)
    });

    it("upload rehydrate model shows project name modal when file selected from dialog, when user is not guest", async () => {
        const store = createStore({}, false);
        const wrapper = mountWithTranslate(FileMenu, store, {
            global: {
                plugins: [store]
            }, 
        });
        const testFile = new File(["test file contents"], "test filename");
        await triggerSelectZip(wrapper, testFile, "#upload-zip");
        expect((wrapper.findComponent("#project-zip #load") as VueWrapper).props("open")).toBe(true);
        expect((wrapper.vm as any).fileToLoad).toStrictEqual(testFile);
    });

    it("clicking cancel from Zip project name modal hides modal", async () => {
        const wrapper = mount(FileMenu,
            {
                global: {
                    plugins: [createStore({}, false)]
                }
            });

        (wrapper.vm as any).$data.projectNameZip = true;
        await nextTick();
        const spy = jest.spyOn((wrapper.vm as any), "clearLoadZipInput");

        const modal = wrapper.findComponent("#project-zip #load");
        expect((modal as VueWrapper).props("open")).toBe(true);
        await modal.find("#cancel-load-project").trigger("click");
        expect((modal as VueWrapper).props("open")).toBe(false);
        expect(spy).toHaveBeenCalledTimes(1)
    });

    it("should disable button when uploadZip input field is empty for new project upload", async () => {
        const mockPreparingRehydrate = jest.fn()
        const mockProjectName = jest.fn()
        const store = createStore({
            load: {
                namespaced: true,
                state: mockLoadState(),
                actions: {
                    preparingRehydrate: mockPreparingRehydrate
                },
                mutations: {
                    SetProjectName: mockProjectName
                }
            }
        }, false);

        const wrapper = mountWithTranslate(FileMenu, store, {
            global: {
                plugins: [store]
            }, 
        });
        const testFile = mockFile("test.zip", "test file contents", "application/zip");
        await triggerSelectZip(wrapper, testFile, "#upload-zip");
        const projectZip = wrapper.find("#project-zip")
        const confirmLoad = projectZip.find("#confirm-load-project")
        expect((confirmLoad.element as HTMLButtonElement).disabled).toBe(true)
        await projectZip.find("#project-name-input-zip").setValue("new uploaded project")
        expect((confirmLoad.element as HTMLButtonElement).disabled).toBe(false)
    });
});

const openUploadNewProject = async (store: Store<any>, inputId= "#upload-zip", fileType = "application/zip") => {
    const wrapper = mountWithTranslate(FileMenu, store, {
        global: {
            plugins: [store]
        }, 
    });
    const testFile = mockFile("test filename", "test file contents", fileType);
    let componentName;
    if (fileType === "application/zip") {
        await triggerSelectZip(wrapper, testFile, inputId);
        componentName = "project-zip"
    } else {
        throw new Error("Can't select file of type " + fileType);
    }
    const projectModal = wrapper.findAllComponents(UploadNewProject);
    expect(projectModal.length >= 1)
    expect(projectModal[0].exists()).toBeTruthy()
    return projectModal
}

const triggerSelectZip = async (wrapper: VueWrapper, testFile: File, id: string) => {
    const input = wrapper.find(id);
    jest.spyOn((wrapper.vm.$refs as any).loadZip, "files", "get").mockImplementation(() => [testFile]);
    await input.trigger("change");
};
