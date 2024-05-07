package org.imperial.mrc.hint.unit.controllers

import org.junit.jupiter.api.Test
import org.imperial.mrc.hint.models.ModelOptions
import org.imperial.mrc.hint.models.CalibrateResultRow
import org.imperial.mrc.hint.models.FilterQuery
import org.imperial.mrc.hint.clients.HintrAPIClient
import org.imperial.mrc.hint.controllers.CalibrateController
import org.imperial.mrc.hint.db.CalibrateDataRepository
import org.imperial.mrc.hint.service.CalibrateDataService
import com.nhaarman.mockito_kotlin.mock
import com.nhaarman.mockito_kotlin.doReturn
import com.nhaarman.mockito_kotlin.isNotNull
import com.fasterxml.jackson.databind.ObjectMapper
import org.assertj.core.api.Assertions.assertThat
import org.springframework.http.ResponseEntity
import org.mockito.ArgumentMatchers.anyString
import org.jooq.tools.json.JSONObject
import org.jooq.tools.json.JSONArray

class CalibrateControllerTests
{
    private val mockResponse = mock<ResponseEntity<String>>()
    private val modelRunOptions = ModelOptions(mapOf(), mapOf())
    private val mockResultRow = CalibrateResultRow(
        "testIndicator", "testCalendarQuarter", "testAgeGroup", "testSex",
        "testAreaId", 1, 2, 3, 4, 5
    )
    private val mockDataFromPath = listOf(mockResultRow)
    private val mockJsonDataFromPath = ObjectMapper().writeValueAsString(JSONArray(mockDataFromPath))
    private val filterQuery = FilterQuery(listOf(), listOf(), listOf(), listOf(), listOf(), listOf())

    @Test
    fun `can submit calibrate`()
    {
        val modelCalibrationOptions = ModelOptions(mapOf(), mapOf())
        val mockAPIClient = mock<HintrAPIClient> {
            on { calibrateSubmit("testId", modelCalibrationOptions) } doReturn mockResponse
        }
        val sut = CalibrateController(mockAPIClient, mock())

        val result = sut.calibrateSubmit("testId", modelCalibrationOptions)
        assertThat(result).isSameAs(mockResponse)

    }

    @Test
    fun `can get calibrate status`()
    {
        val mockAPIClient = mock<HintrAPIClient> {
            on { getCalibrateStatus("testId") } doReturn mockResponse
        }

        val sut = CalibrateController(mockAPIClient, mock())

        val result = sut.calibrateStatus("testId")
        assertThat(result).isSameAs(mockResponse)
    }

    @Test
    fun `can get calibrate result metadata`()
    {
        val mockAPIClient = mock<HintrAPIClient> {
            on { getCalibrateResultMetadata("testId") } doReturn mockResponse
        }
        val sut = CalibrateController(mockAPIClient, mock())

        val result = sut.calibrateResultMetadata("testId")
        assertThat(result).isSameAs(mockResponse)
    }

    @Test
    fun `can get filtered calibrate result data`()
    {
        val mockAPIClient = mock<HintrAPIClient>()
        val mockCalibrateDataService = mock<CalibrateDataService> {
            on { getFilteredCalibrateData("testId", filterQuery) } doReturn mockDataFromPath
        }
        val sut = CalibrateController(mockAPIClient, mockCalibrateDataService)

        val result = sut.filteredCalibrateResultData("testId", filterQuery)
        assertThat(result.body?.toString()).isEqualTo(
            "{\"data\":$mockJsonDataFromPath,\"errors\":[],\"status\":\"success\"}"
        )
    }

    @Test
    fun `can get calibrate plot`()
    {
        val mockAPIClient = mock<HintrAPIClient> {
            on { getCalibratePlot("testId") } doReturn mockResponse
        }
        val sut = CalibrateController(mockAPIClient, mock())

        val result = sut.calibratePlot("testId")
        assertThat(result).isSameAs(mockResponse)
    }

    @Test
    fun `can get calibration options`()
    {
        val mockAPIClient = mock<HintrAPIClient> {
            on { getModelCalibrationOptions(anyString()) } doReturn mockResponse
        }
        val sut = CalibrateController(mockAPIClient, mock())
        val result = sut.calibrationOptions("MWI")
        assertThat(result).isSameAs(mockResponse)
    }
}