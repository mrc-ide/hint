<template>
    <div>
        <div class="d-flex align-items-center">
            <label :class="['fw-bold', { 'disabled-label': disabled }]" v-translate="label"></label>
            <span v-if="labelTooltip"
                v-tooltip="{
                        content: `<dl>${labelTooltip}</dl>`,
                        // Keep the tooltip open when mouse over the popup
                        popperTriggers: ['hover'],
                    }">
                <vue-feather type="help-circle" size="20" class="ms-1"></vue-feather>
            </span>
        </div>
        <single-select v-if="!multiple"
                       :options="options"
                       :model-value="treeselectValue"
                       @update:model-value="input"
                       :placeholder="placeholder"/>
        <multi-select v-if="multiple"
                      :options="options"
                      :model-value="treeselectValue"
                      @update:model-value="input"
                      :placeholder="placeholder"/>
    </div>
</template>

<script lang="ts">
    import i18next from "i18next";
    import {flattenOptions, mapStateProp} from "../../utils";
    import {RootState} from "../../root";
    import {Language} from "../../store/translations/locales";
    import {FilterOption} from "../../generated";
    import VueFeather from "vue-feather";
    import { PropType, defineComponent } from "vue";
    import { SingleSelect, MultiSelect } from "@reside-ic/vue-nested-multiselect";

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
                return this.disabled ? null : this.multiple ? this.value : this.value[0];
            },
            currentLanguage: mapStateProp<RootState, Language>(null,
                (state: RootState) => state.language),
            placeholder() {
                const key = this.disabled ? "notUsed" : "select";
                return i18next.t(key, this.currentLanguage)
            },
            labelTooltip() {
                return this.options.reduce(
                    (lines: string[], option: FilterOption) => lines.concat(option.description ? `<dt>${option.label}</dt><dd>${option.description}</dd>` : []),
                    [] as string[]
                ).join('');
            }
        },
        methods: {
            input(nodes: FilterOption[] | FilterOption) {
                if (!this.disabled) {
                    if (!this.multiple) {
                        this.$emit("update:filter-select", [nodes]);
                    } else {
                        this.$emit("update:filter-select", nodes);
                    }
                }
            },
        },
        components: {
            VueFeather,
            SingleSelect,
            MultiSelect
        }
    });
</script>
