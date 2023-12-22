import {actions} from "../../app/store/metadata/actions";
import {login, rootState} from "./integrationTest";
import {PlottingMetadataResponse} from "../../app/generated";

describe("Metadata actions", () => {

    beforeAll(async () => {
        await login();
    });

    it("can get plotting metadata", async () => {
        const commit = vi.fn();

        await actions.getPlottingMetadata({commit, rootState} as any, "MWI");
        expect(commit.mock.calls[0][0]["type"]).toBe("PlottingMetadataFetched");

        const payload = commit.mock.calls[0][0]["payload"] as PlottingMetadataResponse;
        expect(payload.anc).toBeDefined();
        expect(payload.output).toBeDefined();
        expect(payload.programme).toBeDefined();
        expect(payload.survey).toBeDefined();
    });

});
