import {mount, shallowMount} from '@vue/test-utils';
import Vuex from 'vuex';
import {DataExplorationState, storeOptions} from "../../app/store/dataExploration/dataExploration";

const baselineActions = {
    getBaselineData: vi.fn()
};

const surveyAndProgramActions = {
    getSurveyAndProgramData: vi.fn()
};

const adrActions = {
    getSchemas: vi.fn()
};

const genericChartActions = {
    getGenericChartMetadata: vi.fn()
};

storeOptions.modules!!.baseline!!.actions = baselineActions;
storeOptions.modules!!.surveyAndProgram!!.actions = surveyAndProgramActions;
storeOptions.modules!!.adr!!.actions = adrActions;
storeOptions.modules!!.genericChart!!.actions = genericChartActions;

console.error = vi.fn();

// only import the app after we have replaced action with mocks
// as the app will call these actions on import
import HintDataExploration from '../../app/components/HintDataExploration.vue';
import {LanguageMutation} from "../../app/store/language/mutations";
import {Language} from "../../app/store/translations/locales";
import { nextTick } from 'vue';
import { Mock } from 'vitest';

describe("Data Exploration App", () => {

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
        localStoreOptions.modules!!.baseline.state.ready = ready;
        localStoreOptions.modules!!.surveyAndProgram.state.ready = ready;
        return new Vuex.Store<DataExplorationState>(localStoreOptions);
    };

    it("loads input data on mount", async () => {
        const store = getStore();
        mount(HintDataExploration, {
            global: {
                plugins: [store]
            }
        });
        await nextTick();
        expect(baselineActions.getBaselineData).toHaveBeenCalled();
        expect(surveyAndProgramActions.getSurveyAndProgramData).toHaveBeenCalled();
        expect(adrActions.getSchemas).toHaveBeenCalled();
        expect(genericChartActions.getGenericChartMetadata).toHaveBeenCalled();
    });

    it("gets language from state", () => {
        const store = getStore();
        const rendered = shallowMount(HintDataExploration, {
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
        const rendered = shallowMount(HintDataExploration, {
            global: {
                plugins: [store]
            },
            attachTo: "#root"
        });

        store.commit(LanguageMutation.ChangeLanguage, {payload: Language.pt});
        await nextTick();

        expect(document.documentElement.lang).toBe("pt");
    });

});
