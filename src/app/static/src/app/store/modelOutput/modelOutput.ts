import {Module} from "vuex";
import {RootState} from "../../root";
import {BarchartIndicator, Filter} from "../../types";
import {FilterOption} from "../../generated";

const namespaced: boolean = true;

export interface ModelOutputState {
    dummyProperty: boolean // unused except for testing
}

export const modelOutputGetters = {
    barchartIndicators: (state: ModelOutputState, getters: any, rootState: RootState): BarchartIndicator[] => {
        return rootState.modelRun.result!!.plottingMetadata.barchart.indicators;
    },
    barchartFilters: (state: ModelOutputState, getters: any, rootState: RootState): Filter[] => {

        const regions: FilterOption[] = rootState.baseline.shape!!.filters!!.regions ?
            [rootState.baseline.shape!!.filters!!.regions] : [];

        let filters = rootState.modelRun.result!!.plottingMetadata.barchart.filters;
        //THIS IS A WORKAROUND FOR A BUG IN HINTR - take out when fixed!
        //Column_id and label are the wrong way round for quarter
        //(Also, sex is missing)
        //Should get fixed as part of https://vimc.myjetbrains.com/youtrack/issue/mrc-577
        let newFilters = null;
        const quarter = filters.find((f: any) => f.id == "quarter");
        if (quarter) {
            const newQuarter = {
                ...quarter,
                column_id: "quarter_id",
                label: "Quarter"
            };
            newFilters = filters.filter((f: any) => f.id != "quarter");
            newFilters.push(newQuarter);

            filters = newFilters;
        }
        const sex = filters.find((f: any) => f.id == "sex");
        if (!sex) {
            filters.push({
                "id": "sex",
                "column_id": "sex",
                "label": "Sex",
                "options": [
                    {"id": "female", "label": "female"},
                    {"id": "male", "label": "male"},
                    {"id": "both", "label": "both"}
                ]
            });
        }

        return [
            ...filters,
            {
                "id": "region",
                "column_id": "area_id",
                "label": "Region",
                "options": regions
            }
        ];
    }
};

export const initialModelOutputState: ModelOutputState = {
    dummyProperty: false
};

export const modelOutput: Module<ModelOutputState, RootState> = {
    namespaced,
    state: {...initialModelOutputState},
    getters: modelOutputGetters
};