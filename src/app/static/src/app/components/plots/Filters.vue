<template>
    <div class="mt-3">
        <h4 v-translate="'filters'"></h4>
        <div :id="'filter-' + filter.id" v-for="filter in filters" :key="filter.id" class="form-group">
            <filter-select :value="getSelectedFilterValues(filter.id)"
                           :multiple="filter.allowMultiple"
                           :label="filter.label"
                           :options="filter.options"
                           :disabled="filter.options.length===0"
                           @update:filter-select="onFilterSelect(filter, $event)"></filter-select>
        </div>
    </div>
</template>

<script lang="ts">
    import FilterSelect from "./FilterSelect.vue";
    import {Dict, DisplayFilter} from "../../types";
    import {FilterOption} from "../../generated";
    import { PropType, defineComponent } from "vue";

    export default defineComponent({
        name: "Filters",
        components: {FilterSelect},
        props: {
            filters: {
                type: Array as PropType<DisplayFilter[]>,
                required: true
            },
            selectedFilterOptions: {
                type: Object as PropType<Dict<FilterOption[]>>,
                required: true
            }
        },
        methods: {
            getSelectedFilterValues(filterId: string) {
                return (this.selectedFilterOptions[filterId] || []).map((o: FilterOption) => o.id);
            },
            onFilterSelect(filter: DisplayFilter, selectedOptions: FilterOption[]) {
                const newSelectedFilterOptions = {...this.selectedFilterOptions};
                newSelectedFilterOptions[filter.id] = selectedOptions;

                this.$emit("update:filters", newSelectedFilterOptions);
            },
        }
    });
</script>