<template>
    <div class="row mt-2">
        <div class="col">
            <a id="back" href="#"
               class="text-uppercase fw-bold pe-1"
               :class="{'disabled': backDisabled}"
               v-on="backDisabled ? {} : { click: back }"
               v-translate="'back'"></a>
            /
            <a id="continue" href="#"
               class="text-uppercase fw-bold"
               :class="{'disabled': nextDisabled}"
               v-on="nextDisabled ? {} : { click: next }"
               v-translate="'continue'"></a>
        </div>
    </div>
</template>

<script lang="ts">

    import {PropType, defineComponent} from "vue";

    export default defineComponent({
        props: {
            back: {
                type: Function as PropType<() => void>,
                required: true
            },
            backDisabled: {
                type: Boolean,
                required: true
            },
            next: {
                type: Function as PropType<() => void>,
                required: true
            },
            nextDisabled: {
                type: Boolean,
                required: true
            }
        }
    });

</script>
