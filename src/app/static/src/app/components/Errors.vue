<template>
    <div v-if="hasErrors" class="container">
        <div class="content">
            <div class="alert alert-danger alert-dismissible fade-show" role="alert">
                <p v-for="(error, index) in errors" :key="index">
                    {{ error }}
                </p>
                <button type="button" class="btn-close small mt-1" @click="dismissAll">
                </button>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
    import { defineComponent } from "vue";
    import {ErrorsState} from "../store/errors/errors";
    import {mapMutationByName, mapStateProps} from "../utils";
    import {ErrorsMutation} from "../store/errors/mutations";

    const namespace = "errors";

    export default defineComponent({
        name: "Errors",
        props: {
            title: {
                type: String,
                required: false
            }
        },
        computed: {
            ...mapStateProps(namespace, {
                errors: (state: ErrorsState) => {
                    const messages = state.errors.map(e => e.detail ? e.detail : e.error);
                    return Array.from(new Set(messages))
                }
            }),
            hasErrors: function () {
                return this.errors.length > 0
            }
        },
        methods: {
            dismissAll: mapMutationByName(namespace, ErrorsMutation.DismissAll)
        }
    })
</script>



