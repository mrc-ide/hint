import {MutationTree} from "vuex";
import {PayloadWithType, TranslatableState} from "../../types";
import {Language} from "../translations/locales";

export enum LanguageMutation {
    ChangeLanguage = "ChangeLanguage"
}

export const mutations: MutationTree<TranslatableState> = {

    [LanguageMutation.ChangeLanguage](state: TranslatableState, action: PayloadWithType<Language>) {
        state.language = action.payload
    }
};
