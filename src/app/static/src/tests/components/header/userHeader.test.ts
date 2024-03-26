import Vuex, {Store} from "vuex";
import UserHeader from "../../../app/components/header/UserHeader.vue";
import LanguageMenu from "../../../app/components/header/LanguageMenu.vue";
import HintrVersionMenu from "../../../app/components/header/HintrVersionMenu.vue";
import {RootState} from "../../../app/root";
import registerTranslations from "../../../app/store/translations/registerTranslations";
import {getters} from "../../../app/store/root/getters";
import {mockRootState} from "../../mocks";
import {expectTranslated, shallowMountWithTranslate} from "../../testHelpers";
import OnlineSupportMenu from "../../../app/components/header/OnlineSupportMenu.vue";

describe("user header", () => {

    const createStore = (partialRootState: Partial<RootState> = {}) => {
        const store = new Vuex.Store({
            state: mockRootState(partialRootState),
            getters: getters,
        });
        registerTranslations(store);
        return store
    }

    const getWrapper = (user: string = "someone@email.com", storeOptions?: Store<RootState>) => {
        const store = storeOptions || createStore({currentUser: user})
        return shallowMountWithTranslate(UserHeader, store, {
            props: {user, title: "Naomi"},
            global: {
                plugins: [store],
                stubs: ["router-link"]
            }
        });
    };

    it("contains logout link if current user is not guest", () => {
        const currentUser = "someone@email.com";
        const store = createStore({currentUser});
        const wrapper = getWrapper(currentUser, store);
        const logoutLink = wrapper.find("a[href='/logout']");
        const loginLink = wrapper.findAll("a[href='/login']");
        expectTranslated(logoutLink, "Logout", "Fermer une session", "Sair", store);
        expect(loginLink.length).toBe(0);
    });

    it("contains login info if current user is not guest", () => {
        const currentUser = "someone@email.com";
        const store = createStore({currentUser});
        const wrapper = getWrapper(currentUser, store);
        const loginInfo = wrapper.find("span");
        expectTranslated(loginInfo, "Logged in as someone@email.com",
            "Connecté en tant que someone@email.com", "Sessão iniciada como someone@email.com", store);
    });

    it("contains login link if user is guest", () => {
        const currentUser = "guest";
        const store = createStore({currentUser});
        const wrapper = getWrapper(currentUser, store);
        const logoutLink = wrapper.findAll("a[href='/logout']");
        const loginLink = wrapper.find("a[href='/login']");
        expectTranslated(loginLink, "Log In", "Ouvrir une session", "Iniciar Sessão", store);
        expect(logoutLink.length).toBe(0);
    });

    it("renders language menu", () => {
        const store = createStore()
        const wrapper = shallowMountWithTranslate(UserHeader, store, {
            global: {
                plugins: [store]
            }, stubs: ["router-link"]
        });
        expect(wrapper.findAllComponents(LanguageMenu).length).toBe(1);
    });

    it("renders hintr version and online support menu", () => {
        const store = createStore()
        const wrapper = shallowMountWithTranslate(UserHeader, store, {
            global: {
                plugins: [store]
            }, stubs: ["router-link"]
        });
        expect(wrapper.findAllComponents(HintrVersionMenu).length).toBe(1);
        expect(wrapper.findAllComponents(OnlineSupportMenu).length).toBe(1);
    })


    it("renders Projects link as expected if user is not guest", () => {
        const store = createStore();
        const wrapper = getWrapper("someone@email.com", store);

        const link = wrapper.find("router-link-stub");
        expect(link.attributes("to")).toBe("/projects");
        expectTranslated(link, "Projects", "Projets", "Projetos", store);
    });

    it("does not render Projects link if current user is guest", () => {
        const wrapper = getWrapper("guest");
        expect(wrapper.find("#projects-link").exists()).toBe(false);
    });

    it('can render header title', () => {
        const wrapper = getWrapper()
        const title = wrapper.find(".navbar-header")
        expect(title.classes()).toEqual(["navbar-header"])
        expect(title.text()).toBe("Naomi")
    });

});
