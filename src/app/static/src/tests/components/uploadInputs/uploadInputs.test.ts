import Vuex, {Store} from 'vuex';
import {BaselineActions} from "../../../app/store/baseline/actions";
import {
    mockBaselineState,
    mockError,
    mockFile,
    mockMetadataState,
    mockPopulationResponse,
    mockRootState,
    mockShapeResponse,
    mockSurveyAndProgramState
} from "../../mocks";
import {BaselineState} from "../../../app/store/baseline/baseline";
import UploadInputs from "../../../app/components/uploadInputs/UploadInputs.vue";
import ManageFile from "../../../app/components/files/ManageFile.vue";
import {MetadataState} from "../../../app/store/metadata/metadata";
import ErrorAlert from "../../../app/components/ErrorAlert.vue";
import LoadingSpinner from "../../../app/components/LoadingSpinner.vue";
import registerTranslations from "../../../app/store/translations/registerTranslations";
import {expectTranslatedWithStoreType, mountWithTranslate, shallowMountWithTranslate} from "../../testHelpers";
import {SurveyAndProgramActions} from "../../../app/store/surveyAndProgram/actions";
import {getters} from "../../../app/store/surveyAndProgram/getters";
import {DataType, SurveyAndProgramState} from "../../../app/store/surveyAndProgram/surveyAndProgram";
import {testUploadComponent} from "./fileUploads";
import {Mocked, MockInstance} from 'vitest';
import {flushPromises, VueWrapper} from '@vue/test-utils';

describe("UploadInputs upload component", () => {

    let actions: Mocked<BaselineActions>;
    let mutations = {};

    let sapActions: Mocked<SurveyAndProgramActions>;
    let sapMutations = {};

    const mockStepperGetters = {
        editsRequireConfirmation: () => true,
        changesToRelevantSteps: () => [{number: 4, textKey: "fitModel"}]
    };
    const mockPreparingRehydrate = vi.fn()
    const loadActions = {preparingRehydrate: mockPreparingRehydrate}

    testUploadComponent("surveys", 3);
    testUploadComponent("program", 4);
    testUploadComponent("anc", 5);

    const createSut = (baselineState?: Partial<BaselineState>,
                       metadataState?: Partial<MetadataState>,
                       surveyAndProgramState: Partial<SurveyAndProgramState> = {selectedDataType: DataType.Survey},
                       isGuest = false) => {

        actions = {
            refreshDatasetMetadata: vi.fn(),
            importPJNZ: vi.fn(),
            importPopulation: vi.fn(),
            importShape: vi.fn(),
            getBaselineData: vi.fn(),
            uploadPJNZ: vi.fn(),
            uploadShape: vi.fn(),
            uploadPopulation: vi.fn(),
            deletePJNZ: vi.fn(),
            deleteShape: vi.fn(),
            deletePopulation: vi.fn(),
            deleteAll: vi.fn(),
            validate: vi.fn()
        };

        const store = new Vuex.Store({
            state: mockRootState(),
            getters: {
                isGuest: () => isGuest
            },
            modules: {
                stepper: {
                    namespaced: true,
                    getters: mockStepperGetters
                },
                errors: {
                    namespaced: true
                },
                projects: {
                    namespaced: true,
                },
                baseline: {
                    namespaced: true,
                    state: mockBaselineState(baselineState),
                    actions: {...actions},
                    mutations: {...mutations}
                },
                metadata: {
                    namespaced: true,
                    state: mockMetadataState(metadataState)
                },
                surveyAndProgram: {
                    namespaced: true,
                    state: mockSurveyAndProgramState(surveyAndProgramState),
                    mutations: {...sapMutations},
                    actions: {...sapActions},
                    getters: getters
                },
                load: {
                    namespaced: true,
                    actions: {...loadActions}
                }
            }
        });

        registerTranslations(store);
        return store;
    };

    it("pjnz upload accepts pjnz or zip files", () => {
        const store = createSut();
        const wrapper = shallowMountWithTranslate(UploadInputs, store, {
            global: {
                plugins: [store]
            },
        });
        expect(wrapper.findAllComponents(ManageFile)[0].props().accept).toBe("PJNZ,pjnz,.pjnz,.PJNZ,.zip,zip,ZIP,.ZIP");
    });

    it("shows required text in front of pjnz upload label", () => {
        const store = createSut({}, {}, {});
        expectFileIsRequired(store, 0)
    });

    it("shows required text in front of area file upload label", () => {
        const store = createSut({}, {}, {});
        expectFileIsRequired(store, 1)
    });


    it("shows required text in front of population upload label", () => {
        const store = createSut({}, {}, {});
        expectFileIsRequired(store, 2)
    });


    it("shows required text in front of survey upload label", () => {
        const store = createSut({}, {}, {});
        expectFileIsRequired(store, 3)
    });

    it("does not show required text in front of ART upload", () => {
        const store = createSut();
        expectFileIsNotRequired(store, 4)
    });


    it("does not show required text in front of ANC upload label", () => {
        const store = createSut();
        expectFileIsNotRequired(store, 5)
    });


    it("pjnz is not valid if country is not present", () => {
        const store = createSut();
        const wrapper = shallowMountWithTranslate(UploadInputs, store, {
            global: {
                plugins: [store]
            },
        });
        expect(wrapper.findAllComponents(ManageFile)[0].props().valid).toBe(false);
        expect(wrapper.findAllComponents(ManageFile)[0].findAll("label").length).toBe(0);
    });

    it("pjnz is valid if country is present", () => {
        const store = createSut({country: "Malawi"});
        const wrapper = shallowMountWithTranslate(UploadInputs, store, {
            global: {
                plugins: [store]
            },
        });
        expect(wrapper.findAllComponents(ManageFile)[0].props().valid).toBe(true);
    });

    it("country name is passed to file upload component if country is present", async () => {
        const store = createSut({country: "Malawi"});
        const wrapper = mountWithTranslate(UploadInputs, store, {
            global: {
                plugins: [store]
            },
        });
        await expectTranslatedWithStoreType(wrapper.findAllComponents(ManageFile)[0].findAll("label")[1],
            "Country: Malawi", "Pays: Malawi", "País: Malawi", store);
    });

    it("passes pjnz error to file upload", () => {
        const error = mockError("File upload went wrong");
        const store = createSut({pjnzError: error});
        const wrapper = shallowMountWithTranslate(UploadInputs, store, {
            global: {
                plugins: [store]
            },
        });
        expect(wrapper.findAllComponents(ManageFile)[0].props().error).toStrictEqual(error);
    });

    it("shows metadata error if present", () => {
        const plottingMetadataError = mockError("Metadata went wrong");
        const store = createSut({}, {plottingMetadataError});
        const wrapper = shallowMountWithTranslate(UploadInputs, store, {
            global: {
                plugins: [store]
            },
        });
        expect(wrapper.findAllComponents(ManageFile)[0].props().error).toStrictEqual(plottingMetadataError);
    });

    it("shows pjnz error, not metadata error, if both are present", () => {
        const pjnzError = mockError("File upload went wrong");
        const plottingMetadataError = mockError("Metadata went wrong");
        const store = createSut({pjnzError}, {plottingMetadataError});
        const wrapper = shallowMountWithTranslate(UploadInputs, store, {
            global: {
                plugins: [store]
            },
        });
        expect(wrapper.findAllComponents(ManageFile)[0].props().error).toStrictEqual(pjnzError);
    });

    it("shows baseline error if present", () => {
        const error = mockError("Baseline is inconsistent");
        const store = createSut({baselineError: error});
        const wrapper = shallowMountWithTranslate(UploadInputs, store, {
            global: {
                plugins: [store]
            },
        });
        expect(wrapper.findComponent(ErrorAlert).props().error).toStrictEqual(error)
    });

    it("shows baseline validating indicator", async () => {
        const store = createSut({validating: true});
        const wrapper = shallowMountWithTranslate(UploadInputs, store, {
            global: {
                plugins: [store]
            },
        });
        const validating = wrapper.find("#upload-inputs-validating");
        await expectTranslatedWithStoreType(validating.find("span"), "Validating...",
            "Validation en cours...", "A validar...", store);
        expect(validating.findAllComponents(LoadingSpinner).length).toEqual(1)
    });

    it("shape is not valid if shape is not present", () => {
        const store = createSut();
        const wrapper = shallowMountWithTranslate(UploadInputs, store, {
            global: {
                plugins: [store]
            },
        });
        expect(wrapper.findAllComponents(ManageFile)[1].props().valid).toBe(false);
    });

    it("shape is valid if shape is present", () => {
        const store = createSut({shape: mockShapeResponse()});
        const wrapper = shallowMountWithTranslate(UploadInputs, store, {
            global: {
                plugins: [store]
            },
        });
        expect(wrapper.findAllComponents(ManageFile)[1].props().valid).toBe(true);
    });

    it("passes shape error to file upload", () => {
        const error = mockError("File upload went wrong");
        const store = createSut({shapeError: error});
        const wrapper = shallowMountWithTranslate(UploadInputs, store, {
            global: {
                plugins: [store]
            },
        });
        expect(wrapper.findAllComponents(ManageFile)[1].props().error).toStrictEqual(error);
    });

    it("shape upload accepts geojson", () => {
        const store = createSut();
        const wrapper = shallowMountWithTranslate(UploadInputs, store, {
            global: {
                plugins: [store]
            },
        });
        expect(wrapper.findAllComponents(ManageFile)[1].props().accept).toBe("geojson,.geojson,GEOJSON,.GEOJSON");
    });

    it("population is not valid if population is not present", () => {
        const store = createSut();
        const wrapper = shallowMountWithTranslate(UploadInputs, store, {
            global: {
                plugins: [store]
            },
        });
        expect(wrapper.findAllComponents(ManageFile)[2].props().valid).toBe(false);
    });

    it("population is valid if population is present", () => {
        const store = createSut({population: mockPopulationResponse()});
        const wrapper = shallowMountWithTranslate(UploadInputs, store, {
            global: {
                plugins: [store]
            },
        });
        expect(wrapper.findAllComponents(ManageFile)[2].props().valid).toBe(true);
    });

    it("passes population error to file upload", () => {
        const error = mockError("File upload went wrong")
        const store = createSut({populationError: error});
        const wrapper = shallowMountWithTranslate(UploadInputs, store, {
            global: {
                plugins: [store]
            },
        });
        expect(wrapper.findAllComponents(ManageFile)[2].props().error).toStrictEqual(error);
    });

    it("population upload accepts csv", () => {
        const store = createSut();
        const wrapper = shallowMountWithTranslate(UploadInputs, store, {
            global: {
                plugins: [store]
            },
        });
        expect(wrapper.findAllComponents(ManageFile)[2].props().accept).toBe("csv,.csv");
    });

    it("passes pjnz response existing file name to manage file", () => {
        const store = createSut({pjnz: {filename: "existing file"} as any});
        const wrapper = shallowMountWithTranslate(UploadInputs, store, {
            global: {
                plugins: [store]
            },
        });
        expect(wrapper.findAllComponents(ManageFile)[0].props("existingFileName")).toBe("existing file");
    });

    it("passes pjnz errored file to manage file", () => {
        const store = createSut({pjnzErroredFile: "errored file"});
        const wrapper = shallowMountWithTranslate(UploadInputs, store, {
            global: {
                plugins: [store]
            },
        });
        expect(wrapper.findAllComponents(ManageFile)[0].props("existingFileName")).toBe("errored file");
    });

    it("passes shape response existing file name to manage file", () => {
        const store = createSut({shape: {filename: "existing file"} as any});
        const wrapper = shallowMountWithTranslate(UploadInputs, store, {
            global: {
                plugins: [store]
            },
        });
        expect(wrapper.findAllComponents(ManageFile)[1].props("existingFileName")).toBe("existing file");
    });

    it("passes shape errored file to manage file", () => {
        const store = createSut({shapeErroredFile: "errored file"});
        const wrapper = shallowMountWithTranslate(UploadInputs, store, {
            global: {
                plugins: [store]
            },
        });
        expect(wrapper.findAllComponents(ManageFile)[1].props("existingFileName")).toBe("errored file");
    });

    it("passes population response existing file name to manage file", () => {
        const store = createSut({population: {filename: "existing file"} as any});
        const wrapper = shallowMountWithTranslate(UploadInputs, store, {
            global: {
                plugins: [store]
            },
        });
        expect(wrapper.findAllComponents(ManageFile)[2].props("existingFileName")).toBe("existing file");
    });

    it("passes population errored file to manage file", () => {
        const store = createSut({populationErroredFile: "errored file"});
        const wrapper = shallowMountWithTranslate(UploadInputs, store, {
            global: {
                plugins: [store]
            },
        });
        expect(wrapper.findAllComponents(ManageFile)[2].props("existingFileName")).toBe("errored file");
    });

    it("upload pjnz dispatches baseline/uploadPJNZ", async () => {
        await expectUploadToDispatchAction(0, () => actions.uploadPJNZ);
    });

    it("upload shape dispatches baseline/uploadShape", async () => {
        await expectUploadToDispatchAction(1, () => actions.uploadShape);
    });

    it("upload population dispatches baseline/uploadPopulation", async () => {
        await expectUploadToDispatchAction(2, () => actions.uploadPopulation);
    });

    it("remove pjnz dispatches baseline/deletePJNZ", async () => {
        await expectDeleteToDispatchAction(0, () => actions.deletePJNZ);
    });

    it("remove shape dispatches baseline/deleteShape", async () => {
        await expectDeleteToDispatchAction(1, () => actions.deleteShape);
    });

    it("remove population dispatches baseline/deletePopulation", async () => {
        await expectDeleteToDispatchAction(2, () => actions.deletePopulation);
    });

    it("can return true when fromADR", async () => {
        const store = createSut({
            pjnz: {
                "fromADR": true,
                "filters": {
                    "year": ""
                }
            } as any,
            population: {
                "fromADR": true,
                "filters": {
                    "year": ""
                }
            } as any,
            shape: {
                "fromADR": true,
                "filters": {
                    "year": ""
                }
            } as any
        });
        const wrapper = shallowMountWithTranslate(UploadInputs, store, {
            global: {
                plugins: [store]
            },
        });

        expect(wrapper.findAllComponents(ManageFile)[0].props().fromADR).toBe(true);
        expect(wrapper.findAllComponents(ManageFile)[1].props().fromADR).toBe(true);
        expect(wrapper.findAllComponents(ManageFile)[2].props().fromADR).toBe(true);

    });

    it("can return false when not fromADR", async () => {
        const store = createSut({
            pjnz: {
                "fromADR": "",
                "filters": {
                    "year": ""
                }
            } as any,
            population: {
                "fromADR": "",
                "filters": {
                    "year": ""
                }
            } as any,
            shape: {
                "fromADR": "",
                "filters": {
                    "year": ""
                }
            } as any
        });
        const wrapper = shallowMountWithTranslate(UploadInputs, store, {
            global: {
                plugins: [store]
            },
        });

        expect(wrapper.findAllComponents(ManageFile)[0].props().fromADR).toBe(false);
        expect(wrapper.findAllComponents(ManageFile)[1].props().fromADR).toBe(false);
        expect(wrapper.findAllComponents(ManageFile)[2].props().fromADR).toBe(false);

    });

    it("passes survey response existing file name to manage file", () => {
        const store = createSut({}, {}, {survey: {filename: "existing file"} as any});
        const wrapper = shallowMountWithTranslate(UploadInputs, store, {
            global: {
                plugins: [store]
            },
        });
        expect(wrapper.findAllComponents(ManageFile)[3].props("existingFileName")).toBe("existing file");
    });

    it("passes survey errored file to manage file", () => {
        const store = createSut({}, {}, {surveyErroredFile: "errored file"});
        const wrapper = shallowMountWithTranslate(UploadInputs, store, {
            global: {
                plugins: [store]
            },
        });
        expect(wrapper.findAllComponents(ManageFile)[3].props("existingFileName")).toBe("errored file");
    });

    it("passes program response existing file name to manage file", () => {
        const store = createSut({}, {}, {program: {filename: "existing file"} as any});
        const wrapper = shallowMountWithTranslate(UploadInputs, store, {
            global: {
                plugins: [store]
            },
        });
        expect(wrapper.findAllComponents(ManageFile)[4].props("existingFileName")).toBe("existing file");
    });

    it("passes program errored file to manage file", () => {
        const store = createSut({}, {}, {programErroredFile: "errored file"});
        const wrapper = shallowMountWithTranslate(UploadInputs, store, {
            global: {
                plugins: [store]
            },
        });
        expect(wrapper.findAllComponents(ManageFile)[4].props("existingFileName")).toBe("errored file");
    });

    it("passes anc response existing file name to manage file", () => {
        const store = createSut({}, {}, {anc: {filename: "existing file"} as any});
        const wrapper = shallowMountWithTranslate(UploadInputs, store, {
            global: {
                plugins: [store]
            },
        });
        expect(wrapper.findAllComponents(ManageFile)[5].props("existingFileName")).toBe("existing file");
    });

    it("passes anc errored file to manage file", () => {
        const store = createSut({}, {}, {ancErroredFile: "errored file"});
        const wrapper = shallowMountWithTranslate(UploadInputs, store, {
            global: {
                plugins: [store]
            },
        });
        expect(wrapper.findAllComponents(ManageFile)[5].props("existingFileName")).toBe("errored file");
    });

    it("can return true when fromADR", async () => {
        const store = createSut({}, {}, {
            survey: {
                "fromADR": true
            } as any,
            anc: {
                "fromADR": true
            } as any,
            program: {
                "fromADR": true
            } as any
        });
        const wrapper = shallowMountWithTranslate(UploadInputs, store, {
            global: {
                plugins: [store]
            },
        })

        expect(wrapper.findAllComponents(ManageFile)[3].props().fromADR).toBe(true);
        expect(wrapper.findAllComponents(ManageFile)[4].props().fromADR).toBe(true);
        expect(wrapper.findAllComponents(ManageFile)[5].props().fromADR).toBe(true);
    });

    it("can return false when not fromADR", async () => {
        const store = createSut({}, {}, {
            survey: {
                "fromADR": ""
            } as any,
            anc: {
                "fromADR": ""
            } as any,
            program: {
                "fromADR": ""
            } as any
        });
        const wrapper = shallowMountWithTranslate(UploadInputs, store, {
            global: {
                plugins: [store]
            },
        });

        expect(wrapper.findAllComponents(ManageFile)[3].props().fromADR).toBe(false);
        expect(wrapper.findAllComponents(ManageFile)[4].props().fromADR).toBe(false);
        expect(wrapper.findAllComponents(ManageFile)[5].props().fromADR).toBe(false);

    });

    it("doesn't render upload zip when logged in", () =>{
        const store = createSut({}, {}, {}, false);
        const wrapper = shallowMountWithTranslate(UploadInputs, store, {
            global: {
                plugins: [store]
            },
        });
        expect(wrapper.find("#load-zip").exists()).toBe(false)
    });

    it("can upload output zip when guest", async () =>{
        const store = createSut({}, {}, {}, true);
        const wrapper = shallowMountWithTranslate(UploadInputs, store, {
            global: {
                plugins: [store]
            },
        });
        expect(wrapper.find("#load-zip").exists()).toBe(true)

        const spy = vi.spyOn((wrapper.vm as any), "clearLoadZipInput")
        const testFile = mockFile("test filename", "test file contents", "application/zip")
        await triggerSelectZip(wrapper, testFile, "#upload-zip")
        expect(mockPreparingRehydrate.mock.calls.length).toBe(1);
        expect(spy).toHaveBeenCalledTimes(1)
    });

    const expectUploadToDispatchAction = async (index: number,
                                          action: () => MockInstance<any, any>) => {
        const store = createSut();
        const wrapper = shallowMountWithTranslate(UploadInputs, store, {
            global: {
                plugins: [store]
            },
        });

        wrapper.findAllComponents(ManageFile)[index].props().upload({name: "TEST"} as any);
        await flushPromises();
        expect(action().mock.calls[0][1]).toStrictEqual({name: "TEST"});
    };

    const expectDeleteToDispatchAction = async (index: number,
                                          action: () => MockInstance<any, any>) => {
        const store = createSut();
        const wrapper = shallowMountWithTranslate(UploadInputs, store, {
            global: {
                plugins: [store]
            },
        });

        wrapper.findAllComponents(ManageFile)[index].props().deleteFile();
        await flushPromises();
        expect(action().mock.calls.length).toBe(1);
    }
});

const expectFileIsRequired = (store: Store<any>, index: number) => {
    const wrapper = shallowMountWithTranslate(UploadInputs, store, {
        global: {
            plugins: [store]
        }
    });
    expect(wrapper.findAllComponents(ManageFile)[index].props().required).toBe(true);
}

const expectFileIsNotRequired = (store: Store<any>, index: number) => {
    const wrapper = shallowMountWithTranslate(UploadInputs, store, {
        global: {
            plugins: [store]
        }
    });
    expect(wrapper.findAllComponents(ManageFile)[index].props().required).toBe(false);
}

const triggerSelectZip = async (wrapper: VueWrapper, testFile: File, id: string) => {
    const input = wrapper.find(id);
    vi.spyOn((wrapper.vm.$refs as any).loadZip, "files", "get").mockImplementation(() => [testFile]);
    await input.trigger("change");
};
