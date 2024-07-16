import {ControlSelection, FilterSelection, PlotName, PlotSelectionsState} from "./plotSelections";
import {ChoroplethIndicatorMetadata, FilterOption} from "../../generated";
import {BarChartData, plotDataToChartData} from "../../components/plots/bar/utils";
import {RootState} from "../../root";
import {PlotData} from "../plotData/plotData";
import {Dict} from "../../types";
import {getMetadataFromPlotName} from "./actions";

export const getters = {
    controlSelectionFromId: (state: PlotSelectionsState) => (plotName: PlotName, controlId: string): FilterOption | undefined => {
        return state[plotName].controls.find((f: ControlSelection) => f.id === controlId)?.selection[0]
    },
    filterSelectionFromId: (state: PlotSelectionsState) => (plotName: PlotName, filterId: string): FilterOption[] => {
        const filterSelection = state[plotName].filters.find((f: FilterSelection) => f.stateFilterId === filterId);
        if (filterSelection === undefined) {
            return []
        } else {
            return filterSelection.selection
        }
    },
    barchartData: (state: PlotSelectionsState, getters: any, rootState: RootState, rootGetters: any) =>
        (plotName: PlotName, plotData: PlotData, indicatorMetadata: ChoroplethIndicatorMetadata,
         filterSelections: FilterSelection[]): BarChartData => {
        const disaggregateBy = getters.controlSelectionFromId(plotName, "disagg_by");
        const xAxis = getters.controlSelectionFromId(plotName, "x_axis");
        const emptyData = {datasets:[], labels: [], maxValuePlusError: 0} as BarChartData;
        if (!disaggregateBy || !xAxis) {
            return emptyData
        }
        const disaggregateId = rootGetters["modelCalibrate/filterIdToColumnId"](plotName, disaggregateBy.id);
        const xAxisId = rootGetters["modelCalibrate/filterIdToColumnId"](plotName, xAxis.id);
        const disaggregateSelections = getters.filterSelectionFromId(plotName, disaggregateBy.id);
        const xAxisSelections = getters.filterSelectionFromId(plotName, xAxis.id);
        const metadata = getMetadataFromPlotName(rootState, plotName);
        const xAxisOptions = metadata.filterTypes.find(f => f.id === xAxis!.id)!.options;
        // For calibrate barchart we never have detail level on the x-axis as it is fixed. So we
        // can just keep these as empty.
        let areaIdToLevelMap = {} as Dict<number>;
        let areaLevel = null;
        if (plotName === "barchart" || plotName === "comparison") {
            areaIdToLevelMap = rootGetters["baseline/areaIdToLevelMap"];
            areaLevel = filterSelections.find(f => f.filterId == "detail")?.selection[0]?.id;
        }
        if (disaggregateId && xAxisId && xAxisOptions) {
            return plotDataToChartData(plotData, indicatorMetadata,
                disaggregateId, disaggregateSelections,
                xAxisId, xAxisSelections, xAxisOptions,
                areaLevel, areaIdToLevelMap);
        } else {
            return emptyData
        }
    }
};
