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
    selectedDatasetAvailableResources: (state: BaselineState, rooState: DataExplorationState): unknown => {
        const resources: { [k in keyof DatasetResourceSet]?: DatasetResource | null } = {}
        const { selectedDataset } = state

        if (selectedDataset?.id && selectedDataset.resources) {
            const selectedDatasetFromDatasets = rooState.adr.datasets
                .find(dataset => dataset.id === selectedDataset.id) || null

            const checkResourceAvailable = (resourceType: string) => {
                return selectedDatasetFromDatasets?.resources
                    .some((resource: any) => resource.resource_type && resource.resource_type === resourceType)
            }

            Object.entries(resourceTypes).forEach(([key, value]) => {
                resources[key as keyof typeof resources] =
                    checkResourceAvailable(value) ? selectedDataset.resources[key as keyof typeof resources] : null
            })
        }
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
