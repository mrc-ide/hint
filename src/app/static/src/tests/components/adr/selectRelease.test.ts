import SelectRelease from "../../../app/components/adr/SelectRelease.vue";
import Vuex from "vuex";
import {ADRMutation} from "../../../app/store/adr/mutations";
import registerTranslations from "../../../app/store/translations/registerTranslations";
import {mockRootState} from "../../mocks";
import {expectTranslated, mountWithTranslate, shallowMountWithTranslate} from "../../testHelpers";
import {Language} from "../../../app/store/translations/locales";
import {Dataset} from "../../../app/types";
import VueFeather from "vue-feather";
import {nextTick} from "vue";
import HintTreeSelect from "../../../app/components/HintTreeSelect.vue";

describe("select release", () => {

    const releasesArray = [
        {
            id: "releaseId",
            name: "releaseName",
            notes: "releaseNotes"
        },
        {
            id: "releaseId2",
            name: "releaseName2",
            notes: null
        }
    ]
    const fakeDataset = {
        id: "datasetId",
        title: "Some data",
        url: "www.adr.com/naomi-data/some-data",
        organization: {id: "org-id"},
        release: "releaseId",
        resources: {
            pjnz: null,
            program: null,
            pop: null,
            survey: null,
            shape: null,
            anc: null
        }
    } as any
    const getReleasesMock = vi.fn();
    const clearReleasesMock = vi.fn();
    
    const getStore = (releases = releasesArray, selectedDataset: Dataset | null = null, getReleases = getReleasesMock) => {
        const store = new Vuex.Store({
            state: mockRootState(),
            modules: {
                adr: {
                    namespaced: true,
                    state: {
                        releases
                    },
                    actions: {
                        getDatasets: vi.fn(),
                        getReleases
                    },
                    mutations: {
                        [ADRMutation.ClearReleases]: clearReleasesMock,
                        [ADRMutation.SetReleases]: vi.fn()
                    }
                },
                baseline: {
                    namespaced: true,
                    state: {
                        selectedDataset
                    }
                }
            }
        });
        registerTranslations(store);
        return store;
    }

    afterEach(() => {
        vi.resetAllMocks();
    });

    it("renders select release", async () => {
        let store = getStore()
        const rendered = mountWithTranslate(SelectRelease, store, {
            global: {
                plugins: [store]
            }
        });
        await rendered.setProps({datasetId: "datasetId"})
        expect(getReleasesMock.mock.calls.length).toBe(1);
        expect(rendered.find("#selectRelease").exists()).toBe(true);
        expect(rendered.findAll("input").length).toBe(2);
        const labels = rendered.findAll("label")
        expect(labels.length).toBe(3);
        expectTranslated(labels[0], "Use latest data", "Utiliser les dernières données",
            "Use os dados mais recentes", store);
        expectTranslated(labels[1], "Select a release", "Sélectionnez une version",
            "Selecione um lançamento", store);
        expectTranslated(labels[2], "Releases", "Versions",
            "Lançamentos", store);
        expect(rendered.findAllComponents(VueFeather).length).toBe(2);
        const select = rendered.findComponent(HintTreeSelect);
        expect(select.props("multiple")).toBe(false);
        expect((rendered.vm.$data as any).releaseId).toBeUndefined();

        const expectedOptions = [
            {
                id: "releaseId",
                label: "releaseName",
                customLabel: `releaseName
                    <div class="text-muted small" style="margin-top:-5px; line-height: 0.8rem">
                        releaseNotes<br/>
                    </div>`
            },
            {
                id: "releaseId2",
                label: "releaseName2",
                customLabel: `releaseName2
                    <div class="text-muted small" style="margin-top:-5px; line-height: 0.8rem">
                        
                    </div>`
            }
        ]

        expect(select.props("options")).toEqual(expectedOptions);
    });

    it("does not render select release if there are no releases", async () => {
        const store = getStore([]);
        const rendered = shallowMountWithTranslate(SelectRelease, store, {
            global: {
                plugins: [store]
            }, 
        });
        await rendered.setProps({datasetId: "datasetId"})
        expect(rendered.find("#selectRelease").exists()).toBe(false);
    });

    it("does not render select release if no dataset is selected", () => {
        const store = getStore();
        const rendered = shallowMountWithTranslate(SelectRelease, store, {
            global: {
                plugins: [store]
            }, 
        });
        expect(rendered.find("#selectRelease").exists()).toBe(false);
    });

    it("does not get releases if dataset id is cleared", async () => {
        const store = getStore();
        const rendered = shallowMountWithTranslate(SelectRelease, store, {
            global: {
                plugins: [store]
            }, 
        });
        await rendered.setProps({datasetId: "datasetId"})
        expect(getReleasesMock.mock.calls.length).toBe(1);
        await rendered.setProps({datasetId: null})
        expect(getReleasesMock.mock.calls.length).toBe(1);
    });

    it("can render tooltips in English", async () => {
        const mockTooltip = vi.fn();
        const store = getStore()
        
        const rendered = shallowMountWithTranslate(SelectRelease, store,
            {
                global: {
                    plugins: [store],
                    directives: {"tooltip": mockTooltip}
                }
            });
        await rendered.setProps({datasetId: "datasetId"})

        expect(mockTooltip.mock.calls[0][1].value).toBe("Load the latest data, whether it is included in a release (a labelled version) or not");
        expect(mockTooltip.mock.calls[1][1].value).toBe("Load data from a particular labelled version, which may not be the latest data");
    });

    it("can render tooltips in French", async () => {
        const mockTooltip = vi.fn();
        const store = getStore()
        store.state.language = Language.fr;
        await nextTick();
        
        const rendered = shallowMountWithTranslate(SelectRelease, store,
            {
                global: {
                    plugins: [store],
                    directives: {"tooltip": mockTooltip}
                }
            });
        await rendered.setProps({datasetId: "datasetId"})

        expect(mockTooltip.mock.calls[0][1].value).toBe("Chargez les dernières données, qu'elles soient incluses dans une version (une version étiquetée) ou non");
        expect(mockTooltip.mock.calls[1][1].value).toBe("Charger des données à partir d'une version étiquetée particulière, qui peuvent ne pas être les dernières données");
    });

    it("can render tooltips in Portuguese", async () => {
        const mockTooltip = vi.fn();
        const store = getStore()
        store.state.language = Language.pt;
        await nextTick();

        const rendered = shallowMountWithTranslate(SelectRelease, store,
            {
                global: {
                    plugins: [store],
                    directives: {"tooltip": mockTooltip}
                }
            });
        await rendered.setProps({datasetId: "datasetId"})

        expect(mockTooltip.mock.calls[0][1].value).toBe("Carregue os dados mais recentes, estejam incluídos em uma versão (uma versão rotulada) ou não");
        expect(mockTooltip.mock.calls[1][1].value).toBe("Carregar dados de uma determinada versão rotulada, que podem não ser os dados mais recentes");
    });

    it("radial toggles whether release tree select is disabled", async () => {
        let store = getStore()
        const rendered = mountWithTranslate(SelectRelease, store, {
            global: {
                plugins: [store]
            }, 
        });
        await rendered.setProps({datasetId: "datasetId"})
        const select = rendered.findComponent(HintTreeSelect);
        expect(select.props("disabled")).toBe(true);
        const selectRelease = rendered.findAll("input")[1]
        await selectRelease.trigger("change")
        expect(select.props("disabled")).toBe(false);
    });

    it("radial toggles automatically toggles and selects release if selectedDataset has an appropriate releaseId", () => {
        let store = getStore(releasesArray, fakeDataset)
        const rendered = mountWithTranslate(SelectRelease, store, {
            global: {
                plugins: [store]
            }, props: {datasetId: "datasetId"}
        });
        const select = rendered.findComponent(HintTreeSelect);
        expect(select.props("disabled")).toBe(true);
        expect((rendered.vm.$data as any).releaseId).toBe("releaseId");
    });

    it("preselect release occurs if releases are updated", async () => {
        let store = getStore([releasesArray[1]], fakeDataset)
        const rendered = mountWithTranslate(SelectRelease, store, {
            global: {
                plugins: [store]
            }, props: {datasetId: "datasetId"}
        });
        const selectWrapper = rendered.findComponent(HintTreeSelect);
        expect(!rendered.vm.useRelease).toBe(true);
        expect((rendered.vm.$data as any).releaseId).toBeUndefined();
        store.state.adr.releases = releasesArray;
        (rendered.vm as any).$options.watch.releases.call(rendered.vm);
        await nextTick();
        // need to manually trigger watcher to cause treeselect re-render
        (selectWrapper.vm as any).$options.watch.modelValue.handler.call(selectWrapper.vm, (rendered.vm.$data as any).releaseId);
        await nextTick();
        expect(!rendered.vm.useRelease).toBe(false);
        expect((rendered.vm.$data as any).releaseId).toBe("releaseId");
    });

    it("does not automatically select release if no matching release and reverts to use latest", () => {
        let store = getStore([releasesArray[1]], fakeDataset)
        const rendered = mountWithTranslate(SelectRelease, store, {
            global: {
                plugins: [store]
            }, props: {datasetId: "datasetId", choiceADR: "useRelease"}
        });
        const select = rendered.findComponent(HintTreeSelect);
        expect(select.props("disabled")).toBe(true);
        expect((rendered.vm.$data as any).releaseId).toBeUndefined();
    });

    it("changes to datasetId and true open prop triggers getRelease method", async () => {
        const spy = vi.fn()
        let store = getStore(releasesArray, null, spy)
        const rendered = shallowMountWithTranslate(SelectRelease, store, {
            global: {
                plugins: [store]
            }, 
        });
        await rendered.setProps({datasetId: "datasetId"})
        expect(spy).toHaveBeenCalledTimes(1)
        expect(spy.mock.calls[0][spy.mock.calls[0].length - 1]).toBe("datasetId")
        await rendered.setProps({open: true})
        expect(spy).toHaveBeenCalledTimes(2)
        expect(spy.mock.calls[1][spy.mock.calls[1].length - 1]).toBe("datasetId")
    });
    

    it("selecting a release emits release id", async () => {
        let store = getStore()
        const rendered = shallowMountWithTranslate(SelectRelease, store, {
            global: {
                plugins: [store]
            }, 
        });
        await rendered.setProps({datasetId: "datasetId"})
        const selectRelease = rendered.findAll("input")[1]
        await selectRelease.trigger("click")
        await rendered.setData({releaseId: "releaseId"})
        expect(rendered.emitted("selected-dataset-release")).toStrictEqual([[undefined], [releasesArray[0]]])
    });

    it("selecting a release emits true valid", async () => {
        let store = getStore()
        const rendered = shallowMountWithTranslate(SelectRelease, store, {
            global: {
                plugins: [store]
            }, 
        });
        await rendered.setProps({datasetId: "datasetId"})
        const selectRelease = rendered.findAll("input")[1]
        await selectRelease.trigger("change")
        expect(rendered.emitted("valid")).toStrictEqual([[true], [false]])
        await rendered.setData({releaseId: "releaseId"})
        expect(rendered.emitted("valid")).toStrictEqual([[true], [false], [true]])
    });

    it("changing datasetId clears releases and resets radial and releaseId", async () => {
        let store = getStore()
        const rendered = mountWithTranslate(SelectRelease, store, {
            global: {
                plugins: [store]
            }
        });
        await rendered.setProps({datasetId: "datasetId"})
        const selectRelease = rendered.findAll("input")[1];
        await selectRelease.trigger("change")
        await rendered.setData({releaseId: "releaseId"})
        expect((rendered.vm.$data as any).releaseId).toBe("releaseId");
        expect((rendered.vm.$data as any).choiceADR).toBe("useRelease");

        await rendered.setProps({datasetId: "datasetId2"})
        expect(clearReleasesMock.mock.calls.length).toBe(2);
        const select = rendered.findComponent(HintTreeSelect);
        expect(select.props("disabled")).toBe(true);
        expect((rendered.vm.$data as any).releaseId).toBe(undefined);
        expect((rendered.vm.$data as any).choiceADR).toBe("useLatest");
    });
});
