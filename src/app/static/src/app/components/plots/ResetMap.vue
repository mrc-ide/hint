<template>
    <l-control position="topleft">
        <div class="leaflet-control-zoom leaflet-bar">
            <a @click.prevent="$emit('reset-view')" 
                class="leaflet-control-zoom-in" 
                href="#" :title="tooltipContent('resetView')" 
                role="button" 
                :aria-label="tooltipContent('resetView')">
                <vue-feather type="refresh-cw"
                             size="20"
                             class="align-middle"
                             style="margin-bottom: 3px; margin-end: 1px;"></vue-feather>
            </a>
        </div>                    
    </l-control>
</template>

<script lang="ts">
    import {LControl} from "@vue-leaflet/vue-leaflet";
    import {mapStateProp} from "../../utils";
    import {RootState} from "../../root";
    import VueFeather from "vue-feather";
    import i18next from "i18next";
    import {Language} from "../../store/translations/locales";
    import { defineComponent } from "vue";

    export default defineComponent({
        components: {
            VueFeather,
            LControl
        },
        computed: {
            currentLanguage: mapStateProp<RootState, Language>(
                null,
                (state: RootState) => state.language
            )
        },
        methods: {
            tooltipContent(tooltipValue: string) {
                return i18next.t(tooltipValue, {
                    lng: this.currentLanguage,
                });
            }
        }
    });
</script>
