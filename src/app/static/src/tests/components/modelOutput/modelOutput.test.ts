import {shallowMount} from "@vue/test-utils";
import ModelOutput from "../../../app/components/modelOutput/ModelOutput.vue";

describe("Model Output page", () => {
    const getWrapper = () => {
        return shallowMount(ModelOutput);
    };

    test("renders as expected", () => {
        const wrapper = getWrapper();
        expect(wrapper.text()).toBe("Model Output");
    });
});
