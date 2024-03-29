import {mutations} from "../../app/store/metadata/mutations";
import {
    mockError,
    mockMetadataState,
    mockPlottingMetadataResponse,
} from "../mocks";

describe("Metadata mutations", () => {

    it("sets metadata on PlottingMetadataFetched", () => {

        const testResponse = mockPlottingMetadataResponse();
        const testState = mockMetadataState({plottingMetadataError: mockError("previous error")});
        mutations.PlottingMetadataFetched(testState, {
            payload: testResponse
        });
        expect(testState.plottingMetadata).toStrictEqual(testResponse);
        expect(testState.plottingMetadataError).toBe(null);
    });

    it("sets error on PlottingMetadataError", () => {
        const testState = mockMetadataState();
        const error = mockError("Test Error");
        mutations.PlottingMetadataError(testState, {
            payload: error
        });
        expect(testState.plottingMetadataError).toBe(error);
    });

    it("sets error on AdrUploadMetadataError", () => {
        const testState = mockMetadataState();
        const error = mockError("Test Error");
        mutations.AdrUploadMetadataError(testState, {
            payload: error
        });
        expect(testState.adrUploadMetadataError).toBe(error);
    });

    it("sets metadata on AdrUploadMetadataFetched", () => {
        const adrMetadataResponse = {type: "summary", description: "summary"}

        const testState = mockMetadataState({
            adrUploadMetadataError: mockError("previous error"),
            adrUploadMetadata: [{type: "spectrum", description: "zip"}]
        });
        mutations.AdrUploadMetadataFetched(testState, {
            payload: adrMetadataResponse
        });

        expect(testState.adrUploadMetadata).toStrictEqual(
            [{type: "spectrum", description: "zip"},
                {type: "summary", description: "summary"}]
        );
        expect(testState.adrUploadMetadataError).toBe(null);
    });

    it("update spectrum metadata on AdrUploadMetadataFetched", () => {
        const adrMetadataResponse = {type: "spectrum", description: "new zip"}

        const testState = mockMetadataState({
            adrUploadMetadataError: mockError("previous error"),
            adrUploadMetadata: [{type: "spectrum", description: "zip"}]
        });
        mutations.AdrUploadMetadataFetched(testState, {
            payload: adrMetadataResponse
        });

        expect(testState.adrUploadMetadata).toStrictEqual(
            [{type: "spectrum", description: "new zip"}]
        );
        expect(testState.adrUploadMetadataError).toBe(null);
    });
});