declare const currentUser: string; // set in jest config, or on the index page when run for real
localStorage.setItem("user", currentUser);
const existingState = {
    modelOptions: {
        options: "TEST"
    },
    surveyAndProgram: {},
    baseline: {}
} as any;

import {modelOptions, modelOptionsGetters, ModelOptionsState} from "../../app/store/modelOptions/modelOptions";

it("loads initial state from existingState", () => {
    const state = modelOptions(existingState).state as ModelOptionsState;
    expect(state.options).toBe("TEST");
});

it("it has changes if state has changes flag", () => {
    const initialState = modelOptions(existingState).state as ModelOptionsState;
    expect(modelOptionsGetters.hasChanges(initialState)).toBe(false);

    initialState.changes = true;
    expect(modelOptionsGetters.hasChanges(initialState)).toBe(true);
});
