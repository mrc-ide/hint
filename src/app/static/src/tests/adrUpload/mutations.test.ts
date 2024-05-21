import {mockADRUploadState, mockError} from "../mocks";
import {ADRUploadMutation, mutations} from "../../app/store/adrUpload/mutations";
import i18next from "i18next";

describe("ADR mutations", () => {

    it("can set upload files", () => {
        const state = mockADRUploadState();
        const payload = {
            outputZip: {
                index: 1,
                displayName: "test",
                resourceType: "testType",
                resourceFilename: "testFile",
                resourceId: "123",
                lastModified: "2021-03-02",
                url: "https://test"
            }
        };
        mutations[ADRUploadMutation.SetUploadFiles](state, {payload});
        expect(state.uploadFiles).toBe(payload);
    });

    it("can set upload error", () => {
        const state = mockADRUploadState();
        mutations[ADRUploadMutation.SetADRUploadError](state, {payload: mockError("error detail")});
        expect(state.uploadError!!.detail).toBe("error detail");
        expect(state.uploading).toBe(false);

        mutations[ADRUploadMutation.SetADRUploadError](state, {payload: null});
        expect(state.uploadError).toBe(null);
        expect(state.uploading).toBe(false);
        expect(state.currentFileUploading).toBe(null);
        expect(state.totalFilesUploading).toBe(null);
    });

    it("can set upload started", () => {
        const state = mockADRUploadState();
        mutations[ADRUploadMutation.ADRUploadStarted](state, {payload: 2});
        expect(state.uploadError).toBe(null);
        expect(state.uploading).toBe(true);
        expect(state.uploadComplete).toBe(false);
        expect(state.totalFilesUploading).toBe(2);
        expect(state.releaseCreated).toBe(false);
        expect(state.releaseFailed).toBe(false);
    });

    it("can set upload progress", () => {
        const state = mockADRUploadState();
        mutations[ADRUploadMutation.ADRUploadProgress](state, {payload: 1});
        expect(state.currentFileUploading).toBe(1);
    });

    it("can set upload completed", () => {
        const state = mockADRUploadState();
        mutations[ADRUploadMutation.ADRUploadCompleted](state);
        expect(state.uploading).toBe(false);
        expect(state.uploadComplete).toBe(true);
        expect(state.currentFileUploading).toBe(null);
        expect(state.totalFilesUploading).toBe(null);
    });

    it("can clear status", () => {
        const state = mockADRUploadState();
        mutations[ADRUploadMutation.ClearStatus](state);
        expect(state.uploadComplete).toBe(false);
        expect(state.releaseCreated).toBe(false);
        expect(state.releaseFailed).toBe(false);
    });

    it("can set release created", () => {
        const state = mockADRUploadState();
        mutations[ADRUploadMutation.ReleaseCreated](state);
        expect(state.releaseCreated).toBe(true);
    });

    it("can set release failed with error", () => {
        const state = mockADRUploadState();
        mutations[ADRUploadMutation.ReleaseFailed](state, {payload: mockError("Version already exists for this activity")});
        expect(state.releaseFailed).toBe(true);
        expect(state.uploadError!!.detail).toBe("A release already exists on ADR for the latest files");

        mutations[ADRUploadMutation.ReleaseFailed](state, {payload: mockError("Version names must be unique per dataset")});
        expect(state.releaseFailed).toBe(true);
        expect(state.uploadError!!.detail).toBe("Release names must be unique per dataset and a release with the same name already exists on ADR. Try renaming the project to generate a new release name.");

        mutations[ADRUploadMutation.ReleaseFailed](state, {payload: mockError("other error")});
        expect(state.releaseFailed).toBe(true);
        expect(state.uploadError!!.detail).toBe("other error");
    });

    it("can set release failed with error in French", async () => {
        const state = mockADRUploadState();
        await i18next.changeLanguage("fr");
        mutations[ADRUploadMutation.ReleaseFailed](state, {payload: mockError("Version already exists for this activity")});
        expect(state.uploadError!!.detail).toBe("Une release existe déjà sur ADR pour les derniers fichiers");

        mutations[ADRUploadMutation.ReleaseFailed](state, {payload: mockError("Version names must be unique per dataset")});
        expect(state.uploadError!!.detail).toBe("Les noms de version doivent être uniques par ensemble de données et une version portant le même nom existe déjà sur ADR. Essayez de renommer le projet pour générer un nouveau nom de version.");
    });

    it("can set release failed with error in Portuguese", async () => {
        const state = mockADRUploadState();
        await i18next.changeLanguage("pt");
        mutations[ADRUploadMutation.ReleaseFailed](state, {payload: mockError("Version already exists for this activity")});
        expect(state.uploadError!!.detail).toBe("Já existe uma versão no ADR para os arquivos mais recentes");

        mutations[ADRUploadMutation.ReleaseFailed](state, {payload: mockError("Version names must be unique per dataset")});
        expect(state.uploadError!!.detail).toBe("Os nomes de versão devem ser exclusivos por conjunto de dados e uma versão com o mesmo nome já existe no ADR. Tente renomear o projeto para gerar um novo nome de versão.");
    });
});
