<template>
    <div>
        <div v-if="isGuest" id="load-zip">
            <button id="load-zip-button"
                    class="btn btn-red mb-4"
                    type="button"
                    @click="$refs.loadZip.click()">
                <vue-feather type="upload" size="20" class="icon ml-1 align-middle"></vue-feather>
                <span class="align-middle ml-2" v-translate="'loadZip'"></span>
            </button>
            <input id="upload-zip"
                   v-translate:aria-label="'selectFile'"
                   type="file"
                   style="display: none;" ref="loadZip"
                   @change="loadZip" accept=".zip">
        </div>

        <div class="row">
            <div class="col-sm-6 col-md-8">
                <form>
                    <manage-file label="PJNZ"
                                 :required="true"
                                 :valid="pjnz.valid"
                                 :fromADR="pjnz.fromADR"
                                 :error="pjnz.error || plottingMetadataError"
                                 :upload="uploadPJNZ"
                                 :delete-file="deletePJNZ"
                                 :existingFileName="pjnz.existingFileName"
                                 accept="PJNZ,pjnz,.pjnz,.PJNZ,.zip,zip,ZIP,.ZIP"
                                 name="pjnz">
                        <label class="mb-0" v-if="country">
                            <strong v-translate="'country'"></strong>: {{ country }}</label>
                    </manage-file>
                    <manage-file label="shape"
                                 :required="true"
                                 :valid="shape.valid"
                                 :fromADR="shape.fromADR"
                                 :error="shape.error"
                                 :upload="uploadShape"
                                 :delete-file="deleteShape"
                                 :existingFileName="shape.existingFileName"
                                 accept="geojson,.geojson,GEOJSON,.GEOJSON"
                                 name="shape">
                    </manage-file>
                    <manage-file label="population"
                                 :required="true"
                                 :valid="population.valid"
                                 :fromADR="population.fromADR"
                                 :error="population.error"
                                 :upload="uploadPopulation"
                                 :delete-file="deletePopulation"
                                 :existingFileName="population.existingFileName"
                                 accept="csv,.csv"
                                 name="population">
                    </manage-file>
                    <manage-file label="survey"
                                 :required="true"
                                 :valid="survey.valid"
                                 :fromADR="survey.fromADR"
                                 :error="survey.error"
                                 :upload="uploadSurvey"
                                 :delete-file="deleteSurvey"
                                 :existingFileName="survey.existingFileName"
                                 accept="csv,.csv"
                                 name="survey">
                    </manage-file>
                    <manage-file label="ART"
                                 :required="false"
                                 :valid="programme.valid"
                                 :fromADR="programme.fromADR"
                                 :error="programme.error"
                                 :upload="uploadProgram"
                                 :delete-file="deleteProgram"
                                 :existingFileName="programme.existingFileName"
                                 accept="csv,.csv"
                                 name="program">
                    </manage-file>
                    <manage-file label="ANC"
                                 :required="false"
                                 :valid="anc.valid"
                                 :fromADR="anc.fromADR"
                                 :error="anc.error"
                                 :upload="uploadANC"
                                 :delete-file="deleteANC"
                                 :existingFileName="anc.existingFileName"
                                 accept="csv,.csv"
                                 name="anc">
                    </manage-file>
                    <manage-file label="VMMC"
                                 :required="false"
                                 :valid="vmmc.valid"
                                 :fromADR="vmmc.fromADR"
                                 :error="vmmc.error"
                                 :upload="uploadVmmc"
                                 :delete-file="deleteVmmc"
                                 :existingFileName="vmmc.existingFileName"
                                 accept="xlsx,.xlsx"
                                 name="vmmc">
                    </manage-file>
                </form>
                <div v-if="validating" id="upload-inputs-validating">
                    <loading-spinner size="xs"></loading-spinner>
                    <span v-translate="'validating'"></span>
                </div>
                <error-alert v-if="hasBaselineError" :error="baselineError!"></error-alert>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
    import {CustomVue, mapActions, mapGetters, mapState} from "vuex";
    import {BaselineState} from "../../store/baseline/baseline";
    import {MetadataState} from "../../store/metadata/metadata";
    import ErrorAlert from "../ErrorAlert.vue";
    import LoadingSpinner from "../LoadingSpinner.vue";
    import ManageFile from "../files/ManageFile.vue";
    import {SurveyAndProgramState} from "../../store/surveyAndProgram/surveyAndProgram";
    import {getFormData, mapRootStateProps, mapStateProps} from "../../utils";
    import { Error } from "../../generated";
    import { defineComponent } from "vue";
    import VueFeather from "vue-feather";

    const namespace = 'baseline';

    type PlottingMetadataError = Record<"plottingMetadataError", (this: CustomVue, state: MetadataState) => Error | null>

    export default defineComponent({
        name: "UploadInputs",
        computed: {
            ...mapGetters(["isGuest"]),
            ...mapStateProps(namespace, {
                country: (state: BaselineState) => state.country,
                pjnz: (state: BaselineState) => ({
                    valid: !!state.country,
                    error: state.pjnzError,
                    fromADR: !!state.pjnz?.fromADR,
                    existingFileName: (state.pjnz && state.pjnz.filename) || state.pjnzErroredFile
                }),
                shape: (state: BaselineState) => ({
                    valid: state.shape != null,
                    error: state.shapeError,
                    fromADR: !!state.shape?.fromADR,
                    existingFileName: (state.shape && state.shape.filename) || state.shapeErroredFile
                }),
                population: (state: BaselineState) => ({
                    valid: state.population != null,
                    error: state.populationError,
                    fromADR: !!state.population?.fromADR,
                    existingFileName: (state.population && state.population.filename) || state.populationErroredFile
                }),
                hasBaselineError: (state: BaselineState) => !!state.baselineError,
                baselineError: (state: BaselineState) => state.baselineError,
                validating: (state: BaselineState) => state.validating
            }),
            ...mapState<MetadataState, PlottingMetadataError>("metadata", {
                plottingMetadataError: (state: MetadataState) => state.plottingMetadataError
            }),
            ...mapRootStateProps({
                anc: ({surveyAndProgram}: {surveyAndProgram: SurveyAndProgramState}) => ({
                    valid: !!surveyAndProgram.anc,
                    fromADR: !!surveyAndProgram.anc?.fromADR,
                    error: surveyAndProgram.ancError,
                    existingFileName: (surveyAndProgram.anc && surveyAndProgram.anc.filename)|| surveyAndProgram.ancErroredFile
                }),
                programme: ({surveyAndProgram}: {surveyAndProgram: SurveyAndProgramState}) => ({
                    valid: surveyAndProgram.program != null,
                    fromADR: !!surveyAndProgram.program?.fromADR,
                    error: surveyAndProgram.programError,
                    existingFileName: (surveyAndProgram.program && surveyAndProgram.program.filename) || surveyAndProgram.programErroredFile
                }),
                survey: ({surveyAndProgram}: {surveyAndProgram: SurveyAndProgramState}) => ({
                    valid: surveyAndProgram.survey != null,
                    fromADR: !!surveyAndProgram.survey?.fromADR,
                    error: surveyAndProgram.surveyError,
                    existingFileName: (surveyAndProgram.survey && surveyAndProgram.survey.filename) || surveyAndProgram.surveyErroredFile
                }),
                vmmc: ({surveyAndProgram}: {surveyAndProgram: SurveyAndProgramState}) => ({
                    valid: surveyAndProgram.vmmc != null,
                    fromADR: !!surveyAndProgram.vmmc?.fromADR,
                    error: surveyAndProgram.vmmcError,
                    existingFileName: (surveyAndProgram.vmmc && surveyAndProgram.vmmc.filename) || surveyAndProgram.vmmcErroredFile
                })
            }),
        },
        methods: {
            ...mapActions({
                uploadPJNZ: 'baseline/uploadPJNZ',
                uploadShape: 'baseline/uploadShape',
                uploadPopulation: 'baseline/uploadPopulation',
                deletePJNZ: 'baseline/deletePJNZ',
                deleteShape: 'baseline/deleteShape',
                deletePopulation: 'baseline/deletePopulation',
                uploadSurvey: 'surveyAndProgram/uploadSurvey',
                uploadProgram: 'surveyAndProgram/uploadProgram',
                uploadANC: 'surveyAndProgram/uploadANC',
                uploadVmmc: 'surveyAndProgram/uploadVmmc',
                deleteSurvey: 'surveyAndProgram/deleteSurvey',
                deleteProgram: 'surveyAndProgram/deleteProgram',
                deleteANC: 'surveyAndProgram/deleteANC',
                deleteVmmc: 'surveyAndProgram/deleteVmmc',
                getPlottingMetadata: 'metadata/getPlottingMetadata',
                preparingRehydrate: 'load/preparingRehydrate',
            }),
            loadZip() {
                const input = this.$refs.loadZip as HTMLInputElement;
                if (input.files && input.files.length > 0) {
                    const file = input.files[0];
                    this.clearLoadZipInput();
                    this.preparingRehydrate(getFormData(file));
                }
            },
            clearLoadZipInput() {
                // clearing value because browser does not
                // allow selection of the same file twice
                const input = this.$refs.loadZip as HTMLInputElement
                input.value = ""
            },
        },
        components: {
            VueFeather,
            ErrorAlert,
            LoadingSpinner,
            ManageFile
        }
    })
</script>
