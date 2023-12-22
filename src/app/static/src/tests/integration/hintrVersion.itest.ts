import {actions} from "../../app/store/hintrVersion/actions";
import {login, rootState} from "./integrationTest";
import {HintrVersionResponse} from "../../app/generated";

describe("HintrVersion actions", () => {

    beforeAll(async () => {
        await login();
    });

    it("can get hintr version numbers", async () => {
 
        const commit = vi.fn();

        await actions.getHintrVersion({commit, rootState} as any);
        expect(commit.mock.calls[0][0]["type"]).toBe("HintrVersionFetched");
        
        const payload = commit.mock.calls[0][0]["payload"] as HintrVersionResponse;
        expect(payload.hintr).toBeDefined();
        expect(payload.naomi).toBeDefined();
        expect(payload.rrq).toBeDefined();
        expect(payload.traduire).toBeDefined();

    });
});
