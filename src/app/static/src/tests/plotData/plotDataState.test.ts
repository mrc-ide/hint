import {plotData, PlotDataState} from "../../app/store/plotData/plotData";
import {plotNames} from "../../app/store/plotSelections/plotSelections";

it("loads initial state", () => {
    const state = plotData.state as PlotDataState;
    const names = Object.keys(state);
    expect(names).toStrictEqual(plotNames);
});
