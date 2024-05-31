import { MutationTree } from 'vuex';
import { HintrVersionResponse } from '../../generated';
import { PayloadWithType } from "../../types";
import { HintrVersionState } from './hintrVersion';


export enum HintrVersionMutation {
    HintrVersionFetched = "HintrVersionFetched"
}

export const mutations: MutationTree<HintrVersionState> = {

    [HintrVersionMutation.HintrVersionFetched](state: HintrVersionState, action: PayloadWithType<HintrVersionResponse>) {
        state.hintrVersion = action.payload;
    }
};
