package org.imperial.mrc.hint.integration

import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.boot.test.web.client.getForEntity
import org.springframework.boot.test.web.client.postForEntity
import org.springframework.http.HttpStatus
import org.assertj.core.api.Assertions.assertThat


class CalibrateTests: SecureIntegrationTests()
{
    @BeforeEach
    fun setup()
    {
        authorize()
        testRestTemplate.getForEntity<String>("/")
    }

    @Test
    fun `can get model calibration options`()
    {
        val responseEntity = testRestTemplate.getForEntity<String>("/calibrate/options/MWI")
        assertSuccess(responseEntity, "ModelRunOptions")
    }

    @Test
    fun `can submit calibrate`()
    {
        val entity = getModelRunEntity(getMockCalibrateModelOptions())
        val responseEntity = testRestTemplate.postForEntity<String>("/calibrate/submit/1234", entity)
        assertError(responseEntity,
                HttpStatus.BAD_REQUEST,
                "FAILED_TO_RETRIEVE_RESULT", "Failed to fetch result")
    }

    @Test
    fun `can get calibrate status`()
    {
        val responseEntity = testRestTemplate.getForEntity<String>("/calibrate/status/1234")
        assertSuccess(responseEntity, "ModelStatusResponse")
    }

    @Test
    fun `can get calibrate result metadata`()
    {
        val responseEntity = testRestTemplate.getForEntity<String>("/calibrate/result/metadata/1234")
        assertError(responseEntity,
                HttpStatus.BAD_REQUEST,
                "FAILED_TO_RETRIEVE_RESULT", "Failed to fetch result")
    }
}