<template>
    <l-control position="topleft" class="empty-feature-center">
        <div class="map-control empty-feature-size px-3 py-2">
            <span class="lead">
                <strong v-translate="'noChartData'"></strong>
            </span>
        </div>
    </l-control>
</template>

<script lang="ts">
import {defineComponent} from "vue";
import {LControl} from "@vue-leaflet/vue-leaflet";

export default defineComponent({
    components: {
        LControl
    }
});
</script>
