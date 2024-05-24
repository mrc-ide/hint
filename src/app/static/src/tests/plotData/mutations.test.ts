import {mutations, PlotDataMutations} from "../../app/store/plotData/mutations";
import {mockPlotData} from "../mocks";
import {expectAllMutationsDefined} from "../testHelpers";

describe("PlotData mutations", () => {

    afterEach(() => {
        localStorage.clear();
    });

    it("all mutation types are defined", () => {
        expectAllMutationsDefined(PlotDataMutations, mutations);
    });

    it("can set plotData", () => {
        const plotDataState = mockPlotData();
        const newData = [{
            area_id: "MWI",
            sex: "both",
            age_group: "1",
            calendar_quarter: "1",
            indicator_id: 1,
            indicator: 'newIndicator',
            lower: 0.5,
            mean: 0.5,
            mode: 0.5,
            upper: 0.5
        }]
        const testPayload = {
            payload: {
                plot: "choropleth",
                data: newData
            }
        };
        mutations.updatePlotData(plotDataState, testPayload);
        expect(plotDataState.choropleth).toBe(newData);
    });
});
