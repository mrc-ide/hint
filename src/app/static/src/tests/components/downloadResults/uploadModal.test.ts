import VueFeather from 'vue-feather';
import {mount} from "@vue/test-utils";
import UploadModal from "../../../app/components/downloadResults/UploadModal.vue";
import Vuex from "vuex";
import {emptyState} from "../../../app/root";
import {
    mockADRState,
    mockADRUploadState,
    mockBaselineState,
    mockDatasetResource,
    mockDownloadResultsDependency,
    mockDownloadResultsState,
    mockError,
    mockMetadataState
} from "../../mocks";
import registerTranslations from "../../../app/store/translations/registerTranslations";
import {expectTranslated, mountWithTranslate} from "../../testHelpers";
import {nextTick} from 'vue';
import {Dict} from "../../../app/types";
import {Language} from "../../../app/store/translations/locales";
import {DownloadResultsState} from "../../../app/store/downloadResults/downloadResults";
import {MetadataState} from "../../../app/store/metadata/metadata";

describe(`uploadModal `, () => {

    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.resetAllMocks()
        vi.useRealTimers()
    });

    const fakeMetadata = {
        outputZip:
            {
                index: 1,
                displayName: "uploadFileOutputZip",
                resourceType: "outputZip",
                resourceFilename: "naomi-model-outputs-project1.zip",
                resourceId: null,
                resourceUrl: null,
                lastModified: null,
                resourceName: "Naomi Output Zip"
            },
        outputSummary:
            {
                index: 2,
                displayName: "uploadFileOutputSummary",
                resourceType: "outputSummary",
                resourceFilename: "string",
                resourceId: "value",
                resourceUrl: null,
                lastModified: "2021-01-25T06:34:12.375649",
                resourceName: "Naomi Output Zip"
            },
        outputComparison:
            {
                index: 3,
                displayName: "uploadFileOutputComparison",
                resourceType: "outputComparison",
                resourceFilename: "string",
                resourceId: null,
                resourceUrl: null,
                lastModified: null,
                resourceName: "Naomi Output Comparison"
            }
    }

    const metadataWithInput = {
        ...fakeMetadata,
        population: {
            index: 4,
            displayName: "population",
            resourceType: "inputs-unaids-population",
            resourceFilename: "naomi-model-outputs-population.zip",
            resourceId: "123",
            resourceUrl: null,
            lastModified: "2021-06-01",
            resourceName: "TestPopulation"
        }
    };

    const mockResources = {
        pjnz: mockDatasetResource(),
        pop: mockDatasetResource(),
        program: mockDatasetResource(),
        anc: null,
        shape: null,
        survey: null,
        vmmc: null,
    }
    const mockOrganization = {
        id: "123abc"
    }

    const mockDownloadResults = {
        summary: mockDownloadResultsDependency({complete: false, preparing: false}),
        spectrum: mockDownloadResultsDependency({complete: false, preparing: false}),
        comparison: mockDownloadResultsDependency({complete: false, preparing: false})
    } as any

    const mockUploadFilesToADR = vi.fn();

    const createStore = (data: Dict<any> = fakeMetadata,
                         downloadResults: Partial<DownloadResultsState> = mockDownloadResults,
                         downloadMetadataError: Partial<MetadataState> = {}) => {
        const store = new Vuex.Store({
            state: emptyState(),
            modules: {
                baseline: {
                    namespaced: true,
                    state: mockBaselineState(
                        {
                            selectedDataset:
                                {
                                    id: "1",
                                    url: "example.com",
                                    title: "test title",
                                    resources: mockResources,
                                    organization: mockOrganization
                                }
                        })
                },
                adrUpload: {
                    namespaced: true,
                    state: mockADRUploadState({uploadFiles: data}),
                    actions: {
                        uploadFilesToADR: mockUploadFilesToADR
                    },
                    mutations: {
                        ADRUploadStarted: vi.fn()
                    }
                },
                adr: {
                    namespaced: true,
                    state: mockADRState({
                        schemas: {
                            outputSummary: "outputSummary",
                            outputZip: "outputZip",
                            outputComparison: "outputComparison"
                        } as any
                    })
                },
                downloadResults: {
                    namespaced: true,
                    state: mockDownloadResultsState(downloadResults)
                },
                metadata: {
                    namespaced: true,
                    state: mockMetadataState(downloadMetadataError)
                }
            }
        });
        registerTranslations(store);
        return store;
    };

    const getWrapper = (directives = {}) => {
        const store = createStore();
        return mountWithTranslate(UploadModal, store,
            {
                global: {
                    plugins: [store],
                    directives
                }
            })
    }

    it(`renders modal as expected`, async () => {
        const wrapper = getWrapper()
        const store = wrapper.vm.$store

        const dialog = wrapper.find("#dialog")
        expect(dialog.exists()).toBe(true)
        const text = dialog.find("h4")
        await nextTick()
        await expectTranslated(text, "Upload to ADR", "Télécharger vers ADR", "Carregar para o ADR", store)
    })

    it(`renders dataset name as expected`, async () => {
        const wrapper = getWrapper()
        const store = wrapper.vm.$store

        const dataset = wrapper.find("#dialog").find("#dataset-id")
        await expectTranslated(dataset, "Dataset:test title",
            "Base de données:test title", "Conjunto de dados:test title", store)
    })

    it(`renders radial options as expected`, async () => {
        const wrapper = getWrapper()
        const store = wrapper.vm.$store

        expect(wrapper.find("#createRelease").exists()).toBe(true)
        expect(wrapper.find("#uploadFiles").exists()).toBe(true)
        const labels = wrapper.findAll('label')
        await expectTranslated(labels[0], "Create a new ADR release (upload all files)",
            "Créer une nouvelle version ADR (télécharger tous les fichiers)", "Crie uma nova versão ADR (carregue todos os arquivos)", store)
        await expectTranslated(labels[1], "Upload specific files",
            "Télécharger des fichiers spécifiques", "Faça upload de arquivos específicos", store)
        const circleIcons = wrapper.findAllComponents(VueFeather)
        expect(circleIcons.length).toBe(2)
        expect(circleIcons[0].props("type")).toBe("help-circle")
        expect(circleIcons[1].props("type")).toBe("help-circle")
    })

    it("can render tooltips in English, French, and Portuguese", async () => {
        const mockTooltip = vi.fn();
        const wrapper = getWrapper({"tooltip": mockTooltip})

        expect(mockTooltip.mock.calls[0][1].value).toBe("Create a labelled version in the ADR dataset, to include all input and output files");
        expect(mockTooltip.mock.calls[1][1].value).toBe("Upload new versions of selected files without creating a release");

        const store = wrapper.vm.$store
        store.state.language = Language.fr;
        await nextTick();
        expect(mockTooltip.mock.calls[2][1].value).toBe("Créer une version étiquetée dans l'ensemble de données ADR, pour inclure tous les fichiers d'entrée et de sortie");
        expect(mockTooltip.mock.calls[3][1].value).toBe("Télécharger de nouvelles versions des fichiers sélectionnés sans créer de version");

        store.state.language = Language.pt;
        await nextTick();
        expect(mockTooltip.mock.calls[4][1].value).toBe("Crie uma versão rotulada no conjunto de dados ADR, para incluir todos os arquivos de entrada e saída");
        expect(mockTooltip.mock.calls[5][1].value).toBe("Faça upload de novas versões dos arquivos selecionados sem criar uma versão");
    });

    it(`renders Output files, inputs, and labels as expected`, async () => {
        const wrapper = getWrapper()
        const store = wrapper.vm.$store

        const inputs = wrapper.findAll("input[type='checkbox']")
        expect(inputs.length).toBe(3)
        expect((inputs[0].element as HTMLButtonElement).disabled).toBe(true);
        expect(inputs[0].attributes("id")).toBe("id-0-0");
        expect(inputs[1].attributes("id")).toBe("id-0-1");
        expect(inputs[2].attributes("id")).toBe("id-0-2");

        const label = wrapper.findAll("label.form-check-label")
        expect(label.length).toBe(3)
        expect(label[0].attributes("for")).toBe("id-0-0");
        expect(label[1].attributes("for")).toBe("id-0-1");
        expect(label[2].attributes("for")).toBe("id-0-2");

        await expectTranslated(label[0], "Model outputs", "Résultats du modèle", "Saídas modelo", store)
        await expectTranslated(label[1], "Summary report", "Rapport sommaire", "Relatório de síntese", store)
        await expectTranslated(label[2], "Comparison report", "Rapport de comparaison", "Relatório de comparação", store)
    })

    it(`checkboxes are set by default`, async () => {
        const store = createStore(metadataWithInput)
        const wrapper = mountWithTranslate(UploadModal, store, {
            global: {
                plugins: [store]
            }, 
        })
        const inputs = wrapper.findAll("input[type='checkbox']")
        expect(inputs.length).toBe(4)

        await nextTick();

        const input1 = inputs[0].element as HTMLInputElement
        expect(input1.checked).toBe(true)

        const input2 = inputs[1].element as HTMLInputElement
        expect(input2.checked).toBe(true)

        const input3 = inputs[2].element as HTMLInputElement
        expect(input3.checked).toBe(true)

        const input4 = inputs[3].element as HTMLInputElement
        expect(input4.checked).toBe(true)
    })

    it(`can check and get values from check boxes`, async () => {
        const wrapper = getWrapper()
        const radialInput = wrapper.find("#uploadFiles")
        await radialInput.trigger("click")
        const inputs = wrapper.findAll("input[type='checkbox']")
        expect(inputs.length).toBe(3)
        inputs[0].setValue(true)
        inputs[1].setValue(true)
        inputs[2].setValue(true)

        expect(wrapper.find("#dialog").exists()).toBe(true)
        expect((wrapper.vm.$data as any).uploadFilesToAdr).toMatchObject(["outputZip", "outputSummary", "outputComparison"])
    })

    it(`checkboxes are reset to default when switching back to create release`, async () => {
        const store = createStore({})
        const wrapper = mountWithTranslate(UploadModal, store, {
            global: {
                plugins: [store]
            }, 
        })
        store.state.adrUpload.uploadFiles = metadataWithInput
        await nextTick()
        const radialInput = wrapper.find("#uploadFiles")
        await radialInput.trigger("change")
        const inputs = wrapper.findAll("input[type='checkbox']")
        inputs[0].setValue(false)
        inputs[1].setValue(false)
        inputs[2].setValue(false)
        const input1 = inputs[0].element as HTMLInputElement
        expect(input1.checked).toBe(false)
        const input2 = inputs[1].element as HTMLInputElement
        expect(input2.checked).toBe(false)
        const input3 = inputs[2].element as HTMLInputElement
        expect(input3.checked).toBe(false)
        const radialInput2 = wrapper.find("#createRelease")
        await radialInput2.trigger("change")
        expect(input1.checked).toBe(true)
        expect(input2.checked).toBe(true)
        expect(input3.checked).toBe(true)
    })

    it(`can trigger close modal as expected`, async () => {
        const store = createStore();
        const wrapper = mountWithTranslate(UploadModal, store, {
            global: {
                plugins: [store]
            }, 
        })

        const modal = wrapper.find(".modal");
        expect(modal.classes()).toContain("show");

        const buttons = modal.find(".modal-footer").findAll("button");
        await buttons[1].trigger("click")
        expect(wrapper.emitted("close")!?.length).toBe(1)
    })

    it(`can send upload files to ADR when download status is complete`, async () => {
        const downloadResults = {
            summary: mockDownloadResultsDependency({complete: true, preparing: false}),
            spectrum: mockDownloadResultsDependency({complete: true, preparing: false})
        }
        const store = createStore(fakeMetadata, downloadResults)
        const wrapper = mountWithTranslate(UploadModal, store, {
            global: {
                plugins: [store]
            }, 
        })

        await wrapper.setProps({open: true})
        const modal = wrapper.find(".modal");
        expect(modal.classes()).toContain("show");

        const okBtn = modal.find("button.btn-red");
        expect(okBtn.attributes().disabled).toBeUndefined();
        await okBtn.trigger("click");
        expect(mockUploadFilesToADR.mock.calls.length).toBe(1);
    });

    it(`can set createRelease and upload files in uploadFilesToAdrAction`, async () => {
        const downloadResults = {
            summary: mockDownloadResultsDependency({complete: true, preparing: false}),
            spectrum: mockDownloadResultsDependency({complete: true, preparing: false}),
            comparison: mockDownloadResultsDependency({complete: true, preparing: false}),
            coarseOutput: mockDownloadResultsDependency()
        }
        const store = createStore(metadataWithInput, downloadResults)
        const wrapper = mountWithTranslate(UploadModal, store, {
            global: {
                plugins: [store]
            }, 
        })

        const modal = wrapper.find(".modal");
        store.state.adrUpload.uploadFiles = {...metadataWithInput};
        await nextTick();
        const okBtn = modal.find("button.btn-red");
        await okBtn.trigger("click");

        await nextTick()
        expect((wrapper.vm.$data as any).choiceUpload).toBe("createRelease")
        expect(mockUploadFilesToADR.mock.calls.length).toBe(1)
        const num = mockUploadFilesToADR.mock.calls[0].length - 1
        expect(mockUploadFilesToADR.mock.calls[0][num]["uploadFiles"]).toStrictEqual(
            [fakeMetadata["outputZip"],
                fakeMetadata["outputSummary"],
                fakeMetadata["outputComparison"],
                metadataWithInput["population"]]
        )
        expect(mockUploadFilesToADR.mock.calls[0][num]["createRelease"]).toBe(true)
    });

    it(`can set upload files in uploadFilesToAdrAction and not set createRelease`, async () => {
        const downloadResults = {
            summary: mockDownloadResultsDependency({complete: true, preparing: false}),
            spectrum: mockDownloadResultsDependency({complete: true, preparing: false}),
            coarseOutput: mockDownloadResultsDependency()
        }
        const store = createStore(metadataWithInput, downloadResults)
        const wrapper = mountWithTranslate(UploadModal, store, {
            global: {
                plugins: [store]
            }, 
        })

        const modal = wrapper.find(".modal");
        store.state.adrUpload.uploadFiles = {...metadataWithInput};
        await nextTick();
        const radialInput = wrapper.find("#uploadFiles")
        await radialInput.trigger("change")
        const okBtn = modal.find("button.btn-red");
        await okBtn.trigger("click");

        await nextTick()
        expect((wrapper.vm.$data as any).choiceUpload).toBe("uploadFiles")
        expect(mockUploadFilesToADR.mock.calls.length).toBe(1)
        const num = mockUploadFilesToADR.mock.calls[0].length - 1
        expect(mockUploadFilesToADR.mock.calls[0][num]["uploadFiles"]).toStrictEqual(
            [fakeMetadata["outputZip"],
                fakeMetadata["outputSummary"],
                fakeMetadata["outputComparison"],
                metadataWithInput["population"]]
        )
        expect(mockUploadFilesToADR.mock.calls[0][num]["createRelease"]).toBe(false)
    });

    it(`can remove some upload files from uploadFilesToAdrAction`, async () => {
        const downloadResults = {
            summary: mockDownloadResultsDependency({complete: true, preparing: false}),
            spectrum: mockDownloadResultsDependency({complete: true, preparing: false}),
            comparison: mockDownloadResultsDependency({complete: true, preparing: false}),
            coarseOutput: mockDownloadResultsDependency()
        }
        const store = createStore(metadataWithInput, downloadResults)
        const wrapper = mountWithTranslate(UploadModal, store, {
            global: {
                plugins: [store]
            }, 
        })

        const modal = wrapper.find(".modal");
        store.state.adrUpload.uploadFiles = {...metadataWithInput};
        await nextTick();
        const radialInput = wrapper.find("#uploadFiles")
        await radialInput.trigger("change")

        const checkInputs = wrapper.findAll("input[type='checkbox']")
        await checkInputs[1].setValue(false)
        await checkInputs[2].setValue(false)
        await checkInputs[3].setValue(false)
        const okBtn = modal.find("button.btn-red");
        await okBtn.trigger("click");

        await nextTick()
        expect((wrapper.vm.$data as any).choiceUpload).toBe("uploadFiles")
        expect(mockUploadFilesToADR.mock.calls.length).toBe(1)
        const num = mockUploadFilesToADR.mock.calls[0].length - 1
        expect(mockUploadFilesToADR.mock.calls[0][num]["uploadFiles"]).toStrictEqual([fakeMetadata["outputZip"]])
        expect(mockUploadFilesToADR.mock.calls[0][num]["createRelease"]).toBe(false)
    });

    it(`ok button is enabled when inputs are set and triggers close modal`, async () => {
        const downloadResults = {
            summary: mockDownloadResultsDependency({complete: true}),
            spectrum: mockDownloadResultsDependency({complete: true}),
            comparison: mockDownloadResultsDependency({complete: true})
        }
        const store = createStore(fakeMetadata, downloadResults);
        const wrapper = mountWithTranslate(UploadModal, store, {
            global: {
                plugins: [store]
            }
        })

        const radialInput = wrapper.find("#uploadFiles")
        await radialInput.trigger("click")

        const okBtn = wrapper.find("button");

        const inputs = wrapper.findAll("input[type='checkbox']")
        expect(inputs.length).toBe(3)

        expect((okBtn.element as HTMLButtonElement).disabled).toBe(false);
        expect(okBtn.text()).toBe("OK")
        await okBtn.trigger("click")
        expect(wrapper.emitted("close")!?.length).toBe(1)
    });

    it("does not render file section header when no input files", () => {
        const store = createStore();
        const wrapper = mountWithTranslate(UploadModal, store, {
            global: {
                plugins: [store]
            }, 
        });
        expect(wrapper.find("h5").exists()).toBe(false);
    });

    it("renders file section headers when there are input files", async () => {
        const store = createStore(metadataWithInput);
        const wrapper = mountWithTranslate(UploadModal, store, {
            global: {
                plugins: [store]
            }, 
        });
        const headers = wrapper.findAll("h5");
        expect(headers.length).toBe(2);
        await expectTranslated(headers[0], "Output Files", "Fichiers de sortie", "Ficheiros de saída", store);
        await expectTranslated(headers[1], "Input Files", "Fichiers d'entrée", "Ficheiros de entrada", store);
    });

    it("renders input controls as expected when there are input files", () => {
        const store = createStore(metadataWithInput);
        const wrapper = mountWithTranslate(UploadModal, store, {
            global: {
                plugins: [store]
            }, 
        });

        const inputs = wrapper.findAll("input[type='checkbox']");
        expect(inputs.length).toBe(4);
        expect(inputs[0].attributes("id")).toBe("id-0-0");
        expect(inputs[0].attributes("value")).toBe("outputZip");
        expect(inputs[1].attributes("id")).toBe("id-0-1");
        expect(inputs[1].attributes("value")).toBe("outputSummary");
        expect(inputs[2].attributes("id")).toBe("id-0-2");
        expect(inputs[2].attributes("value")).toBe("outputComparison");
        expect(inputs[3].attributes("id")).toBe("id-1-0");
        expect(inputs[3].attributes("value")).toBe("population");

        const labels = wrapper.findAll("label.form-check-label");
        expect(labels.length).toBe(4);
        expect(labels[0].attributes("for")).toBe("id-0-0");
        expect(labels[1].attributes("for")).toBe("id-0-1");
        expect(labels[2].attributes("for")).toBe("id-0-2");
        expect(labels[3].attributes("for")).toBe("id-1-0");
    });

    it(`ok button is disabled if there are no uploadable files`, async () => {
        const store = createStore({});
        const wrapper = mountWithTranslate(UploadModal, store, {
            global: {
                plugins: [store]
            }, 
        })

        const btn = wrapper.findAll("button");
        expect((btn[0].element as HTMLButtonElement).disabled).toBe(true);
    });

    it(`ok button is enabled when there are uploadable files`, async () => {
        const wrapper = mount(UploadModal,
            {
                global: {
                    plugins: [createStore(fakeMetadata)]
                }
            })
        await nextTick();
        const btn = wrapper.findAll("button");
        expect((btn[0].element as HTMLButtonElement).disabled).toBe(false);
    });

    it(`does not render output files and headers when not available for upload`, async () => {
        const downloadResults = {
            summary: mockDownloadResultsDependency({complete: true, preparing: false, error: mockError()}),
            spectrum: mockDownloadResultsDependency({complete: true, preparing: false, error: mockError()}),
            comparison: mockDownloadResultsDependency({complete: true, preparing: false, error: mockError()})
        }
        const store = createStore(metadataWithInput, downloadResults)
        const wrapper = mountWithTranslate(UploadModal, store, {
            global: {
                plugins: [store]
            }, 
        })
        await nextTick();
        const inputs = wrapper.findAll("input[type='checkbox']")
        expect(inputs.length).toBe(1)
        expect((inputs[0].element as HTMLButtonElement).disabled).toBe(false)
        expect(inputs[0].attributes("id")).toBe("id-1-0");
        expect(inputs[0].attributes("value")).toBe("population");

        const headers = wrapper.findAll("h5");
        expect(headers.length).toBe(2);
        expect(headers[0].text()).toBe("")
        await expectTranslated(headers[1], "Input Files", "Fichiers d'entrée", "Ficheiros de entrada", store);
    })

    it(`does not render output files and headers when metadata request failed`, async () => {
        const downloadResults = {
            summary: mockDownloadResultsDependency(
                {
                    complete: true,
                    preparing: false,
                    metadataError: mockError("META FAILED")
                }),

            spectrum: mockDownloadResultsDependency(
                {
                    complete: true,
                    preparing: false,
                    metadataError: mockError("META FAILED")
                }),
            comparison: mockDownloadResultsDependency(
                {
                    complete: true,
                    preparing: false,
                    metadataError: mockError("META FAILED")
                })
        }
        const store = createStore(metadataWithInput, downloadResults)
        const wrapper = mountWithTranslate(UploadModal, store, {
            global: {
                plugins: [store]
            }, 
        })
        await nextTick();
        const inputs = wrapper.findAll("input[type='checkbox']")
        expect(inputs.length).toBe(1)
        expect((inputs[0].element as HTMLButtonElement).disabled).toBe(false)
        expect(inputs[0].attributes("id")).toBe("id-1-0");
        expect(inputs[0].attributes("value")).toBe("population");

        const headers = wrapper.findAll("h5");
        expect(headers.length).toBe(2);
        expect(headers[0].text()).toBe("")
        await expectTranslated(headers[1],
            "Input Files",
            "Fichiers d'entrée",
            "Ficheiros de entrada",
            store);
        expect(wrapper.find("#output-file-error").classes()).toStrictEqual(["pt-3", "text-danger"]);
        await expectTranslated(wrapper.find("#output-file-error"),
            "Output files are not available for upload.",
            "Les fichiers de sortie ne sont pas disponibles pour le téléchargement.",
            "Os arquivos de saída não estão disponíveis para upload.",
            store)
    })

    it(`does not render summary report when summary metadata request failed`, async () => {
        const downloadResults = {
            summary: mockDownloadResultsDependency(
                {
                    complete: true,
                    preparing: false,
                    metadataError: mockError("META FAILED")
                }),

            spectrum: mockDownloadResultsDependency(
                {
                    complete: true,
                    preparing: false,
                }),
            comparison: mockDownloadResultsDependency(
                {
                    complete: true,
                    preparing: false
                })
        }
        const store = createStore(metadataWithInput, downloadResults)
        const wrapper = mountWithTranslate(UploadModal, store, {
            global: {
                plugins: [store]
            }, 
        })
        await nextTick();
        const inputs = wrapper.findAll("input[type='checkbox']")
        expect(inputs.length).toBe(3)
        expect((inputs[0].element as HTMLButtonElement).disabled).toBe(false)

        expect(inputs[0].attributes("id")).toBe("id-0-0");
        expect(inputs[0].attributes("value")).toBe("outputZip");

        expect(inputs[1].attributes("id")).toBe("id-0-1");
        expect(inputs[1].attributes("value")).toBe("outputComparison");

        expect(inputs[2].attributes("id")).toBe("id-1-0");
        expect(inputs[2].attributes("value")).toBe("population");

        const headers = wrapper.findAll("h5");

        expect(headers.length).toBe(2);
        expect(headers[0].text()).toBe("Output Files")
        expect(headers[1].text()).toBe("Input Files")

        expect(wrapper.find("#output-file-error").classes()).toStrictEqual(["pt-3", "text-danger"]);
        const outputError = wrapper.find("#output-file-error");
        await expectTranslated(outputError,
            "Summary output file is not available for upload.",
            "Le fichier de sortie résumé n'est pas disponible pour le téléchargement",
            "O arquivo de saída do resumo não está disponível para upload",
            store)
    })

    it(`does not render spectrum report when spectrum metadata request failed`, async () => {
        const downloadResults = {
            summary: mockDownloadResultsDependency(
                {
                    complete: true,
                    preparing: false
                }),

            spectrum: mockDownloadResultsDependency(
                {
                    complete: true,
                    preparing: false,
                    metadataError: mockError("META FAILED")
                }),
            comparison: mockDownloadResultsDependency(
                {
                    complete: true,
                    preparing: false
                })
        }
        const store = createStore(metadataWithInput, downloadResults)
        const wrapper = mountWithTranslate(UploadModal, store, {
            global: {
                plugins: [store]
            }, 
        })
        await nextTick();
        const inputs = wrapper.findAll("input[type='checkbox']")
        expect(inputs.length).toBe(3)
        expect((inputs[0].element as HTMLButtonElement).disabled).toBe(false)

        expect(inputs[0].attributes("id")).toBe("id-0-0");
        expect(inputs[0].attributes("value")).toBe("outputSummary");

        expect(inputs[1].attributes("id")).toBe("id-0-1");
        expect(inputs[1].attributes("value")).toBe("outputComparison");

        expect(inputs[2].attributes("id")).toBe("id-1-0");
        expect(inputs[2].attributes("value")).toBe("population");

        const headers = wrapper.findAll("h5");

        expect(headers.length).toBe(2);
        expect(headers[0].text()).toBe("Output Files")
        expect(headers[1].text()).toBe("Input Files")

        expect(wrapper.find("#output-file-error").classes()).toStrictEqual(["pt-3", "text-danger"]);
        await expectTranslated(wrapper.find("#output-file-error"),
            "Spectrum output file is not available for upload.",
            "Le fichier de sortie spectre n'est pas disponible pour le téléchargement",
            "O arquivo de saída do espectro não está disponível para upload",
            store)
    })

    it(`does not render comparison report when comparison metadata request failed`, async () => {
        const downloadResults = {
            summary: mockDownloadResultsDependency(
                {
                    complete: true,
                    preparing: false
                }),

            spectrum: mockDownloadResultsDependency(
                {
                    complete: true,
                    preparing: false,
                }),
            comparison: mockDownloadResultsDependency(
                {
                    complete: true,
                    preparing: false,
                    metadataError: mockError("META FAILED")
                })
        }
        const store = createStore(metadataWithInput, downloadResults)
        const wrapper = mountWithTranslate(UploadModal, store, {
            global: {
                plugins: [store]
            }, 
        })
        await nextTick();
        const inputs = wrapper.findAll("input[type='checkbox']")
        expect(inputs.length).toBe(3)
        expect((inputs[0].element as HTMLButtonElement).disabled).toBe(false)

        expect(inputs[0].attributes("id")).toBe("id-0-0");
        expect(inputs[0].attributes("value")).toBe("outputZip");

        expect(inputs[1].attributes("id")).toBe("id-0-1");
        expect(inputs[1].attributes("value")).toBe("outputSummary");

        expect(inputs[2].attributes("id")).toBe("id-1-0");
        expect(inputs[2].attributes("value")).toBe("population");

        const headers = wrapper.findAll("h5");

        expect(headers.length).toBe(2);
        expect(headers[0].text()).toBe("Output Files")
        expect(headers[1].text()).toBe("Input Files")

        expect(wrapper.find("#output-file-error").classes()).toStrictEqual(["pt-3", "text-danger"]);
        await expectTranslated(wrapper.find("#output-file-error"),
            "Comparison output file is not available for upload.",
            "Le fichier de sortie Comparaison n'est pas disponible pour le téléchargement",
            "O arquivo de saída do Comparação não está disponível para upload",
            store)
    })

})
