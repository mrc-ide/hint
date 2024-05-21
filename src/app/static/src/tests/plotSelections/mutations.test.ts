import {mutations} from "../../app/store/plotSelections/mutations";

describe("Plot selections mutations", () => {
    it("commits plot selections as expected", () => {
        const testState = {
            barchart: {},
            choropleth: {}
        };
        const payload = {
            plot: "barchart",
            selections: { filter: "testFilter" }
        };
        mutations.updatePlotSelection(testState as any, { payload });
        expect(testState).toStrictEqual({
            barchart: { filter: "testFilter" },
            choropleth: {}
        });
    });
});
