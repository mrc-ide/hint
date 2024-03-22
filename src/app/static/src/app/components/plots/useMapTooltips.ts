import {Ref} from "vue";
import {Feature} from "geojson";
import {Layer} from "leaflet";
import {tooltipContent} from "./choropleth/utils";
import {IndicatorValuesDict} from "../../types";
import {ChoroplethIndicatorMetadata} from "../../generated";
import {LGeoJson} from "@vue-leaflet/vue-leaflet";

export const useMapTooltips = (featureData: Ref<IndicatorValuesDict>,
                               indicatorMetadata: Ref<ChoroplethIndicatorMetadata>,
                               currentFeatures: Ref<Feature[]>,
                               featureRefs: Ref<typeof LGeoJson[]>) => {
    const createTooltips = {
        onEachFeature: (feature: Feature, layer: Layer) => {
            layer.bindTooltip(tooltipContent(feature, featureData.value, indicatorMetadata.value))
        }
    };

    const updateTooltips = () => {
        currentFeatures.value.forEach((feature: Feature) => {
            const properties = feature.properties
            if (properties && properties.area_id) {
                const geojson = featureRefs.value.find(f => f.geojson?.properties?.area_id === properties.area_id)
                if (geojson && geojson.geojson && geojson.leafletObject) {
                    geojson.leafletObject.eachLayer((layer: Layer) => {
                        setLayerTooltipContent(layer, geojson.geojson)
                    })
                }
            }
        })
    };

    const setLayerTooltipContent = (layer: Layer, feature: Feature) => {
        layer.setTooltipContent(tooltipContent(feature, featureData.value, indicatorMetadata.value))
    };

    return {
        createTooltips,
        updateTooltips
    }
};
