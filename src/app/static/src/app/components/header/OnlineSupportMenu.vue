<template>
    <div id="divclass">
        <drop-down text="support" :right="true" :delay="true" style="flex: none">
            <a class="dropdown-item"
               :href="helpFilename"
               target="_blank"
               v-translate="'help'">
            </a>
            <a class="dropdown-item"
               :href="helpVideoLocation"
               target="_blank"
               v-translate="'helpVideoLink'">
            </a>
            <a class="dropdown-item"
               @click="toggleErrorReportModal"
               tabindex="0"
               v-translate="'troubleshootingRequest'">
            </a>
            <router-link id="privacy-link"
                         to="/privacy"
                         class="dropdown-item"
                         v-translate="'privacy'">
            </router-link>
            <router-link id="accessibility-link"
                         to="/accessibility"
                         class="dropdown-item"
                         v-translate="'axe'">
            </router-link>
        </drop-down>
        <error-report :open="errorReportOpen"
                      @send="sendErrorReport"
                      @close="toggleErrorReportModal">
            <template v-slot:sectionView>
                <div>
                    <label for="section" v-translate="'section'"></label>
                    <select class="form-control"
                            v-model="currentSection"
                            id="section">
                        <option v-for="step in steps"
                                :key="step.number"
                                :value="step.textKey"
                                v-translate="step.textKey">
                        </option>
                        <option key="login"
                                v-translate="'login'"
                                value="login"></option>
                        <option key="projects" v-translate="'projects'"
                                value="projects"></option>
                        <option key="other"
                                value="other"
                                v-translate="'other'"></option>
                    </select>
                </div>
            </template>
            <template v-slot:projectView>
                <div v-if="projectName"><label for="project" v-translate="'project'"></label>
                    <input type="text" disabled id="project" :value="projectName" class="form-control"/>
                </div>
            </template>
        </error-report>
    </div>
</template>
<script lang="ts">
    import DropDown from "./DropDown.vue";
    import i18next from "i18next";
    import {HelpFile, mapActionByName, mapStateProp} from "../../utils";
    import {RootState} from "../../root";
    import {Language} from "../../store/translations/locales";
    import ErrorReport from "../ErrorReport.vue";
    import {ProjectsState} from "../../store/projects/projects";
    import {StepDescription, StepperState} from "../../store/stepper/stepper";
    import {ErrorReportManualDetails} from "../../types";
    import { defineComponent } from "vue";

    export default defineComponent({
        data: function () {
            return {
                errorReportOpen: false,
                section: ""
            }
        },
        computed: {
            currentSectionKey: mapStateProp<StepperState, string>("stepper", state => {
                return state.steps[state.activeStep - 1].textKey;
            }),
            currentSection: {
                get(): string {
                    return this.section || this.currentSectionKey
                },
                set(newVal: string) {
                    this.section = newVal
                }
            },
            steps: mapStateProp<StepperState, StepDescription[]>("stepper", state => state.steps),
            projectName: mapStateProp<ProjectsState, string | undefined>("projects", state => state.currentProject?.name),
            currentLanguage: mapStateProp<RootState, Language>(null,
                (state: RootState) => state.language),
            support(): string {
                return i18next.t("support", this.currentLanguage) as string
            },
            helpVideoLocation(): string {
                return "https://www.youtube.com/@naomi-unaids"
            },
            helpFilename: mapStateProp<RootState, string>(null,
                (state: RootState) => {
                    if (state.language == Language.fr) {
                        return HelpFile.french;
                    }
                    return HelpFile.english;
                }),
        },
        methods: {
            generateErrorReport: mapActionByName(null,
                "generateErrorReport"),
            async sendErrorReport(errorReport: ErrorReportManualDetails) {
                await this.generateErrorReport({
                    section: this.currentSection,
                    ...errorReport
                })
                this.section = ""
            },
            projectSection() {
                if (this.$route.path.indexOf("projects") > -1) {
                    this.section = "projects"
                }
            },
            toggleErrorReportModal() {
                this.errorReportOpen = !this.errorReportOpen
                this.errorReportOpen ? this.projectSection() : this.section = "";
            }
        },
        components: {
            DropDown,
            ErrorReport
        }
    })
</script>
