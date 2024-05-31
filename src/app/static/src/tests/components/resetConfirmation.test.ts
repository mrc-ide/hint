import ResetConfirmation from "../../app/components/resetConfirmation/ResetConfirmation.vue";
import LoadingSpinner from "../../app/components/LoadingSpinner.vue";
import Vuex from "vuex";
import registerTranslations from "../../app/store/translations/registerTranslations";
import {RootState} from "../../app/root";
import {mockErrorsState, mockProjectsState, mockRootState} from "../mocks";
import {mutations as versionsMutations} from "../../app/store/projects/mutations";
import {mutations as errorMutations} from "../../app/store/errors/mutations";
import {getters} from "../../app/store/root/getters";
import {expectTranslated, mountWithTranslate} from "../testHelpers";
import {Step} from "../../app/types";
import {nextTick} from "vue";

const createStore = (newVersion = vi.fn(), partialRootState: Partial<RootState> = {}, partialStepperGetters = {}) => {
    const store = new Vuex.Store({
        state: mockRootState(partialRootState),
        getters: getters,
        modules: {
            stepper: {
                namespaced: true,
                getters: {
                    changesToRelevantSteps: () => [{number: 2, textKey: "reviewInputs"},
                        {number: 3, textKey: "modelOptions"},
                        {number: 4, textKey: "fitModel"}],
                    ...partialStepperGetters
                }
            },
            errors: {
                namespaced: true,
                state: mockErrorsState(),
                mutations: errorMutations
            },
            projects: {
                namespaced: true,
                state: mockProjectsState({currentProject: {id: 1, name: "v1", note: "test note", versions: []},
                    currentVersion: {id: "version1", created: "", note: "textarea value", updated: "", versionNumber: 1}}),
                actions: {
                    newVersion
                },
                mutations: versionsMutations
            }
        }
    });
    registerTranslations(store);
    return store;
};

describe("Reset confirmation modal", () => {

    it("renders as expected for guest user", async () => {
        const store = createStore(vi.fn(), {currentUser: 'guest'});
        const rendered = mountWithTranslate(ResetConfirmation, store, {
            props: {
                continueEditing: vi.fn(),
                cancelEditing: vi.fn()
            },
            global: {
                plugins: [store]
            }
        });

        await expectTranslated(rendered.find("h4"), "Have you saved your work?",
            "Avez-vous sauvegardé votre travail ?", "Já guardou o seu trabalho?", store);
        await expectTranslated(rendered.findAll("p")[0],
            "Changing this will result in the following steps being discarded:",
            "Si vous modifiez ce paramètre, les étapes suivantes seront abandonnées :",
            "Ao alterar isto, as etapas seguintes serão descartadas:", store);
        await expectTranslated(rendered.findAll("p")[1],
            "You may want to save your work before continuing.",
            "Vous devriez peut-être sauvegarder votre travail avant de poursuivre.",
            "Poderá querer guardar o seu trabalho antes de continuar.", store);

        await expectRenderedSteps(rendered);

        const buttons = rendered.findAll("button");
        await expectTranslated(buttons[0], "Discard these steps and keep editing",
            "Ignorer ces étapes et poursuivre la modification",
            "Descartar estas etapas e continuar a editar", store);
        await expectTranslated(buttons[1], "Cancel editing so I can save my work",
            "Annuler l'édition pour que je puisse sauvegarder mon travail",
            "Cancelar a edição para que eu possa guardar o meu trabalho", store);

        expect(rendered.findComponent(LoadingSpinner).exists()).toBe(false);
    });

    it("renders as expected for logged in user", async () => {
        const store = createStore();
        const rendered = mountWithTranslate(ResetConfirmation, store, {
            props: {
                continueEditing: vi.fn(),
                cancelEditing: vi.fn()
            },
            global: {
                plugins: [store]
            }
        });

        await expectTranslated(rendered.find("h4"), "Save version?",
            "Sauvegarder la version?", "Guardar versão?", store);
        await expectTranslated(rendered.findAll("p")[0],
            "Changing this will result in the following steps being discarded:",
            "Si vous modifiez ce paramètre, les étapes suivantes seront abandonnées :",
            "Ao alterar isto, as etapas seguintes serão descartadas:", store);
        await expectTranslated(rendered.findAll("p")[1],
            "These steps will automatically be saved in a version. You will be able to reload this version from the Projects page.",
            "Ces étapes seront automatiquement sauvegardées dans une version. Vous pourrez recharger cette version depuis la page Projets.",
            "Estas etapas serão automaticamente guardadas numa versão. Poderá voltar a carregar esta versão a partir da página Projetos.",
            store);

        await expectRenderedSteps(rendered);

        const buttons = rendered.findAll("button");
        await expectTranslated(buttons[0], "Save version and keep editing",
            "Sauvegarder la version et continuer à modifier", "Guardar versão e continuar a editar", store);
        await expectTranslated(buttons[1], "Cancel editing", "Annuler l'édition", "Cancelar edição", store);

        expect(rendered.findComponent(LoadingSpinner).exists()).toBe(false);
    });

    it("renders as expected for someone rerunning the model", async () => {
        const stepperGetter = {
            changesToRelevantSteps: () => [
                {number: 4, textKey: "fitModel"}]}
        const store = createStore(vi.fn(), {}, stepperGetter);
        const rendered = mountWithTranslate(ResetConfirmation, store, {
            props: {
                continueEditing: vi.fn(),
                cancelEditing: vi.fn()
            },
            global: {
                plugins: [store]
            }
        });

        await expectRenderedModelRunSteps(rendered);
    });

    it("does not render discarded step when upload input changes", async () => {
        const stepperGetter = {
            changesToRelevantSteps: () => [
                {number: 3, textKey: "modelOptions"},
                {number: 4, textKey: "fitModel"}
            ]
        }
        const store = createStore(vi.fn(), {}, stepperGetter);
        const rendered = mountWithTranslate(ResetConfirmation, store, {
            props: {
                continueEditing: vi.fn(),
                cancelEditing: vi.fn(),
                discardStepWarning: Step.ModelOptions
            },
            global: {
                plugins: [store]
            }
        });

        await expectRenderedModelRunSteps(rendered);
    });

    it("cancel edit button invokes cancelEditing", async () => {
        const mockCancelEdit = vi.fn();
        const store = createStore();
        const rendered = mountWithTranslate(ResetConfirmation, store, {
            props: {
                continueEditing: vi.fn(),
                cancelEditing: mockCancelEdit
            },
            global: {
                plugins: [store]
            }
        });

        await rendered.findAll("button")[1].trigger("click");
        expect(mockCancelEdit.mock.calls.length).toBe(1);
    });

    it("continue button invokes continueEditing for guest user", async () => {
        const mockContinueEdit = vi.fn();
        const store = createStore(vi.fn(), {currentUser: 'guest'});
        const rendered = mountWithTranslate(ResetConfirmation, store, {
            props: {
                continueEditing: mockContinueEdit,
                cancelEditing: vi.fn()
            },
            global: {
                plugins: [store]
            } 
        });

        await rendered.findAll("button")[0].trigger("click");
        expect(mockContinueEdit.mock.calls.length).toBe(1);
    });

    it("can render translated version note label", async () => {

        const mockContinueEdit = vi.fn();
        const mockNewVersion = vi.fn();
        const store = createStore(mockNewVersion, {currentUser: 'test.user@example.com'});
        const rendered = mountWithTranslate(ResetConfirmation, store, {
            props: {
                continueEditing: mockContinueEdit,
                cancelEditing: vi.fn()
            },
            global: {
                plugins: [store]
            }
        });

        const noteLabel = rendered.find("#noteHeader label")
        await expectTranslated(noteLabel, "Notes: (your reason for saving as a new version)",
            "Notes : (votre motif pour sauvegarder en tant que nouvelle version)",
            "Notas: (a sua razão para guardar como nova versão)", store)
    });

    it("can set and get note value", async () => {

        const mockContinueEdit = vi.fn();
        const mockNewVersion = vi.fn();
        const store = createStore(mockNewVersion, {currentUser: 'test.user@example.com'});
        const rendered = mountWithTranslate(ResetConfirmation, store, {
            props: {
                continueEditing: mockContinueEdit,
                cancelEditing: vi.fn()
            },
            global: {
                plugins: [store]
            }
        });

        await rendered.setProps({open: true});
        const textarea = rendered.find("textarea").element as HTMLTextAreaElement;
        expect(textarea.value).toBe("textarea value");
    });

    it("can set note value and invokes newVersion action for logged in user", async () => {
        const mockContinueEdit = vi.fn();
        const mockNewVersion = vi.fn();
        const store = createStore(mockNewVersion, {currentUser: 'test.user@example.com'});
        const rendered = mountWithTranslate(ResetConfirmation, store, {
            props: {
                continueEditing: mockContinueEdit,
                cancelEditing: vi.fn()
            },
            global: {
                plugins: [store]
            }
        });

        rendered.find("textarea").setValue("new Value")
        await rendered.findAll("button")[0].trigger("click");

        expect(mockContinueEdit.mock.calls.length).toBe(0);
        expect((rendered.vm as any).waitingForVersion).toBe(true);
        expect(mockNewVersion.mock.calls.length).toBe(1);
        expect(mockNewVersion.mock.calls[0][1]).toBe("new%20Value");
    });

    it("continue button sets waitingForVersion to true and invokes newVersion action for logged in user", async () => {

        const mockContinueEdit = vi.fn();
        const mockNewVersion = vi.fn();
        const store = createStore(mockNewVersion, {currentUser: 'test.user@example.com'});
        const rendered = mountWithTranslate(ResetConfirmation, store, {
            props: {
                continueEditing: mockContinueEdit,
                cancelEditing: vi.fn()
            },
            global: {
                plugins: [store]
            }
        });

        expect((rendered.vm as any).waitingForVersion).toBe(false);

        await rendered.findAll("button")[0].trigger("click");

        expect(mockContinueEdit.mock.calls.length).toBe(0);
        expect((rendered.vm as any).waitingForVersion).toBe(true);
        expect(mockNewVersion.mock.calls.length).toBe(1);
    });

    it("when currentVersion changes, sets waitingForVersion to false and invokes continue editing, if waitingForVersion is true", async () => {
        const mockContinueEditing = vi.fn();
        const store = createStore();
        const rendered = mountWithTranslate(ResetConfirmation, store, {
            data() {
                return {
                    waitingForVersion: true
                };
            },
            props: {
                continueEditing: mockContinueEditing,
                cancelEditing: vi.fn()
            },
            global: {
                plugins: [store]
            }
        });

        rendered.vm.$store.commit("projects/VersionCreated", {id: "newVersionId"});
        await nextTick();

        expect((rendered.vm as any).waitingForVersion).toBe(false);
        expect(mockContinueEditing.mock.calls.length).toBe(1);
    });

    it("when error added, sets waitingForVersion to false and invokes cancel editing, if waitingForVersion is true", async () => {
        const mockCancelEditing = vi.fn();
        const store = createStore();
        const rendered = mountWithTranslate(ResetConfirmation, store, {
            data() {
                return {
                    waitingForVersion: true
                };
            },
            props: {
                continueEditing: vi.fn(),
                cancelEditing: mockCancelEditing
            },
            global: {
                plugins: [store]
            }
        });

        rendered.vm.$store.commit("errors/ErrorAdded", "TEST ERROR");
        await nextTick();

        expect((rendered.vm as any).waitingForVersion).toBe(false);
        expect(mockCancelEditing.mock.calls.length).toBe(1);
    });

    it("when currentVersion changes, does nothing if waitingForVersion is false", async () => {
        const mockContinueEditing = vi.fn();
        const store = createStore();
        const rendered = mountWithTranslate(ResetConfirmation, store, {
            props: {
                continueEditing: mockContinueEditing,
                cancelEditing: vi.fn()
            },
            global: {
                plugins: [store]
            }
        });

        rendered.vm.$store.commit("projects/VersionCreated", {id: "newVersionId"});
        await nextTick();

        expect((rendered.vm as any).waitingForVersion).toBe(false);
        expect(mockContinueEditing.mock.calls.length).toBe(0);
    });

    it("when errorAdded, does nothing if waitingForVersion is false", async () => {
        const mockCancelEditing = vi.fn();
        const store = createStore();
        const rendered = mountWithTranslate(ResetConfirmation, store, {
            props: {
                continueEditing: vi.fn(),
                cancelEditing: mockCancelEditing
            },
            global: {
                plugins: [store]
            }
        });

        rendered.vm.$store.commit("errors/ErrorAdded", "TEST ERROR");
        await nextTick();

        expect((rendered.vm as any).waitingForVersion).toBe(false);
        expect(mockCancelEditing.mock.calls.length).toBe(0);
    });

    it("renders spinner in place of buttons when waiting for version", () => {
        const store = createStore();
        const rendered = mountWithTranslate(ResetConfirmation, store, {
            data() {
                return {
                    waitingForVersion: true
                };
            },
            props: {
                continueEditing: vi.fn(),
                cancelEditing: vi.fn()
            },
            global: {
                plugins: [store]
            }
        });

        expect(rendered.find("button").exists()).toBe(false);
        expect(rendered.findComponent(LoadingSpinner).props("size")).toBe("sm");
        expect(rendered.find("#spinner-text").text()).toBe("Saving version");
    });

    const expectRenderedSteps = async (rendered: any) => {
        const store = rendered.vm.$store;
        const steps = rendered.findAll("li");
        expect(steps.length).toBe(3);

        await expectTranslated(steps[0], "Step 2: Review inputs",
            "Étape 2: Examiner les entrées",
            "Etapa 2: Analise as entradas", store);

        await expectTranslated(steps[1], "Step 3: Model options",
            "Étape 3: Options des modèles",
            "Etapa 3: Opções de modelos", store);

        await expectTranslated(steps[2], "Step 4: Fit model",
            "Étape 4: Ajuster le modèle",
            "Etapa 4: Ajustar modelo", store);
    };

    const expectRenderedModelRunSteps = async (rendered: any) => {
        const store = rendered.vm.$store;
        const steps = rendered.findAll("li");
        expect(steps.length).toBe(1);
        await expectTranslated(steps[0], "Step 4: Fit model",
            "Étape 4: Ajuster le modèle", "Etapa 4: Ajustar modelo", store);
    };

});
