import Vuex from "vuex";
import {VueWrapper} from '@vue/test-utils';
import ManageFile from "../../../app/components/files/ManageFile.vue";
import ResetConfirmation from "../../../app/components/resetConfirmation/ResetConfirmation.vue";
import {mockFile, mockRootState} from "../../mocks";
import {RootState} from "../../../app/root";
import registerTranslations from "../../../app/store/translations/registerTranslations";
import {getters} from "../../../app/store/root/getters";
import {mountWithTranslate} from "../../testHelpers";

declare let currentUser: string;
currentUser = "guest";

describe("File upload component", () => {

    const mockGetters = {
        editsRequireConfirmation: () => true,
        changesToRelevantSteps: () => [{number: 4, textKey: "fitModel"}]
    };

    const createStore = (partialRootState: Partial<RootState> = {}) => {
        const store = new Vuex.Store({
            state: mockRootState(partialRootState),
            getters: getters,
            modules: {
                stepper: {
                    namespaced: true,
                    getters: mockGetters
                },
                projects: {
                    namespaced: true
                },
                errors: {
                    namespaced: true
                },
            }
        });
        registerTranslations(store);
        return store;
    };

    const createSut = (props?: any, slots?: any, partialRootState: Partial<RootState> = {}) => {
        const store = createStore(partialRootState);
        return mountWithTranslate(ManageFile, store, {
            global: {
                plugins: [store]
            },
            props: {
                error: null,
                label: "PJNZ",
                valid: true,
                upload: vi.fn(),
                deleteFile: vi.fn(),
                name: "pjnz",
                accept: "csv",
                ...props
            },
            slots: slots
        });
    };

    mockFile("TEST FILE NAME", "TEST CONTENTS");

    function deleteConfirmationModal(wrapper: VueWrapper) {
        return wrapper.findAllComponents(ResetConfirmation)[1]
    }

    it("opens confirmation modal when remove is clicked", async () => {
        const removeHandler = vi.fn();
        const wrapper = createSut({
            existingFileName: "test.pjnz",
            deleteFile: removeHandler
        });
        const removeLink = wrapper.find("a");
        expect(removeLink.text()).toBe("remove");
        await removeLink.trigger("click");
        expect(deleteConfirmationModal(wrapper).props("open")).toBe(true);
    });

    it("deletes file if user confirms edit", async () => {
        const removeHandler = vi.fn();
        const wrapper = createSut({
            existingFileName: "test.pjnz",
            deleteFile: removeHandler
        }, {
            currentUser: 'guest'
        });
        const removeLink = wrapper.find("a");
        expect(removeLink.text()).toBe("remove");
        await removeLink.trigger("click");
        await deleteConfirmationModal(wrapper).find(".btn-red").trigger("click");
        expect(removeHandler.mock.calls.length).toBe(1);
        expect(deleteConfirmationModal(wrapper).props("open")).toBe(false);
    });

    it("does not delete file if user cancels edit", async () => {
        const removeHandler = vi.fn();
        const wrapper = createSut({
            existingFileName: "test.pjnz",
            deleteFile: removeHandler
        });
        const removeLink = wrapper.find("a");
        expect(removeLink.text()).toBe("remove");
        await removeLink.trigger("click");
        await deleteConfirmationModal(wrapper).find(".btn-white").trigger("click");
        expect(removeHandler.mock.calls.length).toBe(0);
        expect(deleteConfirmationModal(wrapper).props("open")).toBe(false);
    });

});
