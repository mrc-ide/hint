import {mutations} from "../../app/store/plotSelections/mutations";
import {mockError} from "../mocks";

describe("Plot selections mutations", () => {
    it("commits plot selections as expected", () => {
        const testState = {
            barchart: {},
            choropleth: {}
        };
        const payload = {
            plot: "barchart",
            selections: {filter: "testFilter"}
        };
        mutations.updatePlotSelection(testState as any, {payload});
        expect(testState).toStrictEqual({
            barchart: {filter: "testFilter"},
            choropleth: {}
        });
    });

    it("can set error in state", () => {
        const testError = mockError();
        const testState = {
            barchart: {},
            choropleth: {}
        };
        mutations.setError(testState as any, {payload: testError});
        expect(testState).toStrictEqual({
            barchart: {},
            choropleth: {},
            error: testError
        });
    });
});
