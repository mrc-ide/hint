import {Module} from 'vuex';
import {actions} from './actions';
import {mutations} from './mutations';
import {
    PlottingMetadataResponse,
    Error,
    Metadata,
    AdrMetadataResponse,
    FilterOption,
    ChoroplethIndicatorMetadata,
    ReviewInputFilterMetadataResponse,
    FilterTypes,
    PlotSettingsControl
} from "../../generated";
import {DataType} from "../surveyAndProgram/surveyAndProgram";
import { RootState } from '../../root';

export type PlotMetadataFrame = {
    filterTypes: FilterTypes[],
    indicators: ChoroplethIndicatorMetadata[],
    plotSettingsControl: {
        [k: string]: PlotSettingsControl
    }
}

export interface MetadataState {
    plottingMetadataError: Error | null
    plottingMetadata: PlottingMetadataResponse | null
    reviewInputMetadata: ReviewInputFilterMetadataResponse | null
    reviewInputMetadataError: Error | null
    reviewInputMetadataFetched: boolean
    adrUploadMetadata: AdrMetadataResponse[]
    adrUploadMetadataError: Error | null
}

export const initialMetadataState = (): MetadataState => {
    return {
        plottingMetadataError: null,
        plottingMetadata: null,
        reviewInputMetadata: null,
        reviewInputMetadataError: null,
        reviewInputMetadataFetched: false,
        adrUploadMetadataError: null,
        adrUploadMetadata: [] as AdrMetadataResponse[]
    }
};

export const metadataGetters = {
    complete: (state: MetadataState) => {
        return !!state.plottingMetadata
    },
    sapIndicatorsMetadata: (state: MetadataState, getters: any, rootState: RootState) => {
        const plottingMetadata = state.plottingMetadata;

        if (!plottingMetadata) {
            return [];
        }

        const sap = rootState.surveyAndProgram;
        const selectedDataType = sap.selectedDataType;

        let metadataForType: Metadata | null = null;
        let dataIndicators: FilterOption[] = [];
        switch (selectedDataType) {
            case (DataType.ANC):
                metadataForType = plottingMetadata.anc;
                dataIndicators = sap.anc?.filters.indicators || [];
                break;
            case (DataType.Program):
                metadataForType = plottingMetadata.programme;
                dataIndicators = sap.program?.filters.indicators || [];
                break;
            case (DataType.Survey):
                metadataForType = plottingMetadata.survey;
                dataIndicators = sap.survey?.filters.indicators ||[];
                break;
        }

        const unfiltered: ChoroplethIndicatorMetadata[] =  metadataForType ? metadataForType.choropleth.indicators : [];
        return unfiltered.filter(
            (metaIndicator: ChoroplethIndicatorMetadata) => dataIndicators.some(
                (dataIndicator: FilterOption) => metaIndicator.indicator === dataIndicator.id
            )
        )
    }
};

const namespaced = true;

export const metadata = (existingState: Partial<RootState> | null): Module<MetadataState, RootState> => {
    return {
        namespaced,
        state: {...initialMetadataState(), ...existingState && existingState.metadata},
        actions,
        mutations,
        getters: metadataGetters
    };
};
