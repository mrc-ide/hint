import {actions} from "../../app/store/modelOutput/actions";
import {BarchartSelections,} from "../../app/store/plottingSelections/plottingSelections";
import {ModelOutputTabs} from "../../app/types";
import {ModelOutputMutation} from "../../app/store/modelOutput/mutations";
import {mockBaselineState, mockDataExplorationState, mockHintrVersionState, mockPlottingSelections} from "../mocks";

describe("ModelOutput actions", () => {

    it("updateSelectedTab dispatches action to fetch data for current tab and commits mutation", async () => {
        const commit = vi.fn();
        const dispatch = vi.fn();
        const rootState = mockDataExplorationState({
            plottingSelections: mockPlottingSelections({
                barchart: {
                    indicatorId: "barchart-indicator",
                    xAxisId: "x",
                    disaggregateById: "test-disagg",
                    selectedFilterOptions: {
                        testFilter: []
                    }
                },
                bubble: {
                    colorIndicatorId: "colour-indicator",
                    sizeIndicatorId: "size-indicator",
                    detail: 2,
                    selectedFilterOptions: {
                        testFilter: []
                    }
                },
                comparisonPlot: {
                    indicatorId: "comparison-indicator",
                    xAxisId: "x",
                    disaggregateById: "test-disagg",
                    selectedFilterOptions: {
                        testFilter: []
                    }
                },
                outputChoropleth: {
                    indicatorId: "choropleth-indicator",
                    detail: 2,
                    selectedFilterOptions: {
                        testFilter: []
                    }
                },
                table: {
                    indicator: "table-indicator",
                    preset: "test-preset",
                    selectedFilterOptions: {
                        testFilter: []
                    }
                }
            }),
        });

        await actions.updateSelectedTab({commit, rootState, dispatch} as any, ModelOutputTabs.Bar);

        expect(dispatch.mock.calls.length).toBe(1);
        expect(dispatch.mock.calls[0][0]).toBe("modelCalibrate/getResultData");
        expect(dispatch.mock.calls[0][1]).toStrictEqual({tab: ModelOutputTabs.Bar, indicatorId: "barchart-indicator"});

        expect(commit.mock.calls.length).toBe(1);
        expect(commit.mock.calls[0][0].type).toBe(ModelOutputMutation.TabSelected);
        expect(commit.mock.calls[0][0].payload).toBe(ModelOutputTabs.Bar);

        dispatch.mockReset();
        commit.mockReset();

        await actions.updateSelectedTab({commit, rootState, dispatch} as any, ModelOutputTabs.Bubble);

        expect(dispatch.mock.calls.length).toBe(2);
        expect(dispatch.mock.calls[0][0]).toBe("modelCalibrate/getResultData");
        expect(dispatch.mock.calls[0][1]).toStrictEqual({tab: ModelOutputTabs.Bubble, indicatorId: "colour-indicator"});
        expect(dispatch.mock.calls[1][0]).toBe("modelCalibrate/getResultData");
        expect(dispatch.mock.calls[1][1]).toStrictEqual({tab: ModelOutputTabs.Bubble, indicatorId: "size-indicator"});

        expect(commit.mock.calls.length).toBe(1);
        expect(commit.mock.calls[0][0].type).toBe(ModelOutputMutation.TabSelected);
        expect(commit.mock.calls[0][0].payload).toBe(ModelOutputTabs.Bubble);

        dispatch.mockReset();
        commit.mockReset();

        await actions.updateSelectedTab({commit, rootState, dispatch} as any, ModelOutputTabs.Comparison);

        expect(dispatch.mock.calls.length).toBe(0);

        expect(commit.mock.calls.length).toBe(1);
        expect(commit.mock.calls[0][0].type).toBe(ModelOutputMutation.TabSelected);
        expect(commit.mock.calls[0][0].payload).toBe(ModelOutputTabs.Comparison);

        dispatch.mockReset();
        commit.mockReset();

        await actions.updateSelectedTab({commit, rootState, dispatch} as any, ModelOutputTabs.Map);

        expect(dispatch.mock.calls.length).toBe(1);
        expect(dispatch.mock.calls[0][0]).toBe("modelCalibrate/getResultData");
        expect(dispatch.mock.calls[0][1]).toStrictEqual({tab: ModelOutputTabs.Map, indicatorId: "choropleth-indicator"});

        expect(commit.mock.calls.length).toBe(1);
        expect(commit.mock.calls[0][0].type).toBe(ModelOutputMutation.TabSelected);
        expect(commit.mock.calls[0][0].payload).toBe(ModelOutputTabs.Map);

        dispatch.mockReset();
        commit.mockReset();

        await actions.updateSelectedTab({commit, rootState, dispatch} as any, ModelOutputTabs.Table);

        expect(dispatch.mock.calls.length).toBe(1);
        expect(dispatch.mock.calls[0][0]).toBe("modelCalibrate/getResultData");
        expect(dispatch.mock.calls[0][1]).toStrictEqual({tab: ModelOutputTabs.Table, indicatorId: "table-indicator"});

        expect(commit.mock.calls.length).toBe(1);
        expect(commit.mock.calls[0][0].type).toBe(ModelOutputMutation.TabSelected);
        expect(commit.mock.calls[0][0].payload).toBe(ModelOutputTabs.Table);
    });
});
