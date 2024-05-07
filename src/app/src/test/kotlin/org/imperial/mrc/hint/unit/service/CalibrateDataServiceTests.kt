package org.imperial.mrc.hint.unit.service

import com.nhaarman.mockito_kotlin.doReturn
import com.nhaarman.mockito_kotlin.mock
import org.imperial.mrc.hint.AppProperties
import org.assertj.core.api.Assertions
import org.imperial.mrc.hint.clients.HintrAPIClient
import org.imperial.mrc.hint.db.CalibrateDataRepository
import org.imperial.mrc.hint.exceptions.HintException
import org.imperial.mrc.hint.models.CalibrateResultRow
import org.imperial.mrc.hint.models.FilterQuery
import org.imperial.mrc.hint.security.Session
import org.imperial.mrc.hint.service.CalibrateDataService
import org.imperial.mrc.hint.unit.ADRClientBuilderTests
import org.junit.jupiter.api.Test
import org.mockito.ArgumentMatchers.anyString
import org.pac4j.core.profile.CommonProfile
import org.springframework.http.ResponseEntity
import kotlin.io.path.Path
import java.nio.file.Paths
import kotlin.io.path.Path

class CalibrateDataServiceTests
{
    private val mockCalibratePathResponse = mock<ResponseEntity<String>> {
        on { body } doReturn """{"data": {"path": "test.duckdb"}}"""
    }

    private val mockResultRow = CalibrateResultRow(
        "testIndicator", "testCalendarQuarter", "testAgeGroup", "testSex",
        "testAreaId", 1, 2, 3, 4, 5
    )

    private val filterQuery = FilterQuery(listOf(), listOf(), listOf(), listOf(), listOf(), listOf())

    @Test
    fun `can get filtered calibrate data`()
    {
        val mockClient = mock<HintrAPIClient> {
            on { getCalibrateResultData(anyString()) } doReturn mockCalibratePathResponse
        }

        val mockCalibrateDataRepo = mock<CalibrateDataRepository> {
            on { getFilteredCalibrateData(Path("src/test/resources/duckdb/test.duckdb"), filterQuery) } doReturn listOf(mockResultRow)
        }

        val mockSession = mock<Session> {
            on { getUserProfile() } doReturn CommonProfile().apply { id = ADRClientBuilderTests.TEST_EMAIL }
            on { getAccessToken() } doReturn "FAKE_TOKEN"
        }

        val mockProperties = mock<AppProperties> {
            on { resultsDirectory } doReturn "src/test/resources/duckdb/"
        }

        val sut = CalibrateDataService(mockClient, mockCalibrateDataRepo, mockSession, mockProperties)

        val dataObj = sut.getFilteredCalibrateData("calibrate_id", filterQuery)

        assert(dataObj[0] == mockResultRow)
    }

    @Test
    fun `user friendly error returned if file does not exist`()
    {
        val mockClient = mock<HintrAPIClient> {
            on { getCalibrateResultData(anyString()) } doReturn mockCalibratePathResponse
        }

        val mockProperties = mock<AppProperties> {
            on { resultsDirectory } doReturn "not/a/dir"
        }

        val sut = CalibrateDataService(mockClient, mock(), mock(), mockProperties)

        Assertions.assertThatThrownBy { sut.getFilteredCalibrateData("calibrate_id", filterQuery) }
            .isInstanceOf(HintException::class.java)
            .matches { (it as HintException).key == "missingCalibrateData"}
    }
}
