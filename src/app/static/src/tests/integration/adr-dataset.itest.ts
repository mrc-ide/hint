import {actions as baselineActions} from "../../app/store/baseline/actions";
import {actions as surveyAndProgramActions} from "../../app/store/surveyAndProgram/actions";
import {login, rootState} from "./integrationTest";
import {BaselineMutation} from "../../app/store/baseline/mutations";
import {actions as adrActions} from "../../app/store/adr/actions";
import {actions as adrUploadActions} from "../../app/store/adrUpload/actions";
import {SurveyAndProgramMutation} from "../../app/store/surveyAndProgram/mutations";
import {getFormData} from "./helpers";
import {ADRMutation} from "../../app/store/adr/mutations";
import {UploadFile} from "../../app/types";

// this suite tests all endpoints that talk to the ADR
// we put them in a suite of their own so that we can run
// them as a separate CI step and easily spot when test failures
// are related to ADR flakiness
describe("ADR dataset-related actions", () => {
    const schemas = {
        baseUrl: "adr.com",
        pjnz: "pjnz",
        population: "pop",
        shape: "shape",
        survey: "survey",
    };

    beforeAll(async () => {
        await login();
        // this key is for a test user who has access to 1 fake dataset
        const adrKey = "4c69b103-4532-4b30-8a37-27a15e56c0bb"
        await adrActions.saveKey({commit: vi.fn(), rootState} as any, adrKey)

        const commit = vi.fn();
        const dispatch = vi.fn();

        const formData = getFormData("malawi.geojson");
        await baselineActions.uploadShape({commit, dispatch, rootState} as any, formData);

        const state = {country: "Malawi"} as any;
        const pjnzFormData = getFormData("Malawi2019.PJNZ");
        await baselineActions.uploadPJNZ({commit, state, dispatch, rootState} as any, pjnzFormData);
    });

    it("can fetch ADR datasets", async () => {
        const commit = vi.fn();
        await adrActions.getDatasets({commit, rootState} as any);

        expect(commit.mock.calls[0][0]["type"]).toBe(ADRMutation.SetFetchingDatasets);
        expect(commit.mock.calls[0][0]["payload"]).toBe(true);

        expect(commit.mock.calls[1][0]["type"]).toBe(ADRMutation.SetADRError);
        expect(commit.mock.calls[1][0]["payload"]).toBe(null);

        expect(commit.mock.calls[2][0]["type"]).toBe(ADRMutation.SetDatasets);
        expect(Array.isArray(commit.mock.calls[2][0]["payload"])).toBe(true);

        expect(commit.mock.calls[3][0]["type"]).toBe(ADRMutation.SetFetchingDatasets);
        expect(commit.mock.calls[3][0]["payload"]).toBe(false);
    });

    it("can get dataset", async () => {
        const commit = vi.fn();
        const dispatch = vi.fn();
        const rootStateWithSchemas = {
            ...rootState,
            adr: { schemas }
        };

        await adrActions.getDatasets({commit, rootState} as any);
        expect(commit.mock.calls[0][0]).toStrictEqual({type: ADRMutation.SetFetchingDatasets, payload: true});

        expect(commit.mock.calls[1][0]["type"]).toBe(ADRMutation.SetADRError);
        expect(commit.mock.calls[1][0]["payload"]).toBe(null);

        expect(commit.mock.calls[2][0].type).toStrictEqual(ADRMutation.SetDatasets);
        const datasetId = commit.mock.calls[2][0]["payload"][0].id;
        const state = {selectedDataset: {id: datasetId}};
        expect(commit.mock.calls[3][0]).toStrictEqual({type: ADRMutation.SetFetchingDatasets, payload: false});

        await baselineActions.refreshDatasetMetadata({commit, state, dispatch, rootState: rootStateWithSchemas} as any);
        expect(commit.mock.calls[4][0]).toBe(BaselineMutation.UpdateDatasetResources);
    });

    it("can get releases", async () => {
        const commit = vi.fn();

        await adrActions.getDatasets({commit, rootState} as any);

        vi.resetAllMocks();

        await adrActions.getReleases({commit, rootState} as any, "antarctica-country-estimates-2022-1");
        expect(commit.mock.calls[0][0].type).toBe(ADRMutation.SetReleases)
        expect(commit.mock.calls[0][0].payload.length).toBeGreaterThan(0);
        expect(commit.mock.calls[0][0].payload[0].name).toBeTruthy();
        expect(commit.mock.calls[0][0].payload[0].id).toBeTruthy();
    });

    it("can get userCanUpload when selected dataset organisation is set", async () => {
        const commit = vi.fn();

        // 1. get datasets
        await adrActions.getDatasets({commit, rootState} as any);

        // 2. select a naomi dev dataset
        expect(commit.mock.calls[2][0].type).toStrictEqual(ADRMutation.SetDatasets);
        const datasets = commit.mock.calls[2][0]["payload"];
        const dataset = datasets.find((dataset: any) => dataset.organization.name === "naomi-development-team");
        expect(dataset).not.toBeUndefined();

        // 3. check can upload
        commit.mockClear();
        const root = {
            ...rootState,
            baseline: {
                selectedDataset: {
                    id: dataset.id,
                    organization: {id: dataset.organization.id}
                }
            }
        };
        const adr = { schemas, datasets }; //include datasets in adr state
        await adrActions.getUserCanUpload({commit, rootState: root, state: adr} as any);
        expect(commit.mock.calls[0][0].type).toBe(ADRMutation.SetUserCanUpload);
        expect(commit.mock.calls[0][0].payload).toBe(true);
    });

    it("can get dataset details on get userCanUpload when selected dataset organisation is not set", async () => {
        const commit = vi.fn().mockImplementation((mutation, payload) => {
            if (mutation === "baseline/SetDataset") {
                root.baseline.selectedDataset = payload
            }
        });

        // 1. get datasets
        await adrActions.getDatasets({commit, rootState} as any);

        // 2. select a naomi dev dataset
        expect(commit.mock.calls[2][0].type).toStrictEqual(ADRMutation.SetDatasets);
        const datasets = commit.mock.calls[2][0]["payload"];
        const dataset = datasets.find((dataset: any) => dataset.organization.name === "naomi-development-team");
        expect(dataset).not.toBeNull()

        // 3. update dataset's organisation
        const root = {
            ...rootState,
            baseline: {
                selectedDataset: {
                    id: dataset.id
                }
            }
        };

        // 4. check can upload
        commit.mockClear();
        const dispatch = vi.fn().mockImplementation((type, payload) => {
            if (type === "getDataset") {
                root.baseline.selectedDataset = {
                    id: payload.id,
                    organization: {
                        id: dataset.organization.id
                    }
                } as any
            }
        });
        await adrActions.getUserCanUpload({commit, rootState: root, state: {schemas}, dispatch} as any);
        expect(commit.mock.calls[0][0].type).toBe(ADRMutation.SetUserCanUpload);
        expect(commit.mock.calls[0][0].payload).toBe(true);
    });

    it("can import PJNZ file", async () => {
        const commit = vi.fn();
        const dispatch = vi.fn();

        const state = await getSelectedDatasetState()

        await baselineActions.importPJNZ({commit, state, dispatch, rootState} as any,
            "https://raw.githubusercontent.com/mrc-ide/hint/master/src/app/testdata/Malawi2019.PJNZ");

        expect(commit.mock.calls[1][0]["type"]).toBe(BaselineMutation.PJNZUpdated);
        expect(commit.mock.calls[1][0]["payload"]["filename"])
            .toBe("Malawi2019.PJNZ");
    }, 10000);

    it("can import shape file", async () => {
        const commit = vi.fn();
        const dispatch = vi.fn();

        const state = await getSelectedDatasetState()

        await baselineActions.importShape({commit, dispatch, state, rootState} as any,
            "https://raw.githubusercontent.com/mrc-ide/hint/master/src/app/testdata/malawi.geojson");

        expect(commit.mock.calls[1][0]["type"]).toBe(BaselineMutation.ShapeUpdated);
        expect(commit.mock.calls[1][0]["payload"]["filename"])
            .toBe("malawi.geojson");

    }, 10000);

    it("can import population file", async () => {
        const commit = vi.fn();
        const dispatch = vi.fn();

        const state = await getSelectedDatasetState()

        await baselineActions.importPopulation({commit, dispatch, state, rootState} as any,
            "https://raw.githubusercontent.com/mrc-ide/hint/master/src/app/testdata/population.csv");

        expect(commit.mock.calls[1][0]["type"]).toBe(BaselineMutation.PopulationUpdated);
        expect(commit.mock.calls[1][0]["payload"]["filename"])
            .toBe("population.csv");
    }, 10000);

    it("can import survey", async () => {

        const commit = vi.fn();
        const dispatch = vi.fn();

        const state = await getSelectedDatasetState()

        await surveyAndProgramActions.importSurvey({commit, dispatch, state, rootState} as any,
            "https://raw.githubusercontent.com/mrc-ide/hint/master/src/app/testdata/survey.csv");

        expect(commit.mock.calls[2][0]["type"]).toBe(SurveyAndProgramMutation.SurveyUpdated);
        expect(commit.mock.calls[2][0]["payload"]["filename"])
            .toBe("survey.csv")
        expect(commit.mock.calls[3][0]["type"]).toBe(SurveyAndProgramMutation.WarningsFetched);
    }, 10000);

    it("can import programme", async () => {

        const commit = vi.fn();
        const dispatch = vi.fn();
        const state = await getSelectedDatasetState()

        await surveyAndProgramActions.importProgram({commit, dispatch, state, rootState} as any,
            "https://raw.githubusercontent.com/mrc-ide/hint/master/src/app/testdata/programme.csv");

        expect(commit.mock.calls[2][0]).toStrictEqual({
            type: "genericChart/ClearDataset",
            payload: "art"
        });
        expect(commit.mock.calls[3][0]["type"]).toBe(SurveyAndProgramMutation.ProgramUpdated);
        expect(commit.mock.calls[3][0]["payload"]["filename"])
            .toBe("programme.csv")
        expect(commit.mock.calls[4][0]["type"]).toBe(SurveyAndProgramMutation.WarningsFetched);
    }, 10000);

    it("can import anc", async () => {

        const commit = vi.fn();

        const state = await getSelectedDatasetState()

        await surveyAndProgramActions.importANC({commit, state, rootState} as any,
            "https://raw.githubusercontent.com/mrc-ide/hint/master/src/app/testdata/anc.csv");

        expect(commit.mock.calls[2][0]).toStrictEqual({
            type: "genericChart/ClearDataset",
            payload: "anc"
        });
        expect(commit.mock.calls[3][0]["type"]).toBe(SurveyAndProgramMutation.ANCUpdated);
        expect(commit.mock.calls[3][0]["payload"]["filename"])
            .toBe("anc.csv");
        expect(commit.mock.calls[4][0]["type"]).toBe(SurveyAndProgramMutation.WarningsFetched);
    }, 10000);

    it("hits upload files to adr endpoint and gets appropriate error", async () => {

        const commit = vi.fn();
        const dispatch = vi.fn();
        const root = {
            ...rootState,
            adr: {schemas, datasets: []},
            baseline: {
                selectedDataset: {
                    id: "datasetId",
                    organization: {id: "organisationId"}
                }
            },
            metadata: {
                adrUploadMetadata: {
                    outputSummary: {description: "summary"},
                    outputZip: {description: "zip"}
                }
            },
            adrUpload: {
                uploadComplete: false
            }
        };

        const uploadFilesPayload = {createRelease: false, uploadFiles: [
            {
                resourceType: "type1",
                resourceFilename: "file1",
                resourceId: "id1"
            }
        ] as UploadFile[]}

        await adrUploadActions.uploadFilesToADR({commit, dispatch, rootState: root} as any, uploadFilesPayload);

        expect(commit.mock.calls.length).toBe(3);
        expect(commit.mock.calls[0][0]["type"]).toBe("ADRUploadStarted");
        expect(commit.mock.calls[0][0]["payload"]).toBe(1);
        expect(commit.mock.calls[1][0]["type"]).toBe("ADRUploadProgress");
        expect(commit.mock.calls[1][0]["payload"]).toBe(1);
        expect(commit.mock.calls[2][0]["type"]).toBe("SetADRUploadError");
        expect(commit.mock.calls[2][0]["payload"]["error"]).toBe("OTHER_ERROR");
        expect(dispatch.mock.calls.length).toBe(1);
        expect(dispatch.mock.calls[0][0]).toBe("getUploadFiles");
    }, 10000);

    it("attempts to create release and gets appropriate error", async () => {
        const commit = vi.fn();

        const root = {
            ...rootState,
            baseline: {
                selectedDataset: {
                    id: "datasetId"
                }
            } as any,
            projects: {
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
            }
        };

        await adrUploadActions.createRelease({commit, rootState: root} as any);

        expect(commit.mock.calls.length).toBe(1);
        expect(commit.mock.calls[0][0]["type"]).toBe("ReleaseFailed");
        expect(commit.mock.calls[0][0]["payload"]).toStrictEqual({"detail": "Not found: Dataset not found", "error": "ADR_ERROR"});
    });

});

const getSelectedDatasetState = async () => {
    const commitDataset = vi.fn();
    await adrActions.getDatasets({commit: commitDataset, rootState} as any);
    const datasets = commitDataset.mock.calls[2][0]["payload"];
    return {
        selectedDataset:
            {
                id: datasets.id,
                resources: datasets.resources
            }
    }
}
