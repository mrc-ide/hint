package org.imperial.mrc.hint.unit.controllers

import com.nhaarman.mockito_kotlin.doReturn
import com.nhaarman.mockito_kotlin.mock
import com.nhaarman.mockito_kotlin.verify
import org.assertj.core.api.Assertions
import org.imperial.mrc.hint.FileManager
import org.imperial.mrc.hint.FileType
import org.imperial.mrc.hint.clients.HintrAPIClient
import org.imperial.mrc.hint.controllers.DownloadController
import org.imperial.mrc.hint.models.VersionFileWithPath
import org.junit.jupiter.api.Test
import org.springframework.http.ResponseEntity
import org.springframework.web.servlet.mvc.method.annotation.StreamingResponseBody

class DownloadControllerTests
{
    @Test
    fun `submit spectrum download`()
    {
        val json = mapOf("state" to mapOf("test" to "test"))
        val mockResponse = mock<ResponseEntity<String>>()
        val mockAPIClient = mock<HintrAPIClient> {
            on { downloadOutputSubmit("spectrum", "id1", json) } doReturn mockResponse
        }
        val mockFileManager = mock<FileManager> {}

        val sut = DownloadController(mockAPIClient, mockFileManager)
        val result = sut.getDownloadOutput("spectrum", "id1", json)
        verify(mockAPIClient).downloadOutputSubmit("spectrum", "id1", json)
        Assertions.assertThat(result).isSameAs(mockResponse)
    }

    @Test
    fun `submit spectrum download can include VMMC file`()
    {
        val mockVmmc = VersionFileWithPath("vmmcPath", "vmmcHash", "vmmcFile", false)
        val mockFileManager = mock<FileManager> {
            on { getFile(FileType.Vmmc) } doReturn mockVmmc
        }
        val inputJson = mapOf("state" to mapOf("test" to "test"))
        val expectedJson = mapOf(
            "state" to mapOf("test" to "test"),
            "vmmc" to mockVmmc)
        val mockResponse = mock<ResponseEntity<String>>()
        val mockAPIClient = mock<HintrAPIClient> {
            on { downloadOutputSubmit("spectrum", "id1", expectedJson) } doReturn mockResponse
        }

        val sut = DownloadController(mockAPIClient, mockFileManager)
        val result = sut.getDownloadOutput("spectrum", "id1", inputJson)
        verify(mockAPIClient).downloadOutputSubmit("spectrum", "id1", expectedJson)
        Assertions.assertThat(result).isSameAs(mockResponse)
    }

    @Test
    fun `submit summary download`()
    {
        val mockResponse = mock<ResponseEntity<String>>()
        val mockAPIClient = mock<HintrAPIClient> {
            on { downloadOutputSubmit("summary", "id1", emptyMap()) } doReturn mockResponse
        }
        val mockFileManager = mock<FileManager> {}

        val sut = DownloadController(mockAPIClient, mockFileManager)
        val result = sut.getDownloadOutput("summary", "id1", emptyMap())
        verify(mockAPIClient).downloadOutputSubmit("summary", "id1", emptyMap())
        Assertions.assertThat(result).isSameAs(mockResponse)
    }

    @Test
    fun `submit coarse-output download`()
    {
        val mockResponse = mock<ResponseEntity<String>>()
        val mockAPIClient = mock<HintrAPIClient> {
            on { downloadOutputSubmit("coarse-output", "id1", emptyMap()) } doReturn mockResponse
        }
        val mockFileManager = mock<FileManager> {}

        val sut = DownloadController(mockAPIClient, mockFileManager)
        val result = sut.getDownloadOutput("coarse-output", "id1")
        verify(mockAPIClient).downloadOutputSubmit("coarse-output", "id1", emptyMap())
        Assertions.assertThat(result).isSameAs(mockResponse)
    }

    @Test
    fun `submit agyw download includes pjnz`()
    {
        val mockPjnz = VersionFileWithPath("pjnzPath", "pjnzHash", "pjnzFile", false)
        val mockShape = VersionFileWithPath("shapePath", "shapeHash", "shapeFile", false)

        val mockFileManager = mock<FileManager> {
            on { getFile(FileType.PJNZ) } doReturn mockPjnz
            on { getFile(FileType.Shape) } doReturn mockShape
        }

        val json = mapOf("pjnz" to mockPjnz)
        val mockResponse = mock<ResponseEntity<String>>()
        val mockAPIClient = mock<HintrAPIClient> {
            on { downloadOutputSubmit("agyw", "id1", json) } doReturn mockResponse
        }

        val sut = DownloadController(mockAPIClient, mockFileManager)
        val result = sut.getDownloadOutput("agyw", "id1")
        verify(mockAPIClient).downloadOutputSubmit("agyw", "id1", json)
        Assertions.assertThat(result).isSameAs(mockResponse)
    }

    @Test
    fun `submit agyw download adds pjnz to existing body`()
    {
        val mockPjnz = VersionFileWithPath("pjnzPath", "pjnzHash", "pjnzFile", false)
        val mockShape = VersionFileWithPath("shapePath", "shapeHash", "shapeFile", false)

        val mockFileManager = mock<FileManager> {
            on { getFile(FileType.PJNZ) } doReturn mockPjnz
            on { getFile(FileType.Shape) } doReturn mockShape
        }
        val mockResponse = mock<ResponseEntity<String>>()
        val json = mapOf("state" to mapOf("test" to "test"), "pjnz" to mockPjnz)
        val mockAPIClient = mock<HintrAPIClient> {
            on { downloadOutputSubmit("agyw", "id1", json) } doReturn mockResponse
        }

        val sut = DownloadController(mockAPIClient, mockFileManager)
        val result = sut.getDownloadOutput("agyw", "id1", mapOf("state" to mapOf("test" to "test")))
        verify(mockAPIClient).downloadOutputSubmit("agyw", "id1", json)
        Assertions.assertThat(result).isSameAs(mockResponse)
    }

    @Test
    fun `can get download status`()
    {
        val mockResponse = mock<ResponseEntity<String>>()
        val mockAPIClient = mock<HintrAPIClient> {
            on { downloadOutputStatus("id1") } doReturn mockResponse
        }
        val mockFileManager = mock<FileManager> {}

        val sut = DownloadController(mockAPIClient, mockFileManager)
        val result = sut.getDownloadOutputStatus("id1")
        Assertions.assertThat(result).isSameAs(mockResponse)
    }

    @Test
    fun `can get download result`()
    {
        val mockResponse = mock<ResponseEntity<StreamingResponseBody>>()
        val mockApiClient = mock<HintrAPIClient>
        {
            on { downloadOutputResult("id1") } doReturn mockResponse
        }
        val mockFileManager = mock<FileManager> {}

        val sut = DownloadController(mockApiClient, mockFileManager)
        val result = sut.getDownloadOutputResult("id1")
        Assertions.assertThat(result).isSameAs(mockResponse)
    }
}
