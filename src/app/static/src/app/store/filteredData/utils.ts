import {DataType, FilteredDataState} from "./filteredData";
import {RootState} from "../../root";
import {IndicatorMetadata, NestedFilterOption} from "../../generated";
import * as d3ScaleChromatic from "d3-scale-chromatic";
import {Dict} from "../../types";

export const sexFilterOptions = [
    {id: "both", label: "both"},
    {id: "female", label: "female"},
    {id: "male", label: "male"}
];

export const roundToContext = function (value: number, context: number) {
    //Rounds the value to one more decimal place than is present in the 'context'
    const maxFraction = context.toString().split(".");
    const maxDecPl = maxFraction.length > 1 ? maxFraction[1].length : 0;
    const roundingNum = Math.pow(10, maxDecPl + 1);

    return Math.round(value * roundingNum) / roundingNum;
};

export const colorFunctionFromName = function (name: string) {
    let result = (d3ScaleChromatic as any)[name];
    if (!result) {
        //This is trying to be defensive against typos in metadata...
        console.warn(`Unknown color function: ${name}`);
        result = d3ScaleChromatic.interpolateWarm;
    }
    return result;
};

export const getColor = (value: number, metadata: IndicatorMetadata) => {
    const max = metadata.max;
    const min = metadata.min;
    const colorFunction = colorFunctionFromName(metadata.colour);

    let rangeNum = (max && (max != min)) ? //Avoid dividing by zero if only one value...
        max - (min || 0) :
        1;

    let colorValue = (value - min) / rangeNum;

    if (metadata.invert_scale) {
        colorValue = 1 - colorValue;
    }

    return colorFunction(colorValue);
};

export const getUnfilteredData = (state: FilteredDataState, rootState: RootState) => {
    const sapState = rootState.surveyAndProgram;
    switch (state.selectedDataType) {
        case (DataType.ANC):
            return sapState.anc ? sapState.anc.data : null;
        case (DataType.Program):
            return sapState.program ? sapState.program.data : null;
        case (DataType.Survey):
            return sapState.survey ? sapState.survey.data : null;
        case (DataType.Output):
            return rootState.modelRun.result ? rootState.modelRun.result.data : null;
        default:
            return null;
    }
};

export const flattenOptions = (filterOptions: NestedFilterOption[]): { [k: string]: NestedFilterOption } => {
    let result = {};
    filterOptions.forEach(r =>
        result = {
            ...result,
            ...flattenOption(r)
        });
    return result;
};

const flattenOption = (filterOption: NestedFilterOption): NestedFilterOption => {
    let result = {} as any;
    result[filterOption.id] = filterOption;
    if (filterOption.children) {
        filterOption.children.forEach(o =>
            result = {
                ...result,
                ...flattenOption(o as NestedFilterOption)
            });

    }
    return result;
};

export const getIdsAndChildrenIds = (ids: string[], lookup: Dict<NestedFilterOption>): Set<string> => {
    let result: string[] = [];
    ids.forEach(r =>
        result = [
            ...result,
            ...getIdAndChildrenIdsAsFlatArray(lookup[r])
        ]);
    return new Set(result);
};

const getIdAndChildrenIdsAsFlatArray = (filterOption: NestedFilterOption): string[] => {
    let result: string[] = [];
    result.push(filterOption.id);
    if (filterOption.children) {
        filterOption.children.forEach(o =>
            result = [
                ...result,
                ...getIdAndChildrenIdsAsFlatArray(o as NestedFilterOption)
            ]);

    }
    return result;
};
