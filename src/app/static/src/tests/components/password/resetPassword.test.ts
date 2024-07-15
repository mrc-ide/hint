import ResetPassword from "../../../app/components/password/ResetPassword.vue";
import {PasswordState} from "../../../app/store/password/password";
import {PasswordActions} from "../../../app/store/password/actions";
import Vuex, {Store} from "vuex";
import {mockError, mockPasswordState} from "../../mocks";
import registerTranslations from "../../../app/store/translations/registerTranslations";
import LoggedOutHeader from "../../../app/components/header/LoggedOutHeader.vue";
import {expectTranslatedWithStoreType, shallowMountWithTranslate} from "../../testHelpers";
import {mutations} from "../../../app/store/language/mutations";
import {Language} from "../../../app/store/translations/locales";
import ErrorAlert from "../../../app/components/ErrorAlert.vue";
import {nextTick} from "vue";
import {Mocked} from "vitest";

describe("Reset password component", () => {

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
            mutations,
            getters: {}
        });
        registerTranslations(store);
        return store;
    };

    const createSut = (store: Store<PasswordState>) => {
        return shallowMountWithTranslate(ResetPassword, store, {
            props: {
                token: "testToken",
                title: "Naomi"
            },
            global: {
                plugins: [store]
            }
        });
    };


    it("renders form with no error", async () => {
        const store = createStore({
            passwordWasReset: false,
            resetPasswordError: null
        });

        const wrapper = createSut(store);

        await expectTranslatedWithStoreType<PasswordState>(wrapper.find("h3"), "Enter a new password",
            "Veuillez entrer un nouveau mot de passe", "Introduzir uma nova palavra-passe", store);
        expect((wrapper.find("input[type='password']").element as HTMLInputElement).value).toEqual("");
        await expectTranslatedWithStoreType<PasswordState>(wrapper.find("input[type='submit']"),
            "Update password", "Mettre à jour le mot de passe", "Atualizar palavra-passe", store, "value");
        expect(wrapper.findAll("error-alert-stub").length).toEqual(0);
        expect(wrapper.findAll("#password-was-reset").length).toEqual(0);
    });

    it("renders form with error", async () => {
        const error = mockError("test error");
        const store = createStore({
            passwordWasReset: false,
            resetPasswordError: error
        });

        const wrapper = createSut(store);

        await expectTranslatedWithStoreType<PasswordState>(wrapper.find("h3"), "Enter a new password",
            "Veuillez entrer un nouveau mot de passe", "Introduzir uma nova palavra-passe", store);
        expect((wrapper.find("input[type='password']").element as HTMLInputElement).value).toEqual("");
        await expectTranslatedWithStoreType<PasswordState>(wrapper.find("input[type='submit']"),
            "Update password", "Mettre à jour le mot de passe","Atualizar palavra-passe", store, "value");
        expect(wrapper.findAll("error-alert-stub").length).toEqual(1);
        expect(wrapper.findComponent(ErrorAlert).props().error).toStrictEqual(error);
        await expectTranslatedWithStoreType<PasswordState>(wrapper.find("#request-new-link"),
            "This password reset link is not valid. It may have expired or already been used.\n" +
            "Please request another link here.",
            "Ce lien de réinitialisation du mot de passe n'est pas valide. Il peut avoir expiré ou avoir déjà été utilisé. " +
            "Veuillez cliquer ici pour demander un autre lien.",
            "Esta ligação de reposição de palavra-passe não é válida. Pode ter expirado ou já ter sido utilizada. " +
            "Por favor, solicite outra ligação aqui.",
            store);
        expect((wrapper.find("#request-new-link a").element as HTMLLinkElement).href)
            .toEqual("http://localhost/password/forgot-password");
        expect(wrapper.findAll("#password-was-reset").length).toEqual(0);
    });

    it("renders form with password reset success message and hides form", async () => {
        const store = createStore({
            passwordWasReset: true,
            resetPasswordError: null
        });

        const wrapper = createSut(store);

        await expectTranslatedWithStoreType<PasswordState>(wrapper.find("h3"), "Enter a new password",
            "Veuillez entrer un nouveau mot de passe", "Introduzir uma nova palavra-passe", store);
        expect(wrapper.findAll("input[type='password']").length).toEqual(0);
        expect(wrapper.findAll("input[type='submit']").length).toEqual(0);
        expect(wrapper.findAll("error-alert-stub").length).toEqual(0);
        expect(wrapper.findAll("#password-was-reset").length).toEqual(1);
        await expectTranslatedWithStoreType<PasswordState>(wrapper.find("#password-was-reset"),
            "Thank you, your password has been updated. Click here to login.",
            "Merci, votre mot de passe a été mis à jour. Cliquez ici pour vous connecter.",
            "Obrigado, a sua palavra-passe foi atualizada. Clique aqui para iniciar sessão.", store);
    });

    it("invokes resetPassword action", async () => {

        const store = createStore();
        const wrapper = createSut(store);

        await wrapper.find("input[type='password']").setValue("newpassword");
        await wrapper.find("input[type='submit']").trigger("click");

        expect(actions.resetPassword.mock.calls.length).toEqual(1);
        expect(actions.resetPassword.mock.calls[0][1]).toEqual({"token": "testToken", "password": "newpassword"});
        expect(wrapper.find("form").classes()).toContain("was-validated");

    });

    it("does not invoke resetPassword action if input value is empty", async () => {

        const store = createStore();
        const wrapper = createSut(store);

        await wrapper.find("input[type='submit']").trigger("click");

        expect(actions.resetPassword.mock.calls.length).toEqual(0);
        expect(wrapper.find("form").classes()).toContain("was-validated");

    });

    it("does not invoke resetPassword action if input value is too short", async () => {

        const store = createStore();
        const wrapper = createSut(store);

        await wrapper.find("input[type='password']").setValue("12345");
        await wrapper.find("input[type='submit']").trigger("click");

        expect(actions.resetPassword.mock.calls.length).toEqual(0);
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
        (wrapper.vm as any).$options.watch.language.call(wrapper.vm, Language.pt)
        await nextTick();
        expect(document.documentElement.lang).toBe("pt");
    });
});
