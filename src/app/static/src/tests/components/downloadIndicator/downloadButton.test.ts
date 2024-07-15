import {shallowMount} from "@vue/test-utils";
import DownloadButton from "../../../app/components/downloadIndicator/DownloadButton.vue"
import VueFeather from "vue-feather";

describe("download button", () => {

    const downloadProps = {
        name: "downloadIndicator",
        disabled: false
    }
    const mockTranslate = vi.fn()
    const getWrapper = (props = downloadProps) => {
        return shallowMount(DownloadButton, {
            global: {
                directives: {
                    translate: mockTranslate
                }
            },
            props: props
        })
    }

    it('it can render button as expected ', async () => {
        const wrapper = getWrapper()
        expect(wrapper.props()).toEqual({
            disabled: false,
            name: "downloadIndicator"
        })
        expect((wrapper.find(".btn").element as HTMLButtonElement).disabled).toBe(false)
        expect(mockTranslate.mock.calls.length).toBe(1)
        expect(mockTranslate.mock.calls[0][1].value).toBe("downloadIndicator")
    });

    it('it does not render button when disabled prop is true ', async () => {
        const wrapper = getWrapper({disabled: true, name: "downloadIndicator"})
        expect((wrapper.find(".btn").element as HTMLButtonElement).disabled).toBe(true)
    });

    it('it can emit click event ', async() => {
        const wrapper = getWrapper()
        await wrapper.find(".btn").trigger("click")
        expect(wrapper.emitted("click")!?.length).toBe(1)
    });

    it('it can render download icon', () => {
        const wrapper = getWrapper()
        expect(wrapper.findComponent(VueFeather).exists()).toBe(true)
        expect(wrapper.findComponent(VueFeather).props("type")).toBe("download")
        expect(wrapper.findComponent(VueFeather).attributes("size")).toBe("20")
        expect(wrapper.findComponent(VueFeather).classes()).toEqual(["icon", "ml-2", "align-middle"])
    });
})
