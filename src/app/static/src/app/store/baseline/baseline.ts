import {Module} from 'vuex';
import {actions} from './actions';
import {mutations} from './mutations';
import {
    NestedFilterOption,
    PjnzResponse,
    PopulationResponse,
    ShapeResponse,
    Error,
} from "../../generated";
import { Dataset, Release, Dict, DatasetResourceSet, DatasetResource } from "../../types";
import {ReadyState, RootState} from "../../root";
import {resourceTypes} from "../../utils";

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
    selectedDatasetAvailableResources: (state: BaselineState, getters: any, rootState: RootState): unknown => {
        const resources: { [k in keyof DatasetResourceSet]?: DatasetResource | null } = {}
        const { selectedDataset } = state

        if (selectedDataset?.id && selectedDataset.resources) {
            const selectedDatasetFromDatasets = rootState.adr.datasets
                .find(dataset => dataset.id === selectedDataset.id) || null

            const checkResourceAvailable = (resourceType: string) => {
                const res = selectedDatasetFromDatasets?.resources
                    .some((resource: any) => resource.resource_type && resource.resource_type === resourceType)
                return res
            }

            Object.entries(resourceTypes).forEach(([key, value]) => {
                resources[key as keyof typeof resources] =
                    checkResourceAvailable(value) ? selectedDataset.resources[key as keyof typeof resources] : null
            })
        }
        return resources
    },
    areaIdToLevelMap: (state: BaselineState): Dict<number> => {
        const features = state.shape?.data.features
        if (!features) {
            return {}
        }
        return features.reduce(
            (map: Dict<number>, feature: any) => {
                if (feature.properties?.area_id) {
                    map[feature.properties.area_id] = feature.properties.area_level;
                }
                return map;
            }, {});
    },
};

const getters = baselineGetters;

const namespaced = true;

export const baseline = (existingState: Partial<RootState> | null): Module<BaselineState, RootState> => {
    return {
        namespaced,
            state: {...initialBaselineState(), ...existingState && existingState.baseline},
            getters,
            actions,
            mutations
    };
};
