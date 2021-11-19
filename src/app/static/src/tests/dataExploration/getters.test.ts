import {getters} from "../../app/store/dataExploration/getters";
import {mockDataExplorationState} from "../mocks";

describe(`data exploration getters`, () => {

    it(`isGuest returns true if user is guest`, () => {
        const state = mockDataExplorationState({currentUser: "guest"})
        const getter = getters.isGuest(state, null, null as any, null)
        expect(getter).toBe(true)
    })

    it(`isGuest returns false if user is not guest`, () => {
        const state = mockDataExplorationState({currentUser: "user"})
        const getter = getters.isGuest(state, null, null as any, null)
        expect(getter).toBe(false)
    })
})