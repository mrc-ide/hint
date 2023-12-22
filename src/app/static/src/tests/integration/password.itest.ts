import {actions} from "../../app/store/password/actions";
import {login, rootState} from "./integrationTest";

describe("Password actions", () => {

    it("can request password reset link", async () => {

        const commit = vi.fn();
        await actions.requestResetLink({commit, rootState} as any, "test.user@example.com");

        expect(commit.mock.calls[0][0]).toStrictEqual({
            type: "ResetLinkRequested",
            payload: true
        });
    });

    it("can reset password", async () => {

        const commit = vi.fn();
        await actions.resetPassword({commit, rootState} as any, {token: "FAKETOKEN", password: "pw"});

        expect(commit.mock.calls[0][0]).toStrictEqual({
            type: "ResetPasswordError",
            payload: {
                error: "OTHER_ERROR",
                detail: "Password must be at least 6 characters long."
            }
        });
    });

    it("can login with upper-case username", async () => {
        // this throws an exception if login fails
        await login("Test.USER@Example.com", "password");
    });

});
