import {MutationTree} from "vuex";
import {PayloadWithType, TranslatableState} from "../../types";
import {Language} from "../translations/locales";
import {localStorageManager} from "../../localStorageManager";

export enum LanguageMutation {
    ChangeLanguage = "ChangeLanguage",
    SetUpdatingLanguage = "SetUpdatingLanguage"
}

export const mutations: MutationTree<TranslatableState> = {

    [LanguageMutation.ChangeLanguage](_, action: PayloadWithType<Language>) {
        localStorageManager.saveLanguageState(action.payload)
    },

    [LanguageMutation.SetUpdatingLanguage](state: TranslatableState, action: PayloadWithType<boolean>) {
        state.updatingLanguage = action.payload;
    }
};
