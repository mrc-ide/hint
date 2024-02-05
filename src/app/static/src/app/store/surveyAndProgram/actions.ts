import {ActionContext, ActionTree, Commit} from 'vuex';
import {DataType, SurveyAndProgramState} from "./surveyAndProgram";
import {api} from "../../apiService";
import {AncResponse, ProgrammeResponse, SurveyResponse} from "../../generated";
import {SurveyAndProgramMutation} from "./mutations";
import {buildData, getFilenameFromImportUrl, getFilenameFromUploadFormData} from "../../utils";
import {GenericChartMutation} from "../genericChart/mutations";
import {DataExplorationState} from "../dataExploration/dataExploration";
import {UploadImportPayload} from "../../types";

export interface SurveyAndProgramActions {
    importSurvey: (store: ActionContext<SurveyAndProgramState, DataExplorationState>, url: string) => void,
    importProgram: (store: ActionContext<SurveyAndProgramState, DataExplorationState>, url: string) => void,
    importANC: (store: ActionContext<SurveyAndProgramState, DataExplorationState>, url: string) => void,
    importVmmc: (store: ActionContext<SurveyAndProgramState, DataExplorationState>, url: string) => void,
    uploadSurvey: (store: ActionContext<SurveyAndProgramState, DataExplorationState>, formData: FormData) => void,
    uploadProgram: (store: ActionContext<SurveyAndProgramState, DataExplorationState>, formData: FormData) => void,
    uploadANC: (store: ActionContext<SurveyAndProgramState, DataExplorationState>, formData: FormData) => void
    uploadVmmc: (store: ActionContext<SurveyAndProgramState, DataExplorationState>, formData: FormData) => void
    getSurveyAndProgramData: (store: ActionContext<SurveyAndProgramState, DataExplorationState>) => void;
    deleteSurvey: (store: ActionContext<SurveyAndProgramState, DataExplorationState>) => void
    deleteProgram: (store: ActionContext<SurveyAndProgramState, DataExplorationState>) => void
    deleteANC: (store: ActionContext<SurveyAndProgramState, DataExplorationState>) => void
    deleteVmmc: (store: ActionContext<SurveyAndProgramState, DataExplorationState>) => void
    deleteAll: (store: ActionContext<SurveyAndProgramState, DataExplorationState>) => void
    selectDataType: (store: ActionContext<SurveyAndProgramState, DataExplorationState>, payload: DataType) => void
    validateSurveyAndProgramData: (store: ActionContext<SurveyAndProgramState, DataExplorationState>) => void;
}

const enum DATASET_TYPE {
    ANC = "anc",
    ART = "art",
    SURVEY = "survey",
    VMMC = "vmmc"
}

function commitSelectedDataTypeUpdated(commit: Commit, dataType: DataType) {
    commit({type: SurveyAndProgramMutation.SelectedDataTypeUpdated, payload: dataType})
}

function commitClearGenericChartDataset(commit: Commit, dataType: string) {
    commit({type: `genericChart/${GenericChartMutation.ClearDataset}`, payload: dataType}, {root: true});
}

interface UploadImportOptions {
    url: string
    payload: FormData | UploadImportPayload
}

async function uploadOrImportANC(context: ActionContext<SurveyAndProgramState, DataExplorationState>, options: UploadImportOptions,
                                 filename: string) {
    const {commit} = context;
    commit({type: SurveyAndProgramMutation.ANCUpdated, payload: null});
    commit({type: SurveyAndProgramMutation.WarningsFetched, payload: {type: DataType.ANC, warnings: []}});
    commitClearGenericChartDataset(commit, DATASET_TYPE.ANC);

    await api<SurveyAndProgramMutation, SurveyAndProgramMutation>(context)
        .withError(SurveyAndProgramMutation.ANCError)
        .withSuccess(SurveyAndProgramMutation.ANCUpdated)
        .freezeResponse()
        .postAndReturn<ProgrammeResponse>(getUrlWithQuery(context, options.url), options.payload)
        .then((response) => {
            if (response) {
                commit({
                    type: SurveyAndProgramMutation.WarningsFetched,
                    payload: {type: DataType.ANC, warnings: response.data.warnings}
                })
                commitSelectedDataTypeUpdated(commit, DataType.ANC);
            } else {
                commit({type: SurveyAndProgramMutation.ANCErroredFile, payload: filename});
            }
        });
}

async function uploadOrImportProgram(context: ActionContext<SurveyAndProgramState, DataExplorationState>, options: UploadImportOptions,
                                     filename: string) {
    const {commit} = context;
    commit({type: SurveyAndProgramMutation.ProgramUpdated, payload: null});
    commit({type: SurveyAndProgramMutation.WarningsFetched, payload: {type: DataType.Program, warnings: []}});
    commitClearGenericChartDataset(commit, DATASET_TYPE.ART);

    await api<SurveyAndProgramMutation, SurveyAndProgramMutation>(context)
        .withError(SurveyAndProgramMutation.ProgramError)
        .withSuccess(SurveyAndProgramMutation.ProgramUpdated)
        .freezeResponse()
        .postAndReturn<ProgrammeResponse>(getUrlWithQuery(context, options.url), options.payload)
        .then((response) => {
            if (response) {
                commit({
                    type: SurveyAndProgramMutation.WarningsFetched,
                    payload: {type: DataType.Program, warnings: response.data.warnings}
                })
                commitSelectedDataTypeUpdated(commit, DataType.Program);
            } else {
                commit({type: SurveyAndProgramMutation.ProgramErroredFile, payload: filename});
            }
        });
}

async function uploadOrImportSurvey(context: ActionContext<SurveyAndProgramState, DataExplorationState>, options: UploadImportOptions,
                                    filename: string) {
    const {commit} = context;
    commit({type: SurveyAndProgramMutation.SurveyUpdated, payload: null});
    commit({type: SurveyAndProgramMutation.WarningsFetched, payload: {type: DataType.Survey, warnings: []}});

    await api<SurveyAndProgramMutation, SurveyAndProgramMutation>(context)
        .withError(SurveyAndProgramMutation.SurveyError)
        .withSuccess(SurveyAndProgramMutation.SurveyUpdated)
        .freezeResponse()
        .postAndReturn<SurveyResponse>(getUrlWithQuery(context, options.url), options.payload)
        .then((response) => {
            if (response) {
                commit({
                    type: SurveyAndProgramMutation.WarningsFetched,
                    payload: {type: DataType.Survey, warnings: response.data.warnings}
                })
                commitSelectedDataTypeUpdated(commit, DataType.Survey);
            } else {
                commit({type: SurveyAndProgramMutation.SurveyErroredFile, payload: filename});
            }
        });
}

async function uploadOrImportVmmc(context: ActionContext<SurveyAndProgramState, DataExplorationState>,
                                  options: UploadImportOptions, filename: string) {
    const {commit} = context;
    commit({type: SurveyAndProgramMutation.VmmcUpdated, payload: null});
    commit({type: SurveyAndProgramMutation.WarningsFetched, payload: {type: DataType.Vmmc, warnings: []}});
    commitClearGenericChartDataset(commit, DATASET_TYPE.VMMC);

    await api<SurveyAndProgramMutation, SurveyAndProgramMutation>(context)
        .withError(SurveyAndProgramMutation.VmmcError)
        .withSuccess(SurveyAndProgramMutation.VmmcUpdated)
        .freezeResponse()
        .postAndReturn<SurveyResponse>(getUrlWithQuery(context, options.url), options.payload)
        .then((response) => {
            if (response) {
                commit({
                    type: SurveyAndProgramMutation.WarningsFetched,
                    payload: {type: DataType.Vmmc, warnings: response.data.warnings}
                })
            } else {
                commit({type: SurveyAndProgramMutation.VmmcErroredFile, payload: filename});
            }
        });
}

export const actions: ActionTree<SurveyAndProgramState, DataExplorationState> & SurveyAndProgramActions = {

    selectDataType(context, payload) {
        const {commit} = context;
        commitSelectedDataTypeUpdated(commit, payload);
    },

    async importSurvey(context, url) {
        if (url) {
            const data = buildData (context.rootState.baseline?.selectedDataset, url, "survey")
            await uploadOrImportSurvey(context, {url: "/adr/survey/", payload: data},
                getFilenameFromImportUrl(url));
        }
    },

    async importProgram(context, url) {
        if (url) {
            const data = buildData (context.rootState.baseline?.selectedDataset, url, "program")
            await uploadOrImportProgram(context, {url: "/adr/programme/", payload: data},
                getFilenameFromImportUrl(url));
        }
    },

    async importANC(context, url) {
        if (url) {
            const data = buildData (context.rootState.baseline?.selectedDataset, url, "anc")
            await uploadOrImportANC(context, {url: "/adr/anc/", payload: data},
                getFilenameFromImportUrl(url))
        }
    },

    async importVmmc(context, url) {
        if (url) {
            const data = buildData (context.rootState.baseline?.selectedDataset, url, "vmmc")
            await uploadOrImportVmmc(context, {url: "/adr/vmmc/", payload: data},
                getFilenameFromImportUrl(url))
        }
    },

    async uploadSurvey(context, formData) {
        await uploadOrImportSurvey(context, {url: "/disease/survey/", payload: formData},
            getFilenameFromUploadFormData(formData))
    },

    async uploadProgram(context, formData) {
        await uploadOrImportProgram(context, {url: "/disease/programme/", payload: formData},
            getFilenameFromUploadFormData(formData));
    },

    async uploadANC(context, formData) {
        await uploadOrImportANC(context, {url: "/disease/anc/", payload: formData},
            getFilenameFromUploadFormData(formData))
    },

    async uploadVmmc(context, formData) {
        await uploadOrImportVmmc(context, {url: "/disease/vmmc/", payload: formData},
            getFilenameFromUploadFormData(formData))
    },

    async deleteSurvey(context) {
        const {commit, state} = context;
        await api<SurveyAndProgramMutation, SurveyAndProgramMutation>(context)
            .delete("/disease/survey/")
            .then(() => {
                commit({type: SurveyAndProgramMutation.SurveyUpdated, payload: null});
                if (state.selectedDataType == DataType.Survey) {
                    if (state.program) {
                        commitSelectedDataTypeUpdated(commit, DataType.Program)
                    } else if (state.anc) {
                        commitSelectedDataTypeUpdated(commit, DataType.ANC)
                    }
                }
                commit({type: SurveyAndProgramMutation.WarningsFetched, payload: {type: DataType.Survey, warnings: []}});
            });
    },

    async deleteProgram(context) {
        const {commit, state} = context;
        await api<SurveyAndProgramMutation, SurveyAndProgramMutation>(context)
            .delete("/disease/programme/")
            .then(() => {
                commit({type: SurveyAndProgramMutation.ProgramUpdated, payload: null});
                if (state.selectedDataType == DataType.Program) {
                    if (state.survey) {
                        commitSelectedDataTypeUpdated(commit, DataType.Survey)
                    } else if (state.anc) {
                        commitSelectedDataTypeUpdated(commit, DataType.ANC)
                    }
                }
                commitClearGenericChartDataset(commit, DATASET_TYPE.ART)
                commit({type: SurveyAndProgramMutation.WarningsFetched, payload: {type: DataType.Program, warnings: []}});
            });
    },

    async deleteANC(context) {
        const {commit, state} = context;
        await api<SurveyAndProgramMutation, SurveyAndProgramMutation>(context)
            .delete("/disease/anc/")
            .then(() => {
                commit({type: SurveyAndProgramMutation.ANCUpdated, payload: null});
                if (state.selectedDataType == DataType.ANC) {
                    if (state.program) {
                        commitSelectedDataTypeUpdated(commit, DataType.Program)
                    } else if (state.survey) {
                        commitSelectedDataTypeUpdated(commit, DataType.Survey)
                    }
                }
                commitClearGenericChartDataset(commit, DATASET_TYPE.ANC)
                commit({type: SurveyAndProgramMutation.WarningsFetched, payload: {type: DataType.ANC, warnings: []}});
            });
    },

    async deleteVmmc(context) {
        const {commit, state} = context;
        await api<SurveyAndProgramMutation, SurveyAndProgramMutation>(context)
            .delete("/disease/vmmc/")
            .then(() => {
                commit({type: SurveyAndProgramMutation.VmmcUpdated, payload: null});
                if (state.selectedDataType == DataType.Vmmc) {
                    if (state.program) {
                        // TODO: do we need this?
                        commitSelectedDataTypeUpdated(commit, DataType.Program)
                    } else if (state.survey) {
                        commitSelectedDataTypeUpdated(commit, DataType.Survey)
                    }
                }
                commitClearGenericChartDataset(commit, DATASET_TYPE.VMMC)
                commit({type: SurveyAndProgramMutation.WarningsFetched, payload: {type: DataType.Vmmc, warnings: []}});
            });
    },

    async deleteAll(store) {
        await Promise.all([
            actions.deleteSurvey(store),
            actions.deleteProgram(store),
            actions.deleteANC(store),
            actions.deleteVmmc(store)
        ]);
    },

    async getSurveyAndProgramData(context) {
        const {commit} = context;
        await Promise.all(
            [
                api<SurveyAndProgramMutation, SurveyAndProgramMutation>(context)
                    .ignoreErrors()
                    .withSuccess(SurveyAndProgramMutation.SurveyUpdated)
                    .freezeResponse()
                    .get<SurveyResponse>(getUrlWithQuery(context, "/disease/survey/")),
                api<SurveyAndProgramMutation, SurveyAndProgramMutation>(context)
                    .ignoreErrors()
                    .withSuccess(SurveyAndProgramMutation.ProgramUpdated)
                    .freezeResponse()
                    .get<ProgrammeResponse>(getUrlWithQuery(context, "/disease/programme/")),
                api<SurveyAndProgramMutation, SurveyAndProgramMutation>(context)
                    .ignoreErrors()
                    .withSuccess(SurveyAndProgramMutation.ANCUpdated)
                    .freezeResponse()
                    .get<AncResponse>(getUrlWithQuery(context, "/disease/anc/")),
                api<SurveyAndProgramMutation, SurveyAndProgramMutation>(context)
                    .ignoreErrors()
                    .withSuccess(SurveyAndProgramMutation.VmmcUpdated)
                    .freezeResponse()
                    .get<AncResponse>(getUrlWithQuery(context, "/disease/vmmc/"))
            ]);

        commit({type: SurveyAndProgramMutation.Ready, payload: true});
    },

    async validateSurveyAndProgramData(context) {
        const {commit, rootState} = context;
        const successfulDataTypes: DataType[] = []
        const initialSelectedDataType = rootState.surveyAndProgram.selectedDataType

        await Promise.all(
            [
                api<SurveyAndProgramMutation, SurveyAndProgramMutation>(context)
                    .withError(SurveyAndProgramMutation.SurveyError)
                    .withSuccess(SurveyAndProgramMutation.SurveyUpdated)
                    .freezeResponse()
                    .get<SurveyResponse>(getUrlWithQuery(context, "/disease/survey/"))
                    .then((response) => {
                        if (response && response.data) {
                            successfulDataTypes.push(DataType.Survey)
                        }
                    }),
                api<SurveyAndProgramMutation, SurveyAndProgramMutation>(context)
                    .withError(SurveyAndProgramMutation.ProgramError)
                    .withSuccess(SurveyAndProgramMutation.ProgramUpdated)
                    .freezeResponse()
                    .get<ProgrammeResponse>(getUrlWithQuery(context, "/disease/programme/"))
                    .then((response) => {
                        if (response && response.data) {
                            successfulDataTypes.push(DataType.Program)
                        }
                    }),
                api<SurveyAndProgramMutation, SurveyAndProgramMutation>(context)
                    .withError(SurveyAndProgramMutation.ANCError)
                    .withSuccess(SurveyAndProgramMutation.ANCUpdated)
                    .freezeResponse()
                    .get<AncResponse>(getUrlWithQuery(context, "/disease/anc/"))
                    .then((response) => {
                        if (response && response.data) {
                            successfulDataTypes.push(DataType.ANC)
                        }
                    }),
                api<SurveyAndProgramMutation, SurveyAndProgramMutation>(context)
                    .withError(SurveyAndProgramMutation.VmmcError)
                    .withSuccess(SurveyAndProgramMutation.VmmcUpdated)
                    .freezeResponse()
                    .get<AncResponse>(getUrlWithQuery(context, "/disease/vmmc/"))
                    .then((response) => {
                        if (response && response.data) {
                            successfulDataTypes.push(DataType.Vmmc)
                        }
                    })
            ]);
        const selectedTypeSucceeded = successfulDataTypes.some(data => data === initialSelectedDataType)
        if (!selectedTypeSucceeded) {
            const newSelectedDataType = successfulDataTypes.length ? successfulDataTypes[0] : null
            commitSelectedDataTypeUpdated(commit, newSelectedDataType!)
        }
        commit({type: SurveyAndProgramMutation.Ready, payload: true});
    }
};

function getUrlWithQuery(context: ActionContext<SurveyAndProgramState, DataExplorationState>, url: string) {
    const query = context.rootState.dataExplorationMode ? "?strict=false" : "?strict=true"
    return `${url}${query}`
}
