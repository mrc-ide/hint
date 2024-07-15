import Vuex, { StoreOptions } from 'vuex';
import {RootState, storeOptions} from "./root";
import registerTranslations from "./store/translations/registerTranslations";
import {initialPasswordState, PasswordState} from "./store/password/password";
import {actions} from './store/password/actions';
import {mutations} from './store/password/mutations';

// Main app
export const store = new Vuex.Store<RootState>(storeOptions);
registerTranslations(store);

// Forgot password app
export const passwordStoreOptions: StoreOptions<PasswordState> = {
    state: initialPasswordState,
    actions,
    mutations
};

export const storePassword = new Vuex.Store<PasswordState>(passwordStoreOptions);
registerTranslations(storePassword);
