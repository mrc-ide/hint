<template>
    <div class="p-3">
        <div class="form-check dynamic-filtered">
            <label class="form-check-label">
                <input id="type-input-dynamic-filtered" class="form-check-input" type="radio" :name="scaleTypeGroup"
                       :value="scaleType.DynamicFiltered"
                       v-model="selectedScaleType">
                <span v-translate="'filteredDataset'"></span>
            </label>
        </div>
        <div class="form-check mt-1 static-default">
            <label class="form-check-label">
                <input id="type-input-default" class="form-check-input" type="radio" :name="scaleTypeGroup"
                       :value="scaleType.Default"
                       v-model="selectedScaleType">
                <span v-translate="'default'"></span>
            </label>
        </div>
        <div class="form-check mt-1 static-custom">
            <label class="form-check-label">
                <input id="type-input-custom" class="form-check-input" type="radio" :name="scaleTypeGroup"
                       :value="scaleType.Custom"
                       v-model="selectedScaleType">
                <span v-translate="'custom'"></span>
            </label>
        </div>

        <div class="mt-2 ml-2 static-custom-values">
            <form novalidate>
                <div class="row p-0 mb-2">
                    <label for="custom-min-input" class="col col-form-label col-2"><span v-translate="'min'"></span></label>
                    <div class="col pt-1 pr-1">
                        <input id="custom-min-input" type="number" :step="colourScaleStep"
                               v-model.number="selectedScaleMin"
                               :max="selectedScale.customMax"
                               :disabled="disableCustom">
                    </div>
                    <p v-if="selectedScale.customMin" class="col col-form-label pl-0">{{ scaleText }}</p>
                </div>
                <div class="row">
                    <label class="col col-form-label col-2" for="custom-max-input"><span v-translate="'max'"></span></label>
                    <div class="col pt-1 pr-1">
                        <input id="custom-max-input" type="number" :step="colourScaleStep"
                               v-model.number="selectedScaleMax"
                               :min="selectedScale.customMin"
                               :disabled="disableCustom">
                    </div>
                    <p v-if="selectedScale.customMax" class="col col-form-label pl-0">{{ scaleText }}</p>
                </div>
            </form>
        </div>
        <div class="text-danger">{{ invalidMsg }}</div>
    </div>
</template>

<script lang="ts">

import {computed, defineComponent, PropType} from "vue";
import {ScaleSettings, ScaleType} from "../../store/plotState/plotState";
import i18next from "i18next";
import {useStore} from "vuex";
import {RootState} from "../../root";
import {ChoroplethIndicatorMetadata} from "../../generated";
import {useUpdateScale} from "./useUpdateScale";

export default defineComponent({
    emits: ['update:selectedScale'],
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
    setup(props, { emit }) {
        const {getScaleStep, updateOutputScale} = useUpdateScale();

        const scaleStep = computed(() => getScaleStep(props.name));

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

        const selectedScaleType = computed({
            get() {
                return props.selectedScale.type
            },
            set(newType: ScaleType) {
                const newScaleSetting = {...props.selectedScale};
                newScaleSetting.type = newType;
                updateOutputScale(props.name, newScaleSetting)
                emit('update:selectedScale')
            }
        });

        const selectedScaleMin = computed({
            get() {
                return props.selectedScale.customMin
            },
            set(newMin: number) {
                const newScaleSetting = {...props.selectedScale};
                newScaleSetting.customMin = newMin;
                updateOutputScale(props.name, newScaleSetting)
                emit('update:selectedScale')
            }
        });

        const selectedScaleMax = computed({
            get() {
                return props.selectedScale.customMax
            },
            set(newMax: number) {
                const newScaleSetting = {...props.selectedScale};
                newScaleSetting.customMax = newMax;
                updateOutputScale(props.name, newScaleSetting)
                emit('update:selectedScale')
            }
        });

        return {
            invalidMsg,
            disableCustom,
            scaleText,
            scaleTypeGroup,
            scaleType: ScaleType,
            colourScaleStep: scaleStep,
            selectedScaleType,
            selectedScaleMin,
            selectedScaleMax
        }
    }
})
</script>
