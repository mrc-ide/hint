<template>
    <l-control position="bottomleft">
        <div class="legend-container">
            <div class="legend-element map-control p-3">
                <label class="text-center pt-1 pb-1 d-block">{{metadata.name}}</label>
                <svg :width="width" :height="height" class="d-block">
                    <circle v-for="(circle, index) in circles" :key="'circle-' + index" stroke="#aaa" stroke-width="1"
                            fill-opacity="0"
                            :r="circle.radius" :cx="midX" :cy="circle.y"></circle>
                    <text v-for="(circle, index) in circles" :key="'text-' + index" text-anchor="middle"
                          :x="midX" :y="circle.textY">{{ circle.text }}
                    </text>
                </svg>
                <div class="adjust-scale mt-1">
                    <a @click="toggleAdjust" href="" class="float-end">
                        <span v-if="showAdjust" v-translate="'done'"></span>
                        <span v-if="!showAdjust" v-translate="'adjustScale'"></span>
                    </a>
                </div>
            </div>
            <map-adjust-scale class="legend-element legend-adjust map-control" name="size" :step="scaleStep"
                              :show="showAdjust" :scale="sizeScale" @update="update" :metadata="metadata">
            </map-adjust-scale>
        </div>
    </l-control>
</template>

<script lang="ts">
    import {LControl} from "@vue-leaflet/vue-leaflet";
    import {getRadius} from "./utils";
    import {NumericRange} from "../../../types";
    import {formatLegend, scaleStepFromMetadata} from "./../utils";
    import {ChoroplethIndicatorMetadata} from "../../../generated";
    import {ScaleSettings} from "../../../store/plottingSelections/plottingSelections";
    import MapAdjustScale from "../MapAdjustScale.vue";
    import { PropType, defineComponent } from "vue";

    export default defineComponent({
        name: "SizeLegend",
        props: {
            indicatorRange: {
                type: Object as PropType<NumericRange>,
                required: true
            },
            minRadius: {
                type: Number,
                required: true
            },
            maxRadius: {
                type: Number,
                required: true
            },
            metadata: {
                type: Object as PropType<ChoroplethIndicatorMetadata>,
                required: true
            },
            sizeScale: {
                type: Object as PropType<ScaleSettings>,
                required: true
            }
        },
        components: {
            LControl,
            MapAdjustScale
        },
        data: function () {
            return {
                steps: [0.1, 0.25, 0.5, 1],
                showAdjust: false
            }
        },
        computed: {
            width: function () {
                return (this.maxRadius * 2) + 2; //leave room for stroke width
            },
            height: function () {
                return (this.maxRadius * 2) + 10; //leave room for the top text
            },
            midX: function () {
                return this.width / 2;
            },
            circles: function () {
                if (isNaN(this.indicatorRange.min) || isNaN(this.indicatorRange.max)) {
                    return [];
                } else if (this.indicatorRange.min == this.indicatorRange.max) {
                    // only one value in range - show max circle only
                    return [this.circleFromRadius(this.maxRadius, this.indicatorRange.max, false)];
                } else {
                    //We treat the minimum circle differently, since the smallest radius is actually likely to cover quite
                    //a wide range of low outliers, so we show the value for the next pixel up and prefix with '<'
                    const nextMinRadius = this.minRadius + 1;
                    const valueScalePoint = this.valueScalePointFromRadius(nextMinRadius);
                    const nextValue = this.valueFromValueScalePoint(valueScalePoint);
                    const minCircle = this.circleFromRadius(this.minRadius, nextValue, true);

                    const nonMinCircles = this.steps.map((s: number) => {
                        const value = this.indicatorRange.min + (s * (this.indicatorRange.max - this.indicatorRange.min));
                        const r = getRadius(value, this.indicatorRange.min, this.indicatorRange.max, this.minRadius, this.maxRadius);
                        return this.circleFromRadius(r, value, false)
                    });

                    return [minCircle, ...nonMinCircles];
                }
            },
            scaleStep: function () {
                return this.metadata ? scaleStepFromMetadata(this.metadata) : 1;
            },
        },
        methods: {
            circleFromRadius: function (r: number, value: number, under = false) {
                const y = this.height - r;

                const { format, scale, accuracy} = this.metadata;
                let text = formatLegend(value, format, scale)
                const zeros = ['0', '0%', '0.0%', '0.00%']
                if (under && !zeros.includes(text)) {
                    text = "<" + text;
                }

                return {y: y, radius: r, text: text, textY: y - r}
            },
            valueScalePointFromRadius: function (r: number) {
                return (Math.pow(r, 2) - Math.pow(this.minRadius, 2)) /
                    (Math.pow(this.maxRadius, 2) - Math.pow(this.minRadius, 2));
            },
            valueFromValueScalePoint: function (valueScalePoint: number) {
                return (valueScalePoint * (this.indicatorRange.max - this.indicatorRange.min))
                    + this.indicatorRange.min;
            },
            toggleAdjust: function (e: Event) {
                e.preventDefault();
                this.showAdjust = !this.showAdjust;
            },
            update: function (scale: ScaleSettings) {
                this.$emit("update", scale);
            }
        }
    });
</script>
