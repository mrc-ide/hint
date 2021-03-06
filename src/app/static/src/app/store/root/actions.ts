import {ActionContext, ActionTree} from "vuex";
import {RootState} from "../../root";
import {StepDescription} from "../stepper/stepper";
import {RootMutation} from "./mutations";
import {LanguageActions} from "../language/language";
import {changeLanguage} from "../language/actions";
import i18next from "i18next";

export interface RootActions extends LanguageActions<RootState>{
    validate: (store: ActionContext<RootState, RootState>) => void;
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
        await changeLanguage<RootState>(context, payload)
    },
};
