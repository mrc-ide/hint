import {mount, shallowMount} from "@vue/test-utils";
import Vuex from "vuex";
import OnlineSupportMenu from "../../../app/components/header/OnlineSupportMenu.vue";
import {emptyState} from "../../../app/root";
import {mutations} from "../../../app/store/root/mutations";
import registerTranslations from "../../../app/store/translations/registerTranslations";
import {Language} from "../../../app/store/translations/locales";
import {expectErrorReportOpen, expectTranslated, mountWithTranslate,} from "../../testHelpers";
import DropDown from "../../../app/components/header/DropDown.vue";
import {createRouter, createWebHashHistory} from 'vue-router'
import ErrorReport from "../../../app/components/ErrorReport.vue";
import {mockErrorsState, mockProjectsState, mockStepperState} from "../../mocks";
import {StepperState} from "../../../app/store/stepper/stepper";

const router = createRouter({
    routes: [],
    history: createWebHashHistory()
});

describe("Online support menu", () => {

    afterEach(() => {
        vi.resetAllMocks();
    });

    const mockGenerateErrorReport = vi.fn()

    const createStore = (stepperState: Partial<StepperState> = {},
                         language: Language = Language.en) => {
        const store = new Vuex.Store({
            state: {
                ...emptyState(),
                language
            },
            actions: {
                generateErrorReport: mockGenerateErrorReport
            },
            mutations: mutations,
            modules: {
                stepper: {
                    namespaced: true,
                    state: mockStepperState(stepperState)
                },
                projects: {
                    namespaced: true,
                    state: mockProjectsState()
                },
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
        const wrapper = shallowMount(OnlineSupportMenu, {
            global: {
                plugins: [store, router]
            }
        });

        const dropDown = wrapper.findComponent(DropDown);
        expect(dropDown.props("delay")).toBe(true);
    });

    it("renders drop down text correctly", async () => {
        const store = createStore();
        const wrapper = mountWithTranslate(OnlineSupportMenu, store, {
            global: {
                plugins: [store, router]
            }
        });
        await wrapper.find(".dropdown-toggle").trigger("click");
        expect(wrapper.find(".dropdown-menu").classes())
            .toStrictEqual(["dropdown-menu", "show", "dropdown-menu-right"]);

        const link = wrapper.find(".dropdown").find("p");
        await expectTranslated(link, "Online support", "Support en ligne",
            "Apoio online", store as any);
    });

    it("renders error report widget", async () => {

        const store = createStore();
        const wrapper = mountWithTranslate(OnlineSupportMenu, store, {
            global: {
                plugins: [store, router]
            }
        });

        expect(wrapper.findAllComponents(ErrorReport).length).toBe(1);
        expect(wrapper.findComponent(ErrorReport).props("open")).toBe(false);

        const link = wrapper.findAll(".dropdown-item")[2];

        await expectTranslated(link, "Troubleshooting request", "Demande de dépannage", "Solicitação de solução de problemas", store as any);

        await expectErrorReportOpen(wrapper, 2)
    });

    it("can render section on error report widget", async () => {
        const store = createStore();
        const wrapper = mountWithTranslate(OnlineSupportMenu, store, {
            global: {
                plugins: [store, router]
            }
        });

        expect(wrapper.findAllComponents(ErrorReport).length).toBe(1);

        expect(wrapper.findComponent(ErrorReport).props("open")).toBe(false);

        await expectErrorReportOpen(wrapper, 2)

        const options = wrapper.findComponent(ErrorReport).findAll("option")
        expect(options.length).toBe(10)

        expect((options[0].element as HTMLOptionElement).value).toBe("uploadInputs");

        await expectTranslated(options[0],
            "Upload inputs",
            "Télécharger les entrées",
            "Carregar entradas",
            store)

        await expectTranslated(options[1],
            "Review inputs",
            "Examiner les entrées",
            "Analise as entradas",
            store)

        await expectTranslated(options[2],
            "Model options",
            "Options des modèles",
            "Opções de modelos",
            store)

        await expectTranslated(options[3],
            "Fit model",
            "Ajuster le modèle",
            "Ajustar modelo",
            store)

        await expectTranslated(options[4],
            "Calibrate model",
            "Calibrer le modèle",
            "Calibrar modelo",
            store)

        await expectTranslated(options[5],
            "Review output",
            "Résultat de l'examen",
            "Rever os resultados",
            store)

        await expectTranslated(options[6],
            "Save results",
            "Enregistrer les résultats",
            "Guardar resultados",
            store)

        await expectTranslated(options[7],
            "Login",
            "Connexion",
            "Conecte-se",
            store)

        await expectTranslated(options[8],
            "Projects",
            "Projets",
            "Projetos",
            store)

        await expectTranslated(options[9],
            "Other",
            "Autre",
            "De outros",
            store)
    });

    it("selects current step by default", async () => {
        const store = createStore();
        const wrapper = mount(OnlineSupportMenu, {
            global: {
                plugins: [store, router]
            }
        });

        await expectErrorReportOpen(wrapper, 2)

        expect((wrapper.findComponent(ErrorReport).find("select#section").element as HTMLSelectElement).value)
            .toBe("uploadInputs")
    });

    it("invokes generateErrorReport with expected data", async () => {
        const store = createStore();
        const wrapper = mount(OnlineSupportMenu, {
            global: {
                plugins: [store, router]
            }
        });

        await expectErrorReportOpen(wrapper, 2)

        wrapper.findComponent(ErrorReport).vm.$emit("send",
            {
                description: "something",
                stepsToReproduce: "reproduce steps",
                email: ""
            })

        expect(mockGenerateErrorReport).toHaveBeenCalledTimes(1)

        expect(mockGenerateErrorReport.mock.calls[0][1]).toEqual(
            {
                description: "something",
                section: "uploadInputs",
                stepsToReproduce: "reproduce steps",
                email: ""
            }
        )
        expect((wrapper.vm as any).$data.section).toBe("")
    });

    it("can update section", async () => {
        const store = createStore({activeStep: 2});
        const wrapper = mount(OnlineSupportMenu, {
            global: {
                plugins: [store, router]
            }
        });

        expect((wrapper.find("select#section").element as HTMLSelectElement).value)
            .toBe("reviewInputs");

        await wrapper.find("#section").setValue("downloadResults");

        expect((wrapper.find("select#section").element as HTMLSelectElement).value)
            .toBe("downloadResults");
        expect((wrapper.vm as any).$data.section).toBe("downloadResults");
        expect((wrapper.vm as any).currentSection).toBe("downloadResults");
    });

    it("sets section to 'projects' if opened on project page",  async () => {
        const routes = [
            {
                path: '/',
                component: ErrorReport
            },
            {
                path: '/projects',
                component: ErrorReport
            }
        ]
        const router = createRouter({
            routes,
            history: createWebHashHistory()
        })

        const wrapper = mount(OnlineSupportMenu,
            {
                global: {
                    plugins: [router, createStore()]
                }
            })
        expect(wrapper.vm.$route.path).toBe("/");
        await wrapper.setData({errorReportOpen: true});
        expect((wrapper.findComponent(ErrorReport).find("#section").element as HTMLSelectElement).value).toBe("uploadInputs");

        await wrapper.setData({errorReportOpen: false});
        await router.push("/projects");
        await router.isReady();
        await expectErrorReportOpen(wrapper, 2)
        expect(wrapper.findComponent(ErrorReport).props("open")).toBe(true);
        expect((wrapper.find("#section").element as HTMLSelectElement).value).toBe("projects")
    });

    it("renders accessibility menu-item text and link", async () => {
        const store = createStore();
        const wrapper = mountWithTranslate(OnlineSupportMenu, store, {
            global: {
                plugins: [store, router],
                stubs: ["router-link"]
            }
        });

        const links = wrapper.findAll("router-link-stub");
        expect(links.length).toBe(2)

        const link = links[1]
        expect(link.attributes("to")).toBe("/accessibility");
        await expectTranslated(link, "Accessibility", "Accessibilité", "Acessibilidade", store as any);
    });

    it("renders privacy menu-item text and link", async () => {
        const store = createStore();
        const wrapper = mountWithTranslate(OnlineSupportMenu, store, {
            global: {
                plugins: [store, router],
                stubs: ["router-link"]
            }
        });

        const links = wrapper.findAll("router-link-stub");
        expect(links.length).toBe(2)

        const link = links[0]
        expect(link.attributes("to")).toBe("/privacy");
        await expectTranslated(link, "Privacy", "Vie privée", "Privacidade", store as any);
    });

    it("computes help filename", () => {
        const store = createStore()
        const wrapper = shallowMount(OnlineSupportMenu, {global: {plugins: [store, router]}});
        const vm = (wrapper as any).vm;
        expect(vm.helpFilename).toStrictEqual(
            "https://hivtools.unaids.org/wp-content/uploads/75D-Guide-5-Naomi-quick-start.pdf");

        const frStore = createStore({}, Language.fr);
        const frWrapper = shallowMount(OnlineSupportMenu, {global: {plugins: [frStore, router]}});
        const frVm = (frWrapper as any).vm;
        expect(frVm.helpFilename).toStrictEqual(
            "https://hivtools.unaids.org/wp-content/uploads/75D-Instructions-pour-Naomi.pdf");

        const ptStore = createStore({}, Language.pt);
        const ptWrapper = shallowMount(OnlineSupportMenu, {global: {plugins: [ptStore, router]}});
        const ptVm = (ptWrapper as any).vm;
        expect(ptVm.helpFilename).toStrictEqual(
            "https://hivtools.unaids.org/wp-content/uploads/75D-Guide-5-Naomi-quick-start.pdf");
    });

    it("contains Basic steps document links", () => {
        const storeEnglish = createStore();
        const wrapper = mountWithTranslate(OnlineSupportMenu, storeEnglish, {
            global: {
                plugins: [storeEnglish, router]
            }
        });

        expect(wrapper.find(
            "a[href='https://hivtools.unaids.org/wp-content/uploads/75D-Guide-5-Naomi-quick-start.pdf']"
        ).text()).toBe("Basic steps");

        const frStore = createStore({}, Language.fr);
        const frWrapper = mountWithTranslate(OnlineSupportMenu, frStore, {
            global: {
                plugins: [frStore, router]
            }
        });
        expect(frWrapper.find(
            "a[href='https://hivtools.unaids.org/wp-content/uploads/75D-Instructions-pour-Naomi.pdf']"
        ).text()).toBe("Etapes de base");

        const ptStore = createStore({}, Language.pt);
        const ptWrapper = mountWithTranslate(OnlineSupportMenu, ptStore, {
            global: {
                plugins: [ptStore, router]
            }
        });
        expect(ptWrapper.find(
            "a[href='https://hivtools.unaids.org/wp-content/uploads/75D-Guide-5-Naomi-quick-start.pdf']"
        ).text()).toBe("Passos básicos");
    });

});
