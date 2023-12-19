/// <reference types="vite/client" />
import {Store} from "vuex";
import {RootState} from "./src/app/root";

declare module '@vue/runtime-core' {
    interface ComponentCustomProperties {
        $store: Store<RootState>;
    }
}