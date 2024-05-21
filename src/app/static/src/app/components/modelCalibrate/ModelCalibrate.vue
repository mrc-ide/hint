<template>
    <div id="model-options">
        <div v-if="loading" class="text-center">
            <loading-spinner size="lg"></loading-spinner>
            <h2 id="loading-message" v-translate="'loadingOptions'"></h2>
        </div>
        <dynamic-form
            ref="form"
            v-if="!loading"
            v-model:form-meta="calibrateOptions"
            @submit="submitCalibrate"
            :required-text="requiredText"
            :select-text="selectText"
            :include-submit-button="false"
        ></dynamic-form>
        <div class="d-flex justify-content-between align-items-end">
            <button
                v-if="!loading"
                class="btn"
                :class="calibrating ? 'btn-secondary' : 'btn-submit'"
                :disabled="calibrating"
                @click="submitForm"
            >
                {{ submitText }}
            </button>
            <p v-if="showCalibrateResults" id="reviewResults" class="mb-0" v-translate="'reviewResults'"></p>
        </div>
        <div v-if="calibrating" id="calibrating" class="mt-3">
            <loading-spinner size="xs"></loading-spinner>
            <span v-if="!progressMessage" v-translate="'calibrating'"></span>
            <span v-else>{{ progressMessage }}</span>
        </div>
        <error-alert v-if="hasError" :error="error!"></error-alert>
        <div v-if="complete" id="calibration-complete" class="mt-3">
            <h4
                class="d-inline"
                id="calibrate-complete"
                v-translate="'calibrationComplete'"
            ></h4>
            <tick color="#e31837" width="20px"></tick>
        </div>
        <div v-if="generatingCalibrationPlot" id="genCalibResults" class="mt-3">
            <loading-spinner size="xs"></loading-spinner>
            <span v-translate="'genCalibResults'"></span>
        </div>
        <calibration-results
            v-if="showCalibrateResults"
        ></calibration-results>
    </div>
</template>
<script lang="ts">
    import i18next from "i18next";
    import { DynamicFormMeta, DynamicForm } from "@reside-ic/vue-next-dynamic-form";
    import LoadingSpinner from "../LoadingSpinner.vue";
    import Tick from "../Tick.vue";
    import {
        mapActionByName,
        mapMutationByName,
        mapStateProp,
        mapStateProps,
    } from "../../utils";
    import { ModelCalibrateMutation } from "../../store/modelCalibrate/mutations";
    import { RootState } from "../../root";
    import { Language } from "../../store/translations/locales";
    import { ModelCalibrateState } from "../../store/modelCalibrate/modelCalibrate";
    import ErrorAlert from "../ErrorAlert.vue";
    import CalibrationResults from "./CalibrationResults.vue";
    import { defineComponent } from "vue";

    const namespace = "modelCalibrate";

    export default defineComponent({
        name: "ModelCalibrate",
        data() {
            return {
                showConfirmation: false,
            };
        },
        computed: {
            ...mapStateProps(namespace, {
                loading: (state: ModelCalibrateState) => state.fetching,
                calibrating: (state: ModelCalibrateState) => state.calibrating,
                generatingCalibrationPlot: (state: ModelCalibrateState) => state.generatingCalibrationPlot,
                error: (state: ModelCalibrateState) => state.error,
                progressMessage: (state: ModelCalibrateState) => {
                    if (
                        state.status &&
                        state.status.progress &&
                        state.status.progress.length > 0
                    ) {
                        const p = state.status.progress[0]; //This may be either a string or ProgressPhase
                        return typeof p == "string"
                            ? p
                            : `${p.name}: ${p.helpText}`;
                    } else {
                        return null;
                    }
                }
            }),
            showCalibrateResults(): boolean {
                return !this.generatingCalibrationPlot && this.complete
            },
            currentLanguage: mapStateProp<RootState, Language>(
                null,
                (state: RootState) => state.language
            ),
            selectText(): string {
                return i18next.t("select", { lng: this.currentLanguage });
            },
            requiredText(): string {
                return i18next.t("required", { lng: this.currentLanguage });
            },
            submitText(): string {
                return i18next.t("calibrate", { lng: this.currentLanguage });
            },
            complete: mapStateProp<ModelCalibrateState, boolean>(
                namespace,
                (state) => state.complete
            ),
            calibrateOptions: {
                get() {
                    return this.$store.state.modelCalibrate.optionsFormMeta;
                },
                set(value: DynamicFormMeta) {
                    this.update(value);
                },
            },
            hasError(): boolean {
                return !!this.error;
            },
        },
        methods: {
            update: mapMutationByName(namespace, ModelCalibrateMutation.Update),
            submitCalibrate: mapActionByName(namespace, "submit"),
            resumeCalibrate: mapActionByName(namespace, "resumeCalibrate"),
            fetchOptions: mapActionByName(namespace, "fetchModelCalibrateOptions"),
            submitForm() {
                (this.$refs.form as any).submit();
            },
        },
        components: {
            CalibrationResults,
            DynamicForm,
            LoadingSpinner,
            Tick,
            ErrorAlert,
        },
        mounted() {
            this.fetchOptions();
            this.resumeCalibrate();
        }
    });
</script>
