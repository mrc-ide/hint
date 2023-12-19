<template>
    <div id="upload-progress">
        <modal :open="openModal">
            <div class="mt-3 d-flex align-items-end h4">
                <div class="d-flex align-items-center height-40 me-2">
                    <span id="upload-header" v-translate="'uploadFromZip'"></span>
                </div>
                <loading-spinner size="xs"></loading-spinner>
            </div>
            <div class="progress mt-2">
                <div class="progress-bar progress-bar-striped progress-bar-animated bg-danger"
                     role="progressbar"
                     aria-valuenow="100"
                     aria-valuemin="0"
                     aria-valuemax="100"
                     style="width: 100%"/>
            </div>
            <span id="progress-message" class="mt-2" v-translate="'uploading'"></span>
            <template v-slot:footer>
                <button id="cancel-upload-progress"
                        type="button"
                        class="btn btn-white"
                        @click="cancel"
                        v-translate="'cancel'">
                </button>
            </template>
        </modal>
    </div>
</template>

<script lang="ts">
    import Modal from "../Modal.vue";
    import LoadingSpinner from "../LoadingSpinner.vue";
    import { defineComponent, PropType } from "vue";

    export default defineComponent({
        name: "UploadProgress",
        props: {
            openModal: Boolean,
            cancel: {
                type: Function as PropType<(payload: MouseEvent) => void>,
                required: true
            }
        },
        components: {
            LoadingSpinner,
            Modal
        }
    })
</script>
