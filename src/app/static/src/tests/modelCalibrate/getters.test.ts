import {mockCalibrateMetadataResponse, mockModelCalibrateState, mockRootState} from "../mocks";
import {getters} from "../../app/store/modelCalibrate/getters";

describe("modelCalibrate getters", () => {
    it("can get column ID from filter ID", () => {
        const calibrateResponse = mockCalibrateMetadataResponse({
            filterTypes: [
                {
                    id: "filter1",
                    column_id: "column1",
                    options: []
                },
                {
                    id: "filter2",
                    column_id: "column2",
                    options: []
                },
            ]
        })
        const calibrateState = mockModelCalibrateState({
            metadata: calibrateResponse
        });
        const rootState = mockRootState({
            modelCalibrate: calibrateState
        });
        const getter = getters.filterIdToColumnId(calibrateState, null, rootState);

        expect(getter("choropleth", "filter1")).toStrictEqual("column1");
        expect(getter("choropleth", "filter2")).toStrictEqual("column2");
    });

    it("can tableMetadata from custom plot effects", () => {
        const calibrateResponse = mockCalibrateMetadataResponse({
            plotSettingsControl: {
                choropleth: {
                    plotSettings: []
                },
                barchart: {
                    plotSettings: []
                },
                table: {
                    plotSettings: [{
                        id: "presets",
                        label: "Table presets",
                        options: [
                            {
                                id: "opt1",
                                label: "Option 1",
                                effect: {
                                    customPlotEffect: {
                                        row: ["age"],
                                        column: ["sex"]
                                    }
                                }
                            }
                        ]
                    }]
                },
                bubble: {
                    plotSettings: []
                },
            }
        })
        const calibrateState = mockModelCalibrateState({
            metadata: calibrateResponse
        });
        const rootState = mockRootState({
            modelCalibrate: calibrateState
        });
        const getter = getters.tableMetadata(calibrateState, null, rootState);

        expect(getter("table", "opt1")).toStrictEqual({
            row: ["age"],
            column: ["sex"]
        });
        expect(getter("table", "opt2")).toBe(undefined);
    });
});
