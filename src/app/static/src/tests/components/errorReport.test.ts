import {mount} from '@vue/test-utils';
import ErrorReport from "../../app/components/ErrorReport.vue";
import Modal from "../../app/components/Modal.vue";
import Vuex from "vuex";
import {mockErrorsState, mockProjectsState, mockRootState, mockStepperState} from "../mocks";
import registerTranslations from "../../app/store/translations/registerTranslations";
import {StepDescription, StepperState} from "../../app/store/stepper/stepper";
import {ProjectsState} from "../../app/store/projects/projects";
import {expectTranslated, mountWithTranslate, shallowMountWithTranslate} from "../testHelpers";
import {createRouter, createWebHashHistory} from "vue-router";
import {Language} from "../../app/store/translations/locales";
import ErrorAlert from "../../app/components/ErrorAlert.vue";
import {RootState} from "../../app/root";
import {ErrorsState} from "../../app/store/errors/errors";
import LoadingSpinner from "../../app/components/LoadingSpinner.vue";
import {emailRegex, mapStateProp} from "../../app/utils";
import {nextTick} from 'vue';

describe("Error report component", () => {

    const createStore = (stepperState: Partial<StepperState> = {},
                         projectsState: Partial<ProjectsState> = {},
                         rootState: Partial<RootState> = {},
                         isGuest = false,
                         errorsState: Partial<ErrorsState> ={}) => {
        const store = new Vuex.Store({
            state: mockRootState(rootState),
            modules: {
                stepper: {
                    namespaced: true,
                    state: mockStepperState(stepperState)
                },
                projects: {
                    namespaced: true,
                    state: mockProjectsState(projectsState)
                },
                errors: {
                    namespaced: true,
                    state: mockErrorsState(errorsState)
                }
            },
            getters: {
                isGuest: () => isGuest
            }
        });
        registerTranslations(store);
        return store;
    };

    afterEach(() => {
        vi.resetAllMocks();
    });

    const rootSectionSlot = {
        name: 'sectionView',
        template: `
            <div>
            <label for="section" v-translate="'section'"></label>
            <select class="form-control"
                    v-model="currentSection"
                    id="section">
                <option v-for="step in steps"
                        :key="step.number"
                        :value="step.textKey"
                        v-translate="step.textKey">
                </option>
                <option key="login"
                        v-translate="'login'"
                        value="login"></option>
                <option key="projects" v-translate="'projects'"
                        value="projects"></option>
                <option key="other"
                        value="other"
                        v-translate="'other'"></option>
            </select>
            </div>
        `,
        data() {
            return {
                section: '',
            }
        },
        computed: {
            currentSectionKey: {
                get() {
                    return mapStateProp<StepperState, string>("stepper",
                        state => state.steps[state.activeStep - 1].textKey)
                }
            },
            currentSection: {
                get() {
                    return rootSectionSlot.data().section || rootSectionSlot.computed.currentSectionKey
                },
                set (newVal: string) {
                    rootSectionSlot.data().section = newVal
                }
            },
            steps: mapStateProp<StepperState, StepDescription[]>("stepper", state => state.steps)
        }
    }

    const projectSlot = {
        name: 'projectView',
        template: `
            <div v-if="projectName"><label for="project" v-translate="'project'"></label>
            <input type="text" disabled id="project" :value="projectName" class="form-control"/>
            </div>
        `,
        computed: {
            projectName: mapStateProp<ProjectsState, string | undefined>("projects",
                    state => state.currentProject?.name)
        }
    }

    it("modal is open when prop is true", () => {
        const store = createStore();
        const wrapper = shallowMountWithTranslate(ErrorReport, store, {
            props: {
                open: true
            },
            global: {
                plugins: [store]
            }
        });

        expect(wrapper.findComponent(Modal).props("open")).toBe(true);
    });

    it("modal is closed when prop is false", () => {
        const store = createStore();
        const wrapper = shallowMountWithTranslate(ErrorReport, store, {
            props: {
                open: false
            },
            global: {
                plugins: [store]
            }
        });

        expect(wrapper.findComponent(Modal).props("open")).toBe(false);
    });

    it("renders steps as options with project, login and other as extra sections", () => {
        const store = createStore()
        const wrapper = mountWithTranslate(ErrorReport, store, {
            props: {
                open: true
            },
            global: {
                plugins: [store]
            },
            slots: {
                sectionView: rootSectionSlot
            }
        });
        const options = wrapper.findAll("option");

        expect((options[0].element as HTMLOptionElement).value).toBe("uploadInputs");
        expect((options[1].element as HTMLOptionElement).value).toBe("reviewInputs");
        expect((options[6].element as HTMLOptionElement).value).toBe("downloadResults");
        expect((options[7].element as HTMLOptionElement).value).toBe("login");
        expect((options[8].element as HTMLOptionElement).value).toBe("projects");
        expect((options[9].element as HTMLOptionElement).value).toBe("other");
    });

    it(`renders modal text in English, French and Portuguese`, async () => {
        const store = createStore({}, {currentProject: {name: "p1", id: 1, versions: []}}, {}, true)
        const wrapper = mountWithTranslate(ErrorReport, store, {
            props: {
                open: true
            },
            global: {
                plugins: [store]
            },
            slots: {
                sectionView: rootSectionSlot,
                projectView: projectSlot
            }
        });

        await expectTranslated(wrapper.find("h4"),
            "Troubleshooting request",
            "Demande de dépannage",
            "Solicitação de solução de problemas",
            store)

        const labels = wrapper.findAll("label")
        expect(labels.length).toBe(5)

        await expectTranslated(labels[0],
            "Project",
            "Projet",
            "Projeto",
            store)

        await expectTranslated(labels[1],
            "Email address",
            "Adresse e-mail",
            "Endereço de e-mail",
            store)

        await expectTranslated(labels[2],
            "Section",
            "Section",
            "Seção",
            store)

        await expectTranslated(labels[3],
            "Description",
            "La description",
            "Descrição",
            store)

        await expectTranslated(labels[4],
            "Steps to reproduce",
            "Étapes à reproduire",
            "Passos para reproduzir",
            store)

        const mutedText = wrapper.findAll("div.small.text-muted")

        expect(mutedText.length).toBe(2)

        await expectTranslated(mutedText[0],
            "Please include details about what you were trying to do, the expected result and what actually happened.",
            "Veuillez inclure des détails sur ce que vous essayiez de faire, le résultat attendu et ce qui s'est réellement passé.",
            "Inclua detalhes sobre o que você estava tentando fazer, o resultado esperado e o que realmente aconteceu.",
            store)

        await expectTranslated(mutedText[1],
            "Describe how to reproduce the error so another person could follow your steps.",
            "Décrivez comment reproduire l'erreur afin qu'une autre personne puisse suivre vos étapes.",
            "Descreva como reproduzir o erro para que outra pessoa possa seguir seus passos.",
            store)
    })

    it("renders modal buttons in English, French and Portuguese", async () => {
        const store = createStore()

        const wrapper = mountWithTranslate(ErrorReport, store, {
            props: {
                open: true
            },
            global: {
                plugins: [store]
            }
        });

        const buttons = wrapper.findAll("button")

        expect(buttons.length).toBe(2)

        await expectTranslated(buttons[0],
            "Send",
            "Envoyer",
            "Mandar",
            store)

        await expectTranslated(buttons[1],
            "Cancel",
            "Annuler",
            "Cancelar",
            store)
    });

    it(`renders modal options in English, French and Portuguese`, () => {
        const store = createStore()

        const wrapper = mountWithTranslate(ErrorReport, store, {
            props: {
                open: true
            },
            global: {
                plugins: [store]
            },
            slots: {
                sectionView: rootSectionSlot
            }
        });
        const options = wrapper.findAll("option");
        expect(options.length).toBe(10);
    })

    it("shows email field if user is guest", () => {
        const store = createStore({}, {}, {}, true);
        const wrapper = mountWithTranslate(ErrorReport, store, {
            props: {
                open: true
            },
            global: {
                plugins: [store]
            }
        });

        expect(wrapper.findAll("input#email").length).toBe(1);
    });

    it("does not shows email field if user is logged in", () => {
        const store = createStore({}, {}, {}, false);
        const wrapper = shallowMountWithTranslate(ErrorReport, store, {
            props: {
                open: true
            },
            global: {
                plugins: [store]
            }
        });

        expect(wrapper.findAll("input#email").length).toBe(0);
    });

    it("email field is not required if user is logged in", async () => {
        const store = createStore({}, {}, {}, false);
        const wrapper = mountWithTranslate(ErrorReport, store, {
            props: {
                open: true
            },
            global: {
                plugins: [store]
            }
        });

        await wrapper.find("#description").setValue("something");
        await wrapper.find("#reproduce").setValue("reproduce steps");

        expect(wrapper.findAll("button").length).toBe(2);
        expect(wrapper.findAll("button")[0].attributes().disabled).toBeUndefined();
    });

    it("email field is required if user is not logged in", async () => {
        const store = createStore({}, {}, {}, true);
        const wrapper = mountWithTranslate(ErrorReport, store, {
            props: {
                open: true
            },
            global: {
                plugins: [store]
            }
        });

        await wrapper.find("#description").setValue("something");
        await wrapper.find("#reproduce").setValue("reproduce steps");

        expect(wrapper.findAll("input#email").length).toBe(1);
        expect(wrapper.findAll("button").length).toBe(2);
        expect(wrapper.findAll("button")[0].attributes().disabled).toBe("");
    });

    it("description field is required", async () => {
        const store = createStore({}, {}, {}, true);
        const wrapper = mountWithTranslate(ErrorReport, store, {
            props: {
                open: true
            },
            global: {
                plugins: [store]
            }
        });

        await wrapper.find("#reproduce").setValue("reproduce steps");
        await wrapper.find("#email").setValue("test@test.com");

        expect(wrapper.findAll("button").length).toBe(2);
        expect(wrapper.findAll("button")[0].attributes().disabled).toBe("");
    });

    it("reproduce steps field is required", async () => {
        const store = createStore({}, {}, {}, true);
        const wrapper = mountWithTranslate(ErrorReport, store, {
            props: {
                open: true
            },
            global: {
                plugins: [store]
            }
        });

        await wrapper.find("#description").setValue("desc");
        await wrapper.find("#email").setValue("test@test.com");

        expect(wrapper.findAll("button").length).toBe(2);
        expect(wrapper.findAll("button")[0].attributes().disabled).toBe("");
    });

    it("translates button tooltip", async () => {
        const store = createStore({}, {}, {}, true);
        const mockTooltip = vi.fn();
        mountWithTranslate(ErrorReport, store, {
            props: {
                open: true
            },
            global: {
                plugins: [store],
                directives: {"tooltip": mockTooltip}
            }
        });

        expect(mockTooltip.mock.calls[0][1].value).toBe("Please fill out all fields to proceed");

        store.state.language = Language.fr
        await nextTick();

        expect(mockTooltip.mock.calls[1][1].value).toBe("Veuillez remplir tous les champs");

        store.state.language = Language.pt
        await nextTick();

        expect(mockTooltip.mock.calls[2][1].value).toBe("Por favor, preencha todos os campos");
    });

    it("shows disabled, auto-populated project field if there is a current project", () => {
        const store = createStore({}, {currentProject: {name: "p1", id: 1, versions: []}}, {}, false);
        const wrapper = mountWithTranslate(ErrorReport, store, {
            props: {
                open: true
            },
            global: {
                plugins: [store]
            },
            slots: {
                projectView: projectSlot
            }
        });

        expect(wrapper.findAll("input#project").length).toBe(1);
        const el = wrapper.find("input#project").element as HTMLInputElement
        expect(el.value).toBe("p1");
        expect(el.disabled).toBe(true);
    });

    it("does not show project field if there is no current project", () => {
        const store = createStore({}, {}, {}, true);
        const wrapper = shallowMountWithTranslate(ErrorReport, store, {
            props: {
                open: true
            },
            global: {
                plugins: [store]
            },
            slots: {
                projectView: projectSlot
            }
        });

        expect(wrapper.findAll("input#project").length).toBe(0);
    });

    it("does not show project field", () => {
        const store = createStore({}, {}, {}, true);
        const wrapper = shallowMountWithTranslate(ErrorReport, store, {
            props: {
                open: true
            },
            global: {
                plugins: [store]
            }
        });

        expect(wrapper.find("input#project").exists()).toBe(false);
    });

    it("does not show section field by default", () => {
        const store = createStore({}, {}, {}, true);
        const wrapper = shallowMountWithTranslate(ErrorReport, store, {
            props: {
                open: true
            },
            global: {
                plugins: [store]
            }
        });

        expect(wrapper.find("#section").exists()).toBe(false);
    });

    it("emits close event on cancel", async () => {
        const store = createStore();
        const wrapper = mountWithTranslate(ErrorReport, store, {
            props: {
                open: true
            },
            global: {
                plugins: [store]
            }
        });

        expect(wrapper.find(".btn-white").text()).toBe("Cancel");
        await wrapper.find(".btn-white").trigger("click");

        expect(wrapper.emitted().close).toBeDefined();
    });

    it("resets data on cancel", async () => {
        const store = createStore({}, {}, {}, true);
        const wrapper = mountWithTranslate(ErrorReport, store, {
            props: {
                open: true
            },
            global: {
                plugins: [store]
            },
            slots: {
                sectionView: rootSectionSlot
            }
        });

        await wrapper.find("#description").setValue("something");
        await wrapper.find("#reproduce").setValue("reproduce steps");
        await wrapper.find("#section").setValue("downloadResults");
        await wrapper.find("#email").setValue("test@email.com");

        expect((wrapper.vm as any).$data.description).toBe("something");
        expect((wrapper.vm as any).$data.stepsToReproduce).toBe("reproduce steps");
        expect((wrapper.vm as any).$data.email).toBe("test@email.com");

        await wrapper.find(".btn-white").trigger("click");

        expect((wrapper.vm as any).$data.description).toBe("");
        expect((wrapper.vm as any).$data.stepsToReproduce).toBe("");
        expect((wrapper.vm as any).$data.email).toBe("");
    });

    it("resets data on send", async () => {
        const store = createStore({}, {}, {}, true);
        const wrapper = mountWithTranslate(ErrorReport, store, {
            props: {
                open: true
            },
            global: {
                plugins: [store]
            }
        });

        await wrapper.find("#description").setValue("something");
        await wrapper.find("#reproduce").setValue("reproduce steps");
        await wrapper.find("#email").setValue("test@email.com");

        expect((wrapper.vm as any).$data.description).toBe("something");
        expect((wrapper.vm as any).$data.stepsToReproduce).toBe("reproduce steps");
        expect((wrapper.vm as any).$data.email).toBe("test@email.com");

        await wrapper.find(".btn-red").trigger("click");
        await nextTick();

        expect((wrapper.vm as any).$data.description).toBe("");
        expect((wrapper.vm as any).$data.stepsToReproduce).toBe("");
        expect((wrapper.vm as any).$data.email).toBe("");
    });

    it("can validate email with whitespace", async () => {
        const store = createStore({}, {}, {}, true)
        const wrapper = mountWithTranslate(ErrorReport, store, {
            props: {
                open: true
            },
            global: {
                plugins: [store]
            }
        });

        await wrapper.find("#email").setValue("tes t@email.com ");
        expect((wrapper.vm as any).$data.email).toBe("test@email.com");
        expect(wrapper.find(".invalid-feedback").exists()).toBe(false)
    });

    it("does not validate email with one letter postfix", async () => {
        const store = createStore({}, {}, {}, true)
        const wrapper = mountWithTranslate(ErrorReport, store, {
            props: {
                open: true
            },
            global: {
                plugins: [store]
            },
            slots: {
                sectionView: rootSectionSlot
            }
        });

        await wrapper.find("#description").setValue("something");
        await wrapper.find("#reproduce").setValue("reproduce steps");
        await wrapper.find("#section").setValue("downloadResults");
        await wrapper.find("#email").setValue("test@email.c");

        expect(wrapper.find(".btn-red").text()).toBe("Send");
        expect((wrapper.find(".btn-red").element as HTMLButtonElement).disabled).toBe(true)

        const invalidFeedback = wrapper.find(".invalid-feedback");
        await expectTranslated(invalidFeedback,
            "Please enter a valid email address",
            "S'il vous plaît, mettez une adresse email valide",
            "Por favor insira um endereço de e-mail válido", store)
    });

    it("does not validate email without @ symbol", async () => {
        const store = createStore({}, {}, {}, true)
        const wrapper = mountWithTranslate(ErrorReport, store, {
            props: {
                open: true
            },
            global: {
                plugins: [store]
            },
            slots: {
                sectionView: rootSectionSlot
            }
        });

        await wrapper.find("#description").setValue("something");
        await wrapper.find("#reproduce").setValue("reproduce steps");
        await wrapper.find("#section").setValue("downloadResults");
        await wrapper.find("#email").setValue("testemail.com");

        expect(wrapper.find(".btn-red").text()).toBe("Send");
        expect((wrapper.find(".btn-red").element as HTMLButtonElement).disabled).toBe(true)

        const invalidFeedback = wrapper.find(".invalid-feedback");
        await expectTranslated(invalidFeedback,
            "Please enter a valid email address",
            "S'il vous plaît, mettez une adresse email valide",
            "Por favor insira um endereço de e-mail válido", store)
    });

    it("disables button and display email validation message when invalid email address", async () => {
        const store = createStore({}, {}, {}, true)
        const wrapper = mountWithTranslate(ErrorReport, store, {
            props: {
                open: true
            },
            global: {
                plugins: [store]
            },
            slots: {
                sectionView: rootSectionSlot
            }
        });

        await wrapper.find("#description").setValue("something");
        await wrapper.find("#reproduce").setValue("reproduce steps");
        await wrapper.find("#section").setValue("downloadResults");
        await wrapper.find("#email").setValue("test@email.c");

        expect(wrapper.find("#email").attributes("pattern")).toStrictEqual(emailRegex.source)
        expect(wrapper.find(".btn-red").text()).toBe("Send");
        expect((wrapper.find(".btn-red").element as HTMLButtonElement).disabled).toBe(true)

        const invalidFeedback = wrapper.find(".invalid-feedback");
        await expectTranslated(invalidFeedback,
            "Please enter a valid email address",
            "S'il vous plaît, mettez une adresse email valide",
            "Por favor insira um endereço de e-mail válido", store)
    });


    it("validates email and enables send button ", async () => {
        const store = createStore({}, {}, {}, true)
        const wrapper = mountWithTranslate(ErrorReport, store, {
            props: {
                open: true
            },
            global: {
                plugins: [store]
            },
            slots: {
                sectionView: rootSectionSlot
            }
        });

        await wrapper.find("#description").setValue("something");
        await wrapper.find("#reproduce").setValue("reproduce steps");
        await wrapper.find("#section").setValue("downloadResults");
        await wrapper.find("#email").setValue("test@email.com");

        expect(wrapper.find("#email").attributes("pattern")).toStrictEqual(emailRegex.source)
        expect(wrapper.find(".btn-red").text()).toBe("Send");
        expect((wrapper.find(".btn-red").element as HTMLButtonElement).disabled).toBe(false)
        expect(wrapper.find(".invalid-feedback").exists()).toBe(false)
    });

    it("emits action and sets showFeedback on send", async () => {
        const store = createStore();
        const wrapper = mountWithTranslate(ErrorReport, store, {
            props: {
                open: true
            },
            global: {
                plugins: [store]
            },
            slots: {
                sectionView: rootSectionSlot
            }
        });

        await wrapper.find("#description").setValue("something");
        await wrapper.find("#reproduce").setValue("reproduce steps");
        await wrapper.find("#section").setValue("downloadResults");

        expect(wrapper.find(".btn-red").text()).toBe("Send");
        await wrapper.find(".btn-red").trigger("click");
        await nextTick();

        expect(wrapper.emitted("send")!.length).toBe(1)
        expect(wrapper.emitted("send")![0][0]).toStrictEqual(
            {
                description: "something",
                stepsToReproduce: "reproduce steps",
                email: ""
            }
        )

        expect((wrapper.vm as any).showFeedback).toBe(true);
        expect(wrapper.emitted().close).toBeUndefined();
    });

    it("disables send button and render spinner when sending error report", async () => {
        const store = createStore({}, {}, {}, false, {sendingErrorReport: true})
        const wrapper = mountWithTranslate(ErrorReport, store, {
            props: {
                open: true,
                email: "something"
            },
            global: {
                plugins: [store]
            },
            slots: {
                sectionView: rootSectionSlot
            }
        });

        await wrapper.find("#description").setValue("something");
        await wrapper.find("#reproduce").setValue("reproduce steps");
        await wrapper.find("#section").setValue("downloadResults");

        expect(wrapper.findComponent(LoadingSpinner).exists()).toBe(true)
        await expectTranslated(wrapper.find("#sending-error-report"),
            "Sending request...", "Envoyer une requete...", "Enviando pedido ...", store)
        expect((wrapper.find("#send").element as HTMLButtonElement).disabled).toBe(true)
    });

    it("does not disable send button or render spinner when sending error report is not in progress",  async () => {
        const store = createStore();
        const wrapper = mountWithTranslate(ErrorReport, store, {
            props: {
                open: true,
                email: "something"
            },
            global: {
                plugins: [store]
            },
            slots: {
                sectionView: rootSectionSlot
            }
        });

        await wrapper.find("#description").setValue("something");
        await wrapper.find("#reproduce").setValue("reproduce steps");
        await wrapper.find("#section").setValue("downloadResults");

        expect(wrapper.findComponent(LoadingSpinner).exists()).toBe(false)
        expect((wrapper.find("#send").element as HTMLButtonElement).disabled).toBe(false)
    });

    it("does not emit action on cancel", async () => {
        const store = createStore();
        const wrapper = mountWithTranslate(ErrorReport, store, {
            props: {
                open: true
            },
            global: {
                plugins: [store]
            }
        });
        
        expect(wrapper.find(".btn-white").text()).toBe("Cancel");
        await wrapper.find(".btn-white").trigger("click");

        expect(wrapper.emitted("send")!).toBeUndefined()
    });

    it("renders no feedback by default", () => {
        const store = createStore();
        const wrapper = shallowMountWithTranslate(ErrorReport, store, {
            props: {
                open: true
            },
            global: {
                plugins: [store]
            }
        });
        expect(wrapper.find("#report-success").exists()).toBe(false);
        expect(wrapper.find("#report-error").exists()).toBe(false);
        expect(wrapper.findComponent(ErrorAlert).exists()).toBe(false);
    });

    it("renders success feedback when no error report error", async () => {
        const store = createStore();
        const wrapper = mountWithTranslate(ErrorReport, store, {
            props: {
                open: true
            },
            global: {
                plugins: [store]
            }
        });
        await wrapper.setData({showFeedback: true});

        await expectTranslated(wrapper.find("#report-success"),
            "Thank you, your request has been sent. We will respond as soon as possible.",
            "Merci, votre demande a été envoyé. Nous vous répondrons dans les plus brefs délais.",
            "Obrigado, sua solicitação foi enviada. Nós responderemos o mais rapidamente possível.",
            wrapper.vm.$store
        );
        await expectTranslated(wrapper.find(".btn-red"), "Close", "Fermer", "Fechar",
            wrapper.vm.$store);
        expect(wrapper.find("#report-error").exists()).toBe(false);
        expect(wrapper.findComponent(ErrorAlert).exists()).toBe(false);
    });

    it("renders error feedback when there is an error report error", async () => {
        const errorReportError = {
            error: "TEST ERROR",
            detail: "TEST DETAIL"
        };
        const store = createStore({}, {}, {}, false, {errorReportError});
        const wrapper = mountWithTranslate(ErrorReport, store, {
            props: {
                open: true
            },
            global: {
                plugins: [store]
            }
        });
        await wrapper.setData({showFeedback: true});
        await expectTranslated(wrapper.find("#report-error"),
            "An error occurred while sending your request:",
            "Une erreur s'est produite lors de l'envoi de votre demande :",
            "Ocorreu um erro ao enviar sua solicitação:",
            wrapper.vm.$store
        );
        expect(wrapper.findComponent(ErrorAlert).props("error")).toStrictEqual(errorReportError);
        await expectTranslated(wrapper.find(".btn-red"), "Close", "Fermer", "Fechar",
            wrapper.vm.$store);
        expect(wrapper.find("#report-success").exists()).toBe(false);
    });

    it("emits close event on click close button", async () => {
        const store = createStore();
        const wrapper = mountWithTranslate(ErrorReport, store, {
            props: {
                open: true
            },
            global: {
                plugins: [store]
            }
        });
        await wrapper.setData({showFeedback: true});

        expect(wrapper.find(".btn-red").text()).toBe("Close");
        await wrapper.find(".btn-red").trigger("click");

        expect(wrapper.emitted().close).toBeDefined();
    });

    it("resets showFeedback on open", async () => {
        const router = createRouter({routes: [], history: createWebHashHistory() });
        const store = createStore();
        const wrapper = mount(ErrorReport, { global: {plugins: [store, router]} });
        await wrapper.setData({showFeedback: true});

        await wrapper.setProps({open: true});
        expect((wrapper.vm as any).showFeedback).toBe(false);
    });
});
