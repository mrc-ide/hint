<template>
    <div>
        <l-map ref="map" style="height: 800px; width: 100%" @ready="updateBounds" @vue:updated="updateBounds">
            <l-geo-json v-for="feature in currentFeatures"
                        ref="featureRefs"
                        :key="feature.properties!.area_id"
                        :geojson="feature"
                        :options-style="() => style">
            </l-geo-json>

            <map-empty-feature v-if="emptyFeature"></map-empty-feature>
            <template v-else>
                <reset-map @reset-view="updateBounds"></reset-map>
                <map-legend :indicator-metadata="colourIndicatorMetadata"
                            :scale-levels="colourScaleLevels"
                            :selected-scale="colourScale!"
                            :plot="plotName"></map-legend>
                <size-legend :indicator-metadata="sizeIndicatorMetadata"
                             :indicator-range="sizeRange!"
                             :selected-size-scale="sizeScale!"
                             :plot="plotName"></size-legend>
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
    getIndicatorMetadata,
    ScaleLevels,
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
import {CalibrateDataResponse, ChoroplethIndicatorMetadata} from "../../../generated";
import { ScaleSettings } from "../../../store/plotState/plotState";
import SizeLegend from "./SizeLegend.vue";
import {circleMarker, CircleMarker} from "leaflet";
import MapEmptyFeature from "../MapEmptyFeature.vue";
import {getFeatureData, tooltipContent} from "./utils";

const store = useStore<RootState>();
const plotName = "bubble";
type OutputData = CalibrateDataResponse["data"]

const plotData = computed<PlotData>(() => store.state.plotData[plotName]);
const getColourIndicator = () => {
    return store.state.plotSelections[plotName].filters.find(f => f.stateFilterId === "colourIndicator")!.selection[0].id
}

const getSizeIndicator = () => {
    return store.state.plotSelections[plotName].filters.find(f => f.stateFilterId === "sizeIndicator")!.selection[0].id
}
const colourIndicator = ref<string>(getColourIndicator());
const sizeIndicator = ref<string>(getSizeIndicator());
const colourIndicatorMetadata = computed<ChoroplethIndicatorMetadata>(() => {
    return getIndicatorMetadata(store, plotName, colourIndicator.value)
});
const sizeIndicatorMetadata = computed<ChoroplethIndicatorMetadata>(() => {
    return  getIndicatorMetadata(store, plotName, sizeIndicator.value)
});

const colourRange = ref<NumericRange | null>(null);
const colourScaleLevels = ref<ScaleLevels[]>([]);
const colourScale = ref<ScaleSettings | null>(null);
const colourScales = computed(() => {
    return store.state.plotState.output.colourScales
});

const sizeScale = ref<ScaleSettings | null>(null);
const sizeRange = ref<NumericRange | null>(null);
const sizeScales = computed(() => {
    return store.state.plotState.output.sizeScales
});

const features = store.state.baseline.shape ?
        store.state.baseline.shape.data.features as Feature[] : [] as Feature[];
const currentFeatures = ref<Feature[]>([]);
const featureData = ref<BubbleIndicatorValuesDict>({});

const map = ref<typeof LMap | null>(null);
const featureRefs = ref<typeof LGeoJson[]>([]);

const updateMap = () => {
    updateFeatures();
    updateSizeScales();
    updateMapColours();
};

const updateBubbleSizes = () => {
    updateSizeScales();
    updateFeatureData();
};

const updateMapColours = () => {
    colourIndicator.value = getColourIndicator();
    colourScale.value = colourScales.value[colourIndicator.value];
    colourRange.value = getIndicatorRange(colourIndicatorMetadata.value, colourScale.value, plotData.value as OutputData);
    colourScaleLevels.value = getColourScaleLevels(colourIndicatorMetadata.value, colourRange.value);
    updateFeatureData();
}

const updateSizeScales = () => {
    sizeIndicator.value = getSizeIndicator();
    sizeScale.value = sizeScales.value[sizeIndicator.value];
    sizeRange.value = getIndicatorRange(sizeIndicatorMetadata.value, sizeScale.value, plotData.value as OutputData);
}

const updateFeatures = () => {
    const selectedLevel = store.state.plotSelections[plotName].filters
            .find(f => f.stateFilterId === "detail")!.selection;
    currentFeatures.value = getVisibleFeatures(features, selectedLevel);
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

// Use watchers instead of computed
// When the plotSelections updates, the new data will have been fetched from the backend already
// so we can update the UI.
// We also want to update the UI when scale selections get changed.
// But updating the plotSelections will also update the scale selections
// So using computed we end up with duplicate updates when plotSelections change.
// So we use watch instead for more control over when things are updated.
watch(() => [store.state.plotSelections[plotName]], updateMap);
watch(colourScales, updateMapColours)
watch(sizeScales, updateBubbleSizes)

const style = {
    className: "geojson-grey"
};

onMounted(() => {
    updateFeatures();
    updateMapColours();
    updateSizeScales();
    updateFeatureData();
});
</script>
