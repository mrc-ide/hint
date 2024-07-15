import MockAdapter from "axios-mock-adapter";
import axios from "axios";
import {BaselineState, initialBaselineState} from "../app/store/baseline/baseline";
import {initialPasswordState, PasswordState} from "../app/store/password/password";
import {initialSurveyAndProgramState, SurveyAndProgramState} from "../app/store/surveyAndProgram/surveyAndProgram"

import {
    AncResponse,
    CalibrateDataResponse,
    CalibratePlotResponse,
    ComparisonPlotResponse,
    DownloadSubmitRequest,
    Error,
    ModelResultResponse,
    ModelStatusResponse,
    PjnzResponse,
    PlottingMetadataResponse,
    PopulationResponse,
    ProgrammeFilters,
    ProgrammeResponse,
    Response,
    ReviewInputFilterMetadataResponse,
    ShapeResponse,
    SurveyFilters,
    SurveyResponse,
    ValidateBaselineResponse,
    VmmcResponse,
    Warning
} from "../app/generated";
import {initialModelRunState, ModelRunState} from "../app/store/modelRun/modelRun";
import {emptyState, RootState} from "../app/root";
import {initialStepperState, StepperState} from "../app/store/stepper/stepper";
import {initialMetadataState, MetadataState} from "../app/store/metadata/metadata";
import {initialLoadState, LoadState} from "../app/store/load/state";
import {initialModelOptionsState, ModelOptionsState} from "../app/store/modelOptions/modelOptions";
import {initialModelOutputState, ModelOutputState} from "../app/store/modelOutput/modelOutput";
import {
    initialPlottingSelectionsState,
    PlottingSelectionsState
} from "../app/store/plottingSelections/plottingSelections";
import {ErrorsState, initialErrorsState} from "../app/store/errors/errors";
import {ColourScalesState, initialColourScalesState} from "../app/store/plottingSelections/plottingSelections";
import {Dataset, DatasetResource, DownloadIndicatorDataset, DownloadResultsDependency, Release} from "../app/types";
import {initialProjectsState, ProjectsState} from "../app/store/projects/projects";
import {initialModelCalibrateState, ModelCalibrateState} from "../app/store/modelCalibrate/modelCalibrate";
import { HintrVersionState, initialHintrVersionState } from "../app/store/hintrVersion/hintrVersion";
import {ADRState, initialADRState} from "../app/store/adr/adr";
import {ADRUploadState, initialADRUploadState} from "../app/store/adrUpload/adrUpload";
import {DownloadResultsState, initialDownloadResultsState} from "../app/store/downloadResults/downloadResults";
import {GenericChartState, initialGenericChartState} from "../app/store/genericChart/genericChart";
import {DynamicControlType, DynamicFormMeta} from "@reside-ic/vue-next-dynamic-form";
import {initialPlotSelectionsState, PlotSelectionsState} from "../app/store/plotSelections/plotSelections";
import {DownloadIndicatorState, initialDownloadIndicatorState} from "../app/store/downloadIndicator/downloadIndicator";
import { PlotDataState, initialPlotDataState } from "../app/store/plotData/plotData";
import { PlotState, initialPlotState } from "../app/store/plotState/plotState";

export const mockAxios = new MockAdapter(axios);

export const mockPasswordState = (props?: Partial<PasswordState>): PasswordState => {
    return {
        ...initialPasswordState,
        ...props
    }
};

export const mockADRState =  (props?: Partial<ADRState>): ADRState => {
    return {
        ...initialADRState(),
        ...props
    }
};

export const mockADRUploadState =  (props?: Partial<ADRUploadState>): ADRUploadState => {
    return {
        ...initialADRUploadState(),
        ...props
    }
};

export const mockDownloadResultsState =  (props?: Partial<DownloadResultsState>): DownloadResultsState => {
    return {
        ...initialDownloadResultsState(),
        ...props
    }
};

export const mockBaselineState = (props?: Partial<BaselineState>): BaselineState => {
    return {
        ...initialBaselineState(),
        ...props
    }
};

export const mockSurveyAndProgramState = (props?: Partial<SurveyAndProgramState>): SurveyAndProgramState => {
    return {
        ...initialSurveyAndProgramState(),
        ...props
    }
};

export const mockModelRunState = (props?: Partial<ModelRunState>) => {
    return {
        ...initialModelRunState(),
        ...props
    }
};

export const mockHintrVersionState = (props?: Partial<HintrVersionState>): HintrVersionState  => {
    return {
        ...initialHintrVersionState(),
        ...props
    }
};


export const mockModelOptionsState = (props?: Partial<ModelOptionsState>): ModelOptionsState => {
    return {
        ...initialModelOptionsState(),
        ...props
    }
};

export const mockModelCalibrateState = (props?: Partial<ModelCalibrateState>): ModelCalibrateState => {
    return {
        ...initialModelCalibrateState(),
        ...props
    }
};

export const mockStepperState = (props?: Partial<StepperState>): StepperState => {
    return {
        ...initialStepperState(),
        ...props
    }
};

export const mockErrorsState = (props?: Partial<ErrorsState>): ErrorsState => {
    return {
        ...initialErrorsState(),
        ...props
    }
};

export const mockMetadataState = (props?: Partial<MetadataState>): MetadataState => {
    return {
        ...initialMetadataState(),
        ...props
    }
};

export const mockLoadState = (props?: Partial<LoadState>): LoadState => {
    return {
        ...initialLoadState(),
        ...props
    }
};

export const mockModelOutputState = (props?: Partial<ModelOutputState>): ModelOutputState => {
    return {
        ...initialModelOutputState(),
        ...props
    }
}

export const mockPlottingSelections = (props?: Partial<PlottingSelectionsState>) => {
    return {
        ...initialPlottingSelectionsState(),
        ...props
    }
};

export const mockPlotData = (props?: Partial<PlotDataState>) => {
    return {
        ...initialPlotDataState(),
        ...props
    }
};

export const mockPlotSelections = (props?: Partial<PlotSelectionsState>) => {
    return {
        ...initialPlotSelectionsState(),
        ...props
    }
};

export const mockPlotState = (props?: Partial<PlotState>) => {
    return {
        ...initialPlotState(),
        ...props
    }
};

export const mockPlotSelectionsState = (props?: Partial<PlotSelectionsState>): PlotSelectionsState => {
    return {
        ...initialPlotSelectionsState(),
        ...props
    }
};

export const mockColourScales = (props?: Partial<ColourScalesState>) => {
    return {
        ...initialColourScalesState(),
        ...props
    }
};

export const mockProjectsState = (props?: Partial<ProjectsState>) => {
    return {
        ...initialProjectsState(),
        ...props
    }
};

export const mockGenericChartState =  (props?: Partial<GenericChartState>): GenericChartState => {
    return {
        ...initialGenericChartState(),
        ...props
    }
};

export const mockDownloadIndicatorState = (props?: Partial<DownloadIndicatorState>): DownloadIndicatorState => {
    return {
        ...initialDownloadIndicatorState(),
        ...props
    }
}

export const mockRootState = (props?: Partial<RootState>): RootState => {
    return {
        ...emptyState(),
        ...props
    }
};

export const mockFile = (filename: string, fileContents: string, type: string = "text/csv"): File => {
    return new File([fileContents], filename, {
        type: type,
        lastModified: 1
    });
};

export const mockSuccess = (data: any, version?: any): Response => {
    return {
        data,
        status: "success",
        errors: [],
        version
    }
};

const mockDownloadErrorResponse = () => {
    const errorResponse = [
        {
            error: "FAILED_TO_RETRIEVE_RESULT",
            detail: "Missing some results",
            key: "rofah-volil-kivup"
        }
    ]
    const str = JSON.stringify(errorResponse);
    return new Blob([str], {
        type: "application/json"
    });
}

export const mockDownloadFailure = (errorMessage = mockDownloadErrorResponse) => {
    return errorMessage
};

export const mockFailure = (errorMessage: string): Response => {
    return {
        data: {},
        status: "failure",
        errors: [mockError(errorMessage)]
    }
};

export const mockError = (errorMessage: string = "some message"): Error => {
    return {error: "OTHER_ERROR", detail: errorMessage};
};

export const mockPJNZResponse = (props: Partial<PjnzResponse> = {}): PjnzResponse => {
    return {
        data: {country: "Malawi", iso3: "MWI"},
        hash: "1234.csv",
        filename: "test.pjnz",
        type: "pjnz",
        ...props
    }
};

export const mockShapeResponse = (props: Partial<ShapeResponse> = {}): ShapeResponse => {
    return {
        data: {
            "type": "FeatureCollection",
            "features": []
        },
        type: "shape",
        hash: "1234.csv",
        filename: "test.csv",
        filters: {
            level_labels: [{id: 1, area_level_label: "Country", display: true}],
            regions: {label: "Malawi", id: "1", children: []}
        },
        ...props
    }
};

export const mockSurveyResponse = (props: Partial<SurveyResponse> = {}): SurveyResponse => {
    return {
        type: "survey",
        filename: "test.csv",
        hash: "1234.csv",
        data: [],
        filters: {
            "age": [],
            "surveys": [],
            indicators: []
        },
        warnings: [],
        ...props
    }
};

export const mockProgramResponse = (props: Partial<ProgrammeResponse> = {}): ProgrammeResponse => {
    return {
        type: "programme",
        filename: "test.csv",
        data: [],
        hash: "1234.csv",
        filters: {"age": [], "calendar_quarter": [], indicators: []},
        warnings: [],
        ...props
    }
};

export const mockAncResponse = (props: Partial<AncResponse> = {}): AncResponse => {
    return {
        type: "anc",
        filename: "test.csv",
        hash: "1234.csv",
        data: [],
        filters: {"year": [], indicators: []},
        warnings: [],
        ...props
    }
};

export const mockVmmcResponse = (props: Partial<VmmcResponse> = {}): VmmcResponse => {
    return {
        type: "vmmc",
        filename: "test.xlsx",
        hash: "1234.xlsx",
        data: null,
        filters: null,
        warnings: [],
        ...props
    }
};

export const mockProgramFilters = (props: Partial<ProgrammeFilters> = {}): ProgrammeFilters => {
    return {
        age: [],
        calendar_quarter: [],
        indicators: [],
        ...props
    }
};

export const mockSurveyFilters = (props: Partial<SurveyFilters> = {}): SurveyFilters => {
    return {
        age: [],
        surveys: [],
        indicators: [],
        ...props
    }
};

export const mockPopulationResponse = (props: Partial<PopulationResponse> = {}): PopulationResponse => {
    return {
        data: null,
        type: "population",
        hash: "1234.csv",
        filename: "test.csv",
        ...props
    }
};

export const mockValidateBaselineResponse = (props: Partial<ValidateBaselineResponse> = {}): ValidateBaselineResponse => {
    return {
        consistent: true,
        ...props
    }
};

export const mockModelStatusResponse = (props: Partial<ModelStatusResponse> = {}): ModelStatusResponse => {
    return {
        done: true,
        success: true,
        progress: [],
        queue: 1,
        id: "1234",
        status: "finished",
        ...props
    }
};

export const mockModelResultResponse = (props: Partial<ModelResultResponse> = {}): ModelResultResponse => {
    return {
        id: "123",
        complete: true,
        warnings: [],
        ...props
    };
};

export const mockCalibrateDataResponse = (): CalibrateDataResponse["data"] => {
    return [{
        area_id: "MWI",
        sex: "both",
        age_group: "1",
        calendar_quarter: "1",
        indicator_id: 1,
        indicator: 'mock',
        lower: 0.5,
        mean: 0.5,
        mode: 0.5,
        upper: 0.5
    }]
}

export const mockCalibratePlotResponse = (props: Partial<CalibratePlotResponse> = {}): CalibratePlotResponse => {
    return {
        data: [],
        metadata: {
            filterTypes: [],
            indicators: [],
            plotSettingsControl: {
                calibrate: {
                    plotSettings: [
                        {
                            id: "1",
                            label: "setting",
                            options: []
                        }
                    ]
                }
            }
        },
        ...props
    }
}

export const mockCalibrateMetadataResponse = (props: Partial<CalibrateMetadataResponse> = {}): CalibrateMetadataResponse => {
    return {
        filterTypes: [],
        indicators: [],
        plotSettingsControl: {
            choropleth: {
                plotSettings: []
            },
            barchart: {
                plotSettings: []
            },
            table: {
                plotSettings: []
            },
            bubble: {
                plotSettings: []
            },
        },
        warnings: [],
        ...props
    }
}

export const mockComparisonPlotResponse = (props: Partial<ComparisonPlotResponse> = {}): ComparisonPlotResponse => {
    return {
        data: [{
            area_id: "MWI",
            area_name: "Test area",
            source: "Test Source",
            sex: "both",
            age_group: "1",
            calendar_quarter: "1",
            indicator_id: 1,
            indicator: 'mock',
            lower: 0.5,
            mean: 0.5,
            mode: 0.5,
            upper: 0.5
        }],
        metadata: {
            filterTypes: [],
            indicators: [],
            plotSettingsControl: {
                comparison: {
                    plotSettings: []
                }
            },
            warnings: []
        },
        ...props
    }
};


export const mockPlottingMetadataResponse = (props: Partial<PlottingMetadataResponse> = {}): PlottingMetadataResponse => {
    return {
        anc: {
            choropleth: {indicators: []}
        },
        output: {
            choropleth: {indicators: []}
        },
        programme: {
            choropleth: {indicators: []}
        },
        survey: {
            choropleth: {indicators: []}
        },
        ...props
    }
};

export const mockDataset = (props: Partial<Dataset> = {}): Dataset => {
    return {
        id: "123",
        title: "Some data",
        url: "www.some.url",
        resources: {
            pjnz: null,
            program: null,
            pop: null,
            survey: null,
            shape: null,
            anc: null,
            vmmc: null
        },
        organization: {
          id: "456"
        },
        ...props
    }
};

export const mockRelease = (props: Partial<Release> = {}): Release => {
    return {
        id: "releaseId",
        name: "releaseName",
        notes: "releaseNotes",
        activity_id: "activityId",
        ...props
    }
};

export const mockDatasetResource = (props: Partial<DatasetResource> = {}): DatasetResource => {
    return {
        id: "123",
        url: "www.something.com",
        lastModified: "2020-11-05T00:00:00",
        metadataModified: "2020-11-04T00:00:00",
        outOfDate: false,
        name: "mock-resource-name",
        ...props
    }
};

export const mockWarning = (props: Partial<Warning> = {}): Warning => {
    return {
        text: "be careful",
        locations: ["model_calibrate"],
        ...props
    };
};

export const mockDownloadResultsDependency = (props: Partial<DownloadResultsDependency> = {}): DownloadResultsDependency => {
    return {
        downloadId: "",
        fetchingDownloadId: false,
        preparing: false,
        statusPollId: -1,
        complete: false,
        error: null,
        downloadError: null,
        metadataError: null,
        ...props
    }
}


export const mockProjectOutputState = (props: Partial<DownloadSubmitRequest> = {}): DownloadSubmitRequest => {
    return {
        state: {
            datasets: {
                anc: {"filename": "anc", "path": "uploads/ancHash"},
                pjnz: {"filename": "pjnz", "path": "uploads/pjnzHash"},
                population: {"filename": "population", "path": "uploads/populationHash"},
                programme: {"filename": "program", "path": "uploads/programHash"},
                shape: {"filename": "shape", "path": "uploads/shapeHash"},
                survey: {"filename": "survey", "path": "uploads/surveyHash"}
            },
            model_fit: {"id": "modelRunId", "options": {"test": "options"}},
            calibrate: {"id": "calibrateId", "options": {"test": "options"}},
            version: {"hintr": "1.0.0", "naomi": "2.0.0", "rrq": "1.1.1"},
        },
        notes: {
            project_notes: {
                name: "My project 123",
                updated: "2022/06/09 14:56:19",
                note: "These are my project notes"
            },
            version_notes: []
        },
        ...props
    }
}

export const mockOptionsFormMeta = (props: Partial<DynamicFormMeta> = {}) => {
    return {
        controlSections: [{
            label: "Test Section",
            description: "Just a test section",
            controlGroups: [{
                controls: [{
                    name: "TestValue",
                    type: "number" as DynamicControlType,
                    required: false,
                    min: 0,
                    max: 10,
                    value: 5
                }]
            }]
        }],
        ...props
    }
};

export const mockDownloadIndicatorData = (props: Partial<DownloadIndicatorDataset> = {}): DownloadIndicatorDataset => {
    return {
        unfilteredData: [
            {
                "area_id": "MWI",
                "area_name": "Malawi",
                "value": 30
            },
            {
                "area_id": "MWI",
                "area_name": "Malawi",
                "value": 20
            },
        ],
        filteredData: [
            {
                "area_id": "MWI",
                "area_name": "Malawi",
                "value": 20
            }
        ],
        ...props
    }
}

export const mockReviewInputMetadata = (props: Partial<ReviewInputFilterMetadataResponse> = {}): ReviewInputFilterMetadataResponse => {
    return {
        filterTypes: [
            {
                id: "1",
                column_id: "1",
                options: [
                    {
                        id: "op1",
                        label: "lab1"
                    }
                ]
            }
        ],
        indicators: [
            {
                indicator: "prevalence",
                value_column: "iindicator",
                name: "Prevalence",
                min: 0,
                max: 1,
                colour: "red",
                invert_scale: false,
                scale: 1,
                accuracy: null,
                format: "0.0%"
            }
        ],
        plotSettingsControl: {
            timeSeries: {
                plotSettings: []
            },
            inputChoropleth: {
                plotSettings: []
            }
        },
        ...props
    }
}
