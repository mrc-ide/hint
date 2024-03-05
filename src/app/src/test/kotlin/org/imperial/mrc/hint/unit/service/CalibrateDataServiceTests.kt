package org.imperial.mrc.hint.unit.service

import com.nhaarman.mockito_kotlin.doReturn
import com.nhaarman.mockito_kotlin.mock
import org.imperial.mrc.hint.clients.HintrAPIClient
import org.imperial.mrc.hint.db.CalibrateDataRepository
import org.imperial.mrc.hint.models.CalibrateResultRow
import org.imperial.mrc.hint.models.FilterQuery
import org.imperial.mrc.hint.security.Session
import org.imperial.mrc.hint.service.CalibrateDataService
import org.imperial.mrc.hint.unit.ADRClientBuilderTests
import org.junit.jupiter.api.Test
import org.mockito.ArgumentMatchers.anyString
import org.pac4j.core.profile.CommonProfile
import org.springframework.http.ResponseEntity

class CalibrateDataServiceTests
{
    private val mockCalibratePathResponse = mock<ResponseEntity<String>> {
        on { body } doReturn """{"data": {"path": "testPath"}}"""
    }

    private val mockResultRow = CalibrateResultRow(
        "testIndicator", "testCalendarQuarter", "testAgeGroup", "testSex",
        "testAreaId", 1, 2, 3, 4, 5
    )

    private val filterQuery = FilterQuery(listOf(), listOf(), listOf(), listOf(), listOf(), listOf())

    @Test
    fun `can get calibrate data`()
    {
        val mockClient = mock<HintrAPIClient> {
            on { getCalibrateResultData(anyString()) } doReturn mockCalibratePathResponse
        }

        val mockCalibrateDataRepo = mock<CalibrateDataRepository> {
            on { getDataFromPath("testPath", "all") } doReturn listOf(mockResultRow)
        }

        val mockSession = mock<Session> {
            on { getUserProfile() } doReturn CommonProfile().apply { id = ADRClientBuilderTests.TEST_EMAIL }
            on { getAccessToken() } doReturn "FAKE_TOKEN"
        }

        val sut = CalibrateDataService(mockClient, mockCalibrateDataRepo, mockSession)

        val dataObj = sut.getCalibrateData("anyPath", "all")

        assert(dataObj[0] == mockResultRow)
    }

    @Test
    fun `can get filtered calibrate data`()
    {
        val mockClient = mock<HintrAPIClient> {
            on { getCalibrateResultData(anyString()) } doReturn mockCalibratePathResponse
        }

        val mockCalibrateDataRepo = mock<CalibrateDataRepository> {
            on { getFilteredCalibrateData("testPath", filterQuery) } doReturn listOf(mockResultRow)
        }

        val mockSession = mock<Session> {
            on { getUserProfile() } doReturn CommonProfile().apply { id = ADRClientBuilderTests.TEST_EMAIL }
            on { getAccessToken() } doReturn "FAKE_TOKEN"
        }

        val sut = CalibrateDataService(mockClient, mockCalibrateDataRepo, mockSession)

        val dataObj = sut.getFilteredCalibrateData("anyPath", filterQuery)

        assert(dataObj[0] == mockResultRow)
    }
}
