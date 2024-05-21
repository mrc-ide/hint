<template>
    <div id="dialog">
        <modal :open="true">
            <h4 v-translate="'uploadFileToAdr'"></h4>
            <div class="container">
                <div id="dataset-id" class="mt-4">
                    <span v-translate="'uploadFileDataset'"></span>
                    <span>{{ dataset }}</span></div>
                <div class="pt-3 text-danger" id="output-file-error" v-if="outputFileError"
                v-translate="isOutputFileErrorKey ? outputFileError : ''">
                    {{ isOutputFileErrorKey ? '' : outputFileError }}
                </div>
                <div class="pt-3 form-check form-check-inline">
                    <input type="radio"
                           id="createRelease"
                           :disabled="!!outputFileError"
                           value="createRelease"
                           v-model="choiceUpload"
                           class="form-check-input"/>
                    <span class="form-check-label pl-2">
                        <label for="createRelease" v-translate="'createRelease'" class="d-inline"></label>
                        <span class="icon-small d-inline" v-tooltip="translate('createReleaseTooltip')">
                            <vue-feather type="help-circle"></vue-feather>
                        </span>
                    </span>
                    <br/>
                </div>
                <div class="form-check form-check-inline">
                    <input type="radio"
                           id="uploadFiles"
                           value="uploadFiles"
                           v-model="choiceUpload"
                           class="form-check-input"/>
                    <span class="form-check-label pl-2">
                        <label for="uploadFiles" v-translate="'uploadFiles'" class="d-inline"></label>
                        <span class="icon-small d-inline" v-tooltip="translate('uploadFilesTooltip')">
                            <vue-feather type="help-circle"></vue-feather>
                        </span>
                    </span>
                    <br/>
                </div>
                <div v-for="(uploadFileSection, sectionIndex) in uploadFileSections" :key="sectionIndex" class="pl-4">
                    <h5 v-if="Object.keys(uploadFileSections[1]).length > 0"
                        v-translate="getSectionHeading(sectionIndex)"
                        class="mt-3"></h5>
                    <div id="output-file-id" class="mt-3" v-for="(uploadFile, key, index) in uploadFileSection"
                         :key="uploadFile.index">
                        <div class="mt-3 form-check">
                            <input class="form-check-input"
                                   type="checkbox"
                                   :disabled="createRelease"
                                   :value="key"
                                   v-model="uploadFilesToAdr"
                                   :id="`id-${sectionIndex}-${index}`">

                            <label class="form-check-label"
                                   :for="`id-${sectionIndex}-${index}`"
                                   v-translate="uploadFile.displayName"></label>
                        </div>
                    </div>
                </div>
            </div>
            <template v-slot:footer>
                <button
                    type="button"
                    class="btn btn-red"
                    @click.prevent="confirmUpload"
                    :disabled="uploadFilesToAdr.length === 0"
                    v-translate="'ok'"></button>
                <button
                    type="button"
                    class="btn btn-white"
                    @click.prevent="handleCancel"
                    v-translate="'cancel'"></button>
            </template>
        </modal>
    </div>
</template>

<script lang="ts">
    import Modal from "../Modal.vue";
    import {Dict, UploadFile} from "../../types";
    import {BaselineState} from "../../store/baseline/baseline";
    import {mapActionByName, mapStateProp, mapStateProps} from "../../utils";
    import {ADRUploadState} from "../../store/adrUpload/adrUpload";
    import VueFeather from "vue-feather";
    import i18next from "i18next";
    import {Language} from "../../store/translations/locales";
    import {RootState} from "../../root";
    import {DownloadResultsState} from "../../store/downloadResults/downloadResults";
    import {defineComponent} from "vue";

    interface Data {
        uploadFilesToAdr: string[]
        choiceUpload: "createRelease" | "uploadFiles"
        selectedUploadFiles: UploadFile[]
    }

    const outputFileTypes = ["outputZip", "outputSummary", "outputComparison"];
    const inputFileTypes = ["anc", "programme", "pjnz", "population", "shape", "survey"];

    export default defineComponent({
        name: "UploadModal",
        data(): Data {
            return {
                uploadFilesToAdr: [],
                choiceUpload: "createRelease",
                selectedUploadFiles: []
            }
        },
        methods: {
            uploadFilesToADRAction: mapActionByName<UploadFile[]>(
                "adrUpload",
                "uploadFilesToADR"
            ),
            confirmUpload() {
                this.selectedUploadFiles = this.uploadFilesToAdr.map((value: string) => this.uploadableFiles[value]);
                this.sendUploadFilesToADR();
            },
            sendUploadFilesToADR() {
                this.uploadFilesToADRAction({uploadFiles: this.selectedUploadFiles, createRelease: this.createRelease});
                this.selectedUploadFiles = [];

                this.$emit("close");
            },
            handleCancel() {
                this.$emit("close")
            },
            translate(text: string) {
                return i18next.t(text, {lng: this.currentLanguage});
            },
            setDefaultCheckedItems: function () {
                this.uploadFilesToAdr = [...outputFileTypes, ...inputFileTypes]
                    .filter(key => this.uploadableFiles.hasOwnProperty(key))
            },
            //show and upload only successfully downloaded outputFiles in upload modal
            outputFileIsAvailable: function (key: string) {
                if (key === "outputZip" && !(this.spectrum.error || this.spectrum.metadataError)) {
                    return true
                } else if (key === "outputSummary" && !(this.summary.error || this.summary.metadataError)) {
                    return true
                } else if (key === "outputComparison" && !(this.comparison.error || this.comparison.metadataError)) {
                    return true
                }

                return false
            },
            getSectionHeading: function (sectionIndex: number) {
                const hasOutputFile = Object.keys(this.uploadFileSections[0]).length > 0
                return sectionIndex === 0 ? (hasOutputFile ? 'outputFiles' : '') : 'inputFiles';
            },
            translatedOutputFileError: function (key: string) {
                return i18next.t("downloadOutputsError", {
                    outputFileType: this.translate(key),
                    lng: this.currentLanguage,
                });
            }
        },
        computed: {
            ...mapStateProps("downloadResults", {
                summary: ((state: DownloadResultsState) => state.summary),
                spectrum: ((state: DownloadResultsState) => state.spectrum),
                comparison: ((state: DownloadResultsState) => state.comparison)
            }),
            outputFileError(): string | null {
                if ((this.summary.error || this.summary.metadataError) &&
                    (this.spectrum.error || this.spectrum.metadataError)) {
                    return "downloadSpectrumAndSummaryError"

                } else if (this.summary.error || this.summary.metadataError) {
                    return this.translatedOutputFileError("downloadSummary")

                } else if (this.spectrum.error || this.spectrum.metadataError) {
                    return this.translatedOutputFileError("downloadSpectrum")
                } else if (this.comparison.error || this.comparison.metadataError) {
                    return this.translatedOutputFileError("downloadComparison")
                }
                return null
            },
            dataset: mapStateProp<BaselineState, string | undefined>("baseline",
                (state: BaselineState) => state.selectedDataset?.title),
            createRelease(): boolean {
                return this.choiceUpload === 'createRelease';
            },
            currentLanguage: mapStateProp<RootState, Language>(
                null,
                (state: RootState) => state.language
            ),
            uploadableFiles: mapStateProp<ADRUploadState, Dict<UploadFile>>("adrUpload",
                (state) => state.uploadFiles!
            ),
            uploadFileSections(): any[] {
                if (this.uploadableFiles) {
                    return Object.keys(this.uploadableFiles).reduce((sections, key) => {
                        if (outputFileTypes.includes(key)) {
                            if (this.outputFileIsAvailable(key)) {
                                sections[0][key] = this.uploadableFiles[key];
                            }
                        } else {
                            sections[1][key] = this.uploadableFiles[key];
                        }
                        return sections;
                    }, [{} as any, {} as any]);
                } else {
                    return [];
                }
            },
            isOutputFileErrorKey(): boolean {
                return this.outputFileError === "downloadSpectrumAndSummaryError"
            }
        },
        components: {
            Modal,
            VueFeather
        },
        watch: {
            choiceUpload() {
                if (this.createRelease) {
                    this.setDefaultCheckedItems()
                }
            }
        },
        mounted() {
            if (this.outputFileError) {
                this.choiceUpload = "uploadFiles";
            }
            this.setDefaultCheckedItems()
        }
    });
</script>
