import {expectHasTranslationKey} from "../../testHelpers";
import Vuex from "vuex";
import {mockFile, mockLoadState, mockProjectsState, mockRootState} from "../../mocks";
import {DOMWrapper, mount, VueWrapper} from "@vue/test-utils";
import NewProjectMenu from "../../../app/components/projects/NewProjectMenu.vue";
import UploadNewProject from "../../../app/components/load/NewProjectCreate.vue";
import {Translations} from "../../../app/store/translations/locales";

describe("New project menu component", () => {

    // @ts-ignore
    global.File = class MockFile {
        filename: string;
        constructor(_parts: (string | Blob | ArrayBuffer | ArrayBufferView)[], filename: string, _properties ? : FilePropertyBag) {
            this.filename = filename;
        }
    }

    const mockTranslate = vi.fn();
    const mockCreateProject = vi.fn();
    const mockPreparingRehydrate = vi.fn();
    const mockNewProjectName = vi.fn()
    const testProjects = [{id: 2, name: "proj1", versions: []}];
    const mockState = mockLoadState({newProjectName: "mock name"})

    beforeEach(() => {
        vi.resetAllMocks()
    })

    const createStore = () => {
        return new Vuex.Store({
            state: mockRootState(),
            modules: {
                projects: {
                    namespaced: true,
                    state: mockProjectsState({previousProjects: testProjects}),
                    actions: {
                        createProject: mockCreateProject
                    }
                },
                load: {
                    namespaced: true,
                    state: mockState,
                    actions: {
                        preparingRehydrate: mockPreparingRehydrate
                    },
                    mutations: {
                        SetNewProjectName: mockNewProjectName
                    }
                },
            }
        });
    };

    const getWrapper = () => {
        const store = createStore();
        return mount(NewProjectMenu, {
            global: {
                plugins: [store],
                directives: {
                    translate: mockTranslate
                },
            },
        })
    };

    function expectTranslated(element: DOMWrapper<any>,
                              translationKey: keyof Translations) {
        expectHasTranslationKey(element, mockTranslate, translationKey)
    }

    it("renders component", async () => {
        const wrapper = getWrapper();

        expectTranslated(wrapper.find("#new-project-dropdown span"), "newProjectDropdown");
        expectTranslated(wrapper.find("#create-project-button span"), "createProject");
        expectTranslated(wrapper.find("#load-zip-button span"), "loadZip");

        // Upload zip input hidden by default
        const upload = wrapper.find("#upload-zip")
        expect(upload.attributes()).toEqual({
            accept: ".zip",
            id: "upload-zip",
            style: "display: none;",
            type: "file",
        })

        // Set new project name components are hidden by default
        const projectNameInput = wrapper.findAllComponents(UploadNewProject)
        expect(projectNameInput.length).toBe(1)
        expect(projectNameInput[0].attributes("open")).toBeFalsy();
    })

    it("triggers createProject action selecting a new project", async () => {
        const store = createStore();
        const wrapper = mount(NewProjectMenu, {
            global: {
                plugins: [store],
                directives: {
                    translate: mockTranslate
                },
            },
        })

        // When I click new project
        const createProjectButton = wrapper.find("#create-project-button")
        await createProjectButton.trigger("click")

        // Then new project modal is opened
        const createProject = wrapper.find("#new-project-create")
        const createProjectModal = createProject.findComponent("#load") as VueWrapper
        expect((createProjectModal as any).props("open")).toBe(true);

        // When I enter a name
        await createProjectModal.find("#project-name-input").setValue("new created project")

        // then confirm load button is enabled
        const confirmLoad = createProjectModal.find("#confirm-load-project")
        expect((confirmLoad.element as HTMLButtonElement).disabled).toBe(false)

        // When I click confirm load button
        await confirmLoad.trigger("click")

        // Action is triggered and modal closed
        expect(mockNewProjectName.mock.calls.length).toBe(1);
        expect(mockNewProjectName.mock.calls[0][1]).toBe("new created project");
        expect(mockCreateProject.mock.calls.length).toBe(1);
        expect((createProjectModal as any).props("open")).toBe(false);
    })

    it("clicking cancel from create project modal closes it", async () => {
        const store = createStore();
        const wrapper = mount(NewProjectMenu, {
            global: {
                plugins: [store],
                directives: {
                    translate: mockTranslate
                },
            },
        })

        // When I click new project
        const createProjectButton = wrapper.find("#create-project-button")
        await createProjectButton.trigger("click")

        // Then new project modal is opened
        const createProject = wrapper.find("#new-project-create")
        const createProjectModal = createProject.findComponent("#load") as VueWrapper
        expect((createProjectModal as any).props("open")).toBe(true);

        // When I click cancel button
        const cancelLoad = createProjectModal.find("#cancel-load-project")
        await cancelLoad.trigger("click")

        // then modal is closed
        expect((createProjectModal as any).props("open")).toBe(false);
    })

    it("triggers preparingRehydrate action when file is uploaded", async () => {
        const store = createStore();
        const wrapper = mount(NewProjectMenu, {
            global: {
                plugins: [store],
                directives: {
                    translate: mockTranslate
                },
            },
        })

        // When I pick a zip file
        const testFile = mockFile("test.zip", "test file contents", "application/zip");
        await triggerSelectZip(wrapper, testFile, "#upload-zip");

        // Then project zip modal is opened
        const projectZip = wrapper.find("#new-project-create")
        const projectZipModal = projectZip.findComponent("#load") as VueWrapper
        expect((projectZipModal as any).props("open")).toBe(true);

        // and confirm button is disabled
        const confirmLoad = projectZipModal.find("#confirm-load-project")
        expect((confirmLoad.element as HTMLButtonElement).disabled).toBe(true)

        // When I enter a name
        await projectZipModal.find("#project-name-input").setValue("new uploaded project")

        // then confirm load button is enabled
        expect((confirmLoad.element as HTMLButtonElement).disabled).toBe(false)

        // When I click confirm load button
        await confirmLoad.trigger("click")

        // Then rehydrate action is triggered
        expect(mockNewProjectName.mock.calls.length).toBe(1);
        expect(mockNewProjectName.mock.calls[0][1]).toBe("new uploaded project");
        expect((wrapper.vm as any).fileToLoad).toStrictEqual(testFile);
        expect(mockPreparingRehydrate.mock.calls.length).toBe(1);
        expect((projectZipModal as any).props("open")).toBe(false);
    });

    it("clicking cancel from Zip project name modal hides modal", async () => {
        const store = createStore();
        const wrapper = mount(NewProjectMenu, {
            global: {
                plugins: [store],
                directives: {
                    translate: mockTranslate
                },
            },
        })

        // When I pick a zip file
        const testFile = mockFile("test.zip", "test file contents", "application/zip");
        await triggerSelectZip(wrapper, testFile, "#upload-zip");

        // Then project zip modal is opened
        const projectZip = wrapper.find("#new-project-create")
        const projectZipModal = projectZip.findComponent("#load") as VueWrapper
        expect((projectZipModal as any).props("open")).toBe(true);

        // and value set for file
        const uploadZip = wrapper.find("#upload-zip");
        expect((uploadZip.element as HTMLInputElement).files).toEqual([testFile]);


        // This is disgusting but is really difficult to test in composition API
        // as we can't spy on this function and assert it has been called.
        // It is also really difficult to test the actual file input value because
        // we can't manually set it to anything other than an empty string.
        // This will do for now I think.
        (wrapper.vm as any).$refs.loadZip.type = "text";

        // When I click cancel
        const cancelLoad = projectZipModal.find("#cancel-load-project")
        await cancelLoad.trigger("click")

        // Then dialog is closed
        expect((projectZipModal as any).props("open")).toBe(false);

        // and upload zip is cleared
        expect((wrapper.vm as any).$refs.loadZip.value).toBe("")
    });
})

const triggerSelectZip = async (wrapper: VueWrapper, testFile: File, id: string) => {
    const input = wrapper.find(id);
    vi.spyOn((wrapper.vm.$refs as any).loadZip, "files", "get").mockImplementation(() => [testFile]);
    await input.trigger("change");
};
