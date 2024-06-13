import {shallowMount, mount, VueWrapper} from '@vue/test-utils';
import Vuex, {Store} from 'vuex';
import {
    mockADRState,
    mockADRUploadState,
    mockDownloadResultsDependency,
    mockDownloadResultsState,
    mockModelCalibrateState
} from "../../mocks";
import DownloadResults from "../../../app/components/downloadResults/DownloadResults.vue";
import registerTranslations from "../../../app/store/translations/registerTranslations";
import {emptyState, RootState} from "../../../app/root";
import {expectTranslated, mountWithTranslate, shallowMountWithTranslate} from "../../testHelpers";
import UploadModal from "../../../app/components/downloadResults/UploadModal.vue";
import {DownloadResultsState} from "../../../app/store/downloadResults/downloadResults";
import Download from "../../../app/components/downloadResults/Download.vue";
import {ADRState} from "../../../app/store/adr/adr";
import {ADRUploadState} from "../../../app/store/adrUpload/adrUpload";
import ErrorAlert from "../../../app/components/ErrorAlert.vue";

describe("Download Results component", () => {

    const error = {error: "ERR", detail: "download report error"}

    const mockPrepareOutputs = vi.fn();
    const mockDownloadComparisonReport = vi.fn()
    const mockDownloadSpectrumReport = vi.fn()
    const mockDownloadCoarseReport = vi.fn()
    const mockDownloadSummaryReport = vi.fn()
    const mockDownloadAgywTool = vi.fn()

    afterEach(() => {
        vi.useRealTimers();
        vi.resetAllMocks();
    })

    const createStore = (adr: Partial<ADRState> = {userCanUpload: true},
                         getUserCanUpload = vi.fn(),
                         adrUploadState: Partial<ADRUploadState> = {},
                         downloadResults?: Partial<DownloadResultsState>,
                         clearStatus = vi.fn()) => {
        const store = new Vuex.Store({
            state: emptyState(),
            modules: {
                modelCalibrate: {
                    namespaced: true,
                    state: mockModelCalibrateState({calibrateId: "testId"}),
                },
                adr: {
                    namespaced: true,
                    state: mockADRState(adr),
                    actions: {
                        getUserCanUpload
                    }
                },
                adrUpload: {
                    namespaced: true,
                    state: mockADRUploadState({
                        ...adrUploadState,
                        currentFileUploading: 1,
                        totalFilesUploading: 2
                    }),
                    actions: {
                        getUploadFiles: vi.fn()
                    },
                    mutations: {
                        ClearStatus: clearStatus
                    }
                },
                downloadResults: {
                    namespaced: true,
                    state: mockDownloadResultsState(downloadResults),
                    actions: {
                        prepareOutputs: mockPrepareOutputs,
                        downloadComparisonReport: mockDownloadComparisonReport,
                        downloadSpectrumOutput: mockDownloadSpectrumReport,
                        downloadSummaryReport: mockDownloadSummaryReport,
                        downloadCoarseOutput: mockDownloadCoarseReport,
                        downloadAgywTool: mockDownloadAgywTool,
                    }
                }
            }
        });
        registerTranslations(store);
        return store;
    };

    it("renders as expected", () => {
        const store = createStore();
        const wrapper = mountWithTranslate(DownloadResults, store,
            {
                global: {
                    plugins: [store],
                    stubs: ["upload-modal"],
                },
                data() {
                    return {
                        comparisonSwitch: true
                    }
                }
            });

        const headers = wrapper.findAll("h4");
        expectTranslated(headers[0], "Download Naomi results",
            "Télécharger les résultats de Naomi", "Baixe os resultados de Naomi", store);
        expectTranslated(headers[1], "Download coarse age group outputs",
            "Télécharger les résultats grossiers du groupe d'âge",
            "Descarregar resultados de grupos etários grosseiros", store);
        expectTranslated(headers[2], "Download summary report",
            "Télécharger le rapport de synthèse", "Descarregar relatório de síntese", store);
        expectTranslated(headers[3], "Download comparison report",
            "Télécharger le rapport de comparaison", "Baixar relatório de comparação", store);
        expectTranslated(headers[4], "Download SHIPP tool",
            "Télécharger l'outil SHIPP", "Descarregar a ferramenta SHIPP", store);
        expectTranslated(headers[5], "Upload to ADR",
            "Télécharger vers ADR", "Carregar para o ADR", store);

        const buttons = wrapper.findAll("button");
        expect(buttons.length).toBe(6);
        expectTranslated(buttons[0], "Download", "Télécharger", "Descarregar", store);
        expectTranslated(buttons[1], "Download", "Télécharger", "Descarregar", store);
        expectTranslated(buttons[2], "Download", "Télécharger", "Descarregar", store);
        expectTranslated(buttons[3], "Download", "Télécharger", "Descarregar", store);
        expectTranslated(buttons[4], "Download", "Télécharger", "Descarregar", store);
        expectTranslated(buttons[5], "Upload", "Télécharger", "Carregar", store);
    });

    it(`renders, opens and closes dialog as expected`, async () => {
        const store = createStore();
        const wrapper = mountWithTranslate(DownloadResults, store,
            {
                global: {
                    plugins: [store],
                    stubs: ["upload-modal"],
                },
                data() {
                    return {
                        uploadModalOpen: false
                    }
                }
            });

        expect(wrapper.findComponent(UploadModal).exists()).toBe(false)
        expect((wrapper.vm.$data as any).uploadModalOpen).toBe(false)

        const upload = wrapper.find("#upload").find("button")
        await upload.trigger("click")
        expect(wrapper.findComponent(UploadModal).exists()).toBe(true)
        expect((wrapper.vm.$data as any).uploadModalOpen).toBe(true)

        const modal = wrapper.findComponent(UploadModal)
        await modal.vm.$emit("close")
        expect(modal.emitted().close.length).toBe(1)
        expect((wrapper.vm.$data as any).uploadModalOpen).toBe(false)
    })

    it("invokes getUserCanUpload on mounted", async () => {
        const mockGetUserCanUpload = vi.fn();
        const store = createStore({userCanUpload: true}, mockGetUserCanUpload);
        shallowMount(DownloadResults, {
            global: {
                plugins: [store]
            }
        });
        expect(mockGetUserCanUpload.mock.calls.length).toBe(1);
    });

    it("does not display upload button when a user does not have permission", async () => {
        const store = createStore({userCanUpload: false});
        const wrapper = mount(DownloadResults,
            {
                global: {
                    plugins: [store],
                    stubs: ["upload-modal"],
                },
                data() {
                    return {
                        comparisonSwitch: true
                    }
                }
            });
        const headers = wrapper.findAll("h4");
        expect(headers.length).toBe(5)
    });

    it("does not render status messages or error alerts without appropriate states", () => {
        const store = createStore({userCanUpload: true}, vi.fn());
        const wrapper = shallowMountWithTranslate(DownloadResults, store, {
            global: {
                plugins: [store]
            }, 
        });

        expect(wrapper.find("#uploading").exists()).toBe(false);
        expect(wrapper.find("#uploadComplete").exists()).toBe(false);
        expect(wrapper.find("error-alert-stub").exists()).toBe(false);
    });

    it("renders uploading status messages as expected and disables upload button", () => {
        const store = createStore({userCanUpload: true}, vi.fn(), {uploading: true});
        const wrapper = shallowMountWithTranslate(DownloadResults, store, {
            global: {
                plugins: [store]
            }, 
        });

        const statusMessage = wrapper.find("#uploading");
        expect(statusMessage.find("loading-spinner-stub").exists()).toBe(true)
        expectTranslated(statusMessage.find("span"), "Uploading 1 of 2 (this may take a while)",
            "Téléchargement de 1 sur 2 (cela peut prendre un certain temps)",
            "A carregar 1 de 2 (este processo poderá demorar um pouco)", store);

        const uploadButton = wrapper.find("#upload").find("button");
        expect((uploadButton.element as HTMLButtonElement).disabled).toBe(true)
    });

    it("renders upload complete and release created status messages as expected", () => {
        const store = createStore({userCanUpload: true}, vi.fn(), {uploadComplete: true, releaseCreated: true});
        const wrapper = shallowMountWithTranslate(DownloadResults, store, {
            global: {
                plugins: [store]
            }, 
        });

        const statusMessage = wrapper.find("#uploadComplete");
        expectTranslated(statusMessage.find("span"), "Upload complete",
            "Téléchargement complet", "Carregamento concluído", store);
        expect(statusMessage.find("tick-stub").exists()).toBe(true)

        const statusMessage2 = wrapper.find("#releaseCreated");
        expectTranslated(statusMessage2.find("span"), "Release created",
            "Version créée", "Lançamento criado", store);
        expect(statusMessage2.find("tick-stub").exists()).toBe(true)

        const uploadButton = wrapper.find("button");
        expect((uploadButton.element as HTMLButtonElement).disabled).toBe(false);
    });

    it("renders release not created status messages as expected", () => {
        const store = createStore({userCanUpload: true}, vi.fn(), {uploadComplete: true, releaseFailed: true});
        const wrapper = shallowMountWithTranslate(DownloadResults, store, {
            global: {
                plugins: [store]
            }, 
        });

        const statusMessage = wrapper.find("#releaseCreated");
        expectTranslated(statusMessage.find("span"), "Could not create new release",
            "Impossible de créer une nouvelle version", "Não foi possível criar um novo lançamento", store);
        expect(statusMessage.find("cross-stub").exists()).toBe(true)

        const uploadButton = wrapper.find("button");
        expect((uploadButton.element as HTMLButtonElement).disabled).toBe(false);
    });

    it("renders upload error alert as expected", () => {
        const error = {error: "ERR", detail: "there was an error"}
        const store = createStore({userCanUpload: true}, vi.fn(), {uploadError: error});
        const wrapper = shallowMountWithTranslate(DownloadResults, store, {
            global: {
                plugins: [store]
            }, 
        });

        const errorAlert = wrapper.findComponent(ErrorAlert);
        expect(errorAlert.props("error")).toEqual(error)

        const uploadButton = wrapper.find("button");
        expect((uploadButton.element as HTMLButtonElement).disabled).toBe(false);
        expect(uploadButton.classes()).toEqual(["btn", "btn-lg", "my-3", "btn-red"]);
    });

    it("disables upload button when upload in progress", () => {
        const store = createStore({userCanUpload: true}, vi.fn(), {uploading: true});
        const wrapper = shallowMountWithTranslate(DownloadResults, store, {
            global: {
                plugins: [store]
            }, 
        });

        const uploadButton = wrapper.find("button");
        expect((uploadButton.element as HTMLButtonElement).disabled).toBe(true);
        expect(uploadButton.classes()).toEqual(["btn", "btn-lg", "my-3", "btn-secondary"]);
    });

    it("disables download buttons when upload in progress", () => {
        const store = createStore({userCanUpload: true}, vi.fn(), {uploading: true});
        const wrapper = shallowMount(DownloadResults, {
            global: {
                plugins: [store]
            },
            data() {
                return {
                    comparisonSwitch: true
                }
            }
        });

        const downloadButtons = wrapper.findAllComponents(Download);
        expect(downloadButtons.length).toBe(5)
        expect(downloadButtons[0].props("disabled")).toBe(true)
        expect(downloadButtons[1].props("disabled")).toBe(true)
        expect(downloadButtons[2].props("disabled")).toBe(true)
        expect(downloadButtons[3].props("disabled")).toBe(true)
        expect(downloadButtons[4].props("disabled")).toBe(true)
    });

    it("calls prepareOutputs on mount", () => {
        const store = createStore();
        shallowMount(DownloadResults, {
            global: {
                plugins: [store]
            }
        });
        expect(mockPrepareOutputs.mock.calls.length).toBe(1);
    });

    it("cannot download spectrum output while preparing", async () => {
        const store = createStore({}, vi.fn(), {}, {
            spectrum: mockDownloadResultsDependency({
                preparing: true,
                downloadId: "1"
            })
        });
        const wrapper = mountWithTranslate(DownloadResults, store, {
            global: {
                plugins: [store],
                stubs: ["upload-modal"]
            }
        });

        const button = wrapper.find("#spectrum-download").find("button")
        expect(button.attributes().disabled).toBe("");
    });

    it("cannot download spectrum output if downloadId does not exist", async () => {
        const store = createStore();
        const wrapper = mountWithTranslate(DownloadResults, store, {
            global: {
                plugins: [store],
                stubs: ["upload-modal"]
            }
        });

        const button = wrapper.find("#spectrum-download").find("button")
        expect(button.attributes().disabled).toBe("");
    });

    it("can download spectrum file once prepared", async () => {
        const store = createStore({}, vi.fn(), {}, {
            spectrum: mockDownloadResultsDependency({
                preparing: false,
                complete: true,
                error: null,
                downloadId: "123"
            })
        });
        const wrapper = mountWithTranslate(DownloadResults, store, {
            global: {
                plugins: [store],
                stubs: ["upload-modal"]
            }
        });
        const button = wrapper.find("#spectrum-download").find("button");
        expect(button.attributes().disabled).toBeUndefined();
        await button.trigger("click");
        expect(mockDownloadSpectrumReport).toHaveBeenCalled()
    });

    it("cannot download summary report while preparing", () => {
        const store = createStore({}, vi.fn(), {}, {
            summary: mockDownloadResultsDependency({
                preparing: true,
                downloadId: "1"
            })
        });
        const wrapper = mountWithTranslate(DownloadResults, store, {
            global: {
                plugins: [store],
                stubs: ["upload-modal"]
            }
        });

        const button = wrapper.find("#summary-download").find("button")
        expect(button.attributes().disabled).toBe("");
    });

    it("cannot download summary report if downloadId does not exist", async () => {
        const store = createStore();
        const wrapper = mountWithTranslate(DownloadResults, store, {
            global: {
                plugins: [store],
                stubs: ["upload-modal"]
            }
        });

        const button = wrapper.find("#summary-download").find("button")
        expect(button.attributes().disabled).toBe("");
    });

    it("can download summary report once prepared", async () => {
        const store = createStore({}, vi.fn(), {}, {
            summary: mockDownloadResultsDependency({
                preparing: false,
                complete: true,
                error: null,
                downloadId: "123"
            })
        });
        const wrapper = mountWithTranslate(DownloadResults, store, {
            global: {
                plugins: [store],
                stubs: ["upload-modal"]
            }
        });
        const button = wrapper.find("#summary-download").find("button");
        expect(button.attributes().disabled).toBeUndefined();
        await button.trigger("click");
        expect(mockDownloadSummaryReport).toHaveBeenCalled()
    });

    it("cannot download coarse output while preparing", () => {
        const store = createStore({}, vi.fn(), {}, {
            coarseOutput: mockDownloadResultsDependency({
                preparing: true,
                downloadId: "1"
            })
        });
        const wrapper = mountWithTranslate(DownloadResults, store, {
            global: {
                plugins: [store],
                stubs: ["upload-modal"]
            }
        });

        const button = wrapper.find("#coarse-output-download").find("button")
        expect(button.attributes().disabled).toBe("");
    });

    it("cannot download coarse output if downloadId does not exist", async () => {
        const store = createStore();
        const wrapper = mountWithTranslate(DownloadResults, store, {
            global: {
                plugins: [store],
                stubs: ["upload-modal"]
            }
        });

        const button = wrapper.find("#coarse-output-download").find("button")
        expect(button.attributes().disabled).toBe("");
    });

    it("can download coarseOutput file once prepared", async () => {
        const store = createStore({}, vi.fn(), {}, {
            coarseOutput: mockDownloadResultsDependency({
                preparing: false,
                complete: true,
                error: null,
                downloadId: "123"
            })
        });
        const wrapper = mountWithTranslate(DownloadResults, store, {
            global: {
                plugins: [store],
                stubs: ["upload-modal"]
            }
        });
        const button = wrapper.find("#coarse-output-download").find("button");
        expect(button.attributes().disabled).toBeUndefined();
        await button.trigger("click");
        expect(mockDownloadCoarseReport).toHaveBeenCalled()
    });

    it("cannot download comparison output while preparing", async () => {
        const store = createStore({}, vi.fn(), {}, {
            comparison: mockDownloadResultsDependency({
                preparing: true,
                downloadId: "1"
            })
        });

        const wrapper = mount(DownloadResults,
            {
                global: {
                    plugins: [store],
                    stubs: ["upload-modal"],
                },
                data() {
                    return {
                        comparisonSwitch: true
                    }
                }
            });

        const button = wrapper.find("#comparison-download").find("button")
        expect(button.attributes().disabled).toBe("");
    });

    it("cannot download comparison output if downloadId does not exist", async () => {
        const store = createStore();
        const wrapper = mount(DownloadResults,
            {
                global: {
                    plugins: [store],
                    stubs: ["upload-modal"],
                },
                data() {
                    return {
                        comparisonSwitch: true
                    }
                }
            });

        const button = wrapper.find("#comparison-download").find("button")
        expect(button.attributes().disabled).toBe("");
    });

    it("can download comparison file once prepared", async () => {
        const store = createStore({}, vi.fn(), {}, {
            comparison: mockDownloadResultsDependency({
                preparing: false,
                complete: true,
                error: null,
                downloadId: "123"
            })
        });
        const wrapper = mount(DownloadResults,
            {
                global: {
                    plugins: [store],
                    stubs: ["upload-modal"],
                },
                data() {
                    return {
                        comparisonSwitch: true
                    }
                }
            });
        const button = wrapper.find("#comparison-download").find("button");
        expect(button.attributes().disabled).toBeUndefined();
        await button.trigger("click")
        expect(mockDownloadComparisonReport).toHaveBeenCalledTimes(1)
    });

    it("can display error message for comparison download file when errored", async () => {
        const error = {error: "ERR", detail: "comparison error"}
        const store = createStore({}, vi.fn(), {}, {
            comparison: mockDownloadResultsDependency({
                preparing: false,
                complete: true,
                error,
                downloadId: "123"
            })
        });
        const wrapper = mount(DownloadResults,
            {
                global: {
                    plugins: [store],
                    stubs: ["upload-modal"],
                },
                data() {
                    return {
                        comparisonSwitch: true
                    }
                }
            });
        const comparisonWrapper = wrapper.find("#comparison-download");
        const button = comparisonWrapper.find("button");
        expect(button.attributes().disabled).toBeUndefined();
        expect(comparisonWrapper.findComponent(ErrorAlert).props("error")).toEqual(error)
    });

    it("calls clear status mutation before mount", () => {
        const spy = vi.fn()
        const store = createStore({}, vi.fn(), {}, {}, spy);
        shallowMount(DownloadResults, {
            global: {
                plugins: [store]
            }
        });
        expect(spy).toHaveBeenCalledTimes(1)
    });

    it("can display error message for summary download file when errored", async () => {
        const store = createStore({}, vi.fn(), {}, {
            summary: mockDownloadResultsDependency({
                preparing: false,
                complete: true,
                error,
                downloadId: "123"
            })
        });

        rendersReportDownloadErrors(store, "#summary-download")
    });

    it("can display error message for spectrum download file when errored", async () => {
        const store = createStore({}, vi.fn(), {}, {
            spectrum: mockDownloadResultsDependency({
                preparing: false,
                complete: true,
                error,
                downloadId: "123"
            })
        });

        rendersReportDownloadErrors(store, "#spectrum-download")
    });

    it("can display error message for summary download file when errored", async () => {
        const store = createStore({}, vi.fn(), {}, {
            coarseOutput: mockDownloadResultsDependency({
                preparing: false,
                complete: true,
                error,
                downloadId: "123"
            })
        });

        rendersReportDownloadErrors(store, "#coarse-output-download")
    });

    it("cannot download AGYW output while preparing", async () => {
        const store = createStore({}, vi.fn(), {}, {
            agyw: mockDownloadResultsDependency({
                preparing: true,
                downloadId: "1"
            })
        });

        const wrapper = mount(DownloadResults,
            {
                global: {
                    plugins: [store],
                    stubs: ["upload-modal"],
                },
                data() {
                    return {
                        agywSwitch: true
                    }
                }
            });

        const button = wrapper.find("#agyw-download").find("button")
        expect(button.attributes().disabled).toBe("");
    });

    it("cannot download AGYW output if downloadId does not exist", async () => {
        const store = createStore();
        const wrapper = mount(DownloadResults,
            {
                global: {
                    plugins: [store],
                    stubs: ["upload-modal"],
                },
                data() {
                    return {
                        agywSwitch: true
                    }
                }
            });

        const button = wrapper.find("#agyw-download").find("button")
        expect(button.attributes().disabled).toBe("");
    });

    it("can download AGYW file once prepared", async () => {
        const store = createStore({}, vi.fn(), {}, {
            agyw: mockDownloadResultsDependency({
                preparing: false,
                complete: true,
                error: null,
                downloadId: "123"
            })
        });
        const wrapper = mount(DownloadResults,
            {
                global: {
                    plugins: [store],
                    stubs: ["upload-modal"],
                },
                data() {
                    return {
                        agywSwitch: true
                    }
                }
            });
        const button = wrapper.find("#agyw-download").find("button");
        expect(button.attributes().disabled).toBeUndefined();
        await button.trigger("click")
        expect(mockDownloadAgywTool).toHaveBeenCalledTimes(1)
    });

    it("can display error message for agyw download file when errored", async () => {
        const error = {error: "ERR", detail: "agyw error"}
        const store = createStore({}, vi.fn(), {}, {
            agyw: mockDownloadResultsDependency({
                preparing: false,
                complete: true,
                error,
                downloadId: "123"
            })
        });
        const wrapper = mount(DownloadResults,
            {
                global: {
                    plugins: [store],
                    stubs: ["upload-modal"],
                },
                data() {
                    return {
                        agywSwitch: true
                    }
                }
            });
        const agywWrapper = wrapper.find("#agyw-download");
        const button = agywWrapper.find("button");
        expect(button.attributes().disabled).toBeUndefined();
        expect(agywWrapper.findComponent(ErrorAlert).props("error")).toEqual(error)
    });
});

const rendersReportDownloadErrors = (store: Store<RootState>, downloadType: string) => {
    const error = {error: "ERR", detail: "download report error"}
    const wrapper = mount(DownloadResults,
        {
            global: {
                plugins: [store],
                stubs: ["upload-modal"]
            }
        });
    const downloadComponent = wrapper.find(downloadType);
    const button = downloadComponent.find("button");
    expect(button.attributes().disabled).toBeUndefined();
    expect(downloadComponent.findComponent(ErrorAlert).exists()).toBeTruthy()
    expect(downloadComponent.findComponent(ErrorAlert).props("error")).toEqual(error)
}
