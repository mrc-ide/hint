import {
    mockAncResponse,
    mockAxios,
    mockBaselineState,
    mockError,
    mockFailure,
    mockProgramResponse,
    mockReviewInputMetadata,
    mockRootState,
    mockSuccess,
    mockSurveyAndProgramState,
    mockSurveyResponse
} from "../mocks";
import {actions} from "../../app/store/metadata/actions";
import {Mock} from "vitest";
import * as utils from "../../app/store/plotSelections/utils";
import {FileType} from "../../app/store/surveyAndProgram/surveyAndProgram";
import {MetadataMutations} from "../../app/store/metadata/mutations";
import {PlotStateMutations} from "../../app/store/plotState/mutations";
import {Scale} from "../../app/store/plotState/plotState";

const rootState = mockRootState({baseline: mockBaselineState({iso3: "MWI"})});
describe("Metadata actions", () => {

    beforeEach(() => {
        // stop apiService logging to console
        console.log = vi.fn();
        mockAxios.reset();
    });

    afterEach(() => {
        (console.log as Mock).mockClear();
    });

    it("commits metadata after successful fetch", async () => {

        mockAxios.onGet(`/meta/plotting/Malawi`)
            .reply(200, mockSuccess("TEST DATA"));

        const commit = vi.fn();
        await actions.getPlottingMetadata({commit, rootState} as any, "Malawi");

        expect(commit.mock.calls[0][0]).toStrictEqual({type: "PlottingMetadataFetched", payload: "TEST DATA"});
    });

    it("commits error after unsuccessful (500) fetch", async () => {
        await testPlottingMetadataError(500);
    });

    it("commits error after unsuccessful (404) fetch", async () => {
        await testPlottingMetadataError(404);
    });

    it("commits ADR metadata after successful fetch", async () => {

        const adrMetadataResponse = {type: "summary", description: "summary"}

        mockAxios.onGet(`/meta/adr/1`)
            .reply(200, mockSuccess(adrMetadataResponse));

        const commit = vi.fn();
        await actions.getAdrUploadMetadata({commit, rootState} as any, "1");

        expect(commit.mock.calls[0][0]).toStrictEqual({type: "AdrUploadMetadataFetched", payload: adrMetadataResponse});
    });

    it("commits ADR metadata error after failure to fetch", async () => {
        mockAxios.onGet(`/meta/adr/1`)
            .reply(500, mockFailure("ADR Metadata Failed"));

        const commit = vi.fn();
        await actions.getAdrUploadMetadata({commit, rootState} as any, "1");

        expect(commit.mock.calls[0][0]).toStrictEqual({
            type: "AdrUploadMetadataError",
            payload: mockError("ADR Metadata Failed")
        });
    });

    it("commits review input metadata and default selections after successful fetch", async () => {
        const mockMetadata = mockReviewInputMetadata();
        mockAxios.onPost(`/meta/review-inputs/MWI`)
            .reply(200, mockSuccess(mockMetadata));

        const mockCommitPlotDefaultSelections = vi
            .spyOn(utils, "commitPlotDefaultSelections")
            .mockImplementation(async (metadata, commit, rootState) => {});
        const commit = vi.fn();
        await actions.getReviewInputMetadata({commit, rootState} as any);

        expect(JSON.parse(mockAxios.history["post"][0]["data"]))
            .toStrictEqual({"types": [FileType.Shape]});

        expect(commit.mock.calls.length).toBe(5);
        expect(commit.mock.calls[0][0]).toStrictEqual({
            type: MetadataMutations.ReviewInputsMetadataToggleComplete,
            payload: false
        });
        expect(commit.mock.calls[1][0]).toStrictEqual({
            type: MetadataMutations.ReviewInputsMetadataFetched,
            payload: mockMetadata
        });
        expect(commit.mock.calls[2][0].type).toStrictEqual(`plotState/${PlotStateMutations.setOutputScale}`);
        expect(commit.mock.calls[2][0].payload.scale).toStrictEqual(Scale.Colour)
        expect(commit.mock.calls[3][0].type).toStrictEqual(`plotState/${PlotStateMutations.setOutputScale}`);
        expect(commit.mock.calls[3][0].payload.scale).toStrictEqual(Scale.Size)
        expect(commit.mock.calls[4][0]).toStrictEqual({
            type: MetadataMutations.ReviewInputsMetadataToggleComplete,
            payload: true
        });
        expect(mockCommitPlotDefaultSelections.mock.calls.length).toBe(1);
        expect(mockCommitPlotDefaultSelections.mock.calls[0][0]).toStrictEqual(mockMetadata);
    });

    it("commits review inputs for all available survey and programme files", async () => {
        const mockMetadata = mockReviewInputMetadata();
        mockAxios.onPost(`/meta/review-inputs/MWI`)
            .reply(200, mockSuccess(mockMetadata));

        const mockCommitPlotDefaultSelections = vi
            .spyOn(utils, "commitPlotDefaultSelections")
            .mockImplementation(async (metadata, commit, rootState) => {});
        const commit = vi.fn();
        const rState = mockRootState({
            baseline: mockBaselineState({iso3: "MWI"}),
            surveyAndProgram: mockSurveyAndProgramState({
                anc: mockAncResponse(),
                survey: mockSurveyResponse(),
                program: mockProgramResponse()
            })
        });

        await actions.getReviewInputMetadata({commit, rootState: rState} as any);

        expect(JSON.parse(mockAxios.history["post"][0]["data"]))
            .toStrictEqual({"types": [FileType.Shape, FileType.ANC, FileType.Programme, FileType.Survey]});
    });

    it("commits review input metadata error after failing to fetch metadata", async () => {
        mockAxios.onPost(`/meta/review-inputs/MWI`)
            .reply(400, mockFailure("Metadata Fetch Failed"));

        const commit = vi.fn();
        await actions.getReviewInputMetadata({commit, rootState} as any);

        expect(commit.mock.calls.length).toBe(3);
        expect(commit.mock.calls[0][0]).toStrictEqual({
            type: MetadataMutations.ReviewInputsMetadataToggleComplete,
            payload: false
        });
        expect(commit.mock.calls[1][0]).toStrictEqual({
            type: MetadataMutations.ReviewInputsMetadataError,
            payload: mockError("Metadata Fetch Failed")
        });
        expect(commit.mock.calls[2][0]).toStrictEqual({
            type: MetadataMutations.ReviewInputsMetadataToggleComplete,
            payload: true
        });
    });

    async function testPlottingMetadataError(statusCode: number) {
        mockAxios.onGet(`/meta/plotting/Malawi`)
            .reply(statusCode, mockFailure("Test Error"));

        const commit = vi.fn();
        await actions.getPlottingMetadata({commit, rootState} as any, "Malawi");

        expect(commit.mock.calls[0][0]).toStrictEqual({
            type: "PlottingMetadataError",
            payload: mockError("Test Error")
        });
    }
});
