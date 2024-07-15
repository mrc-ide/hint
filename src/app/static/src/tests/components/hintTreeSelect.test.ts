import {mount, VueWrapper} from "@vue/test-utils";
import HintTreeSelect from "../../app/components/HintTreeSelect.vue";
import Treeselect from "@reside-ic/vue3-treeselect";

describe("Treeselect component", () => {

    const getWrapper = (multiple = false) => {
        return mount(HintTreeSelect, {
            props: {
                options: [{id: "1", label: "option1"}, {id: "2", label: "option2"}],
                modelValue: ["1"],
                multiple
            }
        })
    }

    const callWatcher = async (wrapper: VueWrapper<any>, watcher: string, newVal: string | string[] | null) => {
        await wrapper.vm.$options.watch[watcher].handler.call(wrapper.vm, newVal);
    }

    const getKey = (wrapper: VueWrapper<any>) => {
        return wrapper.vm.$data.reRender
    }

    beforeAll(() => {
        vi.useFakeTimers();
    });
    afterAll(() => {
        vi.useRealTimers();
    });

    it("updates key when model value changes with user input (array)", async () => {
        const wrapper = getWrapper();
        expect(getKey(wrapper)).toBe(0);
        await callWatcher(wrapper, "modelValue", ["2"]);
        vi.advanceTimersByTime(1);
        expect(getKey(wrapper)).toBe(1);
    });

    it("updates key when model value changes with user input (string)", async () => {
        const wrapper = getWrapper();
        expect(getKey(wrapper)).toBe(0);
        await callWatcher(wrapper, "modelValue", "2");
        vi.advanceTimersByTime(1);
        expect(getKey(wrapper)).toBe(1);
    });

    it("updates key when model value is null", async () => {
        const wrapper = getWrapper();
        expect(getKey(wrapper)).toBe(0);
        await callWatcher(wrapper, "modelValue", null);
        vi.advanceTimersByTime(1);
        expect(getKey(wrapper)).toBe(1);
    });

    it("does not update key when user inputs something (array)", async () => {
        const wrapper = getWrapper();
        const treeSelect = wrapper.findComponent(Treeselect);
        expect(getKey(wrapper)).toBe(0);
        await treeSelect.vm.$emit("update:model-value", "2")
        await callWatcher(wrapper, "modelValue", ["2"]);
        vi.advanceTimersByTime(1);
        expect(getKey(wrapper)).toBe(0);
    });

    it("does not update key when user inputs something (string)", async () => {
        const wrapper = getWrapper();
        const treeSelect = wrapper.findComponent(Treeselect);
        expect(getKey(wrapper)).toBe(0);
        await treeSelect.vm.$emit("update:model-value", "2")
        await callWatcher(wrapper, "modelValue", "2");
        vi.advanceTimersByTime(1);
        expect(getKey(wrapper)).toBe(0);
    });

    it("does not update key when multi-select is enabled", async () => {
        const wrapper = getWrapper(true);
        expect(getKey(wrapper)).toBe(0);
        await callWatcher(wrapper, "modelValue", ["1", "2"]);
        vi.advanceTimersByTime(1);
        expect(getKey(wrapper)).toBe(0);
    });
});
