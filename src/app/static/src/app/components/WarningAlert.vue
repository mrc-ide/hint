<template>
    <div v-if="showAlert">
        <div class="content alert alert-warning pt-0">
            <button @click="$emit('clear-warnings')" type="button" class="btn-close pt-2 float-end small mt-1" v-translate:aria-label="'close'">
            </button>
            <warning v-for="(value, key) in filteredWarnings" :key="key" :origin="`${key}`" :warnings="value" :max-lines="maxLines"></warning>
        </div>
    </div>
</template>

<script lang="ts">
    import { PropType, defineComponent } from "vue";
    import { Warning as WarningType } from "../generated";
    import { Dict } from "../types";
    import Warning from "./Warning.vue"

    export default defineComponent({
        name: "WarningAlert",
        props: {
            warnings: {
                type: Object as PropType<Dict<WarningType[]>>,
                required: true
            },
            maxLines: {
                default: 2,
                required: false,
                type: Number
            },
        },
        computed: {
            filteredWarnings(){
                const anObject: Dict<WarningType[]> = {}
                Object.keys(this.warnings).forEach((k) => {
                    if (this.warnings[k].length > 0){
                        anObject[k] = this.warnings[k]
                    }
                });
                return anObject
            },
            showAlert(){
                return Object.keys(this.warnings).some(key => this.warnings[key].length > 0)
            },
        },
        components: {
            Warning
        }
    })
</script>



