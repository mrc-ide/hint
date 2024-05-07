package org.imperial.mrc.hint.controllers

import org.springframework.web.bind.annotation.*
import org.springframework.http.ResponseEntity
import org.imperial.mrc.hint.clients.HintrAPIClient
import org.imperial.mrc.hint.models.ModelOptions
import org.imperial.mrc.hint.models.SuccessResponse
import org.imperial.mrc.hint.models.asResponseEntity
import org.imperial.mrc.hint.service.CalibrateDataService
import org.imperial.mrc.hint.models.FilterQuery

@RestController
@RequestMapping("/calibrate")
class CalibrateController(val apiClient: HintrAPIClient, val calibrateDataService: CalibrateDataService)
{
    @GetMapping("/options/{iso3}")
    @ResponseBody
    fun calibrationOptions(@PathVariable("iso3") iso3: String): ResponseEntity<String>
    {
        return apiClient.getModelCalibrationOptions(iso3)
    }

    @PostMapping("/submit/{id}")
    @ResponseBody
    fun calibrateSubmit(@PathVariable("id") runId: String, @RequestBody modelCalibrateOptions: ModelOptions):
            ResponseEntity<String>
    {
        return apiClient.calibrateSubmit(runId, modelCalibrateOptions)
    }

    @GetMapping("/status/{id}")
    @ResponseBody
    fun calibrateStatus(@PathVariable("id") id: String): ResponseEntity<String>
    {
        return apiClient.getCalibrateStatus(id)
    }

    @GetMapping("/result/metadata/{id}")
    @ResponseBody
    fun calibrateResultMetadata(@PathVariable("id") id: String): ResponseEntity<String>
    {
        return apiClient.getCalibrateResultMetadata(id)
    }

    @PostMapping("/result/filteredData/{id}")
    @ResponseBody
    fun filteredCalibrateResultData(
        @PathVariable("id") id: String,
        @RequestBody filterQuery: FilterQuery): ResponseEntity<String>
    {
        val dataObj = calibrateDataService.getFilteredCalibrateData(id, filterQuery)
        return SuccessResponse(dataObj).asResponseEntity()
    }

    @GetMapping("/plot/{id}")
    @ResponseBody
    fun calibratePlot(@PathVariable("id") id: String): ResponseEntity<String>
    {
        return apiClient.getCalibratePlot(id)
    }
}
