import {Module} from 'vuex';
import {actions} from './actions';
import {mutations} from './mutations';
import {ReadyState} from "../../root";
import {NestedFilterOption, PjnzResponse, PopulationResponse, ShapeResponse, Error} from "../../generated";
import { Dataset, Release, Dict, DatasetResourceSet, DatasetResource } from "../../types";
import {resourceTypes} from "../../utils";
import {DataExplorationState} from "../dataExploration/dataExploration";

export interface BaselineState extends ReadyState {
    selectedDataset: Dataset | null
    selectedDatasetHasChanged: boolean
    selectedRelease: Release | null
    pjnzError: Error | null
    pjnzErroredFile: string | null
    country: string
    iso3: string
    pjnz: PjnzResponse | null
    shape: ShapeResponse | null
    regionFilters: NestedFilterOption[]
    flattenedRegionFilters: Dict<NestedFilterOption>
    shapeError: Error | null
    shapeErroredFile: string | null
    population: PopulationResponse | null,
    populationError: Error | null,
    populationErroredFile: string | null,
    validating: boolean,
    validatedConsistent: boolean,
    baselineError: Error | null
}

export const initialBaselineState = (): BaselineState => {
    return {
        selectedDataset: null,
        selectedDatasetHasChanged: false,
        selectedRelease: null,
        country: "",
        iso3: "",
        pjnzError: null,
        pjnzErroredFile: null,
        pjnz: null,
        shape: null,
        regionFilters: [],
        flattenedRegionFilters: {},
        shapeError: null,
        shapeErroredFile: null,
        population: null,
        populationError: null,
        populationErroredFile: null,
        ready: false,
        validating: false,
        validatedConsistent: false,
        baselineError: null
    }
};

export const baselineGetters = {
    complete: (state: BaselineState) => {
        return state.validatedConsistent &&
            !!state.country && !!state.iso3 && !!state.shape && !!state.population
    },
    validForDataExploration: (state: BaselineState) => {
        const validOrMissingPJNZ = !state.pjnzError
        const validOrMissingPop = !state.populationError
        return validOrMissingPJNZ && validOrMissingPop && state.validatedConsistent && !!state.shape
    },
    selectedDatasetAvailableResources: (state: BaselineState, getters: any, rootState: DataExplorationState): unknown => {
        const resources: { [k in keyof DatasetResourceSet]?: DatasetResource | null } = {}
        const { selectedDataset } = state

        if (selectedDataset?.id && selectedDataset.resources) {
            console.log("adr datasets are")
            console.log(rootState.adr.datasets)
            const selectedDatasetFromDatasets = rootState.adr.datasets
                .find(dataset => dataset.id === selectedDataset.id) || null

            console.log("selected dataset from datasets");
            console.log(selectedDatasetFromDatasets)
            const checkResourceAvailable = (resourceType: string) => {
                const res = selectedDatasetFromDatasets?.resources
                    .some((resource: any) => resource.resource_type && resource.resource_type === resourceType)
                console.log(`checking ${resourceType}`);
                console.log(res);
                return res
            }

            Object.entries(resourceTypes).forEach(([key, value]) => {
                console.log(`checking resource ${key}`)
                resources[key as keyof typeof resources] =
                    checkResourceAvailable(value) ? selectedDataset.resources[key as keyof typeof resources] : null
            })
        }
        console.log(`Avaialble resources are ${resources}`)
        console.log(resources)
        return resources
    },
};

const getters = baselineGetters;

const namespaced = true;

export const baseline = (existingState: Partial<DataExplorationState> | null): Module<BaselineState, DataExplorationState> => {
    return {
        namespaced,
            state: {...initialBaselineState(), ...existingState && existingState.baseline},
            getters,
            actions,
            mutations
    };
};
