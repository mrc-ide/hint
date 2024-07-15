import {shallowMount} from "@vue/test-utils";
import ModelOptions from "../../../app/components/modelOptions/ModelOptions.vue";
import {nextTick} from "vue";
import Vuex, {ActionTree, MutationTree} from "vuex";
import {mockError, mockModelOptionsState, mockRootState} from "../../mocks";
import {ModelOptionsState} from "../../../app/store/modelOptions/modelOptions";
import {DynamicControlSection, DynamicForm} from "@reside-ic/vue-next-dynamic-form";
import {ModelOptionsMutation} from "../../../app/store/modelOptions/mutations";
import LoadingSpinner from "../../../app/components/LoadingSpinner.vue";
import Tick from "../../../app/components/Tick.vue";
import {ModelOptionsActions} from "../../../app/store/modelOptions/actions";
import {RootState} from "../../../app/root";
import registerTranslations from "../../../app/store/translations/registerTranslations";
import {getters} from "../../../app/store/root/getters";
import {expectTranslated, mountWithTranslate, shallowMountWithTranslate} from "../../testHelpers";
import ErrorAlert from "../../../app/components/ErrorAlert.vue";
import {Language} from "../../../app/store/translations/locales";

describe("Model options component", () => {

    const mockActions = {
        fetchModelRunOptions: vi.fn(),
        validateModelOptions: vi.fn()
    };
    const mockMutations = {
        [ModelOptionsMutation.Update]: vi.fn(),
        [ModelOptionsMutation.Validate]: vi.fn(),
        [ModelOptionsMutation.ModelOptionsFetched]: vi.fn(),
        [ModelOptionsMutation.FetchingModelOptions]: vi.fn(),
        [ModelOptionsMutation.Validating]: vi.fn(),
        [ModelOptionsMutation.ModelOptionsError]: vi.fn()
    };

    const mockGetters = {
        editsRequireConfirmation: () => false,
        changesToRelevantSteps: () => [{number: 4, textKey: "fitModel"}]
    };

    const createStore = (props: Partial<ModelOptionsState>,
                         mutations: MutationTree<ModelOptionsState> = mockMutations,
                         actions: ModelOptionsActions & ActionTree<ModelOptionsState, RootState> = mockActions,
                         rootState: Partial<RootState> = {}) => {
        const store = new Vuex.Store({
            modules: {
                modelOptions: {
                    namespaced: true,
                    state: mockModelOptionsState(props),
                    mutations,
                    actions
                },
                stepper: {
                    namespaced: true,
                    getters: mockGetters
                },
                projects: {
                    namespaced: true
                },
                errors: {
                    namespaced: true
                }
            },
            getters: getters,
            state: mockRootState({currentUser: 'guest', ...rootState})
        });
        registerTranslations(store);
        return store;
    };

    it("displays dynamic form when fetching is false", () => {
        const store = createStore({optionsFormMeta: {controlSections: []}});
        const rendered = shallowMountWithTranslate(ModelOptions, store, {
            global: {
                plugins: [store]
            }, 
        });
        expect(rendered.findAllComponents(DynamicForm).length).toBe(1);
        const form = rendered.findComponent(DynamicForm);
        expect(form.props("requiredText")).toBe("required");
        expect(form.props("selectText")).toBe("Select...");
        expect(form.props("submitText")).toBe("Validate");
        expect(rendered.findAllComponents(LoadingSpinner).length).toBe(0);
        expect(rendered.find("#validating").exists()).toBe(false);
    });

    it("translates required, select and validate text into French", () => {
        const store = createStore({}, mockMutations, mockActions, {language: Language.fr});
        const wrapper = shallowMountWithTranslate(ModelOptions, store, {
            global: {
                plugins: [store]
            }, 
        });
        expect(wrapper.findComponent(DynamicForm).props("requiredText")).toBe("obligatoire");
        expect(wrapper.findComponent(DynamicForm).props("selectText")).toBe("Sélectionner...");
        expect(wrapper.findComponent(DynamicForm).props("submitText")).toBe("Valider");
    });

    it("translates required, select and validate text into Portuguese", () => {
        const store = createStore({}, mockMutations, mockActions, {language: Language.pt});
        const wrapper = shallowMountWithTranslate(ModelOptions, store, {
            global: {
                plugins: [store]
            }, 
        });
        expect(wrapper.findComponent(DynamicForm).props("requiredText")).toBe("necessário");
        expect(wrapper.findComponent(DynamicForm).props("selectText")).toBe("Selecionar...");
        expect(wrapper.findComponent(DynamicForm).props("submitText")).toBe("Validar");
    });

    it("displays loading spinner while fetching is true", () => {
        const store = createStore({fetching: true});
        const rendered = shallowMountWithTranslate(ModelOptions, store, {
            global: {
                plugins: [store]
            }, 
        });
        expect(rendered.findAllComponents(DynamicForm).length).toBe(0);
        expect(rendered.findAllComponents(LoadingSpinner).length).toBe(1);
        expectTranslated(rendered.find("#loading-message"), "Loading options",
            "Chargement de vos options.", "Opções de carregamento", store);
    });

    it("renders as expected while validating", () => {
        const store = createStore({validating: true});
        const rendered = shallowMountWithTranslate(ModelOptions, store, {
            global: {
                plugins: [store]
            }, 
        });
        expect(rendered.find("#validating").findComponent(LoadingSpinner).exists()).toBe(true);
        expectTranslated(rendered.find("#validating"), "Validating...",
            "Validation en cours...", "A validar...", store);
    });

    it("displays tick and message if valid is true", () => {
        const store = createStore({valid: true});
        const rendered = shallowMountWithTranslate(ModelOptions, store, {
            global: {
                plugins: [store]
            }, 
        });
        expectTranslated(rendered.find("h4"), "Options are valid",
            "Les options sont valides", "As opções são válidas", store);
        expect(rendered.findAllComponents(Tick).length).toBe(1);
        expect(rendered.find("#validating").exists()).toBe(false);
    });


    it("does not display tick or message if valid is false", () => {
        const store = createStore({valid: false});
        const rendered = shallowMountWithTranslate(ModelOptions, store, {
            global: {
                plugins: [store]
            }, 
        });
        expect(rendered.findAll("h4").length).toBe(0);
        expect(rendered.findAllComponents(Tick).length).toBe(0);
    });

    it("does display error message when error occurred", () => {
        const error = mockError("validation error occurred")
        const store = createStore({validateError: error});
        const rendered = shallowMountWithTranslate(ModelOptions, store, {
            global: {
                plugins: [store]
            }, 
        });
        expect(rendered.findAllComponents(ErrorAlert).length).toBe(1);
        expect(rendered.findComponent(ErrorAlert).props().error).toStrictEqual(error);
    })

    it("does display error message when model option encounter Errors", () => {
        const error = mockError("Errors")
        const store = createStore({optionsError: error});
        const rendered = shallowMountWithTranslate(ModelOptions, store, {
            global: {
                plugins: [store]
            }, 
        });
        expect(rendered.findAllComponents(ErrorAlert).length).toBe(1);
        expect(rendered.findComponent(ErrorAlert).props().error).toStrictEqual(error);
    })

    it("triggers update mutation when dynamic form changes", async () => {
        const updateMock = vi.fn();
        const oldControlSection: DynamicControlSection = {
            label: "label 1",
            controlGroups: []
        };

        const store = createStore(
            {
                optionsFormMeta: {controlSections: [oldControlSection]}
            },
            {
                [ModelOptionsMutation.Update]: updateMock
            });

        const rendered = mountWithTranslate(ModelOptions, store, {
            global: {
                plugins: [store]
            }, 
        });

        const newControlSection: DynamicControlSection = {
            label: "TEST",
            controlGroups: []
        };

        (rendered.findComponent(DynamicForm).vm as any).$emit("update:formMeta", {controlSections: [newControlSection]});

        await nextTick();
        expect(updateMock.mock.calls[0][1]).toStrictEqual({
            controlSections: [newControlSection]
        });
    });

    it("dispatches fetch run option event when form submit event is fired", () => {
        const fetchMock = vi.fn();
        const store = createStore({}, mockMutations, {

            ...mockActions,
            fetchModelRunOptions: fetchMock

        });
        shallowMount(ModelOptions, {
            global: {
                plugins: [store]
            }
        });

        expect(fetchMock.mock.calls.length).toBe(1);
    });

    it("dispatches validation event when form submit event is fired", async () => {
        const validateMock = vi.fn();
        const options = {"area_scope": "MWI"}
        const store = createStore({}, mockMutations, {

            ...mockActions,
            validateModelOptions: validateMock

        });
        const rendered = shallowMount(ModelOptions, {
            global: {
                plugins: [store]
            }
        });
        (rendered.findComponent(DynamicForm).vm as any).$emit("submit", options);

        await nextTick();
        expect(validateMock.mock.calls.length).toBe(1);
        expect(validateMock.mock.calls[0][1]).toStrictEqual(options);
    });

    it("does not dispatch validation when form submit event does not have options", async () => {
        const validateMock = vi.fn();
        const store = createStore({}, mockMutations, {

            ...mockActions,
            validateModelOptions: validateMock

        });
        const rendered = shallowMount(ModelOptions, {
            global: {
                plugins: [store]
            }
        });
        (rendered.findComponent(DynamicForm).vm as any).$emit("submit");

        await nextTick();
        expect(validateMock.mock.calls.length).toBe(0);
    });
});
