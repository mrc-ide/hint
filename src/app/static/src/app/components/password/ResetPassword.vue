<template>
    <div>
        <logged-out-header :title="title"></logged-out-header>
        <div class="card reset-password-form mx-auto mt-5">
            <div class="card-body">
                <h3 class="card-title" v-translate="'enterPassword'"></h3>
                <div v-if="!passwordWasReset">
                    <form ref="resetPasswordForm" class="needs-validation" novalidate>
                        <div class="form-group">
                            <input type="password" class="form-control"
                                   name="password"
                                   id="email"
                                   v-translate:placeholder="'newPassword'"
                                   v-model="password" pattern=".{6,}" required>
                            <div class="invalid-feedback" v-translate="'invalidPassword'"></div>
                        </div>

                        <div class="text-center">
                            <input class="btn btn-red" type="submit" v-translate:value="'updatePassword'"
                                   v-on:click="handleResetPassword">
                        </div>
                    </form>
                    <div v-if="hasError">
                        <error-alert :error="error"></error-alert>
                        <div id="request-new-link" v-translate="'resetTokenInvalid'">
                        </div>
                    </div>
                </div>
                <div v-if="passwordWasReset" id="password-was-reset" v-translate="'passwordWasReset'">
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
    import Vue from "vue";
    import ErrorAlert from "../ErrorAlert.vue";
    import {mapActions, mapState} from "vuex";
    import {PasswordState} from "../../store/password/password";
    import LoggedOutHeader from "../header/LoggedOutHeader.vue";

    export default Vue.extend({
        name: "ResetPassword",
        props: ["token", "title"],
        data: () => {
            return {
                password: ""
            };
        },
        computed: mapState<PasswordState>({
            error: state => state.resetPasswordError,
            hasError: state => !!state.resetPasswordError,
            passwordWasReset: state => state.passwordWasReset
        }),
        components: {
            ErrorAlert,
            LoggedOutHeader
        },
        methods: {
            ...mapActions({resetPassword: 'resetPassword'}),
            handleResetPassword: function (event: Event) {
                event.preventDefault();
                const form = this.$refs.resetPasswordForm as HTMLFieldSetElement;
                if (form.checkValidity()) {
                    this.resetPassword({token: this.token, password: this.password});
                }
                form.classList.add('was-validated');
            }
        }
    });


</script>