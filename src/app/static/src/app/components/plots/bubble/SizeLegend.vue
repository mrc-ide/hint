<template>
    <l-control position="bottomleft">
        <div class="legend-container">
            <div class="legend-element map-control p-3">
                <label class="text-center pt-1 pb-1 d-block">{{indicatorMetadata.name}}</label>
                <svg :width="width" :height="height" class="d-block">
                    <circle v-for="(circle, index) in circles" :key="'circle-' + index" stroke="#aaa" stroke-width="1"
                            fill-opacity="0"
                            :r="circle.radius" :cx="midX" :cy="circle.y"></circle>
                    <text v-for="(circle, index) in circles" :key="'text-' + index" text-anchor="middle"
                          :x="midX" :y="circle.textY">{{ circle.text }}
                    </text>
                </svg>
                <div class="adjust-scale mt-1">
                    <a @click.prevent="showAdjust = !showAdjust" href="" class="float-right">
                        <span v-if="showAdjust" v-translate="'done'"></span>
                        <span v-if="!showAdjust" v-translate="'adjustScale'"></span>
                    </a>
                </div>
            </div>
            <map-adjust-scale v-if="showAdjust"
                              class="legend-element legend-adjust map-control"
                              :scale="Scale.Size"
                              :indicator-metadata="indicatorMetadata"
                              :selected-scale="selectedSizeScale"
                              :plot="plot"
                              @update:selected-scale="$emit('update:selectedScale')">
            </map-adjust-scale>
        </div>
    </l-control>
</template>

<script lang="ts">
import {computed, defineComponent, PropType, ref} from "vue";
import {ChoroplethIndicatorMetadata} from "../../../generated";
import MapAdjustScale from "../MapAdjustScale.vue";
import {Scale, ScaleSettings} from "../../../store/plotState/plotState";
import { NumericRange } from "../../../types";
import { formatLegend } from "../utils";
import {getRadius} from "./utils";
import {LControl} from "@vue-leaflet/vue-leaflet";
import { PlotName } from "../../../store/plotSelections/plotSelections";

export default defineComponent({
    components: {LControl, MapAdjustScale},
    props: {
        indicatorMetadata: {
            type: Object as PropType<ChoroplethIndicatorMetadata>,
            required: true
        },
        indicatorRange: {
            type: Object as PropType<NumericRange>,
            required: true
        },
        selectedSizeScale: {
            type: Object as PropType<ScaleSettings>,
            required: true
        },
        plot: {
            type: String as PropType<PlotName>,
            required: true
        }
    },
    setup(props) {
        const minRadius = 10;
        const maxRadius = 70;
        const steps = [0.1, 0.25, 0.5, 1];
        const width = (maxRadius * 2) + 2; // leave room for stroke width
        const height = (maxRadius * 2) + 10; // leave room for the top text
        const midX = width / 2;

        const circles = computed(() => {
            if (isNaN(props.indicatorRange.min) || isNaN(props.indicatorRange.max)) {
                return [];
            } else if (props.indicatorRange.min == props.indicatorRange.max) {
                // only one value in range - show max circle only
                return [circleFromRadius(maxRadius, props.indicatorRange.max, false)];
            } else {
                //We treat the minimum circle differently, since the smallest radius is actually likely to cover quite
                //a wide range of low outliers, so we show the value for the next pixel up and prefix with '<'
                const nextMinRadius = minRadius + 1;
                const valueScalePoint = valueScalePointFromRadius(nextMinRadius);
                const nextValue = valueFromValueScalePoint(valueScalePoint);
                const minCircle = circleFromRadius(minRadius, nextValue, true);

                const nonMinCircles = steps.map((s: number) => {
                    const value = props.indicatorRange.min + (s * (props.indicatorRange.max - props.indicatorRange.min));
                    const r = getRadius(value, props.indicatorRange.min, props.indicatorRange.max, minRadius, maxRadius);
                    return circleFromRadius(r, value, false)
                });

                return [minCircle, ...nonMinCircles];
            }
        })

        const circleFromRadius = (r: number, value: number, under = false) => {
            const y = height - r;

            const { format, scale } = props.indicatorMetadata;
            let text = formatLegend(value, format, scale)
            const zeros = ['0', '0%', '0.0%', '0.00%']
            if (under && !zeros.includes(text)) {
                text = "<" + text;
            }

            return {y: y, radius: r, text: text, textY: y - r}
        }

        const valueScalePointFromRadius = (r: number) => {
            return (Math.pow(r, 2) - Math.pow(minRadius, 2)) /
                    (Math.pow(maxRadius, 2) - Math.pow(minRadius, 2));
        }

        const valueFromValueScalePoint = (valueScalePoint: number) => {
            return (valueScalePoint * (props.indicatorRange.max - props.indicatorRange.min))
                    + props.indicatorRange.min;
        }

        const showAdjust = ref<boolean>(false);

        return {
            showAdjust,
            width,
            height,
            midX,
            circles,
            Scale
        }
    }
})
</script>
