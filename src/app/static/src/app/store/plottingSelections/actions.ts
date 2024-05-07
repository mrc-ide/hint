import {ActionContext, ActionTree} from "vuex";
import {PlottingSelectionsMutations} from "./mutations";
import {
    BarchartSelections, BubblePlotSelections, ChoroplethSelections,
    PlottingSelectionsState,
    TableSelections
} from "./plottingSelections";
import { Dict, Filter, ModelOutputTabs, PayloadWithType } from "../../types";
import { CalibrateDataResponse } from "../../generated";
import { RootState } from "../../root";

export interface PlottingSelectionsActions {
    updateBarchartSelections: (store: ActionContext<PlottingSelectionsState, RootState>, payload: PayloadWithType<BarchartSelections>) => void
    updateChoroplethSelections: (store: ActionContext<PlottingSelectionsState, RootState>, payload: PayloadWithType<ChoroplethSelections>) => void
    updateBubblePlotSelections: (store: ActionContext<PlottingSelectionsState, RootState>, payload: PayloadWithType<BubblePlotSelections>) => void
    updateTableSelections: (store: ActionContext<PlottingSelectionsState, RootState>, payload: PayloadWithType<TableSelections>) => void
}

type DataPoint = CalibrateDataResponse["data"][number];
export type FetchResultDataPayload = Partial<{
    [K in keyof DataPoint]: DataPoint[K][]
} & { area_level: number[] }>

export type PayloadFilterOption = {
    id: string | number,
    label?: string
}

const buildFetchPayload = (filterSelections: Dict<PayloadFilterOption[]>, filters: Filter[]) => {
    const baseFetchPayload: FetchResultDataPayload = {
        indicator: [],
        calendar_quarter: [],
        age_group: [],
        sex: [],
        area_id: [],
        area_level: []
    };
    for (const filter in filterSelections) {
        const filterOption = filters.find(f => f.id === filter);
        if (filterOption) {
            const filterId = filterOption.column_id;
            if (filterId in baseFetchPayload) {
                baseFetchPayload[filterId] = filterSelections[filterOption.id]?.map(f => f.id) || [];
            }
        }
    }
    // temp line below because indicator is not in our filters metadata yet
    baseFetchPayload.indicator = filterSelections.indicator.map(f => f.id) as string[];
    return baseFetchPayload;
};

const getFullFilters = (rootState: RootState, getters: any) => {
    // has area, quarter, sex, age | still need area_level and indicators
    const allFilters: Filter[] = [...getters["modelOutput/barchartFilters"]] || [];

    const indicatorOptions = rootState.modelCalibrate.metadata!.plottingMetadata.barchart.indicators.map(i =>  {
        return {id: i.indicator, label: ""}
    });
    const indicatorFilter: Filter = {
        id: "indicator",
        label: "",
        column_id: "indicator",
        options: indicatorOptions
    }
    allFilters.push(indicatorFilter);

    const featureLevels = rootState.baseline.shape?.filters.level_labels || [];
    const areaLevelOptions = featureLevels.filter(l => l.display).map(l => {
        return {id: `${l.id}`, label: ""}
    });
    const areaLevelFilter: Filter = {
        id: "area_level",
        label: "",
        column_id: "area_level",
        options: areaLevelOptions
    };
    allFilters.push(areaLevelFilter);

    return allFilters;
};

export const getData = async (
    context: ActionContext<PlottingSelectionsState, RootState>,
    filterSelections: Dict<PayloadFilterOption[]>,
    tab: ModelOutputTabs,
) => {
    const { rootState, rootGetters, dispatch } = context;
    const fullFilters = getFullFilters(rootState as any, rootGetters);
    const resultDataPayload = { payload: buildFetchPayload(filterSelections, fullFilters), tab };
    await dispatch("modelCalibrate/getResultData", resultDataPayload, { root:true });
}

export const actions: ActionTree<PlottingSelectionsState, RootState> & PlottingSelectionsActions = {

    async updateBarchartSelections(context, payload) {
        const { state, commit } = context;
        const filterSelections: Dict<PayloadFilterOption[]> = {
            indicator: [{id: payload.payload?.indicatorId || state.barchart.indicatorId}],
            ...state.barchart.selectedFilterOptions,
            ...payload.payload?.selectedFilterOptions
        };
        await getData(context, filterSelections, ModelOutputTabs.Bar);
        commit({type: PlottingSelectionsMutations.updateBarchartSelections, payload: payload.payload});
    },

    async updateChoroplethSelections(context, payload) {
        const { state, commit } = context;
        const filterSelections: Dict<PayloadFilterOption[]> = {
            indicator: [{id: payload.payload?.indicatorId || state.outputChoropleth.indicatorId}],
            area_level: [{id: payload.payload?.detail ?? state.outputChoropleth.detail}],
            ...state.outputChoropleth.selectedFilterOptions,
            ...payload.payload?.selectedFilterOptions,
        };
        await getData(context, filterSelections, ModelOutputTabs.Map);
        commit({type: PlottingSelectionsMutations.updateOutputChoroplethSelections, payload: payload.payload});
    },

    async updateBubblePlotSelections(context, payload) {
        const { state, commit } = context;
        const filterSelections: Dict<PayloadFilterOption[]> = {
            indicator: [
                {id: payload.payload?.colorIndicatorId || state.bubble.colorIndicatorId},
                {id: payload.payload?.sizeIndicatorId || state.bubble.sizeIndicatorId}
            ],
            area_level: [{id: payload.payload?.detail ?? state.bubble.detail}],
            ...state.bubble.selectedFilterOptions,
            ...payload.payload?.selectedFilterOptions
        };
        await getData(context, filterSelections, ModelOutputTabs.Bubble);
        commit({type: PlottingSelectionsMutations.updateBubblePlotSelections, payload: payload.payload});
    },

    async updateTableSelections(context, payload) {
        const { state, commit } = context;
        const filterSelections: Dict<PayloadFilterOption[]> = {
            indicator: [{id: payload.payload?.indicator || state.table.indicator}],
            ...state.table.selectedFilterOptions,
            ...payload.payload?.selectedFilterOptions
        };
        await getData(context, filterSelections, ModelOutputTabs.Table);
        commit({type: PlottingSelectionsMutations.updateTableSelections, payload: payload.payload});
    }
};
