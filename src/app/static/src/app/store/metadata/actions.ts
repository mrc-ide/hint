import {ActionContext, ActionTree} from 'vuex';
import {api} from "../../apiService";
import {MetadataState} from "./metadata";
import {MetadataMutations} from "./mutations";
import { FileType } from '../surveyAndProgram/surveyAndProgram';
import { commitPlotDefaultSelections, filtersAfterUseShapeRegions } from '../plotSelections/utils';
import { ReviewInputFilterMetadataResponse } from '../../generated';
import { RootState } from '../../root';
import { commitInitialScaleSelections } from '../plotState/utils';
import { addAreaLevelsToSAPData } from '../plotData/utils';

export interface MetadataActions {
    getPlottingMetadata: (store: ActionContext<MetadataState, RootState>, country: string) => void
    getReviewInputMetadata: (store: ActionContext<MetadataState, RootState>) => void
    getAdrUploadMetadata: (store: ActionContext<MetadataState, RootState>, downloadId: string) => Promise<void>
}

export const actions: ActionTree<MetadataState, RootState> & MetadataActions = {

    async getPlottingMetadata(context, iso3) {
        await api<MetadataMutations, MetadataMutations>(context)
            .withSuccess(MetadataMutations.PlottingMetadataFetched)
            .withError(MetadataMutations.PlottingMetadataError)
            .get(`/meta/plotting/${iso3}`);
    },

    async getReviewInputMetadata(context) {
        const { commit, rootState } = context;
        const iso3 = rootState.baseline.iso3;
        const sap = rootState.surveyAndProgram;
        const fileTypes = [FileType.Shape]
        if (!sap.ancError && sap.anc) {
            fileTypes.push(FileType.ANC);
            addAreaLevelsToSAPData(rootState, "anc", commit);
        }
        if (!sap.programError && sap.program) {
            fileTypes.push(FileType.Programme);
            addAreaLevelsToSAPData(rootState, "program", commit);
        }
        if (!sap.surveyError && sap.survey) {
            fileTypes.push(FileType.Survey);
            addAreaLevelsToSAPData(rootState, "survey", commit);
        }
        commit({ type: MetadataMutations.ReviewInputsMetadataToggleComplete, payload: false });
        const response = await api<MetadataMutations, MetadataMutations>(context)
            .withSuccess(MetadataMutations.ReviewInputsMetadataFetched) 
            .withError(MetadataMutations.ReviewInputsMetadataError)
            .postAndReturn<ReviewInputFilterMetadataResponse>(`/meta/review-inputs/${iso3}`, { types: fileTypes });
        if (response) {
            const metadata = response.data;
            metadata.filterTypes = filtersAfterUseShapeRegions(metadata.filterTypes, rootState);
            await commitPlotDefaultSelections(metadata, commit, rootState);
            commitInitialScaleSelections(metadata.indicators, commit);
        }
        commit({ type: MetadataMutations.ReviewInputsMetadataToggleComplete, payload: true });
    },

    async getAdrUploadMetadata(context, downloadId) {
        await api<MetadataMutations, MetadataMutations>(context)
            .withSuccess(MetadataMutations.AdrUploadMetadataFetched)
            .withError(MetadataMutations.AdrUploadMetadataError)
            .get(`/meta/adr/${downloadId}`)
    }
};
