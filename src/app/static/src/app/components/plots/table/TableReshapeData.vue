<template>
    <table-display :plot="plot"
                   :data="reshapedData"
                   :table-metadata="tableMetadata"
                   :header-name="tableLabelHeader"/>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from 'vue';
import TableDisplay from './TableDisplay.vue';
import { useStore } from 'vuex';
import { RootState } from '../../../root';
import { FilterOption, TableMetadata } from '../../../generated';
import { FilterSelection, PlotName } from "../../../store/plotSelections/plotSelections";

export default defineComponent({
    components: {
        TableDisplay
    },
    props: {
        data: {
            type: Object,
            required: true
        },
        plot: {
            type: String as PropType<PlotName>,
            required: true
        }
    },
    setup(props) {
        const store = useStore<RootState>();
        const selectedPreset = computed<FilterOption>(() => {
            return store.getters["plotSelections/controlSelectionFromId"](props.plot, "presets");
        });

        const tableMetadata = computed<TableMetadata | undefined>(() => {
            return store.getters["modelCalibrate/tableMetadata"](props.plot, selectedPreset.value.id);
        });

        const reshapedData = computed(() => {
            const data = props.data;
            if (tableMetadata.value && data) {
                const tableData: any[] = [];
                const rowId = tableMetadata.value.row[0];
                const rowKey = store.getters["modelCalibrate/filterIdToColumnId"](props.plot, rowId);
                const rowOptions: FilterOption[] = store.getters["plotSelections/filterSelectionFromId"](props.plot, rowId);
                const columnKey = tableMetadata.value.column[0];
                for (let i = 0; i < data.length; i++) {
                    const currentRow = data[i];
                    const rowVal = currentRow[rowKey];
                    const rowLabel = rowOptions.find(op => op.id === rowVal)?.label;
                    const index = tableData.findIndex(d => d.label === rowLabel);
                    if (index === -1) {
                        tableData.push({
                            "label": rowLabel,
                            [`mean_${currentRow[columnKey]}`]: currentRow.mean,
                            [`upper_${currentRow[columnKey]}`]: currentRow.upper,
                            [`lower_${currentRow[columnKey]}`]: currentRow.lower,
                        })
                    } else {
                        tableData[index][`mean_${currentRow[columnKey]}`] = currentRow.mean;
                        tableData[index][`upper_${currentRow[columnKey]}`] = currentRow.upper;
                        tableData[index][`lower_${currentRow[columnKey]}`] = currentRow.lower;
                    }
                }
                return tableData;
            }
            return [];
        });

        const filterSelections = computed(() => store.state.plotSelections[props.plot].filters);

        const tableLabelHeader = computed(() => {
            const rowFilter = filterSelections.value.find((f: FilterSelection) => f.filterId == tableMetadata.value?.row[0]);
            if (!rowFilter) {
                return "";
            } else {
                return rowFilter.label;
            }
        });

        return {
            reshapedData,
            tableMetadata,
            tableLabelHeader
        }
    },
});
</script>
