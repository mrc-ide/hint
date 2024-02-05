package org.imperial.mrc.hint.integration

import org.assertj.core.api.AssertionsForClassTypes.assertThat
import org.imperial.mrc.hint.helpers.getTestEntity
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.boot.test.web.client.exchange
import org.springframework.boot.test.web.client.getForEntity
import org.springframework.boot.test.web.client.postForEntity
import org.springframework.http.HttpMethod
import org.springframework.http.HttpStatus

class DiseaseTests : VersionFileTests()
{

    @BeforeEach
    fun setup()
    {
        authorize()
        testRestTemplate.getForEntity<String>("/")
        testRestTemplate.postForEntity<String>("/baseline/pjnz/",
                getTestEntity("Malawi2019.PJNZ"))
        testRestTemplate.postForEntity<String>("/baseline/shape/",
                getTestEntity("malawi.geojson"))
    }

    @Test
    fun `can upload survey file`()
    {
        val postEntity = getTestEntity("survey.csv")
        val entity = testRestTemplate.postForEntity<String>("/disease/survey/", postEntity)
        assertSuccess(entity, "ValidateInputResponse")

        val data = getResponseData(entity)
        assertThat(data["type"].asText()).isEqualTo("survey")
    }

    @Test
    fun `can upload program file`()
    {
        val postEntity = getTestEntity("programme.csv")
        val entity = testRestTemplate.postForEntity<String>("/disease/programme/", postEntity)
        assertSuccess(entity, "ValidateInputResponse")

        val data = getResponseData(entity)
        assertThat(data["type"].asText()).isEqualTo("programme")
    }

    @Test
    fun `can upload ANC file`()
    {
        val postEntity = getTestEntity("anc.csv")
        val entity = testRestTemplate.postForEntity<String>("/disease/anc/", postEntity)
        assertSuccess(entity, "ValidateInputResponse")

        val data = getResponseData(entity)
        assertThat(data["type"].asText()).isEqualTo("anc")
    }

    @Test
    fun `can upload VMMC file`()
    {
        val postEntity = getTestEntity("vmmc.xlsx")
        val entity = testRestTemplate.postForEntity<String>("/disease/vmmc/", postEntity)
        assertSuccess(entity, "ValidateInputResponse")

        val data = getResponseData(entity)
        assertThat(data["type"].asText()).isEqualTo("vmmc")
    }

    @Test
    fun `can get survey data`()
    {
        val postEntity = getTestEntity("survey.csv")
        testRestTemplate.postForEntity<String>("/disease/survey/", postEntity)
        val responseEntity = testRestTemplate.getForEntity<String>("/disease/survey/")
        assertSuccess(responseEntity, "ValidateInputResponse")
    }

    @Test
    fun `can get programme data`()
    {
        val postEntity = getTestEntity("programme.csv")
        testRestTemplate.postForEntity<String>("/disease/programme/", postEntity)
        val responseEntity = testRestTemplate.getForEntity<String>("/disease/programme/")
        assertSuccess(responseEntity, "ValidateInputResponse")
    }

    @Test
    fun `can get ANC data`()
    {
        val postEntity = getTestEntity("anc.csv")
        testRestTemplate.postForEntity<String>("/disease/anc/", postEntity)
        val responseEntity = testRestTemplate.getForEntity<String>("/disease/anc/")
        assertSuccess(responseEntity, "ValidateInputResponse")
    }

    @Test
    fun `can upload and retrieve data without strict validation`()
    {
        val postEntity = getTestEntity("anc-pos-greater-than-total.csv")
        val strictValidationUploadResponse = testRestTemplate.postForEntity<String>("/disease/anc/", postEntity)
        assertError(strictValidationUploadResponse, HttpStatus.BAD_REQUEST, "INVALID_FILE")

        val laxValidationUploadResponse = testRestTemplate.postForEntity<String>("/disease/anc/?strict=false", postEntity)
        assertSuccess(laxValidationUploadResponse, "ValidateInputResponse")

        val strictValidationGetResponse = testRestTemplate.getForEntity<String>("/disease/anc/")
        assertError(strictValidationGetResponse, HttpStatus.BAD_REQUEST, "INVALID_FILE")

        val laxValidationGetResponse = testRestTemplate.getForEntity<String>("/disease/anc/?strict=false")
        assertSuccess(laxValidationGetResponse, "ValidateInputResponse")
    }

    @Test
    fun `can delete survey data`()
    {
        val responseEntity = testRestTemplate.exchange<String>("/disease/survey/", HttpMethod.DELETE)
        assertSuccess(responseEntity, null)
    }

    @Test
    fun `can delete programme data`()
    {
        val responseEntity = testRestTemplate.exchange<String>("/disease/programme/", HttpMethod.DELETE)
        assertSuccess(responseEntity, null)
    }

    @Test
    fun `can delete ANC data`()
    {
        val responseEntity = testRestTemplate.exchange<String>("/disease/anc/", HttpMethod.DELETE)
        assertSuccess(responseEntity, null)
    }
}
