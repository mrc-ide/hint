import {actions} from "../../app/store/downloadIndicator/actions";


describe("download indicator actions", () => {

    it("can complete download file",  () => {
        const commit = vi.fn()
        const data = {data: {filteredData: [], unfilteredData: []}, filename: "test_download_indicator.xlsx"}

        actions.downloadFile({commit} as any, data);
        expect(commit).toHaveBeenCalledTimes(2)
        expect(commit.mock.calls[0][0]).toEqual(
            {
                "payload": true,
                "type": "DownloadingIndicator"
            }
        )
        expect(commit.mock.calls[1][0]).toEqual(
            {
                "payload": false,
                "type": "DownloadingIndicator"
            }
        )
    });
})