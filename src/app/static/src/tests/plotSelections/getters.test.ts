import {
    mockCalibrateDataResponse,
    mockCalibrateMetadataResponse,
    mockCalibratePlotResponse,
    mockChoroplethIndicatorMetadata,
    mockModelCalibrateState,
    mockPlotSelectionsState,
    mockRootState
} from "../mocks";
import {getters} from "../../app/store/plotSelections/getters";
import {PlotName} from "../../app/store/plotSelections/plotSelections";
import * as barUtils from "../../app/components/plots/bar/utils";

describe("plotSelections getters", () => {
    const filterSelections = [
        {
            filterId: "detail",
            stateFilterId: "detailFilter",
            label: "Detail filter",
            selection: [
                {
                    label: "Option A",
                    id: "detailOptA"
                },
                {
                    label: "Option A",
                    id: "detailOptB"
                }
            ],
            multiple: true,
            hidden: false
        }
    ]

    const xAxisOptions = [
        {
            label: "Option A",
            id: "optA"
        },
        {
            label: "Option B",
            id: "optB"
        },
        {
            label: "Option C",
            id: "optC"
        }
    ]

    const calibrateMetadata = mockCalibrateMetadataResponse({
        filterTypes: [
            {
                id: "x_axisControlSelection",
                column_id: "xAxisFilterCol",
                options: xAxisOptions
            }
        ]
    })

    const rootGetters = {
        "modelCalibrate/filterIdToColumnId": (plotName: PlotName, id: string) => {
            return id + "ColumnId"
        },
        "baseline/areaIdToLevelMap": {"MWI_1_1": 1}
    };

    const mockGetters = {
        "controlSelectionFromId": (plotName: PlotName, controlId: string) => {
            return {
                label: "Option 1",
                id: controlId + "ControlSelection"
            }
        },
        "filterSelectionFromId": (plotName: PlotName, filterId: string) => {
            return [
                {
                    label: "Option A",
                    id: filterId + "FilterSelectionA"
                },
                {
                    label: "Option B",
                    id: filterId + "FilterSelectionB"
                }
            ]
        }
    };

    const mockPlotDataToChartData = vi
        .spyOn(barUtils, "plotDataToChartData")
        .mockImplementation((...args) => {return {
            maxValuePlusError: 1,
            labels: ["A", "B"],
            datasets: []
        }});

    beforeEach(() => {
        vi.resetAllMocks()
    });

    it("can get control selection from ID", () => {
        const plotSelectionsState = mockPlotSelectionsState({
            choropleth: {
                controls: [
                    {
                        id: "control1",
                        label: "Control 1",
                        selection: [{
                            label: "Option 1",
                            id: "opt1"
                        }]
                    }
                ],
                filters: []
            }
        });

        const getter = getters.controlSelectionFromId(plotSelectionsState)

        expect(getter("choropleth", "control1")).toStrictEqual({
            label: "Option 1",
            id: "opt1"
        });
        expect(getter("choropleth", "control2")).toBe(undefined);
    });

    it("can get filter selection from ID", () => {
        const plotSelectionsState = mockPlotSelectionsState({
            choropleth: {
                controls: [],
                filters: [
                    {
                        filterId: "filter1",
                        stateFilterId: "filter1",
                        label: "Filter 1",
                        selection: [
                            {
                                label: "Option A",
                                id: "optA"
                            },
                            {
                                label: "Option B",
                                id: "optB"
                            }
                        ],
                        multiple: true,
                        hidden: false
                    },
                    {
                        filterId: "filter2",
                        stateFilterId: "stateFilter2",
                        label: "Filter 2",
                        selection: [
                            {
                                label: "Option A",
                                id: "optA"
                            }
                        ],
                        multiple: false,
                        hidden: false
                    }
                ]
            }
        });

        const getter = getters.filterSelectionFromId(plotSelectionsState)

        expect(getter("choropleth", "filter1")).toStrictEqual([
            {
                label: "Option A",
                id: "optA"
            },
            {
                label: "Option B",
                id: "optB"
            }
        ]);
        expect(getter("choropleth", "filter2")).toStrictEqual([]);
        expect(getter("choropleth", "stateFilter2")).toStrictEqual([
            {
                label: "Option A",
                id: "optA"
            }
        ]);
    });

    it("barchartData pulls bits from state and calls util", () => {
        const rootState = mockRootState({
            modelCalibrate: mockModelCalibrateState({
                metadata: calibrateMetadata
            })
        });

        const getter = getters.barchartData(mockPlotSelectionsState(), mockGetters, rootState, rootGetters);

        const plotData = mockCalibrateDataResponse();
        const indicatorMetadata = mockChoroplethIndicatorMetadata();
        getter("barchart", plotData, indicatorMetadata, filterSelections);

        expect(mockPlotDataToChartData.mock.calls.length).toBe(1)
        expect(mockPlotDataToChartData.mock.calls[0][0]).toStrictEqual(plotData)
        expect(mockPlotDataToChartData.mock.calls[0][1]).toStrictEqual(indicatorMetadata)
        expect(mockPlotDataToChartData.mock.calls[0][2]).toStrictEqual("disagg_byControlSelectionColumnId")
        expect(mockPlotDataToChartData.mock.calls[0][3]).toStrictEqual([
            {
                label: "Option A",
                id: "disagg_byControlSelectionFilterSelectionA"
            },
            {
                label: "Option B",
                id: "disagg_byControlSelectionFilterSelectionB"
            }
        ])
        expect(mockPlotDataToChartData.mock.calls[0][4]).toStrictEqual("x_axisControlSelectionColumnId")
        expect(mockPlotDataToChartData.mock.calls[0][5]).toStrictEqual([
            {
                label: "Option A",
                id: "x_axisControlSelectionFilterSelectionA"
            },
            {
                label: "Option B",
                id: "x_axisControlSelectionFilterSelectionB"
            }
        ])
        expect(mockPlotDataToChartData.mock.calls[0][6]).toStrictEqual(xAxisOptions)
        expect(mockPlotDataToChartData.mock.calls[0][7]).toStrictEqual("detailOptA")
        expect(mockPlotDataToChartData.mock.calls[0][8]).toStrictEqual({"MWI_1_1": 1})
    });

    it("barchartData getters returns empty if xaxis or disaggregate not set", () => {
        const plotSelectionsState = mockPlotSelectionsState();
        const rootState = mockRootState();
        const mockGetters = {
            "controlSelectionFromId": (plotName: PlotName, controlId: string) => {
                return null
            }
        };

        const getter = getters.barchartData(plotSelectionsState, mockGetters, rootState, rootGetters);

        const plotData = mockCalibrateDataResponse();
        const indicatorMetadata = mockChoroplethIndicatorMetadata();
        expect(getter("barchart", plotData, indicatorMetadata, [])).toStrictEqual({
            datasets: [],
            labels: [],
            maxValuePlusError: 0
        });
    });

    it("barchartData getter returns empty if xAxis or disaggregate by are not set", () => {
        const plotSelectionsState = mockPlotSelectionsState();
        const rootState = mockRootState({
            modelCalibrate: mockModelCalibrateState({
                metadata: calibrateMetadata
            })
        });
        const mockRootGetters = {
            "modelCalibrate/filterIdToColumnId": (plotName: PlotName, filterId: string) => {
                return null
            }
        }

        const getter = getters.barchartData(plotSelectionsState, mockGetters, rootState, mockRootGetters);

        const plotData = mockCalibrateDataResponse();
        const indicatorMetadata = mockChoroplethIndicatorMetadata();
        expect(getter("barchart", plotData, indicatorMetadata, [])).toStrictEqual({
            datasets: [],
            labels: [],
            maxValuePlusError: 0
        });
    });

    it("barchartData doesn't pass area level and area id map if viewing calibration plot", () => {
        // Doesn't pass areaLevel or areaIdToLevelMap if called for calibrate plot
        // these are only required to build error bars, which we don't have on calibrate plot
        const rootState = mockRootState({
            modelCalibrate: mockModelCalibrateState({
                calibratePlotResult: mockCalibratePlotResponse({
                    metadata: {
                        filterTypes: [
                            {
                                id: "x_axisControlSelection",
                                column_id: "xAxisFilterCol",
                                options: xAxisOptions
                            }
                        ],
                        indicators: [],
                        plotSettingsControl: {
                            calibrate: {
                                plotSettings: []
                            }
                        },
                        warnings: []
                    },
                })
            })
        });

        const getter = getters.barchartData(mockPlotSelectionsState(), mockGetters, rootState, rootGetters);

        const plotData = mockCalibrateDataResponse();
        const indicatorMetadata = mockChoroplethIndicatorMetadata();
        getter("calibrate", plotData, indicatorMetadata, filterSelections);

        expect(mockPlotDataToChartData.mock.calls.length).toBe(1)
        expect(mockPlotDataToChartData.mock.calls[0][7]).toStrictEqual(null)
        expect(mockPlotDataToChartData.mock.calls[0][8]).toStrictEqual({})
    });
});
