<template>
    <div id="indicator-download">
        <download-button
            :name="'downloadIndicator'"
            :disabled="downloadingIndicator"
            @click="download"></download-button>
    </div>
</template>

<script lang="ts">
    import DownloadButton from "./DownloadButton.vue";
    import {appendCurrentDateTime, mapActionByName, mapStateProps} from "../../utils";
    import {BaselineState} from "../../store/baseline/baseline";
    import {DownloadIndicatorState} from "../../store/downloadIndicator/downloadIndicator";
    import {defineComponent} from "vue";

    const namespace = "downloadIndicator";

    export default defineComponent({
        name: "downloadIndicator",
        components: {
            DownloadButton
        },
        props: {
            unfilteredData: {
                type: Array,
                required: true
            },
            filteredData: {
                type: Array,
                required: false
            }
        },
        computed: {
            ...mapStateProps("baseline", {
                iso3: (state: BaselineState) => state.iso3,
                country: (state: BaselineState) => state.country
            }),
            ...mapStateProps(namespace, {
                downloadingIndicator: (state: DownloadIndicatorState) => state.downloadingIndicator
            })
        },
        methods: {
            download() {
                const prefix = this.iso3 || this.country
                const filename = `${prefix}_naomi_data-review_${appendCurrentDateTime()}.xlsx`
                if (this.filteredData) {
                    const data = {filteredData: this.filteredData, unfilteredData: this.unfilteredData}
                    this.downloadFile({data, filename})
                }
            },
            downloadFile: mapActionByName(namespace, "downloadFile"),
        }
    })
</script>
