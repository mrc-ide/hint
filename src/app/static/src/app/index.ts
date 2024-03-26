import {createApp} from "vue";
import {store, storePassword} from "./main"
import {router} from "./router"
import translate from "./directives/translate";
import FloatingVue from "floating-vue";
import Hint from "./components/Hint.vue"
import ForgotPassword from "./components/password/ForgotPassword.vue";
import ResetPassword from "./components/password/ResetPassword.vue";
import 'floating-vue/dist/style.css';
import "../scss/style.scss";
import "bootstrap/scss/bootstrap-grid.scss";
import "@reside-ic/vue-nested-multiselect/style.css";
import "bootstrap/dist/js/bootstrap.bundle.js";

const mountEl = document.querySelector("#app");
const mountElForgotPassword = document.querySelector("#forgotPasswordApp");
const mountElResetPassword = document.querySelector("#resetPasswordApp");

// tooltip options
const options = {
    // Set float distance so that the arrow does not overlap
    // the tooltip icon. This was causing multiple mouse
    // events to be triggered causing the tooltip to flicker
    distance: 12,
    themes: {
        'tooltip': {
            html: true,
            delay: {
                show: 0,
                hide: 0,
            },
        },
    }
}

const getApp = () => {
    if (mountEl) {
        const app = createApp(Hint, {...(mountEl as HTMLDivElement).dataset});
        app.use(store);
        app.use(router);

        app.use(FloatingVue, options);

        app.directive("translate", translate(store));
        app.config.globalProperties.$store = store;

        app.mount('#app');

        return app
    } else if (mountElForgotPassword) {
        const app = createApp(ForgotPassword, {...(mountElForgotPassword as HTMLDivElement).dataset});
        app.use(storePassword);

        app.use(FloatingVue, options);
        app.directive("translate", translate(storePassword));

        app.mount("#forgotPasswordApp");

        return app
    } else if (mountElResetPassword) {
        const app = createApp(ResetPassword, {...(mountElResetPassword as HTMLDivElement).dataset});
        app.use(storePassword);

        app.use(FloatingVue, options);
        app.directive("translate", translate(storePassword));

        app.mount("#resetPasswordApp");

        return app
    } else {
        return {}
    }
}

export default getApp();
