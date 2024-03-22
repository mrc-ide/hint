import {useStore} from "vuex";
import {RootState} from "../../root";
import {ScaleSettings} from "../../store/plotState/plotState";
import {computed} from "vue";

export const useUpdateScale = () => {
    const store = useStore<RootState>();
    const selectedIndicator = computed(() => {
        return store.getters["plotSelections/selectedIndicator"];
    });

    const updateOutputColourScale = (newScaleSettings: ScaleSettings) => {
        store.commit({
            type: 'plotState/updateOutputColourScales',
            payload: {indicatorId: selectedIndicator.value, newScaleSettings}
        })
    };

    return {
        updateOutputColourScale,
    }
};
