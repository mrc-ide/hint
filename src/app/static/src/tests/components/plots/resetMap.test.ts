import ResetMap from "../../../app/components/plots/ResetMap.vue";
import {emptyState} from "../../../app/root";
import registerTranslations from "../../../app/store/translations/registerTranslations";
import {expectTranslated, mountWithTranslate} from "../../testHelpers";
import Vuex from "vuex";

vi.mock("@vue-leaflet/vue-leaflet", async () => {
    const actual = await vi.importActual("@vue-leaflet/vue-leaflet")
    const LControl = {
        template: "<div id='l-control-mock'><slot></slot></div>"
    }
    return {
        ...actual,
        LControl
    }
});

const store = new Vuex.Store({
    state: emptyState()
});
registerTranslations(store);

const getWrapper = () => {
    return mountWithTranslate(ResetMap, store, {global: {plugins: [store]}});
};

describe("ResetMap component", () => {

    it("render can display button on map and emit reset view when button clicked", async () => {
        const wrapper = getWrapper();
        expect(wrapper.findAll("#l-control-mock").length).toBe(1)
        const button = wrapper.find("#l-control-mock").find('div').find('a')
        await expectTranslated(button, 'Reset view', 'Réinitialiser la vue',
            "Repor vista", store, "aria-label");
        await expectTranslated(button, 'Reset view', 'Réinitialiser la vue',
            "Repor vista", store, "title");
        
        await button.trigger("click")
        expect(wrapper.emitted("reset-view")!).toBeTruthy();
    });

});
