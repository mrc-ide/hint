<template>
    <l-control position="topright">
        <div style="width: 265px;" class="p-3 map-control">
            <form>
                <div v-if="showIndicators" class="row form-group">
                    <label class="col-3 col-form-label" v-translate="'indicator'">
                    </label>
                    <div class="col">
                        <hint-tree-select :model-value="indicator"
                                     :multiple="false"
                                     :clearable="false"
                                     :searchable="false"
                                     :options="indicatorOptions"
                                     @update:model-value="indicatorChanged"></hint-tree-select>
                    </div>
                </div>
                <div class="row form-group">
                    <label class="col-3 col-form-label" v-translate="'detail'">
                    </label>
                    <div class="col">
                        <hint-tree-select :model-value="`${initialDetail}`"
                                     :multiple="false"
                                     :clearable="false"
                                     :searchable="false"
                                     :options="detailOptions"
                                     @update:model-value="detailChanged"></hint-tree-select>
                    </div>
                </div>
            </form>
        </div>
    </l-control>
</template>

<script lang="ts">
    import HintTreeSelect from "../HintTreeSelect.vue";
    import {LControl} from "@vue-leaflet/vue-leaflet";
    import {ChoroplethIndicatorMetadata} from "../../generated";
    import {LevelLabel} from "../../types";
    import { PropType, defineComponent } from "vue";

    export default defineComponent({
        name: 'MapControl',
        components: {
            HintTreeSelect,
            LControl
        },
        props: {
            indicator: {
                type: String,
                required: false
            },
            initialDetail: {
                type: Number,
                required: false
            },
            showIndicators: {
                type: Boolean,
                required: true
            },
            indicatorsMetadata: {
                type: Array as PropType<ChoroplethIndicatorMetadata[]>,
                required: false
            },
            levelLabels: {
                type: Array as PropType<LevelLabel[]>,
                required: true
            }
        },
        data() {
            return {
                optionsLoaded: false,
            }
        },
        computed: {
            detailOptions: function () {
                return this.levelLabels.filter((l: LevelLabel) => l.display).map((l: LevelLabel) => {
                    return {id: l.id, label: l.area_level_label}
                });
            },
            indicatorOptions: function () {
                if (this.indicatorsMetadata) {
                    return this.indicatorsMetadata.map((i: ChoroplethIndicatorMetadata) => {
                        return {id: i.indicator, label: i.name};
                    });
                } else {
                    return []
                }
            }
        },
        methods: {
            indicatorChanged: function (newVal: string) {
                this.$emit("indicatorChanged", newVal);
            },
            detailChanged: function (newVal: number) {
                this.$emit("detailChanged", newVal);
            }
        }
    });
</script>