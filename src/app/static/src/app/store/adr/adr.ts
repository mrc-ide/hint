import {Module} from "vuex";
import {RootState} from "../../root";
import {Error} from "../../generated";
import {ADRSchemas} from "../../types";
import {actions} from "./actions";
import {mutations} from "./mutations";

export interface ADRState {
    datasets: any[],
    releases: any[],
    fetchingDatasets: boolean,
    fetchingReleases: boolean,
    key: string | null,
    keyError: Error | null,
    adrError: Error | null,
    schemas: ADRSchemas | null,
    userCanUpload: boolean
}

export const initialADRState = (): ADRState => {
    return {
        datasets: [],
        releases: [],
        key: null,
        keyError: null,
        adrError: null,
        schemas: null,
        fetchingDatasets: false,
        fetchingReleases: false,
        userCanUpload: false
    }
};

const namespaced = true;

export const adr: Module<ADRState, RootState> = {
    namespaced,
    state: {...initialADRState()},
    actions,
    mutations
};
