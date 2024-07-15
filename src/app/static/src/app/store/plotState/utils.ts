import {CalibrateMetadataResponse} from "../../generated";
import {Commit} from "vuex";
import {initialScaleSettings, Scale, ScaleSettings} from "./plotState";
import {Dict} from "../../types";
import {PlotStateMutations} from "./mutations";

export const commitInitialScaleSelections = (
    indicators: CalibrateMetadataResponse["indicators"],
    commit: Commit
) => {

    const newScaleSettings = indicators.reduce((dict, meta) => {
        dict[meta.indicator] = initialiseScaleFromMetadata(meta);
        return dict
    }, {} as Dict<ScaleSettings>)
    commit({
            type: `plotState/${PlotStateMutations.setOutputScale}`,
            payload: {scale: Scale.Colour, selections: newScaleSettings}
        },
        { root: true }
    );
    commit({
            type: `plotState/${PlotStateMutations.setOutputScale}`,
            payload: {scale: Scale.Size, selections: newScaleSettings}
        },
        { root: true }
    );
};

const initialiseScaleFromMetadata = (meta: CalibrateMetadataResponse["indicators"][0]): ScaleSettings => {
    const scaleSettings = initialScaleSettings();
    scaleSettings.customMin = meta.min;
    scaleSettings.customMax = meta.max;
    return scaleSettings;
};
