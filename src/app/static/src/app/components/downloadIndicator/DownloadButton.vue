<template>
    <div id="download-button" class="d-inline-block">
        <button class="btn btn-sm mt-2" :class="disabled ? 'btn-secondary' : 'btn-red'"
                :disabled="disabled">
            <span v-translate="name"></span>
            <vue-feather type="download"
                         size="20"
                         class="icon ms-2 align-middle"></vue-feather>
        </button>
    </div>
</template>

<script lang="ts">
    import { defineComponent } from "vue";
    import VueFeather from "vue-feather";

    export default defineComponent({
        name: "downloadButton",
        components: {
            VueFeather
        },
        props: {
            name: {
                type: String,
                required: true
            },
            disabled: {
                type: Boolean,
                required: true
            }
        }
    });
</script>
