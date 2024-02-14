import { ActionContext, ActionTree } from "vuex"
import { PlotName, PlotSelectionsState } from "./plotSelections"
import { RootState } from "../../root"
import { PayloadWithType } from "../../types"
import { FilterOption, PlotSettingOption } from "../../generated"
import { PlotSelectionUpdate, PlotSelectionsMutations } from "./mutations"
import { filtersInfoFromPlotSettings } from "./utils"

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
            const fIndex = updatedSelections.filters.findIndex(f => f.filterId === selection.filter.filterId);
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
        commit({
            type: PlotSelectionsMutations.updatePlotSelection,
            payload: { plot, selections: updatedSelections } as PlotSelectionUpdate
        });
    }
}