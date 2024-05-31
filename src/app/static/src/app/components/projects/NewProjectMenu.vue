<template>
    <div>
        <b-dropdown toggle-class="text-decoration-none btn-red btn-lg"
                    end
                    no-caret
                    id="new-project-dropdown">
            <template #button-content>
                <div class="ml-2 mr-3">
                    <vue-feather type="plus" size="30" class="icon align-middle"></vue-feather>
                    <span class="ml-2 align-middle" v-translate="'newProjectDropdown'"></span>
                </div>
            </template>
            <b-dropdown-item id="create-project-button"
                             @click="showCreateProjectModal">
                <vue-feather type="plus" size="20" class="icon align-middle"></vue-feather>
                <span class="align-middle ml-2" v-translate="'createProject'"></span>
            </b-dropdown-item>
            <b-dropdown-item id="load-zip-button"
                             @click="() => loadZip?.click()">
                <vue-feather type="upload" size="20" class="icon align-middle"></vue-feather>
                <span class="align-middle ml-2" v-translate="'loadZip'"></span>
                <input id="upload-zip"
                       v-translate:aria-label="'selectFile'"
                       type="file"
                       style="display: none;" ref="loadZip"
                       @change="showLoadZipModal" accept=".zip">
            </b-dropdown-item>
        </b-dropdown>

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
import {BDropdown, BDropdownItem} from "bootstrap-vue-next";

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
        NewProjectCreate,
        BDropdown,
        BDropdownItem
    }
})
</script>
