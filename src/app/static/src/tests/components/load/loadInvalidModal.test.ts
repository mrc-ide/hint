import {mount, RouterLinkStub} from "@vue/test-utils";
import LoadInvalidModal from "../../../app/components/load/LoadInvalidModal.vue"
import Vuex from "vuex";
import {emptyState, RootState} from "../../../app/root";
import {initialStepperState} from "../../../app/store/stepper/stepper";
import {expectHasTranslationKey, expectTranslated, mountWithTranslate} from "../../testHelpers";
import registerTranslations from "../../../app/store/translations/registerTranslations";
import {getters as stepperGetters} from "../../../app/store/stepper/getters";

const mockRollbackInvalidState = vi.fn();
const mockLoadVersion = vi.fn();
const stubs = {
    RouterLink: RouterLinkStub
};

const getStore = (invalidSteps: number[], isGuest: boolean) => {
    const store = new Vuex.Store<RootState>({
        state: {
            ...emptyState(),
            invalidSteps
        } as any,
        actions: {
            rollbackInvalidState: mockRollbackInvalidState
        },
        getters: {
            isGuest: () => isGuest
        } as any,
        modules: {
            projects: {
                namespaced: true,
                state: {
                    currentProject: {
                        id: "testProjectId"
                    },
                    currentVersion: {
                        id: "testVersionId"
                    }
                },
                actions: {
                    loadVersion: mockLoadVersion
                }
            },
            stepper: {
                namespaced: true,
                state: initialStepperState(),
                getters: stepperGetters
            }
        }
    });
    registerTranslations(store);
    return store;
};

describe("loadInvalidModal", () => {

    const mockTranslate = vi.fn();
    const mockLocationReload = vi.fn();

    const win = window as any;
    const realLocation = win.location;

    beforeAll(() => {
        delete win.location;
        win.location = {reload: mockLocationReload};
    });

    afterAll(() => {
        win.location = realLocation;
    });

    beforeEach(() => {
        vi.resetAllMocks()
    })

    const getWrapper = (invalidSteps: number[] = [], isGuest: boolean = false) => {
        const store = getStore(invalidSteps, isGuest);
        return mount(LoadInvalidModal, {
            global: {
                plugins: [store],
                directives: {
                    translate: mockTranslate
                },
                stubs
            }
        })
    }

    it("can render load invalid modal as expected when there are no invalid steps", () => {
        const wrapper = getWrapper();
        const modal = wrapper.find(".modal")
        expect(modal.attributes()).toEqual({
            class: "modal",
            style: "display: none;"
        })
    });

    it("can render error modal as expected where there are invalid steps", () => {
        const wrapper = getWrapper([2, 3]);
        expectHasTranslationKey(wrapper.find("span#load-invalid-steps"), mockTranslate, "loadInvalidSteps");
        const stepsListItems = wrapper.findAll("ul#load-invalid-steps-list li");
        expect(stepsListItems.length).toBe(2);
        expectHasTranslationKey(stepsListItems[0], mockTranslate, "reviewInputs");
        expectHasTranslationKey(stepsListItems[1], mockTranslate, "modelOptions");
        expectHasTranslationKey(wrapper.find("span#load-invalid-action-prefix"), mockTranslate, "loadInvalidActionPrefix");
        expectHasTranslationKey(wrapper.find("span#load-invalid-first-invalid"), mockTranslate, "reviewInputs");
        expectHasTranslationKey(wrapper.find("span#load-invalid-action-suffix"), mockTranslate, "loadInvalidActionSuffix");
        expectHasTranslationKey(wrapper.find("p#load-invalid-steps-rollback-info"), mockTranslate, "loadInvalidStepsRollbackInfo");
        expect(wrapper.find("#load-invalid-steps-rollback-info-guest").exists()).toBe(false);

        const retryBtn = wrapper.find("button#retry-load");
        expectHasTranslationKey(retryBtn, mockTranslate, "retry");
        expectHasTranslationKey(retryBtn, mockTranslate, "retry", "aria-label");
        const rollbackBtn = wrapper.find("button#rollback-load");
        expectHasTranslationKey(rollbackBtn, mockTranslate, "rollback");
        expectHasTranslationKey(rollbackBtn, mockTranslate, "rollback", "aria-label");
    });

    it("renders rollback information for guest user", () => {
        const wrapper = getWrapper([2, 3], true);
        const info = wrapper.find("p#load-invalid-steps-rollback-info-guest");
        expectHasTranslationKey(info, mockTranslate, "loadInvalidStepsRollbackInfoGuest");
        expect(wrapper.find("#load-invalid-steps-rollback-info").exists()).toBe(false);
    });

    it("displays Projects page link if not guest user", () => {
        const wrapper = getWrapper([1]);
        const projectsPara = wrapper.find("p#load-invalid-projects");
        expectHasTranslationKey(projectsPara.find("span#load-invalid-projects-prefix"), mockTranslate, "loadInvalidStepsProjectLinkPrefix");
        const routerLink = projectsPara.findComponent(RouterLinkStub);
        expect(routerLink.props("to")).toBe("/projects");
        expectHasTranslationKey(routerLink as any, mockTranslate, "projects");
        expectHasTranslationKey(routerLink as any, mockTranslate, "projects", "aria-label");
        expectHasTranslationKey(projectsPara.find("span#load-invalid-projects-suffix"), mockTranslate, "loadInvalidStepsProjectLinkSuffix");
    });

    it("does not display Projects page link if guest user", () => {
        const wrapper = getWrapper([1], true);
        expect(wrapper.find("#load-invalid-projects").exists()).toBe(false);
    });

    it("click Retry invokes loadVersion action for logged in user", async () => {
        const wrapper = getWrapper([1]);
        await wrapper.find("button#retry-load").trigger("click");
        expect(mockLoadVersion.mock.calls[0][1]).toStrictEqual({versionId:  "testVersionId", projectId: "testProjectId"});
        expect(mockLocationReload).not.toHaveBeenCalled();
    });

    it("click Retry reloads location for guest user", async () => {
        const wrapper = getWrapper([1], true);
        await wrapper.find("button#retry-load").trigger("click");
        expect(mockLocationReload).toHaveBeenCalled();
        expect(mockLoadVersion).not.toHaveBeenCalled();
    });

    it("click Rollback invokes rollbackInvalidState action", async () => {
        const wrapper = getWrapper([1]);
        await wrapper.find("button#rollback-load").trigger("click");
        expect(mockRollbackInvalidState).toHaveBeenCalledTimes(1);
    });
});

describe("loadInvalidModal translations", () => {
    const getWrapper = (invalidSteps: number[] = [], isGuest: boolean = false)  => {
        const store = getStore(invalidSteps, isGuest);
        return mountWithTranslate(LoadInvalidModal, store, {
            global: {
                plugins: [store],
                stubs,
            }
        });
    };

    it("can display expected translations where there are invalid steps", async () => {
        const wrapper = getWrapper([2, 3]);
        const store = wrapper.vm.$store;

        await expectTranslated(wrapper.find("span#load-invalid-steps"), "There was a problem loading the following steps:",
            "Un problème est survenu lors du chargement des étapes suivantes:",
            "Ocorreu um problema ao carregar as seguintes etapas:", store);


        const stepsListItems = wrapper.findAll("ul#load-invalid-steps-list li");

        await expectTranslated(stepsListItems[0], "Review inputs", "Examiner les entrées",
            "Analise as entradas", store);
        await expectTranslated(stepsListItems[1], "Model options", "Options des modèles",
            "Opções de modelos", store);

        await expectTranslated(wrapper.find("span#load-invalid-action-prefix"),
            "Please Retry load. If the problem persists, Rollback to re-run from the",
            "Veuillez Refaire de charger. Si le problème persiste, Revenir en arrière pour relancer à partir du",
            "Por favor Tente carregar novamente. Se o problema persistir, Reverter para executar novamente a partir do", store);

        await expectTranslated(wrapper.find("span#load-invalid-first-invalid"), "Review inputs", "Examiner les entrées",
            "Analise as entradas", store);

        await expectTranslated(wrapper.find("span#load-invalid-action-suffix"),
            "step. Please also submit a troubleshooting request.",
            "étape. Veuillez également soumettre une demande de dépannage.",
            "etapa. Envie também uma solicitação de solução de problemas.", store);

        await expectTranslated(wrapper.find("p#load-invalid-steps-rollback-info"),
            "Rollback will be done in a new version - the current project version state will be preserved.",
            "Revenir en arrière sera effectuée dans une nouvelle version - l'état actuel de la version du projet sera conservé.",
            "Reverter será feita em uma nova versão - o estado da versão atual do projeto será preservado.", store);

        const retryBtn = wrapper.find("button#retry-load");
        await expectTranslated(retryBtn, "Retry", "Refaire", "Tentar novamente", store);
        await expectTranslated(retryBtn, "Retry", "Refaire", "Tentar novamente", store, "aria-label");

        const rollbackBtn = wrapper.find("button#rollback-load");
        await expectTranslated(rollbackBtn, "Rollback", "Revenir en arrière", "Reverter", store);
        await expectTranslated(rollbackBtn, "Rollback", "Revenir en arrière", "Reverter", store, "aria-label");
    });

    it("can display expected translations for rollback information when user is guest", async () => {
        const wrapper = getWrapper([2, 3], true);
        const store = wrapper.vm.$store;
        await expectTranslated(wrapper.find("p#load-invalid-steps-rollback-info-guest"),
            "Rollback will result in a loss of all project data from subsequent steps.",
            "Revenir en arrière entraînera la perte de toutes les données du projet des étapes suivantes.",
            "Reverter resultará na perda de todos os dados do projeto das etapas subsequentes.", store);
    });


    it("can display Projects page link translations", async () => {
        const wrapper = getWrapper([1]);
        const store = wrapper.vm.$store;
        await expectTranslated(wrapper.find("#load-invalid-projects-prefix"), "You can also go back to",
            "Vous pouvez également revenir à la page", "Você também pode voltar para a página", store);
        await expectTranslated(wrapper.find("#load-invalid-projects-link"), "Projects", "Projets", "Projetos"
            , store);
        await expectTranslated(wrapper.find("#load-invalid-projects-suffix"),
            "page - if you do this, you can try to load this project again later.",
            "- si vous faites cela, vous pouvez essayer de charger à nouveau ce projet plus tard.",
            "- se você fizer isso, você pode tentar carregar este projeto novamente mais tarde.", store);
    });
});
