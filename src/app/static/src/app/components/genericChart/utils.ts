import {DatasetFilterConfig, Dict, DisplayFilter, GenericChartColumn} from "../../types";
import {FilterOption} from "../../generated";

export const PlotColours = Object.freeze({
    DEFAULT: "rgb(51, 51, 51)",
    LARGE_CHANGE: "rgb(255, 51, 51)",
    MISSING: "rgb(220,220,220)",
    LARGE_CHANGE_MISSING: "rgb(255,214,214)"
});

export const filterData = (
    unfilteredData: Dict<unknown>[],
    filters: DisplayFilter[],
    selectedFilterOptions: Dict<FilterOption[]>) => {
    const includeRow = (row: any) => filters.every(filter =>
        selectedFilterOptions[filter.id] ?
            selectedFilterOptions[filter.id].some(option => option.id === row[filter.column_id]?.toString()) :
            true
    );
    const result =  unfilteredData.filter((row: any) => includeRow(row));
    return result
};

export function genericChartColumnsToFilters(columns: GenericChartColumn[], filterConfig?: DatasetFilterConfig[]): DisplayFilter[] {
    return columns.map((column) => {
        const allowMultiple = !!(filterConfig && filterConfig.find(config => config.id == column.id)?.allowMultiple);
        return {
            id: column.id,
            column_id: column.column_id,
            label: column.label,
            options: column.values,
            allowMultiple
        }
    });
}

export function numeralJsToD3format(numeralJsFormat: string) {
    // Convert hintr metadata format (which are numeralJs style) to d3 format to be used by Plotly
    // We currently support only numeric, large number, and percentage formats, and will return 
    // empty string for any other formats received, for default formatting in Plotly.

    // The first part of this regex (before the |) captures formats with decimal precision and optional percentage
    // The second part captures format with thousands separator for large integers
    const regex = /^0(\.0+)?(%)?$|^0(,0)$/; //This will always return four matches

    const match = numeralJsFormat.match(regex);
    if (match === null) {
        return "";
    }

    if (match[3] !== undefined) {
        return ",";
    }

    const decPl = match[1] == undefined ? 0 : match[1].length - 1;
    const percent = match[2] !== undefined;
    const suffix = percent ? "%" : "f";
    return `.${decPl}${suffix}`;
}
