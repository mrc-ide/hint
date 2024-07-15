package org.imperial.mrc.hint.unit.controllers

import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.databind.node.ObjectNode
import com.fasterxml.jackson.module.kotlin.readValue
import com.nhaarman.mockito_kotlin.doReturn
import com.nhaarman.mockito_kotlin.mock
import org.assertj.core.api.Assertions.assertThat
import org.assertj.core.api.Assertions.assertThatThrownBy
import org.imperial.mrc.hint.clients.HintrAPIClient
import org.imperial.mrc.hint.controllers.MetadataController
import org.imperial.mrc.hint.FileManager
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import java.io.File
import java.io.FileNotFoundException
import java.net.URL

class MetadataControllerTests
{
    private val tmpDir = "tmp"

    @BeforeEach
    fun makeTmpDir() {
        File(tmpDir).mkdir()
    }

    @AfterEach
    fun cleanup() {
        File(tmpDir).deleteRecursively()
    }

    @Test
    fun `gets plotting metadata`()
    {
        val mockResponse = mock<ResponseEntity<String>>()

        val mockAPIClient = mock<HintrAPIClient> {
            on { getPlottingMetadata("MWI") } doReturn mockResponse
        }

        val mockFileManager = mock<FileManager> {}
        val mockClassLoader = mock<ClassLoader> {}

        val sut = MetadataController(mockAPIClient, mockClassLoader, mockFileManager)
        val result = sut.plotting("MWI")
        assertThat(result).isSameAs(mockResponse)
    }

    @Test
    fun `getting hintr version`()
    {
        val mockResponse = mock<ResponseEntity<String>>()

        val mockAPIClient = mock<HintrAPIClient>
        {
            on { getVersion() } doReturn mockResponse
        }

        val mockFileManager = mock<FileManager> {}
        val mockClassLoader = mock<ClassLoader> {}

        val sut = MetadataController(mockAPIClient, mockClassLoader, mockFileManager)
        val result = sut.version()
        assertThat(result).isSameAs(mockResponse)
    }

    @Test
    fun `can get uploadToADR metadata`()
    {
        val mockResponse = mock<ResponseEntity<String>>()
        val mockAPIClient = mock<HintrAPIClient> {
            on { getUploadMetadata("id1") } doReturn mockResponse
        }

        val mockFileManager = mock<FileManager> {}
        val mockClassLoader = mock<ClassLoader> {}

        val sut = MetadataController(mockAPIClient, mockClassLoader, mockFileManager)
        val result = sut.uploadMetadata("id1")
        assertThat(result).isSameAs(mockResponse)
    }

    fun `gets generic chart metadata`()
    {
        val mockClassLoader = mock<ClassLoader>() {
            on { getResource("metadata/generic-chart.json") } doReturn createTestResource(
                    "${tmpDir}/metadata/metadata/generic-chart.json",
                    """{
                        "input-time-series": {
                            "chartConfig": [
                                {"id": "scatter"}
                            ]
                        }
                    }""")
            on { getResource("metadata/input-time-series-config-jsonata.txt") } doReturn createTestResource(
                "${tmpDir}/metadata/input-time-series-config-jsonata.txt", "TEST_JSONATA")
            }

        val mockFileManager = mock<FileManager> {}
        val sut = MetadataController(mock(), mockClassLoader, mockFileManager)
        val result = sut.genericChart()
        assertThat(result.statusCode).isEqualTo(HttpStatus.OK)
        val resultJson = ObjectMapper().readValue<ObjectNode>(result.body!!)
        val chartConfig = resultJson["data"]["input-time-series"]["chartConfig"][0]
        assertThat(chartConfig["id"].asText()).isEqualTo("scatter")
        assertThat(chartConfig["config"].asText()).isEqualTo("TEST_JSONATA")
    }

    @Test
    fun `get generic chart metadata throws error if file not found`()
    {
        val mockClassLoader = mock<ClassLoader>() {
            on { getResource("metadata/generic-chart.json") } doReturn URL("file:/nonexistent.json")
        }

        val mockFileManager = mock<FileManager> {}

        val sut = MetadataController(mock(), mockClassLoader, mockFileManager)
        assertThatThrownBy{ sut.genericChart() }
                .isInstanceOf(FileNotFoundException::class.java)
    }

    @Test
    fun `get generic chart metadata fails if loaded metadata is not an object node`()
    {
        val mockClassLoader = mock<ClassLoader>() {
            on { getResource("metadata/generic-chart.json") } doReturn createTestResource(
                    "${tmpDir}/metadata/metadata/generic-chart.json",
                    """["This should fail"]""")
            on { getResource("metadata/input-time-series-config-jsonata.txt") } doReturn createTestResource(
                    "${tmpDir}/metadata/input-time-series-config-jsonata.txt", "TEST_JSONATA")
        }

        val mockFileManager = mock<FileManager> {}

        val sut = MetadataController(mock(), mockClassLoader, mockFileManager)
        assertThatThrownBy{ sut.genericChart() }
                .isInstanceOf(NullPointerException::class.java)
    }

    private fun createTestResource(path: String, contents: String): URL {
        val dir = File(path.replaceAfterLast("/", ""))
        dir.mkdirs()

        val file = File(path)
        file.createNewFile()
        file.writeText(contents)
        return file.toURI().toURL()
    }
}
