<template>
    <div>
        <l-map ref="map" style="height: 800px; width: 100%" @ready="updateBounds" @vue:updated="updateBounds">
            <l-geo-json v-for="feature in currentFeatures"
                        ref="featureRefs"
                        :key="feature.properties.area_id"
                        :geojson="feature"
                        :options-style="() => style">
            </l-geo-json>

            <map-empty-feature v-if="emptyFeature"></map-empty-feature>
            <template v-else>
                <reset-map @reset-view="updateBounds"></reset-map>
                <map-legend :indicator-metadata="colourIndicatorMetadata"
                            :scale-levels="colourScaleLevels"
                            :selected-scale="colourScale"
                            @update:selected-scale="updateBubbleColours"></map-legend>
                <size-legend :indicator-metadata="sizeIndicatorMetadata"
                             :indicator-range="sizeRange"
                             :selected-size-scale="sizeScale"
                             @update:selected-scale="updateBubbleSizes"></size-legend>
            </template>
        </l-map>
    </div>

</template>

<script setup lang="ts">
import {computed, onMounted, ref, watch} from "vue";
import {useStore} from "vuex";
import {RootState} from "../../../root";
import {PlotData} from "../../../store/plotData/plotData";
import { LMap, LGeoJson } from "@vue-leaflet/vue-leaflet";
import { Feature } from "geojson";
import {
    initialiseScaleFromMetadata,
} from "../utils";
import ResetMap from "../ResetMap.vue";
import MapLegend from "../MapLegend.vue";
import {
    getVisibleFeatures,
    getIndicatorRange,
    getColourScaleLevels,
    debounce_leading
} from "../utils";
import {BubbleIndicatorValuesDict, NumericRange} from "../../../types";
import {ChoroplethIndicatorMetadata} from "../../../generated";
import { ScaleSettings } from "../../../store/plotState/plotState";
import {useUpdateScale} from "../useUpdateScale";
import SizeLegend from "@/app/components/plots/bubble/SizeLegend.vue";
import {circleMarker, CircleMarker} from "leaflet";
import MapEmptyFeature from "../MapEmptyFeature.vue";
import {getFeatureData, tooltipContent} from "./utils";

const store = useStore<RootState>();
const plotData = computed<PlotData>(() => store.state.plotData.bubble);

const {updateOutputColourScale, updateOutputSizeScale} = useUpdateScale();
const colourIndicatorMetadata = ref<ChoroplethIndicatorMetadata>(store.getters["modelCalibrate/bubbleColourMetadata"]);
const sizeIndicatorMetadata = ref<ChoroplethIndicatorMetadata>(store.getters["modelCalibrate/bubbleSizeMetadata"]);

const colourRange = ref<NumericRange | null>(null);
const colourScaleLevels = ref<any>(null);
const colourScale = ref<ScaleSettings | null>(null);

const sizeScale = ref<ScaleSettings | null>(null);
const sizeRange = ref<NumericRange | null>(null);

const features = store.state.baseline.shape ?
    store.state.baseline.shape.data.features as Feature[] : [] as Feature[];
const currentFeatures = ref<Feature[]>([]);
const featureData = ref<BubbleIndicatorValuesDict>({});

const map = ref<typeof LMap | null>(null);
const featureRefs = ref<typeof LGeoJson[]>([]);

const updateMap = () => {
    updateFeatures();
    updateColourScales();
    updateSizeScales();
    updateFeatureData();
};
// Watch on the plotData only instead of using computed. Here we want to update the colours,
// the features and the legend. If we use computed this will cause multiple updates
// 1. When a selection changes it will update immediately
// 2. After the plotData has been fetched async it will update again
// This can cause the map to appear to flicker as it updates with old scales
// then quickly updates after new data has been fetched.
// Instead manually watch on the plot data changes, and also trigger this when a user changes the
// scale selection
watch([plotData], updateMap)

const updateBubbleSizes = () => {
    updateSizeScales();
    updateFeatureData()
    updateBounds();
};

const updateBubbleColours = () => {
    updateColourScales();
    updateFeatureData();
}

const updateColourScales = () => {
    colourIndicatorMetadata.value = store.getters["modelCalibrate/bubbleColourMetadata"];
    const colourScales = store.state.plotState.output.colourScales;
    const colourIndicator = store.getters["plotSelections/bubbleColourIndicator"];
    colourScale.value = colourScales[colourIndicator];
    if (!colourScale.value) {
        colourScale.value = initialiseScaleFromMetadata(colourIndicatorMetadata.value);
        updateOutputColourScale(colourScale.value);
    }
    colourRange.value = getIndicatorRange(colourIndicatorMetadata.value, colourScale.value, plotData.value);
    colourScaleLevels.value = getColourScaleLevels(colourIndicatorMetadata.value, colourRange.value);
}

const updateSizeScales = () => {
    sizeIndicatorMetadata.value = store.getters["modelCalibrate/bubbleSizeMetadata"];
    const sizeScales = store.state.plotState.output.sizeScales;
    const sizeIndicator =  store.getters["plotSelections/bubbleSizeIndicator"];
    sizeScale.value = sizeScales[sizeIndicator];
    if (!sizeScale.value) {
        sizeScale.value = initialiseScaleFromMetadata(sizeIndicatorMetadata.value);
        updateOutputSizeScale(sizeScale.value);
    }
    sizeRange.value = getIndicatorRange(sizeIndicatorMetadata.value, sizeScale.value, plotData.value);
}

const updateFeatures = () => {
    colourIndicatorMetadata.value = store.getters["modelCalibrate/bubbleColourMetadata"];
    const selectedLevel = store.state.plotSelections.bubble.filters
        .find(f => f.stateFilterId === "detail")!.selection;
    // Don't filter on areas for bubble as we want to always show full map
    currentFeatures.value = getVisibleFeatures(features, selectedLevel, null);
};

const updateFeatureData = () => {
    featureData.value = getFeatureData(
        plotData.value,
        sizeIndicatorMetadata.value,
        colourIndicatorMetadata.value,
        sizeRange.value ? sizeRange.value : {max: 1, min: 0},
        colourRange.value ? colourRange.value : {max: 1, min: 0},
        10,
        70
    );
};

const emptyFeature = computed(() => {
    return featuresWithBubbles.value.length == 0
});

const circles = ref<CircleMarker<any>[]>([]);

const buildBubbles = () => {
    if (circles.value.length > 0) {
        circles.value.forEach(circle => circle.remove())
        circles.value = []
    }
    let circlesArray: CircleMarker[] = [];
    if (!emptyFeature.value) {
        currentFeatures.value.forEach((feature: Feature) => {
            if (!showBubble(feature)) {
                return;
            }
            let circle = circleMarker([feature.properties?.center_y, feature.properties?.center_x], {
                radius: getRadius(feature),
                fillOpacity: 0.75,
                opacity: 0.75,
                color: getColour(feature),
                fillColor: getColour(feature),
            }).bindTooltip(tooltipContent(
                feature,
                featureData.value,
                colourIndicatorMetadata.value,
                sizeIndicatorMetadata.value))
            circlesArray.push(circle)
        })
        circles.value = circlesArray
    }
};

const getFeatureFromAreaId = (areaId: string) => {
    return featureRefs.value.find(f => f.geojson.properties.area_id === areaId);
};

const featuresWithBubbles = computed(() => {
    return currentFeatures.value.filter(feature => showBubble(feature));
});

// Update bounds can be called multiple times by v-node-updated, but
// I can't find an appropriate thing to watch to trigger this only once
// so debounce it instead. If the bound update is called twice in quick
// succession, it kills the animation. Debouncing this means it should
// update smoothly
const updateBounds = debounce_leading(() => {
    buildBubbles();
    if (featuresWithBubbles.value.length > 0) {
        map.value?.leafletObject.fitBounds(featuresWithBubbles.value.map(feature => {
            const featureRef = getFeatureFromAreaId(feature.properties!.area_id)
            return featureRef?.leafletObject.getBounds()
        }));
        if (circles.value.length > 0) {
            circles.value.forEach(circle => circle.addTo(map.value?.leafletObject))
        }
    }
}, 50)

const showBubble = (feature: Feature) => {
    return featureData.value[feature.properties!.area_id]
};

const getColour = (feature: Feature) => {
    return featureData.value[feature.properties!.area_id].color;
};

const getRadius = (feature: Feature) => {
    return featureData.value[feature.properties!.area_id].radius;
};

const style = {
    className: "geojson-grey"
};


onMounted(() => {
    updateFeatures();
    updateColourScales();
    updateSizeScales();
    updateFeatureData();
});
</script>
