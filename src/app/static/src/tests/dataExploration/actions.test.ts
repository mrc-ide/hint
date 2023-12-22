import {actions} from "../../app/store/dataExploration/actions";
import {
    mockAxios,
    mockBaselineState,
    mockGenericChartState,
    mockDataExplorationState,
    mockSuccess,
    mockRootState,
    mockHintrVersionState,
    mockError, mockFailure
} from "../mocks";
import {Language} from "../../app/store/translations/locales";
import {expectChangeLanguageMutations} from "../testHelpers";
import {ErrorReport, ErrorReportManualDetails} from "../../app/types";
import {currentHintVersion} from "../../app/hintVersion";

describe("data exploration actions", () => {

    beforeEach(() => {
        mockAxios.reset();
    });

    it("changeLanguage fetches plotting metadata and calibrate result", async () => {
        const commit = vi.fn();
        const dispatch = vi.fn();
        const rootState = mockDataExplorationState({
            baseline: mockBaselineState({iso3: "MWI"})
        });
        await actions.changeLanguage({commit, dispatch, rootState} as any, Language.fr);

        expectChangeLanguageMutations(commit);

        expect(dispatch.mock.calls.length).toBe(1);
        expect(dispatch.mock.calls[0][0]).toStrictEqual("metadata/getPlottingMetadata");
        expect(dispatch.mock.calls[0][1]).toStrictEqual("MWI");
    });

    it("changeLanguage does not fetch plotting metadata if country code is empty", async () => {
        const commit = vi.fn();
        const dispatch = vi.fn();
        const rootState = mockDataExplorationState();
        await actions.changeLanguage({commit, dispatch, rootState} as any, Language.fr);

        expectChangeLanguageMutations(commit);

        expect(dispatch.mock.calls.length).toBe(0);
    });

    it("changeLanguage refreshes genericChart datasets, if any", async() => {
        const commit = vi.fn();
        const dispatch = vi.fn();
        const rootState = mockDataExplorationState(
            {
                baseline: mockBaselineState({iso3: "MWI"}),
                genericChart: mockGenericChartState({datasets: {dataset1: "TEST"}} as any)
            });
        await actions.changeLanguage({commit, dispatch, rootState} as any, Language.fr);

        expectChangeLanguageMutations(commit);

        expect(dispatch.mock.calls.length).toBe(2);
        expect(dispatch.mock.calls[0][0]).toStrictEqual("metadata/getPlottingMetadata");
        expect(dispatch.mock.calls[1][0]).toStrictEqual("genericChart/refreshDatasets");
    });

    it("changeLanguage fetches nothing if no relevant metadata to fetch", async () => {
        const commit = vi.fn();
        const dispatch = vi.fn();
        const rootState = mockDataExplorationState({baseline: {iso3: ""} as any})
        await actions.changeLanguage({commit, dispatch, rootState} as any, Language.fr);

        expectChangeLanguageMutations(commit);

        expect(dispatch.mock.calls.length).toBe(0)
    });

    it("changeLanguage does nothing if new language is the same as current language", async () => {
        const commit = vi.fn();
        const dispatch = vi.fn();
        const rootState = mockDataExplorationState(
            {
                language: Language.fr,
                baseline: mockBaselineState({iso3: "MWI"})
            });
        await actions.changeLanguage({commit, dispatch, rootState} as any, Language.fr);

        expect(commit.mock.calls.length).toBe(0);
        expect(dispatch.mock.calls.length).toBe(0);
    });

    it("posts error report to teams", async () => {
        const url = "error-report"

        mockAxios.onPost(url)
            .reply(200, mockSuccess("ok"));

        const rootState = mockDataExplorationState({
            baseline: mockBaselineState({
                country: "Malawi"
            }),
            hintrVersion: mockHintrVersionState({
                hintrVersion: {
                    naomi: "v1",
                    hintr: "v2",
                    rrq: "v3",
                    traduire: "v4"
                }
            })
        });

        const err = mockError("err")
        const getters = {
            errors: [err]
        }
        const commit = vi.fn();

        const payload: ErrorReportManualDetails = {
            email: "test@example.com",
            stepsToReproduce: "repro",
            section: "dataExploration",
            description: "desc"
        }

        await actions.generateErrorReport({commit, rootState, getters} as any, payload);

        expect(commit.mock.calls.length).toEqual(3);
        expect(commit.mock.calls[0][0]).toEqual({payload: true, type: "errors/SendingErrorReport"});
        expect(commit.mock.calls[1][0]).toEqual({payload: "ok", type: "errors/ErrorReportSuccess"});
        expect(commit.mock.calls[2][0]).toEqual({payload: false, type: "errors/SendingErrorReport"});
        expect(mockAxios.history.post.length).toEqual(1)
        expect(mockAxios.history.post[0].url).toEqual(url)

        const expected = {
            email: "test@example.com",
            country: "Malawi",
            projectName: "no associated project",
            timeStamp: new Date(),
            modelRunId: "no associated modelRunId",
            calibrateId: "no associated calibrateId",
            downloadIds: {
                spectrum: "none",
                summary: "none",
                coarse_output: "none"
            },
            description: "desc",
            section: "dataExploration",
            stepsToReproduce: "repro",
            errors: getters.errors

        };

        const data = JSON.parse(mockAxios.history.post[0].data) as ErrorReport

        expect(data.email).toStrictEqual(expected.email)
        expect(data.country).toStrictEqual(expected.country)
        expect(data.projectName).toStrictEqual(expected.projectName)
        expect(data.browserAgent).toContain("Mozilla")
        expect(data.modelRunId).toStrictEqual(expected.modelRunId)
        expect(data.calibrateId).toStrictEqual(expected.calibrateId)
        expect(data.downloadIds).toStrictEqual(expected.downloadIds)
        expect(new Date(data.timeStamp).getDate()).toBe(expected.timeStamp.getDate());
        expect(data.description).toStrictEqual(expected.description)
        expect(data.section).toStrictEqual(expected.section)
        expect(data.stepsToReproduce).toStrictEqual(expected.stepsToReproduce)
        expect(data.errors).toStrictEqual(expected.errors)
        expect(data.versions).toStrictEqual({
            naomi: "v1",
            hintr: "v2",
            rrq: "v3",
            traduire: "v4",
            hint: currentHintVersion
        });
    });

    it("sends default values when country, project or jobId are missing", async () => {
        const url = "error-report"

        mockAxios.onPost(url)
            .reply(200, mockSuccess("ok"));

        const rootState = mockDataExplorationState({
            baseline: mockBaselineState(),
            hintrVersion: mockHintrVersionState({
                hintrVersion: {
                    naomi: "v1",
                    hintr: "v2",
                    rrq: "v3",
                    traduire: "v4"
                }
            })
        });

        const err = mockError("err")
        const getters = {
            errors: [err]
        }
        const commit = vi.fn();

        const payload: ErrorReportManualDetails = {
            email: "test@example.com",
            stepsToReproduce: "repro",
            section: "dataExploration",
            description: "desc"
        }

        await actions.generateErrorReport({commit, rootState, getters} as any, payload);

        expect(commit.mock.calls.length).toEqual(3);

        expect(commit.mock.calls[0][0]).toEqual({payload: true, type: "errors/SendingErrorReport"});
        expect(commit.mock.calls[1][0]).toEqual({"payload": "ok", "type": "errors/ErrorReportSuccess"});
        expect(commit.mock.calls[2][0]).toEqual({payload: false, type: "errors/SendingErrorReport"});
        expect(mockAxios.history.post.length).toEqual(1)
        expect(mockAxios.history.post[0].url).toEqual(url)

        const expected = {
            email: "test@example.com",
            country: "no associated country",
            projectName: "no associated project",
            timeStamp: new Date(),
            modelRunId: "no associated modelRunId",
            calibrateId: "no associated calibrateId",
            downloadIds: {
                spectrum: "none",
                summary: "none",
                coarse_output: "none"
            },
            description: "desc",
            section: "dataExploration",
            stepsToReproduce: "repro",
            errors: getters.errors
        };

        const data = JSON.parse(mockAxios.history.post[0].data) as ErrorReport

        expect(data.email).toStrictEqual(expected.email)
        expect(data.country).toStrictEqual(expected.country)
        expect(data.projectName).toBe(expected.projectName)
        expect(data.modelRunId).toStrictEqual(expected.modelRunId)
        expect(data.calibrateId).toStrictEqual(expected.calibrateId)
        expect(data.downloadIds).toStrictEqual(expected.downloadIds)
        expect(data.browserAgent).toContain("Mozilla")
        expect(new Date(data.timeStamp).getDate()).toBe(expected.timeStamp.getDate());
        expect(data.description).toStrictEqual(expected.description)
        expect(data.section).toStrictEqual(expected.section)
        expect(data.stepsToReproduce).toStrictEqual(expected.stepsToReproduce)
        expect(data.errors).toStrictEqual(expected.errors)
    });

    it("can return error when error report fails", async () => {
        const url = "error-report"

        mockAxios.onPost(url)
            .reply(500, mockFailure("TestError"));

        const rootState = mockRootState();

        const commit = vi.fn();

        const getters = {
            errors: []
        }

        const payload: ErrorReportManualDetails = {
            email: "",
            stepsToReproduce: "",
            section: "",
            description: ""
        }

        await actions.generateErrorReport({commit, rootState, getters} as any, payload);

        const expectedError = {error: "OTHER_ERROR", detail: "TestError"};

        expect(commit.mock.calls.length).toEqual(3);
        expect(commit.mock.calls[0][0]).toEqual({payload: true, type: "errors/SendingErrorReport"});
        expect(commit.mock.calls[1][0]).toEqual({payload: expectedError, type: "errors/ErrorReportError"});
        expect(commit.mock.calls[2][0]).toEqual({payload: false, type: "errors/SendingErrorReport"});
    });
});
