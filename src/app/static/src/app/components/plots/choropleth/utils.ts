import {ChoroplethIndicatorMetadata, FilterOption} from "../../../generated";
import {Dict, Filter, IndicatorValuesDict, NumericRange} from "../../../types";
import {getColor, iterateDataValues} from "../utils";
import {initialColourScaleSettings} from "../../../store/plottingSelections/plottingSelections";

export const getFeatureIndicator = function (data: any[],
                                             selectedAreaIds: string[],
                                             indicatorMeta: ChoroplethIndicatorMetadata,
                                             colourRange: NumericRange,
                                             filters: Filter[],
                                             selectedFilterValues: Dict<FilterOption[]>): IndicatorValuesDict {

    const result = {} as IndicatorValuesDict;
    iterateDataValues(data, [indicatorMeta], selectedAreaIds, filters, selectedFilterValues,
        (areaId: string, indicatorMeta: ChoroplethIndicatorMetadata, value: number) => {
            result[areaId] = {
                value: value,
                color: getColor(value, indicatorMeta, colourRange)
            }
        });

    return result;
};

export const initialiseColourScaleFromMetadata = function (meta: ChoroplethIndicatorMetadata) {
    const result = initialColourScaleSettings();
    if (meta) {
        result.customMin = meta.min;
        result.customMax = meta.max;
    }
    return result;
};