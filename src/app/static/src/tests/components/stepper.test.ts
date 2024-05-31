import Vuex from 'vuex';
import {baselineGetters, BaselineState} from "../../app/store/baseline/baseline";
import {
    mockADRState,
    mockBaselineState,
    mockGenericChartState,
    mockLoadState,
    mockMetadataState,
    mockModelCalibrateState,
    mockModelOptionsState,
    mockModelRunState,
    mockPlottingMetadataResponse,
    mockPopulationResponse,
    mockProjectsState,
    mockRootState,
    mockShapeResponse,
    mockStepperState,
    mockSurveyAndProgramState,
    mockSurveyResponse,
    mockValidateBaselineResponse
} from "../mocks";
import {SurveyAndProgramState} from "../../app/store/surveyAndProgram/surveyAndProgram";
import {getters as surveyAndProgramGetters} from "../../app/store/surveyAndProgram/getters";
import {mutations} from '../../app/store/baseline/mutations';
import {mutations as surveyAndProgramMutations} from '../../app/store/surveyAndProgram/mutations';
import {ModelRunMutation, mutations as modelRunMutations} from '../../app/store/modelRun/mutations';
import {mutations as stepperMutations} from '../../app/store/stepper/mutations';
import {mutations as loadMutations} from '../../app/store/load/mutations';
import {ModelCalibrateMutation, mutations as modelCalibrateMutations} from '../../app/store/modelCalibrate/mutations';
import {modelRunGetters, ModelRunState} from "../../app/store/modelRun/modelRun";
import ADRIntegration from "../../app/components/adr/ADRIntegration.vue";
import Stepper from "../../app/components/Stepper.vue";
import Step from "../../app/components/Step.vue";
import LoadingSpinner from "../../app/components/LoadingSpinner.vue";
import {actions} from "../../app/store/stepper/actions";
import {getters} from "../../app/store/stepper/getters";
import {StepperState} from "../../app/store/stepper/stepper";
import {actions as rootActions} from "../../app/store/root/actions"
import {mutations as rootMutations} from "../../app/store/root/mutations"
import {metadataGetters, MetadataState} from "../../app/store/metadata/metadata";
import {ModelStatusResponse, Warning} from "../../app/generated";
import {modelOptionsGetters, ModelOptionsState} from "../../app/store/modelOptions/modelOptions";
import {LoadingState, LoadState} from "../../app/store/load/state";
import registerTranslations from "../../app/store/translations/registerTranslations";
import {ProjectsState} from "../../app/store/projects/projects";
import {ModelCalibrateState} from "../../app/store/modelCalibrate/modelCalibrate";
import VersionStatus from "../../app/components/projects/VersionStatus.vue";
import {RootState} from "../../app/root";
import ModelCalibrate from "../../app/components/modelCalibrate/ModelCalibrate.vue";
import {getters as rootGetters} from "../../app/store/root/getters";
import {expectTranslated, shallowMountWithTranslate} from "../testHelpers";
import StepperNavigation from "../../app/components/StepperNavigation.vue";
import WarningAlert from "../../app/components/WarningAlert.vue";
import LoadInvalidModal from "../../app/components/load/LoadInvalidModal.vue";
import {ModelOptionsMutation} from "../../app/store/modelOptions/mutations";
import {GenericChartState} from "../../app/store/genericChart/genericChart";
import {GenericChartMutation} from "../../app/store/genericChart/mutations";
import {nextTick} from 'vue';

describe("Stepper component", () => {

    const clearOptionsWarnings = vi.fn(); 
    const clearCalibrateWarnings = vi.fn(); 
    const clearRunWarnings = vi.fn();
    const clearReviewInputsWarnings = vi.fn();

    const createSut = (baselineState?: Partial<BaselineState>,
                       surveyAndProgramState?: Partial<SurveyAndProgramState>,
                       metadataState?: Partial<MetadataState>,
                       modelRunState?: Partial<ModelRunState>,
                       stepperState?: Partial<StepperState>,
                       loadState?: Partial<LoadState>,
                       projectsState?: Partial<ProjectsState>,
                       mockRouterPush = vi.fn(),
                       partialRootState: Partial<RootState> = {},
                       modelOptionsState: Partial<ModelOptionsState> = {},
                       modelCalibrateState: Partial<ModelCalibrateState> = {},
                       genericChartState: Partial<GenericChartState> = {}) => {

        const store = new Vuex.Store({
            actions: rootActions,
            mutations: rootMutations,
            state: mockRootState({...partialRootState}),
            getters: rootGetters,
            modules: {
                adr: {
                    namespaced: true,
                    state: mockADRState({schemas: {baseUrl: "whatever"} as any})
                },
                baseline: {
                    namespaced: true,
                    state: mockBaselineState(baselineState),
                    getters: baselineGetters,
                    actions: {
                        deleteAll: vi.fn()
                    },
                    mutations
                },
                surveyAndProgram: {
                    namespaced: true,
                    state: mockSurveyAndProgramState(surveyAndProgramState),
                    getters: surveyAndProgramGetters,
                    actions: {
                        deleteAll: vi.fn()
                    },
                    mutations: surveyAndProgramMutations
                },
                modelRun: {
                    namespaced: true,
                    state: mockModelRunState(modelRunState),
                    mutations: {
                        ...modelRunMutations,
                        [ModelRunMutation.ClearWarnings]: clearRunWarnings
                    },
                    getters: modelRunGetters
                },
                modelOptions: {
                    namespaced: true,
                    state: mockModelOptionsState(modelOptionsState),
                    getters: modelOptionsGetters,
                    mutations: {
                        [ModelOptionsMutation.ClearWarnings]: clearOptionsWarnings
                    }
                },
                modelCalibrate: {
                    namespaced: true,
                    state: mockModelCalibrateState(modelCalibrateState),
                    mutations: {
                        ...modelCalibrateMutations,
                        [ModelCalibrateMutation.ClearWarnings]: clearCalibrateWarnings
                    }
                },
                genericChart: {
                    namespaced: true,
                    state: mockGenericChartState(genericChartState),
                    mutations: {
                        [GenericChartMutation.ClearWarnings]: clearReviewInputsWarnings
                    }
                },
                stepper: {
                    namespaced: true,
                    state: mockStepperState(stepperState),
                    mutations: stepperMutations,
                    actions: actions,
                    getters
                },
                metadata: {
                    namespaced: true,
                    state: mockMetadataState(metadataState),
                    getters: metadataGetters
                },
                load: {
                    namespaced: true,
                    state: mockLoadState(loadState),
                    mutations: loadMutations
                },
                projects: {
                    namespaced: true,
                    state: mockProjectsState(projectsState)
                }
            }
        });
        registerTranslations(store);

        const mocks = {
            $router: {
                push: mockRouterPush
            }
        };

        return shallowMountWithTranslate(Stepper, store, {global: {plugins: [store], mocks}});
    };

    const createReadySut = (baselineState?: Partial<BaselineState>,
                       surveyAndProgramState?: Partial<SurveyAndProgramState>,
                       metadataState?: Partial<MetadataState>,
                       modelRunState?: Partial<ModelRunState>,
                       stepperState?: Partial<StepperState>,
                       loadState?: Partial<LoadState>,
                       projectsState?: Partial<ProjectsState>,
                       mockRouterPush = vi.fn(),
                       partialRootState: Partial<RootState> = {},
                       modelOptionsState: Partial<ModelOptionsState> = {},
                       modelCalibrateState: Partial<ModelCalibrateState> = {},
                       genericChartState: Partial<GenericChartState> = {}) => {
        return createSut(
            {...baselineState, ready: true},
            {...surveyAndProgramState, ready: true},
            metadataState,
            {...modelRunState, ready: true},
            stepperState, loadState, projectsState, mockRouterPush, partialRootState, modelOptionsState,
            {...modelCalibrateState, ready: true},
            genericChartState
        );
    };

    const completedBaselineState = {
        country: "testCountry",
        iso3: "TTT",
        shape: mockShapeResponse(),
        population: mockPopulationResponse(),
        ready: true,
        validatedConsistent: true
    };

    const completedSurveyAndProgramState = {
        survey: mockSurveyResponse(),
        programError: null,
        ancError: null
    }

    afterEach(() => {
        localStorage.clear();
        vi.resetAllMocks();
    });

    it("renders loading spinner while states are not ready", () => {
        const wrapper = createSut();
        const store = wrapper.vm.$store;
        expect(wrapper.findAllComponents(LoadingSpinner).length).toBe(1);
        expect(wrapper.findAll(".content").length).toBe(0);
        expectTranslated(wrapper.find("#loading-message"), "Loading your data",
            "Chargement de vos données", "A carregar os seus dados", store);
        expect(wrapper.findComponent(LoadInvalidModal).exists()).toBe(false);
        expect(wrapper.findComponent(WarningAlert).exists()).toBe(false);
    });

    it("renders loading spinner while ready but loadingFromFile", () => {

        const wrapper = createReadySut(
            {},
            {},
            {},
            {},
            {},
            {loadingState: LoadingState.SettingFiles});
        const store = wrapper.vm.$store;

        expect(wrapper.findAllComponents(LoadingSpinner).length).toBe(1);
        expect(wrapper.findAll(".content").length).toBe(0);
        expectTranslated(wrapper.find("#loading-message"), "Loading your data",
            "Chargement de vos données","A carregar os seus dados", store);
    });

    it("renders loading spinner while updating language", () => {
        const wrapper = createReadySut(
            {},
            {},
            {},
            {},
            {},
            {},
            {},
            vi.fn(),
            {updatingLanguage: true});

        const store = wrapper.vm.$store;

        expect(wrapper.findAllComponents(LoadingSpinner).length).toBe(1);
        expect(wrapper.findAll(".content").length).toBe(0);
        expectTranslated(wrapper.find("#loading-message"), "Loading your data",
            "Chargement de vos données","A carregar os seus dados", store);
    });

    it("does not render loading spinner once states are ready", () => {
        const wrapper = createReadySut();
        expect(wrapper.findAllComponents(LoadingSpinner).length).toBe(0);
        expect(wrapper.findAll(".content").length).toBe(1);
        expect(wrapper.findAll("#loading-message").length).toBe(0);
        expect(wrapper.findComponent(LoadInvalidModal).exists()).toBe(true);
    });

    it("renders steps", () => {
        const wrapper = createReadySut();
        const steps = wrapper.findAllComponents(Step);

        expect(wrapper.findAllComponents(Step).length).toBe(7);
        expect(steps[0].props().textKey).toBe("uploadInputs");
        expect(steps[0].props().active).toBe(true);
        expect(steps[0].props().number).toBe(1);
        expect(steps[0].props().complete).toBe(false);
        expect(steps[0].props().enabled).toBe(true);

        expect(steps[1].props().textKey).toBe("reviewInputs");
        expect(steps[1].props().active).toBe(false);
        expect(steps[1].props().number).toBe(2);
        expect(steps[1].props().complete).toBe(false);
        expect(steps[1].props().enabled).toBe(false);

        expect(steps[2].props().textKey).toBe("modelOptions");
        expect(steps[2].props().active).toBe(false);
        expect(steps[2].props().number).toBe(3);
        expect(steps[2].props().complete).toBe(false);
        expect(steps[2].props().enabled).toBe(false);

        expect(steps[3].props().textKey).toBe("fitModel");
        expect(steps[3].props().active).toBe(false);
        expect(steps[3].props().number).toBe(4);
        expect(steps[3].props().complete).toBe(false);
        expect(steps[3].props().enabled).toBe(false);

        expect(steps[4].props().textKey).toBe("calibrateModel");
        expect(steps[4].props().active).toBe(false);
        expect(steps[4].props().number).toBe(5);
        expect(steps[4].props().complete).toBe(false);
        expect(steps[4].props().enabled).toBe(false);

        expect(steps[5].props().textKey).toBe("reviewOutput");
        expect(steps[5].props().active).toBe(false);
        expect(steps[5].props().number).toBe(6);
        expect(steps[5].props().complete).toBe(false);
        expect(steps[5].props().enabled).toBe(false);

        expect(steps[6].props().textKey).toBe("downloadResults");
        expect(steps[6].props().active).toBe(false);
        expect(steps[6].props().number).toBe(7);
        expect(steps[6].props().complete).toBe(false);
        expect(steps[6].props().enabled).toBe(false);
    });

    it("renders step connectors", () => {
        const wrapper = createReadySut();
        const connectors = wrapper.findAll(".step-connector");

        expect(connectors.length).toBe(6);
        // all should not be enabled at first
        expect(connectors.filter(c => c.classes().indexOf("enabled") > -1).length).toBe(0);
    });

    it("renders version status", () => {
        const wrapper = createReadySut();
        expect(wrapper.findComponent(VersionStatus).exists()).toBe(true);
    });

    it("step connector is enabled if next step is", () => {
        const wrapper = createReadySut(completedBaselineState,
            completedSurveyAndProgramState,
            {plottingMetadata: "TEST DATA" as any});
        const connectors = wrapper.findAll(".step-connector");

        expect(connectors[0].classes()).toContain("enabled");
        expect(connectors.filter(c => c.classes().indexOf("enabled") > -1).length).toBe(2);
    });

    it("step connector is not enabled for review inputs step if survey is not valid", () => {
        const wrapper = createReadySut(completedBaselineState,
            {survey: false, program: true, shape: true} as any);
        const connectors = wrapper.findAll(".step-connector");

        expect(connectors[0].classes()).not.toContain("enabled");
        expect(connectors.filter(c => c.classes().indexOf("enabled") > -1).length).toBe(0);
    });

    it("all steps except baseline are disabled initially", () => {
        const wrapper = createReadySut();
        const steps = wrapper.findAllComponents(Step);
        expect(steps[0].props().enabled).toBe(true);
        expect([1, 2, 3, 4, 5].filter(i => steps[i].props().enabled).length).toBe(0);
    });

    it("Review inputs step is enabled when baseline step is complete", () => {
        const wrapper = createReadySut(completedBaselineState,
            completedSurveyAndProgramState,
            {plottingMetadata: "TEST DATA" as any});
        const steps = wrapper.findAllComponents(Step);
        expect(steps[0].props().enabled).toBe(true);
        expect(steps[1].props().enabled).toBe(true);
        expect(steps[0].props().complete).toBe(true);
        expect(steps[2].props().enabled).toBe(true);
        expect([3, 4, 5].filter(i => steps[i].props().enabled).length).toBe(0);
    });

    it("Review inputs step is not enabled when baseline step is not complete", () => {
        const wrapper = createReadySut(completedBaselineState);
        const steps = wrapper.findAllComponents(Step);
        expect(steps[0].props().enabled).toBe(true);
        expect(steps[1].props().enabled).toBe(false);
        expect(steps[0].props().complete).toBe(false);
        expect(steps[2].props().enabled).toBe(false);
        expect([3, 4, 5].filter(i => steps[i].props().enabled).length).toBe(0);
    });

    it("Review inputs step is not enabled if metadata state is not complete", () => {
        const wrapper = createReadySut(completedBaselineState,
            completedSurveyAndProgramState,
            {plottingMetadata: null});
        const steps = wrapper.findAllComponents(Step);
        expect(steps[0].props().enabled).toBe(true);
        expect(steps[1].props().enabled).toBe(false);
        expect(steps[0].props().complete).toBe(false);
        expect([1, 2, 3, 4, 5].filter(i => steps[i].props().enabled).length).toBe(0);
    });

    it("updates active step when jump event is emitted", async () => {
        const wrapper = createReadySut(completedBaselineState,
            completedSurveyAndProgramState,
            {plottingMetadata: "TEST DATA" as any});
        const steps = wrapper.findAllComponents(Step);
        steps[1].vm.$emit("jump", 2);
        await nextTick();
        expect(steps[0].props().complete).toBe(true);
        expect(steps[1].props().active).toBe(true);
    });

    it("cannot continue when the active step is not complete", () => {
        const wrapper = createReadySut({country: ""});
        const vm = wrapper.vm as any;
        expect(vm.navigationProps.nextDisabled).toBe(true);

        vm.navigationProps.next();
        const steps = wrapper.findAllComponents(Step);
        expect(steps[0].props().active).toBe(true);
    });


    it("can continue when the active step is complete", async () => {
        const wrapper = createReadySut(completedBaselineState,
            completedSurveyAndProgramState,
            {plottingMetadata: "TEST DATA" as any});
        const vm = wrapper.vm as any;
        expect(vm.navigationProps.nextDisabled).toBe(false);

        vm.navigationProps.next();
        await nextTick();
        const steps = wrapper.findAllComponents(Step);
        expect(steps[1].props().active).toBe(true);
    });

    it("cannot go back from the first step", () => {
        const wrapper = createReadySut({country: ""});
        expect((wrapper.vm as any).navigationProps.backDisabled).toBe(true);
    });

    it("can go back from later steps", async () => {
        const wrapper = createReadySut({
                country: "testCountry",
                iso3: "TTT",
                shape: mockShapeResponse(),
                population: mockPopulationResponse()
            },
            {},
            {plottingMetadata: "TEST DATA" as any},
            {},
            {activeStep: 2});

        const vm = wrapper.vm as any;
        expect(vm.navigationProps.backDisabled).toBe(false);

        vm.navigationProps.back();
        await nextTick();
        const steps = wrapper.findAllComponents(Step);
        expect(steps[0].props().active).toBe(true);
    });

    it("updates from completed state when active step data is populated", async () => {
        const baselineState = {
            country: "Malawi",
            iso3: "MWI",
            population: mockPopulationResponse(),
            shape: mockShapeResponse(),
            ready: true
        };
        const wrapper = createReadySut(baselineState,
            completedSurveyAndProgramState,
            {plottingMetadata: "TEST DATA" as any});
        const vm = wrapper.vm as any;
        expect(vm.navigationProps.nextDisabled).toBe(true);

        //invoke the mutation
        wrapper.vm.$store.commit("baseline/Validated", {
            "type": "Validated",
            "payload": mockValidateBaselineResponse()
        });
        await nextTick();
        expect(vm.navigationProps.nextDisabled).toBe(false);
    });

    it("active step only becomes active once state becomes ready", async () => {

        const wrapper = createSut(completedBaselineState,
            completedSurveyAndProgramState,
            {plottingMetadata: mockPlottingMetadataResponse()},
            {ready: true},
            {activeStep: 2});

        let steps = wrapper.findAllComponents(Step);
        expect(steps.filter(s => s.props().active).length).toBe(0);

        await makeReady(wrapper);
        steps = wrapper.findAllComponents(Step);
        expect(steps[1].props().active).toBe(true);
    });

    it("complete steps only shown as complete once state becomes ready", async () => {

        const wrapper = createSut(
            completedBaselineState,
            completedSurveyAndProgramState,
            {
                plottingMetadata: "TEST DATA" as any
            },
            {ready: true});

        let steps = wrapper.findAllComponents(Step);
        expect(steps.filter(s => s.props().complete).length).toBe(0);

        await makeReady(wrapper);
        steps = wrapper.findAllComponents(Step);
        expect(steps[0].props().complete).toBe(true);
    });

    it("steps only shown as enabled once state becomes ready, and not loading", async () => {

        const wrapper = createSut(completedBaselineState,
            completedSurveyAndProgramState,
            {plottingMetadata: "TEST DATA" as any},
            {ready: true});
        let steps = wrapper.findAllComponents(Step);
        expect(steps.filter(s => s.props().enabled).length).toBe(0);

        await makeReady(wrapper);
        steps = wrapper.findAllComponents(Step);
        expect(steps[1].props().enabled).toBe(true);
    });

    it("steps not shown as enabled if state becomes ready, but is also loading", async () => {

        const wrapper = createSut(completedBaselineState,
            {},
            {plottingMetadata: "TEST DATA" as any},
            {ready: true});

        let steps = wrapper.findAllComponents(Step);
        expect(steps.filter(s => s.props().enabled).length).toBe(0);

        await makeReady(wrapper);
        await makeLoading(wrapper);
        steps = wrapper.findAllComponents(Step);
        expect(steps[1].props().enabled).toBe(false);
    });

    async function makeReady(wrapper: any) {

        wrapper.vm.$store.commit("surveyAndProgram/Ready", {
            "type": "Ready",
            "payload": true
        });

        wrapper.vm.$store.commit("modelCalibrate/Ready", {
            "type": "Ready",
            "payload": true
        });

        await nextTick();
        expect(wrapper.findAllComponents(LoadingSpinner).length).toBe(0);
    }

    async function makeLoading(wrapper: any) {

        wrapper.vm.$store.commit("load/SettingFiles", {
            "type": "SettingFiles",
            "payload": null
        });

        await nextTick();
        expect(wrapper.findAllComponents(LoadingSpinner).length).toBe(1);
    }

    it("model run step is not complete without success", () => {
        const wrapper = createReadySut({}, {}, {}, {result: "TEST" as any});
        const steps = wrapper.findAllComponents(Step);
        expect(steps[3].props().complete).toBe(false);
    });

    it("model run step is not complete without result", () => {
        const wrapper = createReadySut({}, {}, {}, {status: {success: true} as any});
        const steps = wrapper.findAllComponents(Step);
        expect(steps[3].props().complete).toBe(false);
    });

    it("model run step is not complete with errors", () => {
        const modelRunState = {
            status: {success: true} as ModelStatusResponse,
            result: "TEST" as any,
            errors: ["TEST" as any]
        };
        const wrapper = createReadySut({}, {}, {}, modelRunState);
        const steps = wrapper.findAllComponents(Step);
        expect(steps[3].props().complete).toBe(false);
    });

    it("model run step is complete on success and result", () => {
        const modelRunState = {
            result: "TEST" as any,
            status: {success: true} as ModelStatusResponse
        };
        const wrapper = createReadySut({}, {}, {}, modelRunState);
        const steps = wrapper.findAllComponents(Step);
        expect(steps[3].props().complete).toBe(true);
    });

    const testModelRunCompletion = async (modelRunWarnings: Warning[], expectAdvanceToCalibrate: boolean)=> {
        //store should consider first 3 steps to be complete initially
        const wrapper = createReadySut(
            {
                validatedConsistent: true,
                country: "TEST",
                iso3: "TES",
                shape: ["TEST SHAPE"] as any,
                population: ["TEST POP"] as any
            },
            {
                survey: ["TEST SURVEY"] as any
            },
            {plottingMetadata: ["TEST METADATA"] as any},
            {},
            {activeStep: 4},
            {},
            {},
            vi.fn(),
            {},
            {valid: true},
        );
        const steps = wrapper.findAllComponents(Step);
        expect(steps[3].props().complete).toBe(false);
        expect(steps[3].props().active).toBe(true);
        expect(steps[4].props().active).toBe(false);

        wrapper.vm.$store.commit("modelRun/RunStatusUpdated", {
            "type": "RunStatusUpdated",
            "payload": {
                id: "1234",
                success: true,
                done: true,
                queue: 1,
                progress: "",
                timeRemaining: "",
                status: "running"
            }
        });

        wrapper.vm.$store.commit("modelRun/WarningsFetched", {
            type: "WarningsFetched",
            payload: modelRunWarnings
        });

        wrapper.vm.$store.commit("modelRun/RunResultFetched", {
            "type": "RunResultFetched",
            "payload": "TEST"
        });

        await nextTick();
        expect(steps[3].props().complete).toBe(true);
        if (expectAdvanceToCalibrate) {
            expect(steps[3].props().active).toBe(false);
            expect(steps[4].props().active).toBe(true);
        } else {
            expect(steps[3].props().active).toBe(true);
            expect(steps[4].props().active).toBe(false);
        }
    };

    it("model run step becomes complete on success, result fetched, and automatically moves to calibrate step", async () => {
        await testModelRunCompletion([], true);
    });

    it("model run step does not automatically advance to calibrate step on completion if there are modelRun warnings to display", async () => {
        await testModelRunCompletion([{text: "model run warning", locations: ["model_fit", "review_output"]}], false);
    });

    it("model run step does automatically advance to calibrate step on completion if there are modelRun warnings, but not for this step to display", async () => {
        await testModelRunCompletion([{text: "model run warning", locations: ["review_output"]}], true);
    });

    it("validates state once ready", async () => {
        const spy = vi.spyOn(rootActions as any, "validate");
        const wrapper = createSut({ready: true}, {}, {}, {ready: true});
        expect(spy).not.toHaveBeenCalled();

        await makeReady(wrapper);
        expect(spy).toHaveBeenCalled();
    });

    it("pushes router to projects if logged in user and currentProject not set", () => {
        const mockRouterPush = vi.fn();
        //current user is set in vi.config and currentProject is not set be default in the wrapper
        createSut({}, {}, {}, {}, {}, {}, {}, mockRouterPush);

        expect(mockRouterPush.mock.calls.length).toBe(1);
        expect(mockRouterPush.mock.calls[0][0]).toBe("/projects");
    });

    it("does not push router to projects if guest user", () => {
        const mockRouterPush = vi.fn();
        createSut({}, {}, {}, {}, {}, {}, {}, mockRouterPush, {currentUser: 'guest'});

        expect(mockRouterPush.mock.calls.length).toBe(0);
    });

    it("does not push router to projects if logged in user and currentProject set", () => {
        const mockRouterPush = vi.fn();
        const projectsState = {currentProject: {id: 1, name: "testProject", versions: []}};
        createSut({}, {}, {}, {}, {}, {}, projectsState, mockRouterPush);

        expect(mockRouterPush.mock.calls.length).toBe(0);
    });

    it("does not push router to projects if project is loading", () => {
        const mockRouterPush = vi.fn();
        const projectsState = {loading: true};
        createSut({}, {}, {}, {}, {}, {}, projectsState, mockRouterPush);

        expect(mockRouterPush.mock.calls.length).toBe(0);
    });

    it("show ADR integration if on step 1", () => {
        const wrapper = getStepperOnStep(1);
        expect(wrapper.findAllComponents(ADRIntegration).length).toBe(1);
    });

    it("does not show ADR integration on step 2", () => {
        const wrapper = getStepperOnStep(2);
        expect(wrapper.findAllComponents(ADRIntegration).length).toBe(0);
    });

    it("does not show ADR integration on step 3", () => {
        const wrapper = getStepperOnStep(3);
        expect(wrapper.findAllComponents(ADRIntegration).length).toBe(0);
    });

    it("does not show ADR integration on step 4", () => {
        const wrapper = getStepperOnStep(4);
        expect(wrapper.findAllComponents(ADRIntegration).length).toBe(0);
    });

    it("does not show ADR integration on step 5", () => {
        const wrapper = getStepperOnStep(5);
        expect(wrapper.findAllComponents(ADRIntegration).length).toBe(0);
    });

    it("does not show ADR integration on step 6", () => {
        const wrapper = getStepperOnStep(6);
        expect(wrapper.findAllComponents(ADRIntegration).length).toBe(0);
    });

    it("renders model calibrate component on step 5", () => {
        let wrapper = getStepperOnStep(5);
        expect(wrapper.findAllComponents(ModelCalibrate).length).toBe(1);

        wrapper = getStepperOnStep(1);
        expect(wrapper.findAllComponents(ModelCalibrate).length).toBe(0);
    });

    const getStepperOnStep = (step: number) => {
        return createReadySut(
            {},
            {},
            {},
            {result: "TEST" as any},
            {activeStep: step});
    };

    it("complete step only becomes active/complete once state becomes ready", async () => {

        const wrapper = createSut(completedBaselineState,
            completedSurveyAndProgramState,
            {plottingMetadata: mockPlottingMetadataResponse()},
            {ready: true, status: {success: true} as any, result: {complete: true} as any},
            {activeStep: 7},
            {},
            {},
            vi.fn(),
            {},
            {valid: true},
            {complete: true}
            );

        let steps = wrapper.findAllComponents(Step);
        expect(steps.filter(s => s.props().active).length).toBe(0);

        await makeReady(wrapper);
        steps = wrapper.findAllComponents(Step);
        expect(steps[6].props().active).toBe(true);
        expect(steps[6].props().complete).toBe(true);

        expect((wrapper.vm as any).navigationProps.nextDisabled).toBe(true);
    });

    it("displays Back/Continue twice except model run step", () => {
        expect(getStepperOnStep(1).findAllComponents(StepperNavigation).length).toBe(2);
        expect(getStepperOnStep(2).findAllComponents(StepperNavigation).length).toBe(2);
        expect(getStepperOnStep(3).findAllComponents(StepperNavigation).length).toBe(2);
        expect(getStepperOnStep(4).findAllComponents(StepperNavigation).length).toBe(1);
        expect(getStepperOnStep(5).findAllComponents(StepperNavigation).length).toBe(2);
        expect(getStepperOnStep(6).findAllComponents(StepperNavigation).length).toBe(2);
    });

    const createWarningAlertWrapper = (activeStep = 4) => {
        return createReadySut(
            {
                validatedConsistent: true,
                country: "TEST",
                iso3: "TES",
                shape: ["TEST SHAPE"] as any,
                population: ["TEST POP"] as any
            },
            {
                survey: ["TEST SURVEY"] as any
            },
            {plottingMetadata: ["TEST METADATA"] as any},
            {
                warnings: [{
                    text: "Model Run warning",
                    locations: ["model_fit"]
                }]
            },
            {activeStep},
            {},
            {},
            vi.fn(),
            {},
            {
                valid: true,
                warnings: [{
                    text: "Model Options warning",
                    locations: ["model_options", "model_fit"]
                }]
            }
        );
    }

    it("renders warning alert with warnings for current step", () => {
        const wrapper = createWarningAlertWrapper()

        expect(wrapper.findAllComponents(WarningAlert).length).toBe(1)
        const warnings = wrapper.findComponent(WarningAlert).props("warnings");

        expect(warnings).toStrictEqual({
            modelOptions: [{
                text: "Model Options warning",
                locations: ["model_options", "model_fit"],
            }],
            modelRun: [{
                text: "Model Run warning",
                locations: ["model_fit"]
            }],
            modelCalibrate: [],
            reviewInputs: []
        });
        //Expect warnings component to be at top of content div, immediately before version status,
        // not at bottom immediately after load invalid modal
        expect(wrapper.find("warning-alert-stub + version-status-stub").exists()).toBe(true);
        expect(wrapper.find("load-invalid-modal-stub + warning-alert-stub ").exists()).toBe(false);
    });

    it("renders warning alert for model options after step content", () => {
        const wrapper = createReadySut(
            {
                validatedConsistent: true,
                country: "TEST",
                iso3: "TES",
                shape: ["TEST SHAPE"] as any,
                population: ["TEST POP"] as any
            },
            {
                survey: ["TEST SURVEY"] as any
            },
            {plottingMetadata: ["TEST METADATA"] as any},
            {},
            {activeStep: 3},
            {},
            {},
            vi.fn(),
            {},
            {
                valid: true,
                warnings: [{
                    text: "Model Options warning",
                    locations: ["model_options", "model_fit"]
                }]
            }
        );
        expect(wrapper.findAllComponents(WarningAlert).length).toBe(1)
        const warnings = wrapper.findComponent(WarningAlert).props("warnings");

        expect(warnings).toStrictEqual({
            modelOptions: [{
                text: "Model Options warning",
                locations: ["model_options", "model_fit"],
            }],
            modelRun: [],
            modelCalibrate: [],
            reviewInputs: []
        });
        //Expect warnings component to be at bottom of content div, immediately after load invalid modal,
        // not at top immediately before version status
        expect(wrapper.find("warning-alert-stub + version-status-stub").exists()).toBe(false);
        expect(wrapper.find("load-invalid-modal-stub + warning-alert-stub ").exists()).toBe(true);
    });

    it("renders warning alert for review inputs", () => {
        const wrapper = createReadySut(
            {
                validatedConsistent: true,
                country: "TEST",
                iso3: "TES",
                shape: ["TEST SHAPE"] as any,
                population: ["TEST POP"] as any
            },
            {
                survey: ["TEST SURVEY"] as any
            },
            {plottingMetadata: ["TEST METADATA"] as any},
            {},
            {activeStep: 2},
            {},
            {},
            vi.fn(),
            {},
            {},
            {},
            {
                warnings: [{
                    text: "review Inputs warning",
                    locations: ["review_inputs"]
                }]
            }
        );
        expect(wrapper.findAllComponents(WarningAlert).length).toBe(1)
        const warnings = wrapper.findComponent(WarningAlert).props("warnings");

        expect(warnings).toStrictEqual({
            modelOptions: [],
            modelRun: [],
            modelCalibrate: [],
            reviewInputs: [{
                text: "review Inputs warning",
                locations: ["review_inputs"]
            }]
        });
        //Expect warnings component to be at top, immediately before version status, not at bottom immediately after load invalid
        expect(wrapper.find("warning-alert-stub + version-status-stub").exists()).toBe(true);
        expect(wrapper.find("load-invalid-modal-stub + warning-alert-stub ").exists()).toBe(false);
    });

    it("clear-warnings emit when in modelOptions triggers clear warnings mutation in modelOptions store", async () => {
        const wrapper = createWarningAlertWrapper(3)
        await wrapper.findComponent(WarningAlert).vm.$emit("clear-warnings")
        expect(clearOptionsWarnings.mock.calls.length).toBe(1);
    });

    it("clear-warnings emit when in modelRun triggers clear warnings mutation in modelRun store", async () => {
        const wrapper = createWarningAlertWrapper(4)
        await wrapper.findComponent(WarningAlert).vm.$emit("clear-warnings")
        expect(clearRunWarnings.mock.calls.length).toBe(1);
    });

    it("clear-warnings emit when in modelCalibrate triggers clear warnings mutation in modelCalibrate store", async () => {
        const wrapper = createWarningAlertWrapper(5)
        await wrapper.findComponent(WarningAlert).vm.$emit("clear-warnings")
        expect(clearCalibrateWarnings.mock.calls.length).toBe(1);
    });

    it("clear-warnings emit when in reviewOutput triggers clear warnings mutation in modelCalibrate store", async () => {
        const wrapper = createWarningAlertWrapper(6)
        await wrapper.findComponent(WarningAlert).vm.$emit("clear-warnings")
        expect(clearCalibrateWarnings.mock.calls.length).toBe(1);
    });

    it("clear-warnings emit when in reviewInputs triggers clear warnings mutation in genericChart store", async () => {
        const wrapper = createWarningAlertWrapper(2)
        await wrapper.findComponent(WarningAlert).vm.$emit("clear-warnings")
        expect(clearReviewInputsWarnings.mock.calls.length).toBe(1);
    });

    it("clear-warnings emit when in downloadResults triggers clear warnings mutation in modelCalibrate store", async () => {
        const wrapper = createWarningAlertWrapper(7)
        await wrapper.findComponent(WarningAlert).vm.$emit("clear-warnings")
        expect(clearCalibrateWarnings.mock.calls.length).toBe(1);
    });
});
