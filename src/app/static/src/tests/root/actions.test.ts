import {actions} from "../../app/store/root/actions";
import {mockStepperState} from "../mocks";

describe("root actions", () => {

    //NB in these tests 'valid' means complete with no preceding incomplete steps, or incomplete with no subsequent
    //complete steps

    it("does not reset state if all steps are valid", async () => {

        const mockContext = {
            commit: jest.fn(),
            dispatch: jest.fn(),
            getters: {
                "stepper/complete": {
                    1: true,
                    2: true
                }
            },
            state: {
                stepper: mockStepperState({
                    activeStep: 3
                })
            }
        };

        await actions.validate(mockContext as any);
        expect(mockContext.commit).not.toHaveBeenCalled();
        expect(mockContext.dispatch).not.toHaveBeenCalled();
    });

    it("resets state if not all steps are valid", async () => {


        const mockContext = {
            commit: jest.fn(),
            dispatch: jest.fn(),
            getters: {
                "stepper/complete": {
                    1: true,
                    2: false
                }
            },
            state: {
                stepper: mockStepperState({
                    activeStep: 3
                })
            }
        };

        await actions.validate(mockContext as any);
        expect(mockContext.dispatch).toHaveBeenCalled();
        expect(mockContext.commit.mock.calls[0][0]).toStrictEqual({type: "Reset", payload: 1});
        expect(mockContext.commit.mock.calls[1][0]).toStrictEqual({type: "ResetFilteredDataSelections"});
    });

    it("resets state if a step following current step is not valid", async () => {
        const mockContext = {
            commit: jest.fn(),
            dispatch: jest.fn(),
            getters: {
                "stepper/complete": {
                    1: true,
                    2: false,
                    3: true
                }
            },
            state: {
                stepper: mockStepperState({
                    activeStep: 1
                })
            }
        };

        await actions.validate(mockContext as any);
        expect(mockContext.dispatch).toHaveBeenCalled();

        expect(mockContext.commit.mock.calls[0][0]).toStrictEqual({type: "Reset", payload: 1});
        expect(mockContext.commit.mock.calls[1][0]).toStrictEqual({type: "ResetFilteredDataSelections"});
    });

    it("does not reset state if later steps than current are complete and incomplete, but all are valid", async () => {
        const mockContext = {
            commit: jest.fn(),
            dispatch: jest.fn(),
            getters: {
                "stepper/complete": {
                    1: true,
                    2: true,
                    3: false
                }
            },
            state: {
                stepper: mockStepperState({
                    activeStep: 1
                })
            }
        };

        await actions.validate(mockContext as any);
        expect(mockContext.commit).not.toHaveBeenCalled();
        expect(mockContext.dispatch).not.toHaveBeenCalled();
    });

    it("dispatches delete baseline and surveyAndProgram action if baseline step is not valid", async () => {
        const mockContext = {
            commit: jest.fn(),
            dispatch: jest.fn(),
            getters: {
                "stepper/complete": {
                    1: false,
                    2: false
                }
            },
            state: {
                stepper: mockStepperState({
                    activeStep: 3
                })
            }
        };

        await actions.validate(mockContext as any);
        expect(mockContext.dispatch.mock.calls[0][0]).toBe("baseline/deleteAll");
        expect(mockContext.dispatch.mock.calls[1][0]).toBe("surveyAndProgram/deleteAll");
    });

    it("dispatches delete surveyAndProgram action if surveyAndProgram step is not valid", async () => {
        const mockContext = {
            commit: jest.fn(),
            dispatch: jest.fn(),
            getters: {
                "stepper/complete": {
                    1: true,
                    2: false
                }
            },
            state: {
                stepper: mockStepperState({
                    activeStep: 3
                })
            }
        };

        await actions.validate(mockContext as any);
        expect(mockContext.dispatch.mock.calls[0][0]).toBe("surveyAndProgram/deleteAll");
    });

    it("dispatches no delete action if baseline and surveyAndProgram steps are valid", async () => {
        const mockContext = {
            commit: jest.fn(),
            dispatch: jest.fn(),
            getters: {
                "stepper/complete": {
                    1: true,
                    2: true,
                    3: false
                }
            },
            state: {
                stepper: mockStepperState({
                    activeStep: 4
                })
            }
        };

        await actions.validate(mockContext as any);
        expect(mockContext.dispatch).not.toHaveBeenCalled();
    });

});
