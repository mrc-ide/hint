import {shallowMount} from "@vue/test-utils";
import Vuex from "vuex";
import registerTranslations from "../../../../app/store/translations/registerTranslations";
import {emptyState} from "../../../../app/root";
import {expectTranslated, shallowMountWithTranslate} from "../../../testHelpers";
import DataSource from "../../../../app/components/genericChart/dataSelectors/DataSource.vue";

describe("DataSource component", () => {
    const datasets = [
        {id: "dataset1", label:"ANC", url: "/dataset1"},
        {id: "dataset2", label:"ART", url: "/dataset2"}
    ];
    const config = {id: "test-datasource", type: "editable", label: "dataSource", datasetId: "dataset2"};
    const value = "dataset2";

    const getWrapper = () => {
        const store = new Vuex.Store({state: emptyState()});
        registerTranslations(store);
        const props = {config, datasets, value};
        return shallowMountWithTranslate(DataSource, store, {global: {plugins: [store]}, props});
    };

    it("renders as expected", () => {
        const wrapper = getWrapper();
        expectTranslated(wrapper.find("label"), "Data source", "Source de données",
            "Fonte de dados", wrapper.vm.$store);
        expect(wrapper.find("label").attributes("for")).toBe("data-source-test-datasource");

        expect(wrapper.find("select").attributes("id")).toBe("data-source-test-datasource");
        expect((wrapper.find("select").element as HTMLSelectElement).value).toBe("dataset2");

        const options = wrapper.find("select").findAll("option");
        expect(options.length).toBe(2);
        expect(options[0].attributes("value")).toBe("dataset1");
        expectTranslated(options[0], "ANC testing", "Test de clinique prénatale",
            "Teste da CPN", wrapper.vm.$store);

        expect(options[1].attributes("value")).toBe("dataset2");
        expectTranslated(options[1], "ART", "TARV", "TARV", wrapper.vm.$store);
    });

    it("emits update when value changes", async () => {
        const wrapper = getWrapper();
        await wrapper.find("select").findAll("option")[0].setValue();
        expect(wrapper.emitted("update")!?.length).toBe(1);
        expect(wrapper.emitted("update")![0]).toStrictEqual(["dataset1"]);
    });
});
