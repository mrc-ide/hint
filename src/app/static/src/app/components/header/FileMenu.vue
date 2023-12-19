<template>
    <div style="flex:auto">
        <drop-down text="file">
            <p class="dropdown-item mb-0" tabindex="0"
               @click="($refs.loadZip as any).click()">
                <span v-translate="'loadZip'"></span>
                <vue-feather type="upload" size="20" class="icon ms-1"></vue-feather>
            </p>
            <input id="upload-zip" v-translate:aria-label="'selectFile'"
                   type="file"
                   style="display: none;" ref="loadZip"
                   @change="loadZip" accept=".zip">

            <span v-if="loadJsonFeatureSwitch">
                <a class="dropdown-item mb-0" tabindex="0" v-on:mousedown="save">
                <span><span class="pe-1" v-translate="'save'"></span>JSON</span>
                <vue-feather type="download" size="20" class="icon ms-1"></vue-feather>
                </a>
                <a style="display:none" ref="save"></a>
                <p class="dropdown-item mb-0" tabindex="0"
                   @click="($refs.loadJson as any).click()">
                <span><span class="pe-1" v-translate="'load'"></span>JSON</span>
                <vue-feather type="upload" size="20" class="icon ms-1"></vue-feather>
                </p>
                <input id="upload-file" v-translate:aria-label="'selectFile'"
                       type="file"
                       style="display: none;"
                       ref="loadJson"
                       @change="loadJson"
                       accept=".json">
            </span>
        </drop-down>

        <div id="project-zip">
            <upload-new-project input-id="project-name-input-zip"
                                :open-modal="projectNameZip"
                                :submit-load="handleLoadZip"
                                :cancel-load="cancelLoadZip"/>
        </div>

        <div id="project-json" v-if="loadJsonFeatureSwitch">
            <upload-new-project input-id="project-name-input-json"
                                :open-modal="projectNameJson"
                                :submit-load="handleLoadJson"
                                :cancel-load="cancelLoadJson"/>
        </div>

    </div>
</template>
<script lang="ts">
    import {serialiseState} from "../../localStorageManager";
    import {BaselineState} from "../../store/baseline/baseline";
    import {SurveyAndProgramState} from "../../store/surveyAndProgram/surveyAndProgram";
    import VueFeather from "vue-feather";
    import {LocalSessionFile} from "../../types";
    import {addCheckSum, getFormData, mapActionByName, mapStateProp} from "../../utils";
    import {ValidateInputResponse} from "../../generated";
    import DropDown from "./DropDown.vue";
    import {mapGetterByName} from "../../utils";
    import UploadNewProject from "../load/UploadNewProject.vue";
    import {switches} from "../../featureSwitches"
    import { defineComponent } from "vue";

    interface Data {
        projectNameJson: boolean,
        projectNameZip: boolean,
        fileToLoad: File | null
        loadJsonFeatureSwitch: boolean
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
        mounted() {
            const handleLoadJson = () => {
                (this.$refs.loadJson as any).click()
            };
            return {
                handleLoadJson
            }
        },
        data(): Data {
            return {
                projectNameJson: false,
                projectNameZip: false,
                fileToLoad: null,
                loadJsonFeatureSwitch: switches.loadJson
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
            loadAction: mapActionByName<File>("load", "load"),
            preparingRehydrate: mapActionByName("load","preparingRehydrate"),
            save(e: Event) {
                e.preventDefault();
                const state = serialiseState(this.$store.state);
                const files = {
                    ...this.baselineFiles,
                    ...this.surveyAndProgramFiles
                };
                const data = JSON.stringify({state, files});
                const content = addCheckSum(data);

                const file = new Blob([content], {type: "text/json"});
                const a = (this.$refs.save as any);
                a.href = URL.createObjectURL(file);
                a.download = `${this.title}-${new Date().toISOString()}.json`.toLowerCase();
                a.click();
            },
            loadJson() {
                const input = this.$refs.loadJson as HTMLInputElement;
                if (input.files && input.files.length > 0) {
                    const file = input.files[0];
                    this.clearLoadJsonInput()
                    if (this.isGuest) {
                        this.loadAction(file);
                    } else {
                        this.fileToLoad = file;
                        this.projectNameJson = true;
                    }
                }
            },
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
            clearLoadJsonInput() {
                const input = this.$refs.loadJson as HTMLInputElement
                input.value = ""
            },
            handleLoadJson() {
                this.projectNameJson = false;
                if (this.fileToLoad) {
                    this.loadAction(this.fileToLoad)
                }
            },
            handleLoadZip() {
                this.projectNameZip = false;
                if (this.fileToLoad) {
                    this.preparingRehydrate(getFormData(this.fileToLoad));
                }
            },
            cancelLoadJson() {
                this.projectNameJson = false;
                this.clearLoadJsonInput();
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
