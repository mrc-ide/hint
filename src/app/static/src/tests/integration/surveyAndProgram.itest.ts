import {actions} from "../../app/store/surveyAndProgram/actions";
import {actions as baselineActions} from "../../app/store/baseline/actions"
import {login, rootState} from "./integrationTest";
import {getFormData} from "./helpers";
import {SurveyAndProgramMutation} from "../../app/store/surveyAndProgram/mutations";
import {DataType} from "../../app/store/surveyAndProgram/surveyAndProgram";

describe("Survey and programme actions", () => {

    beforeAll(async () => {
        await login();

        const commit = vi.fn();
        const dispatch = vi.fn();
        const formData = getFormData("malawi.geojson");
        await baselineActions.uploadShape({commit, dispatch, rootState} as any, formData);

        const state = {country: "Malawi"} as any;
        const pjnzFormData = getFormData("Malawi2019.PJNZ");
        await baselineActions.uploadPJNZ({commit, state, dispatch, rootState} as any, pjnzFormData);
    });

    it("can upload survey", async () => {

        const commit = vi.fn();
        const dispatch = vi.fn();

        const formData = getFormData("survey.csv");

        await actions.uploadSurvey({commit, dispatch, rootState} as any, formData);

        expect(commit.mock.calls[2][0]["type"]).toBe(SurveyAndProgramMutation.SurveyUpdated);
        expect(commit.mock.calls[2][0]["payload"]["filename"])
            .toBe("survey.csv")
        expect(commit.mock.calls[3][0]["type"]).toBe(SurveyAndProgramMutation.WarningsFetched);
    });

    it("can upload programme", async () => {

        const commit = vi.fn();
        const dispatch = vi.fn();

        const formData = getFormData("programme.csv");

        await actions.uploadProgram({commit, dispatch, rootState} as any, formData);

        expect(commit.mock.calls[2][0]["type"]).toBe("genericChart/ClearDataset");
        expect(commit.mock.calls[2][0]["payload"]).toBe("art");
        expect(commit.mock.calls[3][0]["type"]).toBe(SurveyAndProgramMutation.ProgramUpdated);
        expect(commit.mock.calls[3][0]["payload"]["filename"])
            .toBe("programme.csv")
        expect(commit.mock.calls[4][0]["type"]).toBe(SurveyAndProgramMutation.WarningsFetched);
    });

    it("can upload anc", async () => {

        const commit = vi.fn();
        const formData = getFormData("anc.csv");

        await actions.uploadANC({commit, rootState} as any, formData);
        expect(commit.mock.calls[2][0]["type"]).toBe("genericChart/ClearDataset");
        expect(commit.mock.calls[2][0]["payload"]).toBe("anc");
        expect(commit.mock.calls[3][0]["type"]).toBe(SurveyAndProgramMutation.ANCUpdated);
        expect(commit.mock.calls[3][0]["payload"]["filename"])
            .toBe("anc.csv");
        expect(commit.mock.calls[4][0]["type"]).toBe(SurveyAndProgramMutation.WarningsFetched);
    });

    it("can upload data with lax validation", async () => {

        const commit = vi.fn();
        const formData = getFormData("anc-pos-greater-than-total.csv");
        const root = {...rootState, dataExplorationMode: true}

        await actions.uploadANC({commit, rootState: root} as any, formData);
        expect(commit.mock.calls[2][0]["type"]).toBe("genericChart/ClearDataset");
        expect(commit.mock.calls[2][0]["payload"]).toBe("anc");
        expect(commit.mock.calls[3][0]["type"]).toBe(SurveyAndProgramMutation.ANCUpdated);
        expect(commit.mock.calls[3][0]["payload"]["filename"])
            .toBe("anc-pos-greater-than-total.csv");
        expect(commit.mock.calls[4][0]["type"]).toBe(SurveyAndProgramMutation.WarningsFetched);
    });

    it("can delete survey", async () => {
        const commit = vi.fn();

        const formData = getFormData("survey.csv");

        // upload
        await actions.uploadSurvey({commit, rootState} as any, formData);

        commit.mockReset();

        // delete
        await actions.deleteSurvey({commit, rootState, state: {selectedDataType: DataType.Survey}} as any);
        expect(commit.mock.calls[0][0]["type"]).toBe(SurveyAndProgramMutation.SurveyUpdated);

        commit.mockReset();

        // if the file has been deleted, data should come back null
        await actions.getSurveyAndProgramData({commit, rootState} as any);
        expect(commit.mock.calls.find(c => c[0]["type"] == SurveyAndProgramMutation.SurveyUpdated)[0]["payload"]).toBe(null);
    });

    it("can delete program", async () => {
        const commit = vi.fn();

        const formData = getFormData("programme.csv");

        // upload
        await actions.uploadProgram({commit, rootState} as any, formData);

        commit.mockReset();

        // delete
        await actions.deleteProgram({commit, rootState, state: {selectedDataType: DataType.Survey}} as any);
        expect(commit.mock.calls[0][0]["type"]).toBe(SurveyAndProgramMutation.ProgramUpdated);
        expect(commit.mock.calls[1][0]["type"]).toBe("genericChart/ClearDataset");

        commit.mockReset();

        // if the file has been deleted, data should come back null
        await actions.getSurveyAndProgramData({commit, rootState} as any);
        expect(commit.mock.calls.find(c => c[0]["type"] == SurveyAndProgramMutation.ProgramUpdated)[0]["payload"]).toBe(null);
    });

    it("can delete ANC", async () => {
        const commit = vi.fn();

        const formData = getFormData("anc.csv");

        // upload
        await actions.uploadANC({commit, rootState} as any, formData);

        commit.mockReset();

        // delete
        await actions.deleteANC({commit, rootState, state: {selectedDataType: DataType.Survey}} as any);
        expect(commit.mock.calls[0][0]["type"]).toBe(SurveyAndProgramMutation.ANCUpdated);
        expect(commit.mock.calls[1][0]["type"]).toBe("genericChart/ClearDataset");

        commit.mockReset();

        // if the file has been deleted, data should come back null
        await actions.getSurveyAndProgramData({commit, rootState} as any);
        expect(commit.mock.calls.find(c => c[0]["type"] == SurveyAndProgramMutation.ANCUpdated)[0]["payload"]).toBe(null);
    });

});
