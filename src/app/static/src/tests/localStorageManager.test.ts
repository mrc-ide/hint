import {
    mockADRState,
    mockADRUploadState,
    mockBaselineState,
    mockCalibrateDataResponse,
    mockCalibratePlotResponse,
    mockComparisonPlotResponse,
    mockDataset,
    mockDownloadIndicatorState,
    mockDownloadResultsState,
    mockError,
    mockErrorsState,
    mockGenericChartState,
    mockHintrVersionState,
    mockLoadState,
    mockMetadataState,
    mockModelCalibrateState,
    mockModelOptionsState,
    mockModelOutputState,
    mockModelRunState,
    mockPlotDataState,
    mockPlotSelections,
    mockPlotState,
    mockPlottingSelections,
    mockProjectsState,
    mockRelease,
    mockStepperState,
    mockSurveyAndProgramState
} from "./mocks";
import {localStorageManager, serialiseState} from "../app/localStorageManager";
import {RootState} from "../app/root";
import {DataType} from "../app/store/surveyAndProgram/surveyAndProgram";
import {currentHintVersion} from "../app/hintVersion";
import {Language} from "../app/store/translations/locales";
import registerTranslations from "../app/store/translations/registerTranslations";
import Vuex from 'vuex';
import i18next from "i18next";

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
                result: {data: mockCalibrateDataResponse()},
                fetchedIndicators: [],
                calibratePlotResult: mockCalibratePlotResponse(),
                comparisonPlotResult: mockComparisonPlotResponse()
            }),
            stepper: mockStepperState(),
            load: mockLoadState(),
            downloadResults: mockDownloadResultsState(),
            downloadIndicator: mockDownloadIndicatorState(),
            invalidSteps: [],
            language: Language.en,
            metadata: mockMetadataState({plottingMetadataError: mockError("metadataError")}),
            plottingSelections: mockPlottingSelections(),
            plotData: mockPlotDataState(),
            plotSelections: mockPlotSelections(),
            plotState: mockPlotState(),
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

    it("returns nothing and saves current user if local storage does not match current user", () => {
        localStorage.setItem("user", currentUser);
        localStorageManager.savePartialState({errors: {
            errors: [{error: "test", detail: "test"}],
            errorReportError: null,
            errorReportSuccess: false,
            sendingErrorReport: false
        }});
        let result = localStorageManager.getState();
        expect(result).not.toBe(null);
        expect(localStorage.getItem("user")).toBe(currentUser);

        localStorage.setItem("user", "bad-user");
        result = localStorageManager.getState();
        expect(result).toBe(null);
        expect(localStorage.getItem("user")).toBe(currentUser);
    });

    it("saves to local storage", () => {
        const spy = vi.spyOn(Storage.prototype, "setItem");
        const testState = {baseline: mockBaselineState()};
        localStorageManager.savePartialState(testState);

        expect(spy.mock.calls[0][0]).toBe(`hintAppState_v${currentHintVersion}`);
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
        localStorageManager.savePartialState(testState);
        const spy = vi.spyOn(Storage.prototype, "getItem");

        const result = localStorageManager.getState();
        expect(result).toStrictEqual(testState);
        expect(spy.mock.calls[1][0]).toBe(`hintAppState_v${currentHintVersion}`);
    });

});
