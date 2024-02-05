import {MutationTree} from 'vuex';
import {BaselineState} from "./baseline";
import {
    Error,
    NestedFilterOption,
    PjnzResponse,
    PopulationResponse,
    ShapeResponse,
    ValidateBaselineResponse
} from "../../generated";
import {Dataset, DatasetResourceSet, PayloadWithType, Release} from "../../types";
import {flattenOptions} from "../../utils";
import {ReadyState} from "../../root";

export enum BaselineMutation {
    PJNZUpdated = "PJNZUpdated",
    PJNZUploadError = "PJNZUploadError",
    PJNZErroredFile = "PJNZErroredFile",
    ShapeUpdated = "ShapeUpdated",
    ShapeUploadError = "ShapeUploadError",
    ShapeErroredFile = "ShapeErroredFile",
    PopulationUpdated = "PopulationUpdated",
    PopulationUploadError = "PopulationUploadError",
    PopulationErroredFile = "PopulationErroredFile",
    Ready = "Ready",
    Validating = "Validating",
    Validated = "Validated",
    BaselineError = "Error",
    SetDataset = "SetDataset",
    SetRelease = "SetRelease",
    UpdateDatasetResources = "UpdateDatasetResources",
    MarkDatasetResourcesUpdated = "MarkDatasetResourcesUpdated"
}

export const BaselineUpdates = [
    BaselineMutation.PJNZUpdated,
    BaselineMutation.ShapeUpdated,
    BaselineMutation.PopulationUpdated
];

export const BaselineDatasetUpdates = [
    BaselineMutation.SetDataset
]

export const mutations: MutationTree<BaselineState> = {

    [BaselineMutation.MarkDatasetResourcesUpdated](state: BaselineState) {
        if (state.selectedDataset) {
            const resources = state.selectedDataset.resources;
            Object.keys(resources).map((k: string) => {
                const key = k as keyof DatasetResourceSet;
                if (resources[key]) {
                    resources[key]!.outOfDate = false;
                }
            });
        }
    },

    [BaselineMutation.UpdateDatasetResources](state: BaselineState, payload: DatasetResourceSet) {
        if (state.selectedDataset) {
            const resources = state.selectedDataset.resources;
            Object.keys(resources).map((k: string) => {
                console.log(`checking ${k}`)
                const key = k as keyof DatasetResourceSet;
                if (!payload[key]) {
                    // resource has been removed from the dataset
                    resources[key] = null;
                    return;
                }
                if (!resources[key] || (resources[key]!.lastModified != payload[key]!.lastModified)
                        || (resources[key]!.metadataModified != payload[key]!.metadataModified)) {
                    // previous data was null OR has a different last modified or metadata modified
                    // so update metadata and mark as out of date
                    resources[key] = payload[key];
                    resources[key]!.outOfDate = true;
                }
            })
        }
    },

    [BaselineMutation.SetDataset](state: BaselineState, payload: Dataset) {
        state.selectedDatasetHasChanged = state.selectedDataset?.id !== payload.id
        console.log("set dataset payload is")
        console.log(payload)
        state.selectedDataset = payload;
        console.log(state.selectedDataset)
    },

    [BaselineMutation.SetRelease](state: BaselineState, payload: Release | null) {
        state.selectedRelease = payload;
    },

    [BaselineMutation.PJNZUploadError](state: BaselineState, action: PayloadWithType<Error>) {
        state.pjnzError = action.payload;
    },

    [BaselineMutation.PJNZUpdated](state: BaselineState, action: PayloadWithType<PjnzResponse | null>) {
        const data = action.payload;
        if (data) {
            state.country = data.data.country;
            state.iso3 = data.data.iso3;
            state.pjnz = data;
        } else {
            state.country = "";
            state.iso3 = "";
            state.pjnz = null;
        }
        state.pjnzError = null;
        state.pjnzErroredFile = null;
    },

    [BaselineMutation.PJNZErroredFile](state: BaselineState, action: PayloadWithType<string>) {
        state.pjnzErroredFile = action.payload;
    },

    [BaselineMutation.ShapeUpdated](state: BaselineState, action: PayloadWithType<ShapeResponse>) {
        state.shape = Object.freeze(action.payload);
        if (action.payload && action.payload.filters.regions) {
            state.regionFilters = action.payload.filters.regions.children as NestedFilterOption[];
            state.flattenedRegionFilters = Object.freeze(flattenOptions(state.regionFilters));
        }
        state.shapeError = null;
        state.shapeErroredFile = null;
    },

    [BaselineMutation.ShapeUploadError](state: BaselineState, action: PayloadWithType<Error>) {
        state.shapeError = action.payload;
    },

    [BaselineMutation.ShapeErroredFile](state: BaselineState, action: PayloadWithType<string>) {
        state.shapeErroredFile = action.payload;
    },

    [BaselineMutation.PopulationUpdated](state: BaselineState, action: PayloadWithType<PopulationResponse>) {
        state.population = action.payload;
        state.populationError = null;
        state.populationErroredFile = null;
    },

    [BaselineMutation.PopulationUploadError](state: BaselineState, action: PayloadWithType<Error>) {
        state.populationError = action.payload;
    },

    [BaselineMutation.PopulationErroredFile](state: BaselineState, action: PayloadWithType<string>) {
        state.populationErroredFile = action.payload;
    },

    [BaselineMutation.Validating](state: BaselineState) {
        state.validating = true;
        state.validatedConsistent = false;
        state.baselineError = null;
    },

    [BaselineMutation.Validated](state: BaselineState, action: PayloadWithType<ValidateBaselineResponse>) {
        state.validating = false;

        state.validatedConsistent = action.payload.consistent;
        state.baselineError = null;
    },

    [BaselineMutation.BaselineError](state: BaselineState, action: PayloadWithType<Error>) {
        state.validating = false;
        state.validatedConsistent = false;
        state.baselineError = action.payload;
    },

    [BaselineMutation.Ready](state: ReadyState) {
        state.ready = true;
    }
};
