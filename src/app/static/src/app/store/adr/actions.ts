import {ActionContext, ActionTree} from "vuex";
import {RootState} from "../../root";
import {api} from "../../apiService";
import qs from "qs";
import {ADRState} from "./adr";
import {ADRMutation} from "./mutations";
import {constructUploadFile, datasetFromMetadata, findResource} from "../../utils";
import {Organization} from "../../types";
import {BaselineMutation} from "../baseline/mutations";

export interface ADRActions {
    fetchKey: (store: ActionContext<ADRState, RootState>) => void;
    saveKey: (store: ActionContext<ADRState, RootState>, key: string) => void;
    deleteKey: (store: ActionContext<ADRState, RootState>) => void;
    getDatasets: (store: ActionContext<ADRState, RootState>) => void;
    getSchemas: (store: ActionContext<ADRState, RootState>) => void;
    getUserCanUpload: (store: ActionContext<ADRState, RootState>) => void;
    getUploadFiles: (store: ActionContext<ADRState, RootState>) => void;
}

export const actions: ActionTree<ADRState, RootState> & ADRActions = {
    async fetchKey(context) {
        await api<ADRMutation, ADRMutation>(context)
            .ignoreErrors()
            .withSuccess(ADRMutation.UpdateKey)
            .get("/adr/key/");
    },

    async saveKey(context, key) {
        context.commit({type: ADRMutation.SetKeyError, payload: null});
        await api<ADRMutation, ADRMutation>(context)
            .withError(ADRMutation.SetKeyError)
            .withSuccess(ADRMutation.UpdateKey)
            .postAndReturn("/adr/key/", qs.stringify({key}));
    },

    async deleteKey(context) {
        context.commit({type: ADRMutation.SetKeyError, payload: null});
        await api<ADRMutation, ADRMutation>(context)
            .withError(ADRMutation.SetKeyError)
            .withSuccess(ADRMutation.UpdateKey)
            .delete("/adr/key/")
    },

    async getDatasets(context) {
        context.commit({type: ADRMutation.SetFetchingDatasets, payload: true});
        context.commit({type: ADRMutation.SetADRError, payload: null});
        await api<ADRMutation, ADRMutation>(context)
            .withError(ADRMutation.SetADRError)
            .withSuccess(ADRMutation.SetDatasets)
            .get("/adr/datasets/")
            .then(() => {
                context.commit({type: ADRMutation.SetFetchingDatasets, payload: false});
            });
    },

    async getSchemas(context) {
        await api<ADRMutation, ADRMutation>(context)
            .ignoreErrors()
            .withSuccess(ADRMutation.SetSchemas)
            .get("/adr/schemas/")
    },

    async getUserCanUpload(context) {
        const {state, rootState, commit} = context;
        const selectedDataset = rootState.baseline.selectedDataset;

        if (selectedDataset) {
            //For backward compatibility, we may have to regenerate the dataset metadata to provide the
            //organisation id for projects which are reloaded
            let selectedDatasetOrgId: string;
            if (!selectedDataset.organization) {
                //We may also have to fetch the selected dataset metadata too, if not loaded during this session
                let datasets = state.datasets;
                if (!datasets.length) {
                    await api(context)
                        .ignoreErrors()
                        .ignoreSuccess()
                        .get(`/adr/datasets/${selectedDataset.id}`)
                        .then((response) => {
                            if (response) {
                                datasets = [response.data];
                            }
                        });
                }

                const regenDataset = datasetFromMetadata(selectedDataset.id, datasets, state.schemas!);
                commit(`baseline/${BaselineMutation.SetDataset}`, regenDataset, {root: true});
                selectedDatasetOrgId = regenDataset.organization.id;
            } else {
                selectedDatasetOrgId = selectedDataset.organization.id;
            }

            await api(context)
                .withError(ADRMutation.SetADRError)
                .ignoreSuccess()
                .get("/adr/orgs?permission=update_dataset")
                .then(async (response) => {
                    if (response) {
                        const updateableOrgs = response.data as Organization[];
                        const canUpload = updateableOrgs.some(org => org.id === selectedDatasetOrgId);
                        commit({type: ADRMutation.SetUserCanUpload, payload: canUpload});
                    }
                })
        }
    },

    async getUploadFiles(context) {
        const {state, rootState, commit} = context;
        const selectedDataset = rootState.baseline.selectedDataset;
        const project = rootState.projects.currentProject;

        if (selectedDataset && project) {
            context.commit({type: ADRMutation.SetADRError, payload: null});
            await api(context)
                .withError(ADRMutation.SetADRError)
                .ignoreSuccess()
                .get(`/adr/datasets/${selectedDataset.id}`)
                .then((response) => {
                    if (response) {
                        const metadata = response.data;
                        const schemas = state.schemas!;

                        const uploadFiles = {
                            outputZip: constructUploadFile(
                                metadata,
                                0,
                                schemas.outputZip,
                                `${project.name}_naomi_outputs.zip`,
                                "uploadFileOutputZip"),
                            outputSummary: constructUploadFile(
                                metadata,
                                1,
                                schemas.outputSummary,
                                `${project.name}_naomi_summary.html`,
                                "uploadFileOutputSummary")
                        };

                        commit({type: ADRMutation.SetUploadFiles, payload: uploadFiles});
                    }
                });
        }
    }
};

