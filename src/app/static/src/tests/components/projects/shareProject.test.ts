import {flushPromises} from "@vue/test-utils";
import ShareProject from "../../../app/components/projects/ShareProject.vue";
import Modal from "../../../app/components/Modal.vue";
import Vuex from "vuex";
import {emptyState} from "../../../app/root";
import registerTranslations from "../../../app/store/translations/registerTranslations";
import LoadingSpinner from "../../../app/components/LoadingSpinner.vue";
import {expectTranslated, mountWithTranslate, shallowMountWithTranslate} from "../../testHelpers";
import {ProjectsState} from "../../../app/store/projects/projects";
import {mockProjectsState} from "../../mocks";
import {mutations, ProjectsMutations} from "../../../app/store/projects/mutations";
import ErrorAlert from "../../../app/components/ErrorAlert.vue";
import {Language} from "../../../app/store/translations/locales";
import {nextTick} from "vue";

declare var currentUser: string;
currentUser = "test.user@example.com"

describe("ShareProject", () => {

    const createStore = (userExists = vi.fn(),
                         cloneProject = vi.fn(),
                         state: ProjectsState = mockProjectsState()) => {
        const store = new Vuex.Store({
            state: emptyState(),
            modules: {
                projects: {
                    state: state,
                    namespaced: true,
                    actions: {
                        userExists: userExists,
                        cloneProject: cloneProject
                    },
                    mutations
                }
            }
        });
        registerTranslations(store);
        return store;
    }

    it("button has aria-label", async () => {
        const store = createStore();
        const wrapper = shallowMountWithTranslate(ShareProject, store, {
            props: {
                project: {id: 1, name: "p1"}
            },
            global: {
                plugins: [store]
            }
        });

        await expectTranslated(wrapper.find("button"), "Share", "Partager", "Partilhar", store, "aria-label");
    });

    it("input has aria-label", async () => {
        const store = createStore();
        const wrapper = mountWithTranslate(ShareProject, store, {
            props: {
                project: {id: 1, name: "p1"}
            },
            global: {
                plugins: [store]
            }
        });

        await expectTranslated(wrapper.find("input"), "Enter email address to share with", "Entrez l'e-mail à partager",
            "Insira o e-mail para compartilhar", store, "aria-label");
    });

    it("opens modal on click", async () => {
        const store = createStore();
        const wrapper = shallowMountWithTranslate(ShareProject, store, {
            props: {
                project: {id: 1, name: "p1"}
            },
            global: {
                plugins: [store]
            }
        });

        expect(wrapper.findComponent(Modal).props("open")).toBe(false);
        const link = wrapper.find("button");
        await link.trigger("click");
        expect(wrapper.findComponent(Modal).props("open")).toBe(true);
    });
    
    it("can cancel sharing", async () => {
        const store= createStore();
        const wrapper = mountWithTranslate(ShareProject, store, {
            props: {
                project: {id: 1, name: "p1"}
            },
            global: {
                plugins: [store]
            }
        });

        const link = wrapper.find("button");
        await link.trigger("click");
        expect(wrapper.findComponent(Modal).props("open")).toBe(true);
        await wrapper.findComponent(Modal).findAll("button")[1].trigger("mousedown");
        expect(wrapper.findComponent(Modal).props("open")).toBe(false);

        const vm = wrapper.vm as any
        expect(vm.emailsToShareWith).toMatchObject([{value: "", valid: null}])
    });

    it("if email is invalid, validation feedback is shown and button disabled", async () => {
        const store = createStore(vi.fn().mockResolvedValue(false))
        const wrapper = mountWithTranslate(ShareProject, store, {
            props: {
                project: {id: 1, name: "p1"}
            },
            global: {
                plugins: [store]
            }
        });

        const link = wrapper.find("button");
        await link.trigger("click");
        const input = wrapper.findComponent(Modal).find("input");
        await input.setValue("bademail");
        await input.trigger("blur");
        await nextTick();
        await nextTick();
        const modal = wrapper.findComponent(Modal);
        expect(modal.find("input").classes()).toContain("is-invalid");

        const text = modal.find(".text-danger")
        expect(text.classes()).not.toContain("d-none");
        await expectTranslated(text, "This email address is not registered with Naomi",
            "Cette adresse e-mail n'est pas enregistrée dans Naomi",
            "Este endereço de e-mail não está registado na Naomi", store as any)
        expect((modal.find("button").element as HTMLButtonElement).disabled).toBe(true);
        expect(modal.find(".help-text").isVisible()).toBe(true);
    });

    it("if email is same as user's email, it is invalid, appropriate validation feedback is shown, and button is disabled", async () => {
        const store = createStore(vi.fn().mockResolvedValue(false))
        const wrapper = mountWithTranslate(ShareProject, store, {
            props: {
                project: {id: 1, name: "p1"}
            },
            global: {
                plugins: [store]
            }
        });

        const link = wrapper.find("button");
        await link.trigger("click");
        const input = wrapper.findComponent(Modal).find("input");
        await input.setValue("test.user@example.com");
        await input.trigger("blur");
        await nextTick();
        const modal = wrapper.findComponent(Modal);
        expect(modal.find("input").classes()).toContain("is-invalid");

        const text = modal.find(".text-danger")
        expect(text.classes()).not.toContain("d-none");
        await expectTranslated(text, "Projects cannot be shared with the user's own account",
            "Les projets ne peuvent pas être partagés avec le propre compte de l'utilisateur",
            "Os projetos não podem ser partilhados com a conta do próprio utilizador", store as any)
        expect((modal.find("button").element as HTMLButtonElement).disabled).toBe(true);
        expect(modal.find(".help-text").isVisible()).toBe(true);
    });

    it("if email is same as user's email but cased differently, it is invalid, appropriate validation feedback is shown, and button is disabled", async () => {
        const store = createStore(vi.fn().mockResolvedValue(false))
        const wrapper = mountWithTranslate(ShareProject, store, {
            props: {
                project: {id: 1, name: "p1"}
            },
            global: {
                plugins: [store]
            }
        });

        const link = wrapper.find("button");
        await link.trigger("click");
        const input = wrapper.findComponent(Modal).find("input");
        await input.setValue("Test.user@Example.com");
        await input.trigger("blur");
        await nextTick();
        const modal = wrapper.findComponent(Modal);
        expect(modal.find("input").classes()).toContain("is-invalid");

        const text = modal.find(".text-danger")
        expect(text.classes()).not.toContain("d-none");
        await expectTranslated(text, "Projects cannot be shared with the user's own account",
            "Les projets ne peuvent pas être partagés avec le propre compte de l'utilisateur",
            "Os projetos não podem ser partilhados com a conta do próprio utilizador", store as any)
        expect((modal.find("button").element as HTMLButtonElement).disabled).toBe(true);
        expect(modal.find(".help-text").isVisible()).toBe(true);
    });

    it("if a valid email is entered twice, it is invalid, appropriate validation feedback is shown, and button is disabled", async () => {
        const store = createStore(vi.fn().mockResolvedValue(true))
        const wrapper = mountWithTranslate(ShareProject, store, {
            props: {
                project: {id: 1, name: "p1"}
            },
            global: {
                plugins: [store]
            }
        });

        const link = wrapper.find("button");
        await link.trigger("click");
        const modal = wrapper.findComponent(Modal);
        expect(modal.findAll("input").length).toBe(1);
        const input = modal.find("input");
        await input.setValue("goodemail");
        await input.trigger("blur");
        await nextTick();

        expect(modal.findAll("input").length).toBe(2);
        const input2 = wrapper.findComponent(Modal).findAll("input")[1];
        input2.setValue("goodemail");
        await input2.trigger("blur");

        expect(input.classes()).toContain("is-invalid");
        expect(input2.classes()).toContain("is-invalid");

        const text = modal.find(".text-danger");
        expect(text.classes()).not.toContain("d-none");
        await expectTranslated(text, "Please remove duplicate emails from the list",
            "Veuillez supprimer les e-mails en double de la liste",
            "Por favor, remova os e-mails duplicados da lista", store as any)
        expect((modal.find("button").element as HTMLButtonElement).disabled).toBe(true);
        expect(modal.find(".help-text").isVisible()).toBe(true);
    });

    it("if a valid email is entered twice but cased differently, it is invalid, appropriate validation feedback is shown, and button is disabled", async () => {
        const store = createStore(vi.fn().mockResolvedValue(true))
        const wrapper = mountWithTranslate(ShareProject, store, {
            props: {
                project: {id: 1, name: "p1"}
            },
            global: {
                plugins: [store]
            }
        });

        const link = wrapper.find("button");
        await link.trigger("click");
        const modal = wrapper.findComponent(Modal);
        expect(modal.findAll("input").length).toBe(1);
        const input = modal.find("input");
        await input.setValue("goodemail");
        await input.trigger("blur");
        await nextTick();

        expect(modal.findAll("input").length).toBe(2);
        const input2 = wrapper.findComponent(Modal).findAll("input")[1];
        await input2.setValue("GOODEMAIL");
        await input2.trigger("blur");

        expect(input.classes()).toContain("is-invalid");
        expect(input2.classes()).toContain("is-invalid");

        const text = modal.find(".text-danger");
        expect(text.classes()).not.toContain("d-none");
        await expectTranslated(text, "Please remove duplicate emails from the list",
            "Veuillez supprimer les e-mails en double de la liste",
            "Por favor, remova os e-mails duplicados da lista", store as any)
        expect((modal.find("button").element as HTMLButtonElement).disabled).toBe(true);
        expect(modal.find(".help-text").isVisible()).toBe(true);
    });

    it("if email is valid, validation feedback is not shown and button enabled", async () => {
        const store = createStore(vi.fn().mockResolvedValue(true));
        const wrapper = mountWithTranslate(ShareProject, store, {
            props: {
                project: {id: 1, name: "p1"}
            },
            global: {
                plugins: [store]
            }
        });

        const link = wrapper.find("button");
        await link.trigger("click");
        const input = wrapper.findComponent(Modal).find("input");
        await input.setValue("goodemail");
        await input.trigger("blur");

        await flushPromises();

        const modal = wrapper.findComponent(Modal);
        expect(modal.find("input").classes()).not.toContain("is-invalid");
        expect(modal.find(".text-danger").exists()).toBe(false);
        expect((modal.find("button").element as HTMLButtonElement).disabled).toBe(false);
        expect(modal.find(".help-text").isVisible()).toBe(false);
    });

    it("if email is valid but cased differently, validation feedback is not shown and button enabled", async () => {
        const store = createStore(vi.fn().mockResolvedValue(true));
        const wrapper = mountWithTranslate(ShareProject, store, {
            props: {
                project: {id: 1, name: "p1"}
            },
            global: {
                plugins: [store]
            }
        });

        const link = wrapper.find("button");
        await link.trigger("click");
        const input = wrapper.findComponent(Modal).find("input");
        await input.setValue("GOODEMAIL");
        await input.trigger("blur");

        await flushPromises();

        const modal = wrapper.findComponent(Modal);
        expect(modal.find("input").classes()).not.toContain("is-invalid");
        expect(modal.find(".text-danger").exists()).toBe(false);
        expect((modal.find("button").element as HTMLButtonElement).disabled).toBe(false);
        expect(modal.find(".help-text").isVisible()).toBe(false);
    });

    it("user validation fires on blur if value is provided", async () => {
        const userExists = vi.fn();
        const store = createStore(userExists);
        const wrapper = mountWithTranslate(ShareProject, store, {
            props: {
                project: {id: 1, name: "p1"}
            },
            global: {
                plugins: [store]
            }
        });

        const link = wrapper.find("button");
        await link.trigger("click");
        const input = wrapper.findComponent(Modal).find("input");
        await input.setValue("testingblurevent");
        await input.trigger("blur");
        await nextTick();
        expect(userExists.mock.calls.length).toBe(1);
    });

    it("user validation does not fire on blur if no value is provided", async () => {
        const userExists = vi.fn();
        const store = createStore(userExists);
        const wrapper = mountWithTranslate(ShareProject, store, {
            props: {
                project: {id: 1, name: "p1"}
            },
            global: {
                plugins: [store]
            }
        });

        const link = wrapper.find("button");
        await link.trigger("click");
        const input = wrapper.findComponent(Modal).find("input");
        await input.trigger("blur");
        await nextTick();
        expect(userExists.mock.calls.length).toBe(0);
    });

    it("if blur fires on last input and value is provided, a new input is added", async () => {
        const store = createStore();
        const wrapper = mountWithTranslate(ShareProject, store, {
            props: {
                project: {id: 1, name: "p1"}
            },
            global: {
                plugins: [store]
            }
        });

        const link = wrapper.find("button");
        await link.trigger("click");
        const inputs = wrapper.findComponent(Modal).findAll("input");
        expect(inputs.length).toBe(1);
        await inputs[0].setValue("testing");
        await inputs[0].trigger("blur");
        await nextTick();
        expect(wrapper.findComponent(Modal).findAll("input").length).toBe(2);
    });

    it("if blur fires on last input but no value is provided, no new input is added", async () => {
        const store = createStore();
        const wrapper = mountWithTranslate(ShareProject, store, {
            props: {
                project: {id: 1, name: "p1"}
            },
            global: {
                plugins: [store]
            }
        });

        const link = wrapper.find("button");
        await link.trigger("click");
        const inputs = wrapper.findComponent(Modal).findAll("input");
        expect(inputs.length).toBe(1);
        await inputs[0].trigger("blur");
        await nextTick();
        expect(wrapper.findComponent(Modal).findAll("input").length).toBe(1);
    });

    it("if blur fires on non-last input, no new input is added", async () => {
        const store = createStore();
        const wrapper = mountWithTranslate(ShareProject, store, {
            props: {
                project: {id: 1, name: "p1"}
            },
            global: {
                plugins: [store]
            }
        });

        const link = wrapper.find("button");
        await link.trigger("click");
        const inputs = wrapper.findComponent(Modal).findAll("input");
        expect(inputs.length).toBe(1);
        await inputs[0].setValue("testing");
        await inputs[0].trigger("blur");
        await nextTick();
        expect(wrapper.findComponent(Modal).findAll("input").length).toBe(2);

        await inputs[0].setValue("newvalue");
        await inputs[0].trigger("blur");
        expect(wrapper.findComponent(Modal).findAll("input").length).toBe(2);
    });

    it("if email is deleted , input is removed from list and validation message refreshed",
        async () => {
            const store = createStore(vi.fn().mockResolvedValue(false));
            const wrapper = mountWithTranslate(ShareProject, store, {
                props: {
                    project: {id: 1, name: "p1"}
                },
                global: {
                    plugins: [store]
                }
            });

            const link = wrapper.find("button");
            await link.trigger("click");
            const inputs = wrapper.findComponent(Modal).findAll("input");
            expect(inputs.length).toBe(1);
            await inputs[0].setValue("testing");
            await inputs[0].trigger("blur");
            await flushPromises();
            expect(wrapper.findComponent(Modal).findAll("input").length).toBe(2);
            expect(wrapper.findComponent(Modal).find(".help-text").isVisible()).toBe(true);

            await inputs[0].setValue("");
            await inputs[0].trigger("keyup.delete");
            await nextTick();
            expect(wrapper.findComponent(Modal).findAll("input").length).toBe(1);
            expect(wrapper.findComponent(Modal).find(".help-text").isVisible()).toBe(false);
        });

    it("if email characters are deleted nothing happens", async () => {
        const store = createStore();
        const wrapper = mountWithTranslate(ShareProject, store, {
            props: {
                project: {id: 1, name: "p1"}
            },
            global: {
                plugins: [store]
            }
        });

        const link = wrapper.find("button");
        await link.trigger("click");
        const inputs = wrapper.findComponent(Modal).findAll("input");
        expect(inputs.length).toBe(1);
        await inputs[0].setValue("testing");
        await inputs[0].trigger("blur");
        await nextTick();
        expect(wrapper.findComponent(Modal).findAll("input").length).toBe(2);

        await inputs[0].setValue("testin");
        await inputs[0].trigger("keyup.delete");
        await nextTick();
        expect(wrapper.findComponent(Modal).findAll("input").length).toBe(2);
    });

    it("if last email in list is deleted, empty input remains visible", async () => {
        const store = createStore();
        const wrapper = mountWithTranslate(ShareProject, store, {
            props: {
                project: {id: 1, name: "p1"}
            },
            global: {
                plugins: [store]
            }
        });

        const link = wrapper.find("button");
        await link.trigger("click");
        let inputs = wrapper.findComponent(Modal).findAll("input");
        expect(inputs.length).toBe(1);
        await inputs[0].setValue("testing");
        await inputs[0].trigger("blur");
        await nextTick();
        expect(wrapper.findComponent(Modal).findAll("input").length).toBe(2);

        inputs = wrapper.findComponent(Modal).findAll("input");
        await inputs[1].setValue("somevalue");
        await inputs[1].trigger("blur");
        await nextTick();

        await inputs[1].setValue("");
        await inputs[1].trigger("keyup.delete");
        await nextTick();

        expect(wrapper.findComponent(Modal).findAll("input").length).toBe(2);
    });

    it("can share project", async () => {
        const cloneProject = vi.fn();
        const store = createStore(vi.fn().mockResolvedValue(true), cloneProject);
        const wrapper = mountWithTranslate(ShareProject, store, {
            props: {
                project: {id: 1, name: "p1"}
            },
            global: {
                plugins: [store]
            }
        });

        const link = wrapper.find("button");
        await link.trigger("click");
        const input = wrapper.findComponent(Modal).find("input");
        await input.setValue("testing");
        await input.trigger("blur");
        await flushPromises();
        await wrapper.findComponent(Modal).find("button").trigger("click");
        expect(cloneProject.mock.calls[0][1]).toEqual({projectId: 1, emails: ["testing"]});
    });

    it("shows loading spinner when cloningProject is true", async () => {
        const store = createStore(vi.fn(), vi.fn(), mockProjectsState({cloningProject: true}));
        const wrapper = mountWithTranslate(ShareProject, store, {
            props: {
                project: {id: 1, name: "p1"}
            },
            global: {
                plugins: [store]
            }
        });

        const link = wrapper.find("button");
        await link.trigger("click");
        expect(wrapper.findComponent(Modal).findAllComponents(LoadingSpinner).length).toBe(1);
    });

    it("does not show loading spinner when cloningProject is false", async () => {
        const store = createStore(vi.fn(), vi.fn());
        const wrapper = mountWithTranslate(ShareProject, store, {
            props: {
                project: {id: 1, name: "p1"}
            },
            global: {
                plugins: [store]
            }
        });

        const link = wrapper.find("button");
        await link.trigger("click");
        expect(wrapper.findComponent(Modal).findAllComponents(LoadingSpinner).length).toBe(0);
    });

    it("closes modal when cloningProject changes from true to false, if there is not an error",
         async () => {
            const store = createStore(vi.fn(), vi.fn(), mockProjectsState({cloningProject: true}));
            const wrapper = shallowMountWithTranslate(ShareProject, store, {
                props: {
                    project: {id: 1, name: "p1"}
                },
                global: {
                    plugins: [store]
                }
            });

            const link = wrapper.find("button");
            await link.trigger("click");
            expect(wrapper.findComponent(Modal).props("open")).toBe(true);
            store.commit("projects/" + ProjectsMutations.CloningProject, {payload: false});
            await nextTick();
            expect(wrapper.findComponent(Modal).props("open")).toBe(false);
        });

    it("does not close modal when cloningProject changes from true to false if there is an error",
         async () => {
            const store = createStore(vi.fn(),
                vi.fn(),
                mockProjectsState({cloningProject: true}));

            const wrapper = mountWithTranslate(ShareProject, store, {
                props: {
                    project: {id: 1, name: "p1"}
                },
                global: {
                    plugins: [store]
                }
            });

            const link = wrapper.find("button");
            await link.trigger("click");
            expect(wrapper.findComponent(Modal).props("open")).toBe(true);
            store.commit("projects/" + ProjectsMutations.CloneProjectError, {payload: {error: "E"}});
            await nextTick();
            expect(wrapper.findComponent(Modal).props("open")).toBe(true);
            expect(wrapper.findComponent(Modal).findAllComponents(ErrorAlert).length).toBe(1);
            expect(wrapper.findComponent(Modal).findComponent(ErrorAlert).props("error")).toEqual({error: "E"});
        });

    it("translates header", async () => {
        const store = createStore();
        const wrapper = mountWithTranslate(ShareProject, store, {
            props: {
                project: {id: 1, name: "p1"}
            },
            global: {
                plugins: [store]
            }
        });

        const link = wrapper.find("button");
        await link.trigger("click");
        await expectTranslated(wrapper.findComponent(Modal).find("h4"), "Share project",
            "Partager ce project", "Partilhar projeto", store);
    });

    it("translates instructions", async () => {
        const store = createStore();
        const wrapper = mountWithTranslate(ShareProject, store, {
            props: {
                project: {id: 1, name: "p1"}
            },
            global: {
                plugins: [store]
            }
        });

        const link = wrapper.find("button");
        await link.trigger("click");
        const expectedEnglish = "This will create a copy of p1 for the given users." +
            "Please enter the email addresses you would like to share " +
            "this project with. Press Enter to add a new address. These email addresses must be already registered with Naomi."

        const expectedFrench = "Cela créera une copie de p1 pour les utilisateurs désignés." +
            "Veuillez entrer les adresses e-mails " +
            "avec lesquelles vous souhaitez partager ce projet. Appuyez sur Enter pour ajouter une autre adresse. Ces adresses e-mails doivent être déjà enregistrées dans Naomi."

        const expectedPortuguese = "Isto irá criar uma cópia de p1 para os utilizadores em causa." +
            " Por favor, introduza os endereços de e-mail com os quais gostaria de partilhar este projeto. " +
            "Prima Enter para adicionar um novo endereço. Estes endereços de e-mail já devem estar registados na Naomi.";


        await expectTranslated(wrapper.findComponent(Modal).find("#instructions"), expectedEnglish, expectedFrench, expectedPortuguese, store);
    });

    it("translates button text", async () => {
        const store = createStore();
        const wrapper = mountWithTranslate(ShareProject, store, {
            props: {
                project: {id: 1, name: "p1"}
            },
            global: {
                plugins: [store]
            }
        });

        const link = wrapper.find("button");
        await link.trigger("click");
        const buttons = wrapper.findComponent(Modal).findAll("button");

        await expectTranslated(buttons[0], "OK", "OK", "OK", store);
        await expectTranslated(buttons[1], "Cancel", "Annuler", "Cancelar", store);
    });

    it("translates help text", async () => {
        const store = createStore();
        const wrapper = mountWithTranslate(ShareProject, store, {
            props: {
                project: {id: 1, name: "p1"}
            },
            global: {
                plugins: [store]
            }
        });

        const link = wrapper.find("button");
        await link.trigger("click");
        const helpText = wrapper.findComponent(Modal).find(".help-text");

        await expectTranslated(helpText, "Please correct or remove invalid email addresses",
            "Veuillez corriger ou supprimer les adresses e-mails non-valides",
            "Por favor, corrija ou remova endereços de e-mail inválidos", store);
    });

    it("can render tooltips without an error", () => {
        const mockTooltip = vi.fn();
        const store = createStore();
        const wrapper = shallowMountWithTranslate(ShareProject, store, {
            props: {
                project: {id: 1, name: "p1"}
            },
            global: {
                plugins: [store],
                directives: {"tooltip": mockTooltip}
            }
        });

        expect(wrapper.find("share-2-icon").exists).toBeTruthy();
        expect(mockTooltip.mock.calls[0][1].value).toBe("Share");
    });

    it("can render share project tooltips without an error", async () => {
        const mockTooltip = vi.fn();
        const store = createStore()
        store.state.language = Language.fr
        await nextTick();

        const wrapper = shallowMountWithTranslate(ShareProject, store, {
            props: {
                project: {id: 1, name: "p1"}
            },
            global: {
                plugins: [store],
                directives: {"tooltip": mockTooltip}
            }
        });

        expect(wrapper.find("share-2-icon").exists).toBeTruthy();
        expect(mockTooltip.mock.calls[0][1].value).toBe("Partager");
    });

});
