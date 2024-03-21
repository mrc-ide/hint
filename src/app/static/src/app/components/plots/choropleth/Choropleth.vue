<template>
    <div>
        <l-map ref="map" style="height: 800px; width: 100%" @ready="updateBounds" @vue:updated="updateBounds">
            <l-geo-json v-for="feature in currentFeatures"
                        ref="featureRefs"
                        :key="feature.properties.area_id"
                        :geojson="feature"
                        :options="createTooltips"
                        :options-style="() => {return {...style, fillColor: getColour(feature)}}">
            </l-geo-json>
            <map-empty-feature v-if="emptyFeature"></map-empty-feature>
            <template v-else>
                <reset-map @reset-view="updateBounds"></reset-map>
                <map-legend :indicator-metadata="indicatorMetadata"
                            :scale-levels="scaleLevels"
                            :selected-scale="selectedScale"
                            @update:selected-scale="updateColourScales"></map-legend>
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
import {IndicatorValuesDict, NumericRange} from "../../../types";
import {ChoroplethIndicatorMetadata} from "../../../generated";
import { ScaleSettings } from "../../../store/plotState/plotState";
import {useChoroplethTooltips} from "./useChoroplethTooltips";
import {useUpdateScale} from "../useUpdateScale";
import {getFeatureData} from "./utils";
import MapEmptyFeature from "../MapEmptyFeature.vue";

const store = useStore<RootState>();
const plotData = computed<PlotData>(() => store.state.plotData.choropleth);

const {updateOutputColourScale} = useUpdateScale();
const indicatorMetadata = ref<ChoroplethIndicatorMetadata>(store.getters["modelCalibrate/choroplethColourMetadata"]);
const colourRange = ref<NumericRange | null>(null);
const scaleLevels = ref<any>(null);
const selectedScale = ref<ScaleSettings | null>(null);

const features = store.state.baseline.shape ?
    store.state.baseline.shape.data.features as Feature[] : [] as Feature[];
const currentFeatures = ref<Feature[]>([]);
const featureData = ref<IndicatorValuesDict>({});

const map = ref<typeof LMap | null>(null);
const featureRefs = ref<typeof LGeoJson[]>([]);

const {createTooltips, updateTooltips} = useChoroplethTooltips(featureData, indicatorMetadata, currentFeatures, featureRefs)

const updateMap = () => {
    updateFeatures();
    updateColourScales();
    updateTooltips();
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

const updateColourScales = () => {
    const colourScales = store.state.plotState.output.colourScales;
    const selectedIndicator =  store.getters["plotSelections/choroplethColourIndicator"];
    selectedScale.value = colourScales[selectedIndicator];
    if (!selectedScale.value) {
        selectedScale.value = initialiseScaleFromMetadata(indicatorMetadata.value);
        updateOutputColourScale(selectedScale.value);
    }
    colourRange.value = getIndicatorRange(indicatorMetadata.value, selectedScale.value, plotData.value);
    scaleLevels.value = getColourScaleLevels(indicatorMetadata.value, colourRange.value);
    featureData.value = getFeatureData(
        plotData.value,
        indicatorMetadata.value,
        colourRange.value ? colourRange.value : {max: 1, min: 0}
    );
}

const updateFeatures = () => {
    indicatorMetadata.value = store.getters["modelCalibrate/choroplethColourMetadata"];
    const selectedLevel = store.state.plotSelections.choropleth.filters
        .find(f => f.stateFilterId === "detail")!.selection;
    const selectedAreas = store.state.plotSelections.choropleth.filters
        .find(f => f.stateFilterId === "area")!.selection;
    currentFeatures.value = getVisibleFeatures(features, selectedLevel, selectedAreas);
}

// Update bounds can be called multiple times by v-node-updated, but
// I can't find an appropriate thing to watch to trigger this only once
// so debounce it instead. If the bound update is called twice in quick
// succession, it kills the animation. Debouncing this means it should
// update smoothly
const updateBounds = debounce_leading(() => {
    if (featureRefs.value.length > 0) {
        map.value?.leafletObject.fitBounds(featureRefs.value.map(f => f.leafletObject.getBounds()));
    }
}, 50);

const showColour = (feature: Feature) => {
    return featureData.value[feature.properties!.area_id]
};

const getColour = (feature: Feature) => {
    if (showColour(feature)) {
        return featureData.value[feature.properties!.area_id].color;
    } else {
        //show a lighter grey than the outlines if no data
        //so unselected regions are still distinguishable
        return "rgb(200,200,200)";
    }
};

const style = {
    className: "geojson"
};

const emptyFeature = computed(() => {
    return currentFeatures.value.length == 0
});

onMounted(() => {
    updateFeatures();
    updateColourScales();
});
</script>
