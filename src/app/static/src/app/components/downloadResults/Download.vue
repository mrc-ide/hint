<template>
    <div id="download">
        <h4 v-translate="translateKey.header"></h4>
        <button class="btn btn-lg my-3" :class="disabled ? 'btn-secondary' : 'btn-red'"
                :disabled="disabled"
                @click="download">
            <span v-translate="translateKey.button"></span>
            <vue-feather type="download" size="20" class="icon ms-2" style="margin-top: -4px;"></vue-feather>
        </button>
        <div>
            <download-status id="progress"
                             :translate-key="'preparing'"
                             :preparing="file.preparing"/>
        </div>
        <error-alert id="error" v-if="file.error" :error="file.error"></error-alert>
    </div>
</template>

<script lang="ts">
    import DownloadStatus from "./DownloadStatus.vue";
    import ErrorAlert from "../ErrorAlert.vue";
    import VueFeather from "vue-feather";
    import { defineComponent } from "vue";


    export default defineComponent({
        name: "Download",
        components: {
            VueFeather,
            ErrorAlert,
            DownloadStatus
        },
        props: {
            file: {
                required: true,
                type: Object
            },
            translateKey: {
                required: true,
                type: Object
            },
            disabled: {
                required: true,
                type: Boolean
            }
        },
        methods: {
            download() {
                this.$emit("trigger-download")
            }
        }
    })
</script>
