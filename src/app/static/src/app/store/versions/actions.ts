import {RootMutation} from "../root/mutations";
import {ErrorsMutation} from "../errors/mutations";
import {ActionContext, ActionTree, Commit} from "vuex";
import {VersionsState} from "./versions";
import {RootState} from "../../root";
import {api} from "../../apiService";
import {VersionsMutations} from "./mutations";
import {serialiseState} from "../../localStorageManager";
import qs from "qs";
import {Version} from "../../types";

export interface VersionsActions {
    createVersion: (store: ActionContext<VersionsState, RootState>, name: string) => void,
    getVersions: (store: ActionContext<VersionsState, RootState>) => void
    uploadSnapshotState: (store: ActionContext<VersionsState, RootState>) => void
}

export const actions: ActionTree<VersionsState, RootState> & VersionsActions = {
    async createVersion(context, name) {
        const {commit, state} = context;

        //Ensure we have saved the current snapshot
        if (state.currentSnapshot) {
            immediateUploadSnapshotState(context);
        }

        commit({type: VersionsMutations.SetLoading, payload: true});
        await api<RootMutation, VersionsMutations>(context)
            .withSuccess(RootMutation.SetVersion, true)
            .withError(VersionsMutations.VersionError)
            .postAndReturn<String>("/version/", qs.stringify({name}));
    },

    async getVersions(context) {
        const {commit} = context;
        commit({type: VersionsMutations.SetLoading, payload: true});
        await api<VersionsMutations, VersionsMutations>(context)
            .withSuccess(VersionsMutations.SetPreviousVersions)
            .withError(VersionsMutations.VersionError)
            .get<Version[]>("/versions/");
    },

    async uploadSnapshotState(context) {
        const {state, commit} = context;
        if (state.currentSnapshot) {
            if (!state.snapshotUploadPending) {
                commit({type: VersionsMutations.SetSnapshotUploadPending, payload: true});
                setTimeout(() => {
                    immediateUploadSnapshotState(context);
                }, 2000);
            }
        }
    }
};

const immediateUploadSnapshotState = (context: ActionContext<VersionsState, RootState>) => {
    const {state, commit, rootState} = context;
    commit({type: VersionsMutations.SetSnapshotUploadPending, payload: false});
    const versionId = state.currentVersion && state.currentVersion.id;
    const snapshotId = state.currentSnapshot && state.currentSnapshot.id;
    if (versionId && snapshotId) {
        api<VersionsMutations, ErrorsMutation>(context)
            .withSuccess(VersionsMutations.SnapshotUploadSuccess)
            .withError(ErrorsMutation.ErrorAdded)
            .postAndReturn(`/versionx/${versionId}/snapshot/${snapshotId}/state/`, serialiseState(rootState));
    }
};

