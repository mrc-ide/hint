<template>
    <div class="row mb-2">
        <div class="col-8">
            <div class="d-flex d-inline-block">
                <label for="key"
                       class="fw-bold align-self-center col-form-label"
                       v-translate="'adrKey'">
                </label>
                <div class="align-self-center ps-2">
                    <div v-if="!editing">
                        <span class="pe-2 align-middle">
                          {{ keyText }}
                        </span>
                        <span v-if="!key">
                            <button class="btn btn-red"
                                    type="button"
                                    @click="add"
                                    v-translate="'add'">
                            </button>
                            <a :href="adrProfileUrl"
                               class="btn btn-red"
                               target="_blank"
                               v-translate="'getAccessKey'"
                               v-tooltip="tooltipContent"></a>
                        </span>
                        <span v-if="key">
                             <button class="btn btn-red"
                                     type="button"
                                     @click="remove"
                                     v-translate="'removeButton'">
                            </button>
                         </span>
                    </div>
                    <div class="input-group"
                         style="margin-top: -8px; min-width: 390px"
                         v-show="editing">
                        <input id="key"
                               ref="keyInput"
                               class="form-control"
                               v-model="editableKey"
                               type="text"
                               v-translate:placeholder="'enterKey'"/>
                        <div class="input-group-append">
                            <button class="btn btn-red me-2"
                                    type="button"
                                    v-translate="'save'"
                                    :disabled="!editableKey"
                                    @click="save">
                            </button>
                            <button class="btn btn-red"
                                    type="button"
                                    @click="cancel"
                                    v-translate="'cancel'">
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <error-alert v-if="error" :error="error"></error-alert>
        </div>
    </div>
</template>
<script lang="ts">
    import {mapActionsByNames, mapStateProp} from "../../utils";
    import {Error} from "../../generated"
    import {RootState} from "../../root";
    import {Language} from "../../store/translations/locales";
    import i18next from "i18next";
    import ErrorAlert from "../ErrorAlert.vue";
    import {ADRState} from "../../store/adr/adr";
    import { defineComponent } from "vue";

    const namespace = "adr";

    export default defineComponent({
        data() {
            return {
                editableKey: "" as string | null,
                editing: false
            }
        },
        computed: {
            key: mapStateProp<ADRState, string | null>(namespace,
                (state: ADRState) => state.key),
            adrProfileUrl: mapStateProp<ADRState, string>(namespace,
                (state: ADRState) => `${state.schemas?.baseUrl}/me`),
            currentLanguage: mapStateProp<RootState, Language>(null,
                (state: RootState) => state.language),
            error: mapStateProp<ADRState, Error | null>(namespace,
                (state: ADRState) => state.keyError),
            keyText(): string {
                if (this.key) {
                    let str = ""
                    let count = this.key.length
                    while (count) {
                        str += "*";
                        count--;
                    }
                    return str;
                } else {
                    return i18next.t("noneProvided", {lng: this.currentLanguage})
                }
            },
            tooltipContent(): string {
                return i18next.t("adrTooltip", {lng: this.currentLanguage})
            }
        },
        methods: {
            ...mapActionsByNames(namespace, ["saveKey", "deleteKey"] as const),
            add(e: Event) {
                e.preventDefault();
                this.editing = true;
                this.editableKey = this.key;
                this.$nextTick(() => {
                    (this.$refs["keyInput"] as HTMLInputElement).focus();
                })
            },
            remove(e: Event) {
                this.deleteKey();
                e.preventDefault();
            },
            save(e: Event) {
                e.preventDefault();
                this.saveKey(this.editableKey);
                this.editing = false;
            },
            cancel(e: Event) {
                e.preventDefault();
                this.editing = false;
            }
        },
        components: {ErrorAlert}
    });

</script>
