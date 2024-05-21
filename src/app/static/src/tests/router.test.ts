import {storeOptions} from "../app/root";
import {RouteLocationNormalized} from "vue-router";
import {mount} from '@vue/test-utils'
import Vuex from "vuex";
import {mockRootState} from "./mocks";
import {store} from "../app/main";
import Hint from "../app/components/Hint.vue";
import {Mock} from "vitest";
import {beforeEnter, router} from '../app/router';

// Mock the actions before import the router as the app will call
// these actions on import
const baselineActions = {
    getBaselineData: vi.fn()
};
const surveyAndProgramActions = {
    getSurveyAndProgramData: vi.fn()
};
const modelRunActions = {
    getResult: vi.fn()
};
const projectActions = {
    getCurrentProject: vi.fn()
};
const genericChartActions = {
    getGenericChartMetadata: vi.fn()
};
const actions = {
    getADRSchemas: vi.fn()
};

storeOptions.modules!!.baseline!!.actions = baselineActions;
storeOptions.modules!!.surveyAndProgram!!.actions = surveyAndProgramActions;
storeOptions.modules!!.modelRun!!.actions = modelRunActions;
storeOptions.modules!!.projects!!.actions = projectActions;
storeOptions.modules!!.genericChart!!.actions = genericChartActions;
storeOptions.actions = actions

console.error = vi.fn();

// Mock the components before we import the rooter as the app will call these components
// on import of the router
vi.mock("../app/components/Stepper.vue", () => ({
    default: {
        name: "Stepper",
        template: "<div id='stepper-stub'/>"
    }
}))

vi.mock("../app/components/projects/Projects.vue", () => ({
    default: {
        name: "Projects",
        template: "<div id='projects-stub'/>"
    }
}))

describe("Router", () => {

    afterAll(() => {
        (console.error as Mock).mockClear();
    });

    it("has expected properties", async () => {
        const store = new Vuex.Store({
            state: mockRootState()
        })
        const mockTranslate = vi.fn()
        const wrapper = mount(Hint, {
            global: {
                plugins: [router, store],
                stubs: ["user-header", "errors"],
                directives: {
                    translate: mockTranslate
                },
            },
        })

        await router.push("/");
        await router.isReady();

        expect(wrapper.find("#stepper-stub").exists()).toBe(true);

        await router.push("/projects");
        await router.isReady();

        expect(wrapper.find("#projects-stub").exists()).toBe(true);

        await router.push("/privacy");
        await router.isReady();

        expect(wrapper.find("#privacy-content").exists()).toBe(true);

        await router.push("/accessibility");
        await router.isReady();

        expect(wrapper.find("#accessibility-content").exists()).toBe(true);
    });

    it("doesn't redirect returning guest to login page", () => {
        const realLocation = window.location
        delete (window as any).location
        window.location = {...realLocation, assign: vi.fn()};

        store.state.currentUser = "guest";
        Storage.prototype.getItem = vi.fn((key) => key === "asGuest" ? "continueAsGuest" : null);

        beforeEnter({} as RouteLocationNormalized, {} as RouteLocationNormalized);

        expect(window.location.assign).not.toHaveBeenCalled();

        window.location = realLocation
    });

    it("redirects to login page if user is not a returning guest", () => {
        const realLocation = window.location
        delete (window as any).location
        window.location = {...realLocation, assign: vi.fn()};

        store.state.currentUser = "guest";
        Storage.prototype.getItem = vi.fn();

        beforeEnter({} as RouteLocationNormalized, {} as RouteLocationNormalized);

        expect(window.location.assign).toHaveBeenCalledTimes(1);
        expect(window.location.assign).toHaveBeenCalledWith("/login");

        window.location = realLocation
    });

    it("does not redirect to login page for authenticated user", () => {
        const realLocation = window.location
        delete (window as any).location
        window.location = {...realLocation, assign: vi.fn()};

        store.state.currentUser = "test.user@example.com";

        beforeEnter({} as RouteLocationNormalized, {} as RouteLocationNormalized);

        expect(window.location.assign).not.toHaveBeenCalled();
        window.location = realLocation
    });
});
