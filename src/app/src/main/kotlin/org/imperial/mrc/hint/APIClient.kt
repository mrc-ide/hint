package org.imperial.mrc.hint

import com.fasterxml.jackson.databind.ObjectMapper
import com.github.kittinunf.fuel.httpGet
import com.github.kittinunf.fuel.httpPost
import org.imperial.mrc.hint.models.SessionFile
import org.imperial.mrc.hint.models.SessionFileWithPath
import org.springframework.http.ResponseEntity
import org.springframework.stereotype.Component

interface APIClient {
    fun validateBaselineIndividual(file: SessionFileWithPath, type: FileType): ResponseEntity<String>
    fun validateSurveyAndProgramme(file: SessionFileWithPath, shapePath: String, type: FileType): ResponseEntity<String>
    fun submit(data: Map<String, String>, options: Map<String, Any>): ResponseEntity<String>
    fun getStatus(id: String): ResponseEntity<String>
    fun getResult(id: String): ResponseEntity<String>
    fun getPlottingMetadata(country: String): ResponseEntity<String>
    fun getModelRunOptions(files: Map<String, SessionFileWithPath>): ResponseEntity<String>
}

@Component
class HintrAPIClient(
        appProperties: AppProperties,
        private val objectMapper: ObjectMapper) : APIClient {

    private val baseUrl = appProperties.apiUrl

    override fun validateBaselineIndividual(file: SessionFileWithPath,
                                            type: FileType): ResponseEntity<String> {

        val json = objectMapper.writeValueAsString(
                mapOf("type" to type.toString().toLowerCase(),
                        "file" to file))

        return postJson("validate/baseline-individual", json)
    }

    override fun validateSurveyAndProgramme(file: SessionFileWithPath,
                                            shapePath: String,
                                            type: FileType): ResponseEntity<String> {

        val json = objectMapper.writeValueAsString(
                mapOf("type" to type.toString().toLowerCase(),
                        "file" to file,
                        "shape" to shapePath))

        return postJson("validate/survey-and-programme", json)
    }

    override fun submit(data: Map<String, String>, options: Map<String, Any>): ResponseEntity<String> {

        val json = objectMapper.writeValueAsString(
                mapOf("options" to options,
                        "data" to data))

        return postJson("model/submit", json)
    }

    override fun getStatus(id: String): ResponseEntity<String> {
        return get("/model/status/${id}")
    }

    override fun getResult(id: String): ResponseEntity<String> {
        return get("/model/result/${id}")
    }

    override fun getPlottingMetadata(country: String): ResponseEntity<String> {
        return get("/meta/plotting/${country}")
    }

    override fun getModelRunOptions(files: Map<String, SessionFileWithPath>): ResponseEntity<String> {
        val json = objectMapper.writeValueAsString(files)
        return postJson("model/options", json)
    }

    fun get(url: String): ResponseEntity<String> {
        return "$baseUrl/$url".httpGet()
                .response()
                .second
                .asResponseEntity()
    }

    private fun postJson(url: String, json: String): ResponseEntity<String> {
        return "$baseUrl/$url".httpPost()
                .header("Content-Type" to "application/json")
                .body(json)
                .response()
                .second
                .asResponseEntity()
    }
}
