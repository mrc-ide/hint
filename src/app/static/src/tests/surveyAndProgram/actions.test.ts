import {actions} from "../../app/store/surveyAndProgram/actions";
import {
    mockAncResponse,
    mockAxios,
    mockError,
    mockFailure,
    mockProgramResponse,
    mockRootState,
    mockSuccess,
    mockSurveyAndProgramState,
    mockSurveyResponse,
    mockVmmcResponse
} from "../mocks";
import {SurveyAndProgramMutation} from "../../app/store/surveyAndProgram/mutations";
import {expectEqualsFrozen} from "../testHelpers";
import {DataType} from "../../app/store/surveyAndProgram/surveyAndProgram";
import {expectValidAdrImportPayload} from "../baseline/actions.test";
import {Mock} from "vitest";

const rootState = mockRootState();
const mockFormData = {
    get: (key: string) => {
        return key == "file" ? {name: "file.txt"} : null;
    }
};

const root = (resource: object) => {
    return mockRootState({baseline: ({selectedDataset: {id: "1", resources: resource}} as any)})
}

describe("Survey and programme actions", () => {

    beforeEach(() => {
        // stop apiService logging to console
        console.log = vi.fn();
        mockAxios.reset();
    });

    afterEach(() => {
        (console.log as Mock).mockClear();
    });

    it("sets data after surveys file upload", async () => {

        mockAxios.onPost(`/disease/survey/?strict=true`)
            .reply(200, mockSuccess({data: "SOME DATA", warnings: "TEST WARNINGS"}));

        const commit = vi.fn();
        await actions.uploadSurvey({commit, rootState} as any, mockFormData as any);

        checkSurveyImportUpload(commit);
    });

    it("sets data after surveys file import", async () => {
        const url = "/adr/survey/?strict=true"
        mockAxios.onPost(url)
            .reply(200, mockSuccess({data: "SOME DATA", warnings: "TEST WARNINGS"}));

        const commit = vi.fn();
        await actions.importSurvey({commit, rootState: root({survey: {id: "123"}})} as any, "some-url");

        expectValidAdrImportPayload(url)

        checkSurveyImportUpload(commit);
    });

    const checkSurveyImportUpload = (commit: Mock) => {
        expect(commit.mock.calls[0][0]).toStrictEqual({
            type: SurveyAndProgramMutation.SurveyUpdated,
            payload: null
        });

        expect(commit.mock.calls[1][0]).toStrictEqual({
            type: SurveyAndProgramMutation.WarningsFetched,
            payload: {type: DataType.Survey, warnings: []}
        });

        expectEqualsFrozen(commit.mock.calls[2][0], {
            type: SurveyAndProgramMutation.SurveyUpdated,
            payload: {data: "SOME DATA", warnings: "TEST WARNINGS"}
        });

        expect(commit.mock.calls[3][0]).toStrictEqual(
            {type: "WarningsFetched",
                payload: {type: 2, warnings: "TEST WARNINGS"}
            });

        //Should also have set selectedDataType
        expect(commit.mock.calls[4][0]).toStrictEqual({type: "SelectedDataTypeUpdated", payload: DataType.Survey});
    }

    it("sets error message after failed surveys upload", async () => {

        mockAxios.onPost(`/disease/survey/?strict=true`)
            .reply(500, mockFailure("error message"));

        const commit = vi.fn();
        await actions.uploadSurvey({commit, rootState} as any, mockFormData as FormData);

        checkFailedSurveyImportUpload(commit);
    });

    it("sets error message after failed surveys import", async () => {

        mockAxios.onPost(`/adr/survey/?strict=true`)
            .reply(500, mockFailure("error message"));

        const commit = vi.fn();
        await actions.importSurvey({commit, rootState} as any, "some-url/file.txt");

        checkFailedSurveyImportUpload(commit);
    });

    const checkFailedSurveyImportUpload = (commit: Mock) => {
        expect(commit.mock.calls.length).toBe(4);
        expect(commit.mock.calls[0][0]).toStrictEqual({
            type: SurveyAndProgramMutation.SurveyUpdated,
            payload: null
        });

        expect(commit.mock.calls[1][0]).toStrictEqual({
            type: SurveyAndProgramMutation.WarningsFetched,
            payload: {type: DataType.Survey, warnings: []}
        });

        expect(commit.mock.calls[2][0]).toStrictEqual({
            type: SurveyAndProgramMutation.SurveyError,
            payload: mockError("error message")
        });

        expect(commit.mock.calls[3][0]).toStrictEqual({
            type: SurveyAndProgramMutation.SurveyErroredFile,
            payload: "file.txt"
        });
    }

    it("sets data after programme file upload", async () => {

        mockAxios.onPost(`/disease/programme/?strict=true`)
            .reply(200, mockSuccess({data: "TEST", warnings: "TEST WARNINGS"}));

        const commit = vi.fn();
        await actions.uploadProgram({commit, rootState} as any, mockFormData as any);

        checkProgrammeImportUpload(commit)
    });

    it("sets data after programme file import", async () => {
        const url = "/adr/programme/?strict=true"
        mockAxios.onPost(url)
            .reply(200, mockSuccess({data: "TEST", warnings: "TEST WARNINGS"}));

        const commit = vi.fn();
        await actions.importProgram({commit, rootState: root({program: {id: "123"}})} as any, "some-url");

        expectValidAdrImportPayload(url)

        checkProgrammeImportUpload(commit)
    });

    it("does not call import programme if url is missing", async () => {
        const commit = vi.fn();
        await actions.importProgram({commit, rootState} as any, "");

        expect(commit.mock.calls.length).toBe(0);
    });

    it("does not call import survey if url is missing", async () => {
        const commit = vi.fn();
        await actions.importSurvey({commit, rootState} as any, "");

        expect(commit.mock.calls.length).toBe(0);
    });

    it("does not call import ANC if url is missing", async () => {
        const commit = vi.fn();
        await actions.importANC({commit, rootState} as any, "");

        expect(commit.mock.calls.length).toBe(0);
    });

    it("does not call import VMMC if url is missing", async () => {
        const commit = vi.fn();
        await actions.importVmmc({commit, rootState} as any, "");

        expect(commit.mock.calls.length).toBe(0);
    });

    const checkProgrammeImportUpload = (commit: Mock) => {
        expect(commit.mock.calls[0][0]).toStrictEqual({
            type: SurveyAndProgramMutation.ProgramUpdated,
            payload: null
        });

        expect(commit.mock.calls[1][0]).toStrictEqual({
            type: SurveyAndProgramMutation.WarningsFetched,
            payload: {type: DataType.Program, warnings: []}
        });

        expect(commit.mock.calls[2][0]).toStrictEqual({
            type: "genericChart/ClearDataset",
            payload: "art"
        });

        expectEqualsFrozen(commit.mock.calls[3][0], {
            type: SurveyAndProgramMutation.ProgramUpdated,
            payload: {data: "TEST", warnings: "TEST WARNINGS"}
        });

        expect(commit.mock.calls[4][0]).toStrictEqual(
            {
                type: "WarningsFetched",
                payload: {type: 1, warnings: "TEST WARNINGS"}
            });

        //Should also have set selectedDataType
        expect(commit.mock.calls[5][0]).toStrictEqual(
            {
                type: "SelectedDataTypeUpdated",
                payload: DataType.Program
            });
    }

    it("sets error message after failed programme upload", async () => {

        mockAxios.onPost(`/disease/programme/?strict=true`)
            .reply(500, mockFailure("error message"));

        const commit = vi.fn();
        await actions.uploadProgram({commit, rootState} as any, mockFormData as FormData);

        checkFailedProgramImportUpload(commit);
    });

    it("sets error message after failed programme import", async () => {

        mockAxios.onPost(`/adr/programme/?strict=true`)
            .reply(500, mockFailure("error message"));

        const commit = vi.fn();
        await actions.importProgram({commit, rootState} as any, "some-url/file.txt");

        checkFailedProgramImportUpload(commit);
    });

    const checkFailedProgramImportUpload = (commit: Mock) => {
        expect(commit.mock.calls.length).toEqual(5);

        expect(commit.mock.calls[0][0]).toStrictEqual({
            type: SurveyAndProgramMutation.ProgramUpdated,
            payload: null
        });

        expect(commit.mock.calls[1][0]).toStrictEqual({
            type: SurveyAndProgramMutation.WarningsFetched,
            payload: {type: DataType.Program, warnings: []}
        });

        expect(commit.mock.calls[2][0]).toStrictEqual({
            type: "genericChart/ClearDataset",
            payload: "art"
        });

        expect(commit.mock.calls[3][0]).toStrictEqual({
            type: SurveyAndProgramMutation.ProgramError,
            payload: mockError("error message")
        });

        expect(commit.mock.calls[4][0]).toStrictEqual({
            type: SurveyAndProgramMutation.ProgramErroredFile,
            payload: "file.txt"
        });
    }

    it("sets data after anc file upload", async () => {

        mockAxios.onPost(`/disease/anc/?strict=true`)
            .reply(200, mockSuccess({data: "TEST", warnings: "TEST WARNINGS"}));

        const commit = vi.fn();
        await actions.uploadANC({commit, rootState} as any, mockFormData as any);

        checkANCImportUpload(commit);
    });

    it("sets data after anc file import", async () => {
        const url = "/adr/anc/?strict=true"
        mockAxios.onPost(url)
            .reply(200, mockSuccess({data: "TEST", warnings: "TEST WARNINGS"}));

        const commit = vi.fn();

        await actions.importANC({commit, rootState: root({anc: {id: "123"}})} as any, "some-url");

        expectValidAdrImportPayload(url)

        checkANCImportUpload(commit);
    });

    const checkANCImportUpload = (commit: Mock) => {
        expect(commit.mock.calls[0][0]).toStrictEqual({
            type: SurveyAndProgramMutation.ANCUpdated,
            payload: null
        });

        expect(commit.mock.calls[1][0]).toStrictEqual({
            type: SurveyAndProgramMutation.WarningsFetched,
            payload: {type: DataType.ANC, warnings: []}
        });

        expect(commit.mock.calls[2][0]).toStrictEqual({
            type: "genericChart/ClearDataset",
            payload: "anc"
        });

        expectEqualsFrozen(commit.mock.calls[3][0], {
            type: SurveyAndProgramMutation.ANCUpdated,
            payload: {data: "TEST", warnings: "TEST WARNINGS"}
        });

        expect(commit.mock.calls[4][0]).toStrictEqual(
            {
                type: "WarningsFetched",
                payload: {type: 0, warnings: "TEST WARNINGS"}
            });

        //Should also have set selectedDataType
        expect(commit.mock.calls[5][0]).toStrictEqual(
            {
                type: "SelectedDataTypeUpdated",
                payload: DataType.ANC
            });
    }

    it("sets error message after failed anc upload", async () => {

        mockAxios.onPost(`/disease/anc/?strict=true`)
            .reply(500, mockFailure("error message"));

        const commit = vi.fn();
        await actions.uploadANC({commit, rootState} as any, mockFormData as any);

        checkFailedANCImportUpload(commit);
    });

    it("sets error message after failed anc import", async () => {

        mockAxios.onPost(`/adr/anc/?strict=true`)
            .reply(500, mockFailure("error message"));

        const commit = vi.fn();
        await actions.importANC({commit, rootState} as any, "some-url/file.txt");

        checkFailedANCImportUpload(commit);
    });

    const checkFailedANCImportUpload = (commit: Mock) => {
        expect(commit.mock.calls.length).toEqual(5);

        expect(commit.mock.calls[0][0]).toStrictEqual({
            type: SurveyAndProgramMutation.ANCUpdated,
            payload: null
        });

        expect(commit.mock.calls[1][0]).toStrictEqual({
            type: SurveyAndProgramMutation.WarningsFetched,
            payload: {type: DataType.ANC, warnings: []}
        });

        expect(commit.mock.calls[2][0]).toStrictEqual({
            type: "genericChart/ClearDataset",
            payload: "anc"
        });

        expect(commit.mock.calls[3][0]).toStrictEqual({
            type: SurveyAndProgramMutation.ANCError,
            payload: mockError("error message")
        });

        expect(commit.mock.calls[4][0]).toStrictEqual({
            type: SurveyAndProgramMutation.ANCErroredFile,
            payload: "file.txt"
        });
    }

    it("sets data after vmmc file upload", async () => {

        mockAxios.onPost(`/disease/vmmc/?strict=true`)
            .reply(200, mockSuccess({data: "TEST", warnings: "TEST WARNINGS"}));

        const commit = vi.fn();
        await actions.uploadVmmc({commit, rootState} as any, mockFormData as any);

        checkVmmcImportUpload(commit);
    });

    it("sets data after vmmc file import", async () => {
        const url = "/adr/vmmc/?strict=true"
        mockAxios.onPost(url)
            .reply(200, mockSuccess({data: "TEST", warnings: "TEST WARNINGS"}));

        const commit = vi.fn();

        await actions.importVmmc({commit, rootState: root({vmmc: {id: "123"}})} as any, "some-url");

        expectValidAdrImportPayload(url)

        checkVmmcImportUpload(commit);
    });

    const checkVmmcImportUpload = (commit: Mock) => {
        expect(commit.mock.calls.length).toBe(5);

        expect(commit.mock.calls[0][0]).toStrictEqual({
            type: SurveyAndProgramMutation.VmmcUpdated,
            payload: null
        });

        expect(commit.mock.calls[1][0]).toStrictEqual({
            type: SurveyAndProgramMutation.WarningsFetched,
            payload: {type: DataType.Vmmc, warnings: []}
        });

        expect(commit.mock.calls[2][0]).toStrictEqual({
            type: "genericChart/ClearDataset",
            payload: "vmmc"
        });

        expectEqualsFrozen(commit.mock.calls[3][0], {
            type: SurveyAndProgramMutation.VmmcUpdated,
            payload: {data: "TEST", warnings: "TEST WARNINGS"}
        });

        expect(commit.mock.calls[4][0]).toStrictEqual(
            {
                type: "WarningsFetched",
                payload: {type: 3, warnings: "TEST WARNINGS"}
            });
    }

    it("sets error message after failed vmmc upload", async () => {

        mockAxios.onPost(`/disease/vmmc/?strict=true`)
            .reply(500, mockFailure("error message"));

        const commit = vi.fn();
        await actions.uploadVmmc({commit, rootState} as any, mockFormData as any);

        checkFailedVmmcImportUpload(commit);
    });

    it("sets error message after failed vmmc import", async () => {

        mockAxios.onPost(`/adr/vmmc/?strict=true`)
            .reply(500, mockFailure("error message"));

        const commit = vi.fn();
        await actions.importVmmc({commit, rootState} as any, "some-url/file.txt");

        checkFailedVmmcImportUpload(commit);
    });

    const checkFailedVmmcImportUpload = (commit: Mock) => {
        expect(commit.mock.calls.length).toEqual(5);

        expect(commit.mock.calls[0][0]).toStrictEqual({
            type: SurveyAndProgramMutation.VmmcUpdated,
            payload: null
        });

        expect(commit.mock.calls[1][0]).toStrictEqual({
            type: SurveyAndProgramMutation.WarningsFetched,
            payload: {type: DataType.Vmmc, warnings: []}
        });

        expect(commit.mock.calls[2][0]).toStrictEqual({
            type: "genericChart/ClearDataset",
            payload: "vmmc"
        });

        expect(commit.mock.calls[3][0]).toStrictEqual({
            type: SurveyAndProgramMutation.VmmcError,
            payload: mockError("error message")
        });

        expect(commit.mock.calls[4][0]).toStrictEqual({
            type: SurveyAndProgramMutation.VmmcErroredFile,
            payload: "file.txt"
        });
    }

    it("gets data, commits it and marks state ready", async () => {

        mockAxios.onGet(`/disease/survey/?strict=true`)
            .reply(200, mockSuccess(mockSurveyResponse()));

        mockAxios.onGet(`/disease/programme/?strict=true`)
            .reply(200, mockSuccess(mockProgramResponse()));

        mockAxios.onGet(`/disease/anc/?strict=true`)
            .reply(200, mockSuccess(mockAncResponse()));

        mockAxios.onGet(`/disease/vmmc/?strict=true`)
            .reply(200, mockSuccess(mockVmmcResponse()));

        const commit = vi.fn();
        await actions.getSurveyAndProgramData({commit, rootState} as any);

        const calls = commit.mock.calls.map((callArgs) => callArgs[0]["type"]);
        expect(calls).toContain(SurveyAndProgramMutation.SurveyUpdated);
        expect(calls).toContain(SurveyAndProgramMutation.ProgramUpdated);
        expect(calls).toContain(SurveyAndProgramMutation.ANCUpdated);
        expect(calls).toContain(SurveyAndProgramMutation.VmmcUpdated);
        expect(calls).toContain(SurveyAndProgramMutation.Ready);

        const payloads = commit.mock.calls.map((callArgs) => callArgs[0]["payload"]);
        expect(payloads.filter(p => Object.isFrozen(p)).length).toBe(5);
        //ready payload is true, which is frozen by definition
    });

    it("it validates, commits and marks state ready", async () => {

        mockAxios.onGet(`/disease/survey/?strict=true`)
            .reply(200, mockSuccess(mockSurveyResponse()));

        mockAxios.onGet(`/disease/programme/?strict=true`)
            .reply(200, mockSuccess(mockProgramResponse()));

        mockAxios.onGet(`/disease/anc/?strict=true`)
            .reply(200, mockSuccess(mockAncResponse()));

        mockAxios.onGet(`/disease/vmmc/?strict=true`)
            .reply(200, mockSuccess(mockVmmcResponse()));

        const commit = vi.fn();
        await actions.validateSurveyAndProgramData({commit, rootState} as any);

        const calls = commit.mock.calls.map((callArgs) => callArgs[0]["type"]);
        expect(calls).toContain(SurveyAndProgramMutation.SurveyUpdated);
        expect(calls).toContain(SurveyAndProgramMutation.ProgramUpdated);
        expect(calls).toContain(SurveyAndProgramMutation.ANCUpdated);
        expect(calls).toContain(SurveyAndProgramMutation.VmmcUpdated);
        expect(calls).toContain(SurveyAndProgramMutation.Ready);
        expect(commit.mock.calls[4][0]).toStrictEqual(
            {
                type: "SelectedDataTypeUpdated",
                payload: DataType.Survey
            });

        const payloads = commit.mock.calls.map((callArgs) => callArgs[0]["payload"]);
        expect(payloads.filter(p => Object.isFrozen(p)).length).toBe(6);
        //ready payload is true, which is frozen by definition
    });

    it("it runs validation, fails one and commits correctly", async () => {

        mockAxios.onGet(`/disease/survey/?strict=true`)
            .reply(500, mockFailure("Error message"));

        mockAxios.onGet(`/disease/programme/?strict=true`)
            .reply(200, mockSuccess(mockProgramResponse()));

        mockAxios.onGet(`/disease/anc/?strict=true`)
            .reply(200, mockSuccess(mockAncResponse()));

        mockAxios.onGet(`/disease/vmmc/?strict=true`)
            .reply(200, mockSuccess(mockVmmcResponse()));

        const commit = vi.fn();
        await actions.validateSurveyAndProgramData({commit, rootState} as any);

        const calls = commit.mock.calls.map((callArgs) => callArgs[0]["type"]);
        expect(calls).toContain(SurveyAndProgramMutation.SurveyError);
        expect(calls).toContain(SurveyAndProgramMutation.ProgramUpdated);
        expect(calls).toContain(SurveyAndProgramMutation.ANCUpdated);
        expect(calls).toContain(SurveyAndProgramMutation.VmmcUpdated);
        expect(calls).toContain(SurveyAndProgramMutation.Ready);
        expect(commit.mock.calls[4][0]).toStrictEqual({type: "SelectedDataTypeUpdated", payload: DataType.Program});

        const payloads = commit.mock.calls.map((callArgs) => callArgs[0]["payload"]);
        expect(payloads.filter(p => Object.isFrozen(p)).length).toBe(5);
        //ready payload is true, which is frozen by definition

    });

    it("it runs validation, fails all and commits correctly", async () => {

        mockAxios.onGet(`/disease/survey/?strict=true`)
            .reply(500, mockFailure("Failed"));

        mockAxios.onGet(`/disease/programme/?strict=true`)
            .reply(500, mockFailure("Failed"));

        mockAxios.onGet(`/disease/anc/?strict=true`)
            .reply(500, mockFailure("Failed"));

        mockAxios.onGet(`/disease/vmmc/?strict=true`)
            .reply(500, mockFailure("Failed"));

        const commit = vi.fn();
        await actions.validateSurveyAndProgramData({commit, rootState} as any);

        const calls = commit.mock.calls.map((callArgs) => callArgs[0]["type"]);
        expect(calls).toContain(SurveyAndProgramMutation.SurveyError);
        expect(calls).toContain(SurveyAndProgramMutation.ProgramError);
        expect(calls).toContain(SurveyAndProgramMutation.ANCError);
        expect(calls).toContain(SurveyAndProgramMutation.VmmcError);
        expect(calls).toContain(SurveyAndProgramMutation.Ready);
        expect(commit.mock.calls[4][0]).toStrictEqual({type: "SelectedDataTypeUpdated", payload: null});

        const payloads = commit.mock.calls.map((callArgs) => callArgs[0]["payload"]);
        expect(payloads.filter(p => Object.isFrozen(p)).length).toBe(2);
        //ready payload is true, which is frozen by definition
    });

    it("fails silently and marks state ready if getting data fails", async () => {

        mockAxios.onGet(`/disease/survey/?strict=true`)
            .reply(500);

        mockAxios.onGet(`/disease/anc/?strict=true`)
            .reply(500);

        mockAxios.onGet(`/disease/programme/?strict=true`)
            .reply(500);

        mockAxios.onGet(`/disease/vmmc/?strict=true`)
            .reply(500);

        const commit = vi.fn();
        await actions.getSurveyAndProgramData({commit, rootState} as any);

        expect(commit).toBeCalledTimes(1);
        expect(commit.mock.calls[0][0]["type"]).toBe(SurveyAndProgramMutation.Ready);
    });

    it("deletes survey and resets selected data type", async () => {
        mockAxios.onDelete("/disease/survey/")
            .reply(200, mockSuccess(true));

        const commit = vi.fn();
        await actions.deleteSurvey({
            commit, rootState,
            state: mockSurveyAndProgramState({selectedDataType: DataType.Survey, program: mockProgramResponse()})
        } as any);
        expect(commit).toBeCalledTimes(3);
        expect(commit.mock.calls[0][0]["type"]).toBe(SurveyAndProgramMutation.SurveyUpdated);
        expect(commit.mock.calls[1][0]).toEqual({
            type: SurveyAndProgramMutation.SelectedDataTypeUpdated,
            payload: DataType.Program
        });
        expect(commit.mock.calls[2][0]).toEqual({
            type: SurveyAndProgramMutation.WarningsFetched,
            payload: {type: DataType.Survey, warnings: []}
        });
        commit.mockReset();
        await actions.deleteSurvey({
            commit, rootState,
            state: mockSurveyAndProgramState({selectedDataType: DataType.Survey, anc: mockAncResponse()})
        } as any);
        expect(commit).toBeCalledTimes(3);
        expect(commit.mock.calls[1][0]).toEqual({
            type: SurveyAndProgramMutation.SelectedDataTypeUpdated,
            payload: DataType.ANC
        });
    });

    it("deletes program and resets selected data type", async () => {
        mockAxios.onDelete("/disease/programme/")
            .reply(200, mockSuccess(true));

        const commit = vi.fn();
        await actions.deleteProgram({
            commit,
            rootState,
            state: mockSurveyAndProgramState({selectedDataType: DataType.Program, survey: mockSurveyResponse()})
        } as any);
        expect(commit).toBeCalledTimes(4);
        expect(commit.mock.calls[0][0]["type"]).toBe(SurveyAndProgramMutation.ProgramUpdated);
        expect(commit.mock.calls[1][0]).toEqual({
            type: SurveyAndProgramMutation.SelectedDataTypeUpdated,
            payload: DataType.Survey
        });
        expect(commit.mock.calls[2][0]).toEqual({
            type: "genericChart/ClearDataset",
            payload: "art"
        })
        expect(commit.mock.calls[3][0]).toEqual({
            type: SurveyAndProgramMutation.WarningsFetched,
            payload: {type: DataType.Program, warnings: []}
        });

        commit.mockReset();
        await actions.deleteProgram({
            commit,
            rootState,
            state: mockSurveyAndProgramState({selectedDataType: DataType.Program, anc: mockAncResponse()})
        } as any);
        expect(commit).toBeCalledTimes(4);
        expect(commit.mock.calls[1][0]).toEqual({
            type: SurveyAndProgramMutation.SelectedDataTypeUpdated,
            payload: DataType.ANC
        });
    });

    it("deletes ANC and resets selected data type", async () => {
        mockAxios.onDelete("/disease/anc/")
            .reply(200, mockSuccess(true));

        const commit = vi.fn();
        await actions.deleteANC({
            commit,
            rootState,
            state: mockSurveyAndProgramState({selectedDataType: DataType.ANC, program: mockProgramResponse()})
        } as any);
        expect(commit).toBeCalledTimes(4);
        expect(commit.mock.calls[0][0]["type"]).toBe(SurveyAndProgramMutation.ANCUpdated);
        expect(commit.mock.calls[1][0]).toEqual({
            type: SurveyAndProgramMutation.SelectedDataTypeUpdated,
            payload: DataType.Program
        });
        expect(commit.mock.calls[2][0]).toEqual({
            type: "genericChart/ClearDataset",
            payload: "anc"
        });
        expect(commit.mock.calls[3][0]).toEqual({
            type: SurveyAndProgramMutation.WarningsFetched,
            payload: {type: DataType.ANC, warnings: []}
        });

        commit.mockReset();
        await actions.deleteANC({
            commit,
            rootState,
            state: mockSurveyAndProgramState({selectedDataType: DataType.ANC, survey: mockSurveyResponse()})
        } as any);
        expect(commit).toBeCalledTimes(4);
        expect(commit.mock.calls[1][0]).toEqual({
            type: SurveyAndProgramMutation.SelectedDataTypeUpdated,
            payload: DataType.Survey
        });
    });

    it("deletes VMMC and resets selected data type", async () => {
        mockAxios.onDelete("/disease/vmmc/")
            .reply(200, mockSuccess(true));

        const commit = vi.fn();
        await actions.deleteVmmc({
            commit,
            rootState,
            state: mockSurveyAndProgramState({selectedDataType: DataType.Vmmc, program: mockProgramResponse()})
        } as any);
        expect(commit).toBeCalledTimes(4);
        expect(commit.mock.calls[0][0]["type"]).toBe(SurveyAndProgramMutation.VmmcUpdated);
        expect(commit.mock.calls[1][0]).toEqual({
            type: SurveyAndProgramMutation.SelectedDataTypeUpdated,
            payload: DataType.Program
        });
        expect(commit.mock.calls[2][0]).toEqual({
            type: "genericChart/ClearDataset",
            payload: "vmmc"
        });
        expect(commit.mock.calls[3][0]).toEqual({
            type: SurveyAndProgramMutation.WarningsFetched,
            payload: {type: DataType.Vmmc, warnings: []}
        });

        commit.mockReset();
        await actions.deleteVmmc({
            commit,
            rootState,
            state: mockSurveyAndProgramState({selectedDataType: DataType.Vmmc, survey: mockSurveyResponse()})
        } as any);
        expect(commit).toBeCalledTimes(4);
        expect(commit.mock.calls[1][0]).toEqual({
            type: SurveyAndProgramMutation.SelectedDataTypeUpdated,
            payload: DataType.Survey
        });
    });

    it("deletes all", async () => {
        mockAxios.onDelete("/disease/anc/")
            .reply(200, mockSuccess(true));

        mockAxios.onDelete("/disease/survey/")
            .reply(200, mockSuccess(true));

        mockAxios.onDelete("/disease/programme/")
            .reply(200, mockSuccess(true));

        mockAxios.onDelete("/disease/vmmc/")
            .reply(200, mockSuccess(true));

        const commit = vi.fn();
        await actions.deleteAll({commit, rootState, state: mockSurveyAndProgramState()} as any);
        expect(mockAxios.history["delete"].length).toBe(4);
        expect(commit).toBeCalledTimes(11);
        expect(commit.mock.calls.map(c => c[0]["type"])).toEqual([
            SurveyAndProgramMutation.SurveyUpdated,
            SurveyAndProgramMutation.WarningsFetched,
            SurveyAndProgramMutation.ProgramUpdated,
            "genericChart/ClearDataset",
            SurveyAndProgramMutation.WarningsFetched,
            SurveyAndProgramMutation.ANCUpdated,
            "genericChart/ClearDataset",
            SurveyAndProgramMutation.WarningsFetched,
            SurveyAndProgramMutation.VmmcUpdated,
            "genericChart/ClearDataset",
            SurveyAndProgramMutation.WarningsFetched
        ]);
    });

    it("selects data type", () => {
        const commit = vi.fn();
        actions.selectDataType({commit} as any, DataType.ANC);
        expect(commit).toBeCalledTimes(1);
        expect(commit.mock.calls[0][0]["type"]).toBe(SurveyAndProgramMutation.SelectedDataTypeUpdated);
        expect(commit.mock.calls[0][0]["payload"]).toBe(DataType.ANC);
    });

});
