import {actions} from "../../app/store/baseline/actions";
import {login, rootState} from "./integrationTest";
import {getFormData} from "./helpers";
import {BaselineMutation} from "../../app/store/baseline/mutations";

describe("Baseline actions", () => {

    beforeAll(async () => {
        await login();
    });

    const state = {iso3: "Malawi"}

    it("can upload PJNZ file", async () => {
        const commit = vi.fn();
        const dispatch = vi.fn();
        const state = {country: "Malawi"} as any;
        const formData = getFormData("Botswana2018.PJNZ");

        await actions.uploadPJNZ({commit, state, dispatch, rootState} as any, formData);

        expect(commit.mock.calls[1][0]["type"]).toBe(BaselineMutation.PJNZUpdated);
        expect(commit.mock.calls[1][0]["payload"]["filename"])
            .toBe("Botswana2018.PJNZ");
    });

    it("can get baseline data", async () => {
        const commit = vi.fn();
        const dispatch = vi.fn();
        await actions.getBaselineData({commit, dispatch, rootState, state} as any);

        const calls = commit.mock.calls.map((callArgs) => callArgs[0]["type"]);
        expect(calls).toContain(BaselineMutation.PJNZUpdated);
        expect(calls).toContain(BaselineMutation.ShapeUpdated);
        expect(calls).toContain(BaselineMutation.PopulationUpdated);
    });

    it("can upload shape file", async () => {
        const commit = vi.fn();
        const dispatch = vi.fn();
        const formData = getFormData("malawi.geojson");
        await actions.uploadShape({commit, dispatch, rootState} as any, formData);

        expect(commit.mock.calls[1][0]["type"]).toBe(BaselineMutation.ShapeUpdated);
        expect(commit.mock.calls[1][0]["payload"]["filename"])
            .toBe("malawi.geojson");

    }, 10000);

    it("can upload population file", async () => {
        const commit = vi.fn();
        const dispatch = vi.fn();
        const formData = getFormData("population.csv");
        await actions.uploadPopulation({commit, dispatch, rootState} as any, formData);

        expect(commit.mock.calls[1][0]["type"]).toBe(BaselineMutation.PopulationUpdated);
        expect(commit.mock.calls[1][0]["payload"]["filename"])
            .toBe("population.csv");
    });

    it("can validate baseline data", async () => {
        const commit = vi.fn();
        const dispatch = vi.fn();

        await actions.validate({commit, dispatch, rootState} as any);
        expect(commit.mock.calls[1][0]["type"]).toBe(BaselineMutation.BaselineError);
        expect(commit.mock.calls[1][0]["payload"].detail).toContain("Countries aren't consistent");
    });

    it("can delete PJNZ", async () => {
        const commit = vi.fn();
        const dispatch = vi.fn();
        const formData = getFormData("Botswana2018.PJNZ");

        // upload
        await actions.uploadPJNZ({commit, dispatch, rootState, state: {}} as any, formData);

        commit.mockReset();

        // delete
        await actions.deletePJNZ({commit, dispatch, rootState} as any);
        expect(commit.mock.calls[0][0]["type"]).toBe(BaselineMutation.PJNZUpdated);

        commit.mockReset();

        // if the file has been deleted, data should come back null
        await actions.getBaselineData({commit, dispatch, rootState, state} as any);
        expect(commit.mock.calls.find(c => c[0]["type"] == BaselineMutation.PJNZUpdated)[0]["payload"]).toBe(null);
    });

    it("can delete shape", async () => {
        const commit = vi.fn();
        const dispatch = vi.fn();
        const formData = getFormData("malawi.geojson");

        // upload
        await actions.uploadShape({commit, dispatch, rootState} as any, formData);

        commit.mockReset();

        // delete
        await actions.deleteShape({commit, dispatch, rootState} as any);
        expect(commit.mock.calls[0][0]["type"]).toBe(BaselineMutation.ShapeUpdated);

        commit.mockReset();

        // if the file has been deleted, data should come back null
        await actions.getBaselineData({commit, dispatch, rootState, state} as any);
        expect(commit.mock.calls.find(c => c[0]["type"] == BaselineMutation.ShapeUpdated)[0]["payload"]).toBe(null);
    });

    it("can delete population", async () => {
        const commit = vi.fn();
        const dispatch = vi.fn();
        const formData = getFormData("population.csv");

        // upload
        await actions.uploadPopulation({commit, dispatch, rootState} as any, formData);

        commit.mockReset();

        // delete
        await actions.deletePopulation({commit, dispatch, rootState} as any);
        expect(commit.mock.calls[0][0]["type"]).toBe(BaselineMutation.PopulationUpdated);

        commit.mockReset();

        // if the file has been deleted, data should come back null
        await actions.getBaselineData({commit, dispatch, rootState, state} as any);
        expect(commit.mock.calls.find(c => c[0]["type"] == BaselineMutation.PopulationUpdated)[0]["payload"]).toBe(null);
    });

});