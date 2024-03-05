package org.imperial.mrc.hint.service

import com.fasterxml.jackson.databind.ObjectMapper
import org.imperial.mrc.hint.clients.HintrAPIClient
import org.imperial.mrc.hint.db.CalibrateDataRepository
import org.imperial.mrc.hint.logging.GenericLoggerImpl
import org.imperial.mrc.hint.logging.logDuration
import org.imperial.mrc.hint.models.CalibrateResultRow
import org.imperial.mrc.hint.security.Session
import org.jooq.tools.json.JSONObject
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import kotlin.system.measureTimeMillis
import org.imperial.mrc.hint.models.FilterQuery

interface CalibrateService
{
    fun getCalibrateData(
        id: String,
        indicator: String): List<CalibrateResultRow>
    
    fun getFilteredCalibrateData(
        id: String,
        filterQuery: FilterQuery): List<CalibrateResultRow>
}

@Service
class CalibrateDataService(
    private val apiClient: HintrAPIClient,
    private val calibrateDataRepository: CalibrateDataRepository,
    private val session: Session
) : CalibrateService
{

    private val logger = GenericLoggerImpl(LoggerFactory.getLogger(CalibrateDataRepository::class.java))

    override fun getCalibrateData(
        id: String,
        indicator: String): List<CalibrateResultRow>
    {
        val res = apiClient.getCalibrateResultData(id)
        val jsonBody = ObjectMapper().readTree(res.body?.toString())
        val path = jsonBody.get("data").get("path").textValue()

        val userId = this.session.getUserProfile().id
        val logData = mutableMapOf(
            "user" to userId,
            "indicator" to indicator
        )

        val data = logDuration({
            calibrateDataRepository.getDataFromPath(path, indicator)
        }, logger, "Fetched calibrate data", logData)

        return data
    }

    override fun getFilteredCalibrateData(
        id: String,
        filterQuery: FilterQuery): List<CalibrateResultRow>
    {
        val res = apiClient.getCalibrateResultData(id)
        val jsonBody = ObjectMapper().readTree(res.body?.toString())
        val path = jsonBody.get("data").get("path").textValue()
        return calibrateDataRepository.getFilteredCalibrateData(path, filterQuery)
    }
}
