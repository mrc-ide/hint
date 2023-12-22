import Choropleth from "../../../../app/components/plots/choropleth/Choropleth.vue";
import {LGeoJson, LMap} from "@vue-leaflet/vue-leaflet";
import {getFeatureIndicator} from "../../../../app/components/plots/choropleth/utils";
import MapControl from "../../../../app/components/plots/MapControl.vue";
import registerTranslations from "../../../../app/store/translations/registerTranslations";
import Vuex from "vuex";
import {emptyState} from "../../../../app/root";
import MapLegend from "../../../../app/components/plots/MapLegend.vue";
import {plhiv, prev, testData} from "../testHelpers";
import Filters from "../../../../app/components/plots/Filters.vue";
import {ChoroplethSelections, ScaleType} from "../../../../app/store/plottingSelections/plottingSelections";
import MapEmptyFeature from "../../../../app/components/plots/MapEmptyFeature.vue";
import ResetMap from "../../../../app/components/plots/ResetMap.vue";
import {ChoroplethIndicatorMetadata} from "../../../../app/generated";
import { mountWithTranslate } from "../../../testHelpers";
import {Layer} from "leaflet";
import {Feature} from "geojson";

const mockSetTooltipContent = vi.fn();
const mockLayer = {
    setTooltipContent: mockSetTooltipContent
} as any;

vi.mock("@vue-leaflet/vue-leaflet", async () => {
    const actual = await vi.importActual("@vue-leaflet/vue-leaflet")
    const LMap = {
        template: "<div id='l-map-mock'><slot></slot></div>"
    }
    const LControl = {
        template: "<div id='l-control-mock'><slot></slot></div>"
    }
    const LGeoJson = {
        template: `<div id='l-geo-json-mock'><slot></slot></div>`,
        props: {
            geojson: Object,
        },

        data() {
            return {
                leafletObject: {
                    eachLayer: (callback: (layer: Layer) => void) => {
                        callback(mockLayer)
                    }
                }
            }
        }
    }
    return { ...actual, LMap, LControl, LGeoJson }
});

const store = new Vuex.Store({
    state: emptyState()
});
registerTranslations(store);

const props = {
    ...testData,
    selections: {
        indicatorId: "prevalence",
        detail: 4,
        selectedFilterOptions: {
            age: [{id: "0:15", label: "0-15"}],
            sex: [{id: "female", label: "Female"}],
            area: []
        }
    },
    colourScales: {
        prevalence: {
            type: ScaleType.Custom,
            customMin: 1,
            customMax: 2
        }
    }
};

const allAreaIds = ["MWI", "MWI_3_1", "MWI_3_2", "MWI_4_1", "MWI_4_2"];

const getWrapper = (customPropsData: any = {}) => {
    return mountWithTranslate(Choropleth, store, {
        props: {...props, ...customPropsData},
        global: {
            plugins: [store]
        },
        slots: {
            default: "slot content"
        }
    });
};

describe("Choropleth component", () => {
    it("renders plot as expected", () => {
        const wrapper = getWrapper();
        const map = wrapper.findComponent(LMap);
        expect(map.attributes("style")).toBe("height: 800px; width: 100%;");
        const geoJsons = wrapper.findAllComponents(LGeoJson);
        expect(geoJsons.length).toBe(2);
        expect(geoJsons[0].props().geojson).toStrictEqual(props.features[2]);
        expect(geoJsons[1].props().geojson).toStrictEqual(props.features[3]);

        expect(wrapper.findComponent(MapControl).props().initialDetail).toEqual(4);
        expect(wrapper.findComponent(MapControl).props().showIndicators).toEqual(true);
        expect(wrapper.findComponent(MapControl).props().indicator).toEqual("prevalence");
        expect(wrapper.findComponent(MapControl).props().indicatorsMetadata).toEqual(testData.indicators);
    });

    it("renders filters", () => {
        const wrapper = getWrapper();
        expect(wrapper.findAllComponents(Filters).length).toBe(1);

        //TODO: ADD TEST THAT MODIFIES AREA FILTER FOR DISPLAY IN FILTERS
    });

    it("renders color legend", () => {
        const wrapper = getWrapper();
        const legend = wrapper.findComponent(MapLegend);
        expect(legend.props().metadata).toStrictEqual(props.indicators[1]);
        expect(legend.props().colourScale).toStrictEqual(props.colourScales.prevalence)
    });

    it("computes emptyFeatures returns true when selections are empty", () => {
        const wrapper = getWrapper({selections: {...props.selections, detail: 0}});
        const vm = wrapper.vm as any;
        expect(vm.emptyFeature).toBe(true);
    });

    it("computes emptyFeatures does not return true when selections are selected", () => {
        const wrapper = getWrapper();
        const vm = wrapper.vm as any;
        expect(vm.emptyFeature).toBe(false);
    });

    it("render does not display translated no data message on map", () => {
        const wrapper = getWrapper();
        expect(wrapper.findAllComponents(MapEmptyFeature).length).toBe(0)
        expect(wrapper.findComponent(MapEmptyFeature).exists()).toBe(false)
    });

    it("render can display translated no data message on map", () => {
        const wrapper = getWrapper({selections: {...props.selections, detail: 0}});
        expect(wrapper.findAllComponents(MapEmptyFeature).length).toBe(1)
        expect(wrapper.findComponent(MapEmptyFeature).exists()).toBe(true)
    });

    it("render does not display legends when selections have no data", () => {
        const wrapper = getWrapper();
        expect((wrapper.findComponent(MapLegend).element as HTMLElement).style.display).toBeFalsy()
    });

    it("render does display legends when selections have data", () => {
        const wrapper = getWrapper({selections: {...props.selections, detail: 0}});
        expect((wrapper.findComponent(MapLegend).element as HTMLElement).style.display).toBeTruthy()
    });

    it("computes featureIndicators", () => {
        const wrapper = getWrapper();
        const vm = wrapper.vm as any;

        expect(vm.featureIndicators).toStrictEqual(getFeatureIndicator(props.chartdata,
            allAreaIds,
            prev,
            {min: props.colourScales["prevalence"].customMin, max: props.colourScales["prevalence"].customMax},
            [props.filters[1], props.filters[2]],
            props.selections.selectedFilterOptions
        ));
    });

    it("computes currentLevelFeatureIds", () => {
        const wrapper = getWrapper();
        const vm = wrapper.vm as any;
        expect(vm.currentLevelFeatureIds).toStrictEqual(["MWI_4_1", "MWI_4_2"]);
    });

    it("computes selectedAreaIds with no area selection, where detail is 0", () => {
        //no selections means select all areas, including top level
        const wrapper = getWrapper({selections: {...props.selections, detail: 0}});
        const vm = wrapper.vm as any;
        expect(vm.selectedAreaIds).toStrictEqual(allAreaIds);
    });

    it("computes selectedAreaIds with area selection", () => {
        const wrapper = getWrapper({
            selections: {
                ...props.selections,
                selectedFilterOptions: {
                    ...props.selections.selectedFilterOptions,
                    area: [{id: "MWI_4_1", label: ""}]
                }
            }
        });
        const vm = wrapper.vm as any;
        expect(vm.selectedAreaIds).toStrictEqual(["MWI_4_1"]);
    });

    it("computes colourRange", async () => {
        const wrapper = getWrapper();
        const vm = wrapper.vm as any;
        expect(vm.colourRange).toStrictEqual({
            min: props.colourScales["prevalence"].customMin,
            max: props.colourScales["prevalence"].customMax
        });

        await wrapper.setProps({
            colourScales: {
                prevalence: {
                    type: ScaleType.Default,
                    customMin: 1,
                    customMax: 2
                }
            }
        });

        expect(vm.colourRange).toStrictEqual({
            min: prev.min,
            max: prev.max
        });

        await wrapper.setProps({
            colourScales: {
                prevalence: {
                    type: ScaleType.DynamicFull,
                    customMin: 1,
                    customMax: 2
                }
            }
        });

        expect(vm.colourRange).toStrictEqual({
            min: 0,
            max: 0.9
        });

        await wrapper.setProps({
            colourScales: {
                prevalence: {
                    type: ScaleType.DynamicFiltered,
                    customMin: 1,
                    customMax: 2
                }
            },
            selections: {
                indicatorId: "prevalence",
                detail: 4,
                selectedFilterOptions: {
                    age: [{id: "0:15", label: "0-15"}],
                    sex: [{id: "male", label: "Male"}],
                    area: []
                }
            }
        });

        expect(vm.colourRange).toStrictEqual({
            min: 0.1,
            max: 0.9
        });

    });

    it("computes featuresByLevel", () => {
        const wrapper = getWrapper();
        const vm = wrapper.vm as any;

        expect(vm.featuresByLevel).toStrictEqual({
            0: [props.features[0]],
            3: [props.features[1], props.features[4]],
            4: [props.features[2], props.features[3]]
        });
    });

    it("computes maxLevel", () => {
        const wrapper = getWrapper();
        const vm = wrapper.vm as any;
        expect(vm.maxLevel).toBe(4);
    });

    it("computes currentFeatures", () => {
        const wrapper = getWrapper();
        const vm = wrapper.vm as any;

        expect(vm.currentFeatures).toStrictEqual([props.features[2], props.features[3]]);
    });

    it("computes indicatorNameLookup", () => {
        const wrapper = getWrapper();
        const vm = wrapper.vm as any;
        expect(vm.indicatorNameLookup).toStrictEqual({
            plhiv: "PLHIV",
            prevalence: "Prevalence"
        });
    });

    it("computed flattenedAreas", () => {
        const wrapper = getWrapper();
        const vm = wrapper.vm as any;
        expect(vm.flattenedAreas).toStrictEqual({
            "MWI": {
                id: "MWI", label: "Malawi", children: [
                    {id: "MWI_3_1", label: "3.1"},
                    {id: "MWI_3_2", label: "3.2"},
                    {id: "MWI_4_1", label: "4.1"},
                    {id: "MWI_4_2", label: "4.2"}
                ]
            },
            "MWI_3_1": {id: "MWI_3_1", label: "3.1"},
            "MWI_3_2": {id: "MWI_3_2", label: "3.2"},
            "MWI_4_1": {id: "MWI_4_1", label: "4.1"},
            "MWI_4_2": {id: "MWI_4_2", label: "4.2"},
        });
    });

    it("computes initialised", () => {
        const wrapper = getWrapper();
        const vm = wrapper.vm as any;
        expect(vm.initialised).toBe(true);

        const uninitialisableWrapper = getWrapper({
            selections: {
                detail: -1,
                selectedFilterOptions: {}
            },
            filters: [
                props.filters[0], //area
                {id: "age", label: "Age", column_id: "age", options: []},
                {id: "sex", label: "Sex", column_id: "sex", options: []}
            ],
        });

        expect((uninitialisableWrapper.vm as any).initialised).toBe(false);
    });

    it("computes initialised to false if no filters present", () => {
        const wrapper = getWrapper();
        const vm = wrapper.vm as any;
        expect(vm.initialised).toBe(true);

        const uninitialisableWrapper = getWrapper({
            selections: {
                detail: 2,
                selectedFilterOptions: {}
            },
            filters: []
        });

        expect((uninitialisableWrapper.vm as any).initialised).toBe(false);
    });

    it("computes initialised to false if selected indicator is not found in the provided metadata", () => {
        const wrapper = getWrapper();
        const vm = wrapper.vm as any;
        expect(vm.initialised).toBe(true);

        const indicators: ChoroplethIndicatorMetadata[] = [{...plhiv}];
        const selections: ChoroplethSelections = {
            ...props.selections,
            indicatorId: "badid"
        }
        const uninitialisableWrapper = getWrapper({
            indicators,
            selections
        });

        expect((uninitialisableWrapper.vm as any).initialised).toBe(false);
    });

    it("computes areaFilter", () => {
        const wrapper = getWrapper();
        expect((wrapper.vm as any).areaFilter).toStrictEqual(props.filters[0]);
    });

    it("computes nonAreaFilters", () => {
        const wrapper = getWrapper();
        expect((wrapper.vm as any).nonAreaFilters).toStrictEqual([props.filters[1], props.filters[2]]);
    });

    it("computes selectedAreaFilterOptions", () => {
        const wrapper = getWrapper({
            selections: {
                ...props.selections,
                selectedFilterOptions: {
                    ...props.selections.selectedFilterOptions,
                    area: [{id: "MWI_4_2", label: "4.2"}]
                }
            }
        });

        expect((wrapper.vm as any).selectedAreaFilterOptions).toStrictEqual([{id: "MWI_4_2", label: "4.2"}]);
    });

    it("computes selectedAreaFeatures where a feature is selected", () => {
        const wrapper = getWrapper({
            selections: {
                ...props.selections,
                selectedFilterOptions: {
                    ...props.selections.selectedFilterOptions,
                    area: [{id: "MWI_4_2", label: "4.2"}]
                }
            }
        });

        expect((wrapper.vm as any).selectedAreaFeatures).toStrictEqual([props.features[3]]);
    });

    it("computes selectedAreaFeatures where no feature is selected", () => {
        //defaults to country level
        const wrapper = getWrapper();
        expect((wrapper.vm as any).selectedAreaFeatures).toStrictEqual([props.features[0]]);
    });

    it("computes empty selectedAreaFeatures with empty area options", () => {
        const wrapper = getWrapper({
            filters: [{
                id: "area",
                label: "Area",
                column_id: "area_id",
                options: []
            }, props.filters[1], props.filters[2]]
        });
        expect((wrapper.vm as any).selectedAreaFeatures).toStrictEqual([]);
    });

    it("updateBounds updates bounds of map from features geojson", () => {
        const wrapper = getWrapper();
        const mockMapFitBounds = vi.fn();

        const vm = wrapper.vm as any;
        vm.$refs.map.leafletObject = {
            fitBounds: mockMapFitBounds
        };

        vm.updateBounds();
        expect(mockMapFitBounds.mock.calls[0][0]).toStrictEqual(
            [{_northEast: {lat: -15.1, lng: 35.9}, _southWest: {lat: -15.3, lng: 35.7}}]);
    });

    it("reset view component updates bounds of map from features geojson", () => {
        const wrapper = getWrapper();
        const mockMapFitBounds = vi.fn();

        const vm = wrapper.vm as any;
        vm.$refs.map.leafletObject = {
            fitBounds: mockMapFitBounds
        };

        const resetButton = wrapper.findComponent(ResetMap)
        expect(resetButton.exists()).toBe(true)

        resetButton.vm.$emit("reset-view");

        expect(mockMapFitBounds.mock.calls[0][0]).toStrictEqual(
            [{_northEast: {lat: -15.1, lng: 35.9}, _southWest: {lat: -15.3, lng: 35.7}}]);
    });

    it("initialises from empty selections and emits updates", () => {
        const wrapper = getWrapper({
            selections: {
                detail: -1,
                indicatorId: null,
                selectedFilterOptions: {}
            }
        });

        const updates = wrapper.emitted("update:selections")!;
        expect(wrapper.emitted("update:selections")![0][0]).toStrictEqual({detail: 4});
        expect(wrapper.emitted("update:selections")![1][0]).toStrictEqual({indicatorId: "prevalence"});
        expect(wrapper.emitted("update:selections")![2][0]).toStrictEqual({
            selectedFilterOptions: {
                age: [{id: "0:15", label: "0-15"}],
                sex: [{id: "female", label: "Female"}],
                area: undefined
            }
        });
    });

    it("onFilterSelectionsChange updates filter value", () => {
        const wrapper = getWrapper();
        const vm = wrapper.vm as any;
        const newSelections = {age: [{id: "15:30", label: "15-30"}]};
        vm.onFilterSelectionsChange(newSelections);
        const updates = wrapper.emitted("update:selections")!;
        expect(updates[updates.length - 1][0]).toStrictEqual({
            selectedFilterOptions: newSelections
        });
    });

    it("onIndicatorChange updates indicator", () => {
        const wrapper = getWrapper();
        const vm = wrapper.vm as any;
        vm.onIndicatorChange("newIndicator");
        const updates = wrapper.emitted("update:selections")!;
        expect(updates[updates.length - 1][0]).toStrictEqual({
            indicatorId: "newIndicator"
        });
    });

    it("updates detail", () => {
        const wrapper = getWrapper();

        const vm = wrapper.vm as any;
        vm.onDetailChange(3);

        const updates = wrapper.emitted("update:selections")!;
        expect(updates[updates.length - 1][0]).toStrictEqual({
            detail: 3
        });

    });

    it("updates colour scales on change in legend", () => {
        const wrapper = getWrapper();

        const legend = wrapper.findComponent(MapLegend);
        const newScale = {
            type: ScaleType.Custom,
            customMin: 5,
            customMax: 10
        };
        legend.vm.$emit("update", newScale);

        expect(wrapper.emitted("update-colour-scales")!.length).toBe(1);
        expect(wrapper.emitted("update-colour-scales")![0][0]).toStrictEqual({
            prevalence: newScale
        });
    });

    it("initialises new colour scales when current indicator has no colour scale yet", () => {
        const wrapper = getWrapper({
            selections: {...props.selections, indicatorId: "plhiv"}
        });

        expect(wrapper.emitted("update-colour-scales")!.length).toBe(1);
        expect(wrapper.emitted("update-colour-scales")![0][0]).toStrictEqual({
            ...props.colourScales,
            plhiv: {
                type: ScaleType.DynamicFiltered,
                customMin: 1,
                customMax: 100
            }
        });
    });

    it("updates bounds when becomes initialises", async () => {
        const mockUpdateBounds = vi.fn();
        const wrapper = getWrapper({ //this cannot initialise
            features: [...props.features],
            featureLevels: [...props.featureLevels],
            chartdata: [...props.chartdata],
            indicators: [...props.indicators],
            selections: {
                detail: -1,
                selectedFilterOptions: {}
            },
            filters: [
                props.filters[0], //area
                {id: "age", label: "Age", column_id: "age", options: []},
                {id: "sex", label: "Sex", column_id: "sex", options: []}
            ],
            colourScales: {}
        });
        const vm = wrapper.vm as any;
        vm.updateBounds = mockUpdateBounds;

        await wrapper.setProps(props); //This should initialise and trigger the watcher
        expect(mockUpdateBounds.mock.calls.length).toBeGreaterThan(0);
    });

    it("normalizeIndicators converts indicator metadata for treeselect", () => {
        const wrapper = getWrapper();
        const vm = wrapper.vm as any;
        const result = vm.normalizeIndicators(props.indicators[0]);
        expect(result).toStrictEqual({id: "plhiv", label: "PLHIV"});
    });

    it("options onEachFeature returns function which generates correct tooltips", () => {

        const wrapper = getWrapper();
        const vm = wrapper.vm as any;
        const options = vm.options;
        const onEachFeatureFunction = options.onEachFeature;

        const mockLayer = {
            bindTooltip: vi.fn()
        };

        const mockFeature = {
            properties: {
                area_id: "MWI_3_1",
                area_name: "Area 1"
            }
        };

        onEachFeatureFunction(mockFeature, mockLayer);
        expect(mockLayer.bindTooltip.mock.calls[0][0]).toEqual(`<div>
                        <strong>Area 1</strong>
                        <br/>1.00%
                        <br/>(1.00% - 10.00%)
                    </div>`);

        const mockZeroValueFeature = {
            properties: {
                area_id: "MWI_3_2",
                area_name: "Area 2"
            }
        };

        onEachFeatureFunction(mockZeroValueFeature, mockLayer);
        expect(mockLayer.bindTooltip.mock.calls[1][0]).toEqual(`<div>
                        <strong>Area 2</strong>
                        <br/>0.00%
                    </div>`);

    });

    it("updateTooltips sets tooltip content on all visible layers", async () => {
        const wrapper = getWrapper();
        const vm = wrapper.vm as any;

        const spy = vi.spyOn(wrapper.vm as any, "setLayerTooltipContent");

        vm.updateTooltips();

        // There are 2 visible features in test data
        expect(spy.mock.calls.length).toBe(2);
        expect((spy.mock.calls[0][1] as any).properties.area_id).toEqual("MWI_4_1")
        expect((spy.mock.calls[1][1] as any).properties.area_id).toEqual("MWI_4_2")
    });

    it("setLayerTooltipContent updates tooltip content for layer", () => {
        const wrapper = getWrapper();
        const vm = wrapper.vm as any;

        const mockSetTooltipContent = vi.fn();
        const mockLayer = {
            setTooltipContent: mockSetTooltipContent
        } as any;
        const mockFeature = {
            properties: {
                area_id: "MWI_3_1",
                area_name: "Area 1"
            }
        } as any;

        vm.setLayerTooltipContent(mockLayer, mockFeature);
        expect(mockSetTooltipContent.mock.calls.length).toBe(1);
        expect(mockSetTooltipContent.mock.calls[0][0]).toEqual(`<div>
                        <strong>Area 1</strong>
                        <br/>1.00%
                        <br/>(1.00% - 10.00%)
                    </div>`);
    });

    it('render round format output props correctly', () => {
        const wrapper = getWrapper({
            roundFormatOutput: false
        });
        expect(wrapper.props("roundFormatOutput")).toBe(false)
    });

    it('render round format output props correctly when prop is not specified', () => {
        const wrapper = getWrapper();
        expect(wrapper.props("roundFormatOutput")).toBe(true)
    });

    it("triggers updateBounds when component is updated", async () => {
        const wrapper = getWrapper();
        const spy = vi.spyOn(wrapper.vm as any, "updateBounds");
        expect(spy.mock.calls.length).toBe(0);
        // applying any update
        await wrapper.setProps({ ...props, selections: { ...props.selections, detail: 3 }});
        expect(spy.mock.calls.length).toBe(1);
    });

    it("renders slot content", async() => {
        const wrapper = getWrapper()
        expect(wrapper.html()).toContain("slot content")
    });

    it("triggers updateTooltips when component is updated", async () => {
        const wrapper = getWrapper();
        const spy = vi.spyOn(wrapper.vm as any, "updateTooltips");
        expect(spy.mock.calls.length).toBe(0);
        // applying any update
        await wrapper.setProps({ ...props, selections: { ...props.selections, detail: 3 }});
        expect(spy.mock.calls.length).toBe(1);
    });
});
