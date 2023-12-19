<template>
    <div id="selectRelease" v-if="datasetId && releases.length">
        <div class="pt-2">
            <input
                type="radio"
                id="useLatest"
                value="useLatest"
                v-model="choiceADR"
            />
            <label for="useLatest" v-translate="'useLatest'" class="ms-1"></label>
            <span class="icon-small ms-1" v-tooltip="translate('datasetTooltip')">
                <vue-feather type="help-circle" class="align-middle"></vue-feather>
            </span>
            <br />
        </div>
        <div>
            <input
                type="radio"
                id="useRelease"
                value="useRelease"
                v-model="choiceADR"
            />
            <label for="useRelease" v-translate="'useRelease'" class="ms-1"></label>
            <span class="icon-small ms-1" v-tooltip="translate('releaseTooltip')">
                <vue-feather type="help-circle" class="align-middle"></vue-feather>
            </span>
            <br />
        </div>

        <label
            for="releaseSelector"
            class="fw-bold"
            v-translate="'releases'"
        ></label>
        <hint-tree-select
            id="releaseSelector"
            :multiple="false"
            :searchable="true"
            :options="releaseOptions"
            :placeholder="translate('select')"
            :disabled="!useRelease"
            :model-value="releaseId"
            @update:model-value="newVal => releaseId = newVal">
            <template v-slot:option-label="{node}">
                <label v-html="node.raw.customLabel">
                </label>
            </template>
        </hint-tree-select>
    </div>
</template>

<script lang="ts">
    import { mapActionByName, mapStateProp, mapMutationByName } from "../../utils";
    import HintTreeSelect from "../HintTreeSelect.vue";
    import { ADRState } from "../../store/adr/adr";
    import VueFeather from "vue-feather";
    import i18next from "i18next";
    import { Language } from "../../store/translations/locales";
    import { RootState } from "../../root";
    import {ADRMutation} from "../../store/adr/mutations";
    import { BaselineState } from "../../store/baseline/baseline";
    import { PropType, defineComponent } from "vue";
    import { Release } from "../../types";

    interface Data {
        releaseId: string | undefined;
        choiceADR: "useLatest" | "useRelease";
    }

    const namespace = "adr";

    export default defineComponent({
        components: {
            HintTreeSelect,
            VueFeather,
        },
        props: {
            datasetId: {
                type: [String, null] as PropType<string | null>,
                required: true
            },
            open: {
                type: Boolean,
                required: false
            }
        },
        data(): Data {
            return {
                releaseId: undefined,
                choiceADR: "useLatest",
            };
        },
        computed: {
            releases: mapStateProp<ADRState, Release[]>(
                namespace,
                (state: ADRState) => state.releases
            ),
            initialRelease: mapStateProp<BaselineState, string | undefined>(
                "baseline",
                (state: BaselineState) => state.selectedDataset?.release
            ),
            valid() {
                return (this.choiceADR === "useLatest") || !!this.releaseId;
            },
            releaseOptions() {
                return this.releases.map((d) => ({
                    id: d.id,
                    label: d.name,
                customLabel: `${d.name}
                    <div class="text-muted small" style="margin-top:-5px; line-height: 0.8rem">
                        ${d.notes ? d.notes + "<br/>" : ""}
                    </div>`,
                }));
            },
            useRelease() {
                return this.choiceADR === "useRelease";
            },
            currentLanguage: mapStateProp<RootState, Language>(
                null,
                (state: RootState) => state.language
            ),
        },
        methods: {
            getReleases: mapActionByName(namespace, "getReleases"),
            translate(text: string) {
                return i18next.t(text, { lng: this.currentLanguage });
            },
            clearReleases: mapMutationByName(namespace, ADRMutation.ClearReleases),
            preSelectRelease(){
                const selectedReleaseId = this.initialRelease
                if (selectedReleaseId && this.releases.some((release) => release.id === selectedReleaseId)){
                    this.choiceADR = "useRelease"
                    this.releaseId = selectedReleaseId;
                } else if (selectedReleaseId && !this.releases.some((release) => release.id === selectedReleaseId)) {
                    this.choiceADR = "useLatest"
                }
            }
        },
        watch: {
            datasetId(id) {
                this.choiceADR = "useLatest";
                this.clearReleases()
                if (id) {
                    this.getReleases(id);
                }
            },
            choiceADR(choice) {
                if (choice === "useLatest") {
                    this.releaseId = undefined;
                }
            },
            releaseId() {
                this.$emit("selected-dataset-release", this.releases.find((release) => release.id === this.releaseId))
            },
            valid() {
                this.$emit("valid", this.valid);
            },
            releases(){
                this.preSelectRelease();
            },
            open(){
                if (this.open && this.datasetId){
                    this.getReleases(this.datasetId);
                }
            }
        },
        mounted(){
            this.preSelectRelease();
            this.$emit("selected-dataset-release", this.releaseId);
            this.$emit("valid", this.valid);
        }
    });
</script>