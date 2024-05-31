import {mount, shallowMount} from '@vue/test-utils';
import Vuex, {Store} from 'vuex';
import {ReadyState, RootState, storeOptions} from "../../app/root";
import {localStorageManager} from "../../app/localStorageManager";
import {prefixNamespace} from "../../app/utils";
import {BaselineMutation} from "../../app/store/baseline/mutations";
import {SurveyAndProgramMutation} from "../../app/store/surveyAndProgram/mutations";
import {ModelOptionsMutation} from "../../app/store/modelOptions/mutations";

const baselineActions = {
    getBaselineData: vi.fn()
};

const surveyAndProgramActions = {
    getSurveyAndProgramData: vi.fn()
};

const modelRunActions = {
    getResult: vi.fn()
};

const modelCalibrateActions = {
    getResult: vi.fn()
};

const adrActions = {
    getSchemas: vi.fn()
};

const projectsActions = {
    getCurrentProject: vi.fn()
};

const genericChartActions = {
    getGenericChartMetadata: vi.fn()
};

storeOptions.modules!!.baseline!!.actions = baselineActions;
storeOptions.modules!!.surveyAndProgram!!.actions = surveyAndProgramActions;
storeOptions.modules!!.modelRun!!.actions = modelRunActions;
storeOptions.modules!!.modelCalibrate!!.actions = modelCalibrateActions;
storeOptions.modules!!.projects!!.actions = projectsActions;
storeOptions.modules!!.adr!!.actions = adrActions;
storeOptions.modules!!.genericChart!!.actions = genericChartActions;

console.error = vi.fn();

// only import the app after we have replaced action with mocks
// as the app will call these actions on import
import Hint from '../../app/components/Hint.vue';
import {RootMutation} from "../../app/store/root/mutations";
import {ModelRunMutation} from "../../app/store/modelRun/mutations";
import {ModelCalibrateMutation} from "../../app/store/modelCalibrate/mutations";
import {LanguageMutation} from "../../app/store/language/mutations";
import {Language} from "../../app/store/translations/locales";
import {nextTick} from 'vue';
import {Mock} from 'vitest';

describe("App", () => {

    beforeEach(() => {
        vi.clearAllMocks();
        console.log = vi.fn();
    });

    afterAll(() => {
        (console.log as Mock).mockClear();
        (console.error as Mock).mockClear();
    });

    const getStore = (ready: boolean = false) => {
        const localStoreOptions = {...storeOptions};
        Object.assign(localStoreOptions.modules!!.baseline.state,
            {
                ready,
                selectedDataset: {id: "1"}
            }
        );
        localStoreOptions.modules!!.surveyAndProgram.state.ready = ready;
        localStoreOptions.modules!!.modelRun.state.ready = ready;
        localStoreOptions.modules!!.modelCalibrate.state.ready = ready;
        return new Vuex.Store<RootState>(localStoreOptions);
    };

    it("loads input data on mount", async () => {
        const store = getStore();
        mount(Hint, {
            global: {
                plugins: [store]
            }
        });
        await nextTick();
        expect(baselineActions.getBaselineData).toHaveBeenCalled();
        expect(surveyAndProgramActions.getSurveyAndProgramData).toHaveBeenCalled();
        expect(modelRunActions.getResult).toHaveBeenCalled();
        expect(modelCalibrateActions.getResult).toHaveBeenCalled();
        expect(adrActions.getSchemas).toHaveBeenCalled();
        expect(projectsActions.getCurrentProject).toHaveBeenCalled();
        expect(genericChartActions.getGenericChartMetadata).toHaveBeenCalled();
    });

    it("gets language from state", () => {
        const store = getStore();
        const rendered = shallowMount(Hint, {
            global: {
                plugins: [store]
            }
        });

        expect((rendered.vm as any).language).toBe("en");
    });

    it("updates html lang when language changes", async () => {
        const div = document.createElement('div');
        div.id = 'root';
        document.body.appendChild(div);

        const store = getStore();
        shallowMount(Hint, {
            global: {
                plugins: [store]
            },
            attachTo: "#root"
        });

        store.commit(LanguageMutation.ChangeLanguage, {payload: Language.pt});
        await nextTick();

        expect(document.documentElement.lang).toBe("pt");
    });

    it("updates local storage on every mutation", () => {
        const store = getStore();
        const spy = vi.spyOn(localStorageManager, "saveState");
        store.commit(prefixNamespace("baseline", BaselineMutation.PopulationUploadError), {payload: "test"});

        expect(spy).toHaveBeenCalled();
    });

    it("updates language in local storage on every mutation", () => {
        const store = getStore();
        const spy = vi.spyOn(localStorageManager, "saveState");
        store.commit(LanguageMutation.ChangeLanguage, {payload: Language.pt});

        expect(spy).toHaveBeenCalled();
        expect(spy.mock.calls[0][0]?.language).toBe("pt");
        expect(localStorageManager.getState()?.language).toEqual("pt")
    });

    it("resets model options if baseline selected dataset is updated and state is ready", () => {
        const store = getStore(true);
        const spy = vi.spyOn(store, "commit");
        store.commit(prefixNamespace("baseline", BaselineMutation.SetDataset), {payload: {id: "2"}});

        expect(spy.mock.calls[1][0]).toBe(RootMutation.ResetOptions);

        expect(spy).toBeCalledTimes(2);
    });

    it("resets inputs if baseline update mutation is called and state is ready", () => {
        const store = getStore(true);
        const spy = vi.spyOn(store, "commit");
        store.commit(prefixNamespace(
                "baseline", BaselineMutation.PJNZUpdated),
            {payload: null});

        expect(spy.mock.calls[1][0]).toBe(RootMutation.ResetSelectedDataType);
        expect(spy.mock.calls[2][0].type).toBe("modelOptions/UnValidate");
        expect(spy.mock.calls[3][0]).toBe(RootMutation.ResetOutputs);

        expect(spy).toBeCalledTimes(5);
    });


    it("resets inputs if surveyAndProgram update mutation is called and state is ready", () => {
        const store = getStore(true);
        const spy = vi.spyOn(store, "commit");
        store.commit(prefixNamespace(
                "surveyAndProgram", SurveyAndProgramMutation.SurveyUpdated),
            {payload: null});

        expect(spy.mock.calls[1][0]).toBe(RootMutation.ResetSelectedDataType);
        expect(spy.mock.calls[2][0].type).toBe("modelOptions/UnValidate");
        expect(spy.mock.calls[3][0]).toBe(RootMutation.ResetOutputs);

        expect(spy).toBeCalledTimes(5);
    });

    it("resets outputs if modelOptions update mutation is called and state is ready", () => {
        const store = getStore(true);
        const spy = vi.spyOn(store, "commit");
        store.commit(prefixNamespace("modelOptions", ModelOptionsMutation.Update), {payload: null});

        expect(spy.mock.calls[1][0]).toBe(RootMutation.ResetOutputs);
        expect(spy).toBeCalledTimes(2);
    });

    it("resets outputs if modelOptions UnValidate mutation is called and state is ready", () => {
        const store = getStore(true);
        const spy = vi.spyOn(store, "commit");
        store.commit(prefixNamespace("modelOptions", ModelOptionsMutation.UnValidate));

        expect(spy.mock.calls[1][0]).toBe(RootMutation.ResetOutputs);
        expect(spy).toBeCalledTimes(2);
    });

    it("resets download if calibrate option is unvalidated", () => {
        const store = getStore(true);
        const spy = vi.spyOn(store, "commit");
        store.commit(prefixNamespace("modelCalibrate", ModelCalibrateMutation.Calibrated));

        expect(spy.mock.calls[1][0].type).toBe("downloadResults/ResetIds");
        expect(spy.mock.calls[2][0]).toBe(RootMutation.ResetDownload);
        expect(spy).toBeCalledTimes(3);
    });

    it("resets outputs if modelRun ClearResult mutation is called and state is ready", () => {
        const store = getStore(true);
        const spy = vi.spyOn(store, "commit");
        store.commit(prefixNamespace("modelRun", ModelRunMutation.ClearResult));

        expect(spy.mock.calls[1][0]).toBe(RootMutation.ResetOutputs);
        expect(spy).toBeCalledTimes(2);
    });

    it("does not commit any reset mutations if state is not ready", () => {
        const store = getStore();
        const spy = vi.spyOn(store, "commit");
        store.commit(prefixNamespace("modelOptions", ModelOptionsMutation.Update), {payload: null});
        store.commit(prefixNamespace("surveyAndProgram", SurveyAndProgramMutation.SurveyUpdated), {payload: null});
        store.commit(prefixNamespace("baseline", BaselineMutation.PJNZUpdated), {payload: null});

        expect(spy).toBeCalledTimes(3);
    });

    it("does not commit any reset mutations if only one module state is ready", () => {
        const store = getStore();
        expectModulesBeingReadyIsNotEnough([store.state.baseline], store);
        expectModulesBeingReadyIsNotEnough([store.state.surveyAndProgram], store);
        expectModulesBeingReadyIsNotEnough([store.state.modelRun], store);
    });

    it("does not commit any reset mutations if only 2 module states are ready", () => {
        const store = getStore();
        expectModulesBeingReadyIsNotEnough([store.state.baseline, store.state.surveyAndProgram], store);
        expectModulesBeingReadyIsNotEnough([store.state.baseline, store.state.modelRun], store);
        expectModulesBeingReadyIsNotEnough([store.state.modelRun, store.state.surveyAndProgram], store);
    });

    function expectModulesBeingReadyIsNotEnough(modules: ReadyState[], store: Store<RootState>) {
        // make modules ready
        modules.forEach(m => m.ready = true);

        // reset mocks from previous call
        vi.resetAllMocks();
        const spy = vi.spyOn(store, "commit");

        store.commit(prefixNamespace("modelOptions", ModelOptionsMutation.Update), {payload: null});

        // reset modules for next test
        modules.forEach(m => m.ready = true);

        expect(spy).toBeCalledTimes(1);
    }

});
