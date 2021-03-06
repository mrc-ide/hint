<template>
    <div v-if="loggedIn" class="mb-5">
        <adr-key></adr-key>
        <select-dataset v-if="key"></select-dataset>
    </div>
</template>
<script lang="ts">
    import Vue from "vue";
    import {mapActionByName, mapStateProp, mapGetterByName} from "../../utils";
    import adrKey from "./ADRKey.vue";
    import SelectDataset from "./SelectDataset.vue";
    import {ADRState} from "../../store/adr/adr";

    interface Methods {
        getDatasets: () => void
        fetchADRKey: () => void
    }

    interface Computed {
        isGuest: boolean
        loggedIn: boolean
        key: string | null
    }

    const namespace = "adr";

    export default Vue.extend<unknown, Methods, Computed, unknown>({
        components: {adrKey, SelectDataset},
        computed: {
            isGuest: mapGetterByName(null, "isGuest"),
            loggedIn() {
                return !this.isGuest
            },
            key: mapStateProp<ADRState, string | null>(namespace,
                (state: ADRState) => state.key)
        },
        methods: {
            getDatasets: mapActionByName(namespace, 'getDatasets'),
            fetchADRKey: mapActionByName(namespace, "fetchKey")
        },
        created() {
            if (this.loggedIn) {
                this.fetchADRKey();
            }
        },
        watch: {
            key() {
                this.getDatasets();
            }
        }
    })
</script>
