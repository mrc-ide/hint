import {shallowMount, mount, VueWrapper} from '@vue/test-utils';
import Vuex, {Store} from 'vuex';
import {
    mockADRState,
    mockADRUploadState, mockDownloadResultsDependency,
    mockDownloadResultsState,
    mockModelCalibrateState
} from "../../mocks";
import DownloadResults from "../../../app/components/downloadResults/DownloadResults.vue";
import registerTranslations from "../../../app/store/translations/registerTranslations";
import {emptyState, RootState} from "../../../app/root";
import {expectTranslated} from "../../testHelpers";
import UploadModal from "../../../app/components/downloadResults/UploadModal.vue";
import {DownloadResultsState} from "../../../app/store/downloadResults/downloadResults";
import Download from "../../../app/components/downloadResults/Download.vue";
import {ADRState} from "../../../app/store/adr/adr";
import {ADRUploadState} from "../../../app/store/adrUpload/adrUpload";
import ErrorAlert from "../../../app/components/ErrorAlert.vue";

describe("Download Results component", () => {

    const error = {error: "ERR", detail: "download report error"}

    const mockPrepareOutputs = jest.fn();
    const mockDownloadComparisonReport = jest.fn()
    const mockDownloadSpectrumReport = jest.fn()
    const mockDownloadCoarseReport = jest.fn()
    const mockDownloadSummaryReport = jest.fn()

    afterEach(() => {
        jest.useRealTimers();
        jest.resetAllMocks();
    })

    const createStore = (adr: Partial<ADRState> = {userCanUpload: true},
                         getUserCanUpload = jest.fn(),
                         adrUploadState: Partial<ADRUploadState> = {},
                         downloadResults?: Partial<DownloadResultsState>,
                         clearStatus = jest.fn()) => {
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
                        getUploadFiles: jest.fn()
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
                        downloadCoarseOutput: mockDownloadCoarseReport
                    }
                }
            }
        });
        registerTranslations(store);
        return store;
    };

    it("renders as expected", () => {
        const store = createStore();
        const wrapper = mount(DownloadResults,
            {
                store, stubs: ["upload-modal"],
                data() {
                    return {
                        comparisonSwitch: true
                    }
                }
            });

        const headers = wrapper.findAllComponents("h4");
        expectTranslated(headers[0], "Export model outputs for Spectrum",
            "Exporter des sorties de modèles pour Spectrum", "Exportação de saídas modelo para Spectrum", store);
        expectTranslated(headers[1], "Download coarse age group outputs",
            "Télécharger les résultats grossiers du groupe d'âge",
            "Descarregar resultados de grupos etários grosseiros", store);
        expectTranslated(headers[2], "Download summary report",
            "Télécharger le rapport de synthèse", "Descarregar relatório de síntese", store);
        expectTranslated(headers[3], "Download comparison report",
            "Télécharger le rapport de comparaison", "Baixar relatório de comparação", store);
        expectTranslated(headers[4], "Upload to ADR",
            "Télécharger vers ADR", "Carregar para o ADR", store);

        const buttons = wrapper.findAllComponents("button");
        expect(buttons.length).toBe(5);
        expectTranslated(buttons[0], "Export", "Exporter", "Exportação", store);
        expectTranslated(buttons[1], "Download", "Télécharger", "Descarregar", store);
        expectTranslated(buttons[2], "Download", "Télécharger", "Descarregar", store);
        expectTranslated(buttons[3], "Download", "Télécharger", "Descarregar", store);
        expectTranslated(buttons[4], "Upload", "Télécharger", "Carregar", store);
    });

    it(`renders, opens and closes dialog as expected`, async () => {
        const store = createStore();
        const wrapper = mount(DownloadResults,
            {
                store,
                stubs: ["upload-modal"],
                data() {
                    return {
                        uploadModalOpen: false
                    }
                }
            });

        expect(wrapper.findComponent(UploadModal).exists()).toBe(false)
        expect(wrapper.vm.$data.uploadModalOpen).toBe(false)

        const upload = wrapper.findComponent("#upload").findComponent("button")
        await upload.trigger("click")
        expect(wrapper.findComponent(UploadModal).exists()).toBe(true)
        expect(wrapper.vm.$data.uploadModalOpen).toBe(true)

        const modal = wrapper.findComponent(UploadModal)
        await modal.vm.$emit("close")
        expect(modal.emitted().close.length).toBe(1)
        expect(wrapper.vm.$data.uploadModalOpen).toBe(false)
    })

    it("invokes getUserCanUpload on mounted", async () => {
        const mockGetUserCanUpload = jest.fn();
        const store = createStore({userCanUpload: true}, mockGetUserCanUpload);
        shallowMount(DownloadResults, {store});
        expect(mockGetUserCanUpload.mock.calls.length).toBe(1);
    });

    it("does not display upload button when a user does not have permission", async () => {
        const store = createStore({userCanUpload: false});
        const wrapper = mount(DownloadResults,
            {
                store, stubs: ["upload-modal"],
                data() {
                    return {
                        comparisonSwitch: true
                    }
                }
            });
        const headers = wrapper.findAllComponents("h4");
        expect(headers.length).toBe(4)
    });

    it("does not render status messages or error alerts without appropriate states", () => {
        const store = createStore({userCanUpload: true}, jest.fn());
        const wrapper = shallowMount(DownloadResults, {store});

        expect(wrapper.findComponent("#uploading").exists()).toBe(false);
        expect(wrapper.findComponent("#uploadComplete").exists()).toBe(false);
        expect(wrapper.findComponent("error-alert-stub").exists()).toBe(false);
    });

    it("renders uploading status messages as expected and disables upload button", () => {
        const store = createStore({userCanUpload: true}, jest.fn(), {uploading: true});
        const wrapper = shallowMount(DownloadResults, {store});

        const statusMessage = wrapper.findComponent("#uploading");
        expect(statusMessage.findComponent("loading-spinner-stub").exists()).toBe(true)
        expectTranslated(statusMessage.findComponent("span"), "Uploading 1 of 2 (this may take a while)",
            "Téléchargement de 1 sur 2 (cela peut prendre un certain temps)",
            "A carregar 1 de 2 (este processo poderá demorar um pouco)", store);

        const uploadButton = wrapper.findComponent("#upload").findComponent("button");
        expect(uploadButton.attributes("disabled")).toBe("disabled")
    });

    it("renders upload complete and release created status messages as expected", () => {
        const store = createStore({userCanUpload: true}, jest.fn(), {uploadComplete: true, releaseCreated: true});
        const wrapper = shallowMount(DownloadResults, {store});

        const statusMessage = wrapper.findComponent("#uploadComplete");
        expectTranslated(statusMessage.findComponent("span"), "Upload complete",
            "Téléchargement complet", "Carregamento concluído", store);
        expect(statusMessage.findComponent("tick-stub").exists()).toBe(true)

        const statusMessage2 = wrapper.findComponent("#releaseCreated");
        expectTranslated(statusMessage2.findComponent("span"), "Release created",
            "Version créée", "Lançamento criado", store);
        expect(statusMessage2.findComponent("tick-stub").exists()).toBe(true)

        const uploadButton = wrapper.findComponent("button");
        expect(uploadButton.attributes("disabled")).toBeUndefined();
    });

    it("renders release not created status messages as expected", () => {
        const store = createStore({userCanUpload: true}, jest.fn(), {uploadComplete: true, releaseFailed: true});
        const wrapper = shallowMount(DownloadResults, {store});

        const statusMessage = wrapper.findComponent("#releaseCreated");
        expectTranslated(statusMessage.findComponent("span"), "Could not create new release",
            "Impossible de créer une nouvelle version", "Não foi possível criar um novo lançamento", store);
        expect(statusMessage.findComponent("cross-stub").exists()).toBe(true)

        const uploadButton = wrapper.findComponent("button");
        expect(uploadButton.attributes("disabled")).toBeUndefined();
    });

    it("renders upload error alert as expected", () => {
        const error = {error: "ERR", detail: "there was an error"}
        const store = createStore({userCanUpload: true}, jest.fn(), {uploadError: error});
        const wrapper = shallowMount(DownloadResults, {store});

        const errorAlert = wrapper.findComponent("error-alert-stub");
        expect((errorAlert as VueWrapper).props("error")).toEqual(error)

        const uploadButton = wrapper.findComponent("button");
        expect(uploadButton.attributes("disabled")).toBeUndefined();
        expect(uploadButton.classes()).toEqual(["btn", "btn-lg", "my-3", "btn-red"]);
    });

    it("disables upload button when upload in progress", () => {
        const store = createStore({userCanUpload: true}, jest.fn(), {uploading: true});
        const wrapper = shallowMount(DownloadResults, {store});

        const uploadButton = wrapper.findComponent("button");
        expect(uploadButton.attributes("disabled")).toBe("disabled");
        expect(uploadButton.classes()).toEqual(["btn", "btn-lg", "my-3", "btn-secondary"]);
    });

    it("disables download buttons when upload in progress", () => {
        const store = createStore({userCanUpload: true}, jest.fn(), {uploading: true});
        const wrapper = shallowMount(DownloadResults, {
            store,
            data() {
                return {
                    comparisonSwitch: true
                }
            }
        });

        const downloadButtons = wrapper.findAllComponents(Download);
        expect(downloadButtons.length).toBe(4)
        expect(downloadButtons[0].props("disabled")).toBe(true)
        expect(downloadButtons[1].props("disabled")).toBe(true)
        expect(downloadButtons[2].props("disabled")).toBe(true)
        expect(downloadButtons[3].props("disabled")).toBe(true)
    });

    it("calls prepareOutputs on mount", () => {
        const store = createStore();
        shallowMount(DownloadResults, {store});
        expect(mockPrepareOutputs.mock.calls.length).toBe(1);
    });

    it("cannot download spectrum output while preparing", async () => {
        const store = createStore({}, jest.fn(), {}, {
            spectrum: mockDownloadResultsDependency({
                preparing: true,
                downloadId: "1"
            })
        });
        const wrapper = mount(DownloadResults, {store, stubs: ["upload-modal"]});

        const button = wrapper.findComponent("#spectrum-download").findComponent("button")
        expect(button.attributes().disabled).toBe("disabled");
    });

    it("cannot download spectrum output if downloadId does not exist", async () => {
        const store = createStore();
        const wrapper = mount(DownloadResults, {store, stubs: ["upload-modal"]});

        const button = wrapper.findComponent("#spectrum-download").findComponent("button")
        expect(button.attributes().disabled).toBe("disabled");
    });

    it("can download spectrum file once prepared", () => {
        const store = createStore({}, jest.fn(), {}, {
            spectrum: mockDownloadResultsDependency({
                preparing: false,
                complete: true,
                error: null,
                downloadId: "123"
            })
        });
        const wrapper = mount(DownloadResults, {store, stubs: ["upload-modal"]});
        const button = wrapper.findComponent("#spectrum-download").findComponent("button");
        expect(button.attributes().disabled).toBeUndefined();
        button.trigger("click");
        expect(mockDownloadSpectrumReport).toHaveBeenCalled()
    });

    it("cannot download summary report while preparing", () => {
        const store = createStore({}, jest.fn(), {}, {
            summary: mockDownloadResultsDependency({
                preparing: true,
                downloadId: "1"
            })
        });
        const wrapper = mount(DownloadResults, {store, stubs: ["upload-modal"]});

        const button = wrapper.findComponent("#summary-download").findComponent("button")
        expect(button.attributes().disabled).toBe("disabled");
    });

    it("cannot download summary report if downloadId does not exist", async () => {
        const store = createStore();
        const wrapper = mount(DownloadResults, {store, stubs: ["upload-modal"]});

        const button = wrapper.findComponent("#summary-download").findComponent("button")
        expect(button.attributes().disabled).toBe("disabled");
    });

    it("can download summary report once prepared", () => {
        const store = createStore({}, jest.fn(), {}, {
            summary: mockDownloadResultsDependency({
                preparing: false,
                complete: true,
                error: null,
                downloadId: "123"
            })
        });
        const wrapper = mount(DownloadResults, {store, stubs: ["upload-modal"]});
        const button = wrapper.findComponent("#summary-download").findComponent("button");
        expect(button.attributes().disabled).toBeUndefined();
        button.trigger("click");
        expect(mockDownloadSummaryReport).toHaveBeenCalled()
    });

    it("cannot download coarse output while preparing", () => {
        const store = createStore({}, jest.fn(), {}, {
            coarseOutput: mockDownloadResultsDependency({
                preparing: true,
                downloadId: "1"
            })
        });
        const wrapper = mount(DownloadResults, {store, stubs: ["upload-modal"]});

        const button = wrapper.findComponent("#coarse-output-download").findComponent("button")
        expect(button.attributes().disabled).toBe("disabled");
    });

    it("cannot download coarse output if downloadId does not exist", async () => {
        const store = createStore();
        const wrapper = mount(DownloadResults, {store, stubs: ["upload-modal"]});

        const button = wrapper.findComponent("#coarse-output-download").findComponent("button")
        expect(button.attributes().disabled).toBe("disabled");
    });

    it("can download coarseOutput file once prepared", () => {
        const store = createStore({}, jest.fn(), {}, {
            coarseOutput: mockDownloadResultsDependency({
                preparing: false,
                complete: true,
                error: null,
                downloadId: "123"
            })
        });
        const wrapper = mount(DownloadResults, {store, stubs: ["upload-modal"]});
        const button = wrapper.findComponent("#coarse-output-download").findComponent("button");
        expect(button.attributes().disabled).toBeUndefined();
        button.trigger("click");
        expect(mockDownloadCoarseReport).toHaveBeenCalled()
    });

    it("cannot download comparison output while preparing", async () => {
        const store = createStore({}, jest.fn(), {}, {
            comparison: mockDownloadResultsDependency({
                preparing: true,
                downloadId: "1"
            })
        });

        const wrapper = mount(DownloadResults,
            {
                store, stubs: ["upload-modal"],
                data() {
                    return {
                        comparisonSwitch: true
                    }
                }
            });

        const button = wrapper.findComponent("#comparison-download").findComponent("button")
        expect(button.attributes().disabled).toBe("disabled");
    });

    it("cannot download comparison output if downloadId does not exist", async () => {
        const store = createStore();
        const wrapper = mount(DownloadResults,
            {
                store, stubs: ["upload-modal"],
                data() {
                    return {
                        comparisonSwitch: true
                    }
                }
            });

        const button = wrapper.findComponent("#comparison-download").findComponent("button")
        expect(button.attributes().disabled).toBe("disabled");
    });

    it("can download comparison file once prepared", async () => {
        const store = createStore({}, jest.fn(), {}, {
            comparison: mockDownloadResultsDependency({
                preparing: false,
                complete: true,
                error: null,
                downloadId: "123"
            })
        });
        const wrapper = mount(DownloadResults,
            {
                store, stubs: ["upload-modal"],
                data() {
                    return {
                        comparisonSwitch: true
                    }
                }
            });
        const button = wrapper.findComponent("#comparison-download").findComponent("button");
        expect(button.attributes().disabled).toBeUndefined();
        await button.trigger("click")
        expect(mockDownloadComparisonReport).toHaveBeenCalledTimes(1)
    });

    it("can display error message for comparison download file when errored", async () => {
        const error = {error: "ERR", detail: "comparison error"}
        const store = createStore({}, jest.fn(), {}, {
            comparison: mockDownloadResultsDependency({
                preparing: false,
                complete: true,
                error,
                downloadId: "123"
            })
        });
        const wrapper = mount(DownloadResults,
            {
                store, stubs: ["upload-modal"],
                data() {
                    return {
                        comparisonSwitch: true
                    }
                }
            });
        const comparisonWrapper = wrapper.findComponent("#comparison-download");
        const button = comparisonWrapper.findComponent("#comparison-download").findComponent("button");
        expect(button.attributes().disabled).toBeUndefined();
        expect(comparisonWrapper.findComponent(ErrorAlert).props("error")).toEqual(error)
    });

    it("calls clear status mutation before mount", () => {
        const spy = jest.fn()
        const store = createStore({}, jest.fn(), {}, {}, spy);
        shallowMount(DownloadResults, {store});
        expect(spy).toHaveBeenCalledTimes(1)
    });

    it("can display error message for summary download file when errored", async () => {
        const store = createStore({}, jest.fn(), {}, {
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
        const store = createStore({}, jest.fn(), {}, {
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
        const store = createStore({}, jest.fn(), {}, {
            coarseOutput: mockDownloadResultsDependency({
                preparing: false,
                complete: true,
                error,
                downloadId: "123"
            })
        });

        rendersReportDownloadErrors(store, "#coarse-output-download")
    });
});

const rendersReportDownloadErrors = (store: Store<RootState>, downloadType: string) => {
    const error = {error: "ERR", detail: "download report error"}
    const wrapper = mount(DownloadResults,
        {
            store, stubs: ["upload-modal"]
        });
    const downloadComponent = wrapper.findComponent(downloadType);
    const button = downloadComponent.findComponent(downloadType).findComponent("button");
    expect(button.attributes().disabled).toBeUndefined();
    expect(downloadComponent.findComponent(ErrorAlert).exists()).toBeTruthy()
    expect(downloadComponent.findComponent(ErrorAlert).props("error")).toEqual(error)
}
