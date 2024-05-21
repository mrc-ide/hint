import {mockAxios, mockFailure, mockGenericChartState, mockRootState, mockSuccess} from "../mocks";
import {actions} from "../../app/store/genericChart/actions";
import {GenericChartMutation} from "../../app/store/genericChart/mutations";
import {freezer} from "../../app/utils";
import {Mock} from "vitest";

describe("genericChart actions", () => {
    beforeEach(() => {
        // stop apiService logging to console
        console.log = vi.fn();
        mockAxios.reset();
        vi.clearAllMocks();
    });

    afterEach(() => {
        (console.log as Mock).mockClear();
    });

    const rootState = mockRootState();

    it("gets generic chart metadata", async () => {
        const mockResponse = mockSuccess("TEST METADATA");
        mockAxios.onGet("/meta/generic-chart")
            .reply(200, mockResponse);
        const commit = vi.fn();
        const deepFreeze = vi.spyOn(freezer, "deepFreeze");
        await actions.getGenericChartMetadata({commit, rootState} as any);
        expect(commit.mock.calls.length).toEqual(1);
        expect(commit.mock.calls[0][0]["type"]).toBe("GenericChartMetadataFetched");
        expect(commit.mock.calls[0][0]["payload"]).toBe("TEST METADATA");
        expect(deepFreeze).toHaveBeenCalledWith(mockResponse);
    });

    it("generic chart metadata action ignores errors",  async () => {
        mockAxios.onGet("/meta/generic-chart")
            .reply(500, mockFailure("TEST ERROR"));
        const commit = vi.fn();
        await actions.getGenericChartMetadata({commit, rootState} as any);
        expect(commit.mock.calls.length).toEqual(0);
    });

    it("gets dataset and warnings", async () => {
        const response = {data: "TEST DATASET", metadata: "TEST META", warnings: "TEST WARNINGS"}
        const mockResponse = mockSuccess(response);
        mockAxios.onGet("/dataset1")
            .reply(200, mockResponse);
        const commit = vi.fn();
        const payload = {datasetId: "dataset1", url: "/dataset1"};
        const deepFreeze = vi.spyOn(freezer, "deepFreeze");
        await actions.getDataset({commit, rootState} as any, payload);
        expect(commit.mock.calls.length).toEqual(3);
        expect(commit.mock.calls[0][0]["type"]).toBe(GenericChartMutation.SetError);
        expect(commit.mock.calls[0][0]["payload"]).toBeNull();
        expect(commit.mock.calls[1][0]["type"]).toBe(GenericChartMutation.SetDataset);
        expect(commit.mock.calls[1][0]["payload"]).toStrictEqual({dataset: response, datasetId: "dataset1"});
        expect(commit.mock.calls[2][0]["type"]).toBe(GenericChartMutation.WarningsFetched);
        expect(commit.mock.calls[2][0]["payload"]).toStrictEqual("TEST WARNINGS");
        expect(deepFreeze).toHaveBeenCalledWith(mockResponse);
    });

    it("sets error on get dataset", async () => {
        mockAxios.onGet("/dataset1")
            .reply(500, mockFailure("TEST ERROR"));
        const commit = vi.fn();
        const payload = {datasetId: "dataset1", url: "/dataset1"};
        await actions.getDataset({commit, rootState} as any, payload);
        expect(commit.mock.calls.length).toEqual(2);
        expect(commit.mock.calls[0][0]["type"]).toBe(GenericChartMutation.SetError);
        expect(commit.mock.calls[0][0]["payload"]).toBeNull();
        expect(commit.mock.calls[1][0]["type"]).toBe(GenericChartMutation.SetError);
        expect(commit.mock.calls[1][0]["payload"]).toStrictEqual({"detail": "TEST ERROR", "error": "OTHER_ERROR"})
    });

    it("refreshes datasets", async () => {
        const dispatch = vi.fn();
        const genericChartMetadata = {
            chart1: {
                datasets: [
                    {id: "dataset1", url: "/dataset1"},
                    {id: "dataset2", url: "/dataset2"}
                ]
            },
            chart2: {
                datasets: [
                    {id: "dataset3", url: "/dataset3"},
                    {id: "dataset4", url: "/dataset4"}
                ]
            }
        } as any;

        const datasets = {
            dataset1: ["TEST DATASET1"],
            dataset2: ["TEST DATASET2"],
            dataset4: ["TEST DATASET4"]
        } as any;
        const state = mockGenericChartState({genericChartMetadata, datasets});
        await actions.refreshDatasets({dispatch, state} as any);

        expect(dispatch.mock.calls.length).toBe(3);
        expect(dispatch.mock.calls[0][0]).toBe("getDataset");
        expect(dispatch.mock.calls[0][1]).toStrictEqual({datasetId: "dataset1", url: "/dataset1"});
        expect(dispatch.mock.calls[1][0]).toBe("getDataset");
        expect(dispatch.mock.calls[1][1]).toStrictEqual({datasetId: "dataset2", url: "/dataset2"});
        expect(dispatch.mock.calls[2][0]).toBe("getDataset");
        expect(dispatch.mock.calls[2][1]).toStrictEqual({datasetId: "dataset4", url: "/dataset4"});
    });

    it("refreshDatasets does nothing if no metadata", async () => {
        const dispatch = vi.fn();
        const state = mockGenericChartState();
        await actions.refreshDatasets({dispatch, state} as any);
        expect(dispatch.mock.calls.length).toBe(0);
    });
});
