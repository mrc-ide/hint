<template>
    <div class="form-group">
        <label class="fw-bold mb-0" v-translate="label"></label>
        <span id="required" v-if="required"
              class="ms-1"
              style="font-size: small;"
              :class="existingFileName? '': 'text-danger'">(<span v-translate="'required'"></span>)
        </span>
        <tick color="#e31837" v-if="valid" width="20px"></tick>
        <span class="color-red" v-if="fromADR">ADR</span>
        <loading-spinner v-if="uploading" size="xs"></loading-spinner>
        <br/>
        <slot></slot>
        <label v-if="existingFileName || error" class="file-name">
            <span v-if="existingFileName">
                <strong v-translate="'file'"></strong>: {{ existingFileName }}
            </span>
            <a class="small float-end"
               href="#"
               v-on:click="handleFileDelete"
               v-translate="'remove'"></a>
        </label>
        <file-upload :name="name"
                     :accept="accept"
                     :upload="upload"
                     :uploading="uploading"
                     @uploading="handleUploading"></file-upload>
        <error-alert v-if="hasError" :error="error!"></error-alert>
        <reset-confirmation v-if="!dataExplorationMode"
                            :discard-step-warning="modelOptions"
                            :continue-editing="deleteSelectedFile"
                            :cancel-editing="cancelEdit"
                            :open="showDeleteConfirmation"></reset-confirmation>
    </div>
</template>
<script lang="ts">
    import FileUpload from "./FileUpload.vue";
    import LoadingSpinner from "../LoadingSpinner.vue";
    import Tick from "../Tick.vue";
    import ErrorAlert from "../ErrorAlert.vue";
    import ResetConfirmation from "../resetConfirmation/ResetConfirmation.vue";
    import {Error} from "../../generated";
    import ResetConfirmationMixin from "../resetConfirmation/ResetConfirmationMixin";
    import {Step} from "../../types";
    import { PropType, defineComponent } from "vue";

    interface Data {
        uploading: boolean
        showDeleteConfirmation: boolean
        modelOptions: number
    }

    export default defineComponent({
        extends: ResetConfirmationMixin,
        name: "FileSelect",
        props: {
            upload: {
                type: Function as PropType<(formData: FormData) => void>,
                required: true
            },
            deleteFile: {
                type: Function as PropType<() => void>,
                required: true
            },
            accept: {
                type: String,
                required: true
            },
            label: {
                type: String,
                required: true
            },
            valid: {
                type: Boolean,
                required: true
            },
            error: {
                type: [Object, null] as PropType<Error | null>,
                required: false
            },
            existingFileName: {
                type: [String, null] as PropType<string | null>,
                required: true
            },
            fromADR: {
                type: Boolean,
                required: false
            },
            name: {
                type: String,
                required: true
            },
            required: {
                type: Boolean,
                required: false
            }
        },
        data(): Data {
            return {
                uploading: false,
                showDeleteConfirmation: false,
                modelOptions: Step.ModelOptions
            }
        },
        computed: {
            hasError: function () {
                return !!this.error
            }
        },
        components: {
            FileUpload,
            LoadingSpinner,
            Tick,
            ErrorAlert,
            ResetConfirmation
        },
        methods: {
            handleUploading() {
                this.uploading = true;
            },
            handleFileDelete() {
                if (this.editsRequireConfirmation) {
                    this.showDeleteConfirmation = true;
                } else {
                    this.deleteSelectedFile();
                }
            },
            deleteSelectedFile() {
                this.deleteFile();
                this.showDeleteConfirmation = false;
            },
            cancelEdit() {
                this.showDeleteConfirmation = false;
            }
        },
        watch: {
            valid: function (newVal: boolean) {
                if (newVal) {
                    this.uploading = false;
                }
            },
            error: function (newVal: string) {
                if (newVal) {
                    this.uploading = false;
                }
            }
        }
    });
</script>
