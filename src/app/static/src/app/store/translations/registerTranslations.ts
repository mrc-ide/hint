import i18next from "i18next";
import {Language, locales} from "./locales";
import {Store} from "vuex";
import {TranslatableState} from "../../types";

export default <S extends TranslatableState>(store: Store<S>) => {
    i18next.init({
        lng: store.state.language,
        resources: {
            en: {translation: locales.en},
            fr: {translation: locales.fr},
            pt: {translation: locales.pt}
        },
        fallbackLng: Language.en
    });

    // usage 1: <input v-translate:attribute="'keyName'">
    // e.g. <input v-translate:placeholder="'email'">
    // usage 2: <div v-translate="'keyName'"></div>
    // Vue.directive('translate', translate(store));
}
