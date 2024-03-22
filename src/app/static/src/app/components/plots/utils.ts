import {NumericRange} from "../../types";
import {ChoroplethIndicatorMetadata} from "../../generated";
import * as d3ScaleChromatic from "d3-scale-chromatic";
import {ScaleSettings, ScaleType} from "../../store/plotState/plotState";
import {formatLegend, getIndicatorRange, roundToContext} from "./choropleth/utils";
import {PlotData} from "../../store/plotData/plotData";

export const getColourRange = (indicatorMetadata: ChoroplethIndicatorMetadata, scaleSettings: ScaleSettings, plotData: PlotData): NumericRange => {
    if (!indicatorMetadata) {
        return {max: 1, min: 0};
    }
    switch (scaleSettings.type) {
        case ScaleType.DynamicFiltered:
            return getIndicatorRange(plotData, indicatorMetadata);
        case ScaleType.Custom:
            return {
                min: scaleSettings.customMin,
                max: scaleSettings.customMax
            };
        case ScaleType.Default:
        default:
            return {max: indicatorMetadata.max, min: indicatorMetadata.min}
    }
}


export const getScaleLevels = (indicatorMetadata: ChoroplethIndicatorMetadata, colourRange: NumericRange) => {
    if (!indicatorMetadata) {
        return [];
    }
    const { format, scale, colour, invert_scale: invertScale } = indicatorMetadata;
    const { min, max } = colourRange;
    const colourFunction = colourFunctionFromName(colour);
    const step = (max - min) / 5;
    const indexes = max == min ? [0] : [5, 4, 3, 2, 1, 0];
    return indexes.map((i) => {
        let val: any = min + (i * step);
        val = roundToContext(val, [min, max]);
        let valAsProportion = (max != min) ? (val - min) / (max - min) : 0;
        if (invertScale) {
            valAsProportion = 1 - valAsProportion;
        }
        val = formatLegend(val, format, scale)
        return {
            val, style: {background: colourFunction(valAsProportion)}
        }
    });
};

export const getColour = (value: number,
                         metadata: ChoroplethIndicatorMetadata,
                         colourRange: NumericRange) => {

    const min = colourRange.min;
    const max = colourRange.max;

    const colourFunction = colourFunctionFromName(metadata.colour);

    const rangeNum = ((max !== null) && (max != min)) ? //Avoid dividing by zero if only one value...
        max - (min || 0) :
        1;

    let colorValue = (value - min) / rangeNum;
    if (colorValue > 1) {
        colorValue = 1;
    }
    if (colorValue < 0) {
        colorValue = 0;
    }

    if (metadata.invert_scale) {
        colorValue = 1 - colorValue;
    }

    return colourFunction(colorValue);
};


export const colourFunctionFromName = function (name: string) {
    let result = (d3ScaleChromatic as any)[name];
    if (!result) {
        //This is trying to be defensive against typos in metadata...
        console.warn(`Unknown color function: ${name}`);
        result = d3ScaleChromatic.interpolateWarm;
    }
    return result;
};
