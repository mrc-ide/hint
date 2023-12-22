import SizeLegend from "../../../../app/components/plots/bubble/SizeLegend.vue";
import {getRadius} from "../../../../app/components/plots/bubble/utils";
import Vuex from "vuex";
import {emptyState} from "../../../../app/root";
import registerTranslations from "../../../../app/store/translations/registerTranslations";
import MapAdjustScale from "../../../../app/components/plots/MapAdjustScale.vue";
import {ScaleType} from "../../../../app/store/plottingSelections/plottingSelections";
import { mountWithTranslate, shallowMountWithTranslate } from "../../../testHelpers";

vi.mock("@vue-leaflet/vue-leaflet", () => {
    const LControl = {
        template: "<div id='l-control-mock'><slot></slot></div>"
    }
    return { LControl }
});

const store = new Vuex.Store({
    state: emptyState()
});
registerTranslations(store);

const props = {
    minRadius: 10,
    maxRadius: 110,
    indicatorRange: {min: 1, max: 101},
    metadata: { format: '', accuracy: null, name: 'indicator'},
    sizeScale: {
        type: ScaleType.Default,
        customMin: 1.5,
        customMax: 2.5
    }
};

const getWrapper = (partialProps = {}) => {
    const testProps = {...props, ...partialProps};
    return mountWithTranslate(SizeLegend, store, {
        props: testProps,
        global: {
            plugins: [store]
        }
    });
};

const expectCirclesEqual = (actual: any, expected: any) => {
    expect(Math.round(actual.y)).toBe(Math.round(expected.y));
    expect(Math.round(actual.radius)).toBe(Math.round(expected.radius));
    expect(actual.text).toBe(expected.text);
    expect(Math.round(actual.textY)).toBe(Math.round(expected.textY));
};

const expectedCircles = () => {
    const result = [];
    result.push({y: 220, radius: 10, text: "<1.175", textY: 210});

    let r = getRadius(11, 1, 101, 10, 110);
    result.push({y: 230 - r, radius: r, text: "11", textY: 230 - (2 * r)});

    r = getRadius(26, 1, 101, 10, 110);
    result.push({y: 230 - r, radius: r, text: "26", textY: 230 - (2 * r)});

    r = getRadius(51, 1, 101, 10, 110);
    result.push({y: 230 - r, radius: r, text: "51", textY: 230 - (2 * r)});

    result.push({y: 120, radius: 110, text: "101", textY: 10});

    return result;
};

describe("SizeLegend component", () => {

    it("has expected steps", () => {
        const wrapper = getWrapper();
        const vm = wrapper.vm as any;
        expect(vm.steps).toStrictEqual([0.1, 0.25, 0.5, 1]);
    });

    it("computes width", () => {
        const wrapper = getWrapper();
        const vm = wrapper.vm as any;
        expect(vm.width).toBe(222);
    });

    it("computes height", () => {
        const wrapper = getWrapper();
        const vm = wrapper.vm as any;
        expect(vm.height).toBe(230);
    });

    it("computed midX", () => {
        const wrapper = getWrapper();
        const vm = wrapper.vm as any;
        expect(vm.midX).toBe(111);
    });

    it("computes circles", () => {
        const wrapper = getWrapper();
        const vm = wrapper.vm as any;
        const circles = vm.circles;
        const expected = expectedCircles();

        expect(circles.length).toBe(expected.length);
        circles.forEach((circle: any, index: number) => {
            expectCirclesEqual(circle, expected[index])
        });
    });

    it("computes circles for single value range", () => {
        const wrapper = getWrapper({indicatorRange: {min: 1, max: 1}});
        const vm = wrapper.vm as any;
        const circles = vm.circles;
        expect(circles.length).toBe(1);
        expectCirclesEqual(circles[0], {y: 120, radius: 110, text: "1", textY: 10});
    });

    it("computes circles where range includes NaN", () => {
        let wrapper = getWrapper({indicatorRange: {min: NaN, max: 1}});
        let vm = wrapper.vm as any;
        let circles = vm.circles;
        expect(circles.length).toBe(0);

        wrapper = getWrapper({indicatorRange: {min: 1, max: NaN}});
        vm = wrapper.vm as any;
        circles = vm.circles;
        expect(circles.length).toBe(0);
    });

    it("renders as expected", () => {
        const wrapper = getWrapper();
        const label = wrapper.find("label")
        expect(label.text()).toBe("indicator");

        const lControl = wrapper.find("#l-control-mock");
        expect(lControl.attributes().position).toBe("bottomleft");

        const svg = lControl.find("svg");
        expect(svg.attributes().width).toBe("222");
        expect(svg.attributes().height).toBe("230");

        const expectedCirclesData = expectedCircles();

        const circles = svg.findAll("circle");
        expect(circles.length).toBe(expectedCirclesData.length);
        const texts = svg.findAll("text");
        expect(texts.length).toBe(expectedCirclesData.length);

        expectedCirclesData.forEach((circleData: any, index: number) => {
            const circle = circles[index];
            expect(circle.attributes().stroke).toBe("#aaa");
            expect(circle.attributes()["stroke-width"]).toBe("1");
            expect(circle.attributes()["fill-opacity"]).toBe("0");
            expect(parseFloat(circle.attributes().r)).toBeCloseTo(circleData.radius);
            expect(parseFloat(circle.attributes().cx)).toBe(111);
            expect(parseFloat(circle.attributes().cy)).toBeCloseTo(circleData.y);

            const text = texts[index];
            expect(text.attributes()["text-anchor"]).toBe("middle");
            expect(parseFloat(text.attributes().x)).toBe(111);
            expect(parseFloat(text.attributes().y)).toBeCloseTo(circleData.textY);
            expect(text.text()).toBe(circleData.text);
        });
    });

    it("renders MapAdjustScale as expected", () => {
        const wrapper = getWrapper();
        const adjust = wrapper.findComponent(MapAdjustScale);
        expect(adjust.props("name")).toBe("size");
        expect(adjust.props("show")).toBe(false);
        expect(adjust.props("scale")).toStrictEqual(props.sizeScale);
        expect(adjust.props("metadata")).toStrictEqual(props.metadata);
    });

    it("renders text for circle with 0 value as expected", () => {
        const wrapper = mountWithTranslate(SizeLegend, store, {
            props: {
                minRadius: 10,
                maxRadius: 110,
                indicatorRange: {min: 0, max: 0.1},
                metadata: { format: '0', accuracy: 0.1, name: 'indicator'}
            },
            global: {
                plugins: [store]
            }
        });
        const zeroText = wrapper.findAll("text")[0];
        expect(zeroText.text()).toBe("0");

    });

    it("renders large numbers as expected", () => {
        const wrapper = mountWithTranslate(SizeLegend, store, {
            props: {
                minRadius: 10,
                maxRadius: 100,
                indicatorRange: {min: 2000, max: 10000},
                metadata: { format: '0.0', accuracy: 1, name: 'indicator'}
            },
            global: {
                plugins: [store]
            }
        });

        const firstText = wrapper.findAll("text")[0];
        expect(firstText.text()).toBe("<2.0k");

        const lastText = wrapper.findAll("text")[4];
        expect(lastText.text()).toBe("10k");
    });

    it("toggles show adjust scale", async () => {
        const wrapper = getWrapper();

        const adjust = wrapper.findComponent(MapAdjustScale);

        const showAdjust = wrapper.find(".adjust-scale a");
        expect(showAdjust.find("span").text()).toBe("Adjust scale");

        await showAdjust.trigger("click");
        expect(adjust.props().show).toBe(true);
        expect(showAdjust.find("span").text()).toBe("Done");

        await showAdjust.trigger("click");
        expect(adjust.props().show).toBe(false);
        expect(showAdjust.find("span").text()).toBe("Adjust scale");
    });

    it("emits update event when scale changes", () => {
        const wrapper = getWrapper();

        const newScale = {
            type: ScaleType.Custom,
            customMin: 0,
            customMax: 1
        };

        const adjust = wrapper.findComponent(MapAdjustScale);
        adjust.vm.$emit("update", newScale);

        expect(wrapper.emitted("update")!.length).toBe(1);
        expect(wrapper.emitted("update")![0][0]).toBe(newScale);
    });
});
