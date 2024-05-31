import Vuex, {ActionTree, MutationTree} from "vuex";
import {nextTick} from "vue";

import ModelOptions from "../../../app/components/modelOptions/ModelOptions.vue";
import {ModelOptionsMutation} from "../../../app/store/modelOptions/mutations";
import {ModelOptionsState} from "../../../app/store/modelOptions/modelOptions";
import {ModelOptionsActions} from "../../../app/store/modelOptions/actions";
import {RootState} from "../../../app/root";
import {mockModelOptionsState, mockRootState} from "../../mocks";
import {DynamicForm} from "@reside-ic/vue-next-dynamic-form";
import ResetConfirmation from "../../../app/components/resetConfirmation/ResetConfirmation.vue";
import registerTranslations from "../../../app/store/translations/registerTranslations";
import {getters} from "../../../app/store/root/getters";
import {mountWithTranslate} from "../../testHelpers";

declare var currentUser: string;
currentUser = "guest";

describe("Model options component when edit confirmation is required", () => {

    const mockActions = {
        fetchModelRunOptions: vi.fn(),
        validateModelOptions: vi.fn()
    };

    const mockMutations = {
        [ModelOptionsMutation.UnValidate]: vi.fn(),
        [ModelOptionsMutation.Update]: vi.fn(),
        [ModelOptionsMutation.Validate]: vi.fn(),
        [ModelOptionsMutation.ModelOptionsFetched]: vi.fn(),
        [ModelOptionsMutation.FetchingModelOptions]: vi.fn()
    };

    const mockGetters = {
        editsRequireConfirmation: () => true,
        changesToRelevantSteps: () => [{number: 4, textKey: "fitModel"}]
    };

    const createStore = (props: Partial<ModelOptionsState>,
                         mutations: MutationTree<ModelOptionsState> = mockMutations,
                         actions: ModelOptionsActions & ActionTree<ModelOptionsState, RootState> = mockActions) => {
        const store = new Vuex.Store({
            getters: getters,
            state: mockRootState(),
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
            }
        });
        registerTranslations(store);
        return store;
    };

    const store = createStore({
        valid: true,
        optionsFormMeta: {
            controlSections: [{label: "l1", controlGroups: []}]
        }
    });

    beforeEach(() => {
        vi.resetAllMocks();
    });

    it("opens modal when mousedown event fires", async () => {
        const rendered = mountWithTranslate(ModelOptions, store, {
            global: {
                plugins: [store]
            }, 
        });
        const event = { preventDefault: () => {} };
        (rendered.findComponent(DynamicForm).vm as any).$emit("confirm", event)
        await nextTick();
        expect(rendered.findComponent(ResetConfirmation).props("open")).toBe(true);
    });

    it("closes modal and commits UnValidate mutation if user confirms action", async () => {
        const rendered = mountWithTranslate(ModelOptions, store, {
            global: {
                plugins: [store]
            }, 
        });
        await rendered.findComponent(DynamicForm).trigger("mousedown");
        await rendered.findComponent(ResetConfirmation).find(".btn-red").trigger("click");
        await nextTick();
        expect(rendered.findComponent(ResetConfirmation).props("open")).toBe(false);
        expect(mockMutations[ModelOptionsMutation.UnValidate].mock.calls.length).toBe(1);
    });

    it("closes modal and does not commit UnValidate mutation if user cancels action", async () => {
        const rendered = mountWithTranslate(ModelOptions, store, {
            global: {
                plugins: [store]
            }, 
        });
        await rendered.findComponent(DynamicForm).trigger("mousedown");
        await rendered.findComponent(ResetConfirmation).find(".btn-white").trigger("click");
        await nextTick();
        expect(mockMutations[ModelOptionsMutation.UnValidate].mock.calls.length).toBe(0);
        expect(rendered.findComponent(ResetConfirmation).props("open")).toBe(false);
    });

});
