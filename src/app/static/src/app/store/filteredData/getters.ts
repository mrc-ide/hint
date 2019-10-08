import {RootState} from "../../root";
import {DataType, FilteredDataState, SelectedChoroplethFilters, SelectedFilters} from "./filteredData";
import {IndicatorRange, Indicators, IndicatorValues} from "../../types";
//import {interpolateCool, interpolateWarm} from "d3-scale-chromatic";
import * as d3ScaleChromatic from "d3-scale-chromatic";
import {FilterOption, IndicatorMetadata, NestedFilterOption} from "../../generated";

const sexFilterOptions = [
    {id: "both", name: "both"},
    {id: "female", name: "female"},
    {id: "male", name: "male"}
];

export const getters = {
    selectedDataFilterOptions: (state: FilteredDataState, getters: any, rootState: RootState, rootGetters: any) => {
        const sapState = rootState.surveyAndProgram;
        const regions = getters.regionOptions;
        switch(state.selectedDataType){
            case (DataType.ANC):
                return sapState.anc ?
                    {
                        ...sapState.anc.filters,
                        regions,
                        sex: undefined,
                        surveys: undefined,
                    } : null;
            case (DataType.Program):
                return sapState.program ?
                    {
                        ...sapState.program.filters,
                        regions,
                        sex: sexFilterOptions,
                        surveys: undefined
                    } : null;
            case (DataType.Survey):
                return sapState.survey ?
                    {
                        ...sapState.survey.filters,
                        regions,
                        sex: sexFilterOptions
                    } : null;
            case (DataType.Output):
                return rootState.modelRun.result ?
                    {
                        ...rootState.modelRun.result.filters,
                        regions,
                        sex: sexFilterOptions,
                        surveys: undefined
                    }: null;

            default:
                return null;
        }
    },
    regionOptions: (state: FilteredDataState, getters: any, rootState: RootState, rootGetters: any) => {
        const shape = rootState.baseline && rootState.baseline.shape ? rootState.baseline.shape : null;
        //We're skipping the top level, country region as it doesn't really contribute to the filtering
        return shape && shape.filters &&
                        shape.filters.regions &&
                        (shape.filters.regions as any).options ? (shape.filters.regions as any).options : null;
    },
   /* colorFunctions: function(state: FilteredDataState, getters: any, rootState: RootState, rootGetters: any) {


        return {
          art: {func: d3ScaleChromatic.interpolateWarm, invertScale: true},
          prev: {func: d3ScaleChromatic.interpolateCool, invertScale: false}
        }
    },*/
    regionIndicators: function(state: FilteredDataState, getters: any, rootState: RootState, rootGetters: any) {
        const data = getUnfilteredData(state, rootState);
        if (!data || (state.selectedDataType == null)) {
            return {};
        }

        const result = {} as { [k: string]: Indicators };

        const flattenedRegions = getters.flattenedSelectedRegionFilters;

        for(const d of data) {
            const row = d as any;

            if (!includeRowForSelectedChoroplethFilters(row,
                state.selectedDataType,
                state.selectedChoroplethFilters,
                flattenedRegions)) {
                continue;
            }

            const areaId = row.area_id;

            //TODO: This will change when we have a metadata endpoint telling us which column to use as value for each
            //input data type and indicator
            //We will also have to deal will potential multiple values per row
            let indicator: string = "";
            let valueColumn: string = "";
            switch (state.selectedDataType) {
                case (DataType.Survey):
                    indicator = row["indicator"];
                    valueColumn = "est";
                    break;
                case (DataType.Program):
                    indicator = "artcov";
                    valueColumn = "current_art";
                    break;
                case (DataType.ANC):
                    //TODO: once using metadata, we need to allow multiple values per row, as in the case on ANC data
                    //which contains both prevalence and art data in each row (wide format), unlike survey, which
                    //is int long format, with an indicator column to show which indicator the value each row provides
                    indicator = "prev";
                    valueColumn = "prevalence";
                    break;
                case (DataType.Output):
                    //TODO: output data doesn't currently conform to plotting metadata - use that when it does
                    indicator = "prev";
                    valueColumn = "mean";
                    break;
            }

            const value = row[valueColumn];

            if (!result[areaId]) {
                result[areaId] = {};
            }

            const indicators = result[areaId];
            switch (indicator) {
                case("prev"):
                    indicators.prev = {value: value, color: ""};

                    break;
                case("artcov"):
                    indicators.art = {value: value, color: ""};

                    break;

                //TODO: Also expect recent and vls (viral load suppression) values for survey, need to add these as options
            }
        }
        //Now add the colours - we do this in a second step now, because we are calculating the range as we add the values
        //but once the range comes from the API, we can calculate the colours as we populate the values
        for (const region in result) {
            const indicators = result[region];
            if (indicators.art) {
                indicators.art.color = getColor(indicators.art, getters.choroplethMetadata.art);
            }
            if (indicators.prev) {
                indicators.prev.color = getColor(indicators.prev, getters.choroplethMetadata.prev);
            }
        }
        return result;
    },
    flattenedRegionOptions: function(state: FilteredDataState, getters: any, rootState: RootState, rootGetters: any) {
        const options = getters.regionOptions ? getters.regionOptions : [];
        return flattenOptions(options);
    },
    flattenedSelectedRegionFilters: function(state: FilteredDataState, getters: any, rootState: RootState, rootGetters: any) {
        const selectedRegions = state.selectedChoroplethFilters.regions ? state.selectedChoroplethFilters.regions : [];
        return flattenOptions(selectedRegions);
    },
    choroplethMetadata:  function(state: FilteredDataState, getters: any, rootState: RootState, rootGetters: any) {
        //TODO: do not hardcode to art and prev, but take indicators from metadata too
        const metadata = rootState.metadata.plottingMetadata!!;
        switch(state.selectedDataType) {
            case (DataType.ANC):
                const anc = metadata.anc.choropleth!!.indicators!!.prevalence!!;
                return {
                    prev: anc
                };
            case (DataType.Program):
                const prog = metadata.programme.choropleth!!.indicators!!.current_art!!;
                return  {
                    art: prog
                };
            case (DataType.Survey):
                const indicators = metadata.survey.choropleth!!.indicators!!;
                return {
                    prev: indicators.prevalence!!,
                    art: indicators.art_coverage!!
                };
            case (DataType.Output):
                const output = metadata.output.choropleth!!.indicators!!.prevalence!!;
                return {
                    prev: output
                };
            default:
                return null;
        }
    }
};

const flattenOptions = (filterOptions: NestedFilterOption[]) => {
    let result = {};
    filterOptions.forEach(r =>
        result = {
            ...result,
            ...flattenOption(r)
        });
    return result;
};

const flattenOption = (filterOption: NestedFilterOption) => {
    let result = {} as any;
    result[filterOption.id] = filterOption;
    if (filterOption.options) {
        filterOption.options.forEach(o =>
            result = {
                ...result,
                ...flattenOption(o as NestedFilterOption)
            });

    }
    return result;
};

export const getColor = (data: IndicatorValues, indicatorMetadata: IndicatorMetadata) => {
    const colorFunction = eval(`d3ScaleChromatic.${indicatorMetadata.colour}`);
    //TODO: invert scale
    const min = indicatorMetadata.min;
    const max = indicatorMetadata.max;
    let rangeNum = (max  && (max != min)) ? //Avoid dividing by zero if only one value...
        max - (min || 0) :
        1;

    const colorValue = data!.value / rangeNum;

    return colorFunction(colorValue);
};

export const getUnfilteredData = (state: FilteredDataState, rootState: RootState) => {
    const sapState = rootState.surveyAndProgram;
    switch(state.selectedDataType){
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

const includeRowForSelectedChoroplethFilters = (row: any,
                                                dataType: DataType,
                                                selectedFilters: SelectedChoroplethFilters,
                                                flattenedRegionFilters: object) => {

    if (dataType != DataType.ANC && row.sex != selectedFilters.sex!.id) {
        return false;
    }

    if (row.age_group_id != selectedFilters.age!.id) {
        return false;
    }

    if (dataType == DataType.Survey && row.survey_id != selectedFilters.survey!.id) {
        return false;
    }

    //TODO: deal with all indicators in output
    if (dataType == DataType.Output && row.indicator_id != 2) { //prevalence
        return false;
    }

    const flattenedRegionIds = Object.keys(flattenedRegionFilters);
    if (flattenedRegionIds.length && flattenedRegionIds.indexOf(row.area_id) < 0) {
        return false
    }

    return true;
};
