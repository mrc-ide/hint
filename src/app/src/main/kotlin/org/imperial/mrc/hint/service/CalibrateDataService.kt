package org.imperial.mrc.hint.service

import org.jooq.tools.json.JSONArray
import org.springframework.stereotype.Service
import org.imperial.mrc.hint.clients.HintrAPIClient
import org.imperial.mrc.hint.db.CalibrateDataRepository
import org.imperial.mrc.hint.models.CalibrateResultRow
import org.imperial.mrc.hint.models.FilterQuery
import com.fasterxml.jackson.databind.ObjectMapper
import org.springframework.http.HttpStatus

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
    private val calibrateDataRepository: CalibrateDataRepository
) : CalibrateService
{
    override fun getCalibrateData(
        id: String,
        indicator: String): List<CalibrateResultRow>
    {
        val res = apiClient.getCalibrateResultData(id)
        val jsonBody = ObjectMapper().readTree(res.body?.toString())
        val path = jsonBody.get("data").get("path").textValue()
        return calibrateDataRepository.getDataFromPath(path, indicator)
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
