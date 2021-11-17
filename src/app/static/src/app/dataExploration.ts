import Vue from "vue";
import Vuex, {mapActions, mapState} from "vuex";
import registerTranslations from "./store/translations/registerTranslations";
import {DataExplorationState, storeOptions} from "./store/dataExploration/dataExploration";
import Errors from "./components/Errors.vue";
import LoadingSpinner from "./components/LoadingSpinner.vue";
import {Language} from "./store/translations/locales";

Vue.use(Vuex);

const store = new Vuex.Store<DataExplorationState>(storeOptions);
registerTranslations(store);

export const dataExplorationApp = new Vue({
    el: "#app",
    store,
    components: {
        Errors,
        LoadingSpinner
    },
    computed: mapState<DataExplorationState>({
        language: (state: DataExplorationState) => state.language
    }),
    methods: {
        ...mapActions({loadBaseline: 'baseline/getBaselineData'}),
        ...mapActions({loadSurveyAndProgram: 'surveyAndProgram/getSurveyAndProgramData'}),
        ...mapActions({getADRSchemas: 'adr/getSchemas'}),
        ...mapActions({getGenericChartMetadata: 'genericChart/getGenericChartMetadata'})
    },
    beforeMount: function () {
        this.loadBaseline();
        this.loadSurveyAndProgram();
        this.getADRSchemas();
        this.getGenericChartMetadata();
    },
    watch: {
        language(newVal: Language) {
            document.documentElement.lang = newVal
        }
    }
});