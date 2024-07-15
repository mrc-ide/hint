import ProjectHistory from "../../../app/components/projects/ProjectHistory.vue";
import {formatDateTime} from "../../../app/utils";
import registerTranslations from "../../../app/store/translations/registerTranslations";
import Vuex from "vuex";
import {nextTick} from "vue";
import {emptyState} from "../../../app/root";
import {Project} from "../../../app/types";
import {mockProjectsState} from "../../mocks";
import {expectTranslated, mountWithTranslate} from "../../testHelpers";
import ShareProject from "../../../app/components/projects/ShareProject.vue";
import {Language} from "../../../app/store/translations/locales";
import VueFeather from "vue-feather";
import {flushPromises} from "@vue/test-utils";

describe("Project history component", () => {

    afterEach(() => {
        vi.resetAllMocks();
    });

    const isoDates = ["2020-07-30T15:00:00.000000",
        "2020-07-31T09:00:00.000000",
        "2020-07-31T10:00:00.000000",
        "2020-08-01T11:00:00.000000"];

    const mockDeleteProject = vi.fn();
    const mockDeleteVersion = vi.fn();
    const mockLoad = vi.fn();
    const mockPromoteVersion = vi.fn();
    const mockRenameProject = vi.fn();
    const mockUpdateVersion = vi.fn();
    const mockUpdateProjectNote = vi.fn();

    function createStore(projects: Project[] = testProjects) {
        const store = new Vuex.Store({
            state: emptyState(),
            modules: {
                projects: {
                    namespaced: true,
                    state: mockProjectsState({previousProjects: projects}),
                    actions: {
                        deleteVersion: mockDeleteVersion,
                        deleteProject: mockDeleteProject,
                        loadVersion: mockLoad,
                        promoteVersion: mockPromoteVersion,
                        renameProject: mockRenameProject,
                        updateVersionNote: mockUpdateVersion,
                        updateProjectNote: mockUpdateProjectNote
                    }
                }
            }
        });

        registerTranslations(store);
        return store;
    }

    const testProjects = [
        {
            id: 1, name: "proj1", sharedBy: "shared@email.com", note: "project notes", versions: [
                {id: "s11", created: isoDates[0], updated: isoDates[1], versionNumber: 1, note: "version notes"},
                {id: "s12", created: isoDates[1], updated: isoDates[2], versionNumber: 2}]
        },
        {
            id: 2, name: "proj2", versions: [
                {id: "s21", created: isoDates[2], updated: isoDates[3], versionNumber: 1}]
        }
    ];

    const testProjectsLong = (n: number) => {
        const projects: Project[] = [];
        for (let i = 0; i < n; i++) {
            projects.push({
                id: i + 1,
                name: `proj${i}`,
                versions: [{ id: `s${i}`, created: isoDates[2], updated: isoDates[3], versionNumber: 1 }]
            })
        }
        return projects;
    };

    const getWrapper = (projects = testProjects) => {
        const store = createStore(projects)
        return mountWithTranslate(ProjectHistory, store, {
            global: {
                plugins: [store],
                stubs: ["share-project"]
            }
        })
    };

    it("renders icons without an error", async () => {
        const wrapper = getWrapper(testProjects);
        expect(wrapper.find("copy-icon").exists).toBeTruthy();
        expect(wrapper.find("trash-2-icon").exists).toBeTruthy();
        expect(wrapper.find("refresh-cw-icon").exists).toBeTruthy();
        expect(wrapper.find("edit-icon").exists).toBeTruthy();
    });

    it("icon buttons have aria-labels", async () => {
        const store = createStore(testProjects)
        const wrapper = mountWithTranslate(ProjectHistory, store, {
            global: {
                plugins: [store],
                stubs: ["share-project"]
            },
        });
        const buttons = wrapper.findAll("button");

        const expectTranslatedLabel = async function (index: number, en: string, fr: string, pt: string) {
            await expectTranslated(buttons[index], en, fr, pt, store, "aria-label");
        }

        await expectTranslatedLabel(0, "toggle version 1",
            "toggle version 1",
            "toggle versão 1");

        await expectTranslatedLabel(1, "Add or edit project notes",
            "Ajouter ou modifier des notes de projet",
            "Adicionar ou editar notas do projeto");

        await expectTranslatedLabel(2, "Load", "Charger", "Carregar");

        await expectTranslatedLabel(3, "Rename project", "Renommer le projet", "Mudar o nome do projeto");

        await expectTranslatedLabel(4, "Delete", "Supprimer", "Eliminar");

        await expectTranslatedLabel(5, "Copy last updated to a new project",
            "Copier la dernière mise à jour dans un nouveau projet",
            "Copiar última atualização para um novo projeto");

        await expectTranslatedLabel(6, "Add or edit version notes",
            "Ajouter ou modifier des notes de version",
            "Adicionar ou editar notas de versão");

        await expectTranslatedLabel(7, "Load", "Charger", "Carregar");

        await expectTranslatedLabel(8, "Delete", "Supprimer", "Eliminar");

        await expectTranslatedLabel(9, "Copy to a new project",
            "Copier dans un nouveau projet",
            "Copiar para um novo projeto");
    });

    it("can render tooltips without an error", () => {
        const mockTooltip = vi.fn();
        const store = createStore(testProjects)
        mountWithTranslate(ProjectHistory, store, {
            global: {
                directives: {"tooltip": mockTooltip},
                plugins: [store],
                stubs: ["share-project"]
            }
        });

        expect(mockTooltip.mock.calls[0][1].value).toBe("Add or edit project notes");
        expect(mockTooltip.mock.calls[1][1].value).toBe("Load");
        expect(mockTooltip.mock.calls[2][1].value).toBe("Rename project");
        expect(mockTooltip.mock.calls[3][1].value).toBe("Delete");
        expect(mockTooltip.mock.calls[4][1].value).toBe("Copy last updated to a new project");
        expect(mockTooltip.mock.calls[5][1].value).toBe("Add or edit version notes");
        expect(mockTooltip.mock.calls[8][1].value).toBe("Copy to a new project");
    });

    it("does not render tooltips if project length > 25", () => {
        const mockTooltip = vi.fn();
        const store = createStore(testProjectsLong(25))
        mountWithTranslate(ProjectHistory, store, {
            global: {
                directives: {"tooltip": mockTooltip},
                plugins: [store],
                stubs: ["share-project"]
            }
        });

        // 9 * 25, we have 9 instances of tooltips
        expect(mockTooltip).toBeCalledTimes(225);

        mockTooltip.mockReset();

        const store1 = createStore(testProjectsLong(26))
        mountWithTranslate(ProjectHistory, store1, {
            global: {
                directives: {"tooltip": mockTooltip},
                plugins: [store1],
                stubs: ["share-project"]
            }
        });

        expect(mockTooltip).toBeCalledTimes(0);
    });

    it("can render tooltips in french without an error", async () => {
        const mockTooltip = vi.fn();
        const store = createStore(testProjects)
        store.state.language = Language.fr;
        await nextTick();
        mountWithTranslate(ProjectHistory, store, {
            global: {
                directives: {"tooltip": mockTooltip},
                plugins: [store],
                stubs: ["share-project"]
            }
        });

        expect(mockTooltip.mock.calls[0][1].value).toBe("Ajouter ou modifier des notes de projet");
        expect(mockTooltip.mock.calls[1][1].value).toBe("Charger");
        expect(mockTooltip.mock.calls[2][1].value).toBe("Renommer le projet");
        expect(mockTooltip.mock.calls[3][1].value).toBe("Supprimer");
        expect(mockTooltip.mock.calls[4][1].value).toBe("Copier la dernière mise à jour dans un nouveau projet");
        expect(mockTooltip.mock.calls[5][1].value).toBe("Ajouter ou modifier des notes de version");
        expect(mockTooltip.mock.calls[8][1].value).toBe("Copier dans un nouveau projet");
    });

    it("can render tooltips in Portuguese without an error", async () => {
        const mockTooltip = vi.fn();
        const store = createStore(testProjects)
        store.state.language = Language.pt;
        await nextTick();
        mountWithTranslate(ProjectHistory, store, {
            global: {
                directives: {"tooltip": mockTooltip},
                plugins: [store],
                stubs: ["share-project"]
            }
        });

        expect(mockTooltip.mock.calls[0][1].value).toBe("Adicionar ou editar notas do projeto");
        expect(mockTooltip.mock.calls[1][1].value).toBe("Carregar");
        expect(mockTooltip.mock.calls[2][1].value).toBe("Mudar o nome do projeto");
        expect(mockTooltip.mock.calls[3][1].value).toBe("Eliminar");
        expect(mockTooltip.mock.calls[4][1].value).toBe("Copiar última atualização para um novo projeto");
        expect(mockTooltip.mock.calls[5][1].value).toBe("Adicionar ou editar notas de versão");
        expect(mockTooltip.mock.calls[8][1].value).toBe("Copiar para um novo projeto");
    });

    const testRendersProject = async (wrapper: any, id: number, name: string, updatedIsoDate: string,
                                versionsCount: number) => {
        const v = wrapper.find(`#p-${id}`).findAll(".project-cell");
        const button = v[0].find("button");
        const feather = button.findAllComponents(VueFeather);
        expect(feather[0].classes()).toContain("when-closed");
        expect(feather[0].props("type")).toBe("chevron-right");
        expect(feather[1].classes()).toContain("when-open");
        expect(feather[1].props("type")).toBe("chevron-down");
        expect(v[1].find("a").text()).toContain(name);

        const versionCountLabel = versionsCount === 1 ? "1 version" : `${versionsCount} versions`;
        const ptVersionCountLabel = versionsCount === 1 ? "1 versão" : `${versionsCount} versões`;
        await expectTranslated(v[2], versionCountLabel, versionCountLabel, ptVersionCountLabel, wrapper.vm.$store);

        expect(v[3].text()).toBe(formatDateTime(updatedIsoDate));
        expect(v[4].classes()).toContain("load-cell");
        expect(v[5].classes()).toContain("rename-cell");
        expect(v[6].classes()).toContain("delete-cell");
        expect(v[7].classes()).toContain("copy-cell");
        expect(v[8].classes()).toContain("share-cell");

        expect(wrapper.findAllComponents(ShareProject).length).toBeGreaterThan(0);

        const versionMenu = wrapper.find(`#versions-${id}`)
        expect(versionMenu.classes()).toStrictEqual(["collapse"]);
    };

    const testRendersVersion = (row: any, id: string, updatedIsoDate: string, versionNumber: number) => {
        expect(row.attributes("id")).toBe(`v-${id}`);
        let cells = row.findAll(".version-cell");
        expect(cells[0].text()).toBe("");
        expect(cells[1].find("button").exists()).toBe(true);
        expect(cells[2].text()).toBe(`v${versionNumber}`);
        expect(cells[3].text()).toBe(formatDateTime(updatedIsoDate));
        expect(cells[4].classes()).toContain("load-cell");
        expect(cells[5].text()).toBe("");
        expect(cells[5].classes()).toStrictEqual(["col-md-1", "version-cell"]);
        expect(cells[6].classes()).toContain("delete-cell");
        expect(cells[7].classes()).toContain("copy-cell");
    };

    it("renders as expected", async () => {
        const wrapper = getWrapper();
        const store = wrapper.vm.$store;

        const headers = wrapper.find("#headers").findAll(".header-cell");
        expect(headers.length).toBe(9);
        expect(headers[0].text()).toBe("");
        await expectTranslated(headers[1], "Project name", "Nom du projet", "Nome do projeto", store);
        await expectTranslated(headers[2], "Versions", "Versions", "Versões", store);
        await expectTranslated(headers[3], "Last updated", "Dernière mise à jour", "Última atualização", store);
        await expectTranslated(headers[4], "Load", "Charger", "Carregar", store);
        await expectTranslated(headers[5], "Rename", "Renommer le projet", "Mudar o nome", store);
        await expectTranslated(headers[6], "Delete", "Supprimer", "Eliminar", store);
        await expectTranslated(headers[7], "Copy to", "Copier", "Copiar para", store);
        await expectTranslated(headers[8], "Share", "Partager", "Partilhar", store);

        testRendersProject(wrapper, 1, "proj1", isoDates[1], 2);
        const proj1Versions = wrapper.find("#versions-1");
        const proj1VersionRows = proj1Versions.findAll(".row");
        expect(proj1VersionRows.length).toBe(2);
        testRendersVersion(proj1VersionRows[0], "s11", isoDates[1], 1);
        testRendersVersion(proj1VersionRows[1], "s12", isoDates[2], 2);

        testRendersProject(wrapper, 2, "proj2", isoDates[3], 1);
        const proj2Versions = wrapper.find("#versions-2");
        const proj2VersionRows = proj2Versions.findAll(".row");
        expect(proj2VersionRows.length).toBe(1);
        testRendersVersion(proj2VersionRows[0], "s21", isoDates[3], 1);

        const modal = wrapper.find(".modal");
        expect(modal.classes).not.toContain("show");
    });

    it("can expand project row",  async () => {
        const wrapper = getWrapper();
        const button = wrapper.find("#p-1 button");
        const vueFeather = button.findAllComponents(VueFeather);
        const chevRight = vueFeather[0];
        expect(chevRight.props("type")).toBe("chevron-right");
        const chevDown = vueFeather[1];
        expect(chevDown.props("type")).toBe("chevron-down");
        const versionMenu = wrapper.find("#versions-1");
        expect(versionMenu.classes()).toStrictEqual(["collapse"])
        expect(chevRight.isVisible()).toBe(true);
        expect(chevDown.isVisible()).toBe(false);
        await button.trigger("click");
        expect(versionMenu.classes()).toStrictEqual(["collapse", "show", "collapsing"])
        expect(chevRight.isVisible()).toBe(false);
        expect(chevDown.isVisible()).toBe(true);
    });

    it("can collapse project row",  async () => {
        const wrapper = getWrapper();
        const button = wrapper.find("#p-1 button");
        const vueFeather = button.findAllComponents(VueFeather);
        const chevRight = vueFeather[0];
        expect(chevRight.props("type")).toBe("chevron-right");
        const chevDown = vueFeather[1];
        expect(chevDown.props("type")).toBe("chevron-down");
        const versionMenu = wrapper.find("#versions-1");
        await button.trigger("click");
        await flushPromises();
        expect(chevRight.isVisible()).toBe(false);
        expect(chevDown.isVisible()).toBe(true);
        expect(versionMenu.classes()).toStrictEqual(["collapse", "show", "collapsing"])
        await button.trigger("click");
        await new Promise((r) => setTimeout(r, 200))
        expect(chevRight.isVisible()).toBe(true);
        expect(chevDown.isVisible()).toBe(false);
        expect(versionMenu.classes()).toStrictEqual(["collapse"])
    });

    it("renders placeholder text if no previous projects", () => {
        const wrapper = getWrapper([]);
        const placeholderText = wrapper.find("div h5");
        const store = wrapper.vm.$store;
        expectTranslated(placeholderText,
            'Projects will appear here.Use the "New" button to create a new project.',
            'Les projets apparaissent ici.Utilisez le le bouton "Nouveau" pour créer un nouveau projet.',
            'Os projectos aparecem aqui.Utilize o botão "Novo" para criar um novo projeto.',
            store);
    });

    it("clicking version load link invokes loadVersion action", async () => {
        await testLoadVersionLink("#versions-1", 1, "s11");
    });

    it("clicking project load latest link invokes loadVersion action", async () => {
        await testLoadVersionLink("#p-1", 1, "s11");
    });

    it("shows modal when click delete project link", async () => {
        const wrapper = getWrapper();
        const store = wrapper.vm.$store;
        const deleteLink = wrapper.find("#p-1").find(".project-cell.delete-cell").find("button");
        await deleteLink.trigger("click");
        await nextTick();

        const modal = wrapper.find(".modal");
        expect(modal.classes()).toContain("show");
        await expectTranslated(modal.find(".modal-body"), "Delete project?", "Supprimer ce projet?", "Eliminar projeto?", store);
        const buttons = modal.find(".modal-footer").findAll("button");
        await expectTranslated(buttons[0], "OK", "OK", "OK", store);
        await expectTranslated(buttons[1], "Cancel", "Annuler", "Cancelar", store);
    });

    it("shows modal when click delete version link", async () => {
        const wrapper = getWrapper();
        const store = wrapper.vm.$store;
        const deleteLink = wrapper.find("#v-s11").find(".version-cell.delete-cell").find("button");
        await deleteLink.trigger("click");
        await nextTick();

        const modal = wrapper.find(".modal");
        expect(modal.classes()).toContain("show");
        await expectTranslated(modal.find(".modal-body"), "Delete version?",
            "Supprimer cette version?", "Eliminar versão?", store);
        const buttons = modal.find(".modal-footer").findAll("button");
        await expectTranslated(buttons[0], "OK", "OK", "OK", store);
        await expectTranslated(buttons[1], "Cancel", "Annuler", "Cancelar", store);
    });

    it("invokes deleteProject action when confirm delete", async () => {
        const wrapper = getWrapper(testProjects);
        const deleteLink = wrapper.find("#p-1").find(".project-cell.delete-cell").find("button");
        await deleteLink.trigger("click");

        const okButton = wrapper.find(".modal").findAll("button")[0];
        await okButton.trigger("click");

        expect(mockDeleteProject.mock.calls.length).toBe(1);
        expect(mockDeleteProject.mock.calls[0][1]).toBe(1);
    });

    it("invokes deleteVersion action when confirm delete", async () => {
        const wrapper = getWrapper(testProjects);
        const deleteLink = wrapper.find("#v-s11").find(".version-cell.delete-cell").find("button");
        await deleteLink.trigger("click");
        await nextTick();

        const okButton = wrapper.find(".modal").findAll("button")[0];
        await okButton.trigger("click");
        await nextTick();

        expect(mockDeleteVersion.mock.calls.length).toBe(1);
        expect(mockDeleteVersion.mock.calls[0][1]).toStrictEqual({projectId: 1, versionId: "s11"});
    });

    it("hides delete modal and does not invoke action when click cancel", async () => {
        const wrapper = getWrapper(testProjects);
        const deleteLink = wrapper.find("#v-s11").find(".version-cell.delete-cell").find("button");
        await deleteLink.trigger("click");
        await nextTick();

        const cancelButton = wrapper.find(".modal").findAll("button")[1];
        await cancelButton.trigger("click");
        await nextTick();

        expect(mockDeleteVersion.mock.calls.length).toBe(0);
        const modal = wrapper.find(".modal");
        expect(modal.classes).not.toContain("show");
    });

    const testLoadVersionLink = async function (elementId: string, projectId: number, versionId: string) {
        const wrapper = getWrapper(testProjects);
        const versionLink = wrapper.find(elementId).findAll("button")[1];
        await versionLink.trigger("click");
        await nextTick();
        expect(mockLoad.mock.calls.length).toBe(1);
        expect(mockLoad.mock.calls[0][1]).toStrictEqual({projectId: projectId, versionId: versionId});
    };

    it("does show project name as default value when a user clicks rename link", async () => {
        const wrapper = getWrapper(testProjects);
        const renameLink = wrapper.find("#p-1").findAll(".project-cell")[5].find("button");
        await renameLink.trigger("click");
        await nextTick();

        const modal = wrapper.findAll(".modal")[2];
        const proj1 = modal.find("input")
        const projectName1 = proj1.element as HTMLInputElement
        expect(projectName1.value).toBe("proj1")
    });

    it("does show project name as default value when a user clicks copy project", async () => {
        const wrapper = getWrapper();
        const copyLink = wrapper.find("#p-1").findAll(".project-cell");

        await copyLink[7].find("button").trigger("click")
        await nextTick();
        const modal = wrapper.findAll(".modal")[1];
        const proj1 = modal.find("input")
        const projectName1 = proj1.element as HTMLInputElement
        expect(projectName1.value).toBe("proj1")


        await copyLink[5].find("button").trigger("click")
        await nextTick();
        const modalVersion = wrapper.findAll(".modal")[1];
        const projVersion = modalVersion.find("input")
        const projectNameVersion = projVersion.element as HTMLInputElement
        expect(projectNameVersion.value).toBe("proj1")
    });

    it("shows modal when rename project link is clicked and removes it when cancel is clicked", async () => {
        const wrapper = getWrapper();
        const store = wrapper.vm.$store;
        const renameLink = wrapper.find("#p-1").find(".project-cell.rename-cell").find("button");
        await renameLink.trigger("click");
        await nextTick();

        const modal = wrapper.findAll(".modal")[2];
        expect(modal.classes()).toContain("show");
        await expectTranslated(modal.find(".modal-body label.h4"), "Please enter a new name for the project",
            "Veuillez entrer un nouveau nom pour le projet",
            "Por favor, introduza um novo nome para o projeto", store);

        await expectTranslated(modal.find(".modal-body label.h5"), "Notes: (your reason for renaming the project)",
            "Remarques : (la raison pour laquelle vous avez renommé le projet)",
            "Notas: (seu motivo para renomear o projeto)", store);

        const input = modal.find("input")
        await expectTranslated(input, "Project name", "Nom du projet", "Nome do projeto",
            store, "placeholder");
        const buttons = modal.find(".modal-footer").findAll("button");
        await expectTranslated(buttons[0], "Rename project", "Renommer le projet",
            "Mudar o nome do projeto", store);
        await expectTranslated(buttons[1], "Cancel", "Annuler", "Cancelar", store);

        const cancelButton = buttons[1];
        await cancelButton.trigger("click");
        await nextTick();
        expect(modal.classes()).not.toContain("show");
    });

    it("methods for rename and cancel rename work regardless of feature switch", async () => {
        const wrapper = getWrapper();
        const mockPreventDefault = vi.fn()
        const mockEvent = {preventDefault: mockPreventDefault}
        await wrapper.setData({projectToRename: null})
        const vm = wrapper.vm as any

        vm.renameProject(mockEvent, 123);
        expect(vm.projectToRename).toBe(123);
        expect(mockPreventDefault.mock.calls.length).toStrictEqual(1);

        vm.cancelRename();
        expect(vm.projectToRename).toBe(null);
    });

    it("shows modal when copy project link is clicked and removes it when cancel is clicked", async () => {
        const wrapper = getWrapper();
        const store = wrapper.vm.$store;
        const copyLink = wrapper.find("#p-1").find(".project-cell.copy-cell").find("button");
        await copyLink.trigger("click");
        await nextTick();

        const modal = wrapper.findAll(".modal")[1];

        expect(modal.classes()).toContain("show");

        await expectTranslated(modal.find(".modal-body h4"), "Copying version v1 to a new project",
            "Copie de la version v1 dans un nouveau projet",
            "A copiar versão v1 para um novo projeto",
            store);

        await expectTranslated(modal.find(".modal-body label.h5"),
            "Please enter a name for the new project",
            "Veuillez saisir un nom pour le nouveau projet",
            "Insira um nome para o novo projeto",
            store);

        const input = modal.find("input")
        await expectTranslated(input, "Project name", "Nom du projet", "Nome do projeto", store, "placeholder");
        const buttons = modal.find(".modal-footer").findAll("button");
        await expectTranslated(buttons[0], "Create project", "Créer un projet", "Criar projeto", store);
        await expectTranslated(buttons[1], "Cancel", "Annuler", "Cancelar", store);

        const cancelButton = buttons[1];
        await cancelButton.trigger("click");
        await nextTick();
        expect(modal.classes()).not.toContain("show");

    });

    it("shows modal when copy version link is clicked and removes it when cancel is clicked", async () => {
        const wrapper = getWrapper();
        const store = wrapper.vm.$store;
        const copyLink = wrapper.find("#v-s11").find(".version-cell.copy-cell").find("button");
        await copyLink.trigger("click");
        await nextTick();

        const modal = wrapper.findAll(".modal")[1];

        expect(modal.classes()).toContain("show");

        await expectTranslated(modal.find(".modal-body h4"), "Copying version v1 to a new project",
            "Copie de la version v1 dans un nouveau projet",
            "A copiar versão v1 para um novo projeto",
            store);

        await expectTranslated(modal.find(".modal-body label.h5"),
            "Please enter a name for the new project",
            "Veuillez saisir un nom pour le nouveau projet",
            "Insira um nome para o novo projeto",
            store);
        const input = modal.find("input");
        await expectTranslated(input, "Project name", "Nom du projet", "Nome do projeto", store, "placeholder");
        const buttons = modal.find(".modal-footer").findAll("button");
        await expectTranslated(buttons[0], "Create project", "Créer un projet", "Criar projeto", store);
        await expectTranslated(buttons[1], "Cancel", "Annuler", "Cancelar", store);

        const cancelButton = buttons[1];
        await cancelButton.trigger("click");
        await nextTick();
        expect(modal.classes()).not.toContain("show");
    });

    it("invokes promoteVersion action when confirm copy", async () => {
        const wrapper = getWrapper(testProjects);
        const copyLink = wrapper.find("#v-s11").find(".version-cell.copy-cell").find("button");
        await copyLink.trigger("click");
        await nextTick();

        const modal = wrapper.findAll(".modal")[1];
        const input = modal.find("input");
        const copyBtn = modal.find(".modal-footer").findAll("button")[0];
        input.setValue("newProject");
        expect((copyBtn.element as HTMLButtonElement).disabled).toBe(false);
        await copyBtn.trigger("click");

        await nextTick();

        expect(mockPromoteVersion.mock.calls.length).toBe(1);
        expect(mockPromoteVersion.mock.calls[0][1]).toStrictEqual(
            {
                "name": "newProject",
                "note": "version notes",
                "version": {
                    "projectId": 1,
                    "versionId": "s11",
                }
            });
    });

    it("can use carriage return to invokes promoteVersion action when confirm copy", async () => {
        const wrapper = getWrapper(testProjects);
        const copyLink = wrapper.find("#v-s11").find(".version-cell.copy-cell").find("button");
        await copyLink.trigger("click");
        await nextTick();

        const modal = wrapper.findAll(".modal")[1];
        const input = modal.find("input");
        const copyBtn = modal.find(".modal-footer").findAll("button")[0];
        input.setValue("newProject");
        expect((copyBtn.element as HTMLButtonElement).disabled).toBe(false);
        await input.trigger("keyup.enter")

        expect(mockPromoteVersion.mock.calls.length).toBe(1);
        expect(mockPromoteVersion.mock.calls[0][1]).toStrictEqual(
            {
                "name": "newProject",
                "note": "version notes",
                "version": {
                    "projectId": 1,
                    "versionId": "s11"
                }
            });
    });

    it("invokes versionNote action when ok button is triggered", async () => {
        const wrapper = getWrapper(testProjects);
        const copyLink = wrapper.find("#v-s11").find(".version-cell.edit-cell").find("button");
        await copyLink.trigger("click");
        await nextTick();

        const modal = wrapper.findAll(".modal")[3];
        expect((modal.element as HTMLElement).style.getPropertyValue("display")).toBe("block")
        const textarea = modal.find("textarea");
        textarea.setValue("new notes");

        const noteText = textarea.element as HTMLTextAreaElement
        expect(noteText.value).toBe("new notes")
        expect((wrapper.vm as any).$data.editedNote).toBe("new notes")

        const okBtn = modal.find(".modal-footer").findAll("button")[0];
        await okBtn.trigger("click");

        expect((modal.element as HTMLElement).style.getPropertyValue("display")).toBe("none")
        expect(mockUpdateProjectNote.mock.calls.length).toBe(0);
        expect(mockUpdateVersion.mock.calls.length).toBe(1);
        expect(mockUpdateVersion.mock.calls[0][1]).toStrictEqual(
            {
                "note": "new notes",
                "version": {
                    "projectId": 1,
                    "versionId": "s11"
                }
            });
    });

    it("invokes projectNote action when ok button is triggered", async () => {
        const wrapper = getWrapper(testProjects);
        const copyLink = wrapper.find("#p-1").find(".project-cell.name-cell").find("button");
        await copyLink.trigger("click");
        await nextTick();

        const modal = wrapper.findAll(".modal")[3];
        expect((modal.element as HTMLElement).style.getPropertyValue("display")).toBe("block")
        const textarea = modal.find("textarea");
        textarea.setValue("new notes");

        const noteText = textarea.element as HTMLTextAreaElement
        expect(noteText.value).toBe("new notes")
        expect((wrapper.vm as any).$data.editedNote).toBe("new notes")

        const okBtn = modal.find(".modal-footer").findAll("button")[0];
        await okBtn.trigger("click");

        expect((modal.element as HTMLElement).style.getPropertyValue("display")).toBe("none")
        expect(mockUpdateVersion.mock.calls.length).toBe(0);
        expect(mockUpdateProjectNote.mock.calls.length).toBe(1);
        expect(mockUpdateProjectNote.mock.calls[0][1]).toStrictEqual(
            {
                "note": "new notes",
                "projectId": 1
            });
    });

    it("can render pre-populate versionNote correctly when add/edit icon is triggered", async () => {
        const wrapper = getWrapper(testProjects);
        const copyLink = wrapper.find("#v-s11").find(".version-cell.edit-cell").find("button");
        await copyLink.trigger("click");
        await nextTick();

        const modal = wrapper.findAll(".modal")[3];
        const noteText = modal.find("textarea").element as HTMLTextAreaElement
        expect(noteText.value).toBe("version notes")
    });

    it("can render pre-populate projectNote correctly when add/edit icon is triggered", async () => {
        const wrapper = getWrapper(testProjects);
        const copyLink = wrapper.find("#p-1").find(".project-cell.name-cell").find("button");
        await copyLink.trigger("click");
        await nextTick();

        const modal = wrapper.findAll(".modal")[3];
        const noteText = modal.find("textarea").element as HTMLTextAreaElement
        expect(noteText.value).toBe("project notes")
    });

    it("cancels projectNote modal when cancel button is triggered", async () => {
        const wrapper = getWrapper(testProjects);
        const copyLink = wrapper.find("#p-1").find(".project-cell.name-cell").find("button");
        await copyLink.trigger("click");
        await nextTick();
        const modal = wrapper.findAll(".modal")[3];
        expect((modal.element as HTMLElement).style.getPropertyValue("display")).toBe("block")
        expect((wrapper.vm as any).$data.projectNoteToEdit).toBe(1)

        const cancelBtn = modal.find(".modal-footer").findAll("button")[1];
        await cancelBtn.trigger("click");

        expect((wrapper.vm as any).$data.projectNoteToEdit).toBe(null)
        expect((modal.element as HTMLElement).style.getPropertyValue("display")).toBe("none")
        expect(mockUpdateVersion.mock.calls.length).toBe(0);
    });

    it("cancels versionNote modal when cancel button is triggered", async () => {
        const wrapper = getWrapper(testProjects);
        const copyLink = wrapper.find("#v-s11").find(".version-cell.edit-cell").find("button");
        await copyLink.trigger("click");
        await nextTick();
        const modal = wrapper.findAll(".modal")[3];
        expect((modal.element as HTMLElement).style.getPropertyValue("display")).toBe("block")
        expect((wrapper.vm as any).$data.versionNoteToEdit).toMatchObject({"projectId": 1, "versionId": "s11"})

        const cancelBtn = modal.find(".modal-footer").findAll("button")[1];
        await cancelBtn.trigger("click");

        expect((wrapper.vm as any).$data.versionNoteToEdit).toBe(null)
        expect((modal.element as HTMLElement).style.getPropertyValue("display")).toBe("none")
        expect(mockUpdateVersion.mock.calls.length).toBe(0);
    });

    it("can render translated versionNote headers and button text", async () => {
        const wrapper = getWrapper(testProjects);
        const store = wrapper.vm.$store
        const copyLink = wrapper.find("#v-s11").find(".version-cell.edit-cell").find("button");
        await copyLink.trigger("click");
        await nextTick();

        const modal = wrapper.findAll(".modal")[3];
        const editVersionNoteHeader = modal.find("#editVersionNoteHeader")
        await expectTranslated(editVersionNoteHeader, "Project notes for version v1",
            "Notes de projet pour la version v1", "Notas do projeto para a versão v1", store)

        const editVersionNoteSubHeader = modal.find("#editVersionNoteSubHeader")
        await expectTranslated(editVersionNoteSubHeader, "Add or edit version notes for proj1",
            "Ajouter ou modifier des notes de version pour proj1",
            "Adicionar ou editar notas de versão para proj1", store)

        const buttons = modal.find(".modal-footer").findAll("button");
        await expectTranslated(buttons[0], "OK", "OK", "OK", store)
        await expectTranslated(buttons[1], "Cancel", "Annuler", "Cancelar", store)
    });

    it("can render translated projectNote headers and button text", async () => {
        const wrapper = getWrapper(testProjects);
        const store = wrapper.vm.$store
        const copyLink = wrapper.find("#p-1").find(".project-cell.name-cell").find("button");
        await copyLink.trigger("click");
        await nextTick();

        const modal = wrapper.findAll(".modal")[3];

        const editProjectNoteSubHeader = modal.find("#editProjectNoteSubHeader")
        await expectTranslated(editProjectNoteSubHeader, "Add or edit project notes for proj1",
            "Ajouter ou modifier des notes de projet pour proj1", "Adicionar ou editar notas de projeto para proj1",
            store)

        const editProjectNoteHeader = modal.find("#editProjectNoteHeader")
        await expectTranslated(editProjectNoteHeader, "Project notes",
            "Notes de projet", "Notas do projeto", store)

        const buttons = modal.find(".modal-footer").findAll("button");
        await expectTranslated(buttons[0], "OK", "OK", "OK", store)
        await expectTranslated(buttons[1], "Cancel", "Annuler", "Cancelar", store)
    });

    it("cannot invoke promoteVersion action when input value is empty", async () => {
        const wrapper = getWrapper(testProjects);
        const copyLink = wrapper.find("#v-s11").find(".version-cell.copy-cell").find("button");
        await copyLink.trigger("click");
        await nextTick();

        const modal = wrapper.findAll(".modal")[1];
        const input = modal.find("input");
        const copyBtn = modal.find(".modal-footer").findAll("button")[0];
        await input.setValue("");
        expect((copyBtn.element as HTMLButtonElement).disabled).toBe(true);
        await copyBtn.trigger("click");
        await nextTick();

        expect(mockPromoteVersion.mock.calls.length).toBe(0);
    });

    it("does not use carriage return to invoke promoteVersion action when input is empty", async () => {
        const wrapper = getWrapper(testProjects);
        const vm = wrapper.vm as any
        const copyLink = wrapper.find("#v-s11").find(".version-cell.copy-cell").find("button");
        await copyLink.trigger("click");
        await nextTick();

        const modal = wrapper.findAll(".modal")[1];
        const input = modal.find("input");
        const renameBtn = modal.find(".modal-footer").findAll("button")[0];
        await input.setValue("");

        expect((renameBtn.element as HTMLButtonElement).disabled).toBe(true);
        await input.trigger("keyup.enter")

        /**
         *  modal remains open after trigger, promoteVersionAction is not invoked and
         *  versionToPromote is not set to null
         */
        expect((modal.element as HTMLElement).style.getPropertyValue("display")).toBe("block")
        expect(mockPromoteVersion.mock.calls.length).toBe(0);
        expect(vm.versionToPromote).toEqual({"projectId": 1, "versionId": "s11"});
        expect(vm.newProjectName).toBe("");
    });

    it("invokes renameProject action when confirm rename", async () => {
        const wrapper = getWrapper(testProjects);
        const vm = wrapper.vm as any
        const renameLink = wrapper.find("#p-1").find(".project-cell.rename-cell").find("button");
        await renameLink.trigger("click");
        await nextTick();

        const modal = wrapper.findAll(".modal")[2];
        const input = modal.find("input");
        const textarea = modal.find("textarea");
        const renameBtn = modal.find(".modal-footer").findAll("button")[0];
        input.setValue("renamedProject");
        textarea.setValue("renamed for no reason")
        expect((renameBtn.element as HTMLButtonElement).disabled).toBe(false);
        expect(vm.projectToRename).toBe(1);
        expect(vm.renamedProjectName).toBe("renamedProject");
        await renameBtn.trigger("click");

        await nextTick();

        expect(mockRenameProject.mock.calls.length).toBe(1);
        expect(mockRenameProject.mock.calls[0][1]).toStrictEqual(
            {
                "name": "renamedProject",
                "note": "renamed for no reason",
                "projectId": 1
            });
        expect(vm.projectToRename).toBe(null);
        expect(vm.renamedProjectName).toBe("");
    });

    it("cannot invoke renameProject action when input value is empty", async () => {
        const wrapper = getWrapper(testProjects);
        const renameLink = wrapper.find("#p-1").find(".project-cell.rename-cell").find("button");
        await renameLink.trigger("click");
        await nextTick();

        const modal = wrapper.findAll(".modal")[2];
        const input = modal.find("input");
        const renameBtn = modal.find(".modal-footer").findAll("button")[0];
        await input.setValue("");
        expect((renameBtn.element as HTMLButtonElement).disabled).toBe(true);
        await renameBtn.trigger("click");

        await nextTick();

        expect(mockRenameProject.mock.calls.length).toBe(0);
    });

    it("can use carriage return to invoke renameProject action", async () => {
        const wrapper = getWrapper(testProjects);
        const vm = wrapper.vm as any
        const renameLink = wrapper.find("#p-1").findAll(".project-cell")[5].find("button");
        await renameLink.trigger("click");
        await nextTick();

        const modal = wrapper.findAll(".modal")[2];
        const input = modal.find("input");
        const renameBtn = modal.find(".modal-footer").findAll("button")[0];
        input.setValue("renamedProject");
        expect((renameBtn.element as HTMLButtonElement).disabled).toBe(false);
        await input.trigger("keyup.enter")

        expect(mockRenameProject.mock.calls.length).toBe(1);
        expect(mockRenameProject.mock.calls[0][1]).toStrictEqual(
            {
                "name": "renamedProject",
                "note": "project notes",
                "projectId": 1
            });
        expect(vm.projectToRename).toBe(null);
        expect(vm.renamedProjectName).toBe("");
    });

    it("cannot invoke confirmRename if no project is selected", async () => {
        const wrapper = getWrapper(testProjects);
        await wrapper.setData({projectToRename: null});
        await wrapper.setData({renamedProjectName: "renamedProject"});
        const vm = wrapper.vm as any
        vm.confirmRename("renamedProject");
        await nextTick();
        expect(mockRenameProject.mock.calls.length).toBe(0);
        expect(vm.projectToRename).toBe(null);
        expect(vm.renamedProjectName).toBe("renamedProject");
    });

    it('can render shared by email when project is shared', async () => {
        const wrapper = getWrapper();
        const v = wrapper.find(`#p-1`).findAll(".project-cell");

        expect(v[1].findAll("small").length).toBe(1)

        const sharedBy = v[1].find("small")
        expect(sharedBy.text()).toBe("Shared by: shared@email.com")

        wrapper.vm.$store.state.language = Language.fr;
        await nextTick();
        expect(sharedBy.text()).toBe("Partagé par: shared@email.com")

    });

    it('does not render shared by email when project is not shared', () => {
        const wrapper = getWrapper();
        const v = wrapper.find(`#p-2`).findAll(".project-cell");

        expect(v[1].findAll("small").length).toBe(0)
    });

    it("invokes promoteVersion action when confirm copy with note payload", async () => {
        const wrapper = getWrapper(testProjects);
        const copyLink = wrapper.find("#v-s11").find(".version-cell.copy-cell").find("button");
        await copyLink.trigger("click");
        await nextTick();

        const modal = wrapper.findAll(".modal")[1];
        const input = modal.find("input");
        const copyBtn = modal.find(".modal-footer").findAll("button")[0];
        input.setValue("newProject");
        wrapper.find("#promoteNote textarea").setValue("editable note")

        expect((copyBtn.element as HTMLButtonElement).disabled).toBe(false);
        await copyBtn.trigger("click");

        await nextTick();
        expect(mockPromoteVersion.mock.calls.length).toBe(1);
        expect(mockPromoteVersion.mock.calls[0][1]).toStrictEqual(
            {
                "name": "newProject",
                "note": "editable note",
                "version": {
                    "projectId": 1,
                    "versionId": "s11",
                }
            });
    });

    it("can render translated copy project notes", async () => {
        const wrapper = getWrapper(testProjects);
        const store = wrapper.vm.$store
        const copyLink = wrapper.find("#v-s11").find(".version-cell.copy-cell").find("button");
        await copyLink.trigger("click");
        await nextTick();

        const modal = wrapper.findAll(".modal")[1];
        const textarea = modal.find("#promoteNote label");
        await expectTranslated(textarea, "Notes: (your reason for copying project)",
            "Notes : (votre motif pour copier le projet)", "Notas: (a sua razão para copiar o projeto)", store)
    });

});
