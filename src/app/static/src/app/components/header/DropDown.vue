<template>
    <div class="dropdown">
        <p class="dropdown-toggle"
           v-translate="text"
           tabindex="0"
           @click="toggle"
           @blur="close">
        </p>
        <div class="dropdown-menu" :class="{'show':show, 'dropdown-menu-right': right}"
             @mouseenter="menuFocused"
             @mouseleave="menuUnfocused"
             @click="toggle">
            <slot></slot>
        </div>
    </div>
</template>
<script lang="ts">
    import { defineComponent } from "vue";

    export default defineComponent({
        props: {
            text: {
                type: String,
                required: true
            },
            right: {
                type: Boolean,
                required: false
            },
            delay: {
                type: Boolean,
                required: false
            }
        },
        data() {
            return {
                show: false,
                menuFocus: false
            }
        },
        methods: {
            toggle() {
                this.show = !this.show;
            },
            close: function() {
                if (this.menuFocus) {
                    return
                }
                if (this.delay) {
                    setTimeout(() => {
                        this.show = false;
                    }, 100);
                } else {
                    this.show = false;
                }
            },
            menuFocused() {
                this.menuFocus = true
            },
            menuUnfocused() {
                this.menuFocus = false
                if (this.delay) {
                    setTimeout(() => {
                        this.show = false;
                    }, 100);
                } else {
                    this.show = false;
                }
            },
        }
    })
</script>
<style scoped>
p {
    color: white;
    margin: 0;
    cursor: pointer;
}
</style>
