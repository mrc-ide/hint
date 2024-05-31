<template>
  <div id="load-invalid-modal">
    <modal :open="hasInvalidSteps">
      <template v-if="hasInvalidSteps">
        <h4 v-translate="'loadError'"></h4>
        <p>
          <span id="load-invalid-steps" v-translate="'loadInvalidSteps'" />
          <ul id="load-invalid-steps-list">
            <li v-for="step in invalidSteps" :key="step" v-translate="stepTextKey(step)"></li>
          </ul>
          <span id="load-invalid-action-prefix" v-translate="'loadInvalidActionPrefix'" />
          <span id="load-invalid-first-invalid" v-translate="stepTextKey(invalidSteps[0])" />
          <span id="load-invalid-action-suffix" v-translate="'loadInvalidActionSuffix'" />
        </p>
        <p v-if="!isGuest" id="load-invalid-steps-rollback-info" v-translate="'loadInvalidStepsRollbackInfo'"></p>
        <p v-else id="load-invalid-steps-rollback-info-guest" v-translate="'loadInvalidStepsRollbackInfoGuest'"></p>
        <p v-if="!isGuest" id="load-invalid-projects">
            <span id="load-invalid-projects-prefix" v-translate="'loadInvalidStepsProjectLinkPrefix'"></span>
            <router-link id="load-invalid-projects-link" to="/projects" v-translate="'projects'" v-translate:aria-label="'projects'" />
            <span id="load-invalid-projects-suffix" v-translate="'loadInvalidStepsProjectLinkSuffix'"></span>

        </p>
      </template>
      <template v-slot:footer>
        <button id="retry-load"
                type="button"
                class="btn btn-red"
                v-translate:aria-label="'retry'"
                @click="retryLoad"
                v-translate="'retry'">
        </button>
        <button id="rollback-load"
                type="button"
                class="btn btn-red"
                v-translate:aria-label="'rollback'"
                @click="rollbackInvalidState"
                v-translate="'rollback'">
        </button>
      </template>
    </modal>
  </div>
</template>

<script lang="ts">
    import {defineComponent} from "vue"
    import Modal from "../Modal.vue";
    import {mapActionByName, mapGetterByName, mapStateProp, mapStateProps} from "../../utils";
    import {RootState} from "../../root";
    import {ProjectsState} from "../../store/projects/projects";
    import {StepperState} from "../../store/stepper/stepper";

    export default defineComponent({
        name: "LoadInvalidModal",
        computed: {
          ...mapStateProps("projects", {
            currentProject: (state: ProjectsState) => state.currentProject,
            currentVersion: (state: ProjectsState) => state.currentVersion
          }),
          ...mapStateProps("stepper", {
            steps: (state: StepperState) => state.steps
          }),
          invalidSteps: mapStateProp<RootState, number[]>(null, (state) => state.invalidSteps),
          isGuest: mapGetterByName(null, "isGuest"),
          stepTextKeys: mapGetterByName("stepper", "stepTextKeys"),
          hasInvalidSteps: function(): boolean { return this.invalidSteps?.length > 0; }
        },
        methods: {
          rollbackInvalidState: mapActionByName(null, "rollbackInvalidState"),
          loadVersion: mapActionByName("projects", "loadVersion"),
          retryLoad() {
            if (this.isGuest) {
              location.reload();
            } else {
              const versionId = this.currentVersion!.id;
              const projectId = this.currentProject!.id;
              this.loadVersion({
                versionId,
                projectId
              })
            }
          },
          stepTextKey(stepNumber: number) {
            return this.stepTextKeys[stepNumber] || stepNumber.toString();
          }
        },
        components: {
          Modal
        }
    })
</script>
