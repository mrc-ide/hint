import { ActionContext, ActionTree, Commit } from "vuex"
import { FilterSelection, OutputPlotName, PlotDataType, PlotName, PlotSelectionsState, plotNameToDataType } from "./plotSelections"
import { RootState } from "../../root"
import {Dict, GenericChartDataset, PayloadWithType} from "../../types"
import {
    AncResponse,
    CalibrateDataResponse,
    CalibratePlotData,
    ComparisonPlotData,
    FilterOption,
    FilterTypes,
    InputTimeSeriesData,
    InputTimeSeriesRow,
    PlotSettingEffect,
    PlotSettingOption,
    ProgrammeResponse,
    SurveyResponse
} from "../../generated"
import { PlotSelectionUpdate, PlotSelectionsMutations } from "./mutations"
import { filtersInfoFromEffects, getPlotData } from "./utils"
import { api } from "../../apiService"
import { PlotDataMutations, PlotDataUpdate } from "../plotData/mutations"
import { PlotMetadataFrame } from "../metadata/metadata"
import { GenericChartMutation } from "../genericChart/mutations"
import {InputTimeSeriesKey} from "../plotData/plotData"
import { SurveyAndProgramState } from "../surveyAndProgram/surveyAndProgram"

type IdOptions = {
    id: string,
    options: FilterOption[]
}

type Selection = { filter: IdOptions } | { plotSetting: IdOptions }

export type PlotSelectionActionUpdate = {
    plot: PlotName,
    selection: Selection
}

export type PlotSelectionsActions = {
    updateSelections: (store: ActionContext<PlotSelectionsState, RootState>, payload: PayloadWithType<PlotSelectionActionUpdate>) => void
}

export const getMetadataFromPlotName = (rootState: RootState, plotName: PlotName): PlotMetadataFrame => {
    const plotDataType = plotNameToDataType[plotName];
    switch(plotDataType) {
        case PlotDataType.Output: return rootState.modelCalibrate.metadata!;
        case PlotDataType.InputChoropleth: return rootState.metadata.reviewInputMetadata!;
        case PlotDataType.TimeSeries: return rootState.metadata.reviewInputMetadata!;
        case PlotDataType.Calibrate: return rootState.modelCalibrate.calibratePlotResult!.metadata;
        case PlotDataType.Comparison: return rootState.modelCalibrate.comparisonPlotResult!.metadata;
    }
}

export const actions: ActionTree<PlotSelectionsState, RootState> & PlotSelectionsActions = {
    async updateSelections(context, payload) {
        const { plot, selection } = payload.payload;
        const { state, commit, rootState } = context;
        const metadata = getMetadataFromPlotName(rootState, plot);
        const updatedSelections: PlotSelectionsState[PlotName]  = structuredClone(state[plot]);
        if ("filter" in selection) {
            const fIndex = updatedSelections.filters.findIndex(f => f.stateFilterId === selection.filter.id);
            updatedSelections.filters[fIndex].selection = selection.filter.options;
        } else {
            const plotMetadata = metadata.plotSettingsControl[plot];
            const pIndex = updatedSelections.controls.findIndex(p => p.id === selection.plotSetting.id);
            updatedSelections.controls[pIndex].selection = selection.plotSetting.options;
            const plotSettingOptions: PlotSettingOption[] = updatedSelections.controls.map(c => {
                const plotSetting = plotMetadata.plotSettings.find(ps => ps.id === c.id);
                return plotSetting!.options.find(op => op.id === c.selection[0].id)!;
            });
            const effects: PlotSettingEffect[] = plotMetadata.defaultEffect ? [plotMetadata.defaultEffect] : [];
            plotSettingOptions.forEach(pso => effects.push(pso.effect));
            const filtersInfo = filtersInfoFromEffects(effects, rootState, metadata);
            updatedSelections.filters = filtersInfo;
        }

        const updatePayload = { plot, selections: updatedSelections } as PlotSelectionUpdate;
        await getPlotData(updatePayload, commit, rootState);

        commit({
            type: PlotSelectionsMutations.updatePlotSelection,
            payload: updatePayload
        });
    }
}
