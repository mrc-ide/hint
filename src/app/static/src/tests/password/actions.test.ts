import {mockAxios, mockError, mockFailure, mockRootState, mockSuccess} from "../mocks";
import {actions} from "../../app/store/password/actions";
import {Language} from "../../app/store/translations/locales";
import {LanguageMutation} from "../../app/store/language/mutations";
import {Mock} from "vitest";

const rootState = mockRootState();
describe("Password actions", () => {

    beforeEach(() => {
        // stop apiService logging to console
        console.log = vi.fn();
        mockAxios.reset();
    });

    afterEach(() => {
        (console.log as Mock).mockClear();
    });


    it("requests reset link and commits success", async () => {

        mockAxios.onPost(`/password/request-reset-link/`)
            .reply(200, mockSuccess(true));

        const commit = vi.fn();
        await actions.requestResetLink({commit, rootState} as any, "test@email.com");

        expect(commit.mock.calls[0][0]).toStrictEqual({
            type: "ResetLinkRequested",
            payload: true
        });
    });

    it("requests reset link and commits error", async () => {

        mockAxios.onPost(`/password/request-reset-link/`)
            .reply(500, mockFailure("test error"));

        const commit = vi.fn();
        await actions.requestResetLink({commit, rootState} as any, "test@email.com");

        expect(commit.mock.calls[0][0]).toStrictEqual({
            type: "RequestResetLinkError",
            payload: mockError("test error")
        });
    });

    it("calls reset password endpoint and commits success", async () => {

        mockAxios.onPost(`/password/reset-password/`)
            .reply(200, mockSuccess(true));

        const commit = vi.fn();
        await actions.resetPassword({commit, rootState} as any, {"token": "testToken", "password": "new_password"});

        expect(commit.mock.calls[0][0]).toStrictEqual({
            type: "ResetPassword",
            payload: true
        });
    });

    it("calls reset password endpoint and commits error", async () => {

        mockAxios.onPost(`/password/reset-password/`)
            .reply(500, mockFailure("test error"));

        const commit = vi.fn();
        await actions.resetPassword({commit, rootState} as any, {"token": "testToken", "password": "new_password"});

        expect(commit.mock.calls[0][0]).toStrictEqual({
            type: "ResetPasswordError",
            payload: mockError("test error")
        });
    });

    it("changes language", async () => {
        const commit = vi.fn();
        await actions.changeLanguage({commit} as any, Language.fr);
        expect(commit.mock.calls[0][0]).toStrictEqual({
            type: LanguageMutation.ChangeLanguage,
            payload: "fr"
        })
    });

});
