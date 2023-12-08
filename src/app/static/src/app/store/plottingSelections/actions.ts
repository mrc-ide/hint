import {ActionContext, ActionTree} from "vuex";
import {PlottingSelectionsMutations} from "./mutations";
import {
    BarchartSelections, BubblePlotSelections, ChoroplethSelections,
    PlottingSelectionsState,
    TableSelections
} from "./plottingSelections";
import {ModelOutputTabs, PayloadWithType} from "../../types";
import {DataExplorationState} from "../dataExploration/dataExploration";
import { CalibrateDataResponse } from "../../generated";
import { RootState } from "../../root";

export interface PlottingSelectionsActions {
    updateBarchartSelections: (store: ActionContext<PlottingSelectionsState, RootState>, payload: PayloadWithType<BarchartSelections>) => void
    updateChoroplethSelections: (store: ActionContext<PlottingSelectionsState, RootState>, payload: PayloadWithType<Partial<ChoroplethSelections>>) => void
    updateBubblePlotSelections: (store: ActionContext<PlottingSelectionsState, RootState>, payload: PayloadWithType<Partial<BubblePlotSelections>>) => void
    updateTableSelections: (store: ActionContext<PlottingSelectionsState, RootState>, payload: PayloadWithType<Partial<TableSelections>>) => void
}

type DataPoint = CalibrateDataResponse["data"][number];
export type FetchResultDataPayload = Partial<{
    [K in keyof DataPoint]: DataPoint[K][]
} & {
    area_level: number[]
} >

export const actions: ActionTree<PlottingSelectionsState, RootState> & PlottingSelectionsActions = {

    async updateBarchartSelections(context, payload) {
        const {commit, dispatch, state, rootState} = context;
        const fetchPayload: FetchResultDataPayload = {};
        const newSelections = {
            ...state.barchart,
            ...payload.payload
        };
        fetchPayload.indicator = [newSelections.indicatorId];
        fetchPayload.age_group = [];
        fetchPayload.area_id = [];
        fetchPayload.area_level = [];
        fetchPayload.calendar_quarter = [];
        fetchPayload.sex = [];
        const filtersMetadata = rootState.modelCalibrate.metadata?.plottingMetadata.barchart.filters;
        if (!filtersMetadata) return;
        for (const filter in newSelections.selectedFilterOptions) {
            const filterId = filtersMetadata.find(f => f.id === filter)!.column_id;
            if (fetchPayload[filterId]) {
                fetchPayload[filterId]!.push(...newSelections.selectedFilterOptions[filter].map(f => f.id));
            }
        }
        const tab = ModelOutputTabs.Bar;
        const resultDataPayload = { payload: fetchPayload, tab };
        await dispatch("modelCalibrate/getFilteredData", resultDataPayload, {root:true});
        commit({type: PlottingSelectionsMutations.updateBarchartSelections, payload: payload.payload});
    },

    async updateChoroplethSelections(context, payload) {
        const {commit, dispatch} = context;
        const indicatorId = payload.payload.indicatorId;
        const tab = ModelOutputTabs.Map;
        const resultDataPayload = { indicatorId, tab };
        if (indicatorId) await dispatch("modelCalibrate/getResultData", resultDataPayload, {root:true});
        commit({type: PlottingSelectionsMutations.updateOutputChoroplethSelections, payload: payload.payload});
    },

    async updateBubblePlotSelections(context, payload) {
        const {commit, dispatch} = context;
        const colourIndicatorId = payload.payload.colorIndicatorId;
        const sizeIndicatorId = payload.payload.sizeIndicatorId;
        const tab = ModelOutputTabs.Bubble;
        const resultDataPayloadColor = { indicatorId: colourIndicatorId, tab };
        const resultDataPayloadSize = { indicatorId: sizeIndicatorId, tab };
        if (colourIndicatorId) await dispatch("modelCalibrate/getResultData", resultDataPayloadColor, {root:true});
        if (sizeIndicatorId) await dispatch("modelCalibrate/getResultData", resultDataPayloadSize, {root:true});
        commit({type: PlottingSelectionsMutations.updateBubblePlotSelections, payload: payload.payload});
    },

    async updateTableSelections(context, payload) {
        const {commit, dispatch} = context;
        const indicatorId = payload.payload.indicator;
        const tab = ModelOutputTabs.Table;
        const resultDataPayload = { indicatorId, tab };
        if (indicatorId) await dispatch("modelCalibrate/getResultData", resultDataPayload, {root:true});
        commit({type: PlottingSelectionsMutations.updateTableSelections, payload: payload.payload});
    }
};
