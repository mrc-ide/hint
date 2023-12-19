<template>
    <div>
        <button class="btn btn-sm btn-red-icons"
                v-tooltip="tooltipShare"
                @click="shareProject"
                v-translate:aria-label="'share'">
            <vue-feather type="share-2" size="20"></vue-feather>
        </button>
        <modal :open="open">
            <h4 v-translate="'shareProject'"></h4>
            <div v-if="!cloningProject">
                <div v-html="instructions" id="instructions"></div>
                <div class="row mb-2" v-for="(email, index) in emailsToShareWith" :key="index">
                    <div class="col">
                        <input autocomplete="no"
                               v-translate:aria-label="'enterEmail'"
                               @keyup.enter="($event.target as HTMLInputElement).blur()"
                               @keyup.delete="removeEmail(email, index)"
                               class="form-control"
                               :class="{'is-invalid': email.valid === false}"
                               @blur="() => addEmail(email, index)"
                               v-model="email.value"/>
                    </div>
                    <div class="col">
                        <div class="small text-danger"
                             v-if="email.valid === false"
                             v-translate="email.validationMessage">
                        </div>
                    </div>
                </div>
            </div>
            <div class="text-center" v-if="cloningProject">
                <loading-spinner size="sm"></loading-spinner>
            </div>
            <template v-slot:footer>
            <div style="display: flex; align-items: center; justify-content: space-between;">
                <div class="text-muted help-text float-start"
                     v-show="showValidationMessage"
                     v-translate="'emailMultiValidation'"
                     style="width: 60%;">
                </div>
                <error-alert v-if="cloneProjectError" :error="cloneProjectError!"></error-alert>
                <div class="float-end">
                    <button type="button"
                            class="btn btn-red"
                            @click="confirmShareProject"
                            :disabled="invalidEmails || cloningProject"
                            v-translate="'ok'">
                    </button>
                    <button type="button"
                            class="btn btn-white ms-2"
                            @mousedown="cancelShareProject"
                            :disabled="cloningProject"
                            v-translate="'cancel'">
                    </button>
                </div>
            </div>
            </template>
        </modal>
    </div>
</template>

<script lang="ts">
    import {Project} from "../../types";
    import Modal from "../Modal.vue";
    import LoadingSpinner from "../LoadingSpinner.vue";
    import {mapActionByName, mapStatePropByName} from "../../utils";
    import i18next from "i18next";
    import {Language} from "../../store/translations/locales";
    import ErrorAlert from "../ErrorAlert.vue";
    import VueFeather from "vue-feather";
    import { PropType, defineComponent } from "vue";
import { Error } from "../../generated";

    interface RecipientEmail {
        value: string
        valid: boolean | null
        validationMessage: string
    }

    interface Data {
        emailsToShareWith: RecipientEmail[]
        open: boolean
    }

    declare const currentUser: string;

    export default defineComponent({
        props: {
            project: {
                type: Object as PropType<Project>,
                required: true
            }
        },
        data(): Data {
            return {
                emailsToShareWith: [{value: "", valid: null, validationMessage: ""}],
                open: false
            }
        },
        methods: {
            cloneProject: mapActionByName("projects", "cloneProject"),
            userExists: mapActionByName("projects", "userExists"),
            addEmail(e: RecipientEmail, index: number) {
                if (e.value && index == this.emailsToShareWith.length - 1) {
                    this.emailsToShareWith.push({
                        value: "",
                        valid: null,
                        validationMessage: ""
                    });
                }
                this.emailsToShareWith.map(async (email: RecipientEmail, index: number) => {
                    if (email.value) {
                        let invalidMsg = null;
                        const emailValue = email.value.toLowerCase()
                        if (emailValue == currentUser.toLowerCase()) {
                            invalidMsg = "projectsNoSelfShare";
                        } else if (this.emailsToShareWith.filter((val: RecipientEmail) => val.value.toLowerCase() === emailValue).length > 1) {
                            invalidMsg = "duplicateEmails";
                        } else {
                            const result = await this.userExists(emailValue);
                            if (!result) {
                                invalidMsg = "emailNotRegistered"
                            }
                        }

                        this.emailsToShareWith[index].validationMessage = invalidMsg || "";
                        this.emailsToShareWith[index].valid = invalidMsg === null;

                    } else {
                        email.valid = null;
                    }
                });
            },
            removeEmail(email: RecipientEmail, index: number) {
                // if email has been deleted and this is not the last input
                // remove from UI
                if (!email.value && index < this.emailsToShareWith.length - 1) {
                    this.emailsToShareWith.splice(index, 1);
                }
            },
            shareProject(e: Event) {
                e.preventDefault();
                this.open = true;
            },
            confirmShareProject() {
                const emails = this.emailsToShareWith
                    .filter((e: RecipientEmail) => e.value)
                    .map((e: RecipientEmail) => e.value);
                if (emails.length > 0) {
                    this.cloneProject({emails, projectId: this.project.id})
                }
            },
            cancelShareProject() {
                this.emailsToShareWith = [{value: "", valid: null, validationMessage: ""}];
                this.open = false;
            }
        },
        computed: {
            cloningProject: mapStatePropByName<boolean>("projects", "cloningProject"),
            cloneProjectError: mapStatePropByName<Error | null>("projects", "cloneProjectError"),
            currentLanguage: mapStatePropByName<Language>(null, "language"),
            instructions() {
                return i18next.t('shareProjectInstructions', {project: this.project.name, lng: this.currentLanguage});
            },
            invalidEmails() {
                //Invalid state until all emails evaluated as valid = true (may not have blurred yet)...
                return this.emailsToShareWith.filter((e: RecipientEmail) => e.value && !e.valid).length > 0
            },
            showValidationMessage() {
                //...however only show error message if any confirmed to be valid = false
                return this.emailsToShareWith.filter((e: RecipientEmail) => e.value && e.valid === false).length > 0
            },
            tooltipShare() {
                return i18next.t("share", {
                    lng: this.currentLanguage
                });
            }
        },
        components: {
            Modal,
            LoadingSpinner,
            ErrorAlert,
            VueFeather
        },
        watch: {
            cloningProject(newVal: boolean) {
                if (!newVal && !this.cloneProjectError) {
                    this.emailsToShareWith = [{value: "", valid: null, validationMessage: ""}];
                    this.open = false;
                }
            }
        }
    });

</script>
