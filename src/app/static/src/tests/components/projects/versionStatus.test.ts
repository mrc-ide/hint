import Vuex from 'vuex';
import VersionStatus from "../../../app/components/projects/VersionStatus.vue";
import {ProjectsState} from "../../../app/store/projects/projects";
import {mockProjectsState} from "../../mocks";
import VueFeather from "vue-feather";
import registerTranslations from "../../../app/store/translations/registerTranslations";
import {emptyState} from "../../../app/root";
import {expectTranslated, shallowMountWithTranslate} from "../../testHelpers";

describe("Version status component", () => {
    const getWrapper = (projectsState: Partial<ProjectsState> = {}) => {
        const store = new Vuex.Store({
            state: emptyState(),
            modules: {
                projects: {
                    namespaced: true,
                    state: mockProjectsState(projectsState),
                }
            }
        });
        registerTranslations(store);
        return shallowMountWithTranslate(VersionStatus, store, {global: {plugins: [store]}});
    };
    const date = new Date(2020, 8, 1, 12, 45, 59);

    it("does not render if no current project", () => {
        const wrapper = getWrapper();
        // just empty element if v-if isn't true
        expect(wrapper.html()).toBe("<!--v-if-->");
    });

    it("renders as expected when currentProject and versionTime are set", async () => {
        const wrapper = getWrapper({
            currentProject: {name: "Test Project"} as any,
            currentVersion: {versionNumber: 2} as any,
            versionTime: date
        });
        const store = wrapper.vm.$store;

        const spans = wrapper.findAll(".float-right");
        const projectLabel = spans[0];
        await expectTranslated(projectLabel, "Project: Test Project v2", "Projet: Test Project v2",
            "Projeto: Test Project v2", store);

        const savedLabel = spans[1];
        await expectTranslated(savedLabel, "Last saved 12:45", "Dernier enregistré 12:45",
            "Último projeto guardada 12:45", store);
        const feather = savedLabel.findComponent(VueFeather)
        expect(feather.exists()).toBe(true);
        expect(feather.props("type")).toBe("check");
    });

    it("renders as expected when currentProject and no versionTime are set", async () => {
        const wrapper = getWrapper({
            currentProject: {name: "Test Project"} as any,
            currentVersion: {versionNumber: 2} as any,
            versionTime: null
        });
        const store = wrapper.vm.$store;

        const spans = wrapper.findAll(".float-right");
        expect(spans.length).toBe(1);
        const projectLabel = spans[0];
        await expectTranslated(projectLabel, "Project: Test Project v2", "Projet: Test Project v2",
            "Projeto: Test Project v2", store);
    });
});
