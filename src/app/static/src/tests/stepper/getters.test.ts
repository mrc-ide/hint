import {
    mockADRState,
    mockBaselineState,
    mockModelCalibrateState,
    mockModelRunState,
    mockRootState,
    mockStepperState,
    mockSurveyAndProgramState
} from "../mocks";
import {getters} from "../../app/store/stepper/getters";

describe("stepper getters", () => {

    const state = mockStepperState({
        activeStep: 1
    });

    const testGetters = {
        complete: {
            1: true,
            2: true,
            3: false,
            4: false,
            5: false,
            6: false,
            7: false
        },
        hasChanges: {
            1: true,
            2: true,
            3: false,
            4: false,
            5: false,
            6: false,
            7: false
        }
    };

    it("is ready iff baseline, surveyAndProgram, modelRun, modelCalibrate are ready and adrSchemas present", () => {
        const rootState = mockRootState({
            adr: mockADRState({schemas: {baseUrl: "something"} as any}),
            baseline: mockBaselineState({ready: true}),
            surveyAndProgram: mockSurveyAndProgramState({ready: true}),
            modelRun: mockModelRunState({ready: true}),
            modelCalibrate: mockModelCalibrateState({ready: true})
        });
        let ready = getters.ready(state, testGetters, rootState, null as any);
        expect(ready).toBe(true);

        const baselineNotReady = {...rootState, baseline: mockBaselineState({ready: false})};
        ready = getters.ready(state, testGetters, baselineNotReady, null as any);
        expect(ready).toBe(false);

        const surveyAndProgramNotReady = {...rootState, surveyAndProgram: mockSurveyAndProgramState({ready: false})};
        ready = getters.ready(state, testGetters, surveyAndProgramNotReady, null as any);
        expect(ready).toBe(false);

        const modelRunNotReady = {...rootState, modelRun: mockModelRunState({ready: false})};
        ready = getters.ready(state, testGetters, modelRunNotReady, null as any);
        expect(ready).toBe(false);

        const modelCalibrateNotReady = {...rootState, modelCalibrate: mockModelCalibrateState({ready: false})};
        ready = getters.ready(state, testGetters, modelCalibrateNotReady, null as any);
        expect(ready).toBe(false);

        const schemasNotReady = {...rootState, adr: mockADRState({schemas: null})};
        ready = getters.ready(state, testGetters, schemasNotReady, null as any);
        expect(ready).toBe(false);
    });

    it("returns changes to relevant steps", () => {
        const steps = getters.changesToRelevantSteps(state, testGetters, null as any, null as any);
        expect(steps.length).toBe(1);
        expect(steps[0].number).toBe(2);
    });

    const stateMF = mockStepperState({
        activeStep: 4
    });

    const testGettersMF = {
        complete: {
            1: true,
            2: true,
            3: true,
            4: true,
            5: false,
            6: false,
            7: false
        },
        hasChanges: {
            1: true,
            2: true,
            3: true,
            4: true,
            5: false,
            6: false,
            7: false
        }
    };

    it("returns changes to relevant steps after a model fit completed", () => {
        const steps = getters.changesToRelevantSteps(stateMF, testGettersMF, null as any, null as any);
        expect(steps.length).toBe(1);
        expect(steps[0].number).toBe(4);
    });

    it("edits require confirmation if there are relevant steps with changes", () => {
        const localTestGetters = {...testGetters, changesToRelevantSteps: [{}]};
        const result = getters.editsRequireConfirmation(state, localTestGetters, null as any, null as any);
        expect(result).toBe(true);
    });

    it("edits do not require confirmation if there are no relevant steps with changes", () => {
        const localTestGetters = {...testGetters, changesToRelevantSteps: []};
        const result = getters.editsRequireConfirmation(state, localTestGetters, null as any, null as any);
        expect(result).toBe(false);
    });

    it("returns expected stepTextKeys", () => {
        const result = getters.stepTextKeys(state, testGetters, null as any, null as any);
        expect(result).toStrictEqual({
            1: "uploadInputs",
            2: "reviewInputs",
            3: "modelOptions",
            4: "fitModel",
            5: "calibrateModel",
            6: "reviewOutput",
            7: "downloadResults"
        });
    });
});
