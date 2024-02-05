<template>
    <div class="row">
        <div class="col-md-3">
            <slot/>
            <filters-comp
                          :filters="filters"
                          :selectedFilterOptions="selections.selectedFilterOptions"
                          @update:filters="onFilterSelectionsChange"></filters-comp>
        </div>
        <div id="chart" class="col-md-9">
            <l-map ref="map" style="height: 800px; width: 100%" @ready="updateBounds">
                <template v-for="feature in currentFeatures" :key="feature.properties.area_id">
                    <l-geo-json :ref="feature.properties.area_id"
                                :geojson="feature"
                                :options="options"
                                :optionsStyle="() => {return {...style, fillColor: getColor(feature)}}">
                    </l-geo-json>
                </template>
                <map-empty-feature v-if="emptyFeature"></map-empty-feature>
                <reset-map v-else @reset-view="updateBounds"></reset-map>
                <template>
                    <map-control :initialDetail="selections.detail"
                                :indicator="selections.indicatorId"
                                :show-indicators="true"
                                :indicators-metadata="indicators"
                                :level-labels="featureLevels"
                                @detail-changed="onDetailChange"
                                @indicator-changed="onIndicatorChange"></map-control>
                    <map-legend v-show="!emptyFeature"
                                :metadata="colorIndicator"
                                :colour-scale="indicatorColourScale"
                                :colour-range="colourRange"
                                @update="updateColourScale"></map-legend>
                </template>
            </l-map>
        </div>
    </div>
</template>

<script lang="ts">
    import {Feature} from "geojson";
    import {LGeoJson, LMap} from "@vue-leaflet/vue-leaflet";
    import {GeoJSON, Layer, GeoJSONOptions} from "leaflet";
    import MapControl from "../MapControl.vue";
    import MapLegend from "../MapLegend.vue";
    import FiltersComp from "../Filters.vue";
    import MapEmptyFeature from "../MapEmptyFeature.vue";
    import ResetMap from "../ResetMap.vue";
    import {ChoroplethIndicatorMetadata, FilterOption, NestedFilterOption} from "../../../generated";
    import {
        ChoroplethSelections,
        ScaleSelections,
        ScaleSettings,
        ScaleType
    } from "../../../store/plottingSelections/plottingSelections";
    import {getIndicatorRange, toIndicatorNameLookup, formatOutput} from "../utils";
    import {getFeatureIndicator, initialiseScaleFromMetadata} from "./utils";
    import {Dict, Filter, IndicatorValuesDict, LevelLabel, NumericRange} from "../../../types";
    import {flattenOptions, flattenToIdSet} from "../../../utils";
    import { PropType, defineComponent } from "vue";

   

    interface Data {
        style: any,
        fullIndicatorRanges: Dict<NumericRange>,
    }

    interface Methods {
        initialise: () => void,
        updateBounds: () => void,
        showColor: (feature: Feature) => boolean,
        getColor: (feature: Feature) => string,
        onDetailChange: (newVal: number) => void,
        onIndicatorChange: (newVal: string) => void,
        onFilterSelectionsChange: (newSelections: Dict<FilterOption[]>) => void,
        changeSelections: (newSelections: Partial<ChoroplethSelections>) => void,
        updateColourScale: (scale: ScaleSettings) => void,
        getFeatureFromAreaId: (id: string) => Feature,
        normalizeIndicators: (node: ChoroplethIndicatorMetadata) => any
    }

    interface Computed {
        initialised: boolean,
        colourRange: NumericRange,
        featureIndicators: IndicatorValuesDict,
        featuresByLevel: { [k: number]: Feature[] },
        currentFeatures: Feature[],
        currentLevelFeatureIds: string[],
        maxLevel: number,
        indicatorNameLookup: Dict<string>,
        indicatorColourScale: ScaleSettings | null,
        areaFilter: Filter,
        nonAreaFilters: Filter[],
        selectedAreaFilterOptions: FilterOption[],
        flattenedAreas: Dict<NestedFilterOption>,
        selectedAreaFeatures: Feature[],
        selectedAreaIds: string[],
        colorIndicator: ChoroplethIndicatorMetadata | undefined,
        options: GeoJSONOptions,
        emptyFeature: boolean
    }

    export default defineComponent({
        name: "Choropleth",
        components: {
            LMap,
            LGeoJson,
            MapControl,
            MapLegend,
            FiltersComp,
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
                type: Object as PropType<ChoroplethSelections>,
                required: true
            },
            colourScales: {
                type: Object as PropType<ScaleSelections>,
                required: true
            },
            areaFilterId: {
                type: String,
                required: true
            },
            roundFormatOutput: {
                type: Boolean,
                required: false,
                default: true
            }
        },
        data(): Data {
            return {
                style: {
                    className: "geojson",
                },
                fullIndicatorRanges: {}
            }
        },
        computed: {
            initialised() {
                const unsetFilters: Filter[] = this.nonAreaFilters.filter((f: Filter) => !this.selections.selectedFilterOptions[f.id]);
                return unsetFilters.length == 0 && this.selections.detail > -1 &&
                    !!this.selections.indicatorId && !!this.colorIndicator;
            },
            emptyFeature() {
                const nonEmptyFeature = (this.currentFeatures.filter((filtered: Feature) => !!this.featureIndicators[filtered.properties!.area_id]))
                return nonEmptyFeature.length == 0
            },
            colourRange() {
                if (!this.colorIndicator) {
                    return {max: 1, min: 0}
                } else {
                    const indicator = this.selections.indicatorId;
                    const type = this.colourScales[indicator] && this.colourScales[indicator].type;
                    switch (type) {
                        case  ScaleType.DynamicFull:
                            if (!this.fullIndicatorRanges.hasOwnProperty(indicator)) {
                                // cache the result in the fullIndicatorRanges object for future lookups
                                /* eslint vue/no-side-effects-in-computed-properties: "off" */
                                this.fullIndicatorRanges[indicator] =
                                    getIndicatorRange(this.chartdata, this.colorIndicator)
                            }
                            return this.fullIndicatorRanges[indicator];
                        case  ScaleType.DynamicFiltered:
                            return getIndicatorRange(
                                this.chartdata,
                                this.colorIndicator,
                                this.nonAreaFilters,
                                this.selections.selectedFilterOptions,
                                this.selectedAreaIds.filter((a: string) => this.currentLevelFeatureIds.indexOf(a) > -1)
                            );
                        case ScaleType.Custom:
                            return {
                                min: this.colourScales[indicator].customMin,
                                max: this.colourScales[indicator].customMax
                            };
                        case ScaleType.Default:
                        default:
                            return {max: this.colorIndicator.max, min: this.colorIndicator.min}
                    }
                }
            },
            selectedAreaIds() {
                const selectedAreaIdSet = flattenToIdSet(this.selectedAreaFilterOptions.map((o: FilterOption) => o.id), this.flattenedAreas);

                //Should also ensure include top level (country) included if no filters selected
                const selectedOptions = this.selections.selectedFilterOptions[this.areaFilterId];
                if (!selectedOptions || selectedOptions.length == 0) {
                    this.currentLevelFeatureIds.forEach((id: string) => selectedAreaIdSet.add(id));
                }

                return Array.from(selectedAreaIdSet);
            },
            featureIndicators() {
                if (!this.colorIndicator) {
                    return {}
                } else {
                    return getFeatureIndicator(
                        this.chartdata,
                        this.selectedAreaIds,
                        this.colorIndicator,
                        this.colourRange,
                        this.nonAreaFilters,
                        this.selections.selectedFilterOptions
                    );
                }
            },
            featuresByLevel() {
                const result = {} as { [k: number]: Feature[] };
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
                const levelNums: number[] = Object.keys(this.featuresByLevel).map(k => parseInt(k));
                return Math.max(...levelNums);
            },
            currentFeatures() {
                return this.featuresByLevel[this.selections.detail] || [];
            },
            currentLevelFeatureIds() {
                return this.currentFeatures.map((f: Feature) => f.properties!["area_id"]);
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
            selectedAreaFilterOptions() {
                const selectedOptions = this.selections.selectedFilterOptions[this.areaFilterId];
                if (selectedOptions && selectedOptions.length > 0) {
                    return selectedOptions
                }
                return this.areaFilter ? this.areaFilter.options : []; //consider all top level areas to be selected if none are
            },
            flattenedAreas() {
                return this.areaFilter ? flattenOptions(this.areaFilter.options) : {};
            },
            selectedAreaFeatures(): Feature[] {
                if (this.initialised) {
                    return this.selectedAreaFilterOptions.map((o: FilterOption) => this.getFeatureFromAreaId(o.id)!);
                }
                return [];
            },
            colorIndicator(): ChoroplethIndicatorMetadata | undefined {
                return this.indicators.find((i: ChoroplethIndicatorMetadata) => i.indicator == this.selections.indicatorId);
            },
            indicatorColourScale(): ScaleSettings | null {
                const current = this.colourScales[this.selections.indicatorId];
                if (current) {
                    return current
                } else {
                    const newScale = initialiseScaleFromMetadata(this.colorIndicator);
                    this.updateColourScale(newScale);
                    return newScale;
                }
            },
            options() {
                return {
                    onEachFeature: (feature: Feature, layer: Layer) => {
                        layer.bindTooltip(this.tooltipContent(feature))
                    }
                }
            }
        },
        methods: {
            initialise: function () {
                const initialSelections: Partial<ChoroplethSelections> = {};
                if (this.selections.detail < 0) {
                    initialSelections.detail = this.maxLevel;
                }

                if (!this.selections.indicatorId || !this.indicators.some((i: ChoroplethIndicatorMetadata) => i.indicator == this.selections.indicatorId)) {
                    const indicator = this.indicatorNameLookup.prevalence ? "prevalence" : this.indicators[0].indicator;
                    initialSelections.indicatorId = indicator;
                }

                const existingFilterSels = this.selections.selectedFilterOptions;
                const refreshSelected = this.nonAreaFilters.reduce((obj: any, current: Filter) => {
                    const currentOptionIds = current.options.map(o => o.id);
                    let newSels = existingFilterSels[current.id] ?
                        existingFilterSels[current.id].filter((o: FilterOption) => currentOptionIds.indexOf(o.id) > -1) : [];

                    if (newSels.length == 0) {
                        newSels = current.options.length > 0 ? [current.options[0]] : [];
                    }

                    obj[current.id] = newSels;
                    return obj;
                }, {} as Dict<FilterOption[]>);
                //assume area filters remain valid
                refreshSelected[this.areaFilterId] = this.selections.selectedFilterOptions[this.areaFilterId];
                initialSelections.selectedFilterOptions = refreshSelected;

                this.changeSelections(initialSelections);
            },
            updateBounds: function () {
                if (this.initialised) {
                    let map = this.$refs.map as any;
                    
                    if (map && map.leafletObject) {
                        map.leafletObject.fitBounds(this.selectedAreaFeatures.map((f: Feature) => new GeoJSON(f).getBounds()) as any);
                    }
                }
            },
            showColor(feature: Feature) {
                return !!this.featureIndicators[feature.properties!.area_id] &&
                    !!this.featureIndicators[feature.properties!.area_id];
            },
            getColor: function (feature: Feature) {
                if (this.showColor(feature)) {
                    return this.featureIndicators[feature.properties!.area_id].color;
                } else {
                    //show a lighter grey than the outlines if no data
                    //so unselected regions are still distinguishable
                    return "rgb(200,200,200)";
                }
            },
            onDetailChange: function (newVal: number) {
                this.changeSelections({detail: newVal});
            },
            onIndicatorChange: function (newVal: string) {
                this.changeSelections({indicatorId: newVal});
            },
            onFilterSelectionsChange(newSelections: Dict<FilterOption[]>) {
                this.changeSelections({selectedFilterOptions: newSelections});
            },
            changeSelections(newSelections: Partial<ChoroplethSelections>) {
                this.$emit("update:selections", newSelections)
            },
            updateColourScale: function (scale: ScaleSettings) {
                const newColourScales = {...this.colourScales};
                newColourScales[this.selections.indicatorId] = scale;
                this.$emit("update-colour-scales", newColourScales);
            },
            getFeatureFromAreaId(areaId: string): Feature {
                return this.features.find((f: Feature) => f.properties!.area_id == areaId)!;
            },
            normalizeIndicators(node: ChoroplethIndicatorMetadata) {
                return {id: node.indicator, label: node.name};
            },
            tooltipContent(feature: Feature): string {
                let format = "";
                let scale = 1;
                let accuracy: number | null = null;
                if (this.colorIndicator) {
                    format = this.colorIndicator.format;
                    scale = this.colorIndicator.scale;
                    accuracy = this.colorIndicator.accuracy;
                }

                const area_id = feature.properties && feature.properties["area_id"];
                const area_name = feature.properties && feature.properties["area_name"];

                const values = this.featureIndicators[area_id];
                const value = values && values!.value;
                const lower_value = values && values!.lower_value;
                const upper_value = values && values!.upper_value;

                const stringVal = (value || value === 0) ? value.toString() : "";
                const stringLower = (lower_value || lower_value === 0) ? lower_value.toString() : "";
                const stringUpper = (upper_value || upper_value === 0) ? upper_value.toString() : "";

                if (stringVal && stringLower) {
                    return `<div>
                        <strong>${area_name}</strong>
                        <br/>${ formatOutput(stringVal, format, scale, accuracy, this.roundFormatOutput)}
                        <br/>(${formatOutput(stringLower, format, scale, accuracy, this.roundFormatOutput) + " - " +
                        formatOutput(stringUpper, format, scale, accuracy, this.roundFormatOutput)})
                    </div>`;
                } else {
                    return `<div>
                        <strong>${area_name}</strong>
                        <br/>${formatOutput(stringVal, format, scale, accuracy, this.roundFormatOutput)}
                    </div>`;
                }
            },
            updateTooltips() {
                if (this.initialised) {
                    this.currentFeatures.forEach((feature: Feature) => {
                        let properties = feature.properties
                        if (!properties) {
                            return
                        }

                        let geojson = this.$refs[properties.area_id] as any;
                        // geojson here will return multiple because we have programmatically created
                        // the refs so vue returns an array as there "could" be more than 1 item which
                        // matches this ref. But we know from our construction above that
                        // there is always 1 with this area ID, so we rely on that.
                        if (geojson && geojson[0].leafletObject) {
                            geojson[0].leafletObject.eachLayer((layer: Layer) => {
                                this.setLayerTooltipContent(layer, geojson[0].geojson)
                            })
                        }
                    })
                }
            },
            setLayerTooltipContent(layer: Layer, feature: Feature) {
                layer.setTooltipContent(this.tooltipContent(feature))
            }
        },
        watch: {
                filters: function () {
                    this.initialise();
                },
                indicators: function () {
                    this.initialise();
                },
            },
        beforeMount() {
            this.initialise();
        },
        updated() {
            this.updateBounds();
            this.updateTooltips();
        },
    });
</script>
