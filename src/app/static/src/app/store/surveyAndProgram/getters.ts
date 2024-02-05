import i18next from "i18next";
import {SurveyAndProgramState, DataType} from "./surveyAndProgram";
import {DisplayFilter} from "../../types";
import {FilterOption} from "../../generated";
import {rootOptionChildren} from "../../utils";
import {Language} from "../translations/locales";
import {DataExplorationState} from "../dataExploration/dataExploration";

function response(state: SurveyAndProgramState) {
    switch (state.selectedDataType) {
        case (DataType.ANC):
            return state.anc;
        case (DataType.Program):
            return state.program;
        case (DataType.Survey):
            return state.survey;
        default:
            return null;
    }
}

const sexFilterOptions = (lng: Language) => [
    {id: "both", label: i18next.t("both", {lng})},
    {id: "female", label: i18next.t("female", {lng})},
    {id: "male", label: i18next.t("male", {lng})}
];

export const getters = {
    complete: (state: SurveyAndProgramState) => {
        return !!state.survey && !state.programError && !state.ancError
    },

    validForDataExploration: (state: SurveyAndProgramState) => {
        return (!!state.survey || !!state.program || !!state.anc) &&
            !state.programError && !state.ancError && !state.surveyError
    },

    hasChanges: (state: SurveyAndProgramState) => {
        return !!state.survey || !!state.program || !!state.anc
    },

    data: (state: SurveyAndProgramState) => {
        const res = response(state);
        return res ? res.data : null;
    },

    countryAreaFilterOption: (state: SurveyAndProgramState, getters: any, rootState: DataExplorationState): FilterOption => {
        return rootState.baseline.shape!.filters!.regions as FilterOption;
    },

    filters: (state: SurveyAndProgramState, getters: any, rootState: DataExplorationState): DisplayFilter[] => {
        const result = [] as DisplayFilter[];

        if (state.selectedDataType == null) {
            return result;
        }

        //TODO: Replace this knowledge of Choropleth filters with metadata

        if (rootState.baseline.shape) {
            result.push({
                id: "area",
                column_id: "area_id",
                label: "area",
                options: rootOptionChildren([rootState.baseline.shape!.filters!.regions as FilterOption]),
                allowMultiple: true
            });
        }

        const res = response(state);
        const filters = res ? res.filters : {} as any;

        result.push({
            id: "year",
            column_id: "year",
            label: "year",
            options: filters.year || [],
            allowMultiple: false
        });

        result.push({
            id: "calendar_quarter",
            column_id: "calendar_quarter",
            label: "calendar",
            options: filters.calendar_quarter || [],
            allowMultiple: false
        });

        const lng = rootState.language;
        const sexFilterOptionsForType =
            state.selectedDataType == DataType.Survey || state.selectedDataType == DataType.Program ? sexFilterOptions(lng) : [];

        result.push({
            id: "sex",
            column_id: "sex",
            label: "sex",
            options: sexFilterOptionsForType,
            allowMultiple: false
        });


        result.push({
            id: "age",
            column_id: "age_group",
            label: "age",
            options: filters.age || [],
            allowMultiple: false
        });

        result.push({
            id: "survey",
            column_id: "survey_id",
            label: "survey",
            options: filters.surveys || [],
            allowMultiple: false
        });

        return result;
    }
};
