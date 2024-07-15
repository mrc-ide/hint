import {DataType, SurveyAndProgramState} from "../../app/store/surveyAndProgram/surveyAndProgram";
import {getters as surveyAndProgramGetters} from "../../app/store/surveyAndProgram/getters";
import {mutations, SurveyAndProgramMutation} from "../../app/store/surveyAndProgram/mutations";
import {mockError, mockRootState, mockSurveyAndProgramState, mockSurveyResponse, mockWarning} from "../mocks";

import {Module} from "vuex";
import {RootState} from "../../app/root";
import {expectAllMutationsDefined} from "../testHelpers";

describe("Survey and programme mutations", () => {

    const testData = [{
        iso3: "MWI",
        area_id: "MWI.1",
        survey_id: "MWI1"
    }];

    const testPayload = {
        payload: mockSurveyResponse({
            data: testData as any,
            filename: "somefile.csv"
        })
    };

    it("all mutation types are defined", () => {
        expectAllMutationsDefined(SurveyAndProgramMutation, mutations);
    });

    it("sets surveys data and filename and clears error on SurveyUpdated", () => {
        const testState = mockSurveyAndProgramState({surveyError: mockError("test"), surveyErroredFile: "error.txt"});
        mutations[SurveyAndProgramMutation.SurveyUpdated](testState, testPayload);
        expect(testState.survey!!.data).toStrictEqual(testData);
        expect(testState.survey!!.filename).toBe("somefile.csv");
        expect(testState.surveyError).toBe(null);
        expect(testState.surveyErroredFile).toBe(null);
    });

    it("sets error on SurveyError", () => {
        const testState = mockSurveyAndProgramState();
        mutations[SurveyAndProgramMutation.SurveyError](testState, {payload: "Some error"});
        expect(testState.surveyError).toBe("Some error");
    });

    it("sets errored file on SurveyErroredFile", () => {
        const testState = mockSurveyAndProgramState();
        mutations[SurveyAndProgramMutation.SurveyErroredFile](testState, {payload: "error.txt"});
        expect(testState.surveyErroredFile).toBe("error.txt");
    });

    it("sets programme data and filename and clears error on ProgramUpdated", () => {
        const testState = mockSurveyAndProgramState({programError: mockError("test"), programErroredFile: "error.txt"});
        mutations[SurveyAndProgramMutation.ProgramUpdated](testState, testPayload);

        expect(testState.program!!.data).toStrictEqual(testData);
        expect(testState.program!!.filename).toBe("somefile.csv");
        expect(testState.programError).toBe(null);
        expect(testState.programErroredFile).toBe(null);
    });

    it("sets error on ProgramError", () => {
        const testState = mockSurveyAndProgramState();

        mutations[SurveyAndProgramMutation.ProgramError](testState, {payload: "Some error"});
        expect(testState.programError).toBe("Some error");
    });

    it("sets errored file on SurveyErroredFile", () => {
        const testState = mockSurveyAndProgramState();
        mutations[SurveyAndProgramMutation.ProgramErroredFile](testState, {payload: "error.txt"});
        expect(testState.programErroredFile).toBe("error.txt");
    });

    it("sets anc data and filename and clears error on ANCUpdated", () => {
        const testState = mockSurveyAndProgramState({ancError: mockError("test"), ancErroredFile: "error.txt"});
        mutations[SurveyAndProgramMutation.ANCUpdated](testState, testPayload);
        expect(testState.anc!!.data).toStrictEqual(testData);
        expect(testState.anc!!.filename).toBe("somefile.csv");
        expect(testState.ancError).toBe(null);
        expect(testState.ancErroredFile).toBe(null);
    });

    it("sets error on ANCError", () => {
        const testState = mockSurveyAndProgramState();
        mutations[SurveyAndProgramMutation.ANCError](testState, {payload: "Some error"});
        expect(testState.ancError).toBe("Some error");
    });

    it("sets errored file on ANCErroredFile", () => {
        const testState = mockSurveyAndProgramState();
        mutations[SurveyAndProgramMutation.ANCErroredFile](testState, {payload: "error.txt"});
        expect(testState.ancErroredFile).toBe("error.txt");
    });

    it("is complete once survey file is present", () => {
        const testStore: Module<SurveyAndProgramState, RootState> = {
            state: mockSurveyAndProgramState(),
            getters: surveyAndProgramGetters
        };
        const testState = testStore.state as SurveyAndProgramState;
        const testRootState = mockRootState({surveyAndProgram: testState});

        const complete = testStore.getters!!.complete;

        expect(complete(testState, null, testRootState, null)).toBe(false);

        mutations[SurveyAndProgramMutation.SurveyUpdated](testState, testPayload);
        expect(complete(testState, null, testRootState, null)).toBe(true);
    });

    it("sets ready state", () => {
        const testState = mockSurveyAndProgramState();
        mutations.Ready(testState);
        expect(testState.ready).toBe(true);
    });

    it("sets selected DataType", () => {
        const testState = mockSurveyAndProgramState({selectedDataType: DataType.Survey});
        mutations[SurveyAndProgramMutation.SelectedDataTypeUpdated](testState, {payload: DataType.Program});
        expect(testState.selectedDataType).toBe(DataType.Program);
    });

    it("sets and clears warnings", () => {
        const testState = mockSurveyAndProgramState();
        const warnings = [mockWarning()]
        mutations.WarningsFetched(testState, {payload: {"type": 2, "warnings": warnings}});
        expect(testState.warnings).toEqual([mockWarning()]);
        mutations.ClearWarnings(testState);
        expect(testState.warnings).toEqual([]);
        expect(testState.sapWarnings).toEqual([]);
    });

    it("does not display duplicate warnings", () => {

        const testDuplicateWarnings = {
            text: "be careful",
            locations: ["review_inputs"]
        };

        const testState = mockSurveyAndProgramState();
        const warnings = [mockWarning()]

        mutations.WarningsFetched(testState, {payload: {"type": 2, "warnings": warnings}});
        mutations.WarningsFetched(testState, {payload: {"type": 2, "warnings": testDuplicateWarnings}});

        expect(testState.warnings).not.toEqual([mockWarning()]);
        expect(testState.warnings).toEqual([testDuplicateWarnings]);
        mutations.ClearWarnings(testState);

        expect(testState.warnings).toEqual([]);
        expect(testState.sapWarnings).toEqual([]);
    });


});
