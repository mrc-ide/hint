import {actions} from "../../../app/store/genericChart/actions";
import {login, rootState} from "../integrationTest";
import {GenericChartDataset, GenericChartMetadataResponse} from "../../../app/types";
import {GenericChartMutation} from "../../../app/store/genericChart/mutations";
import {getFormData} from "../helpers";
import {actions as baselineActions} from "../../../app/store/baseline/actions";
import {actions as sapActions} from "../../../app/store/surveyAndProgram/actions"

export const getGenericChartMetadata = async () => {
    const commit = vi.fn();
    await actions.getGenericChartMetadata({commit, rootState} as any);
    expect(commit.mock.calls[0][0]["type"]).toBe("GenericChartMetadataFetched");
    return commit.mock.calls[0][0]["payload"] as GenericChartMetadataResponse;
};

describe("genericChart actions", () => {
    beforeAll(async () => {
        await login();
    });

    const uploadInputFiles = async() => {
        const commit = vi.fn();
        const dispatch = vi.fn();
        const shapeFormData = getFormData("malawi.geojson");
        await baselineActions.uploadShape({commit, dispatch, rootState} as any, shapeFormData);
        const ancFormData = getFormData("anc.csv");
        await sapActions.uploadANC({commit, dispatch, rootState} as any, ancFormData);
        const artFormData = getFormData("programme.csv")
        await sapActions.uploadProgram({commit, dispatch, rootState} as any, artFormData);
    };

    it("can fetch generic chart metadata", async () => {
        const response = await getGenericChartMetadata();
        expect(response["input-time-series"].datasets.length).toBe(2);
        expect(response["input-time-series"].chartConfig[0].config.startsWith("(")).toBe(true);
    });

    it("can fetch dataset", async () => {
        await uploadInputFiles();
        const commit = vi.fn();
        const payload = {datasetId: "ART", url: "/chart-data/input-time-series/programme"};
        await actions.getDataset({commit, rootState} as any, payload);
        expect(commit.mock.calls[1][0]["type"]).toBe(GenericChartMutation.SetDataset);
        const response = commit.mock.calls[1][0]["payload"]["dataset"] as GenericChartDataset;
        expect(response.data.length).toBeGreaterThan(0);
        expect(response.data[0].area_id).toContain("MWI");
        expect(response.data[0].value).not.toBeUndefined();
    });
});
