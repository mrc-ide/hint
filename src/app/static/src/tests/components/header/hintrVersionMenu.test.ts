import Vuex from "vuex";
import {expectTranslated, mountWithTranslate, shallowMountWithTranslate} from "../../testHelpers";
import HintrVersionMenu from "../../../app/components/header/HintrVersionMenu.vue";
import DropDown from "../../../app/components/header/DropDown.vue";
import registerTranslations from "../../../app/store/translations/registerTranslations";
import {mockHintrVersionState} from "../../mocks";
import {emptyState} from "../../../app/root";
import {currentHintVersion} from "../../../app/hintVersion";

describe("Hintr Menu Version", () => {

    const mockGetHinrVersion = vi.fn();
    const createStore = () => {
        const store = new Vuex.Store({
            state: emptyState(),
            modules: {
                hintrVersion: {
                    namespaced: true,
                    state: mockHintrVersionState(),
                    actions: {
                        getHintrVersion: mockGetHinrVersion
                    }
                }
            }
        });
        registerTranslations(store);
        return store;
    }

    it("hintr version menu displays span for (5) items", async() => {
        const store = createStore();
        const wrapper = mountWithTranslate(HintrVersionMenu, store, {
            global: {
                plugins: [store]
            }
        });

        expect(wrapper.findAll("span").length).toBe(5);
    });

    it("renders drop down with delay property true", () => {
        const store = createStore();
        const wrapper = shallowMountWithTranslate(HintrVersionMenu, store, {
            global: {
                plugins: [store]
            }
        });

        const dropDown = wrapper.findComponent(DropDown);
        expect(dropDown.props("delay")).toBe(true);
    });

    it("hintr version menu displays link to news site", async () => {
        const store = createStore();
        const wrapper = mountWithTranslate(HintrVersionMenu, store, {
            global: {
                plugins: [store]
            }
        });

        const links = wrapper.findAll(".dropdown-item");
        const link = links[0];
        await expectTranslated(link, "News", "Nouvelles", "Notícias", store);
        expect(link.attributes("href")).toBe("https://naomi.unaids.org/news");
        expect(link.attributes("target")).toBe("_blank");
    });

    it("hintr version menu displays current hint version", async() => {
        const store = createStore();
        const wrapper = mountWithTranslate(HintrVersionMenu, store, {
            global: {
                plugins: [store]
            }
        });

        expect(wrapper.findAll("span")[4].text()).toBe(`hint : v${currentHintVersion}`);
    });

    it("hintr version menu gets initial version placeholder before getter ", async() => {
        const store = createStore();
        const wrapper = shallowMountWithTranslate(HintrVersionMenu, store, {
            global: {
                plugins: [store]
            }
        });

        expect(wrapper.findComponent(DropDown).props("text")).toBe("vunknown");
    });

    it("expect get method to have been called", () => {
        expect(mockGetHinrVersion).toHaveBeenCalled()
    });
})
