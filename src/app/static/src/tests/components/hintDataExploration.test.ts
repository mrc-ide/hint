import Vuex from 'vuex';
import { shallowMount } from "@vue/test-utils";
import HintDataExploration from "../../app/components/HintDataExploration.vue";
import { mockDataExplorationState } from "../mocks";
import registerTranslations from "../../app/store/translations/registerTranslations";
import DataExplorationHeader from '../../app/components/header/DataExplorationHeader.vue';
import Errors from '../../app/components/Errors.vue';
import { Language } from '../../app/store/translations/locales';
import { nextTick } from 'vue';

describe("Hint data exploration", () => {
    const mockGetBaselineData = vi.fn();
    const mockGetSurveyAndProgramData = vi.fn();
    const mockGetSchemas = vi.fn();
    const mockGetGenericChartMetadata = vi.fn();

    const createStore = () => {
        const store = new Vuex.Store({
            state: mockDataExplorationState(),
            modules: {
                adr: {
                    namespaced: true,
                    actions: {
                        getSchemas: mockGetSchemas
                    }
                },
                baseline: {
                    namespaced: true,
                    actions: {
                        getBaselineData: mockGetBaselineData
                    }
                },
                surveyAndProgram: {
                    namespaced: true,
                    actions: {
                        getSurveyAndProgramData: mockGetSurveyAndProgramData
                    }
                },
                genericChart: {
                    namespaced: true,
                    actions: {
                        getGenericChartMetadata: mockGetGenericChartMetadata
                    }
                }
            }
        });
        registerTranslations(store);
        return store
    };

    const getWrapper = () => {
        const store = createStore();
        return shallowMount(HintDataExploration, {
            global: {
                plugins: [store]
            },
            props: {
                title: "DETitle",
                user: "DEUser"
            }
        })
    };

    beforeEach(() => {
        vi.resetAllMocks()
    })

    it("renders as expected", () => {
        const wrapper = getWrapper();
        expect(wrapper.findComponent(DataExplorationHeader).exists()).toBe(true);
        expect(wrapper.findComponent(DataExplorationHeader).props("title")).toBe("DETitle");
        expect(wrapper.findComponent(DataExplorationHeader).props("user")).toBe("DEUser");
        expect(wrapper.findComponent(Errors).exists()).toBe(true);
        expect(wrapper.findComponent(Errors).props("title")).toBe("DETitle");
        expect(wrapper.find("div").classes()).toStrictEqual(["container", "mb-5"]);
    });

    it("calls actions before mount", () => {
        getWrapper();
        expect(mockGetBaselineData).toBeCalledTimes(1);
        expect(mockGetGenericChartMetadata).toBeCalledTimes(1);
        expect(mockGetSchemas).toBeCalledTimes(1);
        expect(mockGetSurveyAndProgramData).toBeCalledTimes(1);
    });

    it("watches store language and updates document language", async () => {
        const div = document.createElement('div');
        div.id = 'root';
        document.body.appendChild(div);
        const store = createStore();
        shallowMount(HintDataExploration, {
            global: {
                plugins: [store]
            },
            props: {
                title: "DETitle",
                user: "DEUser"
            },
            attachTo: "#root"
        });
        store.state.language = Language.pt;
        await nextTick();

        expect(document.documentElement.lang).toBe("pt");
    });
});