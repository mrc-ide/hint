import {mount} from "@vue/test-utils";
import LoadErrorModal from "../../../app/components/load/LoadErrorModal.vue"
import Vuex from "vuex";
import {emptyState, RootState} from "../../../app/root";
import {LoadingState} from "../../../app/store/load/state";
import {expectHasTranslationKey, expectTranslated, mountWithTranslate} from "../../testHelpers";
import registerTranslations from "../../../app/store/translations/registerTranslations";

const mockClearLoadError = vi.fn();

const getStore = (hasError: boolean, loadError: string) => {
    return new Vuex.Store<RootState>({
        state: emptyState() as any,
        modules: {
            load: {
                namespaced: true,
                state: {
                    loadingState: hasError ? LoadingState.LoadFailed : LoadingState.NotLoading,
                    loadError: {
                        detail: loadError
                    }
                },
                actions: {
                    clearLoadState: mockClearLoadError
                }
            }
        }
    });
};

describe("loadErrorModal", () => {

    const mockTranslate = vi.fn();

    beforeEach(() => {
        vi.resetAllMocks()
    })

    const getWrapper = (hasError: boolean =  true, loadError: string = "Test Error Message") => {
        const store = getStore(hasError, loadError);
        return mount(LoadErrorModal, {
            global: {
                plugins: [store],
                directives: {
                    translate: mockTranslate
                }
            }
        })
    }

    it("can render error modal as expected when there is no load error", () => {
        const wrapper = getWrapper(false);
        const modal = wrapper.find(".modal")
        expect(modal.attributes()).toEqual({
            class: "modal",
            style: "display: none;"
        })
    });


   it("can display error text and translates elements when there is load error", () => {
        const wrapper = getWrapper()
        const modal = wrapper.find(".modal")
        expect(mockClearLoadError.mock.calls.length).toBe(0)
        expect(modal.find("p").text()).toBe("Test Error Message")

        expect(mockTranslate.mock.calls.length).toBe(3)
        expect(mockTranslate.mock.calls[0][1].value).toBe("loadError")
        expect(mockTranslate.mock.calls[1][1].value).toBe("ok")
        expect(mockTranslate.mock.calls[2][1].value).toBe("ok")
    });

    it("click OK can invoke clearLoadError modal", async () => {
        const wrapper = getWrapper()
        const okButton = wrapper.find(".modal button")
        expect(okButton.attributes()).toEqual(
            {
                "class": "btn btn-red",
                "data-dismiss": "modal",
                "id": "ok-load-error",
                "type": "button"
            })
        expectHasTranslationKey(okButton, mockTranslate, "ok", "aria-label");
        expect(mockClearLoadError.mock.calls.length).toBe(0)
        await okButton.trigger("click")
        expect(mockClearLoadError.mock.calls.length).toBe(1)
    });
});

describe("loadErrorModal translations", () => {
    const getWrapper = (hasError: boolean =  true, loadError: string = "Test Error Message")  => {
        const store = getStore(hasError, loadError);
        registerTranslations(store);
        return mountWithTranslate(LoadErrorModal, store, {
            global: {
                plugins: [store]
            }
        });
    };

    it("can display expected translations when there is load error", () => {
        const wrapper = getWrapper();
        const store = wrapper.vm.$store;
        expectTranslated(wrapper.find("h4"), "Load Error", "Erreur de chargement",
            "Erro de carregamento", store);
        const button = wrapper.find("button#ok-load-error");
        expectTranslated(button, "OK", "OK", "OK", store);
        expectTranslated(button, "OK", "OK", "OK", store, "aria-label");
    });
});
