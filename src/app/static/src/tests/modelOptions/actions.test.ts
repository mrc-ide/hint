import {actions} from "../../app/store/modelOptions/actions";
import {ModelOptionsMutation} from "../../app/store/modelOptions/mutations";
import {mockAxios, mockError, mockFailure, mockRootState, mockSuccess} from "../mocks";
import {Mock} from "vitest";

const rootState = mockRootState();
describe("model run options actions", () => {

    beforeEach(() => {
        // stop apiService logging to console
        console.log = vi.fn();
        mockAxios.reset();
    });

    afterEach(() => {
        (console.log as Mock).mockClear();
    });

    it("fetches and commits model run options and version", async () => {
        mockAxios.onGet("/model/options/").reply(200, mockSuccess("TEST", "v1"));
        const commit = vi.fn();
        await actions.fetchModelRunOptions({commit, rootState} as any);

        expect(commit.mock.calls[0][0]).toStrictEqual("FetchingModelOptions");
        expect(commit.mock.calls[1][0]).toStrictEqual({
            type: "ModelOptionsFetched",
            payload: "TEST"
        });

        expect(commit.mock.calls[2][0]).toStrictEqual({
            type: "SetModelOptionsVersion",
            payload: "v1"
        });
    });

    it("can commits model run options when model failed", async () => {
        mockAxios.onGet("/model/options/").reply(400, mockFailure("Failure"));
        const commit = vi.fn();
        await actions.fetchModelRunOptions({commit, rootState} as any);

        expect(commit.mock.calls[1][0]).toStrictEqual({
            type: "ModelOptionsError",
            payload: mockError("Failure")
        });
    });


    it("fetches validation options", async () => {
        mockAxios.onPost("/model/validate/options/").reply(200, mockSuccess("TEST", "v1"));
        const commit = vi.fn();
        const payload = vi.fn();
        await actions.validateModelOptions({commit, rootState} as any, payload as any);

        expect(commit.mock.calls[0][0]).toStrictEqual(ModelOptionsMutation.Validating);
        expect(commit.mock.calls[1][0]).toStrictEqual(ModelOptionsMutation.LoadUpdatedOptions);

        expect(commit.mock.calls[2][0]).toStrictEqual({
            type: ModelOptionsMutation.Validate,
            payload: "TEST"
        });
        expect(commit.mock.calls[3][0]).toStrictEqual(ModelOptionsMutation.Validated);
    });
});
