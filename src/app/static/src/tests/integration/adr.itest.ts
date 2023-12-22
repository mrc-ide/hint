import {actions} from "../../app/store/adr/actions";
import {login, rootState} from "./integrationTest";
import {ADRMutation} from "../../app/store/adr/mutations";
import {ADRSchemas} from "../../app/types";

describe("ADR non-dataset actions", () => {

    beforeAll(async () => {
        await login();
    });

    beforeEach(async () => {
        await actions.saveKey({commit: vi.fn(), state, rootState} as any, "123");
    });

    const state = {key: null} as any;

    it("can fetch ADR key", async () => {
        const commit = vi.fn();
        await actions.fetchKey({commit, rootState} as any);

        expect(commit.mock.calls[0][0]["type"]).toBe(ADRMutation.UpdateKey);
        expect(commit.mock.calls[0][0]["payload"]).toBe("123");
    });

    it("can sso login method", async () => {
        const commit = vi.fn();
        await actions.ssoLoginMethod({commit, rootState} as any);

        expect(commit.mock.calls[0][0]["type"]).toBe(ADRMutation.SetSSOLogin);
        expect(commit.mock.calls[0][0]["payload"]).toBe(false);
    });

    it("can save ADR key", async () => {
        const commit = vi.fn();
        await actions.saveKey({commit, state, rootState} as any, "1234");

        expect(commit.mock.calls[1][0]["type"]).toBe(ADRMutation.UpdateKey);
        expect(commit.mock.calls[1][0]["payload"]).toBe("1234");
    });

    it("can delete ADR key", async () => {
        const commit = vi.fn();
        await actions.deleteKey({commit, state, rootState} as any);

        expect(commit.mock.calls[1][0]["type"]).toBe(ADRMutation.UpdateKey);
        expect(commit.mock.calls[1][0]["payload"]).toBe(null);
    });


    it("can fetch ADR schemas", async () => {
        const commit = vi.fn();
        await actions.getSchemas({commit, state, rootState} as any);

        expect(commit.mock.calls[0][0]["type"]).toBe(ADRMutation.SetSchemas);
        const payload = commit.mock.calls[0][0]["payload"] as ADRSchemas;
        expect(payload.baseUrl).toBe("https://dev.adr.fjelltopp.org/")
    });
});
