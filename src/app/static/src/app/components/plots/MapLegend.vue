<template>
    <l-control position="bottomright">
        <div class="legend-container">
            <map-adjust-scale v-if="showAdjust"
                              class="legend-element legend-adjust map-control"
                              :scale="Scale.Colour"
                              :indicator-metadata="indicatorMetadata"
                              :selected-scale="selectedScale"
                              @update:selected-scale="$emit('update:selectedScale')"
                              :plot="plot">
            </map-adjust-scale>
            <div class="legend-element map-control p-3">
                <label>{{indicatorMetadata.name}}</label>
                <div class="legend" v-for="(level, index) in scaleLevels" v-bind:key="index">
                    <i v-bind:style="level.style"></i>
                    <span class="level">{{ level.label }}</span>
                    <span class="hidden" style="display: none">{{ level.style }}</span>
                    <br/>
                </div>
                <div v-if="!!colourScales" class="adjust-scale mt-1">
                    <a @click.prevent="showAdjust = !showAdjust" href="">
                        <span v-if="showAdjust" v-translate="'done'"></span>
                        <span v-if="!showAdjust" v-translate="'adjustScale'"></span>
                    </a>
                </div>
            </div>
        </div>
    </l-control>
</template>

<script lang="ts">

import {computed, defineComponent, PropType, ref} from "vue";
import {LControl} from "@vue-leaflet/vue-leaflet";
import MapAdjustScale from "./MapAdjustScale.vue";
import {useStore} from "vuex";
import {RootState} from "../../root";
import {ChoroplethIndicatorMetadata} from "../../generated";
import {Scale, ScaleSettings} from "../../store/plotState/plotState";
import {ScaleLevels} from "./utils";
import { PlotName } from "../../store/plotSelections/plotSelections";

export default defineComponent({
    props: {
        indicatorMetadata: {
            type: Object as PropType<ChoroplethIndicatorMetadata>,
            required: true
        },
        scaleLevels: {
            type: Object as PropType<ScaleLevels[]>,
            required: true
        },
        selectedScale: {
            type: Object as PropType<ScaleSettings>,
            required: true
        },
        plot: {
            type: String as PropType<PlotName>,
            required: true
        }
    },
    setup() {
        const store = useStore<RootState>();
        const colourScales = computed(() => {
            return store.state.plotState.output.colourScales;
        });

        const showAdjust = ref<boolean>(false);

        return {
            colourScales,
            showAdjust,
            Scale
        }
    },
    components: {
        LControl,
        MapAdjustScale
    }
})
</script>
