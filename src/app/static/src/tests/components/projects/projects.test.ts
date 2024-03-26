import {ProjectsState} from "../../../app/store/projects/projects";
import Vuex from "vuex";
import {mockProjectsState} from "../../mocks";
import Projects from "../../../app/components/projects/Projects.vue";
import LoadingSpinner from "../../../app/components/LoadingSpinner.vue";
import ErrorAlert from "../../../app/components/ErrorAlert.vue";
import NewProject from "../../../app/components/projects/NewProjectMenu.vue";
import registerTranslations from "../../../app/store/translations/registerTranslations";
import {emptyState} from "../../../app/root";
import {expectTranslated, shallowMountWithTranslate} from "../../testHelpers";

describe("Projects component", () => {

    beforeEach(() => {
        jest.resetAllMocks()
    })

    const mockCreateProject = jest.fn()
    const mockRouterPush = jest.fn()
    const mockGetProjects = jest.fn()

    const createSut = (state: Partial<ProjectsState> = {},
                       isGuest = false) => {

        const store = new Vuex.Store({
            state: emptyState(),
            getters: {
                isGuest: () => isGuest
            },
            modules: {
                projects: {
                    namespaced: true,
                    state: mockProjectsState(state),
                    actions: {
                        createProject: mockCreateProject,
                        getProjects: mockGetProjects
                    }
                }
            }
        });
        registerTranslations(store);

        const mocks = {
            $router: {
                push: mockRouterPush
            }
        };

        return {store, mocks}
    };

    const getWrapper = (state: Partial<ProjectsState> = {}, isGuest: boolean = false) => {
        const {store, mocks} = createSut(state, isGuest)
        return shallowMountWithTranslate(Projects, store, {global: {plugins: [store], mocks}});
    }

    const currentProject = {name: "existingProject", id: 1, versions: []};
    const previousProjects = ["TEST PREVIOUS VERSION"] as any;

    it("renders as expected with no current project", async () => {
        const wrapper = getWrapper({previousProjects});
        const store = wrapper.vm.$store;
        expect(wrapper.findComponent(LoadingSpinner).exists()).toBe(false);
        expect(wrapper.find("#projects-content").exists()).toBe(true);

        await expectTranslated(wrapper.find("#projects-title h1"), "Projects",
            "Projets", "Projetos", store);

        expect(wrapper.findComponent(NewProject).exists()).toBe(true);
        expect(wrapper.findComponent(ErrorAlert).exists()).toBe(false);
    });

    it("renders as expected with current project", async () => {
        const wrapper = getWrapper({currentProject});
        const store = wrapper.vm.$store;

        await expectTranslated(wrapper.find("#projects-header span"),
            "Return to current project (existingProject)",
            "Retour au projet actuel (existingProject)",
            "Regressar ao projeto atual (existingProject)", store);
        expect(wrapper.find("#projects-header a").exists()).toBe(true);
        expect(wrapper.findComponent(NewProject).exists()).toBe(true);
    });

    it("displays error if any", () => {
        const error = {error: "error", detail: "detail"};
        const wrapper = getWrapper({error});
        expect(wrapper.findComponent(ErrorAlert).props()["error"]).toStrictEqual(error);
    });

    it("clicking back to current project link invokes router", async () => {
        const wrapper = getWrapper({currentProject});
        await wrapper.find("#projects-header a").trigger("click");
        expect(mockRouterPush.mock.calls.length).toBe(1);
        expect(mockRouterPush.mock.calls[0][0]).toStrictEqual("/");
    });

    it("displays spinner if loading", () => {
        const wrapper = getWrapper({loading: true});
        expect(wrapper.findComponent(LoadingSpinner).exists()).toBe(true);
        expect(wrapper.find("#projects-content").exists()).toBe(false);
    });

    it("gets projects when user is logged in", () => {
        const wrapper = getWrapper()

        expect(wrapper.find("#projects-content").exists()).toBe(true);
        expect(mockGetProjects).toHaveBeenCalled()
    })

    it("does not get projects when user is not logged in", () => {
        const wrapper = getWrapper({}, true)

        expect(wrapper.find("#projects-content").exists()).toBe(true);
        expect(mockGetProjects).not.toHaveBeenCalled()
    })
});
