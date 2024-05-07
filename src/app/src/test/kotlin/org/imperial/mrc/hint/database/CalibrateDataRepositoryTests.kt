package org.imperial.mrc.hint.database

import org.imperial.mrc.hint.db.JooqCalibrateDataRepository
import org.imperial.mrc.hint.models.CalibrateResultRow
import org.imperial.mrc.hint.models.FilterQuery
import org.junit.jupiter.api.Test
import org.jooq.tools.json.JSONArray
import org.assertj.core.api.Assertions.assertThatThrownBy
import org.assertj.core.api.Assertions.assertThat
import com.fasterxml.jackson.databind.ObjectMapper
import java.nio.file.Paths
import java.sql.SQLException

class CalibrateDataRepositoryTests
{
    val expectedRow = JSONArray(listOf(
        CalibrateResultRow(
            "indicator_test",
            "calendar_quarter_test",
            "age_group_test",
            "sex_test",
            "area_id_test",
            0.2222,
            0.5555,
            0.1111,
            0.9999,
            1
        ),
        CalibrateResultRow(
            "indicator_test_2",
            "calendar_quarter_test",
            "age_group_test",
            "sex_test",
            "area_id_test",
            0.3333,
            0.8888,
            0.6666,
            0.4444,
            2
        ),
    ))
    val expectedRowIndicator2 = JSONArray(listOf(
        CalibrateResultRow(
            "indicator_test_2",
            "calendar_quarter_test",
            "age_group_test",
            "sex_test",
            "area_id_test",
            0.3333,
            0.8888,
            0.6666,
            0.4444,
            2
        )
    ))
    val query = FilterQuery(
        listOf("indicator_test_2"),
        listOf("calendar_quarter_test"),
        listOf("age_group_test"),
        listOf("sex_test"),
        listOf("area_id_test"),
        listOf("2")
    )
    val path = Paths.get("./src/test/resources/duckdb/test.duckdb")
    val sut = JooqCalibrateDataRepository()

    @Test
    fun `can get data from duckdb path with single indicator`()
    {
        val plotData = sut.getDataFromPath(path, "indicator_test_2")
        val plotDataTree = ObjectMapper().readTree(JSONArray(plotData).toString())
        val expectedTree = ObjectMapper().readTree(expectedRowIndicator2.toString())
        assert(plotDataTree.equals(expectedTree))
    }

    @Test
    fun `returns empty data if invalid indicator`()
    {
        assertThat(sut.getDataFromPath(path, "dangerous_indicator"))
            .isEqualTo(listOf<CalibrateResultRow>())
    }

    @Test
    fun `can get data from duckdb path with all indicators`()
    {
        val plotData = sut.getDataFromPath(path, "all")
        val plotDataTree = ObjectMapper().readTree(JSONArray(plotData).toString())
        val expectedTree = ObjectMapper().readTree(expectedRow.toString())
        assert(plotDataTree.equals(expectedTree))
    }

    @Test
    fun `throws error if connection is invalid`()
    {
        assertThatThrownBy {
            sut.getDataFromPath(Paths.get("src/test/resources/duckdb/test1.duckdb"), "all")
        }.isInstanceOf(java.nio.file.NoSuchFileException::class.java)
            .hasMessageContaining("src/test/resources/duckdb/test1.duckdb")
    }

    @Test
    fun `can get filtered data`()
    {
        val plotData = sut.getFilteredCalibrateData(path, query)
        val plotDataTree = ObjectMapper().readTree(JSONArray(plotData).toString())
        val expectedTree = ObjectMapper().readTree(expectedRowIndicator2.toString())
        assert(plotDataTree.equals(expectedTree))
    }
}
