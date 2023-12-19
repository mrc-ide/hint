<template>
    <div>
        <div v-if="!loading" id="projects-content" class="row">
            <p class="text-muted col" v-translate="'projectDescription'"></p>
            <div id="projects-header" class="lead col-12">
                <label for="new-project" v-translate="'projectsHeaderCreate'"></label>
                <span v-if="currentProject">
                    <span v-translate="'or'"></span>
                    <a v-translate="'projectsHeaderReturn'"
                       href="#" @click="handleCurrentProjectClick"></a> ({{ currentProject.name }})
                </span>
            </div>
            <div class="mb-3 col-6 clearfix">
                <input type="text"
                       id="new-project"
                       class="form-control"
                       v-translate:placeholder="'projectName'"
                       @keyup.enter="createProject({name: newProjectName})"
                       v-model="newProjectName">
                <div class="invalid-feedback d-inline"
                     v-translate="'uniqueProjectName'"
                     v-if="invalidName(newProjectName)"></div>
                <button type="button"
                        class="btn btn-red mt-2 float-end"
                        :disabled="disableCreate"
                        @click="createProject({name: newProjectName})"
                        v-translate="'createProject'">
                </button>
            </div>
            <div class="my-3 col-12">
                <project-history></project-history>
            </div>
            <error-alert v-if="hasError" :error="error!"></error-alert>
        </div>
        <div v-if="loading" class="text-center">
            <loading-spinner size="lg"></loading-spinner>
            <h2 id="loading-message" v-translate="'loadingProject'"></h2>
        </div>
    </div>
</template>

<script lang="ts">
    import {mapActionByName, mapGetterByName, mapStatePropByName, mapStateProps} from "../../utils";
    import {ProjectsState} from "../../store/projects/projects";
    import ErrorAlert from "../ErrorAlert.vue";
    import LoadingSpinner from "../LoadingSpinner.vue";
    import ProjectHistory from "./ProjectHistory.vue";
    import ProjectsMixin from "./ProjectsMixin";
    import { defineComponent } from "vue";

    const namespace = "projects";

    export default defineComponent({
        extends: ProjectsMixin,
        computed: {
            ...mapStateProps(namespace, {
                currentProject: (state: ProjectsState) => state.currentProject,
                error: (state: ProjectsState) => state.error,
                hasError: (state: ProjectsState) => !!state.error,
                loading: (state: ProjectsState) => state.loading
            }),
            uploadProjectName: mapStatePropByName<string>("load", "projectName"),
            isGuest: mapGetterByName(null, "isGuest"),
            disableCreate: function () {
                return !this.newProjectName || this.invalidName(this.newProjectName);
            }
        },
        methods: {
            handleCurrentProjectClick: function (e: Event) {
                e.preventDefault();
                this.$router.push('/');
            },
            createProject: mapActionByName(namespace, "createProject"),
            getProjects: mapActionByName(namespace, "getProjects")
        },
        mounted() {
            this.getProjects();
        },
        components: {
            ErrorAlert,
            LoadingSpinner,
            ProjectHistory
        }
    });
</script>
