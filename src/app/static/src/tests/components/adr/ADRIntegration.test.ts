import {Error} from "../../../app/generated";
import Vuex, {ActionTree} from "vuex";
import {mockADRState, mockBaselineState, mockDatasetResource, mockRootState} from "../../mocks";
import {ADRActions} from "../../../app/store/adr/actions";
import {RootState} from "../../../app/root";
import registerTranslations from "../../../app/store/translations/registerTranslations";
import {shallowMount} from "@vue/test-utils";
import ADRKey from "../../../app/components/adr/ADRKey.vue";
import ADRIntegration from "../../../app/components/adr/ADRIntegration.vue";
import SelectDataset from "../../../app/components/adr/SelectDataset.vue";
import {ADRMutation, mutations} from "../../../app/store/adr/mutations";
import {getters} from "../../../app/store/root/getters";
import {ADRState} from "../../../app/store/adr/adr";
import {prefixNamespace} from "../../../app/utils";
import {Language} from "../../../app/store/translations/locales";
import {expectTranslated, shallowMountWithTranslate} from "../../testHelpers";
import {BaselineState} from "../../../app/store/baseline/baseline";
import {nextTick} from "vue";

describe("adr integration", () => {

    const fetchKeyStub = vi.fn();
    const getDataStub = vi.fn();
    const getUserCanUploadStub = vi.fn();
    const ssoLoginMethodStud = vi.fn();

    const fakeDataset = {
        id: "id1",
        title: "Some data",
        url: "www.adr.com/naomi-data/some-data",
        organization: {id: "org-id"},
        resources: {
            pjnz: null,
            program: null,
            pop: null,
            survey: null,
            shape: mockDatasetResource({
                url: "shape.geojson",
                lastModified: "2020-11-03",
                metadataModified: "2020-11-04"
            }),
            anc: null,
            vmmc: null
        }
    }

    const createStore = (key: string = "", error: Error | null = null,
                         partialRootState: Partial<RootState> = {},
                         canUpload = false,
                         baselineState?: Partial<BaselineState>,
                         ssoLogin = false) => {
        const store = new Vuex.Store({
            state: mockRootState({...partialRootState}),
            modules: {
                adr: {
                    namespaced: true,
                    state: mockADRState({key, keyError: error, userCanUpload: canUpload, ssoLogin}),
                    actions: {
                        getDatasets: getDataStub,
                        fetchKey: fetchKeyStub,
                        getUserCanUpload: getUserCanUploadStub,
                        ssoLoginMethod: ssoLoginMethodStud,
                    } as Partial<ADRActions> & ActionTree<ADRState, RootState>,
                    mutations
                },
                baseline: {
                    namespaced: true,
                    state: mockBaselineState(baselineState),
                }
            },
            getters: getters
        });
        registerTranslations(store);
        return store;
    }

    beforeEach(() => {
        vi.resetAllMocks();
    });

    it("does not render if not logged in", () => {
        const store = createStore('', null, {currentUser: 'guest'});
        const rendered = shallowMount(ADRIntegration, {global: { plugins: [store] }});
        expect(rendered.findAll("div").length).toBe(0);
    });

    it("fetches sso login method if logged in", () => {
        shallowMount(ADRIntegration, {
            global: {
                plugins: [createStore()]
            }
        });
        expect(ssoLoginMethodStud.mock.calls.length).toBe(1);
    });

    it("does not fetch sso login method if not logged in", () => {
        const store = createStore('', null, {currentUser: 'guest'});
        shallowMount(ADRIntegration, {
            global: {
                plugins: [store]
            }
        });
        expect(ssoLoginMethodStud.mock.calls.length).toBe(0);
    });

    it("does not fetch adrKey if user logs in with SSO", () => {
        const store = createStore("", null, {}, false, {}, true)
        shallowMount(ADRIntegration, {
            global: {
                plugins: [store]
            }
        });
        expect(fetchKeyStub.mock.calls.length).toBe(0);
    });

    it("fetches sso login method if logged in", () => {
        shallowMount(ADRIntegration, {
            global: {
                plugins: [createStore()]
            }
        });
        expect(ssoLoginMethodStud.mock.calls.length).toBe(1);
    });

    it("does not fetch sso login method if not logged in", () => {
        const store = createStore('', null, {currentUser: 'guest'});
        shallowMount(ADRIntegration, {
            global: {
                plugins: [store]
            }
        });
        expect(ssoLoginMethodStud.mock.calls.length).toBe(0);
    });

    it("does not fetch adrKey if user logs in with SSO", () => {
        const store = createStore("", null, {}, false, {}, true)
        shallowMount(ADRIntegration, {
            global: {
                plugins: [store]
            }
        });
        expect(fetchKeyStub.mock.calls.length).toBe(0);
    });

    it("fetches ADR key if logged in", () => {
        shallowMount(ADRIntegration, {global: {plugins: [createStore()]}});
        expect(fetchKeyStub.mock.calls.length).toBe(1);
    });

    it("does not fetch ADR key if not logged in", () => {
        const store = createStore('', null, {currentUser: 'guest'})
        shallowMount(ADRIntegration, {global: { plugins: [store] }});
        expect(fetchKeyStub.mock.calls.length).toBe(0);
    });

    it("renders adr-key widget", () => {
        const rendered = shallowMount(ADRIntegration, {global: {plugins: [createStore()]}});
        expect(rendered.findAllComponents(ADRKey).length).toBe(1);
    });

    it("does not render adr-key widget if logged in with SSO", () => {
        const store = createStore("", null, {}, false, {}, true)
        const rendered = shallowMount(ADRIntegration, {
            global: {
                plugins: [store]
            }
        });
        expect(rendered.findAllComponents(ADRKey).length).toBe(0);
    });

    it("does not render select dataset widget if key is not present or not ssoLogin method", () => {
        const rendered = shallowMount(ADRIntegration, {global: {plugins: [createStore()]}});
        expect(rendered.findAllComponents(SelectDataset).length).toBe(0);
    });

    it("renders select dataset widget if ssoLogin is present", () => {
        const store = createStore("", null, {}, false, {}, true)
        const rendered = shallowMount(ADRIntegration, {
            global: {
                plugins: [store]
            }
        });
        expect(rendered.findAllComponents(SelectDataset).length).toBe(1);
    });

    it("renders select dataset widget if ssoLogin is present", () => {
        const store = createStore("", null, {}, false, {}, true)
        const rendered = shallowMount(ADRIntegration, {
            global: {
                plugins: [store]
            }
        });
        expect(rendered.findAllComponents(SelectDataset).length).toBe(1);
    });

    it("renders select dataset widget if key is present", () => {
        const rendered = shallowMount(ADRIntegration, {global: {plugins: [createStore("123")]}});
        expect(rendered.findAllComponents(SelectDataset).length).toBe(1);
    });

    it("fetches datasets when key changes", async () => {
        const store = createStore();
        shallowMount(ADRIntegration, {global: {plugins: [store]}});
        store.commit(prefixNamespace("adr", ADRMutation.UpdateKey),"123");
        await nextTick();
        expect(getDataStub.mock.calls.length).toBe(1);
    });

    it("renders adr-access text for writers as expected", () => {
        const mockTooltip = vi.fn()
        const store = createStore("123", null, {}, true, {selectedDataset: fakeDataset});
        const renders = shallowMountWithTranslate(ADRIntegration, store,
            {
                global: {
                    plugins: [store],
                    directives: {"tooltip": mockTooltip}
                }
            });
        expect(renders.findAllComponents(ADRKey).length).toBe(1);
        const spans = renders.find("#adr-capacity").findAll("span")

        expectTranslated(spans[0], "ADR access level:", "Niveau d'accès ADR:", "Nível de acesso ADR:", store)
        expectTranslated(spans[1], "Read & Write", "Lecture et écriture", "Leitura e Escrita", store)
        expect(mockTooltip.mock.calls[0][1].value).toBe("You have read and write permissions for this dataset and may push output files to ADR");
    });

    it("renders adr-access text for readers as expected", () => {
        const mockTooltip = vi.fn();
        const store = createStore("123", null, {}, false, {selectedDataset: fakeDataset});
        const renders = shallowMountWithTranslate(ADRIntegration, store,
            {
                global: {
                    plugins: [store],
                    directives: {"tooltip": mockTooltip}
                }
            });
        expect(renders.findAllComponents(ADRKey).length).toBe(1);
        const spans = (renders.find("#adr-capacity").findAll("span"))

        expectTranslated(spans[0], "ADR access level:", "Niveau d'accès ADR:","Nível de acesso ADR:", store)
        expectTranslated(spans[1], "Read only", "Lecture seule", "Apenas leitura", store)
        expect(mockTooltip.mock.calls[0][1].value).toBe("You do not currently have write permissions for this dataset and will be unable to upload files to ADR");
    });

    it("renders Tooltip text for writers as expected in French", () => {
        const store = createStore("123", null, {}, true, {selectedDataset: fakeDataset})
        store.state.language = Language.fr
        const mockTooltip = vi.fn()
        shallowMount(ADRIntegration,
            {
                global: {
                    plugins: [store],
                    directives: {"tooltip": mockTooltip}
                }
            })
        expect(mockTooltip.mock.calls[0][1].value).toBe("Vous bénéficiez des droits de lecture et d’écriture pour cet ensemble de données et vous pouvez envoyer les fichiers de sortie vers le ADR");
    });

    it("renders Tooltip text for readers as expected in French", () => {
        const store = createStore("123", null, {}, false, {selectedDataset: fakeDataset})
        store.state.language = Language.fr
        const mockTooltip = vi.fn()
        shallowMount(ADRIntegration,
            {
                global: {
                    plugins: [store],
                    directives: {"tooltip": mockTooltip}
                }
            })
        expect(mockTooltip.mock.calls[0][1].value).toBe("Vous ne disposez actuellement d’aucun droit d’écriture pour cet ensemble de données et vous ne pourrez pas télécharger de fichiers vers le ADR");
    });

    it("renders Tooltip text for writers as expected in Portuguese", () => {
        const store = createStore("123", null, {}, true, {selectedDataset: fakeDataset})
        store.state.language = Language.pt
        const mockTooltip = vi.fn()
        shallowMount(ADRIntegration,
            {
                global: {
                    plugins: [store],
                    directives: {"tooltip": mockTooltip}
                }
            })
        expect(mockTooltip.mock.calls[0][1].value).toBe("Tem permissões de leitura e escrita para este conjunto de dados e pode carregar ficheiros de saída para o ADR");
    });

    it("renders Tooltip text for readers as expected in Portuguese", () => {
        const store = createStore("123", null, {}, false, {selectedDataset: fakeDataset})
        store.state.language = Language.pt
        const mockTooltip = vi.fn()
        shallowMount(ADRIntegration,
            {
                global: {
                    plugins: [store],
                    directives: {"tooltip": mockTooltip}
                }
            })
        expect(mockTooltip.mock.calls[0][1].value).toBe("Atualmente não tem permissões de escrita para este conjunto de dados e não poderá carregar ficheiros para o ADR");
    });

    it("call getUserCanUpload action if dataset is selected", () => {
        const store = createStore("123", null, {})
        const rendered = shallowMount(ADRIntegration, {global: { plugins: [store] }});
        (rendered.vm as any).$options.watch.selectedDataset.call(rendered.vm)
        expect(getUserCanUploadStub.mock.calls.length).toBe(1);
    });

    it("call getUserCanUpload action if dataset is selected when page is loaded",  () => {
        const store = createStore("123",
            null, {},
            false,
            {selectedDataset: fakeDataset});

        shallowMount(ADRIntegration, {global: { plugins: [store] }});
        expect(getUserCanUploadStub.mock.calls.length).toBe(1);
    });

    it("does not call getUserCanUpload action when dataset is not selected", () => {
        const store = createStore("", null, {});
        shallowMount(ADRIntegration, {global: { plugins: [store] }});
        expect(getUserCanUploadStub.mock.calls.length).toBe(0);
    });

    it("does not render permission displayText if dataset is not selected", () => {
        const store = createStore("123", null, {})
        const renders = shallowMount(ADRIntegration, {global: { plugins: [store] }});
        expect(renders.find("#adr-capacity").exists()).toBeFalsy()
    });
});
