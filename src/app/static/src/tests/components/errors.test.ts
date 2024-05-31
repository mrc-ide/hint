import {shallowMount} from "@vue/test-utils";
import Vuex from "vuex";
import {mutations} from "../../app/store/errors/mutations";
import Errors from "../../app/components/Errors.vue";
import {mockErrorsState} from "../mocks";
import {Error} from "../../app/generated";

describe("Errors component", () => {

    const createStore = (errors: Error[]) => {
        return new Vuex.Store({
            modules: {
                errors: {
                    namespaced: true,
                    state: mockErrorsState({errors}),
                    mutations
                }
            }
        })
    };

    const props = {title: "TestApp"};

    it("renders as expected", () => {
        const store = createStore([
            {error: "First error", detail: null},
            {error: "Second error", detail: "Error detail"}
        ]);
        const wrapper = shallowMount(Errors, {props, global: {plugins: [store]}});

        const paras = wrapper.findAll("p");
        expect(paras.length).toBe(2);
        expect(paras[0].text()).toBe("First error");
        expect(paras[1].text()).toBe("Error detail");
    });

    it("renders nothing when no errors", () => {
        const store = createStore([]);
        const wrapper = shallowMount(Errors, {props, global: {plugins: [store]}});
        expect(wrapper.html()).toBe("<!--v-if-->");
    });

    it("only renders duplicate errors once", () => {
        const store = createStore([
            {error: "Error 1", detail: ""},
            {error: "Error 1", detail: ""},
            {error: "Error 1", detail: "different"},
            {error: "Error 2", detail: ""}]);
        const wrapper = shallowMount(Errors, {props, global: {plugins: [store]}});
        const paras = wrapper.findAll("p");
        expect(paras.length).toBe(3);
        expect(paras[0].text()).toBe("Error 1");
        expect(paras[1].text()).toBe("different");
        expect(paras[2].text()).toBe("Error 2");
    });

    it("commits dismissAll mutation when close button pressed", async () => {
        const store = createStore([{error: "First error", detail: null}]);
        const wrapper = shallowMount(Errors, {props, global: {plugins: [store]}});
        const closeButton = wrapper.find("button");
        await closeButton.trigger("click");

        expect(wrapper.html()).toBe("<!--v-if-->");
    });

});
