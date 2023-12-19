<template>
    <div>
        <div class="input-group custom-file-button mb-2">
            <input type="file"
                   style="display: none;"
                   :ref="name"
                   :id="name"
                   :accept="accept"
                   :disabled="uploading"
                   v-on:change="handleFileSelect"/>
            <label :for="name"
                   class="input-group-text custom-file-button-label"
                   :class="{'uploading': uploading}">
                <span v-translate="'selectNewFile'"></span>
            </label>
        </div>
        <reset-confirmation v-if="!dataExplorationMode"
                            :discard-step-warning="modelOptions"
                            :continue-editing="uploadSelectedFile"
                            :cancel-editing="cancelEdit"
                            :open="showUploadConfirmation"></reset-confirmation>
    </div>
</template>

<script lang="ts">
    import ResetConfirmation from "../resetConfirmation/ResetConfirmation.vue";
    import ResetConfirmationMixin from "../resetConfirmation/ResetConfirmationMixin"
    import {Step} from "../../types";
    import { PropType, defineComponent } from "vue";

    interface Data {
        showUploadConfirmation: boolean
        modelOptions: number
    }

    export default defineComponent({
        extends: ResetConfirmationMixin,
        props: {
            upload: {
                type: Function as PropType<(formData: FormData) => void>,
                required: true
            },
            accept: {
                type: String,
                required: true
            },
            name: {
                type: String,
                required: true
            },
            uploading: {
                type: Boolean,
                required: true
            }
        },
        data(): Data {
            return {
                showUploadConfirmation: false,
                modelOptions: Step.ModelOptions
            }
        },
        components: {
            ResetConfirmation
        },
        methods: {
            handleFileSelect() {
                if (this.editsRequireConfirmation) {
                    this.showUploadConfirmation = true;
                } else {
                    this.uploadSelectedFile();
                }
            },
            uploadSelectedFile() {
                const fileInput = this.$refs[this.name] as HTMLInputElement;
                const selectedFile = fileInput.files![0]!;
                const formData = new FormData();
                formData.append('file', selectedFile);
                this.$emit("uploading");
                this.upload(formData);
                fileInput.value = "";
                this.showUploadConfirmation = false;
            },
            cancelEdit() {
                const fileInput = this.$refs[this.name] as HTMLInputElement;
                fileInput.value = "";
                this.showUploadConfirmation = false
            }
        }

    })
</script>

<style scoped>
.custom-file-button input[type=file] {
  margin-left: -2px !important;
}

.custom-file-button input[type=file]::-webkit-file-upload-button {
  display: none;
}

.custom-file-button input[type=file]::file-selector-button {
  display: none;
}

.custom-file-button-label {
    width: 100%;
}

.custom-file-button-label:hover {
    cursor: pointer;
}
</style>