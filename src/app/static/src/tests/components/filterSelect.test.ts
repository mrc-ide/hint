import {createLocalVue, shallowMount} from '@vue/test-utils';
import Vue from 'vue';
import Vuex from 'vuex';
import FilterSelect from "../../app/components/FilterSelect.vue";
import TreeSelect from '@riophae/vue-treeselect';

const localVue = createLocalVue();
Vue.use(Vuex);

describe("FilterSelect component", () => {
    const testOptions = [{id: "1", name: "one"}, {id: "2", name: "two"}];

    it ("renders label", () => {
        const wrapper = shallowMount(FilterSelect, {propsData: {label: "testLabel"}});

        expect(wrapper.find("label").text()).toBe("testLabel");
    });

    it ("renders TreeSelect", () => {
        const wrapper = shallowMount(FilterSelect, {propsData:
                {
                    options: testOptions,
                    value: "2",
                    disabled: false
                }});

        const treeSelect = wrapper.find(TreeSelect);
        expect(treeSelect.props("value")).toBe("2");
        expect(treeSelect.props("disabled")).toBe(false);
        expect(treeSelect.props("options")).toStrictEqual(testOptions);

        expect(treeSelect.props("clearable")).toBe(false);
        expect(treeSelect.props("multiple")).toBe(false);
    });

    it("emits indicator-changed event with indicator", () => {
        const wrapper = shallowMount(FilterSelect, {propsData: { options: testOptions}});
        wrapper.findAll(TreeSelect).at(0).vm.$emit("input", "2");
        expect(wrapper.emitted("select")[0][0]).toBe("2");
    });

    it ("transforms FilterOption in treeselectNormalizer", () => {
        const wrapper = shallowMount(FilterSelect, {localVue});
        const vm = (wrapper as any).vm;
        const result = vm.treeselectNormalizer({id: "1", name: "name1"});
        expect(result).toStrictEqual({id: "1", label: "name1"});
    });

    it ("transforms NestedFilterOption in treeselectNormalizer", () => {
        const wrapper = shallowMount(FilterSelect, {localVue});
        const vm = (wrapper as any).vm;
        const result = vm.treeselectNormalizer({
            id: "1",
            name: "name1",
            options: [
                {id: "2", name: "name2"},
                {id: "3", name: "name3"}
            ]});
        expect(result).toStrictEqual({
            id: "1",
            label: "name1",
            children: [
                {id: "2", label: "name2"},
                {id: "3", label: "name3"}
            ]
        });
    });
});