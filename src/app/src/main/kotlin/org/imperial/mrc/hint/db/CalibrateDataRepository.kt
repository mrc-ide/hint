package org.imperial.mrc.hint.db

import org.jooq.tools.jdbc.SingleConnectionDataSource
import org.springframework.stereotype.Component
import org.imperial.mrc.hint.models.CalibrateResultRow
import org.imperial.mrc.hint.models.ResultData
import org.imperial.mrc.hint.models.FilterQuery
import java.sql.Connection
import java.sql.DriverManager
import java.util.Properties
import org.ktorm.database.*
import org.ktorm.dsl.*
import java.nio.file.Path

interface CalibrateDataRepository
{
    fun getFilteredCalibrateData(
        path: Path,
        filterQuery: FilterQuery): List<CalibrateResultRow>
}

@Component
class JooqCalibrateDataRepository: CalibrateDataRepository
{
    @Suppress("UnsafeCallOnNullableType")
    private fun getFilteredDataFromConnection(
        conn: Connection,
        filterQuery: FilterQuery): List<CalibrateResultRow>
    {
        val dataSource = SingleConnectionDataSource(conn)
        return Database.connect(dataSource)
            .from(ResultData)
            .select()
            .whereWithConditions {
                if (filterQuery.indicator.size > 0) {
                    it += ResultData.indicator inList filterQuery.indicator
                }
                if (filterQuery.calendarQuarter.size > 0) {
                    it += ResultData.calendarQuarter inList filterQuery.calendarQuarter
                }
                if (filterQuery.ageGroup.size > 0) {
                    it += ResultData.ageGroup inList filterQuery.ageGroup
                }
                if (filterQuery.sex.size > 0) {
                    it += ResultData.sex inList filterQuery.sex
                }
                if (filterQuery.areaId.size > 0) {
                    it += ResultData.areaId inList filterQuery.areaId
                }
                if (filterQuery.areaLevel.size > 0) {
                    it += ResultData.areaLevel inList filterQuery.areaLevel
                }
            }
            .map { it ->
                CalibrateResultRow(
                    it.getString("indicator")!!,
                    it.getString("calendar_quarter")!!,
                    it.getString("age_group")!!,
                    it.getString("sex")!!,
                    it.getString("area_id")!!,
                    it.getFloat("mode"),
                    it.getFloat("mean"),
                    it.getFloat("lower"),
                    it.getFloat("upper"),
                    it.getInt("area_level")
                )
            }
    }

    private fun getDBConnFromPathResponse(path: Path): Connection {
        val readOnlyProp = Properties()
        readOnlyProp.setProperty("duckdb.read_only", "true")
        val conn = DriverManager.getConnection("jdbc:duckdb:${path.toRealPath()}", readOnlyProp)
        return conn
    }

    override fun getFilteredCalibrateData(
        path: Path,
        filterQuery: FilterQuery): List<CalibrateResultRow>
    {
        getDBConnFromPathResponse(path).use { conn ->
            return getFilteredDataFromConnection(conn, filterQuery)
        }
    }
}
