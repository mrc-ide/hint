import { OutputPlotName, PlotDataType, PlotName, plotNameToDataType } from "./plotSelections";
import { PlotSelectionUpdate, PlotSelectionsMutations } from "./mutations";
import { RootState } from "../../root";
import { PlotMetadataFrame } from "../metadata/metadata";
import { Commit } from "vuex";
import {
    FilterOption,
    FilterTypes,
    PlotSettingEffect,
    PlotSettingOption,
} from "../../generated";
import {
    getCalibrateFilteredDataset,
    getComparisonFilteredDataset,
    getInputChoroplethFilteredData,
    getOutputFilteredData,
    getTimeSeriesFilteredDataset
} from "../plotData/filter";

export const filtersAfterUseShapeRegions = (filterTypes: FilterTypes[], rootState: RootState) => {
    const filters = [...filterTypes];
    const area = filters.find(f => f.id == "area");
    if (area && area.use_shape_regions) {
        const regions: FilterOption[] = rootState.baseline.shape!.filters!.regions ?
            [rootState.baseline.shape!.filters!.regions] : [];

        const index = filters.findIndex(f => f.id === "area");
        const {use_shape_regions: _, ...areaFilterConfig} = area;
        filters[index] = {...areaFilterConfig, options: regions};
    }
    return filters;
}

type NestedFilterOption = {
    id: string
    label: string,
    children?: NestedFilterOption[]
}

const getFullNestedFilters = (filterOptions: NestedFilterOption[]) => {
    const fullFilterOptions: NestedFilterOption[] = [];
    const q = [...filterOptions];
    while (q.length !== 0) {
        const currentOption = q.pop()!;
        fullFilterOptions.push(currentOption);
        if (currentOption.children && currentOption.children.length > 0) {
            currentOption.children.forEach(op => q.push(op));
        }
    }
    return fullFilterOptions;
};

export const filtersInfoFromEffects = (
    effects: PlotSettingEffect[],
    rootState: RootState,
    metadata: PlotMetadataFrame
) => {
    const filterTypes = filtersAfterUseShapeRegions(metadata.filterTypes, rootState);
    let filterRefs: PlotSettingEffect["setFilters"] = [];
    let multiFilters: string[] = [];
    let filterValues: Record<string, string[]> = {};
    let hiddenFilters: string[] = [];

    effects.forEach(effect => {
        // track which effects need to occur
        if (effect.setFilters) {
            filterRefs = effect.setFilters;
        }
        if (effect.setMultiple) {
            // remove dupes just in case
            multiFilters = [...new Set([...multiFilters, ...effect.setMultiple])];
        }
        if (effect.setFilterValues) {
            filterValues = {...filterValues, ...effect.setFilterValues};
        }
        if (effect.setHidden) {
            hiddenFilters = [...new Set([...hiddenFilters, ...effect.setHidden])];
        }
    });

    return filterRefs.map(f => {
        const filter = filterTypes.find(filterType => filterType.id === f.filterId)!;
        const isMultiple = multiFilters.includes(f.stateFilterId);
        const isHidden = hiddenFilters.includes(f.stateFilterId);
        let selection: FilterOption[];

        if (f.stateFilterId in filterValues) {
            // we have specified fixed values
            const optionIds = filterValues[f.stateFilterId];
            const filterOptions = [];
            const maxLength = isMultiple ? optionIds.length : 1;
            for (let i = 0; i < filter.options.length; i++) {
                if (optionIds.includes(filter.options[i].id)) {
                    filterOptions.push(filter.options[i]);
                }
                if (filterOptions.length === maxLength) {
                    break;
                }
            }
            selection = filterOptions;
        } else {
            selection = isMultiple ?
                getFullNestedFilters(filter.options) :
                [filter.options[0]];
        }
        return {
            ...f,
            multiple: isMultiple,
            selection,
            hidden: isHidden
        }
    }) as PlotSelectionUpdate["selections"]["filters"];
}

export const getPlotData = async (payload: PlotSelectionUpdate, commit: Commit, rootState: RootState) => {
    const name = payload.plot;
    const plotDataType = plotNameToDataType[name];
    if (plotDataType === PlotDataType.Output) {
        await getOutputFilteredData(name as OutputPlotName, payload.selections.filters, { commit, rootState });
    } else if (plotDataType === PlotDataType.TimeSeries) {
        await getTimeSeriesFilteredDataset(payload, commit, rootState);
    } else if (plotDataType === PlotDataType.Calibrate) {
        await getCalibrateFilteredDataset(payload, commit, rootState);
    } else if (plotDataType === PlotDataType.Comparison) {
        await getComparisonFilteredDataset(payload, commit, rootState);
    } else if (plotDataType === PlotDataType.InputChoropleth) {
        await getInputChoroplethFilteredData(payload, commit, rootState);
    }
}

export const commitPlotDefaultSelections = async (
    metadata: PlotMetadataFrame,
    commit: Commit,
    rootState: RootState
) => {
    const plotControl = metadata.plotSettingsControl;
    for (const plotName in plotControl) {
        const name = plotName as PlotName;
        const payload: PlotSelectionUpdate = {
            plot: name,
            selections: { controls: [], filters: [] }
        };
        const control = plotControl[name];

        const effects = control.defaultEffect ? [control.defaultEffect] : [];
        const selectedSettingOptions: PlotSelectionUpdate["selections"]["controls"] = [];
        control.plotSettings.forEach(setting => {
            const defaultOption: PlotSettingOption = setting.options.find(op => op.id === setting.value) || setting.options[0];
            effects.push(defaultOption.effect);
            selectedSettingOptions.push({
                id: setting.id,
                label: setting.label,
                selection: [{
                    id: defaultOption.id,
                    label: defaultOption.label
                }]
            });
        });
        payload.selections.controls = selectedSettingOptions

        const filtersInfo = filtersInfoFromEffects(effects, rootState, metadata);
        payload.selections.filters = filtersInfo;

        await getPlotData(payload, commit, rootState);

        commit(
            `plotSelections/${PlotSelectionsMutations.updatePlotSelection}`,
            { payload }, { root: true }
        );
    }
};
