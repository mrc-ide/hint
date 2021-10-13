import {ActionContext, ActionTree} from "vuex";
import {RootState} from "../../root";
import {StepDescription} from "../stepper/stepper";
import {RootMutation} from "./mutations";
import {LanguageActions} from "../language/language";
import {changeLanguage} from "../language/actions";
import i18next from "i18next";
import {VersionInfo} from "../../generated";
import {currentHintVersion} from "../../hintVersion";

export interface RootActions extends LanguageActions<RootState> {
    validate: (store: ActionContext<RootState, RootState>) => void;
    generateErrorReport: (store: ActionContext<RootState, RootState>,
                          payload: ErrorReportManualDetails) => ErrorReport;
}

export interface ErrorReportManualDetails {
    section: string,
    description: string,
    stepsToReproduce: string,
    email: string
}

export interface ErrorReport extends ErrorReportManualDetails {
    country: string,
    project: string | undefined,
    browserAgent: string,
    timeStamp: string,
    jobId: string,
    versions: VersionInfo,
    errors: Error[]
}

export const actions: ActionTree<RootState, RootState> & RootActions = {
    async validate(store) {
        const {state, getters, commit, dispatch} = store;
        const completeSteps = state.stepper.steps.map((s: StepDescription) => s.number)
            .filter((i: number) => getters["stepper/complete"][i]);
        const maxCompleteOrActive = Math.max(...completeSteps, state.stepper.activeStep);

        const invalidSteps = state.stepper.steps.map((s: StepDescription) => s.number)
            .filter((i: number) => i < maxCompleteOrActive && !completeSteps.includes(i));

        if (invalidSteps.length > 0) {

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

            commit({
                type: "load/LoadFailed",
                payload: {
                    detail: i18next.t("loadFailedErrorDetail")
                }
            });
        }
    },

    async changeLanguage(context, payload) {
        const {commit, dispatch, rootState} = context;

        if (rootState.language === payload) {
            return;
        }

        commit({type: RootMutation.SetUpdatingLanguage, payload: true});
        await changeLanguage<RootState>(context, payload);

        const actions: Promise<unknown>[] = [];

        if (rootState.baseline?.iso3) {
            actions.push(dispatch("metadata/getPlottingMetadata", rootState.baseline.iso3));
        }

        if (rootState.modelCalibrate.status.done) {
            actions.push(dispatch("modelCalibrate/getResult"));
        }

        await Promise.all(actions);
        commit({type: RootMutation.SetUpdatingLanguage, payload: false});
    },

    generateErrorReport({state, getters}, payload) {
        // TODO: instead of returning this object, POST it to the server
        return {
            email: payload.email || state.currentUser,
            country: state.baseline.country,
            project: state.projects.currentProject?.name,
            browserAgent: navigator.userAgent,
            timeStamp: new Date().toISOString(),
            jobId: state.modelRun.modelRunId,
            description: payload.description,
            section: payload.section,
            stepsToReproduce: payload.stepsToReproduce,
            versions: {hint: currentHintVersion, ...state.hintrVersion.hintrVersion as VersionInfo},
            errors: getters.errors
        }
    }
}
