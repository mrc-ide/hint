import {Feature} from "geojson";
import {IndicatorValuesDict, LevelLabel, NumericRange} from "../../../types";
import {ChoroplethIndicatorMetadata, FilterOption} from "../../../generated";
import numeral from 'numeral';
import {PlotData} from "../../../store/plotData/plotData";
import {getColour} from "../utils";
import {initialScaleSettings} from "../../../store/plotState/plotState";


export const getFeaturesByLevel = function(features: Feature[], featureLevels: LevelLabel[]) {
    const result = {} as { [k: number]: Feature[] };
    featureLevels.forEach((level: LevelLabel) => {
        result[level.id] = [];
    });
    features.forEach((feature: Feature) => {
        const adminLevel = parseInt(feature.properties!["area_level"]); //Country (e.g. "MWI") is level 0
        if (result[adminLevel]) {
            result[adminLevel].push(feature);
        }
    });
    return result;
};

export const getVisibleFeatures = function(features: Feature[], selectedLevels: FilterOption[], selectedAreas: FilterOption[]) {
    const levels = selectedLevels.map((l: FilterOption) => parseInt(l.id));
    const areas = selectedAreas.map((a: FilterOption) => a.id);
    return features.filter((feature: Feature) => {
        return feature.properties && levels.includes(feature.properties["area_level"]) && areas.includes(feature.properties["area_id"]);
    });
};

export const roundToContext = function (value: number, context: number[]) {
    //Rounds the value to one more decimal place than is present in the 'context'
    let maxDecPl = 0;
    for (const contextValue of context) {
        const maxFraction = contextValue.toString().split(".");
        const decPl = maxFraction.length > 1 ? maxFraction[1].length : 0;
        maxDecPl = Math.max(maxDecPl, decPl + 1);
    }

    return roundToPlaces(value, maxDecPl);
};

const roundToPlaces = function (value: number, decPl: number) {
    const roundingNum = Math.pow(10, decPl);
    return Math.round(value * roundingNum) / roundingNum;
};

export const formatLegend = function (text: string | number, format: string, scale: number): string {
    text = formatOutput(text, format, scale, null)

    if (typeof (text) === "string" && text.includes(',')) {
        text = text.replace(/,/g, '');
    }
    if (typeof (text) === "string" && !text.includes('%')) {
        text = parseFloat(text)
    }
    if (typeof text == "number") {
        if (text >= 1000 && text < 10000 || text >= 1000000 && text < 10000000) {
            text = numeral(text).format("0.0a")
        } else if (text >= 1000) {
            text = numeral(text).format("0a")
        } else text = text.toString()
    }
    return text
}

export const formatOutput = function (value: number | string, format: string, scale: number | null, accuracy: number | null, roundValue = true) {
    let ans: number

    if (typeof (value) === 'string') {
        ans = parseFloat(value)
    } else ans = value

    if (!format.includes('%') && scale) {
        ans = ans * scale
    }

    if (!format.includes('%') && accuracy && roundValue) {
        /**
         * When accuracy is set to 100 and selected value is less than 200
         * barchart disarranges YAxis. Code below checks if value is greater
         * than 500 before apply 100 scale range. Otherwise, chartJS will
         * automatically use numeric algorithm to calculate scale range.
         * However, if accuracy is less than 100, we simply apply scale range
         * rounding using the given accuracy value.
         */

        if (accuracy > 1) {
            if (ans > 5 * accuracy) {
                ans = Math.round(ans / accuracy) * accuracy
            }
        } else {
            ans = Math.round(ans / accuracy) * accuracy
        }
    }

    if (format) {
        return numeral(ans).format(format)
    } else return ans
};

export const getIndicatorRange = function (data: PlotData,
                                           indicatorMeta: ChoroplethIndicatorMetadata): NumericRange {
    let result = {} as NumericRange;
    for (const row of data) {
        const value = row[indicatorMeta.value_column]
        if (!result.max) {
            result = {min: value, max: value};
        } else {
            result.min = Math.min(result.min, value);
            result.max = Math.max(result.max, value);
        }
    }
    return roundRange({
        min: result ? result.min : 0,
        max: result ? result.max : 0
    });
};

export const roundRange = function (unrounded: NumericRange) {
    //round appropriate to the range magnitude
    let decPl = 0;
    let magnitude = unrounded.max == unrounded.min ? unrounded.min : (unrounded.max - unrounded.min);

    magnitude = magnitude / 100;
    if (magnitude < 1 && magnitude > 0) {
        decPl = Math.trunc(Math.abs(Math.log10(magnitude)));
    }

    return {min: roundToPlaces(unrounded.min, decPl), max: roundToPlaces(unrounded.max, decPl)};
};

export const scaleStepFromMetadata = function (meta: ChoroplethIndicatorMetadata) {
    return (meta.max - meta.min) / 10;
};


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

export const initialiseScaleFromMetadata = function (meta: ChoroplethIndicatorMetadata | undefined) {
    const result = initialScaleSettings();
    if (meta) {
        result.customMin = meta.min;
        result.customMax = meta.max;
    }
    return result;
};


export const tooltipContent = function (feature: Feature, featureIndicators: IndicatorValuesDict,
                                        indicatorMetadata: ChoroplethIndicatorMetadata): string {
    let format = "";
    let scale = 1;
    let accuracy: number | null = null;
    if (indicatorMetadata) {
        format = indicatorMetadata.format;
        scale = indicatorMetadata.scale;
        accuracy = indicatorMetadata.accuracy;
    }

    const area_id = feature.properties && feature.properties["area_id"];
    const area_name = feature.properties && feature.properties["area_name"];

    const values = featureIndicators[area_id];
    const value = values && values!.value;
    const lower_value = values && values!.lower_value;
    const upper_value = values && values!.upper_value;

    const stringVal = (value || value === 0) ? value.toString() : "";
    const stringLower = (lower_value || lower_value === 0) ? lower_value.toString() : "";
    const stringUpper = (upper_value || upper_value === 0) ? upper_value.toString() : "";

    if (stringVal && stringLower) {
        return `<div>
            <strong>${area_name}</strong>
            <br/>${ formatOutput(stringVal, format, scale, accuracy, true)}
            <br/>(${formatOutput(stringLower, format, scale, accuracy, true) + " - " +
            formatOutput(stringUpper, format, scale, accuracy, true)})
        </div>`;
    } else {
        return `<div>
            <strong>${area_name}</strong>
            <br/>${formatOutput(stringVal, format, scale, accuracy, true)}
        </div>`;
    }
}
