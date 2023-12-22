import {actions} from "../../app/store/plottingSelections/actions";
import {PlottingSelectionsMutations} from "../../app/store/plottingSelections/mutations";
import {
    BarchartSelections, BubblePlotSelections, ChoroplethSelections, TableSelections,
} from "../../app/store/plottingSelections/plottingSelections";
import { ModelOutputTabs } from "../../app/types";

describe("PlottingSelection actions", () => {

    it("updateBarchartSelections dispatches data action and commits mutation", async () => {
        const commit = vi.fn();
        const dispatch = vi.fn();
        const barchartSelections = {
            indicatorId: "test-indicator",
            xAxisId: "age",
            disaggregateById: "test-disagg",
            selectedFilterOptions: {
                testFilter: []
            }
        } as BarchartSelections;

        await actions.updateBarchartSelections({commit, dispatch} as any, {payload: barchartSelections} as any);

        expect(dispatch.mock.calls.length).toBe(1);
        expect(dispatch.mock.calls[0][0]).toBe("modelCalibrate/getResultData");
        expect(dispatch.mock.calls[0][1]).toStrictEqual({indicatorId: "test-indicator", tab: ModelOutputTabs.Bar})

        expect(commit.mock.calls.length).toBe(1);
        expect(commit.mock.calls[0][0].type).toBe(PlottingSelectionsMutations.updateBarchartSelections);
        expect(commit.mock.calls[0][0].payload).toBe(barchartSelections);
    });

    it("updateChoroplethSelections dispatches data action and commits mutation", async () => {
        const commit = vi.fn();
        const dispatch = vi.fn();
        const choroplethSelections = {
            indicatorId: "test-indicator",
        } as Partial<ChoroplethSelections>;

        await actions.updateChoroplethSelections({commit, dispatch} as any, {payload: choroplethSelections} as any);

        expect(dispatch.mock.calls.length).toBe(1);
        expect(dispatch.mock.calls[0][0]).toBe("modelCalibrate/getResultData");
        expect(dispatch.mock.calls[0][1]).toStrictEqual({indicatorId: "test-indicator", tab: ModelOutputTabs.Map})

        expect(commit.mock.calls.length).toBe(1);
        expect(commit.mock.calls[0][0].type).toBe(PlottingSelectionsMutations.updateOutputChoroplethSelections);
        expect(commit.mock.calls[0][0].payload).toBe(choroplethSelections);
    });

    it("updateChoroplethSelections doesn't dispatch action if indicator not in update", async () => {
        const commit = vi.fn();
        const dispatch = vi.fn();
        const choroplethSelections = {
            selectedFilterOptions: {
                testFilter: []
            }
        } as Partial<ChoroplethSelections>;

        await actions.updateChoroplethSelections({commit, dispatch} as any, {payload: choroplethSelections} as any);

        expect(dispatch.mock.calls.length).toBe(0);

        expect(commit.mock.calls.length).toBe(1);
        expect(commit.mock.calls[0][0].type).toBe(PlottingSelectionsMutations.updateOutputChoroplethSelections);
        expect(commit.mock.calls[0][0].payload).toBe(choroplethSelections);
    });

    it("updateTableSelection dispatches data action and commits mutation", async () => {
        const commit = vi.fn();
        const dispatch = vi.fn();
        const tableSelections = {
            indicator: "test-indicator",
        } as Partial<TableSelections>;

        await actions.updateTableSelections({commit, dispatch} as any, {payload: tableSelections} as any);

        expect(dispatch.mock.calls.length).toBe(1);
        expect(dispatch.mock.calls[0][0]).toBe("modelCalibrate/getResultData");
        expect(dispatch.mock.calls[0][1]).toStrictEqual({indicatorId: "test-indicator", tab: ModelOutputTabs.Table})

        expect(commit.mock.calls.length).toBe(1);
        expect(commit.mock.calls[0][0].type).toBe(PlottingSelectionsMutations.updateTableSelections);
        expect(commit.mock.calls[0][0].payload).toBe(tableSelections);
    });

    it("updateTableSelection doesn't dispatch action if indicator not in update", async () => {
        const commit = vi.fn();
        const dispatch = vi.fn();
        const tableSelections = {
            selectedFilterOptions: {
                testFilter: []
            }
        } as Partial<TableSelections>;

        await actions.updateTableSelections({commit, dispatch} as any, {payload: tableSelections} as any);

        expect(dispatch.mock.calls.length).toBe(0);

        expect(commit.mock.calls.length).toBe(1);
        expect(commit.mock.calls[0][0].type).toBe(PlottingSelectionsMutations.updateTableSelections);
        expect(commit.mock.calls[0][0].payload).toBe(tableSelections);
    });

    it("updateBubblePlotSelections dispatches data action and commits mutation", async () => {
        const commit = vi.fn();
        const dispatch = vi.fn();
        const bubbleSelections = {
            colorIndicatorId: "colour-indicator",
            sizeIndicatorId: "size-indicator"
        } as Partial<BubblePlotSelections>;

        await actions.updateBubblePlotSelections({commit, dispatch} as any, {payload: bubbleSelections} as any);

        expect(dispatch.mock.calls.length).toBe(2);
        expect(dispatch.mock.calls[0][0]).toBe("modelCalibrate/getResultData");
        expect(dispatch.mock.calls[0][1]).toStrictEqual({indicatorId: "colour-indicator", tab: ModelOutputTabs.Bubble})
        expect(dispatch.mock.calls[1][0]).toBe("modelCalibrate/getResultData");
        expect(dispatch.mock.calls[1][1]).toStrictEqual({indicatorId: "size-indicator", tab: ModelOutputTabs.Bubble})

        expect(commit.mock.calls.length).toBe(1);
        expect(commit.mock.calls[0][0].type).toBe(PlottingSelectionsMutations.updateBubblePlotSelections);
        expect(commit.mock.calls[0][0].payload).toBe(bubbleSelections);
    });

    it("updateBubblePlotSelections doesn't dispatch action if indicator not in update", async () => {
        const commit = vi.fn();
        const dispatch = vi.fn();
        const bubbleSelections = {
            selectedFilterOptions: {
                testFilter: []
            }
        } as Partial<BubblePlotSelections>;

        await actions.updateBubblePlotSelections({commit, dispatch} as any, {payload: bubbleSelections} as any);

        expect(dispatch.mock.calls.length).toBe(0);

        expect(commit.mock.calls.length).toBe(1);
        expect(commit.mock.calls[0][0].type).toBe(PlottingSelectionsMutations.updateBubblePlotSelections);
        expect(commit.mock.calls[0][0].payload).toBe(bubbleSelections);

        const bubbleSelections2 = {
            sizeIndicatorId: "size-indicator",
            selectedFilterOptions: {
                testFilter: []
            }
        } as Partial<BubblePlotSelections>;

        await actions.updateBubblePlotSelections({commit, dispatch} as any, {payload: bubbleSelections2} as any);

        expect(dispatch.mock.calls.length).toBe(1);
        expect(dispatch.mock.calls[0][0]).toBe("modelCalibrate/getResultData");
        expect(dispatch.mock.calls[0][1]).toStrictEqual({indicatorId: "size-indicator", tab: ModelOutputTabs.Bubble})

        expect(commit.mock.calls.length).toBe(2);
        expect(commit.mock.calls[1][0].type).toBe(PlottingSelectionsMutations.updateBubblePlotSelections);
        expect(commit.mock.calls[1][0].payload).toBe(bubbleSelections2);
    });
});
