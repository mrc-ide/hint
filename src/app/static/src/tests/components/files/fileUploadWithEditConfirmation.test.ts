import Vuex from "vuex";
import {mount, VueWrapper} from '@vue/test-utils';
import FileUpload from "../../../app/components/files/FileUpload.vue";
import ResetConfirmation from "../../../app/components/resetConfirmation/ResetConfirmation.vue";
import {mockFile, mockRootState} from "../../mocks";
import {RootState} from "../../../app/root";
import registerTranslations from "../../../app/store/translations/registerTranslations";
import {getters} from "../../../app/store/root/getters";
import {nextTick} from "vue";

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
                }
            }
        });
        registerTranslations(store);
        return store;
    };

    const createSut = (props?: any, partialRootState: Partial<RootState> = {}) => {
        const store = createStore(partialRootState);
        return mount(FileUpload, {
            global: {
                plugins: [store]
            },
            props: {
                upload: vi.fn(),
                name: "pjnz",
                accept: "csv",
                ...props
            }
        });
    };

    const testFile = mockFile("TEST FILE NAME", "TEST CONTENTS");

    function uploadConfirmationModal(wrapper: VueWrapper) {
        return wrapper.findAllComponents(ResetConfirmation)[0]
    }

    it("opens confirmation modal when new file is selected", async () => {
        const wrapper = createSut();
        (wrapper.vm.$refs as any).pjnz = {
            files: [testFile]
        };
        await (wrapper.vm as any).handleFileSelect();
        expect(uploadConfirmationModal(wrapper).props("open")).toBe(true);
    });

    it("uploads file if user confirms edit", async () => {
        const uploader = vi.fn();
        const wrapper = createSut({
            upload: uploader
        }, {
            currentUser: 'guest'
        });

        (wrapper.vm.$refs as any).pjnz = {
            files: [testFile]
        };

        (wrapper.vm as any).handleFileSelect();
        uploadConfirmationModal(wrapper).find(".btn-red").trigger("click");

        await nextTick();
        expect(uploader.mock.calls.length).toBe(1);
        expect(uploadConfirmationModal(wrapper).props("open")).toBe(false);
    });

    it("does not upload file if user cancels edit", async () => {
        const uploader = vi.fn();
        const wrapper = createSut({
            upload: uploader
        });

        (wrapper.vm.$refs as any).pjnz = {
            files: [testFile]
        };

        (wrapper.vm as any).handleFileSelect();
        uploadConfirmationModal(wrapper).find(".btn-white").trigger("click");

        await nextTick();
        expect(uploader.mock.calls.length).toBe(0);
        expect(uploadConfirmationModal(wrapper).props("open")).toBe(false);
    });

});
