import {createRouter, createWebHashHistory, RouteLocationNormalized} from "vue-router";
import Stepper from "./components/Stepper.vue";
import Accessibility from "./components/Accessibility.vue";
import Privacy from "./components/Privacy.vue";
import Projects from "./components/projects/Projects.vue";
import {store} from "./main";

export const beforeEnter = (_to: RouteLocationNormalized, _from: RouteLocationNormalized) => {
    if (store.state.currentUser === "guest" && !sessionStorage.getItem("asGuest")) {
        window.location.assign("/login");
    }
}

const routes = [
    {
        path: "/",
        component: Stepper,
        beforeEnter
    },
    {path: "/accessibility", component: Accessibility},
    {path: "/privacy", component: Privacy},
    {path: "/projects", component: Projects}
];

export const router = createRouter({
    history: createWebHashHistory(),
    routes,
});
