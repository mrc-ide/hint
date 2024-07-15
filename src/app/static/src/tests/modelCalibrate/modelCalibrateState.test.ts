declare const currentUser: string; // set in jest config, or on the index page when run for real
localStorage.setItem("user", currentUser);
const existingState = {
    modelCalibrate: {
        options: "TEST"
    },
    surveyAndProgram: {},
    baseline: {}
} as any;


import {modelCalibrate, ModelCalibrateState} from "../../app/store/modelCalibrate/modelCalibrate";

it("loads initial state from existingState", () => {
    const state = modelCalibrate(existingState).state as ModelCalibrateState;
    expect(state.options).toBe("TEST");
});
