<template>
    <div class="row">
        <div class="mt-2 col-md-3">
            <h4 v-translate="'filters'"/>
            <filter-set :plot="calibratePlotName"/>
        </div>
        <barchart class="col-md-9"
                  :plot="calibratePlotName"
                  :show-error-bars="false"/>
    </div>
</template>

<script setup lang="ts">
import Barchart from "../plots/bar/Barchart.vue";
import {calibratePlotName} from "../../store/plotSelections/plotSelections";
import FilterSet from "../plots/FilterSet.vue";

</script>
