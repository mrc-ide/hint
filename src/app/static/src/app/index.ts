import Vue from "vue";
import {store} from "./main"
import {router} from "./router";
import UserHeader from "./components/header/UserHeader.vue";
import Errors from "./components/Errors.vue";
import Stepper from "./components/Stepper.vue";
import Projects from "./components/projects/Projects.vue";
import Accessibility from "./components/Accessibility.vue";
import {mapActions, mapState} from "vuex";
import {RootState} from "./root";
import VueRouter from "vue-router";

Vue.use(VueRouter);

router.addRoutes([
    {path: "/", component: Stepper},
    {path: "/accessibility", component: Accessibility},
    {path: "/projects", component: Projects}
]);

export const app = new Vue({
    el: "#app",
    store,
    router,
    components: {
        UserHeader,
        Errors
    },
    computed: mapState<RootState>({
        language: (state: RootState) => state.language
    }),
    methods: {
        ...mapActions({loadBaseline: 'baseline/getBaselineData'}),
        ...mapActions({loadSurveyAndProgram: 'surveyAndProgram/getSurveyAndProgramData'}),
        ...mapActions({loadModelRun: 'modelRun/getResult'}),
        ...mapActions({loadModelCalibrate: 'modelCalibrate/getResult'}),
        ...mapActions({getADRSchemas: 'adr/getSchemas'}),
        ...mapActions({getCurrentProject: 'projects/getCurrentProject'}),
        ...mapActions({getGenericChartMetadata: 'genericChart/getGenericChartMetadata'})
    },
    beforeMount: function () {
        this.loadBaseline();
        this.loadSurveyAndProgram();
        this.loadModelRun();
        this.loadModelCalibrate();
        this.getADRSchemas();
        this.getGenericChartMetadata();
        this.getCurrentProject();
    }
});
