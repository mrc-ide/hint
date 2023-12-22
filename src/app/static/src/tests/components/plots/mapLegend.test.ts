vi.mock("@vue-leaflet/vue-leaflet", () => {
    const LControl = {
        template: "<div id='l-control-mock'><slot></slot></div>"
    }
    return { LControl }
});

import {DOMWrapper} from '@vue/test-utils';
import MapLegend from "../../../app/components/plots/MapLegend.vue";
import {ScaleType} from "../../../app/store/plottingSelections/plottingSelections";
import MapAdjustScale from "../../../app/components/plots/MapAdjustScale.vue";
import Vuex from "vuex";
import {emptyState} from "../../../app/root";
import registerTranslations from "../../../app/store/translations/registerTranslations";
import {expectTranslated, mountWithTranslate} from "../../testHelpers";

const store = new Vuex.Store({
    state: emptyState()
});
registerTranslations(store);

describe("Map legend component", () => {

    const colourRange = {
        max: 2,
        min: 1
    };

    const expectLevels = (levels: DOMWrapper<any>[]) => {
        expect(levels.length).toBe(6);
        expect(levels[0].text()).toBe("2");
        expect(levels[1].text()).toBe("1.8");
        expect(levels[2].text()).toBe("1.6");
        expect(levels[3].text()).toBe("1.4");
        expect(levels[4].text()).toBe("1.2");
        expect(levels[5].text()).toBe("1");
    };

    const expectIcons = (icons: DOMWrapper<any>[]) => {
        expect((icons[5].element as HTMLElement).style
            .getPropertyValue("background")).toBe("rgb(255, 255, 255)");
        expect((icons[1].element as HTMLElement).style
            .getPropertyValue("background")).toBe("rgb(64, 64, 64)");
        expect((icons[0].element as HTMLElement).style
            .getPropertyValue("background")).toBe("rgb(0, 0, 0)");
    };

    const props = {
        metadata: {
            max: 2,
            min: 1,
            colour: "interpolateGreys",
            invert_scale: false,
            name: "indicator",
            format: '',
            scale: 1,
            accuracy: null
        },
        colourScale: {
            type: ScaleType.Default,
                customMin: 1.5,
                customMax: 2.5
        },
        colourRange
    };

    const wrapper = mountWithTranslate(MapLegend, store, {
        props,
        global: {
            plugins: [store]
        }
    });

    it("renders the label", () => {
        const label = wrapper.find("label");
        expect(label.text()).toBe("indicator");
    });

    it("calculates 6 levels from min to max", () => {
        const levels = wrapper.findAll(".level");
        expectLevels(levels);
    });

    it("renders icons with colors", () => {
        const icons = wrapper.findAll("i");
        expectIcons(icons);
    });

    it("renders MapAdjustScale as expected", () => {
        const adjust = wrapper.findComponent(MapAdjustScale);
        expect(adjust.props("name")).toBe("colour");
        expect(adjust.props("show")).toBe(false);
        expect(adjust.props("scale")).toStrictEqual(props.colourScale);
        expect(adjust.props("metadata")).toStrictEqual(props.metadata);
        expect(adjust.props("step")).toBe(0.1);
    });

    it("calculates 6 levels from min to max with negative min", () => {
        const rangeWrapper = mountWithTranslate(MapLegend, store, {
            global: {
                plugins: [store]
            },
            props: {
                metadata: {
                    max: 2,
                    min: 1,
                    colour: "interpolateGreys",
                    invert_scale: false,
                    name: "indicator",
                    format: '',
                    scale: 1,
                    accuracy: null
                },
                colourRange: {min: -0.45, max: 0}
            }
        });
        const levels = rangeWrapper.findAll(".level");
        expect(levels.length).toBe(6);

        expect(levels[0].text()).toBe("0");
        expect(levels[1].text()).toBe("-0.09");
        expect(levels[2].text()).toBe("-0.18");
        expect(levels[3].text()).toBe("-0.27");
        expect(levels[4].text()).toBe("-0.36");
        expect(levels[5].text()).toBe("-0.45");
    });

    it("calculates 6 levels from min to max with percentage format", () => {
        const rangeWrapper = mountWithTranslate(MapLegend, store, {
            global: {
                plugins: [store]
            },
            props: {
                metadata: {
                    max: 2,
                    min: 1,
                    colour: "interpolateGreys",
                    invert_scale: false,
                    format: '0.00%',
                    scale: 1,
                    accuracy: null
                },
                colourRange: {min: 1, max: 2}
            }
        });
        const levels = rangeWrapper.findAll(".level");
        expect(levels.length).toBe(6);

        expect(levels[0].text()).toBe("200.00%");
        expect(levels[1].text()).toBe("180.00%");
        expect(levels[2].text()).toBe("160.00%");
        expect(levels[3].text()).toBe("140.00%");
        expect(levels[4].text()).toBe("120.00%");
        expect(levels[5].text()).toBe("100.00%");
    });

    it("calculates 6 levels from min to max with 500 scale", () => {
        const rangeWrapper = mountWithTranslate(MapLegend, store, {
            global: {
                plugins: [store]
            },
            props: {
                metadata: {
                    max: 2,
                    min: 1,
                    colour: "interpolateGreys",
                    invert_scale: false,
                    format: '',
                    scale: 500,
                    accuracy: null
                },
                colourRange: {min: 1, max: 2}
            }
        });
        const levels = rangeWrapper.findAll(".level");
        expect(levels.length).toBe(6);

        expect(levels[0].text()).toBe("1.0k");
        expect(levels[1].text()).toBe("900");
        expect(levels[2].text()).toBe("800");
        expect(levels[3].text()).toBe("700");
        expect(levels[4].text()).toBe("600");
        expect(levels[5].text()).toBe("500");
    });

    it("calculates single level when max equals min", () => {
        const rangeWrapper = mountWithTranslate(MapLegend, store, {
            global: {
                plugins: [store]
            },
            props: {
                metadata: {
                    max: 2,
                    min: 1,
                    colour: "interpolateGreys",
                    invert_scale: false,
                    name: "indicator",
                    format: '',
                    scale: 1,
                    accuracy: null
                },
                colourRange: {min: 3, max: 3}
            }
        });
        const levels = rangeWrapper.findAll(".level");
        expect(levels.length).toBe(1);
        expect(levels[0].text()).toBe("3");

        const icons = rangeWrapper.findAll("i");
        expect(icons.length).toBe(1);
        expect((icons[0].element as HTMLElement).style
            .getPropertyValue("background")).toBe("rgb(255, 255, 255)");
    });

    it("does not render adjust link if no colour scale", () => {
        expect(wrapper.find(".adjust-scale").exists()).toBe(true);

        const noScaleWrapper = mountWithTranslate(MapLegend, store, {
            global: {
                plugins: [store]
            },
            props: {
                metadata: {
                    max: 10,
                    min: 0,
                    colour: "interpolateGreys",
                    invert_scale: false,
                    name: "indicator",
                    format: '',
                    scale: 1,
                    accuracy: null
                },
                colourScale: null,
                colourRange
            },
        });
        expect(noScaleWrapper.find("#adjust-scale").exists()).toBe(false);
    });

    it("renders icons with colors, with scale inverted", () => {
        const invertedWrapper = mountWithTranslate(MapLegend, store, {
            global: {
                plugins: [store]
            },
            props: {
                metadata: {
                    max: 2,
                    min: 1,
                    colour: "interpolateGreys",
                    invert_scale: true,
                    name: "indicator",
                    format: '',
                    scale: 1,
                    accuracy: null
                },
                colourScale: {
                    type: ScaleType.Default
                },
                colourRange
            }
        });

        const icons = invertedWrapper.findAll("i");
        expect((icons[5].element as HTMLElement).style
            .getPropertyValue("background")).toBe("rgb(0, 0, 0)");
        expect((icons[1].element as HTMLElement).style
            .getPropertyValue("background")).toBe("rgb(226, 226, 226)");
        expect((icons[0].element as HTMLElement).style
            .getPropertyValue("background")).toBe("rgb(255, 255, 255)");

    });

    it("returns no levels if no metadata", () => {
        const emptyWrapper = mountWithTranslate(MapLegend, store, {
            global: {
                plugins: [store]
            },
            props: {
                metadata: null
            }
        });
        expect(emptyWrapper.findAll("i").length).toBe(0);
        expect(emptyWrapper.findAll(".level").length).toBe(0);
    });

    it("formats big numbers", () => {
        const wrapper = mountWithTranslate(MapLegend, store, {
            global: {
                plugins: [store]
            },
            props: {
                metadata: {
                    max: 60000,
                    min: 1000,
                    colour: "interpolateGreys",
                    invert_scale: false,
                    name: "indicator",
                    format: '',
                    scale: 1,
                    accuracy: null
                },
                colourScale: {
                    type: ScaleType.Default
                },
                colourRange: {max: 60000, min: 1000}
            }
        });
        const levels = wrapper.findAll(".level");
        expect(levels[0].text()).toBe("60k");
        expect(levels[5].text()).toBe("1.0k");
    });

    it("toggles show adjust scale", async () => {
        const colourScale = {
            type: ScaleType.Default
        };

        const wrapper = mountWithTranslate(MapLegend, store, {
            global: {
                plugins: [store]
            },
            props: {
                metadata: {
                    max: 20,
                    min: 0,
                    colour: "interpolateGreys",
                    invert_scale: false,
                    name: "indicator",
                    format: '',
                    scale: 1,
                    accuracy: null
                },
                colourRange,
                colourScale
            },
            store
        });

        const adjust = wrapper.findComponent(MapAdjustScale);

        const showAdjust = wrapper.find(".adjust-scale a");
        await expectTranslated(showAdjust.find("span"), "Adjust scale", "Ajuster l'échelle",
            "Ajustar a escala", store);

        await showAdjust.trigger("click");
        expect(adjust.props().show).toBe(true);
        await expectTranslated(showAdjust.find("span"), "Done", "Terminé","Concluído", store);

        await showAdjust.trigger("click");
        expect(adjust.props().show).toBe(false);
        await expectTranslated(showAdjust.find("span"), "Adjust scale", "Ajuster l'échelle",
            "Ajustar a escala", store);
    });

    it("emits update event when scale changes", () => {
        const wrapper = mountWithTranslate(MapLegend, store, {
            global: {
                plugins: [store]
            },
            props: {
                metadata: {
                    max: 20,
                    min: 1,
                    colour: "interpolateGreys",
                    invert_scale: false,
                    name: "indicator",
                    format: '',
                    scale: 1,
                    accuracy: null
                },
                colourScale: {type: ScaleType.Default},
                colourRange
            }
        });

        const newColourScale = {
            type: ScaleType.Custom,
            customMin: 0,
            customMax: 1
        };

        const adjust = wrapper.findComponent(MapAdjustScale);
        adjust.vm.$emit("update", newColourScale);

        expect(wrapper.emitted("update")!.length).toBe(1);
        expect(wrapper.emitted("update")![0][0]).toBe(newColourScale);
    });
});
