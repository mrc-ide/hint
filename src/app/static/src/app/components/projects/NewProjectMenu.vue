<template>
    <div>
        <div class="dropdown">
            <button type="button"
                    id="new-project-dropdown"
                    class="btn btn-red btn-lg dropdown-toggle-no-caret"
                    data-toggle="dropdown"
                    aria-haspopup="true"
                    aria-expanded="false">
                <div class="ml-2 mr-3">
                    <vue-feather type="plus" size="30" class="icon align-middle"></vue-feather>
                    <span class="ml-2 align-middle" v-translate="'newProjectDropdown'"></span>
                </div>
            </button>
            <div class="dropdown-menu dropdown-menu-right" aria-labelledby="new-project-dropdown">
                <button id="create-project-button"
                        class="dropdown-item mb-0"
                        type="button"
                        @click="showCreateProjectModal">
                    <vue-feather type="plus" size="20" class="icon ml-1 align-middle"></vue-feather>
                    <span class="align-middle ml-2" v-translate="'createProject'"></span>
                </button>
                <button id="load-zip-button"
                        class="dropdown-item mb-0"
                        type="button"
                        @click="() => loadZip?.click()">
                    <vue-feather type="upload" size="20" class="icon ml-1 align-middle"></vue-feather>
                    <span class="align-middle ml-2" v-translate="'loadZip'"></span>
                </button>
                <input id="upload-zip"
                       v-translate:aria-label="'selectFile'"
                       type="file"
                       style="display: none;" ref="loadZip"
                       @change="showLoadZipModal" accept=".zip">
            </div>
        </div>

        <new-project-create :open-modal="showUploadProjectModal"
                            :submit-create="handleCreateProject"
                            :cancel-create="cancelCreateProject"/>
    </div>
</template>
<script lang="ts">
import VueFeather from "vue-feather";
import {getFormData} from "../../utils";
import NewProjectCreate from "../load/NewProjectCreate.vue";
import {defineComponent, ref} from "vue";
import {useStore} from "vuex";
import {CreateProjectPayload} from "../../store/projects/actions";
import {RootState} from "../../root";

enum NewProjectType {
    NEW = "new",
    ZIP = "zip",
}

export default defineComponent({
    setup() {
        const showUploadProjectModal = ref(false);
        const newProjectType = ref<NewProjectType | null>(null);
        const fileToLoad = ref<File | null>(null);
        const loadZip = ref<HTMLInputElement | null>(null);

        const store = useStore<RootState>();

        const createProject = (payload: CreateProjectPayload) => store.dispatch("projects/createProject", payload);

        const preparingRehydrate =  (payload: FormData) => store.dispatch("load/preparingRehydrate", payload);

        const showCreateProjectModal = () => {
            newProjectType.value = NewProjectType.NEW;
            showUploadProjectModal.value = true
        }

        const clearLoadZipInput = () => {
            // clearing value because browser does not
            // allow selection of the same file twice
            if (loadZip.value) {
                loadZip.value.value = ""
            }
        }

        const showLoadZipModal = () => {
            if (loadZip.value && loadZip.value.files && loadZip.value.files.length > 0) {
                const file = loadZip.value.files[0];
                clearLoadZipInput();
                fileToLoad.value = file;
                newProjectType.value = NewProjectType.ZIP;
                showUploadProjectModal.value = true;
            }
        }

        const handleCreateProject = () => {
            showUploadProjectModal.value = false;
            if (newProjectType.value === NewProjectType.NEW) {
                createProject({name: store.state.load.newProjectName});
            } else if (newProjectType.value === NewProjectType.ZIP && fileToLoad.value) {
                preparingRehydrate(getFormData(fileToLoad.value));
            }
        }

        const cancelCreateProject = () => {
            showUploadProjectModal.value = false;
            if (newProjectType.value === NewProjectType.ZIP) {
                clearLoadZipInput();
            }
        }

        return {
            showUploadProjectModal,
            showCreateProjectModal,
            showLoadZipModal,
            handleCreateProject,
            cancelCreateProject,
            loadZip,
            fileToLoad,
            clearLoadZipInput
        }
    },


    components: {
        VueFeather,
        NewProjectCreate
    }
})
</script>
