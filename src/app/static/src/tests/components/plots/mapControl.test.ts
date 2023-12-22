import {mount, shallowMount} from '@vue/test-utils';
import MapControl from "../../../app/components/plots/MapControl.vue";
import Treeselect from "vue3-treeselect";
import HintTreeSelect from '../../../app/components/HintTreeSelect.vue';
import Vuex from "vuex";
import {emptyState} from "../../../app/root";
import registerTranslations from "../../../app/store/translations/registerTranslations";
import { nextTick } from 'vue';

const store = new Vuex.Store({
    state: emptyState()
});
registerTranslations(store);

vi.mock("@vue-leaflet/vue-leaflet", () => {
    const LControl = {
        template: "<div id='l-control-mock'><slot></slot></div>"
    }
    return { LControl }
});

describe("Map control component", () => {

    const props = {
        showIndicators: true,
        levelLabels: [
            {id: 4, display: true, area_level_label: "Admin Level 4"},
            {id: 5, display: true, area_level_label: "Admin Level 5"}
        ],
        indicatorsMetadata: [
            {
                indicator: "art_coverage",
                name: "ART coverage"
            },
            {
                indicator: "prevalence",
                name: "Prevalence"
            }
        ]
    } as any;

    it("renders tree selects with expected properties", () => {
        const wrapper = mount(MapControl, {props, global: {plugins: [store]}});

        expect(wrapper.findAllComponents(Treeselect)[0].props("searchable")).toBe(false);
        expect(wrapper.findAllComponents(Treeselect)[0].props("multiple")).toBe(false);
        expect(wrapper.findAllComponents(Treeselect)[0].props("clearable")).toBe(false);

        expect(wrapper.findAllComponents(Treeselect)[1].props("searchable")).toBe(false);
        expect(wrapper.findAllComponents(Treeselect)[1].props("multiple")).toBe(false);
        expect(wrapper.findAllComponents(Treeselect)[1].props("clearable")).toBe(false);
    });

    it("renders indicator options", () => {
        const wrapper = mount(MapControl, {props, global: {plugins: [store]}});

        expect(wrapper.findAllComponents(Treeselect)[0].props("options"))
            .toStrictEqual([{id: "art_coverage", label: "ART coverage"},
                {id: "prevalence", label: "Prevalence"}]);
    });

    it("renders detail options", () => {
        const wrapper = mount(MapControl, {props, global: {plugins: [store]}});

        expect(wrapper.findAllComponents(Treeselect)[1].props("options"))
            .toStrictEqual([{id: 4, label: "Admin Level 4"},
                {id: 5, label: "Admin Level 5"}]);
    });


    it("emits indicator-changed event with indicator", () => {
        const wrapper = mount(MapControl, {props, global: {plugins: [store]}});
        wrapper.findAllComponents(HintTreeSelect)[0].vm.$emit("update:model-value", "art_coverage");
        expect(wrapper.emitted("indicatorChanged")![0][0]).toBe("art_coverage");
    });

    it("emits detail-changed event with detail", () => {
        const wrapper = mount(MapControl, {props, global: {plugins: [store]}});
        wrapper.findAllComponents(HintTreeSelect)[1].vm.$emit("update:model-value", 3);
        expect(wrapper.emitted("detailChanged")![0][0]).toBe(3);
    });

});
