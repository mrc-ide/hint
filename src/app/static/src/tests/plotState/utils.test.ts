import {mockAxios, mockCalibrateMetadataResponse} from "../mocks";
import {Mock} from "vitest";
import {commitInitialScaleSelections} from "../../app/store/plotState/utils";
import {PlotStateMutations} from "../../app/store/plotState/mutations";
import {Scale, ScaleType} from "../../app/store/plotState/plotState";
import {CalibrateMetadataResponse} from "../../app/generated";

describe("plotState utils", () => {

    beforeEach(() => {
        // stop apiService logging to console
        console.log = vi.fn();
        mockAxios.reset();
    });

    afterEach(() => {
        (console.log as Mock).mockClear();
    });

    it("can commit initial scale selections", () => {
        const commit = vi.fn();

        const mockIndicators: CalibrateMetadataResponse["indicators"] = [
            {
                indicator: "prevalence",
                value_column: "value",
                name: "Prevalence",
                min: 0,
                max: 0.5,
                colour: "blue",
                invert_scale: false,
                scale: 1,
                accuracy: null,
                format: "0.0%"
            },
            {
                indicator: "population",
                value_column: "value",
                name: "Prevalence",
                min: 0,
                max: 10000,
                colour: "blue",
                invert_scale: false,
                scale: 1,
                accuracy: null,
                format: "0.0%"
            }
        ];
        commitInitialScaleSelections(mockIndicators, commit);

        expect(commit.mock.calls.length).toBe(2);
        const expectedSelections = {
            prevalence: {
                type: ScaleType.DynamicFiltered,
                customMin: 0,
                customMax: 0.5
            },
            population: {
                type: ScaleType.DynamicFiltered,
                customMin: 0,
                customMax: 10000
            }
        }
        expect(commit.mock.calls[0][0])
            .toStrictEqual({
                type: `plotState/${PlotStateMutations.setOutputScale}`,
                payload: {
                    scale: Scale.Colour,
                    selections: expectedSelections
                }
            });
        expect(commit.mock.calls[1][0])
            .toStrictEqual({
                type: `plotState/${PlotStateMutations.setOutputScale}`,
                payload: {
                    scale: Scale.Size,
                    selections: expectedSelections
                }
            });
    });
});
