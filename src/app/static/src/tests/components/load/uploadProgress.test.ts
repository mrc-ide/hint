import {mount} from "@vue/test-utils";
import UploadProgress from "../../../app/components/load/UploadProgress.vue"
import LoadingSpinner from "../../../app/components/LoadingSpinner.vue";

describe('upload Progress', function () {
    const mockTranslate = vi.fn()
    const mockFunction = vi.fn()

    beforeEach(() => {
        vi.resetAllMocks()
    })

    const getWrapper = (props = {}) => {
        return mount(UploadProgress, {
            directives: {
                translate: mockTranslate
            },
            props: {
                openModal: false,
                cancel: mockFunction,
                ...props
            }
        })
    }

    it('should render elements as expected', function () {
        const wrapper = getWrapper()
        const div = wrapper.find("#upload-progress")
        expect(div.exists()).toBe(true)
    });

    it('should render modal as expected', function () {
        const wrapper = getWrapper({openModal: true})
        const modal = wrapper.find(".modal")
        expect(modal.exists()).toBe(true)
        expect(modal.attributes()).toEqual({
            "class": "modal show",
            "style": "display: block;"
        })

        expect(modal.findComponent(LoadingSpinner).props("size")).toBe("xs")
        expect(mockTranslate.mock.calls[0][1].value).toBe("uploadFromZip")
        expect(mockTranslate.mock.calls[1][1].value).toBe("uploading")
        expect(mockTranslate.mock.calls[2][1].value).toBe("cancel")
    });

    it('should render progress bar attributes and message as expected', function () {
        const wrapper = getWrapper({openModal: true})
        const progressBar = wrapper.find(".progress .progress-bar")
        expect(progressBar.attributes()).toEqual({
            "aria-valuemax": "100",
            "aria-valuemin": "0",
            "aria-valuenow": "100",
            "class": "progress-bar progress-bar-striped progress-bar-animated bg-danger",
            "role": "progressbar",
            "style": "width: 100%;"
        })
        expect(mockTranslate.mock.calls[1][1].value).toEqual("uploading")
    });

    it('should trigger cancel handler', async () => {
        const wrapper = getWrapper({openModal: true})
        const okButton = wrapper.find(".modal button")
        expect(okButton.attributes("class")).toBe("btn btn-white")
        await okButton.trigger("click")
        expect(mockFunction.mock.calls.length).toBe(1)
    });
});