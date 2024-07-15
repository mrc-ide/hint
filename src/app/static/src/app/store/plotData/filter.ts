import { Commit } from "vuex";
import { RootState } from "../../root";
import { FilterSelection, OutputPlotName } from "../plotSelections/plotSelections";
import { PlotSelectionUpdate, PlotSelectionsMutations } from "../plotSelections/mutations";
import { api } from "../../apiService";
import { AncResponse, CalibrateDataResponse, CalibratePlotData, ComparisonPlotData, FilterTypes, InputTimeSeriesData, InputTimeSeriesRow, ProgrammeResponse, SurveyResponse } from "../../generated";
import { PlotDataMutations, PlotDataUpdate } from "./mutations";
import { GenericChartMutation } from "../genericChart/mutations";
import { GenericChartDataset } from "../../types";
import { getMetadataFromPlotName } from "../plotSelections/actions";
import { InputTimeSeriesKey } from "./plotData";
import { Dict } from "@reside-ic/vue-next-dynamic-form";
import { SurveyAndProgramState } from "../surveyAndProgram/surveyAndProgram";

type FilteredDataContext = {
    commit: Commit,
    rootState: RootState
}

export const getOutputFilteredData = async (plot: OutputPlotName, selections: PlotSelectionUpdate["selections"]["filters"], context: FilteredDataContext) => {
    const { commit, rootState } = context;
    const filterTypes = rootState.modelCalibrate.metadata!.filterTypes;
    const dataFetchPayload: Record<string, string[]> = {};
    selections.forEach(sel => {
        const colId = filterTypes.find(f => f.id === sel.filterId)!.column_id;
        const opIds = sel.selection.map(s => s.id);
        if (colId in dataFetchPayload) {
            dataFetchPayload[colId] = [...dataFetchPayload[colId], ...opIds];
        } else {
            dataFetchPayload[colId] = opIds;
        }
    });

    const calibrateId = rootState.modelCalibrate.calibrateId;
    const response = await api<any, PlotSelectionsMutations>(context as any)
        .ignoreSuccess()
        .withError(PlotSelectionsMutations.setError)
        .freezeResponse()
        .postAndReturn<CalibrateDataResponse["data"]>(`calibrate/result/filteredData/${calibrateId}`, dataFetchPayload);
    
    if (response) {
        const data = response.data;
        commit(`plotData/${PlotDataMutations.updatePlotData}`, {
            payload: { plot, data } as PlotDataUpdate
        }, { root: true });
    }
};

export const getTimeSeriesFilteredDataset = async (payload: PlotSelectionUpdate, commit: Commit, rootState: RootState) => {
    commit(`genericChart/${GenericChartMutation.SetError}`, { payload: null }, { root: true });
    const dataSource = payload.selections.controls.find(c => c.id === "time_series_data_source")!.selection[0].id;
    // fetch dataset
    if (!(dataSource in rootState.genericChart.datasets)) {
        const response = await api<GenericChartMutation, GenericChartMutation>({commit, rootState})
                            .ignoreSuccess()
                            .withError(GenericChartMutation.SetError)
                            .freezeResponse()
                            .get(`chart-data/input-time-series/${dataSource}`);
        if (response) {
            const setDatasetPayload = {
                datasetId: dataSource,
                dataset: response.data
            };
            commit(`genericChart/${GenericChartMutation.SetDataset}`, { payload: setDatasetPayload }, { root: true });
            const data = response.data as GenericChartDataset;
            commit(`genericChart/${GenericChartMutation.WarningsFetched}`, { payload: data.warnings }, { root: true });
        }
    }
    // filter
    const metadata = getMetadataFromPlotName(rootState, payload.plot);
    const { filters } = payload.selections;
    const filterObject: Record<InputTimeSeriesKey, (string| number)[]> = {} as any;
    filters.forEach(f => {
        const filterType = metadata.filterTypes.find(ft => ft.id === f.filterId)!;
        filterObject[filterType.column_id as InputTimeSeriesKey] = filterType.column_id === "area_level" ?
            f.selection.map(s => parseInt(s.id)) :
            f.selection.map(s => s.id);
    });
    const { data } = rootState.genericChart.datasets[dataSource];
    const filteredData: InputTimeSeriesData = [];
    outer: for (let i = 0; i < data.length; i++) {
        const currRow = data[i] as unknown as InputTimeSeriesRow;
        for (const column_id in filterObject) {
            const key = column_id as InputTimeSeriesKey;
            if (!filterObject[key].includes(currRow[key] as string | number)) {
                continue outer;
            }
        }
        filteredData.push(currRow);
    }
    const plotDataPayload: PlotDataUpdate = {
        plot: payload.plot,
        data: filteredData
    };
    commit(`plotData/${PlotDataMutations.updatePlotData}`, { payload: plotDataPayload }, { root: true });
};

export const getCalibrateFilteredDataset = async (payload: PlotSelectionUpdate, commit: Commit, rootState: RootState) => {
    const calibratePlotResult = rootState.modelCalibrate.calibratePlotResult;
    if (!calibratePlotResult) {
        return;
    }
    const data = calibratePlotResult.data;

    // Filter the data on the current selections
    const metadata = getMetadataFromPlotName(rootState, payload.plot);
    const { filters } = payload.selections;
    const filterObject: Dict<(string| number)[]> = {};
    filters.forEach(f => {
        const filterType = metadata.filterTypes.find(ft => ft.id === f.filterId)!;
        filterObject[filterType.column_id] = f.selection.map(s => s.id);
    });
    const filteredData: CalibratePlotData = [];
    outer: for (let i = 0; i < data.length; i++) {
        const currRow = data[i];
        for (const column_id in filterObject) {
            // Filter values are always strings, so we cast the data to a string so the comparison works
            if (!filterObject[column_id].includes(currRow[column_id].toString())) {
                continue outer;
            }
        }
        filteredData.push(currRow);
    }
    const plotDataPayload: PlotDataUpdate = {
        plot: payload.plot,
        data: filteredData
    };
    commit(`plotData/${PlotDataMutations.updatePlotData}`, { payload: plotDataPayload }, { root: true });
};

export const getComparisonFilteredDataset = async (payload: PlotSelectionUpdate, commit: Commit, rootState: RootState) => {
    const comparisonPlotResult = rootState.modelCalibrate.comparisonPlotResult;
    if (!comparisonPlotResult) {
        return;
    }
    const data = comparisonPlotResult.data;

    // Filter the data on the current selections
    const metadata = getMetadataFromPlotName(rootState, payload.plot);
    const { filters } = payload.selections;
    const filterObject: Dict<(string| number)[]> = {};
    filters.forEach(f => {
        const filterType = metadata.filterTypes.find(ft => ft.id === f.filterId)!;
        filterObject[filterType.column_id] = f.selection.map(s => s.id);
    });
    const filteredData: ComparisonPlotData = [];
    outer: for (let i = 0; i < data.length; i++) {
        const currRow = data[i];
        for (const column_id in filterObject) {
            // Filter values are always strings, so we cast the data to a string so the comparison works
            if (!filterObject[column_id].includes(currRow[column_id].toString())) {
                continue outer;
            }
        }
        filteredData.push(currRow);
    }
    const plotDataPayload: PlotDataUpdate = {
        plot: payload.plot,
        data: filteredData
    };
    commit(`plotData/${PlotDataMutations.updatePlotData}`, { payload: plotDataPayload }, { root: true });
};

const dataSourceToState: Record<string, keyof SurveyAndProgramState> = {
    survey: "survey",
    anc: "anc",
    programme: "program"
}

export const getInputChoroplethFilteredData = async (payload: PlotSelectionUpdate, commit: Commit, rootState: RootState) => {
    const dataSource = payload.selections.controls.find(c => c.id === "input_choropleth_data_source")!.selection[0].id;
    const response = rootState.surveyAndProgram[dataSourceToState[dataSource]];
    if (!response) {
        const plotDataPayload: PlotDataUpdate = {
            plot: "inputChoropleth",
            data: []
        };
        commit(`plotData/${PlotDataMutations.updatePlotData}`, { payload: plotDataPayload }, { root: true });
    }
    const { filters } = payload.selections;
    const { data } = response as SurveyResponse | AncResponse | ProgrammeResponse;
    const { filterTypes } = getMetadataFromPlotName(rootState, payload.plot);
    const filteredData = filterData(filters, data, filterTypes);
    const plotDataPayload: PlotDataUpdate = {
        plot: payload.plot,
        data: filteredData
    };
    commit(`plotData/${PlotDataMutations.updatePlotData}`, { payload: plotDataPayload }, { root: true });
};

const filterData = (filters: FilterSelection[], data: any[], filterTypes: FilterTypes[]) => {
    const filterObject: Record<string, (string| number)[]> = {} as any;
    filters.forEach(f => {
        const filterType = filterTypes.find(ft => ft.id === f.filterId)!;
        filterObject[filterType.column_id] = filterType.column_id === "area_level" || filterType.column_id === "year" ?
            f.selection.map(s => parseInt(s.id)) :
            f.selection.map(s => s.id);
    });
    const filteredData: typeof data = [];
    const dataKeys = data.length === 0 ? [] : Object.keys(data[0]);
    const filterableKeys = dataKeys.filter(key => Object.keys(filterObject).includes(key));
    console.log({filterObject})
    console.log({data})
    console.log({filterableKeys})
    if (filterableKeys.length === 0) return data;
    outer: for (let i = 0; i < data.length; i++) {
        const currRow = data[i];
        for (let j = 0; j < filterableKeys.length; j++) {
            const column_id = filterableKeys[j];
            if (!filterObject[column_id].includes(currRow[column_id])) continue outer;
        }
        filteredData.push(currRow);
    }
    return filteredData;
};
