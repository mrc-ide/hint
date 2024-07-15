import {filtersAfterUseShapeRegions} from "../../app/store/plotSelections/utils";

describe("Plot selections utils", () => {
    it("filtersAfterUseShapeRegions works as expected", () => {
        const filters = [
            {id: "area", options: null, use_shape_regions: true},
            {id: "other", options: []}
        ];
        const rootState = {
            baseline: {
                shape: {
                    filters: {
                        regions: { id: "testRegions" }
                    }
                }
            }
        };
        expect(filtersAfterUseShapeRegions(filters as any, rootState as any))
            .toStrictEqual([
                {id: "area", options: [{id: "testRegions"}]},
                {id: "other", options: []}
            ])
    });
});
