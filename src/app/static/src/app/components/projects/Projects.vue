<template>
    <div>
        <div v-if="!loading" id="projects-content" class="row">
            <div id="projects-header" class="col d-flex w-100">
                <div id="projects-title" class="lead">
                    <h1 class="mb-1" v-translate="'projects'"></h1>
                    <span v-if="currentProject">
                        <a v-translate="'projectsHeaderReturn'"
                        href="#" @click="handleCurrentProjectClick"></a> ({{ currentProject.name }})
                    </span>
                </div>
                <div class="flex-grow-1"></div>
                <new-project-menu></new-project-menu>
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
    import {mapActionByName, mapGetterByName, mapStateProps} from "../../utils";
    import {ProjectsState} from "../../store/projects/projects";
    import ErrorAlert from "../ErrorAlert.vue";
    import LoadingSpinner from "../LoadingSpinner.vue";
    import ProjectHistory from "./ProjectHistory.vue";
    import NewProjectMenu from "./NewProjectMenu.vue";
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
            isGuest: mapGetterByName(null, "isGuest")
        },
        methods: {
            handleCurrentProjectClick: function (e: Event) {
                e.preventDefault();
                this.$router.push('/');
            },
            getProjects: mapActionByName(namespace, "getProjects")
        },
        mounted() {
            if (!this.isGuest) {
                this.getProjects();
            }
        },
        components: {
            NewProjectMenu,
            ErrorAlert,
            LoadingSpinner,
            ProjectHistory
        }
    });
</script>
