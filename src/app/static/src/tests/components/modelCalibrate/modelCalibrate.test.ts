import Vuex, {Store} from "vuex";
import {
    mockCalibratePlotResponse,
    mockError,
    mockModelCalibrateState,
    mockOptionsFormMeta,
    mockRootState
} from "../../mocks";
import registerTranslations from "../../../app/store/translations/registerTranslations";
import {RootState} from "../../../app/root";
import {ModelCalibrateState} from "../../../app/store/modelCalibrate/modelCalibrate";
import ModelCalibrate from "../../../app/components/modelCalibrate/ModelCalibrate.vue";
import CalibrationResults from "../../../app/components/modelCalibrate/CalibrationResults.vue";
import {DynamicForm} from "@reside-ic/vue-next-dynamic-form";
import LoadingSpinner from "../../../app/components/LoadingSpinner.vue";
import {expectTranslated, mountWithTranslate, shallowMountWithTranslate} from "../../testHelpers";
import Tick from "../../../app/components/Tick.vue";
import ErrorAlert from "../../../app/components/ErrorAlert.vue";
import {ModelCalibrateMutation} from "../../../app/store/modelCalibrate/mutations";
import {Language} from "../../../app/store/translations/locales";

describe("Model calibrate component", () => {
    const getStore = (state: Partial<ModelCalibrateState> = {},
                      fetchAction = vi.fn(),
                      submitAction = vi.fn(),
                      resumeCalibrateAction = vi.fn(),
                      updateMutation = vi.fn(),
                      rootState: Partial<RootState> = {}) => {
        const store = new Vuex.Store({
            state: mockRootState(rootState),
            modules: {
                modelCalibrate: {
                    namespaced: true,
                    state: mockModelCalibrateState(state),
                    actions: {
                        fetchModelCalibrateOptions: fetchAction,
                        submit: submitAction,
                        resumeCalibrate: resumeCalibrateAction
                    },
                    mutations: {
                        [ModelCalibrateMutation.Update]: updateMutation
                    }
                }
            }
        });
        registerTranslations(store);
        return store;
    };

    const getWrapper = (store: Store<RootState>) => {
        return shallowMountWithTranslate(ModelCalibrate, store, {global: {plugins: [store]}});
    };


    it("renders as expected when loading", async () => {
        const store = getStore({fetching: true});
        const wrapper = getWrapper(store);
        expect(wrapper.findComponent(LoadingSpinner).exists()).toBe(true);
        await expectTranslated(wrapper.find("#loading-message"), "Loading options",
            "Chargement de vos options.", "Opções de carregamento", store);
        expect(wrapper.findComponent(DynamicForm).exists()).toBe(false);
        expect(wrapper.find("#calibration-complete").exists()).toBe(false);
        expect(wrapper.findComponent(ErrorAlert).exists()).toBe(false);
        expect(wrapper.find("#calibrating").exists()).toBe(false);
        expect(wrapper.find("button").exists()).toBe(false);
    });

    it("invokes fetch options action on mount", () => {
        const mockFetch = vi.fn();
        const store = getStore({}, mockFetch);
        getWrapper(store);
        expect(mockFetch.mock.calls.length).toBe(1);
    });

    it("renders options as expected", async () => {
        const store = getStore({optionsFormMeta: mockOptionsFormMeta()});
        const wrapper = mountWithTranslate(ModelCalibrate, store, {
            global: {
                plugins: [store]
            }, 
        });

        expect(wrapper.findComponent(LoadingSpinner).exists()).toBe(false);
        expect(wrapper.find("#loading-message").exists()).toBe(false);
        const form = wrapper.findComponent(DynamicForm);
        expect(form.props("requiredText")).toBe("required");
        expect(form.props("selectText")).toBe("Select...");
        expect(form.props("includeSubmitButton")).toBe(false);
        expect(form.find("h3").text()).toBe("Test Section");
        expect(form.find(".text-muted").text()).toBe("Just a test section");
        expect((form.find("input").element as HTMLInputElement).value).toBe("5");
        await expectTranslated(wrapper.find("button"), "Calibrate", "Calibrer", "Calibrar", store);
        expect(wrapper.find("button").classes()).toContain("btn-submit");
        expect(wrapper.find("button").classes()).not.toContain("btn-secondary");
        expect((wrapper.find("button").element as HTMLButtonElement).disabled).toBe(false);
        expect(wrapper.find("#calibration-complete").exists()).toBe(false);
    });

    it("translates required text", () => {
        const store = getStore({}, vi.fn(), vi.fn(), vi.fn(), vi.fn(), {language: Language.fr});
        const wrapper = shallowMountWithTranslate(ModelCalibrate, store, {
            global: {
                plugins: [store]
            }, 
        });
        expect(wrapper.findComponent(DynamicForm).props("requiredText")).toBe("obligatoire");
    });

    it("translates select text", () => {
        const store = getStore({}, vi.fn(), vi.fn(), vi.fn(), vi.fn(), {language: Language.fr});
        const wrapper = shallowMountWithTranslate(ModelCalibrate, store, {
            global: {
                plugins: [store]
            }, 
        });
        expect(wrapper.findComponent(DynamicForm).props("selectText")).toBe("Sélectionner...");
    });

    it("renders calibration complete message", async () => {
        const store = getStore({complete: true});
        const wrapper = getWrapper(store);
        expect(wrapper.find("#calibration-complete").findComponent(Tick).exists()).toBe(true);
        await expectTranslated(wrapper.find("#calibration-complete h4"), "Calibration complete",
            "Calibrage du modèle terminé", "Calibração concluída", store);
    });

    it("renders error", () => {
        const error = mockError("TEST ERROR");
        const store = getStore({error});
        const wrapper = getWrapper(store);
        expect(wrapper.findComponent(ErrorAlert).props("error")).toStrictEqual(error);
    });

    it("renders as expected while calibrating with no progress data", async () => {
        const store = getStore({calibrating: true});
        const wrapper = getWrapper(store);
        expect(wrapper.find("#calibrating").findComponent(LoadingSpinner).exists()).toBe(true);
        await expectTranslated(wrapper.find("#calibrating"), "Calibrating...",
            "Calibrage en cours...", "Calibrar...", store);
        expect((wrapper.find("button").element as HTMLButtonElement).disabled).toBe(true);
        expect(wrapper.find("button").classes()).toContain("btn-secondary");
        expect(wrapper.find("button").classes()).not.toContain("btn-submit");
    });

    it("renders string progress message", () => {
        const store = getStore({calibrating: true, status: {progress: ["Test progress"]} as any});
        const wrapper = getWrapper(store);
        expect(wrapper.find("#calibrating").text()).toBe("Test progress");
    });

    it("renders ProgressPhase message", () => {
        const store = getStore({calibrating: true, status: {progress: [{name: "Test name", helpText: "Test help"}]} as any});
        const wrapper = getWrapper(store);
        expect(wrapper.find("#calibrating").text()).toBe("Test name: Test help");
    });

    it("setting options value commits update mutation", async () => {
        const mockUpdate = vi.fn();
        const store = getStore({optionsFormMeta: mockOptionsFormMeta()}, vi.fn(), vi.fn(), vi.fn(), mockUpdate);
        const wrapper = mountWithTranslate(ModelCalibrate, store, {
            global: {
                plugins: [store]
            }, 
        });

        await wrapper.findComponent(DynamicForm).find("input").setValue("6");
        expect(mockUpdate.mock.calls.length).toBe(1);
        const newFormData = mockUpdate.mock.calls[0][1];
        expect(newFormData.controlSections[0].controlGroups[0].controls[0].value).toBe(6);
    });

    it("clicking Calibrate button invokes submit calibrate action", async () => {
        const mockSubmit = vi.fn();
        const store = getStore({optionsFormMeta: mockOptionsFormMeta()}, vi.fn(), mockSubmit);
        const wrapper = mountWithTranslate(ModelCalibrate, store, {
            global: {
                plugins: [store]
            }, 
        });
        await wrapper.find("button").trigger("click");
        expect(mockSubmit.mock.calls.length).toBe(1);

    });

    it("renders generating calibration results message", async () => {
        const store = getStore({complete: true, generatingCalibrationPlot: true});
        const wrapper = getWrapper(store);
        expect(wrapper.find("#genCalibResults").findComponent(LoadingSpinner).exists()).toBe(true);
        await expectTranslated(wrapper.find("#genCalibResults span"), "Generating calibration results",
        "Générer des résultats d'étalonnage", "Gerando resultados de calibração", store);
    });

    it("renders calibration plot and label if calibration is complete", async () => {
        const store = getStore({complete: true, calibratePlotResult: mockCalibratePlotResponse()});
        const wrapper = getWrapper(store);
        expect(wrapper.findComponent(CalibrationResults).exists()).toBe(true);
        await expectTranslated(wrapper.find("#reviewResults"), "(Review results below)",
        "(Consultez les résultats ci-dessous)", "(Analise os resultados abaixo)", store);
    });

    it("it does not render calibration plot and label if calibration is incomplete", () => {
        const store = getStore({complete: false, calibratePlotResult: mockCalibratePlotResponse()});
        const wrapper = getWrapper(store);
        expect(wrapper.findComponent(CalibrationResults).exists()).toBe(false);
        expect(wrapper.find("#reviewResults").exists()).toBe(false)
    });

    it("calls resume calibrate on mount", () => {
        const mockResumeCalibrate = vi.fn();
        const store = getStore({}, vi.fn(), vi.fn(), mockResumeCalibrate, vi.fn());
        getWrapper(store);
        expect(mockResumeCalibrate.mock.calls.length).toBe(1);
    });
});
