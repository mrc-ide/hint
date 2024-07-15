import {IndicatorValuesDict, NumericRange} from "../../../types";
import {ChoroplethIndicatorMetadata} from "../../../generated";
import {getColour} from "../utils";

export const getFeatureData = function (data: any[],
                                        indicatorMeta: ChoroplethIndicatorMetadata,
                                        colourRange: NumericRange): IndicatorValuesDict {

    const result = {} as IndicatorValuesDict;
    for (const row of data) {
        const value = row[indicatorMeta.value_column]
        result[row.area_id] = {
            value: value,
            color: getColour(value, indicatorMeta, colourRange),
            lower_value: row['lower'],
            upper_value: row['upper']
        }
    }

    return result;
};
