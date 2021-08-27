import {
    mockADRState, mockADRUploadState,
    mockAxios,
    mockBaselineState, mockDownloadResultsState,
    mockError,
    mockFailure, mockMetadataState,
    mockProjectsState,
    mockRootState,
    mockSuccess, mockSurveyAndProgramState,
    mockModelCalibrateState, mockModelRunState, mockCalibrateResultResponse
} from "../mocks";
import {actions} from "../../app/store/adrUpload/actions";
import {mutations} from "../../app/store/adrUpload/mutations";
import {UploadFile} from "../../app/types";
import Vuex from "vuex";
import {RootState} from "../../app/root";
import {mutations as baselineMutations} from "../../app/store/baseline/mutations";

describe("ADR upload actions", () => {
    const state = mockADRUploadState();

    beforeEach(() => {
        // stop apiService logging to console
        console.log = jest.fn();
        mockAxios.reset();
    });

    afterEach(() => {
        (console.log as jest.Mock).mockClear();
    });

    it("getUploadFiles does nothing if no selected dataset", async () => {
        const commit = jest.fn();
        const root = mockRootState({
            baseline: mockBaselineState(),
            projects: mockProjectsState({currentProject: {id: 1} as any})
        });

        await actions.getUploadFiles({commit, state, rootState: root} as any);

        expect(commit.mock.calls.length).toBe(0);
        expect(mockAxios.history.get.length).toBe(0);
    });

    it("getUploadFiles does nothing if no current project", async () => {
        const commit = jest.fn();
        const root = mockRootState({
            baseline: mockBaselineState({selectedDataset: {id: 1} as any}),
            projects: mockProjectsState()
        });

        await actions.getUploadFiles({commit, state, rootState: root} as any);

        expect(commit.mock.calls.length).toBe(0);
        expect(mockAxios.history.get.length).toBe(0);
    });

    it("getUploadFiles commits error on error response", async () => {
        const commit = jest.fn();

        mockAxios.onGet(`/adr/datasets/test-dataset`)
            .reply(500, mockFailure("test error"));

        const root = mockRootState({
            adr: mockADRState({schemas: {outputZip: "output-zip", outputSummary: "output-summary"} as any}),
            baseline: mockBaselineState({selectedDataset: {id: "test-dataset"} as any}),
            projects: mockProjectsState({currentProject: {name: "project1"} as any})
        });

        await actions.getUploadFiles({commit, state, rootState: root} as any);

        expect(commit.mock.calls[0][0].type).toBe("SetADRUploadError");
        expect(commit.mock.calls[0][0].payload).toBeNull();

        expect(commit.mock.calls[1][0].type).toBe("SetADRUploadError");
        expect(commit.mock.calls[1][0].payload).toStrictEqual(mockError("test error"));
    });

    it("getUploadFiles takes release into account", async () => {
        const commit = jest.fn();

        const root = mockRootState({
            baseline: mockBaselineState({selectedDataset: {id: "test-dataset", release: "2.0"} as any}),
            projects: mockProjectsState({currentProject: {name: "project1"} as any})
        });

        await actions.getUploadFiles({commit, rootState: root} as any);

        expect(mockAxios.history["get"][0]["url"]).toBe("/adr/datasets/test-dataset?release=2.0");
    });

    const testGetUploadFilesInputs = async () => {
        const commit = jest.fn();
        const datasetWithResources = {
            resources: [
                {
                    resource_type: "output-summary",
                    id: "123",
                    last_modified: "2021-03-01",
                    metadata_modified: "2021-03-02",
                    url: "http://test",
                    name: "Naomi Results and Summary Report"
                },
                {
                    resource_type: "adr-shape",
                    id: "456",
                    last_modified: "2021-04-01",
                    metadata_modified: "2021-04-02",
                    url: "http://adr/test-shape",
                    name: "Naomi Input Shape file"
                },
                {
                    resource_type: "adr-art",
                    id: "789",
                    last_modified: "2021-04-03",
                    metadata_modified: "2021-04-04",
                    url: "http://adr/test-art",
                    name: "Naomi Input ART file"
                }
            ]
        };
        mockAxios.onGet(`/adr/datasets/test-dataset`)
            .reply(200, mockSuccess(datasetWithResources));

        const root = mockRootState({
            adr: mockADRState({
                schemas: {
                outputZip: "output-zip",
                    outputSummary: "output-summary",
                    pjnz: "adr-pjnz",
                    shape: "adr-shape",
                    population: "adr-population",
                    survey: "adr-survey",
                    programme: "adr-art",
                    anc: "adr-anc"
                } as any
            }),
            baseline: mockBaselineState({
                selectedDataset: {id: "test-dataset"},
                pjnz: {fromADR: true},
                shape: {fromADR: false, filename: "test-shape.geojson"},
                population: {fromADR: true}
            } as any),
            surveyAndProgram: mockSurveyAndProgramState({
                survey: {fromADR: true},
                program: {fromADR: false, filename: "test-program.csv"},
                anc: {fromADR: true}
            } as any),
            projects: mockProjectsState({currentProject: {name: "project1"} as any})
        });

        await actions.getUploadFiles({commit, state, rootState: root} as any);

        expect(commit.mock.calls[1][0].type).toBe("SetUploadFiles");

        let expectedUploadFiles: Record<string, UploadFile> = {
            outputZip: {
                index: 0,
                displayName: "uploadFileOutputZip",
                resourceType: "output-zip",
                resourceFilename: "naomi_outputs.zip",
                resourceName: "Naomi Output ZIP",
                resourceId: null,
                lastModified: null,
                resourceUrl: null
            },
            outputSummary: {
                index: 1,
                displayName: "uploadFileOutputSummary",
                resourceType: "output-summary",
                resourceFilename: "naomi_summary.html",
                resourceName: "Naomi Results and Summary Report",
                resourceId: "123",
                lastModified: "2021-03-02",
                resourceUrl: "http://test"
            },
            shape: {
                index: 2,
                displayName: "shape",
                resourceType: "adr-shape",
                resourceFilename: "test-shape.geojson",
                resourceName: "Naomi Input Shape file",
                resourceId: "456",
                lastModified: "2021-04-02",
                resourceUrl: "http://adr/test-shape"
            },
            programme: {
                index: 3,
                displayName: "ART",
                resourceType: "adr-art",
                resourceFilename: "test-program.csv",
                resourceName: "Naomi Input ART file",
                resourceId: "789",
                lastModified: "2021-04-04",
                resourceUrl: "http://adr/test-art"
            }
        };

        expect(commit.mock.calls[1][0].payload).toStrictEqual(expectedUploadFiles);
    };

    it("getUploadFiles includes non-ADR input files", async () => {
        await testGetUploadFilesInputs();
    });

    it("getUploadFiles can include full set of non_ADR input files", async () => {

        const commit = jest.fn();
        const datasetWithResources = {
            resources: [
                {
                    resource_type: "output-summary",
                    id: "123",
                    last_modified: "2021-03-01",
                    metadata_modified: "2021-03-02",
                    url: "http://test",
                    name: "Naomi Results and Summary Report"
                },
                {
                    resource_type: "adr-pjnz",
                    id: "234",
                    last_modified: "2021-03-03",
                    metadata_modified: "2021-03-04",
                    url: "http://adr/test-pjnz",
                    name: "Naomi Input PJNZ file"
                },
                {
                    resource_type: "adr-shape",
                    id: "345",
                    last_modified: "2021-03-05",
                    metadata_modified: "2021-03-06",
                    url: "http://adr/test-shape",
                    name: "Naomi Input Shape file"
                },
                {
                    resource_type: "adr-population",
                    id: "456",
                    last_modified: "2021-03-07",
                    metadata_modified: "2021-03-08",
                    url: "http://adr/test-pop",
                    name: "Naomi Input Population file"
                },
                {
                    resource_type: "adr-survey",
                    id: "567",
                    last_modified: "2021-03-09",
                    metadata_modified: "2021-03-10",
                    url: "http://adr/test-survey",
                    name: "Naomi Input Survey file"
                },
                {
                    resource_type: "adr-art",
                    id: "678",
                    last_modified: "2021-03-11",
                    metadata_modified: "2021-03-12",
                    url: "http://adr/test-art",
                    name: "Naomi Input ART file"
                },
                {
                    resource_type: "adr-anc",
                    id: "789",
                    last_modified: "2021-03-13",
                    metadata_modified: "2021-03-14",
                    url: "http://adr/test-anc",
                    name: "Naomi Input ANC file"
                }
            ]
        };
        mockAxios.onGet(`/adr/datasets/test-dataset`)
            .reply(200, mockSuccess(datasetWithResources));

        const root = mockRootState({
            adr: mockADRState({
                schemas: {
                    outputZip: "output-zip",
                    outputSummary: "output-summary",
                    pjnz: "adr-pjnz",
                    shape: "adr-shape",
                    population: "adr-population",
                    survey: "adr-survey",
                    programme: "adr-art",
                    anc: "adr-anc"
                } as any}),
            baseline: mockBaselineState({
                selectedDataset: {id: "test-dataset"},
                pjnz: {fromADR: false, filename: "test.pjnz"},
                shape: {fromADR: false, filename: "test-shape.geojson"},
                population: {fromADR: false, filename: "test-pop.csv"}
            } as any),
            surveyAndProgram: mockSurveyAndProgramState({
                survey: {fromADR: false, filename: "test-survey.csv"},
                program: {fromADR: false, filename: "test-program.csv"},
                anc: {fromADR: false, filename: "test-anc.csv"}
            } as any),
            projects: mockProjectsState({currentProject: {name: "project1"} as any})
        });

        await actions.getUploadFiles({commit, state, rootState: root} as any);

        expect(commit.mock.calls[1][0].type).toBe("SetUploadFiles");

        let expectedUploadFiles: Record<string, UploadFile> = {
            outputZip: {
                index: 0,
                displayName: "uploadFileOutputZip",
                resourceType: "output-zip",
                resourceFilename: "naomi_outputs.zip",
                resourceName: "Naomi Output ZIP",
                resourceId: null,
                lastModified: null,
                resourceUrl: null
            },
            outputSummary: {
                index: 1,
                displayName: "uploadFileOutputSummary",
                resourceType: "output-summary",
                resourceFilename: "naomi_summary.html",
                resourceName: "Naomi Results and Summary Report",
                resourceId: "123",
                lastModified: "2021-03-02",
                resourceUrl: "http://test"
            },
            pjnz: {
                index: 2,
                displayName: "PJNZ",
                resourceType: "adr-pjnz",
                resourceFilename: "test.pjnz",
                resourceName: "Naomi Input PJNZ file",
                resourceId: "234",
                lastModified: "2021-03-04",
                resourceUrl: "http://adr/test-pjnz"
            },
            shape: {
                index: 3,
                displayName: "shape",
                resourceType: "adr-shape",
                resourceFilename: "test-shape.geojson",
                resourceName: "Naomi Input Shape file",
                resourceId: "345",
                lastModified: "2021-03-06",
                resourceUrl: "http://adr/test-shape"
            },
            population: {
                index: 4,
                displayName: "population",
                resourceType: "adr-population",
                resourceFilename: "test-pop.csv",
                resourceName: "Naomi Input Population file",
                resourceId: "456",
                lastModified: "2021-03-08",
                resourceUrl: "http://adr/test-pop"
            },
            survey: {
                index: 5,
                displayName: "survey",
                resourceType: "adr-survey",
                resourceFilename: "test-survey.csv",
                resourceName: "Naomi Input Survey file",
                resourceId: "567",
                lastModified: "2021-03-10",
                resourceUrl: "http://adr/test-survey"
            },
            programme: {
                index: 6,
                displayName: "ART",
                resourceType: "adr-art",
                resourceFilename: "test-program.csv",
                resourceName: "Naomi Input ART file",
                resourceId: "678",
                lastModified: "2021-03-12",
                resourceUrl: "http://adr/test-art"
            },
            anc: {
                index: 7,
                displayName: "ANC",
                resourceType: "adr-anc",
                resourceFilename: "test-anc.csv",
                resourceName: "Naomi Input ANC file",
                resourceId: "789",
                lastModified: "2021-03-14",
                resourceUrl: "http://adr/test-anc"
            }
        };

        expect(commit.mock.calls[1][0].payload).toStrictEqual(expectedUploadFiles);
    });

    it("uploadFilesToADR uploads files sequentially to adr and commits complete on upload of final file", async () => {
        const commit = jest.fn();
        const dispatch = jest.fn();
        const root = mockRootState({
            adr: mockADRState({
                datasets: [],
                schemas: {
                    baseUrl: "http://test",
                    outputZip: "inputs-unaids-naomi-output-zip",
                    outputSummary: "inputs-unaids-naomi-report"
                } as any
            }),

            downloadResults: mockDownloadResultsState({
                summary: {downloadId: 1},
                spectrum: {downloadId: 2}
            } as any),

            metadata: mockMetadataState({
                adrUploadMetadata:
                    [{
                        type: "spectrum",
                        description: "zip"
                    },
                        {
                            type: "summary",
                            description: "summary"
                        }
                    ]
            } as any),

            baseline: mockBaselineState({
                selectedDataset: {
                    id: "datasetId"
                }
            } as any)
        });

        const uploadFilesPayload = {createRelease: false, uploadFiles: [
            {
                resourceType: "inputs-unaids-naomi-output-zip",
                resourceFilename: "file1",
                resourceId: "id1"
            },
            {
                resourceType: "inputs-unaids-naomi-report",
                resourceFilename: "file2"
            }
        ] as UploadFile[]}

        const success = {response: "success"}

        mockAxios.onPost(`adr/datasets/datasetId/resource/inputs-unaids-naomi-output-zip/2`)
            .reply(200, mockSuccess(null));
        mockAxios.onPost(`adr/datasets/datasetId/resource/inputs-unaids-naomi-report/1`)
            .reply(200, mockSuccess(success));
        mockAxios.onGet(`adr/datasets/datasetId`)
            .reply(200, mockSuccess(null));

        await actions.uploadFilesToADR({commit, dispatch, rootState: root} as any, uploadFilesPayload);
        expect(commit.mock.calls.length).toBe(4);
        expect(commit.mock.calls[0][0]["type"]).toBe("ADRUploadStarted");
        expect(commit.mock.calls[0][0]["payload"]).toBe(2);
        expect(commit.mock.calls[1][0]["type"]).toBe("ADRUploadProgress");
        expect(commit.mock.calls[1][0]["payload"]).toBe(1);
        expect(commit.mock.calls[2][0]["type"]).toBe("ADRUploadProgress");
        expect(commit.mock.calls[2][0]["payload"]).toBe(2);
        expect(commit.mock.calls[3][0]["type"]).toBe("ADRUploadCompleted");
        expect(commit.mock.calls[3][0]["payload"]).toEqual(success);
        expect(dispatch.mock.calls.length).toBe(1);
        expect(dispatch.mock.calls[0][0]).toBe("getUploadFiles");
        expect(mockAxios.history.post.length).toBe(2);
        expect(mockAxios.history.post[0]["data"]).toBe("resourceFileName=file1&resourceId=id1&description=zip");
        expect(mockAxios.history.post[0]["url"]).toBe("/adr/datasets/datasetId/resource/inputs-unaids-naomi-output-zip/2");
        expect(mockAxios.history.post[1]["data"]).toBe("resourceFileName=file2&description=summary");
        expect(mockAxios.history.post[1]["url"]).toBe("/adr/datasets/datasetId/resource/inputs-unaids-naomi-report/1");
    });

    it("uploadFilesToADR dispatches createRelease on upload of final file if instructed to", async () => {
        const commit = jest.fn();
        const dispatch = jest.fn();
        const root = mockRootState({
            adr: mockADRState({
                datasets: [],
                schemas: {
                    baseUrl: "http://test",
                    outputZip: "inputs-unaids-naomi-output-zip",
                    outputSummary: "inputs-unaids-naomi-report"
                } as any
            }),
            modelCalibrate: mockModelCalibrateState({calibrateId: "calId"}),
            modelRun: mockModelRunState(
                {
                    result: mockCalibrateResultResponse({
                        uploadMetadata: {
                            outputSummary: {description: "summary"},
                            outputZip: {description: "zip"}
                        }
                    })
                }),
            baseline: mockBaselineState({
                selectedDataset: {
                    id: "datasetId"
                }
            } as any),
            adrUpload: mockADRUploadState({
                uploadComplete: true
            })
        });

        const uploadFilesPayload = {createRelease: true, uploadFiles: [
            {
                resourceType: "inputs-unaids-naomi-output-zip",
                resourceFilename: "file1",
                resourceId: "id1"
            },
            {
                resourceType: "inputs-unaids-naomi-report",
                resourceFilename: "file2"
            }
        ] as UploadFile[]}

        const success = {response: "success"}

        mockAxios.onPost(`adr/datasets/datasetId/resource/inputs-unaids-naomi-output-zip/calId`)
            .reply(200, mockSuccess(null));
        mockAxios.onPost(`adr/datasets/datasetId/resource/inputs-unaids-naomi-report/calId`)
            .reply(200, mockSuccess(success));
        mockAxios.onGet(`adr/datasets/datasetId`)
            .reply(200, mockSuccess(null));

        await actions.uploadFilesToADR({commit, dispatch, rootState: root} as any, uploadFilesPayload);
        expect(dispatch.mock.calls.length).toBe(2);
        expect(dispatch.mock.calls[0][0]).toBe("getUploadFiles");
        expect(dispatch.mock.calls[1][0]).toBe("createRelease");
        
    });

    it("uploadFilesToADR sets upload failure and prevents subsequent uploads", async () => {
        const commit = jest.fn();
        const dispatch = jest.fn();
        const root = mockRootState({
            adr: mockADRState({
                datasets: [],
                schemas: {
                    baseUrl: "http://test",
                    outputZip: "inputs-unaids-naomi-output-zip",
                    outputSummary: "inputs-unaids-naomi-report"
                } as any
            }),

            downloadResults: mockDownloadResultsState({
                summary: {downloadId: 1},
                spectrum: {downloadId: 2}
            } as any),

            metadata: mockMetadataState({
                adrUploadMetadata:
                    [{
                        type: "spectrum",
                        description: "zip"
                    },
                        {
                            type: "summary",
                            description: "summary"
                        }
                    ]
            } as any),

            baseline: mockBaselineState({
                selectedDataset: {
                    id: "datasetId"
                }
            } as any)
        });

        const uploadFilesPayload = {createRelease: false, uploadFiles: [
            {
                resourceType: "inputs-unaids-naomi-report",
                resourceFilename: "file1",
                resourceId: "id1"
            },
            {
                resourceType: "type2",
                resourceFilename: "file2",
                resourceId: "id2"
            }
        ] as UploadFile[]}

        const success2 = {response: "success2"}

        mockAxios.onPost(`adr/datasets/datasetId/resource/inputs-unaids-naomi-report/1`)
            .reply(500, mockFailure("failed"));
        mockAxios.onPost(`adr/datasets/datasetId/resource/type2/2`)
            .reply(200, mockSuccess(success2));

        await actions.uploadFilesToADR({commit, dispatch, rootState: root} as any, uploadFilesPayload);

        expect(commit.mock.calls.length).toBe(3);
        expect(commit.mock.calls[0][0]["type"]).toBe("ADRUploadStarted");
        expect(commit.mock.calls[0][0]["payload"]).toBe(2);
        expect(commit.mock.calls[1][0]["type"]).toBe("ADRUploadProgress");
        expect(commit.mock.calls[1][0]["payload"]).toBe(1);
        expect(commit.mock.calls[2][0]["type"]).toBe("SetADRUploadError");
        expect(commit.mock.calls[2][0]["payload"]).toEqual({"detail": "failed", "error": "OTHER_ERROR"});
        expect(dispatch.mock.calls.length).toBe(1);
        expect(dispatch.mock.calls[0][0]).toBe("getUploadFiles");
        expect(mockAxios.history.post.length).toBe(1);
        expect(mockAxios.history.post[0]["data"]).toBe("resourceFileName=file1&resourceId=id1&description=summary");
        expect(mockAxios.history.post[0]["url"]).toBe("/adr/datasets/datasetId/resource/inputs-unaids-naomi-report/1");
    });

    it("uploadFilesToADR uploads files and static description sequentially to adr", async () => {
        const commit = jest.fn();
        const dispatch = jest.fn();
        const root = mockRootState({
            adr: mockADRState({
                datasets: [],
                schemas: {
                    baseUrl: "http://test",
                    outputZip: "inputs-unaids-naomi-output-zip",
                    outputSummary: "inputs-unaids-naomi-report"
                } as any
            }),

            downloadResults: mockDownloadResultsState({
                summary: {downloadId: 1},
                spectrum: {downloadId: 2}
            } as any),

            metadata: mockMetadataState({
                adrUploadMetadata: null
            } as any),

            baseline: mockBaselineState({
                selectedDataset: {
                    id: "datasetId"
                }
            } as any)
        });

        const uploadFilesPayload = {createRelease: false, uploadFiles: [
            {
                resourceType: "inputs-unaids-naomi-output-zip",
                resourceFilename: "file1",
                resourceId: "id1"
            },
            {
                resourceType: "inputs-unaids-naomi-report",
                resourceFilename: "file2"
            }
        ] as UploadFile[]}

        mockAxios.onPost(`adr/datasets/datasetId/resource/inputs-unaids-naomi-output-zip/2`)
            .reply(200, mockSuccess("success"));
        mockAxios.onPost(`adr/datasets/datasetId/resource/inputs-unaids-naomi-report/1`)
            .reply(200, mockSuccess("success2"));

        await actions.uploadFilesToADR({commit, dispatch, rootState: root} as any, uploadFilesPayload);
        expect(mockAxios.history.post.length).toBe(2);
        expect(mockAxios.history.post[0]["data"]).toBe("resourceFileName=file1&resourceId=id1&description=Naomi%20output%20uploaded%20from%20Naomi%20web%20app");
        expect(mockAxios.history.post[0]["url"]).toBe("/adr/datasets/datasetId/resource/inputs-unaids-naomi-output-zip/2");
        expect(mockAxios.history.post[1]["data"]).toBe("resourceFileName=file2&description=Naomi%20summary%20report%20uploaded%20from%20Naomi%20web%20app");
        expect(mockAxios.history.post[1]["url"]).toBe("/adr/datasets/datasetId/resource/inputs-unaids-naomi-report/1");
    });

    it("uploadFilesToADR invokes actions to update datasets on upload success", async () => {
        const uploadFilesPayload = {createRelease: false, uploadFiles: [
            {
                resourceType: "inputs-unaids-naomi-output-zip"
            },
            {
                resourceType: "inputs-unaids-naomi-report"
            }
        ] as UploadFile[]}

        mockAxios.onPost(`adr/datasets/datasetId/resource/inputs-unaids-naomi-output-zip/2`)
            .reply(200, mockSuccess(null));
        mockAxios.onPost(`adr/datasets/datasetId/resource/inputs-unaids-naomi-report/1`)
            .reply(200, mockSuccess(null));
        mockAxios.onGet(`adr/datasets/datasetId`)
            .reply(200, mockSuccess({id: "datasetId", resources: [], organization: {id: null}, title: "datasetTitle"}));

        const getUploadFiles = jest.fn();

        const store = new Vuex.Store<RootState>({
            state: mockRootState({
                projects: {
                    currentProject: {name: "project1"} as any
                } as any
            }),
            modules: {
                adrUpload: {
                    namespaced: true,
                    actions: {
                        ...actions,
                        getUploadFiles
                    },
                    mutations
                },
                downloadResults: {
                    namespaced: true,
                    state: mockDownloadResultsState({
                        summary: {downloadId: 1},
                        spectrum: {downloadId: 2}
                    } as any) as any
                },
                metadata: {
                    namespaced: true,
                    state: mockMetadataState({
                        adrUploadMetadata:
                            [{type: "spectrum", description: "zip"},
                                {type: "summary", description: "summary"}
                            ]
                    } as any) as any,
                },
                adr: {
                    namespaced: true,
                    state: mockADRState({
                        datasets: [],
                        schemas: {
                            baseUrl: "whatever",
                            outputZip: "inputs-unaids-naomi-output-zip",
                            outputSummary: "inputs-unaids-naomi-report"
                        } as any
                    })
                },
                baseline: {
                    namespaced: true,
                    mutations: baselineMutations,
                    state: mockBaselineState({
                        selectedDataset: {
                            id: "datasetId"
                        }
                    } as any)
                }
            }
        });

        expect(store.state.adrUpload.uploadComplete).toBeUndefined();

        await store.dispatch("adrUpload/uploadFilesToADR", uploadFilesPayload);

        expect(store.state.adrUpload.uploadComplete).toBe(true);
        expect(getUploadFiles.mock.calls.length).toBe(1);
    });

    it("createRelease posts release name to releases endpoint", async () => {
        const commit = jest.fn();
        const root = mockRootState({
            adr: mockADRState({
                datasets: [],
                schemas: {
                    baseUrl: "http://test"
                } as any
            }),
            baseline: mockBaselineState({
                selectedDataset: {
                    id: "datasetId"
                }
            } as any),
            projects: mockProjectsState({
                currentProject: {
                    name: "projectName",
                    id: 1,
                    versions: []
                },
                currentVersion: {
                    versionNumber: 1,
                    id: "1",
                    created: "then",
                    updated: "now"
                }
            })
        });

        mockAxios.onPost(`adr/datasets/datasetId/releases`)
            .reply(200, mockSuccess(null));

        await actions.createRelease({commit, rootState: root} as any);

        expect(commit.mock.calls.length).toBe(1);
        expect(commit.mock.calls[0][0]["type"]).toBe("ReleaseCreated");
        expect(commit.mock.calls[0][0]["payload"]).toBe(null);
        expect(mockAxios.history.post.length).toBe(1);
        expect(mockAxios.history.post[0]["data"]).toBe("name=Naomi%3A%20projectName%20v1");
        expect(mockAxios.history.post[0]["url"]).toBe("/adr/datasets/datasetId/releases")
    });

    it("createRelease commits release not created on failure", async () => {
        const commit = jest.fn();
        const root = mockRootState({
            adr: mockADRState({
                datasets: [],
                schemas: {
                    baseUrl: "http://test"
                } as any
            }),
            baseline: mockBaselineState({
                selectedDataset: {
                    id: "datasetId"
                }
            } as any),
            projects: mockProjectsState({
                currentProject: {
                    name: "projectName",
                    id: 1,
                    versions: []
                },
                currentVersion: {
                    versionNumber: 1,
                    id: "1",
                    created: "then",
                    updated: "now"
                }
            })
        });

        mockAxios.onPost(`adr/datasets/datasetId/releases`)
            .reply(500, mockFailure("failed"));

        await actions.createRelease({commit, rootState: root} as any);

        expect(commit.mock.calls.length).toBe(1);
        expect(commit.mock.calls[0][0]["type"]).toBe("ReleaseFailed");
        expect(commit.mock.calls[0][0]["payload"]).toStrictEqual({"detail": "failed", "error": "OTHER_ERROR"});
    });
});
