import { ActionContext, ActionTree, Commit } from "vuex"
import { PlotName, PlotSelectionsState } from "./plotSelections"
import { RootState } from "../../root"
import { PayloadWithType } from "../../types"
import { CalibrateDataResponse, FilterOption, PlotSettingOption } from "../../generated"
import { PlotSelectionUpdate, PlotSelectionsMutations } from "./mutations"
import { filtersInfoFromPlotSettings } from "./utils"
import { api } from "../../apiService"
import { PlotDataMutations, PlotDataUpdate } from "../plotData/mutations"

type Selection = {
    filter: {
        filterId: string,
        options: FilterOption[]
    }
} | {
    plotSetting: {
        id: string,
        options: FilterOption[]
    }
}

export type PlotSelectionActionUpdate = {
    plot: PlotName,
    selection: Selection
}

export type PlotSelectionsActions = {
    updateSelections: (store: ActionContext<PlotSelectionsState, RootState>, payload: PayloadWithType<PlotSelectionActionUpdate>) => void
}

export const actions: ActionTree<PlotSelectionsState, RootState> & PlotSelectionsActions = {
    async updateSelections(context, payload) {
        const { plot, selection } = payload.payload;
        const { state, commit, rootState } = context;
        const updatedSelections: PlotSelectionsState[PlotName]  = {...state[plot]};
        if ("filter" in selection) {
            const fIndex = updatedSelections.filters.findIndex(f => f.stateFilterId === selection.filter.filterId);
            updatedSelections.filters[fIndex].selection = selection.filter.options;
        } else {
            const pIndex = updatedSelections.controls.findIndex(p => p.id === selection.plotSetting.id);
            updatedSelections.controls[pIndex].selection = selection.plotSetting.options;
            const metadata = rootState.modelCalibrate.metadata!;
            const plotSettingOptions: PlotSettingOption[] = updatedSelections.controls.map(c => {
                const plotSetting = metadata.plotSettingsControl[plot].plotSettings.find(ps => ps.id === c.id);
                return plotSetting!.options.find(op => op.id === c.selection[0].id)!;
            });
            const filtersInfo = filtersInfoFromPlotSettings(plotSettingOptions, plot, rootState);
            updatedSelections.filters = filtersInfo;
        }
        await getFilteredData(plot, updatedSelections.filters, context);
        commit({
            type: PlotSelectionsMutations.updatePlotSelection,
            payload: { plot, selections: updatedSelections } as PlotSelectionUpdate
        });
    }
}

type FilteredDataContext = {
    commit: Commit,
    rootState: RootState
}

export const outputPlots = ["barchart", "choropleth", "bubble", "table"];

export const getFilteredData = async (plot: PlotName, selections: PlotSelectionUpdate["selections"]["filters"], context: FilteredDataContext) => {
    if (outputPlots.includes(plot)) {
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
    }
};
