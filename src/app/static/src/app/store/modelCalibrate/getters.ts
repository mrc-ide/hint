import {ModelCalibrateState} from "./modelCalibrate";

export const getters = {
    // For some filters we have an id in the filters which is different from that
    // in the data. e.g. for Area, filter id is "area" but in data this is "area_id"
    // This helper maps from the filter ID to the data ID.
    filterIdToColumnId: (state: ModelCalibrateState) => (filterId: string) => {
        return state.metadata!.filterTypes.find(f => f.id === filterId)!.column_id;
    }
};
