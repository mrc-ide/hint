import {actions} from "../../app/store/baseline/actions";
import {login} from "./integrationTest";

const fs = require("fs");
const FormData = require("form-data");

describe("Baseline actions", () => {

    beforeAll(async () => {
        await login();
    });

    it("can upload PJNZ file", async () => {
        const commit = jest.fn();

        const file = fs.createReadStream("../testdata/Botswana2018.PJNZ");
        const formData = new FormData();
        formData.append('file', file);

        await actions.uploadPJNZ({commit} as any, formData);

        expect(commit.mock.calls[1][0]["type"]).toBe("PJNZUpdated");
        expect(commit.mock.calls[1][0]["payload"]["filename"])
            .toBe("Botswana2018.PJNZ");
    });

    it("can get baseline data", (done) => {
        const commit = jest.fn();
        actions.getBaselineData({commit} as any);

        setTimeout(() => {
            const calls = commit.mock.calls.map((callArgs) => callArgs[0]["type"]);
            expect(calls).toContain("PJNZUpdated");
            expect(calls).toContain("ShapeUpdated");
            expect(calls).toContain("PopulationUpdated");
            done();
        }, 50);
    });

    it("can upload shape file", async () => {
        const commit = jest.fn();
        const file = fs.createReadStream("../testdata/malawi.geojson");
        const formData = new FormData();
        formData.append('file', file);

        await actions.uploadShape({commit} as any, formData);

        expect(commit.mock.calls[1][0]["type"]).toBe("ShapeUpdated");
        expect(commit.mock.calls[1][0]["payload"]["filename"])
            .toBe("malawi.geojson");

    }, 10000);

    it("can upload population file", async () => {
        const commit = jest.fn();
        const file = fs.createReadStream("../testdata/population.csv");
        const formData = new FormData();
        formData.append('file', file);

        await actions.uploadPopulation({commit} as any, formData);

        expect(commit.mock.calls[1][0]["type"]).toBe("PopulationUpdated");
        expect(commit.mock.calls[1][0]["payload"]["filename"])
            .toBe("population.csv");

    });

});