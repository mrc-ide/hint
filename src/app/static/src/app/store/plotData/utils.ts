import {Commit} from "vuex";
import {RootState} from "../../root";
import {Feature} from "geojson";
import {SurveyAndProgramMutation} from "../surveyAndProgram/mutations";
import {SurveyAndProgramState} from "../surveyAndProgram/surveyAndProgram";
import {AncResponse, ProgrammeResponse, SurveyResponse} from "../../generated";

export const addAreaLevelsToSAPData = (state: RootState, dataSource: keyof SurveyAndProgramState, commit: Commit) => {
    const response = state.surveyAndProgram[dataSource] as AncResponse | SurveyResponse | ProgrammeResponse;
    const payload = {
        ...response,
        data: getDataWithAreaLevel(response.data, state.baseline.shape?.data.features as Feature[])
    };
    if (dataSource === "anc") {
        commit(`surveyAndProgram/${SurveyAndProgramMutation.ANCUpdated}`, {payload}, {root: true});
    } else if (dataSource === "program") {
        commit(`surveyAndProgram/${SurveyAndProgramMutation.ProgramUpdated}`, {payload}, {root: true});
    } else if (dataSource === "survey") {
        commit(`surveyAndProgram/${SurveyAndProgramMutation.SurveyUpdated}`, {payload}, {root: true});
    }
};

type DataRow = any;

const getDataWithAreaLevel = (data: DataRow[], features: Feature[]) => {
    const newData = structuredClone(data);
    console.log({features});
    for (let i = 0; i < data.length; i++) {
        const areaLevel = features.find(f => f.properties!.area_id === data[i].area_id)!.properties!.area_level;
        newData[i]["area_level"] = areaLevel;
    }
    return newData;
};