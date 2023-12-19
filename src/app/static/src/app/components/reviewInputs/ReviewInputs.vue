<template>
    <div>
        <div>
            <ul class="nav nav-tabs col-12 mb-3 p-0">
                <li class="nav-item" v-if="availableDatasetIds.length">
                    <a class="nav-link"
                       :class="{'active': selectedTab === 0}"
                       v-translate="'timeSeries'"
                       v-on:click="selectTab(0)"></a>
                </li>
                <li class="nav-item">
                    <a class="nav-link"
                       :class="{'active': selectedTab === 1}"
                       v-translate="'map'"
                       v-on:click="selectTab(1)"></a>
                </li>
            </ul>
        </div>
        <template v-if="selectedTab === 1">
            <div v-if="showChoropleth">
                <choropleth :chartdata="data"
                            :filters="filters"
                            :features="features"
                            :feature-levels="featureLevels"
                            :indicators="sapIndicatorsMetadata"
                            :selections="plottingSelections"
                            :round-format-output="false"
                            :area-filter-id="areaFilterId"
                            :colour-scales="selectedSAPColourScales"
                            @update:selections="updateChoroplethSelections({payload: $event})"
                            @update-colour-scales="updateSAPColourScales({payload: [selectedDataType, $event]})">
                    <div id="data-source" class="form-group">
                        <h4 id="data-source-header" v-translate="'dataSource'"></h4>
                        <hint-tree-select
                            :multiple="false"
                            :clearable="false"
                            :options="dataSourceOptions"
                            :model-value="`${selectedDataType}`"
                            @update:model-value="selectDataSource">
                        </hint-tree-select>
                    </div>
                </choropleth>
                <div class="row">
                    <div class="col-md-3"></div>
                    <div class="col-md-9">
                        <area-indicators-table :table-data="data"
                                               :area-filter-id="areaFilterId"
                                               :filters="filters"
                                               :countryAreaFilterOption="countryAreaFilterOption"
                                               :indicators="filterTableIndicators"
                                               :selections="plottingSelections"
                                               :round-format-output="false"
                                               :selectedFilterOptions="plottingSelections.selectedFilterOptions">
                        </area-indicators-table>
                    </div>
                </div>
            </div>
        </template>
        <template v-else-if="selectedTab === 0">
            <generic-chart v-if="genericChartMetadata"
                           chart-id="input-time-series"
                           chart-height="600px"
                           :available-dataset-ids="availableDatasetIds"
                           :metadata="genericChartMetadata"></generic-chart>
        </template>
    </div>
</template>

<script lang="ts">
    import HintTreeSelect from "../HintTreeSelect.vue";
    import i18next from "i18next";
    import {mapMutations} from "vuex";
    import Choropleth from "../plots/choropleth/Choropleth.vue";
    import AreaIndicatorsTable from "../plots/table/AreaIndicatorsTable.vue";
    import {LevelLabel} from "../../types";
    import {RootState} from "../../root";
    import {SurveyAndProgramState} from "../../store/surveyAndProgram/surveyAndProgram";
    import {Feature} from "geojson";
    import {ChoroplethIndicatorMetadata, FilterOption} from "../../generated";
    import {mapActionByName, mapGettersByNames, mapStateProp, mapRootStateProps} from "../../utils";
    import {PlottingSelectionsState} from "../../store/plottingSelections/plottingSelections";
    import {BaselineState} from "../../store/baseline/baseline";
    import {Language} from "../../store/translations/locales";
    import GenericChart from "../genericChart/GenericChart.vue";
    import {GenericChartState} from "../../store/genericChart/genericChart";
    import { defineComponent } from "vue";

    const namespace = 'surveyAndProgram';

    enum Tab {
        TimeSeries = 0,
        Map = 1
    }

    export default defineComponent({
        name: "ReviewInputs",
        data() {
            return {
                areaFilterId: "area",
                selectedTab: Tab.TimeSeries
            };
        },
        computed: {
            ...mapRootStateProps({
                selectedDataType: ({surveyAndProgram}: {surveyAndProgram: SurveyAndProgramState}) => {
                    return surveyAndProgram.selectedDataType;
                },
                showChoropleth: ({surveyAndProgram}: {surveyAndProgram: SurveyAndProgramState}) => {
                    return surveyAndProgram.selectedDataType != null;
                },
                anc: ({surveyAndProgram}: {surveyAndProgram: SurveyAndProgramState}) => ({
                    available: !surveyAndProgram.ancError && surveyAndProgram.anc
                }),
                programme: ({surveyAndProgram}: {surveyAndProgram: SurveyAndProgramState}) => ({
                    available: !surveyAndProgram.programError && surveyAndProgram.program
                }),
                survey: ({surveyAndProgram}: {surveyAndProgram: SurveyAndProgramState}) => ({
                    available: !surveyAndProgram.surveyError && surveyAndProgram.survey
                }),
                features: ({baseline} : {baseline: BaselineState}) => baseline.shape ? baseline.shape.data.features as Feature[] : [] as Feature[],
                featureLevels: ({baseline} : {baseline: BaselineState}) => baseline.shape ? baseline.shape.filters.level_labels as LevelLabel[] : [] as LevelLabel[],
                plottingSelections: ({plottingSelections}: {plottingSelections: PlottingSelectionsState}) => plottingSelections.sapChoropleth,
                genericChartMetadata:({genericChart}: {genericChart: GenericChartState}) => genericChart.genericChartMetadata
            }),
            ...mapGettersByNames(namespace, ["data", "filters", "countryAreaFilterOption"] as const),
            ...mapGettersByNames("metadata", ["sapIndicatorsMetadata"] as const),
            ...mapGettersByNames("plottingSelections", ["selectedSAPColourScales"] as const),
            currentLanguage: mapStateProp<RootState, Language>(
                null,
                (state: RootState) => state.language
            ),
            filterTableIndicators(): ChoroplethIndicatorMetadata[] {
                return this.sapIndicatorsMetadata.filter((val: ChoroplethIndicatorMetadata) => val.indicator === this.plottingSelections.indicatorId)
            },
            dataSourceOptions(): FilterOption[] {
                const options = [];
                const lang = {lng: this.currentLanguage};
                if (this.survey.available) {
                    options.push({id: "2", label: i18next.t("survey", lang)});
                }
                if (this.programme.available) {
                    options.push({id: "1", label: i18next.t("ART", lang)});
                }
                if (this.anc.available) {
                    options.push({id: "0", label: i18next.t("ANC", lang)});
                }
                return options;
            },
            availableDatasetIds() {
                const data = []
                if (this.anc.available) {
                    data.push("anc")
                }

                if (this.programme.available) {
                    data.push("art")
                }

                return data;
            }
        },
        methods: {
            ...mapMutations({
                updateChoroplethSelections: "plottingSelections/updateSAPChoroplethSelections",
                updateSAPColourScales: "plottingSelections/updateSAPColourScales",
            }),
            selectDataType: mapActionByName(namespace, "selectDataType"),
            selectDataSource: function(option: string) {
                this.selectDataType(parseInt(option))
            },
            selectTab: function(tab: Tab) {
                this.selectedTab = tab
            }
        },
        components: {
            Choropleth,
            AreaIndicatorsTable,
            HintTreeSelect,
            GenericChart
        }
    })
</script>
