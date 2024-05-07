import {Ref} from "vue";
import {Feature} from "geojson";
import {Layer} from "leaflet";
import {formatOutput} from "../utils";
import {IndicatorValuesDict} from "../../../types";
import {ChoroplethIndicatorMetadata} from "../../../generated";
import {LGeoJson} from "@vue-leaflet/vue-leaflet";

export const useChoroplethTooltips = (featureData: Ref<IndicatorValuesDict>,
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

const tooltipContent = function (feature: Feature, featureIndicators: IndicatorValuesDict,
                                 indicatorMetadata: ChoroplethIndicatorMetadata): string {
    let format = "";
    let scale = 1;
    let accuracy: number | null = null;
    if (indicatorMetadata) {
        format = indicatorMetadata.format;
        scale = indicatorMetadata.scale;
        accuracy = indicatorMetadata.accuracy;
    }

    const area_id = feature.properties && feature.properties["area_id"];
    const area_name = feature.properties && feature.properties["area_name"];

    const values = featureIndicators[area_id];
    const value = values && values!.value;
    const lower_value = values && values!.lower_value;
    const upper_value = values && values!.upper_value;

    const stringVal = (value || value === 0) ? value.toString() : "";
    const stringLower = (lower_value || lower_value === 0) ? lower_value.toString() : "";
    const stringUpper = (upper_value || upper_value === 0) ? upper_value.toString() : "";

    if (stringVal && stringLower) {
        return `<div>
            <strong>${area_name}</strong>
            <br/>${ formatOutput(stringVal, format, scale, accuracy, true)}
            <br/>(${formatOutput(stringLower, format, scale, accuracy, true) + " - " +
        formatOutput(stringUpper, format, scale, accuracy, true)})
        </div>`;
    } else if (stringVal) {
        return `<div>
            <strong>${area_name}</strong>
            <br/>${formatOutput(stringVal, format, scale, accuracy, true)}
        </div>`;
    } else {
        return `<div>
            <strong>${area_name}</strong>
        </div>`;
    }
}
