import {mockPlotSelectionsState, mockRootState} from "../mocks";
import {getters} from "../../app/store/plotSelections/getters";

describe("plotSelections getters", () => {
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

    it("barchartData getters returns empty if xaxis or disaggregate not set", () => {

    });

    it("barchartData getter returns empty plot data not available", () => {

    });

    it("barchartData getters filters on areaLevel is detail filter is set", () => {

    });
});
