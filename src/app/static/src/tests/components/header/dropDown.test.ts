import DropDown from "../../../app/components/header/DropDown.vue";
import Vuex from "vuex";
import {emptyState} from "../../../app/root";
import registerTranslations from "../../../app/store/translations/registerTranslations";
import {shallowMountWithTranslate} from "../../testHelpers";

describe("Drop down", () => {
    const store = new Vuex.Store({
        state: emptyState()
    });
    registerTranslations(store);

    it("toggles dropdown on click", async () => {
        const wrapper = shallowMountWithTranslate(DropDown, store, {
            global: {
                plugins: [store]
            }, props: {text: "text"}
        });
        expect(wrapper.find(".dropdown-menu").classes()).toStrictEqual(["dropdown-menu"]);
        await wrapper.find(".dropdown-toggle").trigger("click");
        expect(wrapper.find(".dropdown-menu").classes()).toStrictEqual(["dropdown-menu", "show"]);
        await wrapper.find(".dropdown-toggle").trigger("click");
        expect(wrapper.find(".dropdown-menu").classes()).toStrictEqual(["dropdown-menu"]);
    });

    it("closes dropdown on blur", async () => {
        const wrapper = shallowMountWithTranslate(DropDown, store, {
            global: {
                plugins: [store]
            }, props: {text: "text", delay: false}
        });
        await wrapper.find(".dropdown-toggle").trigger("click");
        expect(wrapper.find(".dropdown-menu").classes()).toStrictEqual(["dropdown-menu", "show"]);
        await wrapper.find(".dropdown-toggle").trigger("blur");
        expect(wrapper.find(".dropdown-menu").classes()).toStrictEqual(["dropdown-menu"]);
    });

    it("closes dropdown on blur after delay when 'delay' prop is true", async () => {
        const wrapper = shallowMountWithTranslate(DropDown, store, {
            global: {
                plugins: [store]
            }, props: {text: "text", delay: true}
        });
        await wrapper.find(".dropdown-toggle").trigger("click");
        expect(wrapper.find(".dropdown-menu").classes()).toStrictEqual(["dropdown-menu", "show"]);
        await wrapper.find(".dropdown-toggle").trigger("blur");
        expect(wrapper.find(".dropdown-menu").classes()).toStrictEqual(["dropdown-menu", "show"]);

        await new Promise((r) => setTimeout(r, 110));

        expect(wrapper.find(".dropdown-menu").classes()).toStrictEqual(["dropdown-menu"]);
    });

    it("closes dropdown on mouseleave from menu with delay", async () => {
        const wrapper = shallowMountWithTranslate(DropDown, store, {
            global: {
                plugins: [store]
            }, props: {text: "text", delay: true}
        });
        await wrapper.find(".dropdown-toggle").trigger("click");
        expect(wrapper.find(".dropdown-menu").classes()).toStrictEqual(["dropdown-menu", "show"]);
        await wrapper.find(".dropdown-menu").trigger("mouseleave");
        expect(wrapper.find(".dropdown-menu").classes()).toStrictEqual(["dropdown-menu", "show"]);

        await new Promise((r) => setTimeout(r, 110));

        expect(wrapper.find(".dropdown-menu").classes()).toStrictEqual(["dropdown-menu"]);
    });

    it("menu stays open when mouse is over the menu", async () => {
        const wrapper = shallowMountWithTranslate(DropDown, store, {
            global: {
                plugins: [store]
            }, props: {text: "text", delay: true}
        });
        await wrapper.find(".dropdown-toggle").trigger("click");
        expect(wrapper.find(".dropdown-menu").classes()).toStrictEqual(["dropdown-menu", "show"]);
        await wrapper.find(".dropdown-menu").trigger("mouseenter");
        expect(wrapper.find(".dropdown-menu").classes()).toStrictEqual(["dropdown-menu", "show"]);

        await new Promise((r) => setTimeout(r, 110));

        expect(wrapper.find(".dropdown-menu").classes()).toStrictEqual(["dropdown-menu", "show"]);
    });

    it("menu closes when you click on menu item", async () => {
        const wrapper = shallowMountWithTranslate(DropDown, store, {
            global: {
                plugins: [store]
            }, props: {text: "text", delay: true}
        });
        await wrapper.find(".dropdown-toggle").trigger("click");
        expect(wrapper.find(".dropdown-menu").classes()).toStrictEqual(["dropdown-menu", "show"]);
        await wrapper.find(".dropdown-menu").trigger("click");
        expect(wrapper.find(".dropdown-menu").classes()).toStrictEqual(["dropdown-menu"]);
    });
});
