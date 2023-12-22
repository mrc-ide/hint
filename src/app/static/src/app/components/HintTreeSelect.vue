<template>
    <treeselect
    :key="reRender"
    :options="options"
    :model-value="modelValue"
    :multiple="multiple"
    :disabled="disabled"
    :clearable="clearable"
    :placeholder="placeholder"
    @update:model-value="input">
    <!-- way to pass down all slots -->
    <template v-for="(_, slot) in $slots" v-slot:[slot]="scope">
        <slot :name="slot" v-bind="scope || {}" />
    </template>
    </treeselect>
</template>
<script lang="ts">
    import { PropType, defineComponent } from "vue";
    import Treeselect from "@reside-ic/vue3-treeselect";

    // This wrapper was necessary as this third party treeselect was not
    // updating its value when an external update was being made, e.g.
    // when dataSource changed in Choropleth tab, the filters' values
    // would not update.
    
    // Here we force this treeselect component to re-render if an external
    // change has been made. If an internal change is made (like user
    // selecting a value) then the lastEmittedValue keeps track of it so
    // we can prevent re-render.

    export default defineComponent({
        components: {
            Treeselect
        },
        props: {
            options: {
                type: Array,
                required: true
            },
            modelValue: {
                type: [Array, String] as PropType<string | string[] | null>,
            },
            multiple: {
                type: Boolean
            },
            disabled: {
                type: Boolean,
                required: false,
                default: false
            },
            clearable: {
                type: Boolean,
                required: false,
                default: false
            },
            placeholder: {
                type: String,
                required: false,
                default: ""
            }
        },
        data() {
            return {
                // this is an integer that toggles between 1 and 0 to cause
                // key to change and force re-render
                reRender: 0,
                lastEmittedValue: "" as string | null | undefined
            }
        },
        methods: {
            input(value: string) {
                this.lastEmittedValue = value;
                this.$emit("update:model-value", value)
            }
        },
        watch: {
            modelValue: {
                handler: function(newVal) {
                    // Multi-select component already seems to work fine so we want to
                    // not re-render those. We only want to re-render if:
                    // newVal === null : to replace value with "Not used" in treeselect
                    // newValStringCase : to re-render when we pass string into treeselect
                    // newValArrayCase : to re-render when we pass array of length 1 into treeselect

                    // Note: the lastEmittedValue is always a string but from our state we may
                    // pass in "value" or ["value"] so these checks are necessary

                    const newValStringCase = (typeof newVal === "string") && this.lastEmittedValue !== newVal;
                    const newValArrayCase = newVal instanceof Array && newVal.length === 1 && this.lastEmittedValue !== newVal[0];
                    
                    if (!this.multiple) {
                        if (newVal === null || newValStringCase || newValArrayCase) {
                            setTimeout(() => {
                                this.reRender = 1 - this.reRender;
                            }, 0)
                        }
                    }
                },
                deep: true
            }
        }
    })
</script>
