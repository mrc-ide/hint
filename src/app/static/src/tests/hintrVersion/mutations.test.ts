import {mockHintrVersionState} from '../mocks'
import {mutations} from "../../app/store/hintrVersion/mutations";
import {HintrVersionResponse} from '../../app/generated';

describe("HintrVersion Mutation", () => {

    it("sets hintr version info correctly", async ()=>{
        const testState = mockHintrVersionState();
    
        const mockHintrVersion: HintrVersionResponse = {
            hintr: "1.1",
            naomi: "2.2",
            rrq: "0.3",
            traduire: "0.2"
        };
        mutations.HintrVersionFetched(testState,{payload: mockHintrVersion})
        expect(testState.hintrVersion).toStrictEqual(mockHintrVersion);        
    })

})
