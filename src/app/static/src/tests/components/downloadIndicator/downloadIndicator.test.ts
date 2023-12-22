import DownloadIndicator from "../../../app/components/downloadIndicator/DownloadIndicator.vue"
import Vuex from "vuex";
import {emptyState} from "../../../app/root";
import {mockBaselineState, mockDownloadIndicatorData} from "../../mocks";
import DownloadButton from "../../../app/components/downloadIndicator/DownloadButton.vue";
import registerTranslations from "../../../app/store/translations/registerTranslations";
import {expectTranslated, mountWithTranslate} from "../../testHelpers";
import {BaselineState} from "../../../app/store/baseline/baseline";

describe("download indicator", () => {

    afterEach(() => {
        vi.clearAllMocks()
    })

    const mockDownloadFileActions = vi.fn()

    const stateData = {iso3: "MWI", country: "Malawi"}

    const {filteredData, unfilteredData} = mockDownloadIndicatorData()

    const createSut = (props: Partial<BaselineState> = stateData, downloadIndicatorState = {downloadingIndicator: false}) => {
        const store = new Vuex.Store({
            state: emptyState(),
            modules: {
                baseline: {
                    namespaced: true,
                    state: mockBaselineState(props)
                },
                downloadIndicator: {
                    namespaced: true,
                    state: downloadIndicatorState,
                    actions: {
                        downloadFile: mockDownloadFileActions
                    }
                }
            }
        })
        registerTranslations(store);
        return store
    }

    const getWrapper = (store = createSut(), props = {}) => {
        return mountWithTranslate(DownloadIndicator, store, {
            global: {
                plugins: [store]
            },
            props: {
                unfilteredData,
                filteredData,
                ...props
            }
        })
    }

    it('it renders download button props as expected ', async() => {
        const wrapper = getWrapper();
        expect(wrapper.findComponent(DownloadButton).props()).toEqual(
            {
                "disabled": false,
                "name": "downloadIndicator"
            }
        )
        const span = wrapper.find("span")
        expectTranslated(span,
            "Download indicator",
            "Indicateur de téléchargement",
            "indicador de download",
            wrapper.vm.$store)
    });

    it('can trigger download with iso3 country prefix in filename', async() => {
        const wrapper = getWrapper();
        const button = wrapper.find("#indicator-download").find("button");
        expect(button.element.disabled).toBe(false);
        await button.trigger("click")
        await expect(mockDownloadFileActions).toHaveBeenCalledTimes(1)

        const filename = mockDownloadFileActions.mock.calls[0][1].filename
        expect(filename.split(".")[0]).toContain("MWI_naomi_data-review_")
        expect(filename.split(".")[1]).toBe("xlsx")

        expect(mockDownloadFileActions.mock.calls[0][1].data).toStrictEqual(mockDownloadIndicatorData())
    });

    it('can use country prefix when iso3 data is empty', async() => {
        const wrapper = getWrapper(createSut({iso3: "", country: "Malawi"}));
        const button = wrapper.find("#indicator-download").find("button");
        expect(button.element.disabled).toBe(false);
        await button.trigger("click")
        expect(mockDownloadFileActions).toHaveBeenCalledTimes(1)

        const filename = mockDownloadFileActions.mock.calls[0][1].filename
        expect(filename.split(".")[0]).toContain("Malawi_naomi_data-review_")
    });

    it('download button is disabled when file download is in progress', async () => {
        const wrapper = getWrapper(createSut({iso3: "", country: "Malawi"}, {downloadingIndicator: true}));
        expect(wrapper.findComponent(DownloadButton).props("disabled")).toBe(true)
    });

    it('does not download file when indicator data is empty', async() => {
        const wrapper = getWrapper(createSut(), {filteredData: null});

        await wrapper.findComponent(DownloadButton).vm.$emit("trigger-download")

        await expect(mockDownloadFileActions).toHaveBeenCalledTimes(0)
    });
})
