import ForgotPassword from "../../../app/components/password/ForgotPassword.vue";
import {PasswordState} from "../../../app/store/password/password";
import {PasswordActions} from "../../../app/store/password/actions";
import Vuex, {Store} from "vuex";
import {mockError, mockPasswordState} from "../../mocks";
import ErrorAlert from "../../../app/components/ErrorAlert.vue";
import registerTranslations from "../../../app/store/translations/registerTranslations";
import LoggedOutHeader from "../../../app/components/header/LoggedOutHeader.vue";
import {expectTranslatedWithStoreType, shallowMountWithTranslate} from "../../testHelpers";
import {mutations} from "../../../app/store/language/mutations";
import {Language} from "../../../app/store/translations/locales";
import {nextTick} from "vue";
import {Mocked} from "vitest";

describe("Forgot password component", () => {

    let actions: Mocked<PasswordActions>;

    const createStore = (passwordState?: Partial<PasswordState>) => {
        actions = {
            requestResetLink: vi.fn(),
            resetPassword: vi.fn(),
            changeLanguage: vi.fn()
        };

        const store = new Vuex.Store({
            modules: {
                password: {
                    namespaced: true,
                    state: mockPasswordState(passwordState),
                }
            },
            actions: {...actions},
            mutations
        });

        registerTranslations(store);
        return store;
    };

    const createSut = (store: Store<PasswordState>) => {
        return shallowMountWithTranslate(ForgotPassword, store, {
            global: {
                plugins: [store]
            },
            props: {title: "Naomi"}
        });
    };

    it("renders form with no error", async () => {
        const store = createStore({
            resetLinkRequested: false,
            requestResetLinkError: null
        });

        const wrapper = createSut(store);

        await expectTranslatedWithStoreType<PasswordState>(wrapper.find("h3"), "Forgotten your password?",
            "Vous avez oublié votre mot de passe ?", "Esqueceu-se da sua palavra-passe?", store);
        expect((wrapper.find("input[type='email']").element as HTMLInputElement).value).toEqual("");
        await expectTranslatedWithStoreType<PasswordState>(wrapper.find("input[type='email']"), "Email address",
            "Adresse e-mail", "Endereço de e-mail", store, "placeholder");
        await expectTranslatedWithStoreType<PasswordState>(wrapper.find("input[type='submit']"),
            "Request password reset email", "Demande de réinitialisation du mot de passe par e-mail",
            "Solicitar e-mail de reposição de palavra-passe", store, "value");
        expect(wrapper.findAll("error-alert-stub").length).toEqual(0);
        expect(wrapper.findAll(".alert-success").length).toEqual(0);
    });

    it("renders form with error", async () => {
        const error = mockError("test error");
        const store = createStore({
            resetLinkRequested: false,
            requestResetLinkError: error
        });

        const wrapper = createSut(store);

        await expectTranslatedWithStoreType<PasswordState>(wrapper.find("h3"), "Forgotten your password?",
            "Vous avez oublié votre mot de passe ?", "Esqueceu-se da sua palavra-passe?", store);
        expect((wrapper.find("input[type='email']").element as HTMLInputElement).value).toEqual("");
        await expectTranslatedWithStoreType<PasswordState>(wrapper.find("input[type='submit']"),
            "Request password reset email", "Demande de réinitialisation du mot de passe par e-mail",
            "Solicitar e-mail de reposição de palavra-passe", store, "value");
        expect(wrapper.findAll("error-alert-stub").length).toEqual(1);
        expect(wrapper.findComponent(ErrorAlert).props().error).toStrictEqual(error);
        expect(wrapper.findAll(".alert-success").length).toEqual(0);
    });

    it("renders form with request success message", async () => {
        const store = createStore({
            resetLinkRequested: true,
            requestResetLinkError: null
        });

        const wrapper = createSut(store);

        await expectTranslatedWithStoreType<PasswordState>(wrapper.find("h3"), "Forgotten your password?",
            "Vous avez oublié votre mot de passe ?", "Esqueceu-se da sua palavra-passe?", store);
        expect((wrapper.find("input[type='email']").element as HTMLInputElement).value).toEqual("");
        await expectTranslatedWithStoreType<PasswordState>(wrapper.find("input[type='submit']"),
            "Request password reset email", "Demande de réinitialisation du mot de passe par e-mail",
            "Solicitar e-mail de reposição de palavra-passe", store, "value");
        expect(wrapper.findAll("error-alert-stub").length).toEqual(0);
        expect(wrapper.findAll(".alert-success").length).toEqual(1);
        await expectTranslatedWithStoreType<PasswordState>(wrapper.find(".alert-success"),
            "Thank you. If we have an account registered for this email address, you will receive a password reset link.",
            "Merci. Si un compte est enregistré pour cette adresse e-mail, vous recevrez un lien de réinitialisation du mot de passe.",
            "Obrigado. Se tivermos uma conta registada para este endereço de e-mail, receberá uma ligação de reposição de palavra-passe.",
            store);
    });

    it("invokes requestResetLink action", async () => {

        const store = createStore();
        const wrapper = createSut(store);

        await wrapper.find("input[type='email']").setValue("test@email.com");
        await wrapper.find("input[type='submit']").trigger("click");

        expect(actions.requestResetLink.mock.calls.length).toEqual(1);
        expect(actions.requestResetLink.mock.calls[0][1]).toEqual("test@email.com");
        expect(wrapper.find("form").classes()).toContain("was-validated");

    });

    it("does not requestLink action if input value is empty", async () => {

        const store = createStore();
        const wrapper = createSut(store);

        await wrapper.find("input[type='submit']").trigger("click");

        expect(actions.requestResetLink.mock.calls.length).toEqual(0);
        expect(wrapper.find("form").classes()).toContain("was-validated");
    });

    it("does not requestLink action if input value is not email address", async () => {

        const store = createStore();
        const wrapper = createSut(store);

        wrapper.find("input[type='email']").setValue("test");
        await wrapper.find("input[type='submit']").trigger("click");

        expect(actions.requestResetLink.mock.calls.length).toEqual(0);
        expect(wrapper.find("form").classes()).toContain("was-validated");
    });

    it("passes title to logged out header", () => {
        const store = createStore();
        const wrapper = createSut(store);
        expect(wrapper.findComponent(LoggedOutHeader).props("title")).toBe("Naomi")
    });

    it("updates html lang when language changes", async () => {
        const store = createStore();
        const wrapper = createSut(store);
        // need to call watchers manually so this emulates us changing
        // the language to Portuguese in the store
        (wrapper.vm as any).$options.watch.language.call(wrapper.vm, Language.pt)
        await nextTick();
        expect(document.documentElement.lang).toBe("pt");
    });
});
