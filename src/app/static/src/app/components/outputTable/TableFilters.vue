<template>
    <div class="form-group">
        <h4 v-translate="'presets'"></h4>
        <single-select :options="presetOptions"
                       :model-value="tableSelections.preset"
                       @update:model-value="changePresetSelection"/>
    </div>
    <div class="form-group">
        <h4 v-translate="'indicator'"></h4>
        <single-select :options="indicatorOptions"
                       :model-value="tableSelections.indicator"
                       @update:model-value="changeIndicatorSelection"/>
    </div>
    <new-filters :filters="filters"
                 :selectedFilterOptions="tableSelections.selectedFilterOptions"
                 @update:filters="changeFilterSelections"></new-filters>
</template>

<script lang="ts">
import { useStore } from "vuex";
import { computed, defineComponent, onMounted } from "vue";
import { RootState } from "../../root";
import { Dict, DisplayFilter } from "../../types";
import { TableSelections } from "../../store/plottingSelections/plottingSelections";
import { CalibrateMetadataResponse, FilterOption } from "../../generated";
import NewFilters from "./NewFilters.vue";
import { SingleSelect } from "@reside-ic/vue-nested-multiselect";

type Preset = CalibrateMetadataResponse["tableMetadata"]["presets"][number];

export default defineComponent({
    components: {
        NewFilters,
        SingleSelect
    },
    setup() {
        const store = useStore<RootState>();
        const tableSelections = computed(() => store.state.plottingSelections.table);
        const presets = computed(() => store.state.modelCalibrate.metadata?.tableMetadata.presets);
        const filters = computed<DisplayFilter[]>(() => store.getters["modelOutput/tableFilters"] || []);

        const presetOptions = computed(() => {
            return presets.value!.map(p => {
                return { id: p.defaults.id, label: p.defaults.label }
            });
        });

        const indicatorOptions = computed(() => {
            const indicators = store.state.modelCalibrate.metadata?.plottingMetadata.choropleth.indicators;
            return indicators?.map(indicator => {
                return { id: indicator.indicator, label: indicator.name };
            }) || [];
        });
        
        const updateTableSelections = async (payload: Partial<TableSelections>) => {
            await store.dispatch(
                `plottingSelections/updateTableSelections`,
                { payload }
            );
        };

        const changeFilterSelections = (selections: Dict<FilterOption[]>) => {
            updateTableSelections({ selectedFilterOptions: selections });
        };

        const changeIndicatorSelection = (indicatorOption: Partial<FilterOption>) => {
            updateTableSelections({ indicator: indicatorOption.id });
        };

        const toFilterOption = (filterId: string, optionId: string) => {
            const filter = filters.value.find(f => f.id === filterId);
            return filter?.options.find(option => option.id === optionId);
        };

        const getCurrentPresetColumnDefaults = (preset: Preset) => {
            const defaultSels = Object.fromEntries(filters.value.map(f => {
                if (f.id === preset.defaults.column.id || f.id === preset.defaults.row.id) {
                    return [f.id, f.options]
                }
                return [f.id, [f.options[0]]]
            }));
            return defaultSels
        };

        const getPresetSelectedOptions = (selectedFilterOptions: Record<string, string[]>) => {
            const presetFilterSelection = {} as Dict<FilterOption[]>
            for (const presetFilter in selectedFilterOptions) {
                const options = selectedFilterOptions[presetFilter];
                const filterOptions = options.map(option => toFilterOption(presetFilter, option)).filter(f => f !== undefined) as FilterOption[];
                presetFilterSelection[presetFilter] = filterOptions;
            }
            return presetFilterSelection;
        };

        const getPresetTableSelections = (presetOption: Partial<FilterOption>): Partial<TableSelections> => {
            const currentPreset = presets.value?.find(p => p.defaults.id === presetOption.id);
            if (!currentPreset) return {};

            const payload = {
                selectedFilterOptions: getCurrentPresetColumnDefaults(currentPreset)
            } as TableSelections;

            if (currentPreset?.defaults.selected_filter_options) {
                
                const newPresetSelections = {
                    ...payload.selectedFilterOptions,
                    ...getPresetSelectedOptions(currentPreset.defaults.selected_filter_options)
                }
                payload.selectedFilterOptions = newPresetSelections;
            }

            return payload;
        };

        const changePresetSelection = async (presetOption: Partial<FilterOption>) => {
            const currentPreset = presets.value?.find(p => p.defaults.id === presetOption.id);
            if (!currentPreset) return;

            await updateTableSelections({ preset: presetOption.id });

            const payload = getPresetTableSelections(presetOption);
            updateTableSelections(payload);
        };

        onMounted(async () => {
            const initialSelections: Partial<TableSelections> = {};

            if (!tableSelections.value.preset) {
                await updateTableSelections({ preset: presets.value![0].defaults.id })

                const defaultFilterSelections = getPresetTableSelections({ id: presets.value![0].defaults.id });
                initialSelections.selectedFilterOptions = defaultFilterSelections.selectedFilterOptions;
            }

            if (!tableSelections.value.indicator) {
                initialSelections.indicator = indicatorOptions.value[0].id;
            }

            updateTableSelections(initialSelections);
        });

        return {
            filters,
            tableSelections,
            changeFilterSelections,
            changePresetSelection,
            presetOptions,
            indicatorOptions,
            changeIndicatorSelection
        }
    },
})

</script>