import {plotState, PlotState} from "../../app/store/plotState/plotState";

it("loads initial state", () => {
    const state = plotState.state as PlotState;
    const names = Object.keys(state);
    expect(names).toStrictEqual(["input", "output"]);
});
