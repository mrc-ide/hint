import {shallowMount, VueWrapper} from "@vue/test-utils";
import DataExploration from "../../../app/components/dataExploration/DataExploration.vue"
import Vuex from "vuex";
import {
    mockBaselineState, mockProgramResponse, mockShapeResponse,
    mockSurveyAndProgramState, mockSurveyResponse
} from "../../mocks";
import {getters} from "../../../app/store/surveyAndProgram/getters";
import {baselineGetters} from "../../../app/store/baseline/baseline";
import registerTranslations from "../../../app/store/translations/registerTranslations";
import {BaselineActions} from "../../../app/store/baseline/actions";
import {SurveyAndProgramActions} from "../../../app/store/surveyAndProgram/actions";
import {BaselineState} from "../../../app/store/baseline/baseline";
import {DataType, SurveyAndProgramState} from "../../../app/store/surveyAndProgram/surveyAndProgram";
import {DataExplorationState, initialDataExplorationState} from "../../../app/store/dataExploration/dataExploration";
import {initialDataExplorationStepperState, StepperState} from "../../../app/store/stepper/stepper";
import {mutations as stepperMutations} from "../../../app/store/stepper/mutations";
import {actions as stepperActions} from "../../../app/store/stepper/actions";
import LoadingSpinner from "../../../app/components/LoadingSpinner.vue";
import {expectTranslated, shallowMountWithTranslate} from "../../testHelpers";
import StepperNavigation from "../../../app/components/StepperNavigation.vue";
import { Mocked } from "vitest";

describe(`data exploration component`, () => {
    let actions: Mocked<BaselineActions>;
    let mutations = {};

    let sapActions: Mocked<SurveyAndProgramActions>;
    let sapMutations = {};

    const defaultBaselineState = {ready: true};
    const defaultSAPState = {ready: true, selectedDataType: DataType.Survey};

    const createStore = (baselineState: Partial<BaselineState> = defaultBaselineState,
                         surveyAndProgramState: Partial<SurveyAndProgramState> = defaultSAPState,
                         plottingMetadataMock = vi.fn(),
                         stepperState: Partial<StepperState> = {},
                         dataExplorationState: Partial<DataExplorationState> = {}) => {

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
            state: {...initialDataExplorationState(), ...dataExplorationState},
            modules: {
                baseline: {
                    namespaced: true,
                    state: mockBaselineState(baselineState),
                    actions: {...actions},
                    mutations: {...mutations},
                    getters: {...baselineGetters}
                },
                surveyAndProgram: {
                    namespaced: true,
                    state: mockSurveyAndProgramState(surveyAndProgramState),
                    mutations: {...sapMutations},
                    actions: {...sapActions},
                    getters: getters
                },
                metadata: {
                    namespaced: true,
                    actions: {
                        getPlottingMetadata: plottingMetadataMock
                    }
                },
                stepper: {
                    namespaced: true,
                    state: {...initialDataExplorationStepperState(), ...stepperState},
                    actions: stepperActions,
                    mutations: stepperMutations
                }
            }
        });

        registerTranslations(store);
        return store;
    };

    it(`renders components as expect`, () => {
        const store = createStore()
        const wrapper = shallowMountWithTranslate(DataExploration, store, {
            global: {
                plugins: [store]
            }, 
        });
        expect(wrapper.find("adr-integration-stub").exists()).toBe(true)
        expect(wrapper.find("upload-inputs-stub").exists()).toBe(true)
        expect(wrapper.findComponent(StepperNavigation).exists()).toBe(true)
    })

    it(`disables back navigation when on upload step`, () => {
        const store = createStore()
        const wrapper = shallowMountWithTranslate(DataExploration, store, {
            global: {
                plugins: [store]
            }, 
        });
        expect(wrapper.findComponent(StepperNavigation).props("backDisabled")).toBe(true)
    })

    it(`disables forward navigation when inputs are not valid`, () => {
        const store = createStore()
        const wrapper = shallowMountWithTranslate(DataExploration, store, {
            global: {
                plugins: [store]
            }, 
        });
        expect(wrapper.findComponent(StepperNavigation).props("nextDisabled")).toBe(true)
    })

    it(`enables forward navigation when inputs are valid`, () => {
        const store = createStore(
            {
                ...defaultBaselineState,
                shape: mockShapeResponse(),
                validatedConsistent: true
            },
            {
                ...defaultSAPState,
                program: mockProgramResponse()
            })
        const wrapper = shallowMountWithTranslate(DataExploration, store, {
            global: {
                plugins: [store]
            }, 
        });
        expect(wrapper.findComponent(StepperNavigation).props("nextDisabled")).toBe(false)
    })

    it(`disables continue navigation when on review step`, () => {
        const store = createStore(
            {...defaultBaselineState, shape: mockShapeResponse()},
            {...defaultBaselineState, survey: mockSurveyResponse()},
            vi.fn(),
            {activeStep: 2}
        );
        const wrapper = shallowMountWithTranslate(DataExploration, store, {
            global: {
                plugins: [store]
            }, 
        });

        expect(wrapper.findComponent(StepperNavigation).props("backDisabled")).toBe(false)
        expect(wrapper.findComponent(StepperNavigation).props("nextDisabled")).toBe(true)
    })

    it(`can navigate to reviewInputs`, async () => {
        const store = createStore()
        const wrapper = shallowMountWithTranslate(DataExploration, store, {
            global: {
                plugins: [store]
            }, 
        });
        expect(wrapper.find("review-inputs-stub").exists()).toBe(false)
        const vm = wrapper.vm as any
        await vm.next()
        expect(wrapper.find("review-inputs-stub").exists()).toBe(true)
    })

    it(`can navigate to uploadInputs`, async () => {
        const store = createStore(defaultBaselineState, defaultSAPState, vi.fn(), {activeStep: 2});
        const wrapper = shallowMountWithTranslate(DataExploration, store, {
            global: {
                plugins: [store]
            }, 
        });

        expect(wrapper.find("upload-inputs-stub").exists()).toBe(false)
        const vm = wrapper.vm as any
        await vm.back()
        expect(wrapper.find("upload-inputs-stub").exists()).toBe(true)
    });

    it("requests plotting metadata on mount", () => {
        const metadataMock = vi.fn();
        const store = createStore({}, {}, metadataMock)
        const wrapper = shallowMountWithTranslate(DataExploration, store, {
            global: {
                plugins: [store]
            }, 
        })
        expect(metadataMock.mock.calls.length).toBe(1);
    });

    const expectLoadingView = (wrapper: any) => {
        expect(wrapper.find("adr-integration-stub").exists()).toBe(false);
        expect(wrapper.find("upload-inputs-stub").exists()).toBe(false);
        expect(wrapper.find("review-inputs-stub").exists()).toBe(false);
        expect(wrapper.findComponent(LoadingSpinner).props("size")).toBe("lg");
        expectTranslated(wrapper.find("#loading-message"),
            "Loading your data", "Chargement de vos données",
            "A carregar os seus dados", wrapper.vm.$store);
        expect(wrapper.findComponent(StepperNavigation).props("backDisabled")).toBe(true);
        expect(wrapper.findComponent(StepperNavigation).props("nextDisabled")).toBe(true);
    };

    it("shows loading spinner and disabled navigation when baseline not ready", () => {
        const store = createStore({ready: false});
        const wrapper = shallowMountWithTranslate(DataExploration, store, {
            global: {
                plugins: [store]
            }, 
        });
        expectLoadingView(wrapper);
    });

    it("shows loading spinner and disabled navigation when surveyAndProgram not ready", () => {
        const store = createStore(defaultBaselineState, {ready: false});
        const wrapper = shallowMountWithTranslate(DataExploration, store, {
            global: {
                plugins: [store]
            }, 
        });
        expectLoadingView(wrapper);
    });

    it("shows loading spinner and disabled navigation when updating language", () => {
        const dataExplorationState = {updatingLanguage: true};
        const store = createStore(defaultBaselineState, defaultSAPState, vi.fn(), {},
            dataExplorationState);
        const wrapper = shallowMountWithTranslate(DataExploration, store, {
            global: {
                plugins: [store]
            }, 
        });
        expectLoadingView(wrapper);
    });
});
