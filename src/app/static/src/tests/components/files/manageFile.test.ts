import ErrorAlert from "../../../app/components/ErrorAlert.vue";
import Tick from "../../../app/components/Tick.vue";
import FileUpload from "../../../app/components/files/FileUpload.vue";
import ManageFile from "../../../app/components/files/ManageFile.vue";
import {mockError} from "../../mocks";
import LoadingSpinner from "../../../app/components/LoadingSpinner.vue";
import Vuex, {Store} from "vuex";
import registerTranslations from "../../../app/store/translations/registerTranslations";
import {expectTranslated, expectTranslatedWithStoreType, shallowMountWithTranslate} from "../../testHelpers";
import {nextTick} from 'vue';
import {emptyState, RootState,} from "../../../app/root";

describe("Manage file component", () => {

    const createStore = (customStore = emptyState(), requireConfirmation = false) => {
        const store = new Vuex.Store({
            state: customStore,
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

    const createSut = (props?: any, slots?: any, storeOptions?: Store<RootState>) => {
        const store = storeOptions || createStore();
        return shallowMountWithTranslate(ManageFile, store, {
            global: {
                plugins: [store]
            },
            props: {
                required: false,
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


    it("renders label", async () => {
        const wrapper = createSut({
            label: "Some title"
        });
        expect(wrapper.find("label").text()).toBe("Some title");
    });

    it("renders file upload", () => {
        const uploadFn = vi.fn();
        const wrapper = createSut({
            name: "test-name",
            upload: uploadFn
        });
        const input = wrapper.findComponent(FileUpload);
        expect(input.props().accept).toBe("csv");
        expect(input.props().name).toBe("test-name");
        expect(input.props().upload).toBe(uploadFn);
    });

    it("renders can display ADR tag if file upload is from ADR", () => {

        const uploadFn = vi.fn();
        const wrapper = createSut({
            name: "test-name",
            upload: uploadFn,
            fromADR: true
        });
        const spans = wrapper.find("span");
        expect(spans.text()).toBe("ADR");
    });

    it("renders existing file name if present", async () => {
        const store = createStore();
        const wrapper = createSut({
            existingFileName: "existing-name.csv"
        }, undefined, store);
        await expectTranslatedWithStoreType(wrapper.find("label.file-name strong"), "File", "Fichier", "Ficheiro", store);
        expect(wrapper.find("label.file-name").text()).toContain("existing-name.csv");
    });

    it("can translate required text", async () => {
        const wrapper = createSut({
            required: true
        });

        await expectTranslated(wrapper.find("#required"),
            "(required)",
            "(obligatoire)",
            "(necessário)",
            wrapper.vm.$store)
    });

    it("renders red text for empty field if required is true", () => {
        const wrapper = createSut({
            required: true
        });
        expect(wrapper.find("#required").exists()).toBe(true);
        expect(wrapper.find("#required").text()).toBe("(required)");
        expect(wrapper.find("#required").attributes("class")).toBe("ml-1 text-danger");
        expect(wrapper.find("#required").attributes("style")).toBe("font-size: small;");
    });

    it("renders text for filled form if required is true", () => {
        const wrapper = createSut({
            required: true,
            existingFileName: "file.csv"
        });
        expect(wrapper.find("#required").exists()).toBe(true);
        expect(wrapper.find("#required").text()).toBe("(required)");
        expect(wrapper.find("#required").attributes("class")).toBe("ml-1");
        expect(wrapper.find("#required").attributes("style")).toBe("font-size: small;");
    });

    it("does not render text if required is false", () => {
        const wrapper = createSut();
        expect(wrapper.find("#required").exists()).toBe(false);
    });

    it("does not render tick if valid is false", () => {
        const wrapper = createSut({
            valid: false
        });
        expect(wrapper.findAllComponents(Tick).length).toBe(0);
    });

    it("renders tick if valid is true", () => {
        const wrapper = createSut({
            valid: true
        });
        expect(wrapper.findAllComponents(Tick).length).toBe(1);
    });

    it("does not render remove link if filename is not present and error is not present", () => {
        const wrapper = createSut({
            existingFileName: null,
            error: null
        });
        expect(wrapper.findAll("a").length).toBe(0);
    });

    it("renders remove link if existing filename is present", async () => {
        const removeHandler = vi.fn();
        const wrapper = createSut({
            existingFileName: "File.csv",
            deleteFile: removeHandler
        });
        const removeLink = wrapper.find("a");
        expect(removeLink.text()).toBe("remove");

        await removeLink.trigger("click");

        expect(removeHandler.mock.calls.length).toBe(1);
    });

    it("renders remove link if error is present", async () => {
        const removeHandler = vi.fn();
        const wrapper = createSut({
            existingFileName: null,
            error: mockError("test error"),
            deleteFile: removeHandler
        });
        const removeLink = wrapper.find("a");
        expect(removeLink.text()).toBe("remove");

        //should not render File label if no existing filename
        await expectTranslated(wrapper.find(".file-name"), "remove", "supprimer", "remover", wrapper.vm.$store);

        await removeLink.trigger("click");

        expect(removeHandler.mock.calls.length).toBe(1);
    });

    it("renders error message if error is present", () => {
        const error = mockError("File upload went wrong");
        const wrapper = createSut({error});
        expect(wrapper.findComponent(ErrorAlert).props().error).toStrictEqual(error);
    });

    it("does not render error message if no error is present", () => {
        const wrapper = createSut();
        expect(wrapper.findAllComponents(ErrorAlert).length).toBe(0);
    });

    it("renders slot before filename", () => {

        const wrapper = createSut({
            existingFileName: "test.pjnz"
        }, {
            default: '<div class="fake-slot"></div>'
        });
        const slot = wrapper.find(".fake-slot");
        expect(slot.element!!.nextElementSibling!!.classList[0]).toBe("file-name");
    });

    it("renders loading spinner while uploading with success", async () => {
        const uploader = vi.fn();
        const wrapper = createSut({
            upload: uploader,
            valid: false
        });

        expect(wrapper.findAllComponents(LoadingSpinner).length).toBe(0);
        expect(wrapper.findAllComponents(Tick).length).toBe(0);

        wrapper.findComponent(FileUpload).vm.$emit("uploading")

        await nextTick();

        expect(wrapper.findAllComponents(LoadingSpinner).length).toBe(1);
        expect(wrapper.findAllComponents(Tick).length).toBe(0);

        await wrapper.setProps({valid: true});

        expect(wrapper.findAllComponents(LoadingSpinner).length).toBe(0);
        expect(wrapper.findAllComponents(Tick).length).toBe(1);
    });

    it("renders loading spinner while uploading with error", async () => {
        const uploader = vi.fn();
        const wrapper = createSut({
            upload: uploader,
            valid: false,
            error: null
        });

        expect(wrapper.findAllComponents(LoadingSpinner).length).toBe(0);
        expect(wrapper.findAllComponents(Tick).length).toBe(0);

        wrapper.findComponent(FileUpload).vm.$emit("uploading")

        await nextTick();

        expect(wrapper.findAllComponents(LoadingSpinner).length).toBe(1);
        expect(wrapper.findAllComponents(Tick).length).toBe(0);

        await wrapper.setProps({error: "Some error"});

        expect(wrapper.findAllComponents(LoadingSpinner).length).toBe(0);
        expect(wrapper.findAllComponents(Tick).length).toBe(0);
    });
});
