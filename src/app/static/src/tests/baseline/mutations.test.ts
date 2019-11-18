import {BaselineMutation, mutations} from "../../app/store/baseline/mutations";
import {
    mockPJNZResponse,
    mockPopulationResponse,
    mockRootState,
    mockShapeResponse,
    mockValidateBaselineResponse
} from "../mocks";
import {baselineGetters, BaselineState, initialBaselineState} from "../../app/store/baseline/baseline";
import {Module} from "vuex";
import {RootState} from "../../app/root";

describe("Baseline mutations", () => {

    it("sets country, filename and error on PJNZUpdated", () => {

        const testState = {...initialBaselineState};
        mutations[BaselineMutation.PJNZUpdated](testState, {
            payload: mockPJNZResponse({data: {country: "Malawi", iso3: "MWI"}, filename: "file.pjnz"})
        });
        expect(testState.country).toBe("Malawi");
        expect(testState.iso3).toBe("MWI");
        expect(testState.pjnz!!.filename).toBe("file.pjnz");
        expect(testState.pjnzError).toBe("");
    });

    it("state becomes complete once all files are Updated and validatedConsistent are true", () => {
        const testStore: Module<BaselineState, RootState> = {
            state: {...initialBaselineState},
            getters: baselineGetters
        };
        const testState = testStore.state as BaselineState;
        const testRootState = mockRootState({baseline: testState});
        const complete = testStore.getters!!.complete;

        mutations[BaselineMutation.PJNZUpdated](testState, {
            payload:
                mockPJNZResponse({data: {country: "Malawi", iso3: "MWI"}}), type: "PJNZUpdated"
        });

        expect(complete(testState, null, testRootState, null)).toBe(false);

        mutations[BaselineMutation.ShapeUpdated](testState, {
            payload:
                mockShapeResponse(), type: "ShapeUpdated"
        });

        expect(complete(testState, null, testRootState, null)).toBe(false);

        mutations[BaselineMutation.PopulationUpdated](testState, {
            payload:
                mockPopulationResponse(), type: "PopulationUpdated"
        });

        expect(complete(testState, null, testRootState, null)).toBe(false);

        mutations[BaselineMutation.Validated](testState, {
            payload:
                mockValidateBaselineResponse(), type: "Validated"
        });

        expect(complete(testState, null, testRootState, null)).toBe(true);
    });

    it("sets error on PJNZUploadError", () => {

        const testState = {...initialBaselineState};
        mutations[BaselineMutation.PJNZUploadError](testState, {payload: "Some error"});
        expect(testState.pjnzError).toBe("Some error");
    });

    it("sets country and filename and clears error if present on PJNZUpdated", () => {
        const testState = {...initialBaselineState, pjnzError: "test"};
        mutations[BaselineMutation.PJNZUpdated](testState, {
            payload: mockPJNZResponse({filename: "file.pjnz", data: {country: "Malawi", iso3: "MWI"}})
        });
        expect(testState.pjnz!!.filename).toBe("file.pjnz");
        expect(testState.country).toBe("Malawi");
        expect(testState.pjnzError).toBe("");
    });

    it("clears country and filename on PJNZUpdated if no data present", () => {

        const testState = {...initialBaselineState, pjnzError: "", country: "test", pjnz: "TEST" as any};
        mutations[BaselineMutation.PJNZUpdated](testState, {payload: null});
        expect(testState.pjnz).toBe(null);
        expect(testState.country).toBe("");
        expect(testState.iso3).toBe("");
        expect(testState.pjnzError).toBe("");
    });

    it("sets shape and clears error on ShapeUpdated", () => {

        const mockShape = mockShapeResponse();
        const testState = {...initialBaselineState, shapeError: ""};
        mutations[BaselineMutation.ShapeUpdated](testState, {
            payload: mockShape
        });
        expect(testState.shape).toBe(mockShape);
        expect(testState.shapeError).toBe("");
    });

    it("sets region filters and flattened region filters on ShapeUpdated", () => {

        const mockShape = mockShapeResponse({
            filters: {
                regions: {
                    id: "MWI", label: "Malawi", children: [
                        {
                            id: "MWI.1", label: "l1"
                        }
                    ]
                }
            }
        });
        const testState = {...initialBaselineState};
        mutations[BaselineMutation.ShapeUpdated](testState, {
            payload: mockShape
        });
        expect(testState.regionFilters).toStrictEqual([{
            id: "MWI.1", label: "l1"
        }]);
        expect(testState.flattenedRegionFilters).toStrictEqual({
            "MWI.1": {
                id: "MWI.1", label: "l1"
            }
        });
    });

    it("sets error on ShapeUploadError", () => {

        const testState = {...initialBaselineState};
        mutations[BaselineMutation.ShapeUploadError](testState, {payload: "Some error"});
        expect(testState.shapeError).toBe("Some error");
    });

    it("sets response and clears error on PopulationUpdated", () => {

        const mockPop = mockPopulationResponse();
        const testState = {...initialBaselineState, populationError: "test"};
        mutations[BaselineMutation.PopulationUpdated](testState, {
            payload: mockPop
        });
        expect(testState.population).toBe(mockPop);
        expect(testState.populationError).toBe("");
    });

    it("sets error on PopulationUploadError", () => {

        const testState = {...initialBaselineState};
        mutations[BaselineMutation.PopulationUploadError](testState, {payload: "Some error"});
        expect(testState.populationError).toBe("Some error");
    });

    it("sets ready state", () => {
        const testState = {...initialBaselineState};
        mutations[BaselineMutation.Ready](testState);
        expect(testState.ready).toBe(true);
    });
    it("Validated sets validation values", () => {
        const testState = {...initialBaselineState, baselineError: "test error"};
        mutations[BaselineMutation.Validated](testState, {payload: {consistent: true, complete: true}});
        expect(testState.baselineError).toBe("");
        expect(testState.validatedConsistent).toBe(true);
    });

    it("Validating resets validation values", () => {
        const testState = {...initialBaselineState,
            validatedConsistent: true,
            baselineError: "test error"
        };
        mutations[BaselineMutation.Validating](testState);
        expect(testState.baselineError).toBe("");
        expect(testState.validatedConsistent).toBe(false);
    });

    it("BaselineError sets baseline error and validation values", () => {
        const testState = {...initialBaselineState,
            validatedConsistent: true
        };
        mutations[BaselineMutation.BaselineError](testState, {payload: "test error"});
        expect(testState.baselineError).toBe("test error");
        expect(testState.validatedConsistent).toBe(false);
    });

});
