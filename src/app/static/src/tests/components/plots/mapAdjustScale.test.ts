import {mount, shallowMount} from '@vue/test-utils';
import MapAdjustScale from "../../../app/components/plots/MapAdjustScale.vue";
import {ScaleType} from "../../../app/store/plottingSelections/plottingSelections";
import registerTranslations from "../../../app/store/translations/registerTranslations";
import Vuex from "vuex";
import {emptyState} from "../../../app/root";
import { mountWithTranslate, shallowMountWithTranslate } from '../../testHelpers';

describe("MapAdjustScale component", () => {

    afterEach(() => {
        vi.clearAllMocks()
    })

    const store = new Vuex.Store({
        state: emptyState()
    });
    registerTranslations(store);

    const props = {
        name: "test",
        metadata: {
            max: 2,
            min: 1,
            format: '',
            scale: 1,
            accuracy: null
        },
        show: true,
        step: 0.1,
        scale: {
            type: ScaleType.Default,
            customMin: 0,
            customMax: 1
        }
    };

    it("does not render if show is false", () => {
        const wrapper = shallowMount(MapAdjustScale, {
            props: {...props, show: false},
            global: {
                plugins: [store]
            }
        });

        expect(wrapper.findAll("div").length).toBe(0);
    });

    it("renders radio button names as expected", () => {
        const wrapper = shallowMountWithTranslate(MapAdjustScale, store, {
            global: {
                plugins: [store]
            }, props
        });
        const name = "test-scaleType";
        expect((wrapper.find("#type-input-default").element as HTMLInputElement).name).toBe(name);
        expect((wrapper.find("#type-input-custom").element as HTMLInputElement).name).toBe(name);
        expect((wrapper.find("#type-input-dynamic-full").element as HTMLInputElement).name).toBe(name);
        expect((wrapper.find("#type-input-dynamic-filtered").element as HTMLInputElement).name).toBe(name);
    });

    it("renders as expected with default scale", () => {
        const wrapper = mountWithTranslate(MapAdjustScale, store, {
            global: {
                plugins: [store]
            }, props
        });

        expect((wrapper.find("#type-input-default").element as HTMLInputElement).checked).toBe(true);
        expect((wrapper.find("#type-input-custom").element as HTMLInputElement).checked).toBe(false);
        expect((wrapper.find("#type-input-dynamic-full").element as HTMLInputElement).checked).toBe(false);
        expect((wrapper.find("#type-input-dynamic-filtered").element as HTMLInputElement).checked).toBe(false);

        expect((wrapper.find("#custom-min-input").element as HTMLInputElement).disabled).toBe(true);
        expect((wrapper.find("#custom-max-input").element as HTMLInputElement).disabled).toBe(true);
    });

    it("renders as expected with custom scale", () => {
        const wrapper = mountWithTranslate(MapAdjustScale, store, {
            props: {
                ...props,
                scale: {
                    type: ScaleType.Custom,
                    customMin: 0,
                    customMax: 1
                }
            },
            global: {
                plugins: [store]
            }
        });

        expect((wrapper.find("#type-input-default").element as HTMLInputElement).checked).toBe(false);
        expect((wrapper.find("#type-input-custom").element as HTMLInputElement).checked).toBe(true);
        expect((wrapper.find("#type-input-dynamic-full").element as HTMLInputElement).checked).toBe(false);
        expect((wrapper.find("#type-input-dynamic-filtered").element as HTMLInputElement).checked).toBe(false);

        expect((wrapper.find("#custom-min-input").element as HTMLInputElement).disabled).toBe(false);
        expect((wrapper.find("#custom-min-input").element as HTMLInputElement).value).toBe("0");
        expect(wrapper.find("#custom-min-input").attributes("max")).toBe("1");
        expect(wrapper.find("#custom-min-input").attributes("step")).toBe("0.1");

        expect((wrapper.find("#custom-max-input").element as HTMLInputElement).disabled).toBe(false);
        expect((wrapper.find("#custom-max-input").element as HTMLInputElement).value).toBe("1");
        expect(wrapper.find("#custom-max-input").attributes("min")).toBe("0");
        expect(wrapper.find("#custom-max-input").attributes("step")).toBe("0.1");
        expect(wrapper.findAll("p").length).toBe(1);
        expect(wrapper.findAll("p")[0].text()).toBe("");
    });

    it("renders as expected with full dynamic scale", () => {
        const wrapper = mount(MapAdjustScale, {
            props: {
                ...props,
                scale: {
                    type: ScaleType.DynamicFull,
                    customMin: 0,
                    customMax: 1
                }
            },
            global: {
                plugins: [store]
            }
        });

        expect((wrapper.find("#type-input-default").element as HTMLInputElement).checked).toBe(false);
        expect((wrapper.find("#type-input-custom").element as HTMLInputElement).checked).toBe(false);
        expect((wrapper.find("#type-input-dynamic-full").element as HTMLInputElement).checked).toBe(true);
        expect((wrapper.find("#type-input-dynamic-filtered").element as HTMLInputElement).checked).toBe(false);

        expect((wrapper.find("#custom-min-input").element as HTMLInputElement).disabled).toBe(true);
        expect((wrapper.find("#custom-max-input").element as HTMLInputElement).disabled).toBe(true);
    });

    it("renders scale input modifier when scale parameter given", () => {
        const wrapper = mountWithTranslate(MapAdjustScale, store, {
            props: {
                ...props,
                metadata: {
                    max: 2,
                    min: 1,
                    format: '',
                    scale: 100,
                    accuracy: null
                },
                scale: {
                    type: ScaleType.DynamicFull,
                    customMin: 2,
                    customMax: 3
                }
            },
            global: {
                plugins: [store]
            }
        });
        expect(wrapper.findAll("p").length).toBe(2);
        expect(wrapper.findAll("p")[0].text()).toBe("x 100");
        expect(wrapper.findAll("p")[1].text()).toBe("x 100");
    });

    it("renders as expected with filtered dynamic scale", () => {
        const wrapper = mount(MapAdjustScale, {
            props: {
                ...props,
                scale: {
                    type: ScaleType.DynamicFiltered,
                    customMin: 0,
                    customMax: 1
                }
            },
            global: {
                plugins: [store]
            }
        });

        expect((wrapper.find("#type-input-default").element as HTMLInputElement).checked).toBe(false);
        expect((wrapper.find("#type-input-custom").element as HTMLInputElement).checked).toBe(false);
        expect((wrapper.find("#type-input-dynamic-full").element as HTMLInputElement).checked).toBe(false);
        expect((wrapper.find("#type-input-dynamic-filtered").element as HTMLInputElement).checked).toBe(true);

        expect((wrapper.find("#custom-min-input").element as HTMLInputElement).disabled).toBe(true);
        expect((wrapper.find("#custom-max-input").element as HTMLInputElement).disabled).toBe(true);
    });

    it("renders static scale controls as expected", () => {
        const wrapper = mountWithTranslate(MapAdjustScale, store, {
            global: {
                plugins: [store]
            }, props
        });

        expect(wrapper.find(".static-container").exists()).toBe(true);
        expect(wrapper.find(".static-default").exists()).toBe(true);
        expect(wrapper.find(".static-custom").exists()).toBe(true);
        expect(wrapper.find(".static-custom-values").exists()).toBe(true);
    });

    it("emits update event when type changes", async () => {
        const wrapper = mountWithTranslate(MapAdjustScale, store, {
            global: {
                plugins: [store]
            }, props
        });

        await wrapper.find("#type-input-custom").trigger("change");

        expect(wrapper.emitted("update")!.length).toBe(1);
        expect(wrapper.emitted("update")![0][0]).toStrictEqual({
            type: ScaleType.Custom,
            customMin: 0,
            customMax: 1
        });

        await wrapper.find("#type-input-default").trigger("change");

        expect(wrapper.emitted("update")!.length).toBe(2);
        expect(wrapper.emitted("update")![1][0]).toStrictEqual({
            type: ScaleType.Default,
            customMin: 0,
            customMax: 1
        });

        await wrapper.find("#type-input-dynamic-full").trigger("change");

        expect(wrapper.emitted("update")!.length).toBe(3);
        expect(wrapper.emitted("update")![1][0]).toStrictEqual({
            type: ScaleType.DynamicFull,
            customMin: 0,
            customMax: 1
        });

        await wrapper.find("#type-input-dynamic-filtered").trigger("change");

        expect(wrapper.emitted("update")!.length).toBe(4);
        expect(wrapper.emitted("update")![1][0]).toStrictEqual({
            type: ScaleType.DynamicFiltered,
            customMin: 0,
            customMax: 1
        });
    });

    it("emits update event when custom min or max changes", async () => {
        const wrapper = mount(MapAdjustScale, {
            store, props: {
                ...props,
                scale: {
                    type: ScaleType.Custom,
                    customMin: 0,
                    customMax: 1
                }
            }
        });

        await wrapper.find("#custom-min-input").setValue("0.5");
        expect(wrapper.emitted("update")!.length).toBe(1);
        expect(wrapper.emitted("update")![0][0]).toStrictEqual({
            type: ScaleType.Custom,
            customMin: 0.5,
            customMax: 1
        });

        await wrapper.find("#custom-max-input").setValue("1.5");
        expect(wrapper.emitted("update")!.length).toBe(2);
        expect(wrapper.emitted("update")![1][0]).toStrictEqual({
            type: ScaleType.Custom,
            customMin: 0.5,
            customMax: 1.5
        });
    });

    it("does not emit update event when type is Custom and custom max is not greater than custom min", async () => {
        const wrapper = mount(MapAdjustScale, {
            store, props: {
                ...props,
                scale: {
                    type: ScaleType.Custom,
                    customMin: 0,
                    customMax: 1
                }
            }
        });

        await wrapper.find("#custom-max-input").setValue("0");
        await wrapper.find("#custom-max-input").trigger("change");
        expect(wrapper.emitted("update")!).toBeUndefined();

        //Should emit event when change to default
        await wrapper.find("#type-input-default").trigger("change");
        expect(wrapper.emitted("update")!.length).toBe(1);
    });

    it("updates scaleToAdjust when scale property changes", async () => {
        const wrapper = mount(MapAdjustScale, {
            name: "test",
            store, props: {
                ...props,
                metadata: {
                    max: 2,
                    min: 1,
                    format: '',
                    scale: 1,
                    accuracy: null
                },
                scale: {
                    type: ScaleType.Custom,
                    customMin: 0,
                    customMax: 1
                }
            }
        });

        const newScale = {
            type: ScaleType.Default,
            customMin: 1,
            customMax: 2
        };
        await wrapper.setProps({scale: newScale});

        expect((wrapper.vm as any).scaleToAdjust).toStrictEqual(newScale);
    });
});
