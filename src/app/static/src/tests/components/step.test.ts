import {shallowMount} from '@vue/test-utils';
import Vuex from "vuex";
import Step from "../../app/components/Step.vue";
import {emptyState} from "../../app/root";
import registerTranslations from "../../app/store/translations/registerTranslations";
import {expectTranslated, shallowMountWithTranslate} from "../testHelpers";
import {nextTick} from 'vue';

describe("Step component", () => {

    const store = new Vuex.Store({state: emptyState()});
    registerTranslations(store);

    it("renders step", async () => {
        const wrapper =  shallowMountWithTranslate(Step, store, {
            global: {
                plugins: [store]
            },
            props: {
                textKey: "uploadInputs"
            }
        });

        await expectTranslated(wrapper.find("div"),
            "Upload inputs",
            "Télécharger les entrées",
            "Carregar entradas", store);
    });

    it("renders enabled step", () => {
        const wrapper = shallowMount(Step, {
            props: {
                textKey: "uploadInputs",
                enabled: true
            } as any
        });

        expect(wrapper.classes()).toStrictEqual(["col", "step", "enabled"]);
    });

    it("renders active step", () => {
        const wrapper = shallowMount(Step, {
            props: {
                textKey: "uploadInputs",
                active: true,
                enabled: true
            } as any
        });

        expect(wrapper.classes()).toStrictEqual(["col", "step", "active", "enabled"]);
        expect(wrapper.find("button").classes()).toStrictEqual(["btn", "btn-white"]);
    });

    it("renders inactive step", () => {
        const wrapper = shallowMount(Step, {
            props: {
                textKey: "uploadInputs",
                active: false
            } as any
        });

        expect(wrapper.classes()).toStrictEqual(["col", "step"]);
        expect(wrapper.find("button").classes()).toStrictEqual(["btn"]);
    });

    it("renders enabled step", async () => {
        const wrapper = shallowMount(Step, {
            props: {
                textKey: "uploadInputs",
                enabled: true,
                number: 2
            } as any
        });

        expect(wrapper.classes()).toStrictEqual(["col", "step", "enabled"]);
        expect(wrapper.find("button").classes()).toStrictEqual(["btn", "btn-white"]);
        expect(wrapper.find("button").attributes().disabled).toBeUndefined();
        await wrapper.find("button").trigger("click");
        await nextTick();

        expect(wrapper.emitted("jump")![0][0]).toBe(2);
    });

    it("renders complete step", () => {
        const wrapper = shallowMount(Step, {
            props: {
                textKey: "uploadInputs",
                enabled: true,
                complete: true
            } as any
        });

        expect(wrapper.classes()).toStrictEqual(["col", "step", "complete", "enabled"]);
        expect(wrapper.find("button").classes()).toStrictEqual(["btn", "btn-red"]);
    });

    it("renders disabled step", async () => {
        const wrapper = shallowMount(Step, {
            props: {
                textKey: "uploadInputs",
                enabled: false
            } as any
        });
        expect(wrapper.find("button").attributes().disabled).toBeDefined();
        await wrapper.find("button").trigger("click");

        await nextTick();
        expect(wrapper.emitted().jump).toBeUndefined();
    });

});
