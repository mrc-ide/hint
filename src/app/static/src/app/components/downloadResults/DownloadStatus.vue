<template>
    <div>
        <div v-if="preparing" id="preparing" class="d-flex align-items-end">
            <loading-spinner size="xs"></loading-spinner>
            <div class="d-flex align-items-center height-40 ms-2'">
                <span v-translate="translateKey"></span>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
    import { defineComponent } from "vue";
    import LoadingSpinner from "../LoadingSpinner.vue";

    interface Props {
        preparing: boolean,
        translateKey: string
    }
    export default defineComponent({
        name: "DownloadStatus",
        components: {
            LoadingSpinner
        },
        props: {
            preparing: {
              required: true,
              type: Boolean
          },
            translateKey: {
              required: true,
              type: String
            }
        }
    })
</script>