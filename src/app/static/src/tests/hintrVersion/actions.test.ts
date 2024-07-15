import {mockAxios, mockRootState, mockSuccess} from "../mocks";
import {actions} from '../../app/store/hintrVersion/actions';
import {Mock} from "vitest";

const rootState = mockRootState();

describe("hintrVersion Actions ", ()=> {

    beforeEach(() => {
        // stop apiService logging to console
        console.log = vi.fn();
        mockAxios.reset();
    });

    afterEach(() => {
        (console.log as Mock).mockClear();
    });

    it("commits hintrVersion after successful fetch", async () => {

        mockAxios.onGet(`/meta/hintr/version`)
            .reply(200, mockSuccess("TEST DATA"));

        const commit = vi.fn();
        await actions.getHintrVersion({commit, rootState} as any);
         
        expect(commit.mock.calls[0][0]).toStrictEqual({type: "HintrVersionFetched", payload: "TEST DATA"});
    });

})
