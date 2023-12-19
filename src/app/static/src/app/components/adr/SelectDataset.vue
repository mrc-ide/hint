<template>
    <div class="d-flex">
        <div v-if="selectedDataset" class="mt-2">
            <span class="fw-bold me-1"
                  v-translate="'selectedDataset'"
                  id="selectedDatasetSpan">
            </span>
            <a v-if="releaseName" :href="releaseURL" target="_blank">
                {{ selectedDataset.title }} — {{ releaseName }}
            </a>
            <a v-else :href="selectedDataset.url" target="_blank">
                {{ selectedDataset.title }}
            </a>
            <span class="color-red">
                <vue-feather type="info"
                           size="20"
                           v-if="outOfDateMessage"
                           v-tooltip="outOfDateMessage"
                           class="align-text-bottom">
                </vue-feather>
            </span>
        </div>
        <button v-if="outOfDateMessage"
                class="btn btn-white ms-2"
                @click="refresh"
                v-translate="'refresh'">
        </button>
        <button class="btn btn-red"
                :class="selectedDataset && 'ms-2'"
                @click="toggleModal">
            {{ selectText }}
        </button>
        <modal id="dataset" :open="open">
            <h4 v-if="!loading" v-translate="'browseADR'"></h4>
            <p v-if="loading" v-translate="'importingFiles'"></p>
            <div v-if="!loading">
                <label class="fw-bold" v-translate="'datasets'"></label>
                <hint-tree-select id="datasetSelector"
                             :multiple="false"
                             :searchable="true"
                             :options="datasetOptions"
                             :placeholder="select"
                             :disabled="fetchingDatasets"
                             v-model="newDatasetId">
                    <template v-slot:option-label="{node}">
                        <label v-html="node.raw.customLabel">
                        </label>
                    </template>
                </hint-tree-select>
                <select-release :dataset-id="newDatasetId" :open="open"
                                @selected-dataset-release="updateDatasetRelease"
                                @valid="updateValid">
                </select-release>
                <div :class="fetchingDatasets ? 'visible' : 'invisible'"
                     style="margin-top: 15px"
                     id="fetching-datasets">
                    <loading-spinner size="xs"></loading-spinner>
                    <span v-translate="'loadingDatasets'"></span>
                </div>
                <div v-if="adrError" id="fetch-error">
                    <div v-if="adrError.detail">{{adrError.detail}}</div>
                    <button @click="getDatasets"
                            class="btn btn-red float-end"
                            v-translate="'tryAgain'">
                    </button>
                </div>
            </div>
            <div class="text-center" v-if="loading" id="loading-dataset">
                <loading-spinner size="sm"></loading-spinner>
            </div>
            <template v-slot:footer v-if="!loading">
                <button id="importBtn"
                        type="button"
                        :disabled="disableImport"
                        class="btn btn-red"
                        v-translate="'import'"
                        @click.prevent="confirmImport">
                </button>
                <button type="button"
                        class="btn btn-white"
                        v-translate="'cancel'"
                        @click="toggleModal">
                </button>
            </template>
        </modal>
        <reset-confirmation
            v-if="!dataExplorationMode && showConfirmation"
            :discard-step-warning="selectedDatasetIsRefreshed ? modelOptions : null"
            :continue-editing="continueEditing"
            :cancel-editing="cancelEditing"
            :open="showConfirmation">
        </reset-confirmation>
    </div>
</template>
<script lang="ts">
    import i18next from "i18next";
    import {Language} from "../../store/translations/locales";
    import HintTreeSelect from "../HintTreeSelect.vue";
    import {
        mapActionByName,
        mapGetterByName,
        mapMutationByName,
        mapStateProp,
    } from "../../utils";
    import {RootState} from "../../root";
    import Modal from "../Modal.vue";
    import {BaselineMutation} from "../../store/baseline/mutations";
    import LoadingSpinner from "../LoadingSpinner.vue";
    import {BaselineState} from "../../store/baseline/baseline";
    import {
        Dataset,
        DatasetResourceSet,
        Release, Step
    } from "../../types";
    import VueFeather from "vue-feather";
    import {ADRState} from "../../store/adr/adr";
    import {Error} from "../../generated";
    import ResetConfirmation from "../resetConfirmation/ResetConfirmation.vue";
    import SelectRelease from "./SelectRelease.vue";
    import ResetConfirmationMixin from "../resetConfirmation/ResetConfirmationMixin";
    import { defineComponent } from "vue";

    interface Data {
        open: boolean;
        showConfirmation: boolean;
        loading: boolean;
        newDatasetId: string | null;
        newDatasetRelease: Release | undefined;
        pollingId: number | null;
        valid: boolean;
        modelOptions: number;
    }

    const names: { [k in keyof DatasetResourceSet]: string } = {
        pjnz: "PJNZ",
        pop: "Population",
        shape: "Shape file",
        survey: "Household Survey",
        program: "ART",
        anc: "ANC",
    };

    const namespace = "adr";

    export default defineComponent({
        extends: ResetConfirmationMixin,
        data(): Data {
            return {
                open: false,
                showConfirmation: false,
                loading: false,
                newDatasetId: null,
                pollingId: null,
                valid: true,
                newDatasetRelease: undefined,
                modelOptions: Step.ModelOptions
            };
        },
        components: {
            Modal,
            HintTreeSelect,
            LoadingSpinner,
            VueFeather,
            ResetConfirmation,
            SelectRelease
        },
        computed: {
            hasShapeFile: mapStateProp<BaselineState, boolean>(
                "baseline",
                (state: BaselineState) => !!state.shape
            ),
            hasPopulationFile: mapStateProp<BaselineState, boolean>(
                "baseline",
                (state: BaselineState) => !!state.population
            ),
            hasPjnzFile: mapStateProp<BaselineState, boolean>(
                "baseline",
                (state: BaselineState) => !!state.pjnz
            ),
            selectedDataset: mapStateProp<BaselineState, Dataset | null>(
                "baseline",
                (state: BaselineState) => state.selectedDataset
            ),
            selectedDatasetIsRefreshed: mapStateProp<BaselineState, boolean>(
                "baseline",
                (state: BaselineState) => state.selectedDatasetHasChanged
            ),
            selectedRelease: mapStateProp<BaselineState, Release | null>(
                "baseline",
                (state: BaselineState) => state.selectedRelease
            ),
            datasets: mapStateProp<ADRState, any[]>(
                namespace,
                (state: ADRState) => state.datasets
            ),
            fetchingDatasets: mapStateProp<ADRState, boolean>(
                namespace,
                (state: ADRState) => state.fetchingDatasets
            ),
            adrError: mapStateProp<ADRState, Error | null>(
                namespace,
                (state: ADRState) => state.adrError
            ),
            selectedDatasetAvailableResources: mapGetterByName("baseline", "selectedDatasetAvailableResources"),
            releaseName() {
                return this.selectedRelease?.name || null;
            },
            releaseURL() {
                return new URL(this.selectedDataset!.url).origin + '/dataset/' + this.selectedDataset!.id + '?activity_id=' + this.selectedRelease!.activity_id;
            },
            datasetOptions() {
                return this.datasets.map((d: any) => ({
                    id: d.id,
                    label: d.title,
                    customLabel: `${d.title}
                            <div class="text-muted small" style="margin-top:-5px; line-height: 0.8rem">
                                (${d.name})<br/>
                                <span class="fw-bold">${d.organization.title}</span>
                            </div>`,
                }));
            },
            selectText() {
                if (this.selectedDataset) {
                    return i18next.t("editBtn", {lng: this.currentLanguage});
                } else {
                    return i18next.t("selectADR", {lng: this.currentLanguage});
                }
            },
            outOfDateResources() {
                if (!this.selectedDataset) {
                    return {};
                }
                const resources = this.selectedDataset.resources;
                const outOfDateResources: {
                    [k in keyof DatasetResourceSet]?: true;
                } = {};
                Object.keys(resources).map((k) => {
                    const key = k as keyof DatasetResourceSet;
                    if (resources[key] && resources[key]!.outOfDate) {
                        outOfDateResources[key] = true;
                    }
                });
                return outOfDateResources;
            },
            outOfDateMessage() {
                const updatedNames = Object.keys(this.outOfDateResources)
                    .map((r) => names[r as keyof DatasetResourceSet])
                    .join(", ");
                if (Object.keys(this.outOfDateResources).length == 0) {
                    return "";
                }
                return `The following files have been updated in the ADR: ${updatedNames}. Use the refresh button to import the latest files.`;
            },
            select() {
                return i18next.t("select", {lng: this.currentLanguage});
            },
            currentLanguage: mapStateProp<RootState, Language>(
                null,
                (state: RootState) => state.language
            ),
            disableImport() {
                return !this.newDatasetId || !this.valid
            }
        },
        methods: {
            getDatasets: mapActionByName("adr", "getDatasets"),
            getDataset: mapActionByName("adr", "getDataset"),
            refreshDatasetMetadata: mapActionByName(
                "baseline",
                "refreshDatasetMetadata"
            ),
            markResourcesUpdated: mapMutationByName(
                "baseline",
                BaselineMutation.MarkDatasetResourcesUpdated
            ),
            importPJNZ: mapActionByName("baseline", "importPJNZ"),
            importShape: mapActionByName("baseline", "importShape"),
            importPopulation: mapActionByName("baseline", "importPopulation"),
            deleteBaselineFiles: mapActionByName("baseline", "deleteAll"),
            importSurvey: mapActionByName("surveyAndProgram", "importSurvey"),
            importProgram: mapActionByName("surveyAndProgram", "importProgram"),
            importANC: mapActionByName("surveyAndProgram", "importANC"),
            async importDataset() {
                this.stopPolling();

                this.loading = true;

                if (this.hasShapeFile || this.hasPopulationFile || this.hasPjnzFile) {
                    await this.deleteBaselineFiles()
                }

                await this.getDataset({id: this.newDatasetId!, release: this.newDatasetRelease});
                const {
                    pjnz,
                    pop,
                    shape,
                    survey,
                    program,
                    anc,
                } = this.selectedDatasetAvailableResources;

                await Promise.all([
                    pjnz && this.importPJNZ(pjnz.url),
                    pop && this.importPopulation(pop.url),
                    shape && this.importShape(shape.url),
                ]);

                (shape || this.hasShapeFile) &&
                (await Promise.all([
                    survey && this.importSurvey(survey.url),
                    program && this.importProgram(program.url),
                    anc && this.importANC(anc.url),
                ]));

                this.loading = false;
                this.open = false;

                this.startPolling();
            },
            async refresh() {
                this.stopPolling();

                this.loading = true;
                this.open = true;
                const {
                    pjnz,
                    pop,
                    shape,
                    survey,
                    program,
                    anc,
                } = this.selectedDataset!.resources;
                await Promise.all([
                    this.outOfDateResources["pjnz"] &&
                    pjnz &&
                    this.importPJNZ(pjnz.url),
                    this.outOfDateResources["pop"] &&
                    pop &&
                    this.importPopulation(pop.url),
                    this.outOfDateResources["shape"] &&
                    shape &&
                    this.importShape(shape.url),
                ]);

                const baselineUpdated =
                    this.outOfDateResources["pjnz"] ||
                    this.outOfDateResources["pop"] ||
                    this.outOfDateResources["shape"];

                // if baseline files are updated, we have to re-import all survey & program files,
                // regardless of whether they have changed, since updating the baseline files will
                // have wiped these
                (shape || this.hasShapeFile) &&
                (await Promise.all([
                    (baselineUpdated || this.outOfDateResources["survey"]) &&
                    survey &&
                    this.importSurvey(survey.url),
                    (baselineUpdated || this.outOfDateResources["program"]) &&
                    program &&
                    this.importProgram(program.url),
                    (baselineUpdated || this.outOfDateResources["anc"]) &&
                    anc &&
                    this.importANC(anc.url),
                ]));

                this.markResourcesUpdated();
                this.loading = false;
                this.open = false;

                this.startPolling();
            },
            toggleModal() {
                this.open = !this.open;
                if (this.open) {
                    this.preSelectDataset();
                }
            },
            preSelectDataset() {
                const selectedDatasetId = this.selectedDataset?.id
                if (selectedDatasetId && this.datasets.some((dataset: any) => dataset.id === selectedDatasetId)) {
                    this.newDatasetId = selectedDatasetId;
                }
            },
            confirmImport() {
                if (this.editsRequireConfirmation) {
                    this.open = false
                    this.showConfirmation = true;
                } else {
                    this.importDataset();
                }
            },
            continueEditing() {
                this.showConfirmation = false;
                this.importDataset();
            },
            cancelEditing() {
                this.showConfirmation = false;
                this.open = false;
            },
            startPolling() {
                if (!this.selectedDataset?.release) {
                    this.pollingId = window.setInterval(
                        this.refreshDatasetMetadata,
                        10000
                    );
                }
            },
            stopPolling() {
                if (this.pollingId) {
                    window.clearInterval(this.pollingId);
                }
            },
            updateDatasetRelease(release: Release) {
                this.newDatasetRelease = release;
            },
            updateValid(valid: boolean) {
                this.valid = valid;
            }
        },
        watch: {
            datasets() {
                if (this.open) {
                    this.preSelectDataset();
                }
            }
        },
        mounted() {
            this.refreshDatasetMetadata();
            this.startPolling();
        },
        beforeUnmount() {
            this.stopPolling();
        },
    });
</script>
