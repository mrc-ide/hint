<template>
    <div v-if="projects.length == 0" class="text-center">
        <h5 class="mt-5" v-translate="'projectPlaceholderText'"></h5>
    </div>
    <div v-else>
        <div id="headers" class="row font-weight-bold pt-2">
            <div class="col-md-1 header-cell"></div>
            <div class="col-md-3 header-cell" v-translate="'projectName'"></div>
            <div class="col-md-1 header-cell" v-translate="'versions'"></div>
            <div class="col-md-2 header-cell" v-translate="'lastUpdated'"></div>
            <div class="col-md-1 header-cell" v-translate="'load'"></div>
            <div class="col-md-1 header-cell" v-translate="'renameProjectHistoryHeader'"></div>
            <div class="col-md-1 header-cell" v-translate="'delete'"></div>
            <div class="col-md-1 header-cell" v-translate="'copyToNewProjectHistoryHeader'"></div>
            <div class="col-md-1 header-cell" v-translate="'share'"></div>
        </div>
        <hr/>
        <div v-for="p in projects" :key="p.id">
            <div :id="`p-${p.id}`" class="row py-2">
                <div class="col-md-1 project-cell">
                    <button
                        id="version-toggle"
                        :aria-label="`toggle ${getTranslatedValue('versionCountLabelSingle')} ${p.id}`"
                        class="btn btn-xs bg-transparent shadow-none py-0"
                        @click="toggleVersionMenu(p.id)">
                        <vue-feather v-show="!openVersion[p.id]"
                            type="chevron-right"
                            size="20"
                            class="icon when-closed"
                        ></vue-feather>
                        <vue-feather v-show="openVersion[p.id]"
                            type="chevron-down"
                            size="20"
                            class="icon when-open"
                        ></vue-feather>
                    </button>
                </div>
                <div class="col-md-3 project-cell name-cell">
                    <a href="#"
                       @click="loadVersion($event, p.id, p.versions[0].id)">
                        {{ p.name }}
                    </a>
                    <span class="float-right">
                    <button v-if="showTooltip" href="#" class="btn btn-sm btn-red-icons"
                            v-tooltip="getTranslatedValue('editProjectNote')"
                            @click.prevent="handleEditProjectNote(p.id)"
                            v-translate:aria-label="'editProjectNote'">
                        <vue-feather type="file-text" size="20"></vue-feather>
                    </button>
                    <button v-else href="#" class="btn btn-sm btn-red-icons"
                            @click.prevent="handleEditProjectNote(p.id)"
                            v-translate:aria-label="'editProjectNote'">
                        <vue-feather type="file-text" size="20"></vue-feather>
                    </button>
                    </span>
                    <small v-if="p.sharedBy" class="text-muted d-flex">
                        {{ getTranslatedValue("sharedBy") }}: {{ p.sharedBy }}
                    </small>
                    <small v-if="p.uploaded" class="text-muted d-flex">
                        {{ getTranslatedValue("isUploadedText") }}
                    </small>
                </div>
                <div class="col-md-1 project-cell version-count-cell">
                    <small class="text-muted">{{ versionCountLabel(p) }}</small>
                </div>
                <div class="col-md-2 project-cell updated-cell">
                    {{ format(p.versions[0].updated) }}
                </div>
                <div class="col-md-1 project-cell load-cell">
                    <button v-if="showTooltip" class=" btn btn-sm btn-red-icons"
                            v-tooltip="getTranslatedValue('load')"
                            v-translate:aria-label="'load'"
                            @click="loadVersion($event, p.id, p.versions[0].id)">
                        <vue-feather type="refresh-cw" size="20"></vue-feather>
                    </button>
                    <button v-else class=" btn btn-sm btn-red-icons"
                            v-translate:aria-label="'load'"
                            @click="loadVersion($event, p.id, p.versions[0].id)">
                        <vue-feather type="refresh-cw" size="20"></vue-feather>
                    </button>
                </div>
                <div class="col-md-1 project-cell rename-cell">
                    <button v-if="showTooltip" class="btn btn-sm btn-red-icons"
                            v-tooltip="getTranslatedValue('renameProject')"
                            v-translate:aria-label="'renameProject'"
                            @click="renameProject($event, p.id)">
                        <vue-feather type="edit" size="20"></vue-feather>
                    </button>
                    <button v-else class="btn btn-sm btn-red-icons"
                            v-translate:aria-label="'renameProject'"
                            @click="renameProject($event, p.id)">
                        <vue-feather type="edit" size="20"></vue-feather>
                    </button>
                </div>
                <div class="col-md-1 project-cell delete-cell">
                    <button v-if="showTooltip" class=" btn btn-sm btn-red-icons"
                            v-tooltip="getTranslatedValue('delete')"
                            v-translate:aria-label="'delete'"
                            @click="deleteProject($event, p.id)">
                        <vue-feather type="trash-2" size="20"></vue-feather>
                    </button>
                    <button v-else class=" btn btn-sm btn-red-icons"
                            v-translate:aria-label="'delete'"
                            @click="deleteProject($event, p.id)">
                        <vue-feather type="trash-2" size="20"></vue-feather>
                    </button>
                </div>
                <div class="col-md-1 project-cell copy-cell">
                    <button v-if="showTooltip" class=" btn btn-sm btn-red-icons"
                            v-tooltip="getTranslatedValue('copyLatestToNewProject')"
                            v-translate:aria-label="'copyLatestToNewProject'"
                            @click="promoteVersion(
                                $event,
                                p.id,
                                p.versions[0].id,
                                p.versions[0].versionNumber)">
                        <vue-feather type="copy" size="20"></vue-feather>
                    </button>
                    <button v-else class=" btn btn-sm btn-red-icons"
                            v-translate:aria-label="'copyLatestToNewProject'"
                            @click="promoteVersion(
                                $event,
                                p.id,
                                p.versions[0].id,
                                p.versions[0].versionNumber)">
                        <vue-feather type="copy" size="20"></vue-feather>
                    </button>
                </div>

                <div class="col-md-1 project-cell share-cell">
                    <share-project :project="p"></share-project>
                </div>
            </div>
            <b-collapse :id="`versions-${p.id}`"
                        :visible="openVersion[p.id]">
                <div v-for="v in p.versions"
                     :id="`v-${v.id}`"
                     :key="v.id"
                     class="row font-italic bg-light py-2">
                    <div class="col-md-1 version-cell"></div>
                    <div class="col-md-3 version-cell edit-cell">
                        <span class="float-right">
                            <button v-if="showTooltip" href="#" class="btn btn-sm btn-red-icons"
                                    v-tooltip="getTranslatedValue('editVersionNote')"
                                    v-translate:aria-label="'editVersionNote'"
                                    @click.prevent="handleEditVersionNote(p.id, v.id, v.versionNumber)">
                            <vue-feather type="file-text" size="20"></vue-feather>
                            </button>
                            <button v-else href="#" class="btn btn-sm btn-red-icons"
                                    v-translate:aria-label="'editVersionNote'"
                                    @click.prevent="handleEditVersionNote(p.id, v.id, v.versionNumber)">
                            <vue-feather type="file-text" size="20"></vue-feather>
                            </button>
                        </span>
                    </div>
                    <div class="col-md-1 version-cell version-label-cell">
                        {{ versionLabel(v) }}
                    </div>
                    <div class="col-md-2 version-cell version-updated-cell">
                        {{ format(v.updated) }}
                    </div>
                    <div class="col-md-1 version-cell load-cell">
                        <button v-if="showTooltip" class=" btn btn-sm btn-red-icons"
                                v-tooltip="getTranslatedValue('load')"
                                v-translate:aria-label="'load'"
                                @click="loadVersion($event, p.id, v.id)">
                            <vue-feather type="refresh-cw" size="20"></vue-feather>
                        </button>
                        <button v-else class=" btn btn-sm btn-red-icons"
                                v-translate:aria-label="'load'"
                                @click="loadVersion($event, p.id, v.id)">
                            <vue-feather type="refresh-cw" size="20"></vue-feather>
                        </button>
                    </div>
                    <div class="col-md-1 version-cell">
                    </div>
                    <div class="col-md-1 version-cell delete-cell">
                        <button v-if="showTooltip" class=" btn btn-sm btn-red-icons"
                                v-tooltip="getTranslatedValue('delete')"
                                v-translate:aria-label="'delete'"
                                @click="deleteVersion($event, p.id, v.id)">
                        <vue-feather type="trash-2" size="20"></vue-feather>
                        </button>
                        <button v-else class=" btn btn-sm btn-red-icons"
                                v-translate:aria-label="'delete'"
                                @click="deleteVersion($event, p.id, v.id)">
                        <vue-feather type="trash-2" size="20"></vue-feather>
                        </button>
                    </div>
                    <div class="col-md-1 version-cell copy-cell">
                        <button v-if="showTooltip" class=" btn btn-sm btn-red-icons"
                                v-tooltip="getTranslatedValue('copyToNewProject')"
                                v-translate:aria-label="'copyToNewProject'"
                                @click="promoteVersion(
                                    $event,
                                    p.id,
                                    v.id,
                                    v.versionNumber)">
                            <vue-feather type="copy" size="20"></vue-feather>
                        </button>
                        <button v-else class=" btn btn-sm btn-red-icons"
                                v-translate:aria-label="'copyToNewProject'"
                                @click="promoteVersion(
                                    $event,
                                    p.id,
                                    v.id,
                                    v.versionNumber)">
                            <vue-feather type="copy" size="20"></vue-feather>
                        </button>
                    </div>
                </div>
            </b-collapse>
        </div>
        <modal :open="!!projectToDelete || !!versionToDelete">
            <h4 v-if="projectToDelete" v-translate="'deleteProject'"></h4>
            <h4 v-if="versionToDelete" v-translate="'deleteVersion'"></h4>
            <template v-slot:footer>
                <button
                    type="button"
                    class="btn btn-red"
                    @click="confirmDelete"
                    v-translate="'ok'"></button>
                <button
                    type="button"
                    class="btn btn-white"
                    @click="cancelDelete"
                    v-translate="'cancel'"></button>
            </template>
        </modal>
        <modal :open="!!versionToPromote">
            <h4 v-html="promoteVersionHeader" id="promoteVersionHeader"></h4>
            <label class="h5" for="new-project-name" v-translate="'enterProjectName'"></label>
            <input type="text"
                   class="form-control"
                   id="new-project-name"
                   v-translate:placeholder="'projectName'"
                   @keyup.enter="confirmPromotion()"
                   v-model="newProjectName"/>
            <div id="promoteNote" class="form-group pt-3">
                <label class="h5" for="promoteNoteControl"><span v-translate="'copyNoteHeader'"></span></label>
                <textarea class="form-control" id="promoteNoteControl" v-model="versionNote" rows="4"></textarea>
            </div>
            <template v-slot:footer>
                <button type="button"
                        class="btn btn-red"
                        :disabled="disableCreate"
                        @click="confirmPromotion()"
                        v-translate="'createProject'"></button>
                <button type="button"
                        class="btn btn-white"
                        @click="cancelPromotion"
                        v-translate="'cancel'"></button>
            </template>
        </modal>
        <modal :open="!!projectToRename">
            <label class="h4" for="rename-project" v-translate="'renameProjectHeader'"></label>
            <input type="text"
                   id="rename-project"
                   class="form-control"
                   v-translate:placeholder="'projectName'"
                   @keyup.enter="confirmRename()"
                   v-model="renamedProjectName">
            <div class="form-group pt-3">
                <label class="h5" for="version-note-rename" v-translate="'renameNoteHeader'"></label>
                <textarea class="form-control"
                          id="version-note-rename"
                          placeholder="Notes"
                          v-model="renameProjectNote" rows="4"></textarea>
            </div>
            <template v-slot:footer>
                <button type="button"
                        class="btn btn-red"
                        :disabled="disableRename"
                        @click="confirmRename()"
                        v-translate="'renameProject'">
                </button>
                <button type="button"
                        class="btn btn-white"
                        @click="cancelRename"
                        v-translate="'cancel'">
                </button>
            </template>
        </modal>

        <modal :open="!!versionNoteToEdit || !!projectNoteToEdit">
            <div v-if="versionNoteToEdit">
                <label class="h4" for="edit-note-id"
                       v-html="editVersionNoteHeader"
                    id="editVersionNoteHeader"></label>
                <div class="pb-3"
                     v-html="editVersionNoteSubHeader"
                     id="editVersionNoteSubHeader"></div>
                <textarea id="edit-note-id" class="form-control"
                          v-model="editedNote"></textarea>
            </div>
            <div v-if="projectNoteToEdit">
                <label class="h4"
                       for="edit-project-note-id"
                       v-translate="'editProjectNoteHeader'"
                       id="editProjectNoteHeader"></label>
                <div class="pb-3"
                     v-html="editProjectNoteSubHeader"
                     id="editProjectNoteSubHeader"></div>
                <textarea id="edit-project-note-id" class="form-control"
                          v-model="editedNote"></textarea>
            </div>
            <template v-slot:footer>
                <button type="button"
                        class="btn btn-red"
                        @click="confirmNoteEditing()"
                        v-translate="'ok'">
                </button>
                <button type="button"
                        class="btn btn-white"
                        @click="cancelNoteEditing"
                        v-translate="'cancel'">
                </button>
            </template>
        </modal>
    </div>
</template>

<script lang="ts">
    import i18next from "i18next";
    import {Project, Version, VersionIds} from "../../types";
    import {BCollapse} from "bootstrap-vue-next";
    import VueFeather from "vue-feather";
    import Modal from "../Modal.vue";
    import {formatDateTime, mapActionByName, mapStateProp, versionLabel} from "../../utils";
    import {projectPayload, versionPayload} from "../../store/projects/actions";
    import {Language} from "../../store/translations/locales";
    import {RootState} from "../../root";
    import ProjectsMixin from "./ProjectsMixin";
    import ShareProject from "./ShareProject.vue";
    import { defineComponent } from "vue";

    const namespace = "projects";

    interface Data {
        projectToDelete: number | null;
        versionToDelete: VersionIds | null;
        renamedProjectName: string;
        projectToRename: number | null;
        versionToPromote: VersionIds | null;
        newProjectName: string;
        selectedVersionNumber: string;
        versionNote: string;
        versionNoteToEdit: VersionIds | null;
        editedNote: string;
        displayProjectName: string;
        renameProjectNote: string;
        projectNoteToEdit: number | null;
        editedProjectNote: string;
        openVersion: Record<number, boolean>
    }

    export default defineComponent({
        extends: ProjectsMixin,
        data(): Data {
            let openVersion: Record<number, boolean> = {};
            if (this.projects) {
                this.projects.forEach(p => {
                    openVersion[p.id] = false
                })
            }
            return {
                projectToDelete: null,
                versionToDelete: null,
                versionToPromote: null,
                newProjectName: "",
                selectedVersionNumber: "",
                projectToRename: null,
                versionNoteToEdit: null,
                editedNote: "",
                versionNote: "",
                displayProjectName: "",
                renameProjectNote: "",
                renamedProjectName: "",
                editedProjectNote: "",
                projectNoteToEdit: null,
                openVersion
            };
        },
        computed: {
            disableCreate: function () {
                return !this.newProjectName;
            },
            disableRename: function () {
                return !this.renamedProjectName;
            },
            promoteVersionHeader: function () {
                return i18next.t("promoteVersionHeader", {
                    version: this.selectedVersionNumber,
                    lng: this.currentLanguage,
                });
            },
            editVersionNoteHeader: function () {
                return i18next.t("editVersionNoteHeader", {
                    version: this.selectedVersionNumber,
                    lng: this.currentLanguage,
                });
            },

            editVersionNoteSubHeader: function () {
                return i18next.t("editVersionNoteSubHeader", {
                    projectName: this.displayProjectName,
                    lng: this.currentLanguage,
                });
            },
            editProjectNoteSubHeader: function () {
                return i18next.t("editProjectNoteSubHeader", {
                    projectName: this.displayProjectName,
                    lng: this.currentLanguage,
                });
            },
            currentLanguage: mapStateProp<RootState, Language>(
                null,
                (state: RootState) => state.language
            ),
            showTooltip() {
                return this.projects.length <= 25;
            }
        },
        methods: {
            format(date: string) {
                return formatDateTime(date);
            },
            loadVersion(event: Event, projectId: number, versionId: string) {
                event.preventDefault();
                this.loadAction({projectId, versionId});
            },
            handleEditVersionNote(projectId: number, versionId: string, versionNumber: number) {
                const project = this.projects.find((project: Project) => project.id === projectId)!
                this.displayProjectName = project.name;
                this.editedNote = project.versions
                    .find((version: Version) => version.versionNumber === versionNumber)!.note || "";

                this.versionNoteToEdit = {projectId, versionId};
                this.selectedVersionNumber = `v${versionNumber}`;
            },
            handleEditProjectNote(projectId: number) {
                const project = this.projects.find((project: Project) => project.id === projectId)!;
                this.displayProjectName = project.name;
                this.editedNote = project.note || "";

                this.projectNoteToEdit = projectId;
            },
            renameProject(event: Event, projectId: number) {
                event.preventDefault();
                this.projects.filter((project: Project) => {
                    if (project.id === projectId) {
                        this.renamedProjectName = project.name
                        this.renameProjectNote = project.note || ""
                    }
                })
                this.projectToRename = projectId;
            },
            cancelRename() {
                this.projectToRename = null;
                this.renamedProjectName = '';
            },
            async confirmRename() {
                if (this.projectToRename) {
                    const projectPayload: projectPayload = {
                        projectId: this.projectToRename!,
                        name: this.renamedProjectName,
                        note: this.renameProjectNote
                    };
                    this.renameProjectAction(projectPayload);
                    this.projectToRename = null;
                    this.renamedProjectName = "";
                }
            },
            cancelNoteEditing() {
                if (this.versionNoteToEdit) {
                    this.versionNoteToEdit = null;
                    this.editedNote = "";

                } else if (this.projectNoteToEdit) {
                    this.projectNoteToEdit = null
                    this.editedNote = "";
                }
            },
            confirmNoteEditing() {
                if (this.versionNoteToEdit) {
                    const versionPayload: versionPayload = {
                        version: this.versionNoteToEdit!,
                        note: this.editedNote
                    };
                    this.updateVersionNoteAction(versionPayload);
                    this.versionNoteToEdit = null;
                    this.editedNote = "";

                } else if (this.projectNoteToEdit) {
                    const payload: projectPayload = {
                        projectId: this.projectNoteToEdit!,
                        note: this.editedNote
                    };
                    this.updateProjectNoteAction(payload);
                    this.projectNoteToEdit = null;
                    this.editedNote = "";
                }
            },
            deleteProject(event: Event, projectId: number) {
                event.preventDefault();
                this.projectToDelete = projectId;
            },
            deleteVersion(event: Event, projectId: number, versionId: string) {
                event.preventDefault();
                this.versionToDelete = {projectId, versionId};
            },
            promoteVersion(
                event: Event,
                projectId: number,
                versionId: string,
                versionNumber: number
            ) {
                event.preventDefault();
                this.projects.filter((project: Project) => {
                    if (project.id === projectId) {
                        this.newProjectName = project.name
                        this.versionNote = project.versions.find(version => version.id === versionId)!.note || "";
                    }
                })
                this.versionToPromote = {projectId, versionId};
                this.selectedVersionNumber = `v${versionNumber}`;
            },
            cancelPromotion() {
                this.versionToPromote = null;
                this.newProjectName = "";
            },
            cancelDelete() {
                this.versionToDelete = null;
                this.projectToDelete = null;
            },
            confirmDelete() {
                if (this.projectToDelete) {
                    this.deleteProjectAction(this.projectToDelete);
                    this.projectToDelete = null;
                } else if (this.versionToDelete) {
                    this.deleteVersionAction(this.versionToDelete);
                    this.versionToDelete = null;
                }
            },
            async confirmPromotion() {
                if (this.versionToPromote && this.newProjectName) {
                    const versionPayload: versionPayload = {
                        version: this.versionToPromote!,
                        name: this.newProjectName,
                        note: this.versionNote
                    };
                    this.promoteVersionAction(versionPayload);
                    this.versionToPromote = null;
                    this.newProjectName = "";
                }
            },
            updateVersionNoteAction: mapActionByName<projectPayload>(namespace, "updateVersionNote"),
            updateProjectNoteAction: mapActionByName<projectPayload>(namespace, "updateProjectNote"),
            renameProjectAction: mapActionByName<projectPayload>(
                namespace,
                "renameProject"
            ),
            promoteVersionAction: mapActionByName<versionPayload>(
                namespace,
                "promoteVersion"
            ),
            createProject: mapActionByName(namespace, "createProject"),
            versionCountLabel(project: Project) {
                const lng = this.currentLanguage;
                return project.versions.length == 1
                    ? `1 ${i18next.t("versionCountLabelSingle", {lng})}`
                    : `${project.versions.length} ${i18next.t("versionCountLabelPlural", {lng})}`;
            },
            versionLabel(version: Version) {
                return versionLabel(version);
            },
            loadAction: mapActionByName<VersionIds>(namespace, "loadVersion"),
            deleteProjectAction: mapActionByName<number>(
                namespace,
                "deleteProject"
            ),
            deleteVersionAction: mapActionByName<VersionIds>(
                namespace,
                "deleteVersion"
            ),

            getTranslatedValue(key: string) {
                return i18next.t(key, {
                    lng: this.currentLanguage,
                });
            },
            toggleVersionMenu(pid: number) {
                this.openVersion[pid] = !this.openVersion[pid]
            },
        },
        components: {
            BCollapse,
            VueFeather,
            Modal,
            ShareProject,
        }
    });
</script>

<style>
    #version-toggle[aria-expanded="true"] > .when-closed,
    #version-toggle[aria-expanded="false"] > .when-open {
        display: none;
    }
</style>
