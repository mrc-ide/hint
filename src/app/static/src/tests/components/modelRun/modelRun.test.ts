import {flushPromises, shallowMount} from '@vue/test-utils';
import Vuex, {Store} from 'vuex';
import {nextTick} from 'vue';
import {
    mockAxios,
    mockError,
    mockModelOptionsState,
    mockModelResultResponse,
    mockModelRunState,
    mockModelStatusResponse,
    mockSuccess
} from "../../mocks";
import {actions} from "../../../app/store/modelRun/actions";
import {mutations} from "../../../app/store/modelRun/mutations";
import {modelRunGetters, ModelRunState} from "../../../app/store/modelRun/modelRun";
import {getters as stepperGetters} from "../../../app/store/stepper/getters";
import {getters as rootGetters} from "../../../app/store/root/getters";
import {emptyState, RootState} from "../../../app/root";
import ModelRun from "../../../app/components/modelRun/ModelRun.vue";
import Modal from "../../../app/components/Modal.vue";
import Tick from "../../../app/components/Tick.vue";
import {ModelStatusResponse} from "../../../app/generated";
import ErrorAlert from "../../../app/components/ErrorAlert.vue";
import LoadingSpinner from "../../../app/components/LoadingSpinner.vue";
import ProgressBar from "../../../app/components/progress/ProgressBar.vue";
import registerTranslations from "../../../app/store/translations/registerTranslations";
import {expectTranslated, mountWithTranslate, shallowMountWithTranslate} from "../../testHelpers";

describe("Model run component", () => {

    const createStore = (state: Partial<ModelRunState> = {}, testActions: any = actions, sGetters = stepperGetters): Store<RootState> => {
        const store = new Vuex.Store({
            state: emptyState(),
            getters: rootGetters,
            modules: {
                modelRun: {
                    namespaced: true,
                    state: mockModelRunState(state),
                    actions: testActions,
                    mutations,
                    getters: modelRunGetters
                },
                modelOptions: {
                    state: mockModelOptionsState()
                },
                stepper: {
                    getters: sGetters,
                    namespaced: true,
                    state: {
                        steps: []
                    }
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

    const mockStatus = mockModelStatusResponse();

    beforeEach(() => {
        mockAxios.onPost(`/model/run/`)
            .reply(200, mockSuccess({id: "1234"}));

        mockAxios.onGet(`/model/status/1234`)
            .reply(200, mockSuccess(mockStatus));

        mockAxios.onGet(`/model/result/1234`)
            .reply(200, mockSuccess(mockModelResultResponse()));

        mockAxios.onPost(`/model/cancel/123`)
            .reply(200, mockSuccess(null));
    });

    afterEach(() => {
        mockAxios.reset();
    });

    beforeAll(() => {
        vi.useFakeTimers();
    })

    afterAll(() => {
        vi.useRealTimers();
    })

    it("run models and polls for status", async () => {
        const store = createStore();
        const wrapper = shallowMountWithTranslate(ModelRun, store, {
            global: {
                plugins: [store]
            }
        });
        const button = wrapper.find("button");
        expect(button.text()).toBe("Fit model");
        button.trigger("click");
        await flushPromises();
        expect(wrapper.find("button").attributes().disabled).toBe("");
        expect(store.state.modelRun.status).toStrictEqual({id: "1234"});
        expect(store.state.modelRun.modelRunId).toBe("1234");
        expect(store.state.modelRun.statusPollId).not.toBe(-1);
        expect(wrapper.findComponent(Modal).props().open).toBe(true);
        vi.advanceTimersByTime(2000);
        await flushPromises();
        expect(wrapper.find("button").attributes().disabled).toBeUndefined();
        expect(store.state.modelRun.status).toStrictEqual(mockStatus);
        expect(store.state.modelRun.modelRunId).toBe("1234");
        expect(store.state.modelRun.statusPollId).toBe(-1);
        expect(wrapper.findComponent(Modal).props().open).toBe(false);
    });

    it("does not immediately run model if edits require confirmation", async () => {
        const store = createStore({}, {}, {...stepperGetters, editsRequireConfirmation: () => true});
        const wrapper = shallowMountWithTranslate(ModelRun, store, {
            global: {
                plugins: [store]
            }
        });
        const button = wrapper.find("button");
        expect(button.text()).toBe("Fit model");
        button.trigger("click");
        await nextTick();
        expect((wrapper.vm as any).$data.showReRunConfirmation).toStrictEqual(true);
        expect(wrapper.find("button").attributes().disabled).toBeUndefined();
        expect(store.state.modelRun.status).toStrictEqual({});
        expect(store.state.modelRun.modelRunId).toBe("");
        expect(store.state.modelRun.statusPollId).toBe(-1);
        expect(wrapper.findComponent(Modal).props().open).toBe(false);
    });

    it("polls for status if runId already exists, pollId does not, and still running", async () => {
        const store = createStore({
            modelRunId: "1234",
            status: {
                id: "123455abcdef",
                done: false,
                success: null,
                errors: null
            } as any,
            startedRunning: true,
            result: null
        });
        const wrapper = shallowMountWithTranslate(ModelRun, store, {
            global: {
                plugins: [store]
            }
        });
        vi.advanceTimersByTime(2000);
        await flushPromises();
        expect(mockAxios.history.get[0].url).toBe(`/model/status/1234`);

        expect(wrapper.find("button").attributes().disabled).toBeUndefined();
        expect(store.state.modelRun.status).toStrictEqual(mockStatus);
        expect(store.state.modelRun.modelRunId).toBe("1234");
        expect(store.state.modelRun.statusPollId).toBe(-1);
        expect(wrapper.findComponent(Modal).props().open).toBe(false);
    });

    it("does not poll for status if runId exists, pollId does not, and run completed successfully", async () => {
        const store = createStore({
            modelRunId: "1234",
            status: {
                id: "123455abcdef",
                done: true,
                success: true,
                errors: null
            } as any,
            result: ["result data"] as any
        });
        const wrapper = shallowMountWithTranslate(ModelRun, store, {
            global: {
                plugins: [store]
            }
        });
        vi.advanceTimersByTime(2000);
        await flushPromises();
        expect(mockAxios.history.get.length).toBe(0);

        expect(wrapper.find("button").attributes().disabled).toBeUndefined();
        expect(wrapper.findComponent(Modal).props().open).toBe(false);
    });

    it("does not poll for status if runId exists, pollId does not, and run failed", async () => {
        const store = createStore({
            modelRunId: "1234",
            status: {
                id: "123455abcdef",
                done: true,
                success: false,
                errors: ["Run failed"]
            } as any,
            result: null
        });
        const wrapper = shallowMountWithTranslate(ModelRun, store, {
            global: {
                plugins: [store]
            }
        });
        vi.advanceTimersByTime(2000);
        await flushPromises();
        expect(mockAxios.history.get.length).toBe(0);

        expect(wrapper.find("button").attributes().disabled).toBeUndefined();
        expect(wrapper.findComponent(Modal).props().open).toBe(false);
    });


    it("modal does not close until run result fetched", async () => {
        const getResultMock = vi.fn();
        const store = createStore({}, {...actions, getResult: getResultMock});
        const wrapper = shallowMountWithTranslate(ModelRun, store, {
            global: {
                plugins: [store]
            }
        });
        wrapper.find("button").trigger("click");
        await flushPromises();
        expect(wrapper.find("button").attributes().disabled).toBe("");
        expect(store.state.modelRun.status).toStrictEqual({id: "1234"});
        expect(store.state.modelRun.modelRunId).toBe("1234");
        expect(store.state.modelRun.statusPollId).not.toBe(-1);
        expect(wrapper.findComponent(Modal).props().open).toBe(true);
        vi.advanceTimersByTime(2000);
        await flushPromises();
        // it should still be open because the result is missing
        expect(wrapper.find("button").attributes().disabled).toBe("");
        expect(store.state.modelRun.result).toBe(null);
        expect(store.state.modelRun.status.success).toBe(true);
        expect(wrapper.findComponent(Modal).props().open).toBe(true);
        clearInterval(store.state.modelRun.statusPollId);
    });

    it("does not start polling on created if pollId already exists", async () => {
        const store = createStore({modelRunId: "1234", statusPollId: 1});
        shallowMount(ModelRun, {global: {plugins: [store]}});
        vi.advanceTimersByTime(2000);
        await flushPromises();
        expect(mockAxios.history.get.length).toBe(0);
    });

    it("button is disabled and modal shown if status is started", () => {
        const store = createStore({
            status: {done: false} as ModelStatusResponse,
            startedRunning: true
        });
        const wrapper = shallowMountWithTranslate(ModelRun, store, {
            global: {
                plugins: [store]
            }
        });
        expect(wrapper.find("button").attributes().disabled).toBe("");
        expect(wrapper.findComponent(Modal).props().open).toBe(true);
    });

    it("loading spinner is shown until progress bars appear", () => {

        const store = createStore({
            status: {done: false} as ModelStatusResponse,
            startedRunning: true
        });

        const wrapper = mountWithTranslate(ModelRun, store, {
            global: {
                plugins: [store]
            }
        });
        expect(wrapper.findComponent(Modal).props().open).toBe(true);
        expectTranslated(wrapper.findComponent(Modal).find("h4"), "Initialising model fitting",
            "Initialisation de l'ajustement du modèle",
            "Inicialização do ajuste do modelo", store);
        expect(wrapper.findComponent(Modal).findAllComponents(LoadingSpinner).length).toBe(1);
        expect(wrapper.findComponent(Modal).findAllComponents(ProgressBar).length).toBe(0);
    });

    it("loading spinner is not shown once progress bars appear", () => {

        const store = createStore({
            status: {
                id: "1234",
                done: false,
                progress: [{started: true, complete: false, name: "phase 1"}]
            } as ModelStatusResponse,
            startedRunning: true
        });

        const wrapper = mountWithTranslate(ModelRun, store, {
            global: {
                plugins: [store]
            }
        });
        expect(wrapper.findComponent(Modal).props().open).toBe(true);
        expect(wrapper.findComponent(Modal).findAll("h4").length).toBe(0);
        expect(wrapper.findComponent(Modal).findAllComponents(LoadingSpinner).length).toBe(0);
        expect(wrapper.findComponent(Modal).findAllComponents(ProgressBar).length).toBe(1);
    });

    it("renders progress phases with numbers in titles", () => {

        const store = createStore({
            status: {
                id: "1234",
                done: false,
                progress: [{started: true, complete: false, name: "phase 1"},
                    {started: true, complete: false, name: "phase 2"}]
            } as ModelStatusResponse,
            startedRunning: true
        });

        const wrapper = mountWithTranslate(ModelRun, store, {
            global: {
                plugins: [store]
            }
        });
        expect(wrapper.findComponent(Modal).props().open).toBe(true);
        expect(wrapper.findComponent(Modal).findAllComponents(ProgressBar).length).toBe(2);
        expect(wrapper.findComponent(Modal).findAllComponents(ProgressBar)[0].props("phase"))
            .toStrictEqual({
                started: true, complete: false, name: "1. phase 1"
            });
        expect(wrapper.findComponent(Modal).findAllComponents(ProgressBar)[1].props("phase"))
            .toStrictEqual({
                started: true, complete: false, name: "2. phase 2"
            });
    });

    it("on success button is not enabled until result exists", () => {

        const store = createStore({
            status: {success: true, done: true} as ModelStatusResponse,
            startedRunning: true
        });

        const wrapper = shallowMountWithTranslate(ModelRun, store, {
            global: {
                plugins: [store]
            }
        });
        expect(wrapper.find("button").attributes().disabled).toBe("");
        expect(wrapper.findComponent(Modal).props().open).toBe(true);
    });

    it("button is enabled once status is success and result exists", () => {
        const store = createStore({
            result: mockModelResultResponse(),
            status: {success: true, done: true} as ModelStatusResponse,
            startedRunning: false
        });

        const wrapper = shallowMountWithTranslate(ModelRun, store, {
            global: {
                plugins: [store]
            }
        });
        expect(wrapper.find("button").attributes().disabled).toBeUndefined();
        expect(wrapper.findComponent(Modal).props().open).toBe(false);
    });

    it("button is enabled once status is done without success", () => {
        const store = createStore({
            result: mockModelResultResponse(),
            status: {success: false, done: true} as ModelStatusResponse,
            startedRunning: false
        });

        const wrapper = shallowMountWithTranslate(ModelRun, store, {
            global: {
                plugins: [store]
            }
        });
        expect(wrapper.find("button").attributes().disabled).toBeUndefined();
        expect(wrapper.findComponent(Modal).props().open).toBe(false);
    });

    it("displays message and tick if step is complete", () => {
        const store = createStore({
            result: mockModelResultResponse(),
            status: {id: "1234", success: true, done: true} as ModelStatusResponse
        });
        const wrapper = shallowMountWithTranslate(ModelRun, store, {
            global: {
                plugins: [store]
            }
        });
        expectTranslated(wrapper.find("#model-run-complete"), "Model fitting complete",
            "Ajustement du modèle terminé", "Ajuste de modelo concluído", store);
        expect(wrapper.find("#model-run-complete").classes()).toStrictEqual(["mt-3", "d-flex", "align-items-center", "mr-2"]);
        expect(wrapper.findAllComponents(Tick).length).toBe(1);
    });

    it("does not display message or tick if result is not fetched", () => {
        const store = createStore({
            status: {id: "1234", success: true, done: true} as ModelStatusResponse
        });
        const wrapper = shallowMountWithTranslate(ModelRun, store, {
            global: {
                plugins: [store]
            }
        });
        expect(wrapper.findAll("#model-run-complete").length).toBe(0);
        expect(wrapper.findAllComponents(Tick).length).toBe(0);
    });

    it("does not display message or tick if run was successful but error fetching result", () => {
        const store = createStore({status: {success: true} as ModelStatusResponse, errors: [mockError("fetch error")]});
        const wrapper = shallowMountWithTranslate(ModelRun, store, {
            global: {
                plugins: [store]
            }
        });
        expect(wrapper.findAll("#model-run-complete").length).toBe(0);
        expect(wrapper.findAllComponents(Tick).length).toBe(0);
    });

    it("displays error alerts for errors", () => {
        const firstError = mockError("first error");
        const secondError = mockError("second error");
        const store = createStore({errors: [firstError, secondError]});
        const wrapper = shallowMountWithTranslate(ModelRun, store, {
            global: {
                plugins: [store]
            }
        });

        const errorAlerts = wrapper.findAllComponents(ErrorAlert);
        expect(errorAlerts.length).toBe(2);
        expect(errorAlerts[0].props().error).toStrictEqual(firstError);
        expect(errorAlerts[1].props().error).toStrictEqual(secondError);
    });

    it("displays no error alerts if no errors", () => {
        const store = createStore();
        const wrapper = shallowMountWithTranslate(ModelRun, store, {
            global: {
                plugins: [store]
            }
        });
        const errorAlerts = wrapper.findAll("error-alert-stub");
        expect(errorAlerts.length).toBe(0);
    });

    it("cancel fitting button invokes action to cancel model fitting", async () => {

        const store = createStore({
            status: mockModelStatusResponse({id: "123", done: false}),
            modelRunId: "123",
            statusPollId: 123
        });

        const wrapper = mountWithTranslate(ModelRun, store, {
            global: {
                plugins: [store]
            }
        });

        await wrapper.find("#cancel-model-run").trigger("click");

        expect(wrapper.findComponent(Modal).props().open).toBe(false);
        expect(store.state.modelRun.modelRunId).toBe("");
        expect(store.state.modelRun.statusPollId).toBe(-1);
        expect(store.state.modelRun.status).toStrictEqual({});
    });

    it("confirmReRun clears and re-runs model and hides dialog", async () => {
        const mockRun = vi.fn();
        const store = createStore({result: ["TEST RESULT"] as any},  {run: mockRun});
        const wrapper = shallowMountWithTranslate(ModelRun, store, {
            global: {
                plugins: [store]
            }
        });
        await wrapper.setData({showReRunConfirmation: true});

        (wrapper.vm as any).confirmReRun();
        await nextTick();

        expect(store.state.modelRun.result).toBe(null);
        expect(mockRun.mock.calls.length).toBe(1);
        expect((wrapper.vm as any).$data.showReRunConfirmation).toBe(false);
    });

});
