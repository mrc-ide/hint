<template>
    <div id="page-controls" class="text-center">
        <button id="previous-page"
                class="btn btn-sm mr-2 btn-red"
                v-translate:aria-label="'previousPage'"
                :disabled="pageNumber === 0"
                @click="$emit('back')">
            <vue-feather type="chevron-left" size="20" class="pagination-icon"></vue-feather>
        </button>
        <span id="page-number" class="page-text">
            {{ pageNumberText }}
        </span>
        <button id="next-page"
                class="btn btn-sm ml-2 btn-red"
                v-translate:aria-label="'nextPage'"
                :disabled="totalPages === pageNumber + 1"
                @click="$emit('next')">
            <vue-feather type="chevron-right" size="20" class="pagination-icon"></vue-feather>
        </button>
    </div>
</template>

<script lang="ts">
import i18next from "i18next";
import { computed, defineComponent } from "vue";
import VueFeather from "vue-feather";
import { useStore } from "vuex";
import { RootState } from "../../../root";

export default defineComponent({
    emits: ["back", "next"],
    components: {
        VueFeather
    },
    props: {
        pageNumber: {
            type: Number,
            required: true
        },
        totalPages: {
            type: Number,
            required: true
        }
    },
    setup(props) {
        const store = useStore<RootState>();
        const pageNumberText = computed(() => {
            return i18next.t("pageNumber", {
                currentPage: props.pageNumber + 1,
                totalPages: props.totalPages,
                lng: store.state.language
            })
        });
        return { pageNumberText };
    }
})
</script>

<style scoped>
.pagination-icon {
    vertical-align: sub;
}

.btn-red, .btn-red:hover, .btn-red:disabled, .btn-red:focus, .btn-red:active {
    border-color: transparent;
}

.btn-red:focus, .btn-red:active {
    box-shadow: none;
    background-color: #e31837;
}

.btn-red:disabled {
    background-color: darkgray;
}

.page-text {
    color: #636668;
}
</style>