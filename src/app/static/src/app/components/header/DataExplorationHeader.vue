<template>
    <header class="mb-5">
        <nav class="navbar navbar-dark bg-secondary">
            <div class="container-fluid">
                <div class="navbar-brand-secondary">
                    {{ title }}
                </div>
                <div style="flex: 1 1 auto;" class="ms-2"><a href="/" v-translate="'runModel'"></a></div>
                <span v-if="!isGuest" class="pe-2 me-2 border-end text-white">
                    <span v-translate="'loggedInAs'"></span> {{ user }}
                </span>
                <hintr-version-menu class="pe-2 me-2 border-end"/>
                <data-exploration-support-menu class="pe-2 me-2 border-end"/>
                <a :href="(helpFilename as string)"
                   id="helpFile"
                   target="_blank"
                   class="pe-2 me-2 border-end"
                   v-translate="'dataExplorationHelp'">
                </a>
                <a v-if="!isGuest" :href="'/logout'" class="pe-2 me-2 border-end" v-translate="'logout'">
                </a>
                <a v-if="isGuest" :href="'/login?redirectTo=explore'" class="pe-2 me-2 border-end" v-translate="'logIn'">
                </a>
                <language-menu></language-menu>
            </div>
        </nav>
    </header>
</template>
<script lang="ts">

    import {mapGetters} from 'vuex';
    import LanguageMenu from "./LanguageMenu.vue";
    import {Language} from "../../store/translations/locales";
    import {HelpFile, mapStateProp} from "../../utils";
    import HintrVersionMenu from "./HintrVersionMenu.vue";
    import {DataExplorationState} from "../../store/dataExploration/dataExploration";
    import DataExplorationSupportMenu from "./DataExplorationSupportMenu.vue";
    import { defineComponent } from 'vue';

    export default defineComponent({
        computed: {
            helpFilename: mapStateProp<DataExplorationState, string>(null,
                (state: DataExplorationState) => {
                    if (state.language == Language.fr) {
                        return HelpFile.french;
                    }
                    return HelpFile.english;
                }),
            ...mapGetters(["isGuest"])
        },
        props: {
            title: {
                type: String,
                required: true
            },
            user: {
                type: String,
                required: true
            }
        },
        components: {
            LanguageMenu,
            HintrVersionMenu,
            DataExplorationSupportMenu
        }
    })
</script>
