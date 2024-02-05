package org.imperial.mrc.hint.integration

import com.fasterxml.jackson.databind.ObjectMapper
import org.assertj.core.api.Assertions.assertThat
import org.imperial.mrc.hint.helpers.getJsonEntity
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.boot.test.web.client.getForEntity
import org.springframework.boot.test.web.client.postForEntity
import org.springframework.http.ResponseEntity

class DownloadTests : SecureIntegrationTests()
{

    @BeforeEach
    fun setup()
    {
        authorize()
        testRestTemplate.getForEntity<String>("/")
    }

    @Test
    fun `can submit coarse output download`()
    {
        val id = waitForModelRunResult()
        val responseEntity = testRestTemplate.postForEntity<String>("/download/submit/coarse-output/$id")
        assertSuccess(responseEntity, "DownloadSubmitResponse")
    }

    @Test
    fun `can download coarse output result`()
    {
        val modelId = waitForModelRunResult()
        val calibrateId = waitForCalibrationResult(modelId)
        val responseId = waitForSubmitDownloadOutput(calibrateId, "coarse-output")
        val responseEntity = testRestTemplate.getForEntity<ByteArray>("/download/result/$responseId")
        assertSuccess(responseEntity)
        assertResponseHasExpectedDownloadHeaders(responseEntity)
    }

    @Test
    fun `can submit summary download`()
    {
        val id = waitForModelRunResult()
        val postEntity = getJsonEntity(emptyMap())
        val responseEntity = testRestTemplate.postForEntity<String>("/download/submit/summary/$id", postEntity)
        assertSuccess(responseEntity, "DownloadSubmitResponse")
    }

    @Test
    fun `can download summary output result`()
    {
        val modelId = waitForModelRunResult()
        val calibrateId = waitForCalibrationResult(modelId)
        val responseId = waitForSubmitDownloadOutput(calibrateId, "summary")
        val responseEntity = testRestTemplate.getForEntity<ByteArray>("/download/result/$responseId")
        assertSuccess(responseEntity)
        assertResponseHasExpectedDownloadHeaders(responseEntity)
    }

    @Test
    fun `can submit spectrum download`()
    {
        val datasets = mapOf(
                "anc" to mapOf("filename" to "anc", "path" to "uploads/anc"),
                "pjnz" to mapOf("filename" to "pjnz", "path" to "uploads/pjnz"),
                "population" to mapOf("filename" to "population", "path" to "uploads/population"),
                "programme" to mapOf("filename" to "programme", "path" to "uploads/programme"),
                "shape" to mapOf("filename" to "shape", "path" to "uploads/shape"),
                "survey" to mapOf("filename" to "survey", "path" to "uploads/survey")
        )

        val note = mapOf(
                "note" to "test notes",
                "updated" to "2022/05/17 12:34:21",
                "name" to "projectName"
        )

        val state = mapOf(
                "state" to mapOf(
                        "datasets" to datasets,
                        "model_fit" to mapOf("id" to "", "options" to mapOf("" to "")),
                        "calibrate" to mapOf("id" to "", "options" to mapOf("" to "")),
                        "version" to mapOf("hintr" to "1", "naomi" to "1", "rrq" to "1")
                ),
                "notes" to mapOf(
                        "project_notes" to note,
                        "version_notes" to listOf(note, note)
                ),
                "vmmc" to mapOf("filename" to "vmmc", "hash" to "123", "path" to "uploads/vmmc"),
        )

        val id = waitForModelRunResult()
        val postEntity = getJsonEntity(state)
        val responseEntity = testRestTemplate.postForEntity<String>("/download/submit/spectrum/$id", postEntity)
        assertSuccess(responseEntity, "DownloadSubmitResponse")
    }

    @Test
    fun `can download spectrum output result`()
    {
        val modelId = waitForModelRunResult()
        val calibrateId = waitForCalibrationResult(modelId)
        val responseId = waitForSubmitDownloadOutput(calibrateId, "spectrum")
        val responseEntity = testRestTemplate.getForEntity<ByteArray>("/download/result/$responseId")
        assertSuccess(responseEntity)
        assertResponseHasExpectedDownloadHeaders(responseEntity)
    }

    @Test
    fun `can get download status`()
    {
        val responseId = downloadOutputResponseId()
        val responseEntity = testRestTemplate.getForEntity<String>("/download/status/$responseId")
        assertSuccess(responseEntity, "DownloadStatusResponse")
    }

    fun assertResponseHasExpectedDownloadHeaders(response: ResponseEntity<ByteArray>)
    {
        val headers = response.headers
        assertThat(headers["Content-Type"]?.first()).isEqualTo("application/octet-stream")

        val contentLength = headers["Content-Length"]?.first()!!.toInt()
        assertThat(contentLength).isGreaterThan(0)
        val bodyLength = response.body?.count()
        assertThat(contentLength).isEqualTo(bodyLength)
    }

    fun downloadOutputResponseId(): String
    {
        val calibrateId = waitForModelRunResult()
        val response = testRestTemplate.postForEntity<String>("/download/submit/spectrum/$calibrateId")

        val bodyJSON = ObjectMapper().readTree(response.body)
        return bodyJSON["data"]["id"].asText()
    }
}
