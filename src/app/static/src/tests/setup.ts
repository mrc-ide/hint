import i18next from "i18next";
import {createApp} from "vue";
import Vuex from "vuex";
import {Language, locales} from "../app/store/translations/locales";
import {RootState} from "../app/root";
import Hint from "../app/components/Hint.vue";

// Implement innerText as it's not implemented in Jest/jsdom
// Reference: https://github.com/jsdom/jsdom/issues/1245
Object.defineProperty((global as any).Element.prototype, 'innerText', {
    get() {
        return this.textContent;
    },
    set(value: string) {
        this.textContent = value;
    },
    configurable: true,
});

i18next.init({
    lng: Language.en,
    resources: {
        en: { translation: locales.en },
        fr: { translation: locales.fr },
        pt: { translation: locales.pt },
    },
    fallbackLng: Language.en,
});

const app = createApp(Hint);
const store = new Vuex.Store<RootState>({});
app.use(store);

(global as any).currentUser = "some.user@example.com";

// Override console.error to throw an error
global.console.error = (message: any) => {
    throw message instanceof Error ? message : new Error(message);
};

global.console.warn = () => null;

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    throw err;
});
