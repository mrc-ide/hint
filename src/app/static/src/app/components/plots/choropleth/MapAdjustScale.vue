<template>
    <div class="p-3 ml-2">
        <div class="form-check dynamic-filtered">
            <label class="form-check-label">
                <input id="type-input-dynamic-filtered" class="form-check-input" type="radio" :name="scaleTypeGroup"
                       :value="scaleType.DynamicFiltered"
                       :checked="selectedScale.type === scaleType.DynamicFiltered"
                       @change="updateOutputColourScale({...selectedScale, type: parseInt($event.target.value)})">
                <span class="scale-type-radio" v-translate="'filteredDataset'"></span>
            </label>
        </div>
        <div class="form-check mt-1 static-default">
            <label class="form-check-label">
                <input id="type-input-default" class="form-check-input" type="radio" :name="scaleTypeGroup"
                       :value="scaleType.Default"
                       :checked="selectedScale.type === scaleType.Default"
                       @change="updateOutputColourScale({...selectedScale, type: parseInt($event.target.value)})">
                <span class="scale-type-radio" v-translate="'default'"></span>
            </label>
        </div>
        <div class="form-check mt-1 static-custom">
            <label class="form-check-label">
                <input id="type-input-custom" class="form-check-input" type="radio" :name="scaleTypeGroup"
                       :value="scaleType.Custom"
                       :checked="selectedScale.type === scaleType.Custom"
                       @change="updateOutputColourScale({...selectedScale, type: parseInt($event.target.value)})">
                <span class="scale-type-radio" v-translate="'custom'"></span>
            </label>

            <div class="mt-2 static-custom-values">
                <form novalidate>
                    <div class="row p-0 mb-2">
                        <label for="custom-min-input" class="col col-form-label col-2"><span v-translate="'min'"></span></label>
                        <div class="col pt-1 pr-1">
                            <input id="custom-min-input" type="number" :step="colourScaleStep"
                                   :value="selectedScale.customMin"
                                   @change="updateOutputColourScale({...selectedScale, customMin: parseFloat($event.target.value)})"
                                   :max="selectedScale.customMax"
                                   :disabled="disableCustom">
                        </div>
                        <p v-if="selectedScale.customMin" class="col col-form-label pl-0">{{ scaleText }}</p>
                    </div>
                    <div class="row">
                        <label class="col col-form-label col-2" for="custom-max-input"><span v-translate="'max'"></span></label>
                        <div class="col pt-1 pr-1">
                            <input id="custom-max-input" type="number" :step="colourScaleStep"
                                   :value="selectedScale.customMax"
                                   @change="updateOutputColourScale({...selectedScale, customMax: parseFloat($event.target.value)})"
                                   :min="selectedScale.customMin"
                                   :disabled="disableCustom">
                        </div>
                        <p v-if="selectedScale.customMax" class="col col-form-label pl-0">{{ scaleText }}</p>
                    </div>
                </form>
            </div>
            <div class="text-danger mt-1 pr-1">{{ invalidMsg }}</div>
        </div>
    </div>
</template>

<script lang="ts">

import {computed, defineComponent, PropType} from "vue";
import {ScaleSettings, ScaleType} from "../../../store/plotState/plotState";
import i18next from "i18next";
import {useStore} from "vuex";
import {RootState} from "../../../root";
import {ChoroplethIndicatorMetadata} from "../../../generated";
import {useUpdateScale} from "../useUpdateScale";

export default defineComponent({
    props: {
        name: {
            type: String,
            required: true
        },
        indicatorMetadata: {
            type: Object as PropType<ChoroplethIndicatorMetadata>,
            required: true
        },
        selectedScale: {
            type: Object as PropType<ScaleSettings>,
            required: true
        },
    },
    setup(props) {
        const store = useStore<RootState>();
        const scaleStep = computed<number>(() => {
            return store.getters["modelCalibrate/scaleStep"];
        });
        const {updateOutputColourScale} = useUpdateScale();

        const invalidMsg = computed(() => {
            let result = null;
            if (props.selectedScale.type === ScaleType.Custom) {
                if (props.selectedScale.customMin >= props.selectedScale.customMax) {
                    result = i18next.t("maxMustBeGreaterThanMin");
                }
            }
            return result;
        });

        const disableCustom = computed(() => {
            return props.selectedScale.type !== ScaleType.Custom;
        });

        const scaleText = computed(() => {
            if (props.indicatorMetadata) {
                const {format, scale} = props.indicatorMetadata
                if (!format.includes('%') && scale !== 1) {
                    return `x ${scale}`
                }
            }
            return ''
        });

        const scaleTypeGroup = computed(() => {
            return `${props.name}-scaleType`;
        });

        return {
            invalidMsg,
            disableCustom,
            scaleText,
            scaleTypeGroup,
            scaleType: ScaleType,
            colourScaleStep: scaleStep,
            updateOutputColourScale
        }
    }
})
</script>
