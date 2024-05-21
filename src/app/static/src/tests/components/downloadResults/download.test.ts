import VueFeather from 'vue-feather';
import {shallowMount} from "@vue/test-utils";
import Download from "../../../app/components/downloadResults/Download.vue"
import {mockDownloadResultsDependency} from "../../mocks";
import DownloadStatus from "../../../app/components/downloadResults/DownloadStatus.vue";

describe(`download`, () => {

    const downloadSummary = mockDownloadResultsDependency({
        preparing: true
    })

    const downloadTranslate = {
        header: "downloadSummaryReport",
        button: "download"
    }

    const mockDirective = vi.fn()

    const defaultProps = {
        file: downloadSummary,
        modalOpen: false,
        translateKey: downloadTranslate,
        disabled: false
    }

    const getWrapper = (props = defaultProps) => {
        return shallowMount(Download,
            {
                props: props,
                global: {
                    directives: {"translate": mockDirective}
                }
            })
    }

    it(`renders components as expected`, () => {
        const wrapper = getWrapper()
        expect(mockDirective.mock.calls[0][1].value).toBe("downloadSummaryReport")
        expect(mockDirective.mock.calls[1][1].value).toBe("download")
        const vueFeather = wrapper.findComponent(VueFeather)
        expect(vueFeather.exists()).toBe(true)
        expect(vueFeather.props("type")).toBe("download")
        expect(wrapper.findComponent(DownloadStatus).props()).toEqual({
            "preparing": true,
            "translateKey": "preparing"
        })
        expect(wrapper.props()).toEqual({
            file: downloadSummary,
            translateKey: downloadTranslate,
            disabled: false
        })
    })

    it(`does not disable button when upload is not in progress`, () => {
        const wrapper = getWrapper()
        const vueFeather = wrapper.findComponent(VueFeather)
        expect(vueFeather.exists()).toBe(true)
        expect(vueFeather.props("type")).toBe("download")
        expect(wrapper.find("button").classes()).toEqual(["btn", "btn-lg", "my-3", "btn-red"])
        expect((wrapper.find("button").element as HTMLButtonElement).disabled).toBe(false)
    })

    it(`disables button when upload is in progress`, () => {
        const wrapper = getWrapper({
            ...defaultProps,
            disabled: true
        })

        const vueFeather = wrapper.findComponent(VueFeather)
        expect(vueFeather.exists()).toBe(true)
        expect(vueFeather.props("type")).toBe("download")
        expect(wrapper.find("button").classes()).toEqual(["btn", "btn-lg", "my-3", "btn-secondary"])
        expect((wrapper.find("button").element as HTMLButtonElement).disabled).toBe(true)
    })

    it(`can emit download`, async () => {
        const wrapper = getWrapper()
        const downloadSummary = mockDownloadResultsDependency();

        const button = wrapper.find("button")
        await wrapper.setProps({file: downloadSummary})
        await button.trigger("click")
        expect(wrapper.emitted().click.length).toBe(1)
    })

    it("shows download status iff preparing file", async () => {
        const wrapper = shallowMount(DownloadStatus, {
            props: {
                preparing: true,
                translateKey: "preparing"
            },
            directives: {"translate": mockDirective}
        });
        expect(wrapper.find("#preparing").exists()).toBe(true);

        await wrapper.setProps({
           preparing: false
        })
        expect(wrapper.find("#preparing").exists()).toBe(false);
    })
})
