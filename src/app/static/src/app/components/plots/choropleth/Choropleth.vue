<template>
    <div>
        <l-map ref="map" style="height: 800px; width: 100%" @ready="updateBounds">
            <l-geo-json v-for="feature in currentFeatures"
                        ref="featureRefs"
                        :key="feature.properties.area_id"
                        :geojson="feature"
                        :options="createTooltips"
                        :options-style="getStyle(feature)">
            </l-geo-json>
            <reset-map @reset-view="updateBounds"></reset-map>
            <map-legend :indicator-metadata="indicatorMetadata"
                        :scale-levels="scaleLevels"
                        :selected-scale="selectedScale"></map-legend>
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
    getVisibleFeatures,
    getFeatureData,
    initialiseScaleFromMetadata,
} from "./utils";
import ResetMap from "./ResetMap.vue";
import MapLegend from "./MapLegend.vue";
import {getColourRange, getScaleLevels} from "../utils";
import {IndicatorValuesDict, NumericRange} from "../../../types";
import {ChoroplethIndicatorMetadata} from "../../../generated";
import { ScaleSettings } from "../../../store/plotState/plotState";
import {useMapTooltips} from "../useMapTooltips";
import {useUpdateScale} from "../useUpdateScale";

const store = useStore<RootState>();
const plotData = computed<PlotData>(() => store.state.plotData.choropleth);

const {updateOutputColourScale} = useUpdateScale();
const indicatorMetadata = ref<ChoroplethIndicatorMetadata>(store.getters["modelCalibrate/indicatorMetadata"]);
const colourRange = ref<NumericRange | null>(null);
const scaleLevels = ref<any>(null);
const selectedScale = ref<ScaleSettings | null>(null);

const features = store.state.baseline.shape ?
    store.state.baseline.shape.data.features as Feature[] : [] as Feature[];
const currentFeatures = ref<Feature[]>([]);
const featureData = ref<IndicatorValuesDict>({});

const map = ref<typeof LMap | null>(null);
const featureRefs = ref<typeof LGeoJson[]>([]);

const {createTooltips, updateTooltips} = useMapTooltips(featureData, indicatorMetadata, currentFeatures, featureRefs)

const updateMap = () => {
    updateFeatures();
    updateColourScales();
    updateTooltips();
};

const colourScales = computed(() => {
    return store.state.plotState.output.colourScales
});

const updateColourScales = () => {
    const colourScales = store.state.plotState.output.colourScales;
    const selectedIndicator =  store.getters["plotSelections/selectedIndicator"];
    selectedScale.value = colourScales[selectedIndicator];
    if (!selectedScale.value) {
        selectedScale.value = initialiseScaleFromMetadata(indicatorMetadata.value);
        updateOutputColourScale(selectedScale.value);
    }
    colourRange.value = getColourRange(indicatorMetadata.value, selectedScale.value, plotData.value);
    scaleLevels.value = getScaleLevels(indicatorMetadata.value, colourRange.value);
    featureData.value = getFeatureData(
            plotData.value,
            indicatorMetadata.value,
            colourRange.value ? colourRange.value : {max: 1, min: 0}
    );
}

const updateFeatures = () => {
    indicatorMetadata.value = store.getters["modelCalibrate/indicatorMetadata"];
    const selectedLevel = store.state.plotSelections.choropleth.filters
            .find(f => f.stateFilterId === "detail")!.selection;
    const selectedAreas = store.state.plotSelections.choropleth.filters
            .find(f => f.stateFilterId === "area")!.selection;
    currentFeatures.value = getVisibleFeatures(features, selectedLevel, selectedAreas);
}

const updateBounds = () => {
    if (featureRefs.value.length > 0) {
        map.value?.leafletObject.fitBounds(featureRefs.value.map(f => f.leafletObject.getBounds()));
    }
};

// Watch on instead of using computed.
// When the plotData updates, we want to update the colours, the features and the legend.
// If we use computed this will cause multiple updates
// 1. When a selection changes it will update immediately
// 2. After the plotData has been fetched async it will update again
// This can cause the map to appear to flicker as it updates with old scales
// then quickly updates after new data has been fetched.
// Instead manually watch on the plot data changes, and also trigger this when a user changes the
// scale selection
watch(plotData, updateMap)
watch(colourScales, updateColourScales)
watch(featureRefs.value, updateBounds);

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

const getStyle = (feature: Feature) => {
    return {
        className: "geojson",
        fillColor: getColour(feature)
    }
}

onMounted(() => {
    updateFeatures();
    updateColourScales();
});

</script>
