import Warning from "../../app/components/Warning.vue";
import {nextTick} from "vue";
import Vuex from "vuex";
import VueFeather from "vue-feather";
import {emptyState} from "../../app/root";
import registerTranslations from "../../app/store/translations/registerTranslations";
import {expectTranslated, shallowMountWithTranslate} from "../testHelpers";

describe("Warning component", () => {

    const mockPropsModelOptions = {
        origin: "modelOptions",
        warnings: [{ text: 'a warning', locations: []}, { text: 'another warning', locations: []}, { text: 'third warning', locations: []}, { text: 'final warning', locations: []}]
    }

    const mockPropsModelRun = {
        origin: "modelRun",
        warnings: [{ text: 'model run warning', locations: []}]
    }

    const mockPropsReviewInputs = {
        origin: "reviewInputs",
        warnings: [{ text: 'review input warning', locations: []}]
    }

    const mockPropsModelCalibrate = {
        origin: "modelCalibrate",
        warnings: [{ text: 'calibrate warning', locations: []}]
    }

    const store = new Vuex.Store({state: emptyState()});
    registerTranslations(store);

    const createWrapper = (props = mockPropsModelOptions) => {
        const wrapper = shallowMountWithTranslate(Warning, store, {
            props,
            global: {
                plugins: [store]
            }
        });
        return wrapper
    }

    function setDivHeights(wrapper: any, l: number, wb: number) {
        function internal(refName: string, height: number){
            const selDiv = wrapper.vm.$refs[refName] as HTMLDivElement;
            vi.spyOn(selDiv, "clientHeight", "get")
                .mockImplementation(() => height);
        }
        internal("line", l)
        internal("warningBox", wb)
    }

    it("empty warnings are not rendered and setIntervals are cleared", () => {
        const wrapper = createWrapper({origin: "anything", warnings: []})
        expect(wrapper.find("div").exists()).toBe(false);
    });

    it("renders warning messages", async () => {
        const wrapper = createWrapper()
        await expectTranslated(wrapper.find("h5"), 
            "Model option validation raised the following warning(s)", 
            "La validation de l'option de modèle a généré le(s) avertissement(s) suivant(s)", 
            "A validação da opção de modelo gerou o (s) seguinte (s) aviso (s)", 
        store)
        const alertIcon = wrapper.find("h5").findComponent(VueFeather);
        expect(alertIcon.exists()).toBe(true);
        expect(alertIcon.props("type")).toBe("alert-triangle");
        expect(wrapper.findAll("li").length).toBe(4);
        expect(wrapper.find("li > div").attributes("style")).toBeUndefined();
        expect(wrapper.findAll("li")[0].text()).toBe("a warning");
        expect(wrapper.findAll("li")[1].text()).toBe("another warning");
        expect(wrapper.findAll("li")[2].text()).toBe("third warning");
        expect(wrapper.findAll("li")[3].text()).toBe("final warning");
      
        await wrapper.setProps(mockPropsModelRun)
        await expectTranslated(wrapper.find("h5"), 
            "Model fit raised the following warning(s)", 
            "L'ajustement du modèle a soulevé le(s) avertissement(s) suivant(s)", 
            "O ajuste do modelo gerou o seguinte aviso (s)", 
        store)
        const alertIcon1 = wrapper.find("h5").findComponent(VueFeather);
        expect(alertIcon1.exists()).toBe(true);
        expect(alertIcon1.props("type")).toBe("alert-triangle");
        expect(wrapper.findAll("li").length).toBe(1);
        expect(wrapper.findAll("li")[0].text()).toBe("model run warning");

        await wrapper.setProps(mockPropsModelCalibrate)
        await expectTranslated(wrapper.find("h5"), 
            "Model calibration raised the following warning(s)", 
            "L'étalonnage du modèle a déclenché le(s) avertissement(s) suivant(s)", 
            "A calibração do modelo gerou o (s) seguinte (s) aviso (s)", 
        store)
        const alertIcon2 = wrapper.find("h5").findComponent(VueFeather);
        expect(alertIcon2.exists()).toBe(true);
        expect(alertIcon2.props("type")).toBe("alert-triangle");
        expect(wrapper.findAll("li").length).toBe(1);
        expect(wrapper.findAll("li")[0].text()).toBe("calibrate warning");

        await wrapper.setProps(mockPropsReviewInputs)
        await expectTranslated(wrapper.find("h5"),
            "Review inputs raised the following warning(s)",
            "L'examen des entrées a généré le ou le(s) avertissements suivant(s)",
            "As entradas de revisão geraram o (s) seguintes aviso (s)",
            store)
        const alertIcon3 = wrapper.find("h5").findComponent(VueFeather);
        expect(alertIcon3.exists()).toBe(true);
        expect(alertIcon3.props("type")).toBe("alert-triangle");
        expect(wrapper.findAll("li").length).toBe(1);
        expect(wrapper.findAll("li")[0].text()).toBe("review input warning");

        const hiddenWarning = wrapper.find(".invisible")
        expect(hiddenWarning.text()).toBe("Hidden line");
    });

    it("renders show more/less buttons if warnings are lengthy", async () => {
        const wrapper = createWrapper()
        setDivHeights(wrapper, 24, 96)
        await wrapper.setProps(mockPropsModelRun)
        await nextTick()
        await expectTranslated(wrapper.find("button"), 
            "Show more", 
            "Montrer plus", 
            "Mostre mais", 
        store)
        await wrapper.find("button").trigger("click")
        await nextTick();
        await expectTranslated(wrapper.find("button"),
            "Show less", 
            "Montrer moins", 
            "Mostre menos", 
        store)
    });

    it("does not show more/less buttons if warnings are not lengthy", async () => {
        const wrapper = createWrapper()
        setDivHeights(wrapper, 24, 24)
        await wrapper.setProps(mockPropsModelRun)
        await nextTick()
        expect(wrapper.find("button").exists()).toBe(false)
    });

    it("multiple warnings get truncated to one line each if lengthy", async () => {
        const wrapper = createWrapper(mockPropsModelRun)
        setDivHeights(wrapper, 24, 96)
        await wrapper.setProps(mockPropsModelOptions)
        await nextTick()
        expect(wrapper.findAll("li").length).toBe(4);
        expect(wrapper.find("li > div").attributes("style")).toBe("height: 24px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;");
    });

    it("single warnings get truncated to multiple lines if lengthy", async () => {
        const wrapper = createWrapper()
        setDivHeights(wrapper, 24, 96)
        await wrapper.setProps(mockPropsModelRun)
        await nextTick()
        expect(wrapper.findAll("li").length).toBe(1);
        expect(wrapper.find("li > div").attributes("style")).toBe("height: 48px; overflow: hidden; display: -webkit-box;");
    });

})
