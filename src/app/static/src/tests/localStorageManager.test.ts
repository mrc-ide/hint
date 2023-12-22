import {
    mockADRState,
    mockADRUploadState,
    mockBaselineState,
    mockCalibrateResultResponse,
    mockDataset,
    mockError,
    mockErrorsState,
    mockGenericChartState,
    mockHintrVersionState,
    mockMetadataState,
    mockModelCalibrateState,
    mockModelOptionsState,
    mockModelOutputState,
    mockModelRunState,
    mockPlottingSelections,
    mockProjectsState,
    mockRelease,
    mockStepperState,
    mockSurveyAndProgramState,
    mockComparisonPlotResponse, mockRootState
} from "./mocks";
import {localStorageManager, serialiseState} from "../app/localStorageManager";
import {RootState} from "../app/root";
import {DataType} from "../app/store/surveyAndProgram/surveyAndProgram";
import {currentHintVersion} from "../app/hintVersion";
import {Language} from "../app/store/translations/locales";
import registerTranslations from "../app/store/translations/registerTranslations";
import Vuex from 'vuex';
import i18next from "i18next";
import {DataExplorationState} from "../app/store/dataExploration/dataExploration";

declare const currentUser: string; // set in jest config, or on the index page when run for real

describe("LocalStorageManager", () => {

    afterEach(() => {
        vi.clearAllMocks();
    })

    const modelCalibrateResponse = {
        calibrateId: "",
        calibratePlotResult: null,
        comparisonPlotError: null,
        calibrating: false,
        complete: false,
        error: null,
        fetching: false,
        generatingCalibrationPlot: false,
        metadata: null,
        comparisonPlotResult: null,
        options: {},
        optionsFormMeta: {
            "controlSections": [],
        },
        ready: false,
        result: null,
        fetchedIndicators: null,
        status: {},
        statusPollId: -1,
        version: {
            "hintr": "unknown",
            "naomi": "unknown",
            "rrq": "unknown",
        },
        warnings: [],
    }


    it("serialises RootState as expected", async () => {
        const dataset = mockDataset();
        const release = mockRelease();
        const mockRoot = {
            version: "1.0.0",
            dataExplorationMode: false,
            currentUser: "some user",
            updatingLanguage: false,
            adr: mockADRState(),
            genericChart: mockGenericChartState(),
            adrUpload: mockADRUploadState(),
            baseline: mockBaselineState({
                selectedDataset: dataset,
                selectedRelease: release
            }),
            modelRun: mockModelRunState({
                errors: [mockError("modelRunError1"), mockError("modelRunError2")]
            }),
            modelOptions: mockModelOptionsState(),
            modelOutput: mockModelOutputState(),
            modelCalibrate: mockModelCalibrateState({
                result: mockCalibrateResultResponse(),
                fetchedIndicators: [],
                calibratePlotResult: {data: "test calibrate plot result"},
                comparisonPlotResult: mockComparisonPlotResponse()
            }),
            stepper: mockStepperState(),
            metadata: mockMetadataState({plottingMetadataError: mockError("metadataError")}),
            plottingSelections: mockPlottingSelections(),
            surveyAndProgram: mockSurveyAndProgramState({
                selectedDataType: DataType.Survey,
                warnings: [{text: "test warning", locations: ["review_inputs"]}]
            }),
            projects: mockProjectsState(),
            hintrVersion: mockHintrVersionState(),
            errors: mockErrorsState()
        } as RootState;

        const result = serialiseState(mockRoot);
        expect(result).toStrictEqual({
            version: "1.0.0",
            baseline: {
                selectedDataset: dataset,
                selectedRelease: release,
                selectedDatasetIsRefreshed: false
            },
            modelRun: mockModelRunState(),
            modelOptions: mockModelOptionsState(),
            modelOutput: mockModelOutputState(),
            modelCalibrate: modelCalibrateResponse,
            stepper: mockStepperState(),
            metadata: mockMetadataState(),
            plottingSelections: mockPlottingSelections(),
            surveyAndProgram: {
                selectedDataType: DataType.Survey,
                warnings: [{text: "test warning", locations: ["review_inputs"]}]
            },
            hintrVersion: mockHintrVersionState()
        });
    });

    it("serialises DataExplorationState as expected", () => {
        const dataset = mockDataset();
        const release = mockRelease();
        const mockDataExploration = {
            version: "1.0.0",
            dataExplorationMode: true,
            currentUser: "some user",
            language: Language.en,
            updatingLanguage: false,
            adr: mockADRState(),
            genericChart: mockGenericChartState(),
            adrUpload: mockADRUploadState(),
            hintrVersion: mockHintrVersionState(),
            baseline: mockBaselineState({
                selectedDataset: dataset,
                selectedRelease: release,
                selectedDatasetHasChanged: false
            }) ,
            metadata: mockMetadataState(),
            surveyAndProgram: {
                selectedDataType: DataType.Survey,
                warnings: [{text: "test warning", locations: ["review_inputs"]}]
            },
            plottingSelections: mockPlottingSelections(),
            errors: mockErrorsState(),
            stepper: mockStepperState()
        } as DataExplorationState;
        const result = serialiseState(mockDataExploration);
        expect(result).toStrictEqual({
            version: "1.0.0",
            baseline: {
                selectedDataset: dataset,
                selectedRelease: release,
                selectedDatasetIsRefreshed: false
            },
            metadata: mockMetadataState(),
            plottingSelections: mockPlottingSelections(),
            surveyAndProgram: {
                selectedDataType: DataType.Survey,
                warnings: [{text: "test warning", locations: ["review_inputs"]}]
            },
            hintrVersion: mockHintrVersionState(),
            stepper: mockStepperState()
        });
    });

    it("returns nothing and saves current user if local storage does not match current user", () => {
        localStorage.setItem("user", currentUser);
        localStorageManager.savePartialState({errors: {
            errors: [{error: "test", detail: "test"}],
            errorReportError: null,
            errorReportSuccess: false,
            sendingErrorReport: false
        }}, false);
        let result = localStorageManager.getState(false);
        expect(result).not.toBe(null);
        expect(localStorage.getItem("user")).toBe(currentUser);

        localStorage.setItem("user", "bad-user");
        result = localStorageManager.getState(false);
        expect(result).toBe(null);
        expect(localStorage.getItem("user")).toBe(currentUser);
    });

    it("saves to local storage", () => {
        const spy = vi.spyOn(Storage.prototype, "setItem");
        const testState = {baseline: mockBaselineState()};
        localStorageManager.savePartialState(testState, false);

        expect(spy.mock.calls[0][0]).toBe(`hintAppState_v${currentHintVersion}`);
        expect(spy.mock.calls[0][1]).toBe(JSON.stringify(testState));
    });

    it("saves to local storage in Data Exploration mode", () => {
        const spy = vi.spyOn(Storage.prototype, "setItem");
        const testState = {baseline: mockBaselineState()};
        localStorageManager.savePartialState(testState, true);

        expect(spy.mock.calls[0][0]).toBe(`hintAppState_explore_v${currentHintVersion}`);
        expect(spy.mock.calls[0][1]).toBe(JSON.stringify(testState));
    });

    it("can set and get language from local storage", () => {
        const spy = vi.spyOn(Storage.prototype, "setItem");

        localStorageManager.saveLanguage(Language.pt);

        expect(localStorageManager.getLanguage()).toBe(Language.pt)

        expect(spy.mock.calls[0][1]).toBe(Language.pt)
    });

    it("can initiate default language from store", () => {
        const store = new Vuex.Store({
            state: {language: Language.fr, updatingLanguage: false}
        });

        registerTranslations(store);
        expect(i18next.language).toBe("fr");
    });

    it("can get from local storage", () => {
        const testState = {baseline: mockBaselineState(), language: Language.pt};
        localStorageManager.savePartialState(testState, false);
        const spy = vi.spyOn(Storage.prototype, "getItem");

        const result = localStorageManager.getState(false);
        expect(result).toStrictEqual(testState);
        expect(spy.mock.calls[1][0]).toBe(`hintAppState_v${currentHintVersion}`);
    });

    it("can get from local storage in Data Exploration mode", () => {
        const testState = {baseline: mockBaselineState(), language: Language.pt}
        localStorageManager.savePartialState(testState, true);
        const spy = vi.spyOn(Storage.prototype, "getItem");

        const result = localStorageManager.getState(true);
        expect(result).toStrictEqual(testState);
        expect(spy.mock.calls[1][0]).toBe(`hintAppState_explore_v${currentHintVersion}`);
    });

    it("can delete state", () => {
        const testState = {baseline: mockBaselineState()};
        localStorageManager.savePartialState(testState, false);
        const spy = vi.spyOn(Storage.prototype, "removeItem");

        localStorageManager.deleteState(false);
        expect(spy.mock.calls[0][0]).toBe(`hintAppState_v${currentHintVersion}`);
        const saved = localStorageManager.getState(false);
        expect(saved).toBeNull();
    });

    it("can delete state in data exploration mode", () => {
        const testState = {baseline: mockBaselineState()};
        localStorageManager.savePartialState(testState, true);
        const spy = vi.spyOn(Storage.prototype, "removeItem");

        localStorageManager.deleteState(true);
        expect(spy.mock.calls[0][0]).toBe(`hintAppState_explore_v${currentHintVersion}`);
        const saved = localStorageManager.getState(true);
        expect(saved).toBeNull();
    })
});
