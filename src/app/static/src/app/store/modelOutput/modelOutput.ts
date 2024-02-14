import {Module} from "vuex";
import {RootState} from "../../root";
import {BarchartIndicator, DisplayFilter, Filter, ModelOutputTabs} from "../../types";
import {ChoroplethIndicatorMetadata, FilterOption} from "../../generated";
import {mutations} from "./mutations";
import {actions} from "./actions";
import {rootOptionChildren} from "../../utils";
import {UnadjustedBarchartSelections} from "../plottingSelections/plottingSelections";
import {PlotName, plotNames} from "../plotSelections/plotSelections";

const namespaced = true;

export interface ModelOutputState {
    selectedTab: PlotName,
    loading: {
        [k in ModelOutputTabs]: boolean
    }
}

export const modelOutputGetters = {
    barchartIndicators: (state: ModelOutputState, getters: any, rootState: RootState): BarchartIndicator[] => {
        return rootState.modelCalibrate.metadata!.plottingMetadata.barchart.indicators;
    },
    comparisonPlotIndicators: (state: ModelOutputState, getters: any, rootState: RootState): BarchartIndicator[] => {
        return rootState.modelCalibrate.comparisonPlotResult?.plottingMetadata.barchart.indicators || [];
    },
    comparisonPlotDefaultSelections: (state: ModelOutputState, getters: any, rootState: RootState): UnadjustedBarchartSelections[] => {
        return rootState.modelCalibrate.comparisonPlotResult?.plottingMetadata.barchart.selections || [];
    },
    barchartFilters: (state: ModelOutputState, getters: any, rootState: RootState): Filter[] => {
        return outputPlotFilters(rootState);
    },
    comparisonPlotFilters: (state: ModelOutputState, getters: any, rootState: RootState): Filter[] => {
        return outputPlotFilters(rootState, "comparisonPlotResult");
    },
    bubblePlotIndicators: (state: ModelOutputState, getters: any, rootState: RootState): ChoroplethIndicatorMetadata[] => {
        return rootState.modelCalibrate.metadata!.plottingMetadata.choropleth.indicators;
    },
    bubblePlotFilters: (state: ModelOutputState, getters: any, rootState: RootState): Filter[] => {
        return outputPlotFilters(rootState);
    },
    choroplethIndicators: (state: ModelOutputState, getters: any, rootState: RootState): ChoroplethIndicatorMetadata[] => {
        return rootState.modelCalibrate.metadata!.plottingMetadata.choropleth.indicators;
    },
    choroplethFilters: (state: ModelOutputState, getters: any, rootState: RootState, rootGetters: any): DisplayFilter[] => {
        const outputFilters = outputPlotFilters(rootState) as Filter[];
        const areaId = "area";
        return outputFilters.map(f => {
            return {
                ...f,
                allowMultiple: f.id == areaId,
                options: f.id == areaId ? rootOptionChildren(f.options) : f.options
            }
        });
    },
    tableFilters: (state: ModelOutputState, getters: any, rootState: RootState, rootGetters: any): DisplayFilter[] => {
        const outputFilters = outputPlotFilters(rootState, "table") as DisplayFilter[];
        const currentPresetMetadata = getPresetMetadata(rootState);
        if (currentPresetMetadata) {
            return outputFilters.map(f => {
                return {
                    ...f,
                    allowMultiple: f.column_id === currentPresetMetadata.defaults.row.id || f.column_id === currentPresetMetadata.defaults.column.id
                }
            });
        } else {
            return []
        }
    },
    countryAreaFilterOption: (state: ModelOutputState, getters: any, rootState: RootState, rootGetters: any): FilterOption => {
        const outputFilters = outputPlotFilters(rootState) as Filter[];
        return outputFilters[0].options[0]
    }
};

const getPresetMetadata = (rootState: RootState) => {
    const currentPreset = rootState.plottingSelections.table.preset;
    const presetMetadata = rootState.modelCalibrate.metadata?.tableMetadata.presets;
    const currentPresetMetadata = presetMetadata?.find((p: any) => p.defaults.id === currentPreset);
    if (currentPreset && presetMetadata && currentPresetMetadata) {
        return currentPresetMetadata;
    }
    return null;
};

const outputPlotFilters = (rootState: RootState, resultName: "metadata" | "comparisonPlotResult" | "table" = "metadata") => {
    let filters: any[];
    if (resultName === "table") {
        const currentPresetMetadata = getPresetMetadata(rootState);
        if (currentPresetMetadata) {
            filters = [...(currentPresetMetadata?.filters || [])];
        } else {
            filters = [];
        }
    } else {
        filters = [...(rootState.modelCalibrate[resultName]?.plottingMetadata?.barchart.filters || [])];
    }
    const area = filters.find((f: any) => f.id == "area");
    if (area && area.use_shape_regions) {
        const regions: FilterOption[] = rootState.baseline.shape!.filters!.regions ?
            [rootState.baseline.shape!.filters!.regions] : [];

        //remove old, frozen area filter, add new one with regions from shape
        filters = [
            {...area, options: regions},
            ...filters.filter((f: any) => f.id != "area")
        ];
    }

    return [
        ...filters
    ];
};

export const initialModelOutputState = (): ModelOutputState => {
    return {
        selectedTab: plotNames[0],
        loading: {
            [ModelOutputTabs.Map]: false,
            [ModelOutputTabs.Bar]: false,
            [ModelOutputTabs.Comparison]: false,
            [ModelOutputTabs.Table]: false,
            [ModelOutputTabs.Bubble]: false
        }
    }
};

export const modelOutput = (existingState: Partial<RootState> | null): Module<ModelOutputState, RootState> => {
    return {
        namespaced,
        state: {...initialModelOutputState(), ...existingState && existingState.modelOutput},
        getters: modelOutputGetters,
        mutations,
        actions
    };
};
