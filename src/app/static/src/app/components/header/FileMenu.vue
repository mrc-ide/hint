<template>
    <div style="flex:auto">
        <drop-down text="file">
            <p class="dropdown-item mb-0" tabindex="0"
               @click="$refs.loadZip.click()">
                <span v-translate="'loadZip'"></span>
                <vue-feather type="upload" size="20" class="icon ml-1"></vue-feather>
            </p>
            <input id="upload-zip" v-translate:aria-label="'selectFile'"
                   type="file"
                   style="display: none;" ref="loadZip"
                   @change="loadZip" accept=".zip">
        </drop-down>

        <div id="project-zip">
            <upload-new-project input-id="project-name-input-zip"
                                :open-modal="projectNameZip"
                                :submit-load="handleLoadZip"
                                :cancel-load="cancelLoadZip"/>
        </div>

    </div>
</template>
<script lang="ts">
    import {BaselineState} from "../../store/baseline/baseline";
    import {SurveyAndProgramState} from "../../store/surveyAndProgram/surveyAndProgram";
    import VueFeather from "vue-feather";
    import {LocalSessionFile} from "../../types";
    import {getFormData, mapActionByName, mapStateProp} from "../../utils";
    import {ValidateInputResponse} from "../../generated";
    import DropDown from "./DropDown.vue";
    import {mapGetterByName} from "../../utils";
    import UploadNewProject from "../load/UploadNewProject.vue";
    import { defineComponent } from "vue";

    interface Data {
        projectNameZip: boolean,
        fileToLoad: File | null
    }

    interface BaselineFiles {
        pjnz: LocalSessionFile | null,
        population: LocalSessionFile | null,
        shape: LocalSessionFile | null
    }

    interface SurveyAndProgramFiles {
        survey: LocalSessionFile | null,
        programme: LocalSessionFile | null,
        anc: LocalSessionFile | null
    }

    const localSessionFile = function (file: ValidateInputResponse | null) {
        return file ? {hash: file.hash, filename: file.filename} : null
    };

    export default defineComponent({
        props: {
            title: {
                type: String,
                required: true
            }
        },
        data(): Data {
            return {
                projectNameZip: false,
                fileToLoad: null,
            }
        },
        computed: {
            isGuest: mapGetterByName(null, "isGuest"),
            baselineFiles: mapStateProp<BaselineState, BaselineFiles>("baseline", state => {
                return {
                    pjnz: localSessionFile(state.pjnz),
                    population: localSessionFile(state.population),
                    shape: localSessionFile(state.shape)
                }
            }),
            surveyAndProgramFiles: mapStateProp<SurveyAndProgramState, SurveyAndProgramFiles>("surveyAndProgram", state => {
                return {
                    survey: localSessionFile(state.survey),
                    programme: localSessionFile(state.program),
                    anc: localSessionFile(state.anc)
                }
            })
        },
        methods: {
            preparingRehydrate: mapActionByName("load","preparingRehydrate"),
            loadZip() {
                const input = this.$refs.loadZip as HTMLInputElement;
                if (input.files && input.files.length > 0) {
                    const file = input.files[0];
                    this.clearLoadZipInput();
                    if (this.isGuest) {
                        this.preparingRehydrate(getFormData(file));
                    } else {
                        this.fileToLoad = file;
                        this.projectNameZip = true;
                    }
                }
            },
            clearLoadZipInput() {
                // clearing value because browser does not
                // allow selection of the same file twice
                const input = this.$refs.loadZip as HTMLInputElement
                input.value = ""
            },
            handleLoadZip() {
                this.projectNameZip = false;
                if (this.fileToLoad) {
                    this.preparingRehydrate(getFormData(this.fileToLoad));
                }
            },
            cancelLoadZip() {
                this.projectNameZip = false;
                this.clearLoadZipInput();
            }
        },
        components: {
            VueFeather,
            DropDown,
            UploadNewProject
        }
    })
</script>
