<template>
    <header class="mb-5">
        <nav class="navbar navbar-dark bg-secondary">
            <div class="container-fluid">
                <div class="navbar-brand">
                    {{ title }}
                </div>
                <router-link id="projects-link" v-if="!isGuest" to="/projects" class="ms-2 pe-2 border-end"
                             v-translate="'projects'"
                             style="flex:none"></router-link>
                <file-menu :title="title || ''"></file-menu>
                <span v-if="!isGuest" class="pe-2 me-2 border-end text-white">
                    <span v-translate="'loggedInAs'"></span> {{ user }}
                </span>
                <hintr-version-menu class="pe-2 me-2 border-end"/>
                <online-support-menu class="pe-2 me-2 border-end"/>
                <a v-if="!isGuest" href="/logout" class="pe-2 me-2 border-end" v-translate="'logout'">
                </a>
                <a v-if="isGuest" href="/login" class="pe-2 me-2 border-end" v-translate="'logIn'">
                </a>
                <language-menu></language-menu>
            </div>
        </nav>
    </header>
</template>
<script lang="ts">
    import {mapGetters} from 'vuex';
    import FileMenu from "./FileMenu.vue";
    import LanguageMenu from "./LanguageMenu.vue";
    import {Language} from "../../store/translations/locales";
    import {HelpFile, mapStateProp} from "../../utils";
    import {RootState} from "../../root";
    import HintrVersionMenu from "./HintrVersionMenu.vue";
    import OnlineSupportMenu from "./OnlineSupportMenu.vue";
    import { defineComponent } from "vue";

    export default defineComponent({
        computed: {
            ...mapGetters(["isGuest"])
        },
        props: {
            title: {
                type: String,
                required: false
            },
            user: {
                type: String,
                required: false
            }
        },
        components: {
            FileMenu,
            LanguageMenu,
            HintrVersionMenu,
            OnlineSupportMenu
        }
    })
</script>
