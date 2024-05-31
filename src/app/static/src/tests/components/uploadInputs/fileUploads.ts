import {flushPromises} from '@vue/test-utils';
import Vuex from 'vuex';
import ManageFile from "../../../app/components/files/ManageFile.vue";
import {SurveyAndProgramState} from "../../../app/store/surveyAndProgram/surveyAndProgram";
import {SurveyAndProgramActions} from "../../../app/store/surveyAndProgram/actions";
import {
    mockBaselineState,
    mockError,
    mockMetadataState,
    mockPlottingSelections,
    mockSurveyAndProgramState
} from "../../mocks";
import UploadInputs from "../../../app/components/uploadInputs/UploadInputs.vue";
import {shallowMountWithTranslate} from '../../testHelpers';
import {Mocked} from 'vitest';

export function testUploadComponent(name: string, position: number) {

    let actions: Mocked<SurveyAndProgramActions>;
    let mutations = {};

    let expectedUploadAction: any;
    let expectedDeleteAction: any;

    const createSut = (state?: Partial<SurveyAndProgramState>) => {

        actions = {
            importANC: vi.fn(),
            importProgram: vi.fn(),
            importSurvey: vi.fn(),
            importVmmc: vi.fn(),
            uploadSurvey: vi.fn(),
            uploadProgram: vi.fn(),
            uploadANC: vi.fn(),
            uploadVmmc: vi.fn(),
            deleteSurvey: vi.fn(),
            deleteProgram: vi.fn(),
            deleteANC: vi.fn(),
            deleteAll: vi.fn(),
            deleteVmmc: vi.fn(),
            getSurveyAndProgramData: vi.fn(),
            selectDataType: vi.fn(),
            validateSurveyAndProgramData: vi.fn()
        };

        switch (name) {
            case "surveys":
                expectedUploadAction = actions.uploadSurvey;
                expectedDeleteAction = actions.deleteSurvey;
                break;
            case "program":
                expectedUploadAction = actions.uploadProgram;
                expectedDeleteAction = actions.deleteProgram;
                break;
            case "anc":
                expectedUploadAction = actions.uploadANC;
                expectedDeleteAction = actions.deleteANC;
                break;
        }

        return new Vuex.Store({
            getters: {
                isGuest: () => false
            },
            modules: {
                surveyAndProgram: {
                    namespaced: true,
                    state: mockSurveyAndProgramState(state),
                    actions: {...actions},
                    mutations: {...mutations}
                },
                baseline: {
                    namespaced: true,
                    state: mockBaselineState()
                },
                plottingSelections: {
                    namespaced: true,
                    state: mockPlottingSelections()
                },
                metadata: {
                    namespaced: true,
                    state: mockMetadataState()
                }
            }
        })
    };

    let errorState: object;
    switch (name) {
        case "surveys":
            errorState = {surveyError: mockError("File upload went wrong")};
            break;
        case "program":
            errorState = {programError: mockError("File upload went wrong")};
            break;
        case "anc":
            errorState = {ancError: mockError("File upload went wrong")};
            break;
    }

    const response = {
        filename: "filename.csv",
        type: name as any,
        data: "SOME DATA"
    };


    let successState: object;
    switch (name) {
        case "surveys":
            successState = {
                survey: response
            };
            break;
        case "program":
            successState = {
                program: response
            };
            break;
        case "anc":
            successState = {
                anc: response
            };
            break;
    }


    it(`${name} upload is valid if data is present`, () => {
        const store = createSut(successState);
        const wrapper = shallowMountWithTranslate(UploadInputs, store, {
            global: {
                plugins: [store]
            }
        });
        expect(wrapper.findAllComponents(ManageFile)[position].props().valid).toBe(true);
    });

    it(`${name} upload is invalid if data is null`, () => {
        const store = createSut();
        const wrapper = shallowMountWithTranslate(UploadInputs, store, {
            global: {
                plugins: [store]
            }
        });
        expect(wrapper.findAllComponents(ManageFile)[position].props().valid).toBe(false);
    });

    it(`passes ${name} upload error to file upload`, () => {
        const store = createSut(errorState);
        const wrapper = shallowMountWithTranslate(UploadInputs, store, {
            global: {
                plugins: [store]
            }
        });
        expect(wrapper.findAllComponents(ManageFile)[position].props().error).toStrictEqual(mockError("File upload went wrong"));
    });

    it(`upload ${name} dispatches surveyAndProgram/upload${name}`, async () => {
        const store = createSut();
        const wrapper = shallowMountWithTranslate(UploadInputs, store, {
            global: {
                plugins: [store]
            }
        });

        wrapper.findAllComponents(ManageFile)[position].props().upload({name: "TEST"} as any);
        await flushPromises();
        expect(expectedUploadAction.mock.calls[0][1]).toStrictEqual({name: "TEST"});
    });

    it(`delete ${name} dispatches surveyAndProgram/delete${name}`, async () => {
        const store = createSut();
        const wrapper = shallowMountWithTranslate(UploadInputs, store, {
            global: {
                plugins: [store]
            }
        });

        wrapper.findAllComponents(ManageFile)[position].props().deleteFile();
        await flushPromises();
        expect(expectedDeleteAction.mock.calls.length).toBe(1);
    });
}
