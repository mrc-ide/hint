package org.imperial.mrc.hint.db

import org.jooq.tools.json.JSONArray
import org.springframework.stereotype.Component
import org.imperial.mrc.hint.models.CalibrateResultRow
import org.imperial.mrc.hint.models.FilterQuery
import java.sql.Connection
import java.sql.DriverManager
import java.sql.Statement
import java.util.Properties
import java.sql.ResultSet
import java.sql.SQLException
import java.sql.PreparedStatement

const val FILTER_QUERY = """SELECT
age_group,area_id,
calendar_quarter,
indicator,
ROUND(lower, 4) AS lower,
ROUND(mean, 4) AS mean,
ROUND(mode, 4) AS mode,
sex,
ROUND(upper, 4) AS upper,
area_level,
FROM data WHERE
indicator=?,
"""

const val INDICATOR_QUERY = """SELECT
age_group,area_id,
calendar_quarter,
indicator,
ROUND(lower, 4) AS lower,
ROUND(mean, 4) AS mean,
ROUND(mode, 4) AS mode,
sex,
ROUND(upper, 4) AS upper,
area_level,
FROM data WHERE indicator IN (?)"""

const val DEFAULT_QUERY = """SELECT
age_group,area_id,
calendar_quarter,
indicator,
ROUND(lower, 4) AS lower,
ROUND(mean, 4) AS mean,
ROUND(mode, 4) AS mode,
sex,
ROUND(upper, 4) AS upper,
area_level,
FROM data"""

interface CalibrateDataRepository
{
    fun getDataFromPath(
        path: String,
        indicator: String): List<CalibrateResultRow>
    
    fun getFilteredCalibrateData(
        path: String,
        data: FilterQuery): List<CalibrateResultRow>
}

@Component
class JooqCalibrateDataRepository: CalibrateDataRepository
{

    private fun convertDataToArrayList(resultSet: ResultSet): List<CalibrateResultRow> {
            resultSet.use {
            return generateSequence {
                if (it.next()) {
                    CalibrateResultRow(
                        it.getString("indicator"),
                        it.getString("calendar_quarter"),
                        it.getString("age_group"),
                        it.getString("sex"),
                        it.getString("area_id"),
                        it.getFloat("mode"),
                        it.getFloat("mean"),
                        it.getFloat("lower"),
                        it.getFloat("upper"),
                        it.getInt("area_level")
                    )
                } else {
                    null
                }
            }.toList()
        }
    }

    private fun getDataFromConnection(
        conn: Connection,
        indicator: String): List<CalibrateResultRow> {
        val resultSet: ResultSet
        if (indicator == "all") {
            val query = DEFAULT_QUERY
            val stmt: Statement = conn.createStatement()
            resultSet = stmt.executeQuery(query)
        } else {
            val stmt: PreparedStatement = conn.prepareStatement(INDICATOR_QUERY)
            stmt.setString(1, indicator)
            resultSet = stmt.executeQuery()
        }
        
        val arrayList = convertDataToArrayList(resultSet)
        return arrayList
    }

    private fun getFilteredDataFromConnection(
        conn: Connection,
        filterQuery: FilterQuery): List<CalibrateResultRow> {
        val resultSet: ResultSet
        var query = """SELECT
        age_group,area_id,
        calendar_quarter,
        indicator,
        ROUND(lower, 4) AS lower,
        ROUND(mean, 4) AS mean,
        ROUND(mode, 4) AS mode,
        sex,
        ROUND(upper, 4) AS upper,
        area_level,
        FROM data WHERE """

        if (filterQuery.indicator.size > 0) {
            val questionMarks = filterQuery.indicator.map { "?" }.joinToString(", ")
            query += "indicator IN (" + questionMarks + ")"
        }

        if (filterQuery.calendarQuarter.size > 0) {
            val questionMarks = filterQuery.calendarQuarter.map { "?" }.joinToString(", ")
            query += " AND calendar_quarter IN (" + questionMarks + ")"
        }

        if (filterQuery.ageGroup.size > 0) {
            val questionMarks = filterQuery.ageGroup.map { "?" }.joinToString(", ")
            query += " AND age_group IN (" + questionMarks + ")"
        }

        if (filterQuery.sex.size > 0) {
            val questionMarks = filterQuery.sex.map { "?" }.joinToString(", ")
            query += " AND sex IN (" + questionMarks + ")"
        }

        if (filterQuery.areaId.size > 0) {
            val questionMarks = filterQuery.areaId.map { "?" }.joinToString(", ")
            query += " AND area_id IN (" + questionMarks + ")"
        }

        if (filterQuery.areaLevel.size > 0) {
            val questionMarks = filterQuery.areaLevel.map { "?" }.joinToString(", ")
            query += " AND area_level IN (" + questionMarks + ")"
        }

        val stmt: PreparedStatement = conn.prepareStatement(query)
        var stmtIndex = 1;

        if (filterQuery.indicator.size > 0) {
            filterQuery.indicator.forEach { it ->
                stmt.setString(stmtIndex, it)
                stmtIndex++
            }
        }

        if (filterQuery.calendarQuarter.size > 0) {
            filterQuery.calendarQuarter.forEach { it ->
                stmt.setString(stmtIndex, it)
                stmtIndex++
            }
        }

        if (filterQuery.ageGroup.size > 0) {
            filterQuery.ageGroup.forEach { it ->
                stmt.setString(stmtIndex, it)
                stmtIndex++
            }
        }

        if (filterQuery.sex.size > 0) {
            filterQuery.sex.forEach { it ->
                stmt.setString(stmtIndex, it)
                stmtIndex++
            }
        }

        if (filterQuery.areaId.size > 0) {
            filterQuery.areaId.forEach { it ->
                stmt.setString(stmtIndex, it)
                stmtIndex++
            }
        }

        if (filterQuery.areaLevel.size > 0) {
            filterQuery.areaLevel.forEach { it ->
                stmt.setInt(stmtIndex, it)
                stmtIndex++
            }
        }

        resultSet = stmt.executeQuery()
        
        val arrayList = convertDataToArrayList(resultSet)
        return arrayList
    }

    private fun getDBConnFromPathResponse(path: String): Connection {   
        val readOnlyProp = Properties()
        readOnlyProp.setProperty("duckdb.read_only", "true")
        val conn = DriverManager.getConnection("jdbc:duckdb:.${path}", readOnlyProp)
        return conn
    }

    override fun getDataFromPath(
        path: String,
        indicator: String): List<CalibrateResultRow>
    {
        getDBConnFromPathResponse(path).use { conn ->
            return getDataFromConnection(conn, indicator)
        }
    }

    override fun getFilteredCalibrateData(
        path: String,
        data: FilterQuery): List<CalibrateResultRow>
    {
        getDBConnFromPathResponse(path).use { conn ->
            return getFilteredDataFromConnection(conn, data)
        }
    }
}
