<template>
    <div class="row">
        <div class="col-md-3">
            <div id="color-indicator" class="form-group">
                <label class="font-weight-bold" v-translate="'colorIndicator'"></label>
                <hint-tree-select :multiple=false
                            :clearable="false"
                            :options="indicators"
                            :model-value="selections.colorIndicatorId"
                            :normalizer="normalizeIndicators"
                            @update:model-value="onColorIndicatorSelect($event)">
                </hint-tree-select>
            </div>
            <div id="size-indicator" class="form-group">
                <label class="font-weight-bold" v-translate="'sizeIndicator'"></label>
                <hint-tree-select :multiple=false
                            :clearable="false"
                            :options="indicators"
                            :model-value="selections.sizeIndicatorId"
                            :normalizer="normalizeIndicators"
                            @update:model-value="onSizeIndicatorSelect($event)">
                </hint-tree-select>
            </div>
            <h4 v-translate="'filters'"></h4>
            <div id="area-filter" class="form-group">
                <filter-select :label="areaFilter.label"
                               :multiple="true"
                               :options="areaFilterOptions"
                               :value="getSelectedFilterValues('area')"
                               @update:filter-select="onFilterSelect(areaFilter, $event)">
                </filter-select>
            </div>
            <div :id="'filter-' + filter.id" v-for="filter in nonAreaFilters" :key="filter.id" class="form-group">
                <filter-select :value="getSelectedFilterValues(filter.id)"
                               :multiple="false"
                               :label="filter.label"
                               :options="filter.options"
                               @update:filter-select="onFilterSelect(filter, $event)"></filter-select>
            </div>
        </div>
        <div id="chart" class="col-md-9">
            <l-map ref="map" style="height: 800px; width: 100%" @ready="updateBounds" @vnode-updated="updateBounds">
                <template v-for="feature in currentFeatures" :key="feature.id">
                    <l-geo-json :geojson="feature"
                                :optionsStyle="() => style">
                    </l-geo-json>
                </template>
                <map-empty-feature v-if="emptyFeature"></map-empty-feature>
                <template v-else>
                    <reset-map @reset-view="updateBounds"></reset-map>
                    <map-legend :metadata="colorIndicator"
                                :colour-range="colourRange"
                                :colour-scale="colourIndicatorScale"
                                @update="updateColourScale"
                    ></map-legend>
                    <size-legend :indicatorRange="sizeRange"
                                 :max-radius="maxRadius"
                                 :min-radius="minRadius"
                                 :metadata="sizeIndicator"
                                 :size-scale="sizeIndicatorScale"
                                 @update="updateSizeScale"
                    ></size-legend>
                </template>
                <template>
                    <map-control :initialDetail=selections.detail
                                 :show-indicators="false"
                                 :level-labels="featureLevels"
                                 @detailChanged="onDetailChange($event)"></map-control>
                </template>
            </l-map>
        </div>
    </div>
</template>

<script lang="ts">
    import HintTreeSelect from "../../HintTreeSelect.vue";
    import {Feature} from "geojson";
    import {LGeoJson, LMap} from "@vue-leaflet/vue-leaflet";
    import MapControl from "../MapControl.vue";
    import MapLegend from "../MapLegend.vue";
    import FilterSelect from "../FilterSelect.vue";
    import {CircleMarker, GeoJSON, circleMarker} from "leaflet";
    import {ChoroplethIndicatorMetadata, FilterOption} from "../../../generated";
    import {
        BubblePlotSelections,
        ScaleSelections,
        ScaleSettings,
        ScaleType
    } from "../../../store/plottingSelections/plottingSelections";
    import {getFeatureIndicators} from "./utils";
    import {getIndicatorRange, toIndicatorNameLookup, formatOutput} from "../utils";
    import {Dict, Filter, LevelLabel, NumericRange} from "../../../types";
    import {flattenOptions, flattenToIdSet} from "../../../utils";
    import SizeLegend from "./SizeLegend.vue";
    import {initialiseScaleFromMetadata} from "../choropleth/utils";
    import MapEmptyFeature from "../MapEmptyFeature.vue";
    import ResetMap from "../ResetMap.vue";
    import { PropType, defineComponent } from "vue";

    interface Data {
        style: any,
        maxRadius: number,
        minRadius: number,
        fullIndicatorRanges: Dict<NumericRange>,
        previousCircles: CircleMarker[]
    }

    export default defineComponent({
        name: "BubblePlot",
        components: {
            LMap,
            LGeoJson,
            MapControl,
            MapLegend,
            SizeLegend,
            FilterSelect,
            HintTreeSelect,
            MapEmptyFeature,
            ResetMap
        },
        props: {
            features: {
                type: Array as PropType<Feature[]>,
                required: true
            },
            featureLevels: {
                type: Array as PropType<LevelLabel[]>,
                required: true
            },
            indicators: {
                type: Array as PropType<ChoroplethIndicatorMetadata[]>,
                required: true
            },
            chartdata: {
                type: Array as PropType<any[]>,
                required: true
            },
            filters: {
                type: Array as PropType<Filter[]>,
                required: true
            },
            selections: {
                type: Object as PropType<BubblePlotSelections>,
                required: true
            },
            areaFilterId: {
                type: String,
                required: true
            },
            colourScales: {
                type: Object as PropType<ScaleSelections>,
                required: true
            },
            sizeScales: {
                type: Object as PropType<ScaleSelections>,
                required: true
            }
        },
        data(): Data {
            return {
                style: {
                    className: "geojson-grey",
                },
                maxRadius: 70,
                minRadius: 10,
                fullIndicatorRanges: {},
                previousCircles: []
            }
        },
        computed: {
            initialised() {
                const unsetFilters = this.nonAreaFilters.filter((f: Filter) => !this.selections.selectedFilterOptions[f.id]);
                return unsetFilters.length == 0 && this.selections.detail > -1 &&
                    !!this.selections.colorIndicatorId && !!this.selections.sizeIndicatorId;
            },
            currentLevelFeatureIds() {
                return this.currentFeatures.map((f: Feature) => f.properties!["area_id"]);
            },
            emptyFeature() {
                const nonEmptyFeature = (this.currentFeatures.filter((filtered: Feature) => !!this.featureIndicators[filtered.properties!.area_id]))
                return nonEmptyFeature.length == 0
            },
            sizeRange() {
                const sizeScale = this.sizeScales[this.selections.sizeIndicatorId];
                return this.getRange(this.sizeIndicator, sizeScale);
            },
            colourRange() {
                const colourScale = this.colourScales[this.selections.colorIndicatorId];
                return this.getRange(this.colorIndicator, colourScale);
            },
            selectedAreaIds() {
                const selectedAreaIdSet = flattenToIdSet(this.selectedAreaFilterOptions.map((o: FilterOption) => o.id), this.flattenedAreas);
                return Array.from(selectedAreaIdSet)
            },
            featureIndicators() {
                if (!this.initialised) {
                    return {}
                }
                return getFeatureIndicators(
                    this.chartdata,
                    this.selectedAreaIds,
                    this.sizeIndicator,
                    this.colorIndicator,
                    this.sizeRange,
                    this.colourRange,
                    this.nonAreaFilters,
                    this.selections.selectedFilterOptions,
                    this.minRadius,
                    this.maxRadius
                );
            },
            featuresByLevel() {
                //TODO: this is shared with choropleth, could move into utils file or Mixin
                const result = {} as any;
                this.featureLevels.forEach((l: any) => {
                    if (l.display) {
                        result[l.id] = [];
                    }
                });

                this.features.forEach((feature: Feature) => {
                    const adminLevel = parseInt(feature.properties!["area_level"]); //Country (e.g. "MWI") is level 0
                    if (result[adminLevel]) {
                        result[adminLevel].push(feature);
                    }
                });

                return result;
            },
            maxLevel() {
                //TODO: this is shared with choropleth, could move into utils file or Mixin
                const levelNums: number[] = Object.keys(this.featuresByLevel).map(k => parseInt(k));

                return Math.max(...levelNums);
            },
            currentFeatures(): Feature[] {
                return this.featuresByLevel[this.selections.detail]|| [];
            },
            indicatorNameLookup() {
                return toIndicatorNameLookup(this.indicators)
            },
            areaFilter() {
                return this.filters.find((f: Filter) => f.id == this.areaFilterId)!;
            },
            nonAreaFilters() {
                return this.filters.filter((f: Filter) => f.id != this.areaFilterId);
            },
            areaFilterOptions() {
                return this.countryFilterOption ? (this.countryFilterOption as any).children : [];
            },
            selectedAreaFilterOptions() {
                const selectedOptions = this.selections.selectedFilterOptions[this.areaFilterId];
                if (selectedOptions && selectedOptions.length > 0) {
                    return selectedOptions
                }
                return this.countryFilterOption ? [this.countryFilterOption] : [];
            },
            flattenedAreas() {
                return flattenOptions(this.areaFilter.options);
            },
            selectedAreaFeatures(): Feature[] {
                if (this.selectedAreaFilterOptions && this.selectedAreaFilterOptions.length > 0) {
                    return this.selectedAreaFilterOptions.map((o: FilterOption) => this.getFeatureFromAreaId(o.id)!);
                }
                return [];
            },
            countryFilterOption(): FilterOption {
                return this.areaFilter.options[0]
            },
            countryFeature(): Feature | null {
                return this.countryFilterOption ? this.getFeatureFromAreaId(this.countryFilterOption.id)! : null;
            },
            colorIndicator(): ChoroplethIndicatorMetadata {
                return this.indicators.find((i: ChoroplethIndicatorMetadata) => i.indicator == this.selections.colorIndicatorId)!;
            },
            sizeIndicator(): ChoroplethIndicatorMetadata {
                return this.indicators.find((i: ChoroplethIndicatorMetadata) => i.indicator == this.selections.sizeIndicatorId)!;
            },
            colourIndicatorScale(): ScaleSettings | null {
                const current = this.colourScales[this.selections.colorIndicatorId];
                if (current) {
                    return current
                } else {
                    const newScale = initialiseScaleFromMetadata(this.colorIndicator);
                    this.updateColourScale(newScale);
                    return newScale;
                }
            },
            sizeIndicatorScale(): ScaleSettings {
                const current = this.sizeScales[this.selections.sizeIndicatorId];
                if (current) {
                    return current
                } else {
                    const newScale = initialiseScaleFromMetadata(this.sizeIndicator);
                    this.updateSizeScale(newScale);
                    return newScale;
                }
            }
        },
        methods: {
            updateBounds: function () {
                if (this.initialised) {
                    let map = this.$refs.map as any;
                    if (this.previousCircles.length > 0) {
                        this.previousCircles.forEach(circle => circle.remove())
                        this.previousCircles = []
                    }
                    let circlesArray: CircleMarker[] = [];
                    if (!this.emptyFeature) {
                        this.currentFeatures.forEach((feature: Feature) => {
                            if (!this.showBubble(feature)) {
                                return
                            }
                            let circle = circleMarker([feature.properties?.center_y, feature.properties?.center_x], {
                                radius: this.getRadius(feature),
                                fillOpacity: 0.75,
                                opacity: 0.75,
                                color: this.getColor(feature),
                                fillColor: this.getColor(feature),
                            }).bindTooltip(this.getTooltip(feature))
                            circlesArray.push(circle)
                        })
                        this.previousCircles = circlesArray
                    }

                    if (map && map.leafletObject) {
                        map.leafletObject.fitBounds(this.selectedAreaFeatures.map((f: Feature) => new GeoJSON(f).getBounds()) as any);
                        if (circlesArray.length > 0) {
                            circlesArray.forEach(circle => circle.addTo(map.leafletObject))
                        }
                    }
                }
            },
            showBubble(feature: Feature) {
                return !!this.featureIndicators[feature.properties!.area_id] &&
                    !!this.featureIndicators[feature.properties!.area_id]
                    && !!this.featureIndicators[feature.properties!.area_id].value
                    && !!this.featureIndicators[feature.properties!.area_id].sizeValue
            },
            getRadius: function (feature: Feature) {
                return this.featureIndicators[feature.properties!.area_id].radius;
            },
            getColor: function (feature: Feature) {
                return this.featureIndicators[feature.properties!.area_id].color;
            },
            getTooltip: function (feature: Feature) {
                const area_id = feature.properties && feature.properties["area_id"];
                const area_name = feature.properties && feature.properties["area_name"];

                const values = this.featureIndicators[area_id];
                const colorIndicator = this.selections.colorIndicatorId;
                const sizeIndicator = this.selections.sizeIndicatorId;
                const colorValue = values && values!.value;
                const {sizeValue, lower_value, upper_value, sizeLower, sizeUpper} = values!;

                const colorIndicatorName = this.indicatorNameLookup[colorIndicator];
                const sizeIndicatorName = this.indicatorNameLookup[sizeIndicator];
                const { format, scale, accuracy } = this.colorIndicator!;
                const { format: formatS, scale: scaleS, accuracy: accuracyS } = this.sizeIndicator!;

                const stringLower_value = (lower_value || lower_value === 0) ? lower_value.toString() : "";
                const stringUpper_value = (upper_value || upper_value === 0) ? upper_value.toString() : "";
                const stringSizeUpper = (sizeUpper || sizeUpper === 0) ? sizeUpper.toString() : "";
                const stringSizeLower = (sizeLower || sizeLower === 0) ? sizeLower.toString() : "";

                if ((stringLower_value && stringUpper_value) && (stringSizeLower && stringSizeUpper)) {
                    return `<div>
                                <strong>${area_name}</strong>
                                <br/>${colorIndicatorName}: ${formatOutput(colorValue, format, scale, accuracy)}
                                <br/>(${formatOutput(stringLower_value, format, scale, accuracy) + " - " +
                    formatOutput(stringUpper_value, format, scale, accuracy)})
                                <br/>
                                <br/>${sizeIndicatorName}: ${formatOutput(sizeValue, formatS, scaleS, accuracyS)}
                                <br/>(${formatOutput(stringSizeLower, formatS, scaleS, accuracyS) + " - " +
                    formatOutput(stringSizeUpper, formatS, scaleS, accuracyS)})
                            </div>`;
                }
                return `<div>
                                <strong>${area_name}</strong>
                                <br/>${colorIndicatorName}: ${formatOutput(colorValue, format, scale, accuracy)}
                                <br/>${sizeIndicatorName}: ${formatOutput(sizeValue, formatS, scaleS, accuracyS)}
                            </div>`;
            },
            getSelectedFilterValues(filterId: string) {
                return (this.selections.selectedFilterOptions[filterId] || []).map((o: FilterOption) => o.id);
            },
            getRange(indicator: ChoroplethIndicatorMetadata, scale: ScaleSettings) {
                if (!this.initialised) {
                    return {max: 1, min: 0}
                }
                const indicatorId = indicator.indicator;
                const type = scale && scale.type;
                switch (type) {
                    case  ScaleType.DynamicFull:
                        if (!this.fullIndicatorRanges.hasOwnProperty(indicatorId)) {
                            // cache the result in the fullIndicatorRanges object for future lookups
                            /* eslint vue/no-side-effects-in-computed-properties: "off" */
                            this.fullIndicatorRanges[indicatorId] =
                                getIndicatorRange(this.chartdata, indicator)
                        }
                        return this.fullIndicatorRanges[indicatorId];
                    case ScaleType.DynamicFiltered:
                        return getIndicatorRange(
                            this.chartdata,
                            indicator,
                            this.nonAreaFilters,
                            this.selections.selectedFilterOptions,
                            this.selectedAreaIds.filter((a: string) => this.currentLevelFeatureIds.indexOf(a) > -1)
                        );
                    case ScaleType.Custom:
                        return {
                            min: scale.customMin,
                            max: scale.customMax
                        };
                    case ScaleType.Default:
                    default:
                        return {max: indicator.max, min: indicator.min}
                }
            },
            onDetailChange: function (newVal: number) {
                this.changeSelections({detail: newVal});
            },
            onFilterSelect(filter: Filter, selectedOptions: FilterOption[]) {
                const newSelectedFilterOptions = {...this.selections.selectedFilterOptions};
                newSelectedFilterOptions[filter.id] = selectedOptions;

                this.changeSelections({selectedFilterOptions: newSelectedFilterOptions});
            },
            onColorIndicatorSelect(newValue: string) {
                this.changeSelections({colorIndicatorId: newValue});
            },
            onSizeIndicatorSelect(newValue: string) {
                this.changeSelections({sizeIndicatorId: newValue});
            },
            changeSelections(newSelections: Partial<BubblePlotSelections>) {
                this.$emit("update:selections", newSelections)
            },
            getFeatureFromAreaId(areaId: string): Feature {
                return this.features.find((f: Feature) => f.properties!.area_id == areaId)!;
            },
            normalizeIndicators(node: ChoroplethIndicatorMetadata) {
                return {id: node.indicator, label: node.name};
            },
            updateColourScale: function (scale: ScaleSettings) {
                const newColourScales = {...this.colourScales};
                newColourScales[this.selections.colorIndicatorId] = scale;
                this.$emit("update-colour-scales", newColourScales);
            },
            updateSizeScale: function (scale: ScaleSettings) {
                const newSizeScales = {...this.sizeScales};
                newSizeScales[this.selections.sizeIndicatorId] = scale;
                this.$emit("update-size-scales", newSizeScales);
            },
        },
        beforeMount() {
            let initialFilterSelections: Partial<BubblePlotSelections> = {};
            //If selections have not been initialised, refresh them
            if (this.selections.detail < 0) {
                initialFilterSelections = {...initialFilterSelections, detail: this.maxLevel};
            }

            if (!this.selections.colorIndicatorId) {
                const colorIndicator = this.indicatorNameLookup.prevalence ? "prevalence" : this.indicators[0].indicator;
                initialFilterSelections = {...initialFilterSelections, colorIndicatorId: colorIndicator};
            }
            if (!this.selections.sizeIndicatorId) {
                const sizeIndicator = this.indicatorNameLookup.plhiv ? "plhiv" : this.indicators[0].indicator;
                initialFilterSelections = {...initialFilterSelections, sizeIndicatorId: sizeIndicator};
            }
            
            if (Object.keys(this.selections.selectedFilterOptions).length < 1) {
                const defaultSelected = this.nonAreaFilters.reduce((obj: any, current: Filter) => {
                    obj[current.id] = current.options.length > 0 ? [current.options[0]] : [];
                    return obj;
                }, {} as Dict<FilterOption[]>);
                initialFilterSelections = {...initialFilterSelections, selectedFilterOptions: defaultSelected};
            }

            this.changeSelections(initialFilterSelections);
        }
    });
</script>
