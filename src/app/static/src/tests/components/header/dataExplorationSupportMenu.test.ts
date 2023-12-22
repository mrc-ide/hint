import {mount, shallowMount} from "@vue/test-utils";
import Vuex from "vuex";
import registerTranslations from "../../../app/store/translations/registerTranslations";
import {expectErrorReportOpen, expectTranslated, mountWithTranslate} from "../../testHelpers";
import DropDown from "../../../app/components/header/DropDown.vue";
import { createRouter, createWebHashHistory } from 'vue-router'
import DataExplorationSupportMenu from "../../../app/components/header/DataExplorationSupportMenu.vue"
import {mockDataExplorationState, mockErrorsState} from "../../mocks";
import ErrorReport from "../../../app/components/ErrorReport.vue";
import { nextTick } from "vue";

const router = createRouter({
    routes: [],
    history: createWebHashHistory()
});

describe("Data exploration online support menu", () => {

    afterEach(() => {
        vi.resetAllMocks();
    });

    const mockGenerateErrorReport = vi.fn()

    const createStore = () => {
        const store = new Vuex.Store({
            state: mockDataExplorationState(),
            actions: {
                generateErrorReport: mockGenerateErrorReport
            },
            modules: {
                errors: {
                    namespaced: true,
                    state: mockErrorsState()
                }
            },
            getters: {
                isGuest: () => false
            }
        });
        registerTranslations(store);
        return store;
    };

    it("renders drop down with delay property true", () => {
        const store = createStore();
        const wrapper = shallowMount(DataExplorationSupportMenu, {
            global: {
                plugins: [store, router]
            },
        });

        const dropDown = wrapper.findComponent(DropDown);
        expect(dropDown.props("delay")).toBe(true);
    });

    it("renders drop down text correctly", async () => {
        const store = createStore();
        const wrapper = mountWithTranslate(DataExplorationSupportMenu, store, {
            global: {
                plugins: [store, router]
            },
        });
        await wrapper.find(".dropdown-toggle").trigger("click");
        expect(wrapper.find(".dropdown-menu").classes())
            .toStrictEqual(["dropdown-menu", "show", "dropdown-menu-right"]);

        const button = wrapper.find(".dropdown").findAll("p");
        const link = wrapper.find(".dropdown").findAll("a");

        expect(button.length).toBe(1)
        expect(link.length).toBe(3)

        await expectTranslated(button[0],
            "Online support",
            "Support en ligne",
            "Apoio online",
            store as any);

        await expectTranslated(link[0],
            "Troubleshooting request",
            "Demande de dépannage",
            "Solicitação de solução de problemas",
            store as any);

        await expectTranslated(link[1],
            "Privacy",
            "Vie privée",
            "Privacidade",
            store as any);

        await expectTranslated(link[2],
            "Accessibility",
            "Accessibilité",
            "Acessibilidade",
            store as any);
    });

    it("renders accessibility menu-item text and link", () => {
        const store = createStore();
        const wrapper = mount(DataExplorationSupportMenu, {
            global: {
                plugins: [store, router],
                stubs: ["router-link"]
            },
        });

        const links = wrapper.findAll("router-link-stub");
        expect(links.length).toBe(2)

        const link = links[1]
        expect(link.attributes("to")).toBe("/accessibility");
    });

    it("renders privacy menu-item text and link", () => {
        const store = createStore();
        const wrapper = mount(DataExplorationSupportMenu, {
            global: {
                plugins: [store, router],
                stubs: ["router-link"]
            },
        });

        const links = wrapper.findAll("router-link-stub");
        expect(links.length).toBe(2)

        const link = links[0]
        expect(link.attributes("to")).toBe("/privacy");
    });

    it("renders error report widget", async () => {

        const store = createStore();
        const wrapper = mount(DataExplorationSupportMenu, {
            global: {
                plugins: [store, router]
            },
        });

        expect(wrapper.findAllComponents(ErrorReport).length).toBe(1);
        expect(wrapper.findComponent(ErrorReport).props("open")).toBe(false);

        await expectErrorReportOpen(wrapper)
    });

    it("selects current step by default", async () => {
        const store = createStore();
        const wrapper = mount(DataExplorationSupportMenu, {
            global: {
                plugins: [store, router]
            },
        });

        await expectErrorReportOpen(wrapper)
    });

    it("invokes generateErrorReport with expected data", async () => {

        const store = createStore();
        const wrapper = mount(DataExplorationSupportMenu, {
            global: {
                plugins: [store, router]
            },
        });

        await expectErrorReportOpen(wrapper)

        wrapper.findComponent(ErrorReport).vm.$emit("send",
            {
                description: "something",
                stepsToReproduce: "reproduce steps",
                email: ""
            })
        await nextTick();
        expect(mockGenerateErrorReport).toHaveBeenCalledTimes(1)

        expect(mockGenerateErrorReport.mock.calls[0][1]).toEqual(
            {
                description: "something",
                section: "dataExploration",
                stepsToReproduce: "reproduce steps",
                email: ""
            }
        )
    });

});