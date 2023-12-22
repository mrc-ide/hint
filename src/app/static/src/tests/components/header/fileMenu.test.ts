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
import { Mock } from "vitest";

// jsdom has only implemented navigate up to hashes, hence appending a hash here to the base url
const mockCreateObjectUrl = vi.fn(() => "http://localhost#1234");
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
    const mockGetProjects = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks()
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

    it("downloads JSON file", async () => {
        switches.loadJson = true
        const store = createStore();
        const wrapper = mountWithTranslate(FileMenu, store,
            {
                props: {title: "naomi"},
                global: {
                    plugins: [store]
                }
            });
        await flushPromises();
        await wrapper.find(".dropdown-toggle").trigger("click");
        expect(wrapper.find(".dropdown-menu").classes()).toStrictEqual(["dropdown-menu", "show"]);
        let link = wrapper.findAll(".dropdown-item")[1];
        await link.trigger("mousedown");
        await expectTranslated(link, "SaveJSON", "SauvegarderJSON", "GuardarJSON", store as any);

        const hiddenLink = wrapper.find({ref: "save"});
        expect(hiddenLink.attributes("href")).toBe("http://localhost#1234");

        const re = new RegExp("naomi-(.*)\.json");
        expect((hiddenLink.attributes("download") as string).match(re)).toBeDefined();

        const expectedJson = {
            state: {
                baseline: {selectedDataset: null, selectedRelease: null, selectedDatasetIsRefreshed: false},
                modelRun: mockModelRunState(),
                modelCalibrate: {result: null, calibratePlotResult: null, comparisonPlotResult: null},
                metadata: mockMetadataState(),
                surveyAndProgram: {selectedDataType: null, warnings: []}
            },
            files: {
                pjnz: {hash: "2csv", filename: "2.csv"},
                population: {hash: "1csv", filename: "1.csv"},
                shape: {hash: "3csv", filename: "3.csv"},
                survey: {hash: "4csv", filename: "4.csv"},
                programme: {hash: "5csv", filename: "5.csv"},
                anc: {hash: "6csv", filename: "6.csv"}
            }
        };


        const actualBlob = (mockCreateObjectUrl as Mock).mock.calls[0][0];
        const reader = new FileReader();

        reader.addEventListener('loadend', function () {
            const text = reader.result as string;
            const result = JSON.parse(text)[1];
            expect(JSON.parse(result)).toStrictEqual(expectedJson);
        });

        await readAsText(reader, actualBlob);
    });

    it("aria-label and link text are translated for Json load", async () => {
        switches.loadJson = true
        const store = createStore();
        const wrapper = mountWithTranslate(FileMenu, store, {
            global: {
                plugins: [store]
            },
        });
        const link = wrapper.findAll(".dropdown-item")[2];
        await expectTranslated(link, "LoadJSON", "ChargerJSON", "CarregarJSON", store as any);
        const input = wrapper.find("#upload-file")
        await expectTranslated(input,
            "Select file",
            "Sélectionner un fichier",
            "Selecionar ficheiro",
            store as any,
            "aria-label");
    });

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

    it("opens file dialog on click load JSON", async () => {
        switches.loadJson = true
        const store = createStore();
        const wrapper = mountWithTranslate(FileMenu, store, {
            global: {
                plugins: [store]
            },
        });

        await wrapper.find(".dropdown-toggle").trigger("click");
        expect(wrapper.find(".dropdown-menu").classes()).toStrictEqual(["dropdown-menu", "show"]);
        const link = wrapper.findAll(".dropdown-item")[2];
        await expectTranslated(link, "LoadJSON", "ChargerJSON", "CarregarJSON", store as any);

        const input = wrapper.find("#upload-file").element as HTMLInputElement
        const mockClick = vi.fn();

        input.addEventListener("click", mockClick);
        await link.trigger("click");
        expect(mockClick).toHaveBeenCalledTimes(1);
    });

    it("invokes load JSON action when file selected from dialog, when user is guest", async () => {
        switches.loadJson = true
        const mockLoadAction = vi.fn();
        const store = createStore({
            load: {
                namespaced: true,
                state: mockLoadState(),
                actions: {
                    load: mockLoadAction
                }
            }
        })
        const wrapper = mountWithTranslate(FileMenu, store,
            {
                global: {
                    plugins: [store]
                }
            });

        const spy = vi.spyOn((wrapper.vm as any), "clearLoadJsonInput")

        const testFile = mockFile("testFilename.json", "test file contents", "application/json");
        await triggerSelectJson(wrapper, testFile, "#upload-file");
        expect(mockLoadAction.mock.calls.length).toEqual(1);
        expect(mockLoadAction.mock.calls[0][1]).toBe(testFile);
        expect((wrapper.findComponent("#project-json #load") as VueWrapper).props("open")).toBe(false);
        expect(spy).toHaveBeenCalledTimes(1)
    });

    it("does not invoke load JSON action when no file is selected from dialog, when user is guest", async () => {
        switches.loadJson = true
        const mockLoadAction = vi.fn();
        const store = createStore({
            load: {
                namespaced: true,
                state: mockLoadState(),
                actions: {
                    load: mockLoadAction
                }
            }
        });
        const wrapper = mountWithTranslate(FileMenu, store,
            {
                global: {
                    plugins: [store]
                }
            });

        const spy = vi.spyOn((wrapper.vm as any), "clearLoadJsonInput")

        await wrapper.find("#upload-file").trigger("change")
        expect(mockLoadAction.mock.calls.length).toEqual(0);
        expect((wrapper.findComponent("#load") as VueWrapper).props("open")).toBe(false);
        expect(spy).not.toHaveBeenCalled()
    });

    it("does not invoke preparingRehydrate action when file selected from dialog, when user is guest", async () => {
        const mockPreparingRehydrate = vi.fn();
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

        const spy = vi.spyOn((wrapper.vm as any), "clearLoadZipInput")

        await wrapper.find("#upload-zip").trigger("change")
        expect(mockPreparingRehydrate.mock.calls.length).toEqual(0);
        expect((wrapper.findComponent("#load") as VueWrapper).props("open")).toBe(false);
        expect(spy).not.toHaveBeenCalled()
    });

    it("invokes load model output action when file selected from dialog and user is guest", async () => {
        const mockPreparingRehydrate = vi.fn()
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

        const spy = vi.spyOn((wrapper.vm as any), "clearLoadZipInput")

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
        const clearErrorMock = vi.fn();
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

    it("can open upload project modal when load JSON is triggered as guest", async () => {
        switches.loadJson = true
        expect(mockGetProjects.mock.calls.length).toBe(0);
        const mockLoadAction = vi.fn()
        const store = createStore({
            load: {
                namespaced: true,
                state: mockLoadState(),
                actions: {
                    load: mockLoadAction
                }
            }
        });
        const projectModal = await openUploadNewProject(store, "#upload-file", "application/json")
        expect(projectModal.length).toBe(2);
        expect(projectModal[1].props().openModal).toBe(false);
        await projectModal[1].find(".btn").trigger("click");
        expect(mockGetProjects).not.toHaveBeenCalled()
        expect(mockLoadAction.mock.calls.length).toBe(1);
        expect(projectModal[1].props().openModal).toBe(false)

    });

    it("can get projects when user is logged in when file is uploaded", async () => {
        const store = createStore({
            load: {
                namespaced: true,
                state: mockLoadState()
            }
        }, false);
        const projectModal = await openUploadNewProject(store, "#upload-zip", "application/zip")
        await projectModal[0].find(".btn").trigger("click");
        expect(mockGetProjects).toHaveBeenCalled()
    });

    it("can open upload project modal and does not get projects as guest when file is uploaded", async () => {
        const mockPreparingRehydrate = vi.fn()
        const store = createStore({
            load: {
                namespaced: true,
                state: mockLoadState(),
                actions: {
                    preparingRehydrate: mockPreparingRehydrate
                }
            }
        });
        const projectModal = await openUploadNewProject(store, "#upload-zip", "application/zip")
        await projectModal[0].find(".btn").trigger("click");
        expect(mockGetProjects).not.toHaveBeenCalled()
        expect(mockPreparingRehydrate.mock.calls.length).toBe(1);
        expect(projectModal[0].props().openModal).toBe(false)
    });

    it("triggers preparingRehydrate action as non-guest when file is uploaded", async () => {
        const mockPreparingRehydrate = vi.fn()
        const mockProjectName = vi.fn()
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

    it("triggers load action as non-guest when JSON file is uploaded", async () => {
        switches.loadJson = true
        const mockLoadAction = vi.fn()
        const mockProjectName = vi.fn()
        const store = createStore({
            load: {
                namespaced: true,
                state: mockLoadState(),
                actions: {
                    load: mockLoadAction
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
        const testFile = mockFile("test.json", "test file contents", "application/json");
        await triggerSelectJson(wrapper, testFile, "#upload-file");
        const jsonProject = wrapper.find("#project-json");
        console.log((jsonProject.findComponent("#load") as VueWrapper).props())
        expect((jsonProject.findComponent("#load") as VueWrapper).props("open")).toBe(true);
        const confirmLoad = jsonProject.find("#confirm-load-project")
        await jsonProject.find("#project-name-input-json").setValue("new uploaded project")
        await confirmLoad.trigger("click")

        expect(mockProjectName.mock.calls.length).toBe(1);
        expect(mockProjectName.mock.calls[0][1]).toBe("new uploaded project");
        expect((wrapper.vm as any).fileToLoad).toStrictEqual(testFile);
        expect(mockLoadAction.mock.calls.length).toBe(1);
        expect(jsonProject.findComponent(UploadNewProject).props().openModal).toBe(false);
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

    it("upload JSON shows project name modal when file selected from dialog, when user is not guest", async () => {
        switches.loadJson = true
        const store = createStore({}, false);
        const wrapper = mountWithTranslate(FileMenu, store, {
            global: {
                plugins: [store]
            },
        });
        const testFile = mockFile("filename.json", "test file contents", "application/json");
        await triggerSelectJson(wrapper, testFile, "#upload-file");

        expect((wrapper.findComponent("#project-json #load") as VueWrapper).props("open")).toBe(true);
        expect((wrapper.vm as any).fileToLoad).toStrictEqual(testFile);
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

    it("clicking cancel from Json project name modal hides modal", async () => {
        switches.loadJson = true
        const wrapper = mount(FileMenu,
            {
                global: {
                    plugins: [createStore({}, false)]
                }
            });

        (wrapper.vm as any).$data.projectNameJson = true;
        await nextTick();
        const spy = vi.spyOn((wrapper.vm as any), "clearLoadJsonInput");

        const modal = wrapper.findComponent("#project-json #load");
        expect((modal as VueWrapper).props("open")).toBe(true);
        await modal.find("#cancel-load-project").trigger("click");
        expect((modal as VueWrapper).props("open")).toBe(false);
        expect(spy).toHaveBeenCalledTimes(1)
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
        const spy = vi.spyOn((wrapper.vm as any), "clearLoadZipInput");

        const modal = wrapper.findComponent("#project-zip #load");
        expect((modal as VueWrapper).props("open")).toBe(true);
        await modal.find("#cancel-load-project").trigger("click");
        expect((modal as VueWrapper).props("open")).toBe(false);
        expect(spy).toHaveBeenCalledTimes(1)
    });

    it("should disable button when uploadZip input field is empty for new project upload", async () => {
        const mockPreparingRehydrate = vi.fn()
        const mockProjectName = vi.fn()
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

    it("does not render load and save Json project", () => {
        switches.loadJson = false
        const store = createStore();
        const wrapper = mountWithTranslate(FileMenu, store, {
            global: {
                plugins: [store]
            },
        });
        const link = wrapper.findAll(".dropdown-item");

        expect(link.length).toBe(1)
        expect(link[0].text()).toBe("Load Model Outputs")
    });
});

const openUploadNewProject = async (store: Store<any>, inputId= "#upload-file", fileType = "application/json") => {
    const wrapper = mountWithTranslate(FileMenu, store, {
        global: {
            plugins: [store]
        }, 
    });
    const testFile = mockFile("test filename", "test file contents", fileType);
    let componentName;
    if (fileType === "application/json") {
        await triggerSelectJson(wrapper, testFile, inputId);
        componentName = "project-json"
    } else if (fileType === "application/zip") {
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
    vi.spyOn((wrapper.vm.$refs as any).loadZip, "files", "get").mockImplementation(() => [testFile]);
    await input.trigger("change");
};

const triggerSelectJson = async (wrapper: VueWrapper, testFile: File, id: string) => {
    const input = wrapper.find(id);
    vi.spyOn((wrapper.vm.$refs as any).loadJson, "files", "get").mockImplementation(() => [testFile]);
    await input.trigger("change");
};
