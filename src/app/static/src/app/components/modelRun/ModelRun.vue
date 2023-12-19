<template>
    <div>
        <button class="btn btn-red btn-lg"
                v-on:click="handleRun"
                :disabled="running"
                v-translate="'fitModel'">
        </button>
        <div v-if="complete" class="mt-3 d-flex align-items-center me-2" id="model-run-complete">
            <h4 v-translate="'fittingComplete'"></h4>
            <tick color="#e31837" width="20px"></tick>
        </div>
        <modal :open="running">
            <progress-bar v-for="phase in phases"
                          :key="phase.name"
                          :phase="phase"></progress-bar>
            <div class="text-center" v-if="phases.length == 0">
                <h4 v-translate="'initialisingFit'"></h4>
                <loading-spinner size="sm"></loading-spinner>
            </div>
            <div>
                <button class="btn btn-red float-end" id="cancel-model-run"
                        v-on:click="cancelRun" v-translate="'cancelFitting'">
                </button>
            </div>
        </modal>
        <div class="mt-3">
            <error-alert v-for="(error, index) in errors" :key="index" :error="error"></error-alert>
        </div>
        <reset-confirmation :continue-editing="confirmReRun"
                            :cancel-editing="cancelReRun"
                            :open="showReRunConfirmation"></reset-confirmation>
    </div>
</template>

<script lang="ts">
    import {ModelRunState} from "../../store/modelRun/modelRun";
    import Modal from "../Modal.vue";
    import Tick from "../Tick.vue";
    import {
        mapActionsByNames,
        mapGettersByNames,
        mapStateProps,
        mapGetterByName,
        mapMutationByName
    } from "../../utils";
    import ErrorAlert from "../ErrorAlert.vue";
    import ProgressBar from "../progress/ProgressBar.vue";
    import LoadingSpinner from "../LoadingSpinner.vue";
    import ResetConfirmation from "../resetConfirmation/ResetConfirmation.vue";
    import {ModelRunMutation} from "../../store/modelRun/mutations";
    import { defineComponent } from "vue";

    const namespace = 'modelRun';

    export default defineComponent({
        name: "ModelRun",
        data() {
            return {
                showReRunConfirmation: false
            }
        },
        computed: {
            editsRequireConfirmation: mapGetterByName("stepper", "editsRequireConfirmation"),
            ...mapStateProps(namespace, {
                runId: (state: ModelRunState) => state.modelRunId,
                pollId: (state: ModelRunState) => state.statusPollId,
                errors: (state: ModelRunState) => state.errors,
                phases: (state: ModelRunState) => {
                    const progress = state.status.progress || [];
                    return progress.map((item, index) => ({...item, name: `${index + 1}. ${item.name}`}))
                }
            }),
            ...mapGettersByNames(namespace, ["running", "complete"] as const)
        },
        methods: {
            ...mapActionsByNames(namespace, ["run", "poll", "cancelRun"] as const),
            clearResult: mapMutationByName(namespace, ModelRunMutation.ClearResult),
            handleRun(){
                if (this.editsRequireConfirmation){
                    this.showReRunConfirmation = true
                } else this.run()
            },
            confirmReRun() {
                this.clearResult();
                this.run();
                this.showReRunConfirmation = false;
            },
            cancelReRun() {
                this.showReRunConfirmation = false
            }
        },
        watch: {
            runId: function (newVal) {
                if (newVal) {
                    this.poll(newVal)
                }
            }
        },
        beforeMount() {
            if (this.runId && this.pollId == -1 && this.running) {
                this.poll(this.runId);
            }
        },
        components: {
            ResetConfirmation,
            Modal,
            Tick,
            ErrorAlert,
            ProgressBar,
            LoadingSpinner
        }
    });
</script>
