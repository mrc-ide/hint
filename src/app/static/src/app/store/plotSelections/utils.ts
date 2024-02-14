import { Commit } from "vuex";
import { CalibrateMetadataResponse, FilterOption, FilterTypes, PlotSettingOption } from "../../generated";
import { PlotName } from "./plotSelections";
import { PlotSelectionUpdate, PlotSelectionsMutations } from "./mutations";
import { RootState } from "../../root";

export const filtersAfterUseShapeRegions = (filterTypes: FilterTypes[], rootState: RootState) => {
    const filters = [...filterTypes];
    const area = filters.find(f => f.id == "area");
    if (area && area.use_shape_regions) {
        const regions: FilterOption[] = rootState.baseline.shape!.filters!.regions ?
            [rootState.baseline.shape!.filters!.regions] : [];

        const index = filters.findIndex(f => f.id === "area");
        const {use_shape_regions, ...areaFilterConfig} = area;
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

export const filtersInfoFromPlotSettings = (
    settings: PlotSettingOption[],
    plotName: PlotName,
    rootState: RootState
) => {
    const metadata = rootState.modelCalibrate.metadata!;
    const filterTypes = filtersAfterUseShapeRegions(metadata.filterTypes, rootState);
    let filterRefs = metadata.plotSettingsControl[plotName].defaultFilterTypes;
    let multiFilters: string[] = [];
    let filterValues: Record<string, string[]> = {};

    settings.forEach(setting => {
        // track which effects need to occur
        const effect = setting.effect;
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
    });

    const filters: PlotSelectionUpdate["selections"]["filters"] = filterRefs!.map(f => {
        const filter = filterTypes.find(filterType => filterType.id === f.filterId)!;
        const isMultiple = multiFilters.includes(f.stateFilterId);
        let selection: FilterOption[];

        if (f.stateFilterId in filterValues) {
            // we have specified fixed values
            const optionIds = filterValues[f.stateFilterId];
            const filterOptions = [];
            for (let i = 0; i < filter.options.length; i++) {
                if (optionIds.includes(filter.options[i].id)) {
                    filterOptions.push(filter.options[i]);
                }
                if (filterOptions.length === optionIds.length) {
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
            selection
        }
    });
    return filters;
}

export const commitPlotDefaultSelections = (
    metadata: CalibrateMetadataResponse,
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
        const defaultSettingOptions: PlotSettingOption[] = [];
        control.plotSettings.forEach(setting => {
            const defaultOption = setting.options[0];
            defaultSettingOptions.push(defaultOption);
            if (setting.id !== "default") {
                payload.selections.controls.push({
                    id: setting.id,
                    label: setting.label,
                    selection: [{ id: defaultOption.id, label: defaultOption.label }]
                });
            }
        });

        const filtersInfo = filtersInfoFromPlotSettings(defaultSettingOptions, name, rootState);
        payload.selections.filters = filtersInfo;

        commit(
            `plotSelections/${PlotSelectionsMutations.updatePlotSelection}`,
            { payload }, { root: true }
        );
    }
};
