import Vue, { defineComponent, nextTick } from "vue";
import {DOMWrapper, flushPromises, shallowMount} from '@vue/test-utils';

import FileUpload from "../../../app/components/files/FileUpload.vue";
import {mockDataExplorationState, mockFile} from "../../mocks";
import Vuex, {Store} from "vuex";
import {emptyState} from "../../../app/root";
import registerTranslations from "../../../app/store/translations/registerTranslations";
import {BDropdown} from "bootstrap-vue-next";
import {expectTranslatedWithStoreType, mountWithTranslate, shallowMountWithTranslate} from "../../testHelpers";
import {DataExplorationState, initialDataExplorationState} from "../../../app/store/dataExploration/dataExploration";

describe("File upload component", () => {
    global.FormData = class MockFormData {
        files: Record<string, File>;
        constructor(key?: string, file?: File) {
          this.files = {}
        }
        append(key: string, file: File) {
            this.files[key] = file;
        }
        get(key: string) {
            return this.files[key]
        }
    } as any

    const createStore = (state = initialDataExplorationState(), requireConfirmation = false) => {
        const store = new Vuex.Store({
            state: state,
            modules: {
                stepper: {
                    namespaced: true,
                    getters: {editsRequireConfirmation: () => requireConfirmation}
                }
            }
        });
        registerTranslations(store);
        return store;
    };

    const mockHideDropDown = vi.fn();
    const dropdownWithMockedHideMethod = defineComponent({mixins: [BDropdown], methods: {hide: mockHideDropDown}});

    const createSut = (props?: any, slots?: any, storeOptions?: Store<DataExplorationState>) => {
        const store = storeOptions || createStore();
        return mountWithTranslate(FileUpload, store, {
            global: {
                plugins: [store],
                stubs: {
                    "b-dropdown": dropdownWithMockedHideMethod
                }
            },
            props: {
                uploading: false,
                upload: vi.fn(),
                name: "pjnz",
                accept: "csv",
                ...props
            },
            slots: slots,
        });
    };

    const testFile = mockFile("TEST FILE NAME", "TEST CONTENTS");

    beforeEach(() => {
        vi.resetAllMocks();
    });

    it("renders hidden input", () => {
        const wrapper = createSut({
            name: "test-name"
        });
        const input = wrapper.find("input");
        expect(input.attributes().accept).toBe("csv");
        expect(input.attributes().id).toBe("test-name");
        expect(wrapper.find({ref: "test-name"}).element).toStrictEqual(input.element);
    });

    it("renders label", async () => {
        const store = createStore();
        const wrapper = createSut({
            name: "test-name"
        }, undefined, store);
        await expectTranslatedWithStoreType(wrapper.find(".custom-file-label"), "Select new file",
            "Sélectionner un nouveau fichier", "Selecionar novo ficheiro", store);
    });

    it("calls upload when file is selected", async () => {

        const uploader = vi.fn();
        const wrapper = createSut({
            upload: uploader
        });

        vi.spyOn((wrapper.vm.$refs as any).pjnz, "files", "get").mockImplementation(() => [testFile]);
        await wrapper.find("input").trigger("change");

        await nextTick();

        const formData = uploader.mock.calls[0][0] as FormData;
        expect(formData.get('file')).toStrictEqual(testFile);
    });

    it("calls upload function with formData", async () => {
        const uploader = vi.fn();
        const wrapper = createSut({
            upload: uploader
        });

        (wrapper.vm.$refs as any).pjnz = {
            files: [testFile]
        };

        (wrapper.vm as any).handleFileSelect();

        await nextTick();

        expect(uploader.mock.calls[0][0] instanceof FormData).toBe(true);
    });

    it("emits uploading event while uploading", async () => {
        const wrapper = createSut();

        (wrapper.vm.$refs as any).pjnz = {
            files: [testFile]
        };
        (wrapper.vm as any).handleFileSelect();

        await nextTick();

        expect(wrapper.emitted().uploading.length).toBe(1);
    });

    it("does not trigger confirmation dialog when on data exploration mode", async () => {
        const store = createStore(mockDataExplorationState(), true);
        const wrapper = shallowMountWithTranslate(FileUpload, store, {
            global: {
                plugins: [store]
            },
            props: {
                uploading: false,
                upload: vi.fn(),
                name: "pjnz",
                accept: "csv"
            }
        });

        (wrapper.vm.$refs as any).pjnz = {
            files: [testFile]
        };
        (wrapper.vm as any).handleFileSelect();

        await nextTick();

        expect(wrapper.emitted().uploading.length).toBe(1);
    });

    it("can trigger confirmation dialog when not on data exploration mode", async () => {
        const store = createStore(emptyState(), true);
        const wrapper = shallowMountWithTranslate(FileUpload, store, {
            global: {
                plugins: [store]
            },
            props: {
                uploading: false,
                upload: vi.fn(),
                name: "pjnz",
                accept: "csv"
            }
        });

        (wrapper.vm.$refs as any).pjnz = {
            files: [testFile]
        };
        (wrapper.vm as any).handleFileSelect();

        await nextTick();

        expect(wrapper.emitted("uploading")!).toBeUndefined();
    });

    it("file input is disabled and label has uploading class when uploading is true", async () => {
        let wrapper = createSut();
        expect((wrapper.find("input").element as HTMLButtonElement).disabled).toBe(false);
        expect(wrapper.find(".custom-file-label").classes()).not.toContain("uploading");

        wrapper = createSut({uploading: true});
        expect((wrapper.find("input").element as HTMLButtonElement).disabled).toBe(true);
        expect(wrapper.find(".custom-file-label").classes()).toContain("uploading");
    });
});
