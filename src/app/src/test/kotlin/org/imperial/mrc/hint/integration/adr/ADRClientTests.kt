package org.imperial.mrc.hint.integration.adr

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.module.kotlin.readValue
import com.nhaarman.mockito_kotlin.doReturn
import com.nhaarman.mockito_kotlin.mock
import com.nhaarman.mockito_kotlin.verify
import org.assertj.core.api.Assertions.assertThat
import org.imperial.mrc.hint.ConfiguredAppProperties
import org.imperial.mrc.hint.clients.ADRClient
import org.imperial.mrc.hint.clients.ADRFuelClient
import org.imperial.mrc.hint.logging.GenericLogger
import org.junit.jupiter.api.Assertions
import org.junit.jupiter.api.Test
import org.mockito.ArgumentMatchers.anyString
import org.mockito.Mockito
import java.io.ByteArrayInputStream
import java.io.File
import java.io.InputStream
import java.net.URI
import java.net.http.HttpResponse

class ADRClientTests
{
    private val mockLogger = mock<GenericLogger>()

    @Test
    fun `can parse successful response from ADR`()
    {
        val sut = ADRFuelClient(ConfiguredAppProperties().adrUrl, "fakekey", mockLogger)
        val response = sut.get("organization_list_for_user")
        assertThat(response.statusCodeValue).isEqualTo(200)
        val data = ObjectMapper().readValue<JsonNode>(response.body!!)["data"]
        assertThat(data.isArray).isTrue()
        assertThat(data.count()).isEqualTo(0) // no orgs because the key isn't valid
        verify(mockLogger).info(Mockito.contains("ADR request time elapsed: "))
    }

    @Test
    fun `can parse inputStream response from ADRHttpClient`()
    {
        val anyInputStream = ByteArrayInputStream("test data".toByteArray())

        val mockHttpResponse = mock<HttpResponse<InputStream>> {
            on { body() } doReturn anyInputStream
            on { statusCode() } doReturn 200
            on { uri() } doReturn URI("http://test.url")
        }

        val mockADRClient = mock<ADRClient> {
            on { getInputStream(anyString()) } doReturn mockHttpResponse
        }

        val result = mockADRClient.getInputStream("url")

        Assertions.assertEquals(result.statusCode(), 200)

        Assertions.assertEquals(result.uri(), URI("http://test.url"))

        Assertions.assertEquals(result.body().bufferedReader().use { it.readText() }, "test data")
    }

    @Test
    fun `can parse error response from ADR`()
    {
        val sut = ADRFuelClient(ConfiguredAppProperties().adrUrl, "fakekey", mockLogger)
        val response = sut.get("member_list?id=nonsense")
        assertThat(response.statusCodeValue).isEqualTo(500)
        val errors = ObjectMapper().readValue<JsonNode>(response.body!!)["errors"]
        assertThat(errors.isArray).isTrue()
        assertThat(errors.count()).isEqualTo(1)
        assertThat(errors[0]["error"].textValue()).isEqualTo("ADR_ERROR")
        assertThat(errors[0]["detail"].textValue()).isEqualTo("Not found")
        verify(mockLogger).info(Mockito.contains("ADR request time elapsed: "))
    }

    @Test
    fun `returns error if ADR response not correctly formatted`()
    {
        val sut = ADRFuelClient(ConfiguredAppProperties().adrUrl, "fakekey", mockLogger)
        val response = sut.get("garbage")
        assertThat(response.statusCodeValue).isEqualTo(400)
        val errors = ObjectMapper().readValue<JsonNode>(response.body!!)["errors"]
        assertThat(errors.isArray).isTrue
        assertThat(errors.count()).isEqualTo(1)
        assertThat(errors[0]["error"].textValue()).isEqualTo("OTHER_ERROR")
        assertThat(errors[0]["detail"].textValue()).isEqualTo("Bad request - Action name not known: garbage")
        verify(mockLogger).info(Mockito.contains("ADR request time elapsed: "))
    }

    @Test
    fun `returns an error when uploading a file to a non-existent endpoint`()
    {
        val sut = ADRFuelClient(ConfiguredAppProperties().adrUrl, "fakekey", mockLogger)
        val response = sut.postFile("garbage", listOf(), Pair("garbage", File("/dev/null")))
        assertThat(response.statusCodeValue).isEqualTo(400)
        val errors = ObjectMapper().readValue<JsonNode>(response.body!!)["errors"]
        assertThat(errors.isArray).isTrue
        assertThat(errors.count()).isEqualTo(1)
        assertThat(errors[0]["error"].textValue()).isEqualTo("OTHER_ERROR")
        assertThat(errors[0]["detail"].textValue()).isEqualTo("Bad request - Action name not known: garbage")
        verify(mockLogger).info(Mockito.contains("ADR request time elapsed: "))
    }
}
