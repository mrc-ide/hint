import WarningAlert from "../../app/components/WarningAlert.vue";
import Warning from "../../app/components/Warning.vue";
import Vuex from "vuex";
import {emptyState} from "../../app/root";
import registerTranslations from "../../app/store/translations/registerTranslations";
import {expectTranslated, shallowMountWithTranslate} from "../testHelpers";

describe("Warning alert component", () => {

    const warningsMock = {
        modelOptions: [{ text: 'a warning', locations: []}, { text: 'another warning', locations: []}, { text: 'third warning', locations: []}, { text: 'final warning', locations: []}],
        modelRun: [{ text: 'model run warning', locations: []}],
        modelCalibrate: [{ text: 'calibrate warning', locations: []}]
    }

    const store = new Vuex.Store({state: emptyState()});
    registerTranslations(store);

    const createWrapper = (warnings = warningsMock, activeStep = 3) => {
        const wrapper = shallowMountWithTranslate(WarningAlert, store, {
            props: {
                warnings: warnings,
                activeStep
            },
            global: {
                plugins: [store]
            }
        });
        return wrapper
    }

    afterEach(() => {
        vi.resetAllMocks();
    });

    it("renders no warning alert if there are no warnings", () => {
        const wrapper = createWrapper({ modelOptions: [], modelRun: [], modelCalibrate: []})
        expect(wrapper.find(".alert-warning").exists()).toBe(false);
    });

    it("renders warning messages", () => {
        const wrapper = createWrapper()

        expect(wrapper.find(".alert-warning").exists()).toBe(true);
        const warnings = wrapper.findAllComponents(Warning)
        expect(warnings.length).toBe(3);
        expect(warnings[0].props()).toStrictEqual({maxLines: 2, origin: "modelOptions", warnings: warningsMock["modelOptions"]});
        expect(warnings[1].props()).toStrictEqual({maxLines: 2, origin: "modelRun", warnings: warningsMock["modelRun"]});
        expect(warnings[2].props()).toStrictEqual({maxLines: 2, origin: "modelCalibrate", warnings: warningsMock["modelCalibrate"]});
    });

    it("clicking close triggers clear warnings emit", async () => {
        const wrapper = createWrapper()
        await wrapper.find("button").trigger("click")
        expect(wrapper.emitted("clear-warnings")!.length).toBe(1);
    });

    it("close button has correct aria-label translations", async () => {
        const wrapper = createWrapper()
        const button = wrapper.find("button")
        await expectTranslated(button,
            "Close",
            "Fermer",
            "Fechar",
            store as any,
            "aria-label");
    });

    it("only renders warning messages that have warnings and sets maxLines prop", async () => {
        const wrapper = createWrapper({
            modelOptions: [],
            modelRun: [{ text: 'model run warning', locations: []}],
            modelCalibrate: []
        })
        await wrapper.setProps({maxLines: 3})

        expect(wrapper.find(".alert-warning").exists()).toBe(true);
        const warnings = wrapper.findAllComponents(Warning)
        expect(warnings.length).toBe(1);
        expect(warnings[0].props()).toStrictEqual({maxLines: 3, origin: "modelRun", warnings: warningsMock["modelRun"]});
    });

})
