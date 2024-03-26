<template>
    <header class="mb-5">
        <nav class="navbar navbar-dark bg-secondary">
            <div class="container-fluid">
                <div class="navbar-header">
                    {{ title }}
                </div>
                <router-link id="projects-link" v-if="!isGuest" to="/projects" class="ml-2 pr-2"
                             v-translate="'projects'"
                             style="flex:auto"></router-link>
                <span v-if="!isGuest" class="pr-2 mr-2 border-right text-white">
                    <span v-translate="'loggedInAs'"></span> {{ user }}
                </span>
                <div v-else style="flex:auto"></div>
                <hintr-version-menu class="pr-2 mr-2 border-right"/>
                <online-support-menu class="pr-2 mr-2 border-right"/>
                <a v-if="!isGuest" href="/logout" class="pr-2 mr-2 border-right" v-translate="'logout'">
                </a>
                <a v-if="isGuest" href="/login" class="pr-2 mr-2 border-right" v-translate="'logIn'">
                </a>
                <language-menu></language-menu>
            </div>
        </nav>
    </header>
</template>
<script lang="ts">
    import {mapGetters} from 'vuex';
    import LanguageMenu from "./LanguageMenu.vue";
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
            LanguageMenu,
            HintrVersionMenu,
            OnlineSupportMenu
        }
    })
</script>
