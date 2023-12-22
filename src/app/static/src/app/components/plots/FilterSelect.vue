<template>
    <div>
        <div class="d-flex align-items-center">
            <label :class="['font-weight-bold', { 'disabled-label': disabled }]" v-translate="label"></label>
            <span v-if="labelTooltip"
                v-tooltip="{
                        content: `<dl>${labelTooltip}</dl>`,
                        // Keep the tooltip open when mouse over the popup
                        popperTriggers: ['hover'],
                    }">
                <vue-feather type="help-circle" size="20" class="ml-1"></vue-feather>
            </span>
        </div>
        <hint-tree-select :multiple="multiple"
                     :clearable="false"
                     :options="options"
                     :model-value="treeselectValue"
                     :disabled="disabled"
                     :placeholder="placeholder"
                     @update:model-value="input"
                     @select="select"
                     @deselect="deselect"></hint-tree-select>
    </div>
</template>

<script lang="ts">
    import i18next from "i18next";
    import HintTreeSelect from "../HintTreeSelect.vue";
    import {flattenOptions, mapStateProp} from "../../utils";
    import {RootState} from "../../root";
    import {Language} from "../../store/translations/locales";
    import {FilterOption} from "../../generated";
    import VueFeather from "vue-feather";
    import { PropType, defineComponent } from "vue";

    export default defineComponent({
        name: "FilterSelect",
        props: {
            multiple: {
                type: Boolean,
                required: false
            },
            label: {
                type: String,
                required: true
            },
            disabled: {
                type: Boolean,
                required: false,
                default: false
            },
            options: {
                type: Array as PropType<FilterOption[]>,
                required: true
            },
            value: {
                type: [Array, String] as PropType<string | string[]>,
                required: true
            }
        },
        data() {
            const idArray = Array.isArray(this.value) ? this.value : [this.value];
            const flatOptions = Object.values(flattenOptions(this.options));
            const selected = flatOptions.filter((o: FilterOption) => idArray.includes(o.id));
            return {
                selectedOptions: selected
            }
        },
        computed: {
            treeselectValue() {
                return this.disabled ? null : this.value;
            },
            currentLanguage: mapStateProp<RootState, Language>(null,
                (state: RootState) => state.language),
            placeholder() {
                const key = this.disabled ? "notUsed" : "select";
                return i18next.t(key, this.currentLanguage) as string
            },
            labelTooltip() {
                return this.options.reduce(
                    (lines: string[], option: FilterOption) => lines.concat(option.description ? `<dt>${option.label}</dt><dd>${option.description}</dd>` : []),
                    [] as string[]
                ).join('');
            }
        },
        methods: {
            input(value: string[]) {
                if (!this.disabled && value != this.value) {
                    this.$emit("input", value);
                }
            },
            select(node: FilterOption) {
                if (!this.multiple) {
                    this.selectedOptions = [node]
                } else {
                    this.selectedOptions.push(node);
                }
                this.$emit("update:filter-select", this.selectedOptions);
            },
            deselect(node: FilterOption) {
                this.selectedOptions = this.selectedOptions.filter((n: any) => n.id != node.id);
                this.$emit("update:filter-select", this.selectedOptions);
            }
        },
        components: {
            HintTreeSelect,
            VueFeather
        }
    });
</script>
