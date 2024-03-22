<template>
    <l-control position="topleft">
        <div class="leaflet-control-zoom leaflet-bar">
            <a @click.prevent="$emit('reset-view')"
               class="leaflet-control-zoom-in"
               href="#" title="reset"
               role="button"
               aria-label="reset">
                <vue-feather type="refresh-cw"
                             size="20"
                             class="align-middle"
                             style="margin-bottom: 3px; margin-right: 1px;"></vue-feather>
            </a>
        </div>
    </l-control>
</template>

<script lang="ts">
import {defineComponent} from "vue";
import {LControl} from "@vue-leaflet/vue-leaflet";
import VueFeather from "vue-feather";

export default defineComponent({
    components: {
        VueFeather,
        LControl
    }
})

</script>
