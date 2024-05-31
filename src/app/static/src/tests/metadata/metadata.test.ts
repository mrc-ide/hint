import {metadataGetters} from "../../app/store/metadata/metadata"
import {DataType} from "../../app/store/surveyAndProgram/surveyAndProgram";
import {mockMetadataState, mockPlottingMetadataResponse, mockRootState, mockSurveyAndProgramState} from "../mocks";

const testIndicators = [
    {indicator: "art_coverage", name: "ART Coverage"},
    {indicator: "prevalence", name: "Prevalence"},
    {indicator: "not_included", name: "Should Not Be Included"}
];

const testIndicatorsForDataset = {
    filters: {
        indicators: [
            {id: "art_coverage", name: "ART Coverage"},
            {id: "prevalence", name: "Prevalence"}
        ]
    }
};

const testChoroMetadata = {
    choropleth: {
        indicators: testIndicators
    }
} as any;

function testGetsSAPIndicatorsMetadataForDataType(dataType: DataType) {
    let metadataProps = null as any;
    let sapState = null as any;
    switch (dataType) {
        case(DataType.ANC):
            metadataProps = {anc: testChoroMetadata};
            sapState = {anc: testIndicatorsForDataset};
            break;
        case(DataType.Survey):
            metadataProps = {survey: testChoroMetadata};
            sapState = {survey: testIndicatorsForDataset};
            break;
        case(DataType.Program):
            metadataProps = {programme: testChoroMetadata};
            sapState = {program: testIndicatorsForDataset};
            break;
    }

    const metadataState = mockMetadataState(
        {plottingMetadata: mockPlottingMetadataResponse(metadataProps)});

    const rootState = mockRootState({
        surveyAndProgram: mockSurveyAndProgramState({
            ...sapState,
            selectedDataType: dataType
        })
    });

    const result = metadataGetters.sapIndicatorsMetadata(metadataState, null, rootState);

    expect(result).toStrictEqual([testIndicators[0], testIndicators[1]]);
}

describe("Metadata ", () => {

    it("gets SAP indicators metadata for anc", () => {
        testGetsSAPIndicatorsMetadataForDataType(DataType.ANC);
    });

    it("gets SAP indicators metadata for programme", () => {
        testGetsSAPIndicatorsMetadataForDataType(DataType.Program);
    });

    it("gets SAP indicators metadata for survey", () => {
        testGetsSAPIndicatorsMetadataForDataType(DataType.Survey);
    });

    it("gets empty SAP indicators when there is no metadata", () => {
        const metadataState = mockMetadataState(
            {plottingMetadata: null});

        const result = metadataGetters.sapIndicatorsMetadata(metadataState, null, mockRootState());

        expect(result).toEqual([]);
    });

    it("gets SAP choropleth indicators", () => {

        const rootState = mockRootState({
            surveyAndProgram: mockSurveyAndProgramState({
                selectedDataType: DataType.ANC,
                anc: testIndicatorsForDataset as any
            })
        });

        const testMetadata = {
            anc: testChoroMetadata,
            survey: {choropleth: {indicators: []}},
            programme: {choropleth: {indicators: []}},
            output: {choropleth: {indicators: []}},
        };

        const result = metadataGetters.sapIndicatorsMetadata(
            mockMetadataState({plottingMetadata: testMetadata}),
            null,
            rootState);

        expect(result).toStrictEqual([testIndicators[0], testIndicators[1]]);
    });

});
