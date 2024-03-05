package org.imperial.mrc.hint.integration

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.module.kotlin.readValue
import com.fasterxml.jackson.module.kotlin.treeToValue
import org.assertj.core.api.Assertions
import org.imperial.mrc.hint.helpers.AuthInterceptor
import org.imperial.mrc.hint.helpers.JSONValidator
import org.imperial.mrc.hint.helpers.getTestEntity
import org.imperial.mrc.hint.models.ModelOptions
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.TestInfo
import org.springframework.boot.test.web.client.TestRestTemplate
import org.springframework.boot.test.web.client.getForEntity
import org.springframework.boot.test.web.client.postForEntity
import org.springframework.http.*
import javax.annotation.PostConstruct

abstract class SecureIntegrationTests : CleanDatabaseTests()
{

    protected lateinit var testRestTemplate: TestRestTemplate

    @PostConstruct
    fun getTemplate()
    {
        val builder = restTemplateBuilder
                .rootUri("http://localhost:" + env.getProperty("local.server.port"))

        this.testRestTemplate = TestRestTemplate(builder)
    }

    @BeforeEach
    fun beforeEach(info: TestInfo)
    {
        val userExists = userRepo.getUser("guest")
        if (userExists == null) {
            userRepo.addUser("guest", "guest")
        }
        val isAuthorized = info.displayName.contains("TRUE")
        if (isAuthorized)
        {
            authorize()
            testRestTemplate.getForEntity<String>("/")
        }
        else
        {
            clear()
        }
    }

    protected fun getModelRunEntity(modelEntity: Map<String, Any>): HttpEntity<String>
    {
        uploadMinimalFiles()
        val optionsResponseEntity = testRestTemplate.getForEntity<String>("/model/options/")
        val versionJson = parser.readTree(optionsResponseEntity.body!!)["version"]
        val version = parser.treeToValue<Map<String, String>>(versionJson)

        val modelRunOptions = ModelOptions(modelEntity, version)
        val headers = HttpHeaders()
        headers.contentType = MediaType.APPLICATION_JSON
        val jsonString = ObjectMapper().writeValueAsString(modelRunOptions)
        return HttpEntity(jsonString, headers)
    }

    protected fun getValidationOptions(): HttpEntity<String>
    {
        uploadMinimalFiles()
        val modelRunOptions = ModelOptions(getMockModelOptions(), emptyMap())

        val headers = HttpHeaders()
        headers.contentType = MediaType.APPLICATION_JSON
        val jsonString = ObjectMapper().writeValueAsString(modelRunOptions)
        return HttpEntity(jsonString, headers)
    }


    protected val parser = ObjectMapper()

    protected fun uploadMinimalFiles()
    {
        testRestTemplate.postForEntity<String>("/baseline/shape/",
                getTestEntity("malawi.geojson"))

        testRestTemplate.postForEntity<String>("/baseline/pjnz/",
                getTestEntity("Malawi2019.PJNZ"))

        testRestTemplate.postForEntity<String>("/baseline/population/",
                getTestEntity("population.csv"))

        testRestTemplate.postForEntity<String>("/disease/survey/",
                getTestEntity("survey.csv"))
    }

    protected fun waitForModelRunResult(): String
    {
        val entity = getModelRunEntity(getMockModelOptions())
        val runResult = testRestTemplate.postForEntity<String>("/model/run/", entity)
        val id = ObjectMapper().readValue<JsonNode>(runResult.body!!)["data"]["id"].textValue()

        do
        {
            Thread.sleep(200)
            val statusResponse = testRestTemplate.getForEntity<String>("/model/status/$id")
        } while (statusResponse.body!!.contains("\"status\":\"RUNNING\"")
                || statusResponse.body!!.contains("\"status\":\"PENDING\""))

        return id
    }

    protected fun waitForCalibrationResult(modelId: String): String
    {
        val entity = getModelRunEntity(getMockCalibrateModelOptions())
        val responseEntity = testRestTemplate.postForEntity<String>("/calibrate/submit/$modelId", entity)
        val id = ObjectMapper().readValue<JsonNode>(responseEntity.body!!)["data"]["id"].textValue()

        do
        {
            Thread.sleep(200)
            val statusResponse = testRestTemplate.getForEntity<String>("/calibrate/status/$id")
        } while (statusResponse.body!!.contains("\"status\":\"RUNNING\"")
                || statusResponse.body!!.contains("\"status\":\"PENDING\""))

        return id
    }

    protected fun waitForSubmitDownloadOutput(calibrateId: String, type: String): String
    {
        val response = testRestTemplate.postForEntity<String>("/download/submit/$type/$calibrateId")
        assertSuccess(response, "DownloadSubmitResponse")
        val bodyJSON = ObjectMapper().readTree(response.body)
        val responseId = bodyJSON["data"]["id"].asText()

        do
        {
            Thread.sleep(200)
            val statusResponse = testRestTemplate.getForEntity<String>("/download/status/$responseId")
        } while (statusResponse.body!!.contains("\"status\":\"RUNNING\"")
                || statusResponse.body!!.contains("\"status\":\"PENDING\""))

        return responseId
    }

    fun assertSecureWithHttpStatus(isAuthorized: IsAuthorized,
                                   responseEntity: ResponseEntity<String>,
                                   schemaName: String?, httpStatus: HttpStatus)
    {

        when (isAuthorized)
        {
            IsAuthorized.TRUE ->
            {
                Assertions.assertThat(responseEntity.headers.contentType!!.toString())
                        .contains("application/json")

                if (responseEntity.statusCode != httpStatus)
                {
                    Assertions.fail<String>("Expected $httpStatus but got error: ${responseEntity.body}")
                }
                if (schemaName != null)
                {
                    JSONValidator().validateSuccess(responseEntity.body!!, schemaName)
                }

            }
            IsAuthorized.FALSE ->
            {
                assertUnauthorized(responseEntity)
            }
        }
    }

    fun assertSecureWithSuccess(isAuthorized: IsAuthorized,
                                responseEntity: ResponseEntity<String>,
                                schemaName: String?)
    {

        when (isAuthorized)
        {
            IsAuthorized.TRUE ->
            {
                Assertions.assertThat(responseEntity.headers.contentType!!.toString())
                        .contains("application/json")

                if (responseEntity.statusCode != HttpStatus.OK)
                {
                    Assertions.fail<String>("Expected OK response but got error: ${responseEntity.body}")
                }
                if (schemaName != null)
                {
                    JSONValidator().validateSuccess(responseEntity.body!!, schemaName)
                }

            }
            IsAuthorized.FALSE ->
            {
                assertUnauthorized(responseEntity)
            }
        }
    }

    fun assertSecureWithSuccess(isAuthorized: IsAuthorized,
                                responseEntity: ResponseEntity<ByteArray>)
    {

        when (isAuthorized)
        {
            IsAuthorized.TRUE ->
            {
                assertSuccess(responseEntity)
            }
            IsAuthorized.FALSE ->
            {
                assertUnauthorized(responseEntity)
            }
        }
    }

    fun assertSuccess(responseEntity: ResponseEntity<String>,
                      schemaName: String?)
    {

        Assertions.assertThat(responseEntity.headers.contentType!!.toString())
                .isEqualTo("application/json")

        if (responseEntity.statusCode != HttpStatus.OK)
        {
            Assertions.fail<String>("Expected OK response but got error: ${responseEntity.body}")
        }
        if (schemaName != null)
        {
            JSONValidator().validateSuccess(responseEntity.body!!, schemaName)
        }
    }

    fun <T> assertUnauthorized(responseEntity: ResponseEntity<T>)
    {
        Assertions.assertThat(responseEntity.statusCode).isEqualTo(HttpStatus.UNAUTHORIZED)
    }

    fun <T> assertSuccess(responseEntity: ResponseEntity<T>)
    {
        Assertions.assertThat(responseEntity.statusCode).isEqualTo(HttpStatus.OK)
    }

    fun <T> assertLoginLocation(responseEntity: ResponseEntity<T>)
    {
        Assertions.assertThat(responseEntity.headers.location!!.toString()).isEqualTo("/login")
    }


    fun assertError(responseEntity: ResponseEntity<String>,
                    httpStatus: HttpStatus,
                    errorCode: String,
                    errorDetail: String? = null)
    {

        Assertions.assertThat(responseEntity.headers.contentType!!.toString()).isEqualTo("application/json")
        Assertions.assertThat(responseEntity.statusCode).isEqualTo(httpStatus)
        JSONValidator().validateError(responseEntity.body!!, errorCode, errorDetail)

    }

    enum class IsAuthorized
    {
        TRUE,
        FALSE
    }

    private fun clear()
    {
        testRestTemplate.restTemplate.interceptors.clear()
    }

    protected fun authorize()
    {
        testRestTemplate.restTemplate.interceptors.add(AuthInterceptor(testRestTemplate))
    }

    protected fun getResponseData(entity: ResponseEntity<String>): JsonNode
    {
        return ObjectMapper().readTree(entity.body)["data"]
    }

    fun getMockCalibrateModelOptions(): Map<String, Any>
    {
        return mapOf(
                "spectrum_plhiv_calibration_level" to "national",
                "spectrum_plhiv_calibration_strat" to "sex_age_coarse",
                "spectrum_artnum_calibration_level" to "national",
                "spectrum_artnum_calibration_strat" to "sex_age_coarse",
                "spectrum_infections_calibration_level" to "national",
                "spectrum_infections_calibration_strat" to "sex_age_coarse",
                "spectrum_aware_calibration_level" to "none",
                "spectrum_aware_calibration_strat" to "sex_age_coarse",
                "calibrate_method" to "logistic")
    }

    fun getMockModelOptions(): Map<String, Any>
    {
        return mapOf("anc_art_coverage_year1" to "2018",
                "anc_prevalence_year1" to "2018",
                "anc_prevalence_year2" to "2018",
                "area_level" to "4", "area_scope" to "MWI",
                "artattend" to "false",
                "artattend_log_gamma_offset" to -4,
                "artattend_t2" to "true",
                "calendar_quarter_t1" to "CY2018Q3",
                "calendar_quarter_t2" to "CY2019Q4",
                "calendar_quarter_t3" to "CY2020Q3",
                "deff_artcov" to 1,
                "deff_prev" to 1,
                "deff_recent" to 1,
                "include_art_t1" to "false",
                "include_art_t2" to "false",
                "max_iterations" to 250,
                "no_of_samples" to 1000,
                "permissive" to "false",
                "rng_seed" to 28,
                "survey_art_coverage" to { "MWI2016PHIA" },
                "survey_prevalence" to { "MWI2016PHIA" },
                "survey_recently_infected" to { "MWI2016PHIA" },
                "output_aware_plhiv" to "true",
                "anc_clients_year2" to 2018,
                "anc_clients_year2_num_months" to "9")
    }
}
