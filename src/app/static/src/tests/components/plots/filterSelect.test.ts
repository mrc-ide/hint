import FilterSelect from "../../../app/components/plots/FilterSelect.vue";
import TreeSelect from "vue3-treeselect";
import Vuex from "vuex";
import {emptyState} from "../../../app/root";
import registerTranslations from "../../../app/store/translations/registerTranslations";
import VueFeather from "vue-feather";
import { mountWithTranslate, shallowMountWithTranslate } from '../../testHelpers';
import { VueWrapper } from "@vue/test-utils";

describe("FilterSelect component", () => {
    const testOptions = [{id: "1", label: "one"}, {id: "2", label: "two"}];

    const store = new Vuex.Store({
        state: emptyState()
    });
    registerTranslations(store);

    it("renders label", () => {
        const wrapper = shallowMountWithTranslate(FilterSelect, store, {
            global: {
                plugins: [store]
            }, props: {options: testOptions, label: "testLabel"}
        });
        expect(wrapper.find("label").text()).toBe("testLabel");
    });

    it("renders tooltip if any options have descriptions", () => {
        const tooltip = vi.fn();
        const wrapper = shallowMountWithTranslate(FilterSelect, store, {
            global: {
                plugins: [store],
                directives: {
                    tooltip
                }
            },
            props: {
                options: [
                    ...testOptions,
                    {id: "3", label: "three", description: "Third option"},
                    {id: "4", label: "four", description: "Fourth option"}
                ]
            },
        });
        expect(wrapper.findComponent(VueFeather).exists()).toBe(true);
        expect(wrapper.findComponent(VueFeather).props("type")).toBe("help-circle");
        expect(tooltip.mock.calls[0][1].value.content).toBe("<dl><dt>three</dt><dd>Third option</dd><dt>four</dt><dd>Fourth option</dd></dl>");
    });

    it("does not render tooltip unless any options have descriptions", () => {
        const wrapper = mountWithTranslate(FilterSelect, store, {
            global: {
                plugins: [store]
            }, props: {options: testOptions, label: "testLabel"}
        });
        expect(wrapper.find("span.filter-select").exists()).toBe(false);
    });

    it("renders TreeSelect", () => {
        const wrapper = mountWithTranslate(FilterSelect, store, {
            global: {
                plugins: [store]
            },
            props:
                {
                    label: "label",
                    options: testOptions,
                    value: "2",
                    disabled: false
                }
        });

        const treeSelect = wrapper.findComponent(TreeSelect);
        expect(treeSelect.props("modelValue")).toBe("2");
        expect(treeSelect.props("disabled")).toBe(false);
        expect(treeSelect.props("options")).toStrictEqual(testOptions);

        expect(treeSelect.props("clearable")).toBe(false);
        expect(treeSelect.props("multiple")).toBe(false);

        const label = wrapper.find("label");
        expect(label.classes().indexOf("disabled-label")).toBe(-1);
    });

    it("renders TreeSelect with null value and placeholder if disabled", () => {
        const wrapper = mountWithTranslate(FilterSelect, store, {
            global: {
                plugins: [store]
            },
            props:
                {
                    label: "label",
                    options: testOptions,
                    value: "2",
                    disabled: true
                }
        });

        const treeSelect = wrapper.findComponent(TreeSelect);
        expect(treeSelect.props("modelValue")).toBeNull();
        expect(treeSelect.props("disabled")).toBe(true);
        expect(treeSelect.props("options")).toStrictEqual(testOptions);
        expect(treeSelect.props("placeholder")).toEqual("Not used");

        expect(treeSelect.props("clearable")).toBe(false);
        expect(treeSelect.props("multiple")).toBe(false);

        const label = wrapper.find("label");
        expect(label.classes()).toContain("disabled-label");
    });

    it("emits indicator-changed event with indicator", async () => {
        const wrapper = mountWithTranslate(FilterSelect, store, {
            global: {
                plugins: [store]
            }, props: {label: "label", options: testOptions}
        });
        await wrapper.findAllComponents(TreeSelect)[0].vm.$emit("update:modelValue", "2");
        expect(wrapper.emitted("input")![0][0]).toBe("2");
    });

    it("does not emit input event if disabled", () => {
        const wrapper = mountWithTranslate(FilterSelect, store, {
            global: {
                plugins: [store]
            },
            props: {label: "label", options: testOptions, disabled: true}
        });
        wrapper.findAllComponents(TreeSelect)[0].vm.$emit("update:modelValue", "2");
        expect(wrapper.emitted("input")!).toBeUndefined();
    });

    it("emits select event with added value when multi-select", () => {
        const wrapper = mountWithTranslate(FilterSelect, store, {
            global: {
                plugins: [store]
            },
            props: {label: "Label", options: testOptions, multiple: true, value: []}
        });
        wrapper.findAllComponents(TreeSelect)[0].vm.$emit("select", {id: "1", label: "one"});
        expect(wrapper.emitted("update:filter-select")![0][0]).toStrictEqual([{id: "1", label: "one"}]);

        wrapper.findAllComponents(TreeSelect)[0].vm.$emit("select", {id: "2", label: "two"});
        expect(wrapper.emitted("update:filter-select")![1][0]).toStrictEqual([{id: "1", label: "one"}, {id: "2", label: "two"}]);
    });

    it("emits select event with replaced value when not multi-select", () => {
        const wrapper = mountWithTranslate(FilterSelect, store, {
            global: {
                plugins: [store]
            },
            props: {label: "Label", options: testOptions, multiple: false}
        });
        wrapper.findAllComponents(TreeSelect)[0].vm.$emit("select", {id: "1", label: "one"});
        expect(wrapper.emitted("update:filter-select")![0][0]).toStrictEqual([{id: "1", label: "one"}]);

        wrapper.findAllComponents(TreeSelect)[0].vm.$emit("select", {id: "2", label: "two"});
        expect(wrapper.emitted("update:filter-select")![1][0]).toStrictEqual([{id: "2", label: "two"}]);
    });

    it("emits select even when deselect", () => {
        const wrapper = mountWithTranslate(FilterSelect, store, {
            global: {
                plugins: [store]
            },
            props: {label: "Label", options: testOptions, multiple: true, value: ["1", "2"]}
        });

        wrapper.findAllComponents(TreeSelect)[0].vm.$emit("deselect", {id: "1", label: "one"});
        expect(wrapper.emitted("update:filter-select")![0][0]).toStrictEqual([{id: "2", label: "two"}]);
    });
});
