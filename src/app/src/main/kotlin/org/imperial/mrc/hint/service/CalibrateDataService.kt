package org.imperial.mrc.hint.service

import com.fasterxml.jackson.databind.ObjectMapper
import org.imperial.mrc.hint.AppProperties
import org.imperial.mrc.hint.clients.HintrAPIClient
import org.imperial.mrc.hint.db.CalibrateDataRepository
import org.imperial.mrc.hint.exceptions.HintException
import org.imperial.mrc.hint.logging.GenericLoggerImpl
import org.imperial.mrc.hint.logging.logDuration
import org.imperial.mrc.hint.models.CalibrateResultRow
import org.imperial.mrc.hint.security.Session
import org.slf4j.LoggerFactory
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.imperial.mrc.hint.models.FilterQuery
import java.nio.file.Paths
import kotlin.io.path.exists

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
    private val session: Session,
    private val appProperties: AppProperties
) : CalibrateService
{

    private val logger = GenericLoggerImpl(LoggerFactory.getLogger(CalibrateDataRepository::class.java))

    override fun getCalibrateData(
        id: String,
        indicator: String): List<CalibrateResultRow>
    {
        val res = apiClient.getCalibrateResultData(id)
        val jsonBody = ObjectMapper().readTree(res.body?.toString())
        val filePath = jsonBody.get("data").get("path").textValue()
        val path = Paths.get(appProperties.resultsDirectory, filePath)

        if (!path.exists()) {
            logger.error("Calibrate data missing where it should exist", mapOf(
                "path" to path.toAbsolutePath(),
                "calibrateId" to id))
            throw HintException("missingCalibrateData", HttpStatus.BAD_REQUEST)
        }

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
        val filePath = jsonBody.get("data").get("path").textValue()
        val path = Paths.get(appProperties.resultsDirectory, filePath)
        return calibrateDataRepository.getFilteredCalibrateData(path, filterQuery)
    }
}
