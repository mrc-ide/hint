<template>
    <div>
        <l-map ref="map" style="height: 800px; width: 100%" @ready="updateBounds" @vue:updated="updateBounds">
            <l-geo-json v-for="feature in currentFeatures"
                        ref="featureRefs"
                        :key="feature.properties!.area_id"
                        :geojson="feature"
                        :options="createTooltips"
                        :options-style="() => getStyle(feature)">
            </l-geo-json>
            <map-empty-feature v-if="emptyFeature"></map-empty-feature>
            <template v-else>
                <reset-map @reset-view="updateBounds"></reset-map>
                <map-legend :indicator-metadata="indicatorMetadata"
                            :scale-levels="scaleLevels"
                            :selected-scale="selectedScale!"
                            :plot="plot"></map-legend>
            </template>
        </l-map>
    </div>

</template>

<script setup lang="ts">
import {PropType, computed, onMounted, ref, toRefs, watch} from "vue";
import {useStore} from "vuex";
import {RootState} from "../../../root";
import { LMap, LGeoJson } from "@vue-leaflet/vue-leaflet";
import { Feature } from "geojson";
import {
    getVisibleFeatures,
    getIndicatorRange,
    getColourScaleLevels,
    debounce_leading,
    getIndicatorMetadata,
    ScaleLevels
} from "../utils";
import ResetMap from "../ResetMap.vue";
import MapLegend from "../MapLegend.vue";
import {IndicatorValuesDict, NumericRange} from "../../../types";
import {CalibrateDataResponse, ChoroplethIndicatorMetadata} from "../../../generated";
import { ScaleSettings } from "../../../store/plotState/plotState";
import {useChoroplethTooltips} from "./useChoroplethTooltips";
import {getFeatureData} from "./utils";
import MapEmptyFeature from "../MapEmptyFeature.vue";
import { PlotName } from "../../../store/plotSelections/plotSelections";

// eslint-disable-next-line no-undef
const props = defineProps({
    plot: {
        type: String as PropType<PlotName>,
        required: true
    }
});
const { plot } = toRefs(props);

const store = useStore<RootState>();
const plotData = computed(() => store.state.plotData[plot.value] as CalibrateDataResponse["data"]);

const selectedIndicator = computed<string>(() => {
    return store.state.plotSelections[plot.value].filters.find(f => f.stateFilterId === "indicator")!.selection[0].id
});
const indicatorMetadata = computed<ChoroplethIndicatorMetadata>(() => {
    return getIndicatorMetadata(store, plot.value, selectedIndicator.value)
});
const colourRange = ref<NumericRange | null>(null);
const scaleLevels = ref<ScaleLevels[]>([]);
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
    updateMapColours();
    updateTooltips();
};

const colourScales = computed(() => {
    return store.state.plotState.output.colourScales
});

const updateMapColours = () => {
    selectedScale.value = colourScales.value[selectedIndicator.value];
    colourRange.value = getIndicatorRange(indicatorMetadata.value, selectedScale.value, plotData.value);
    scaleLevels.value = getColourScaleLevels(indicatorMetadata.value, colourRange.value);
    featureData.value = getFeatureData(
        plotData.value,
        indicatorMetadata.value,
        colourRange.value ? colourRange.value : {max: 1, min: 0}
    );
};

const updateFeatures = () => {
    const selectedLevel = store.state.plotSelections[plot.value].filters
        .find(f => f.stateFilterId === "detail")!.selection;
    currentFeatures.value = getVisibleFeatures(features, selectedLevel);
};

const selectedAreaIds = computed(() => {
    return store.state.plotSelections[plot.value].filters
        .find(f => f.stateFilterId === "area")!.selection
        .map(opt => opt.id);
});

// Update bounds can be called multiple times by v-node-updated, but
// I can't find an appropriate thing to watch to trigger this only once
// so debounce it instead. If the bound update is called twice in quick
// succession, it kills the animation. Debouncing this means it should
// update smoothly
const updateBounds = debounce_leading(() => {
    const visibleRefs = featureRefs.value
        .filter(f => selectedAreaIds.value.includes(f.geojson?.properties?.area_id))
    if (visibleRefs.length > 0) {
        map.value?.leafletObject.fitBounds(visibleRefs
                .map(f => f.leafletObject.getBounds()));
    }
}, 50);

// Use watchers instead of computed
// When the plotSelections updates, the new data will have been fetched from the backend already
// so we can update the UI.
// We also want to update the UI when scale selections get changed.
// But updating the plotSelections will also update the scale selections
// So using computed we end up with duplicate updates when plotSelections change.
// So we use watch instead for more control over when things are updated.
watch(colourScales, updateMapColours)
watch(selectedAreaIds, updateBounds);
watch(() => [store.state.plotSelections[plot.value]], updateMap);

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

const emptyFeature = computed(() => {
    return selectedAreaIds.value.length === 0
});

onMounted(() => {
    updateFeatures();
    updateMapColours();
});
</script>
