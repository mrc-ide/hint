import {expectAllMutationsDefined} from "../testHelpers";
import {mutations, PlotStateMutations, SetScale, UpdateScale} from "../../app/store/plotState/mutations";
import {mockPlotState} from "../mocks";
import {ScaleType} from "../../app/store/plotState/plotState";

describe("PlotData mutations", () => {

    afterEach(() => {
        localStorage.clear();
    });

    it("all mutation types are defined", () => {
        expectAllMutationsDefined(PlotStateMutations, mutations);
    });

    it("can set outputScale", () => {
        const plotState = mockPlotState();
        const newScale = {
            scale: "Colour",
            selections: {
                prevalence: {
                    type: ScaleType.Custom,
                    customMin: 0.1,
                    customMax: 0.9
                }
            }
        } as SetScale
        const testPayload = {
            payload: newScale
        };
        mutations.setOutputScale(plotState, testPayload);
        expect(plotState.output.colourScales).toBe(newScale.selections);
        expect(plotState.output.sizeScales).toStrictEqual({});

        const newSizeScale = {
            scale: "Size",
            selections: {
                prevalence: {
                    type: ScaleType.Custom,
                    customMin: 0.1,
                    customMax: 0.5
                }
            }
        } as SetScale
        const testSizePayload = {
            payload: newSizeScale
        };
        mutations.setOutputScale(plotState, testSizePayload);
        expect(plotState.output.colourScales).toBe(newScale.selections);
        expect(plotState.output.sizeScales).toStrictEqual(newSizeScale.selections);
    });

    it("can update existing scale", () => {
        const plotState = mockPlotState({
            output: {
                colourScales: {
                    prevalence: {
                        type: ScaleType.Custom,
                        customMin: 0.1,
                        customMax: 0.9
                    }
                },
                sizeScales: {}
            }
        });

        // New indicator
        const newIndicatorPayload = {
            payload: {
                scale: "Colour",
                indicatorId: "population",
                newScaleSettings: {
                    type: ScaleType.Custom,
                    customMin: 0,
                    customMax: 1000
                }
            } as UpdateScale
        };
        mutations.updateOutputScale(plotState, newIndicatorPayload);

        let expectedScale = {
            prevalence: {
                type: ScaleType.Custom,
                customMin: 0.1,
                customMax: 0.9
            },
            population: {
                type: ScaleType.Custom,
                customMin: 0,
                customMax: 1000
            }
        }
        expect(plotState.output.colourScales).toStrictEqual(expectedScale);
        expect(plotState.output.sizeScales).toStrictEqual({});

        // Existing indicator
        const existingIndicatorPayload = {
            payload: {
                scale: "Colour",
                indicatorId: "prevalence",
                newScaleSettings: {
                    type: ScaleType.DynamicFiltered,
                    customMin: 0,
                    customMax: 0
                }
            } as UpdateScale
        };
        mutations.updateOutputScale(plotState, existingIndicatorPayload);

        expectedScale = {
            prevalence: {
                type: ScaleType.DynamicFiltered,
                customMin: 0,
                customMax: 0
            },
            population: {
                type: ScaleType.Custom,
                customMin: 0,
                customMax: 1000
            }
        }
        expect(plotState.output.colourScales).toStrictEqual(expectedScale);
        expect(plotState.output.sizeScales).toStrictEqual({});

        // Size indicator
        const sizeIndicatorPayload = {
            payload: {
                scale: "Size",
                indicatorId: "population",
                newScaleSettings: {
                    type: ScaleType.Custom,
                    customMin: 0,
                    customMax: 1000
                }
            } as UpdateScale
        };
        mutations.updateOutputScale(plotState, sizeIndicatorPayload);

        const expectedSizeScale = {
            population: {
                type: ScaleType.Custom,
                customMin: 0,
                customMax: 1000
            }
        }
        expect(plotState.output.colourScales).toStrictEqual(expectedScale);
        expect(plotState.output.sizeScales).toStrictEqual(expectedSizeScale);
    });
});
