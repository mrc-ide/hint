import {ScaleType} from "../../store/plottingSelections/plottingSelections";
<template>
    <div v-if="show" class="pt-2 ps-3">
        <div class="static-container">
            <div><span v-translate="'static'"></span></div>
            <div class="ms-2">
                <div class="form-check static-default">
                    <label class="form-check-label">
                        <input id="type-input-default" class="form-check-input" type="radio" :name="scaleTypeGroup"
                               :value="ScaleType.Default"
                               v-model="scaleToAdjust.type" @change="update">
                        <span v-translate="'default'"></span>
                    </label>
                </div>
                <div class="form-check mt-1 static-custom">
                    <label class="form-check-label">
                        <input id="type-input-custom" class="form-check-input" type="radio" :name="scaleTypeGroup"
                               :value="ScaleType.Custom"
                               v-model="scaleToAdjust.type" @change="update">
                        <span v-translate="'custom'"></span>
                    </label>
                </div>

                <div class="mt-2 ms-2 static-custom-values">
                    <form novalidate>
                        <div class="row p-0 mb-2">
                            <label for="custom-min-input" class="col col-form-label col-2"><span v-translate="'min'"></span></label>
                            <div class="col pt-1 pe-1">
                                <input id="custom-min-input" type="number" :step="step"
                                       v-model.number="scaleToAdjust.customMin"
                                       :max="scaleToAdjust.customMax"
                                       @change="update" @keyup="update" :disabled="disableCustom">
                            </div>
                            <p v-if="scaleToAdjust.customMin" class="col col-form-label ps-0">{{ scaleText}}</p>
                        </div>
                        <div class="row">
                            <label class="col col-form-label col-2" for="custom-max-input"><span v-translate="'max'"></span></label>
                            <div class="col pt-1 pe-1">
                                <input id="custom-max-input" type="number" :step="step"
                                       v-model.number="scaleToAdjust.customMax"
                                       :min="scaleToAdjust.customMin"
                                       @change="update" @keyup="update" :disabled="disableCustom">
                            </div>
                            <p v-if="scaleToAdjust.customMax" class="col col-form-label ps-0">{{ scaleText}}</p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
        <div class="dynamic-container">
            <div class="mt-1"><span v-translate="'fitToCurrentDataset'"></span></div>
            <div class="ms-2">
                <div class="form-check mt-1">
                    <label class="form-check-label">
                        <input id="type-input-dynamic-full" class="form-check-input" type="radio" :name="scaleTypeGroup"
                               :value="ScaleType.DynamicFull"
                               v-model="scaleToAdjust.type" @change="update">
                        <span v-translate="'entireDataset'"></span>
                    </label>
                </div>
            </div>
            <div class="ms-2">
                <div class="form-check mt-1">
                    <label class="form-check-label">
                        <input id="type-input-dynamic-filtered" class="form-check-input" type="radio" :name="scaleTypeGroup"
                               :value="ScaleType.DynamicFiltered"
                               v-model="scaleToAdjust.type" @change="update">
                        <span v-translate="'filteredDataset'"></span>
                    </label>
                </div>
            </div>
            <div class="text-danger">{{ invalidMsg }}</div>
        </div>
    </div>
</template>

<script lang="ts">
    import {ScaleSettings, ScaleType} from "../../store/plottingSelections/plottingSelections";
    import i18next from "i18next";
    import { PropType, defineComponent } from "vue";


    export default defineComponent({
        name: "MapAdjustScale",
        props: {
            name: {
                type: String,
                required: true
            },
            show: {
                type: Boolean,
                required: true
            },
            scale: {
                type: Object as PropType<ScaleSettings>,
                required: true
            },
            step: {
                type: Number,
                required: true
            },
            metadata: {
                type: Object as PropType<any>,
                required: false
            }
        },
        data(): any {
            return {
                scaleToAdjust: {...this.scale},
                ScaleType: ScaleType
            };
        },
        computed: {
            invalidMsg() {
                let result = null;
                if (this.scaleToAdjust.type == ScaleType.Custom) {
                    if (this.scaleToAdjust.customMin >= this.scaleToAdjust.customMax) {
                        result = i18next.t("maxMustBeGreaterThanMin");
                    }
                }

                return result;
            },
            disableCustom() {
                return this.scaleToAdjust.type != ScaleType.Custom;
            },
            scaleText(){
                const { format, scale, accuracy} = this.metadata
                if (!format.includes('%') && scale !== 1){
                    return `x ${scale}`
                } else return ''
            },
            scaleTypeGroup() { return `${this.name}-scaleType`; }
        },
        methods: {
            update: function () {
                if (this.invalidMsg == null) {
                    this.$emit("update", this.scaleToAdjust)
                }
            }
        },
        watch: {
            scale: function () {
                this.scaleToAdjust = {...this.scale};
            }
        }
    });
</script>
