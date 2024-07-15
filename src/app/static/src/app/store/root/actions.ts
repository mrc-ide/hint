import {ActionContext, ActionTree} from "vuex";
import {RootState} from "../../root";
import {StepDescription} from "../stepper/stepper";
import {RootMutation} from "./mutations";
import {ErrorsMutation} from "../errors/mutations";
import {LanguageActions} from "../language/language";
import i18next from "i18next";
import {api} from "../../apiService";
import {ErrorReportManualDetails} from "../../types";
import {VersionInfo} from "../../generated";
import {currentHintVersion} from "../../hintVersion";
import {ChangeLanguageAction} from "../language/actions";
import {ErrorReportDefaultValue} from "../errors/errors";

export interface RootActions extends LanguageActions<RootState> {
    validate: (store: ActionContext<RootState, RootState>) => void;
    generateErrorReport: (store: ActionContext<RootState, RootState>,
        payload: ErrorReportManualDetails) => void;
    rollbackInvalidState: (store: ActionContext<RootState, RootState>) => void;
}

export const actions: ActionTree<RootState, RootState> & RootActions = {
    async validate(store) {
        const {state, getters, commit} = store;
        const completeSteps = state.stepper.steps.map((s: StepDescription) => s.number)
            .filter((i: number) => getters["stepper/complete"][i]);
        const maxCompleteOrActive = Math.max(...completeSteps, state.stepper.activeStep);

        const invalidSteps = state.stepper.steps.map((s: StepDescription) => s.number)
            .filter((i: number) => i < maxCompleteOrActive && !completeSteps.includes(i));

        commit({type: RootMutation.SetInvalidSteps, payload: invalidSteps});
    },

    async rollbackInvalidState(store){
        const {state, dispatch, commit, rootGetters} = store;
        const {invalidSteps} = state;
        if (invalidSteps.length > 0) {
            // Roll back in a new version (if not guest user) so invalid state is available for inspection
            if (!rootGetters.isGuest) {
                const stepTextKeys = rootGetters["stepper/stepTextKeys"];
                const notePrefix = [i18next.t("rolledBackToLastValidStep")];
                const noteSteps = invalidSteps.map((stepNumber) =>
                    i18next.t(stepTextKeys[stepNumber]) || stepNumber.toString()).join(", ");
                await dispatch("projects/newVersion", notePrefix + noteSteps);
            }

            //Invalidate any steps which come after the first invalid step
            const maxValidStep = Math.min(...invalidSteps) - 1;

            const promises: Promise<any>[] = [];

            if (maxValidStep < 1) {
                promises.push(dispatch("baseline/deleteAll"));
            }
            if (maxValidStep < 2) {
                promises.push(dispatch("surveyAndProgram/deleteAll"));
            }

            if (promises.length > 0) {
                await Promise.all(promises);
            }

            commit({type: RootMutation.Reset, payload: maxValidStep});

            commit({type: RootMutation.ResetSelectedDataType});
        }
    },

    async changeLanguage(context, payload) {
        await ChangeLanguageAction(context, payload)
    },

    async generateErrorReport(context, payload) {
        const {rootState, getters, commit} = context
        const data = {
            email: payload.email || rootState.currentUser,
            country: rootState.baseline.country || ErrorReportDefaultValue.country,
            projectId: rootState.projects.currentProject?.id || null,
            projectName: rootState.projects.currentProject?.name || ErrorReportDefaultValue.project,
            browserAgent: navigator.userAgent,
            timeStamp: new Date().toISOString(),
            modelRunId: rootState.modelRun.modelRunId || ErrorReportDefaultValue.model,
            calibrateId: rootState.modelCalibrate.calibrateId || ErrorReportDefaultValue.calibrate,
            downloadIds: getDownloadIds(rootState),
            description: payload.description,
            section: payload.section,
            stepsToReproduce: payload.stepsToReproduce,
            versions: {hint: currentHintVersion, ...rootState.hintrVersion.hintrVersion as VersionInfo},
            errors: getters.errors
        }
        commit({type: `errors/${ErrorsMutation.SendingErrorReport}`, payload: true});
        await api<ErrorsMutation, ErrorsMutation>(context)
            .withSuccess(`errors/${ErrorsMutation.ErrorReportSuccess}` as ErrorsMutation, true)
            .withError(`errors/${ErrorsMutation.ErrorReportError}` as ErrorsMutation, true)
            .postAndReturn("error-report", data)

        commit({type: `errors/${ErrorsMutation.SendingErrorReport}`, payload: false});
    }
};

const getDownloadIds = (rootState: RootState) => {
    const spectrumId = rootState.downloadResults.spectrum.downloadId || ErrorReportDefaultValue.download;
    const summaryId = rootState.downloadResults.summary.downloadId || ErrorReportDefaultValue.download;
    const coarseOutputId = rootState.downloadResults.coarseOutput.downloadId || ErrorReportDefaultValue.download
    const comparisonId = rootState.downloadResults.comparison.downloadId || ErrorReportDefaultValue.download

    return {
        spectrum: spectrumId,
        summary: summaryId,
        coarse_output: coarseOutputId,
        comparison: comparisonId
    }
}
