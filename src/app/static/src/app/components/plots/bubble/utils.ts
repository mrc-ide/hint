import {ChoroplethIndicatorMetadata} from "../../../generated";
import {BubbleIndicatorValues, BubbleIndicatorValuesDict, NumericRange} from "../../../types";
import {formatOutput, getColour} from "../utils";
import {Feature} from "geojson";

export const getRadius = function (value: number, minValue: number, maxValue: number, minRadius: number, maxRadius: number) {
    //if range is a single value, just return max radius as no interpolation possible
    if (minValue == maxValue) {
        return maxRadius;
    }

    //Clip value to range so do not exceed max or min bubble sizes
    value = Math.min(value, maxValue);
    value = Math.max(value, minValue);

    //where is value on a scale of 0-1 between minValue and maxValue
    const scalePoint = (value - minValue) / (maxValue - minValue);

    return Math.sqrt(Math.pow(minRadius, 2) + (scalePoint * (Math.pow(maxRadius, 2) - Math.pow(minRadius, 2))));
};

export const getFeatureData = function (data: any[],
                                        sizeIndicator: ChoroplethIndicatorMetadata,
                                        colourIndicator: ChoroplethIndicatorMetadata,
                                        sizeRange: NumericRange,
                                        colourRange: NumericRange,
                                        minRadius: number,
                                        maxRadius: number): BubbleIndicatorValuesDict {

    const result = {} as BubbleIndicatorValuesDict;
    for (const row of data) {
        const areaId = row.area_id;
        if (!result[areaId]) {
            result[areaId] = {} as BubbleIndicatorValues
        }
        if (row.indicator == colourIndicator.indicator) {
            result[areaId].value = row[colourIndicator.value_column]
            result[areaId].color = getColour(row[colourIndicator.value_column], colourIndicator, colourRange),
            result[areaId].lower_value = row['lower']
            result[areaId].upper_value = row['upper']
        }
        if (row.indicator == sizeIndicator.indicator) {
            result[areaId].sizeValue = row[sizeIndicator.value_column]
            result[areaId].radius = getRadius(row[sizeIndicator.value_column], sizeRange.min, sizeRange.max, minRadius, maxRadius)
            result[areaId].sizeLower = row['lower']
            result[areaId].sizeUpper = row['upper']
        }
    }

    return result;
};


export const tooltipContent = function(feature: Feature,
                                       featureData: BubbleIndicatorValuesDict,
                                       colourIndicator: ChoroplethIndicatorMetadata,
                                       sizeIndicator: ChoroplethIndicatorMetadata) {
    const area_id = feature.properties && feature.properties["area_id"];
    const area_name = feature.properties && feature.properties["area_name"];

    const values = featureData[area_id];
    const colorValue = values && values!.value;
    const {sizeValue, lower_value, upper_value, sizeLower, sizeUpper} = values!;

    const colorIndicatorName = colourIndicator.name;
    const sizeIndicatorName = sizeIndicator.name;
    const { format, scale, accuracy } = colourIndicator;
    const { format: formatS, scale: scaleS, accuracy: accuracyS } = sizeIndicator;

    const stringLower_value = (lower_value || lower_value === 0) ? lower_value.toString() : "";
    const stringUpper_value = (upper_value || upper_value === 0) ? upper_value.toString() : "";
    const stringSizeUpper = (sizeUpper || sizeUpper === 0) ? sizeUpper.toString() : "";
    const stringSizeLower = (sizeLower || sizeLower === 0) ? sizeLower.toString() : "";

    if ((stringLower_value && stringUpper_value) && (stringSizeLower && stringSizeUpper)) {
        return `<div>
                    <strong>${area_name}</strong>
                    <br/>${colorIndicatorName}: ${formatOutput(colorValue, format, scale, accuracy)}
                    <br/>(${formatOutput(stringLower_value, format, scale, accuracy) + " - " +
        formatOutput(stringUpper_value, format, scale, accuracy)})
                    <br/>
                    <br/>${sizeIndicatorName}: ${formatOutput(sizeValue, formatS, scaleS, accuracyS)}
                    <br/>(${formatOutput(stringSizeLower, formatS, scaleS, accuracyS) + " - " +
        formatOutput(stringSizeUpper, formatS, scaleS, accuracyS)})
                </div>`;
    }
    return `<div>
                <strong>${area_name}</strong>
                <br/>${colorIndicatorName}: ${formatOutput(colorValue, format, scale, accuracy)}
                <br/>${sizeIndicatorName}: ${formatOutput(sizeValue, formatS, scaleS, accuracyS)}
            </div>`;
}
