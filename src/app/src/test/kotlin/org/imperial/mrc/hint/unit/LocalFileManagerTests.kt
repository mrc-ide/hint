package org.imperial.mrc.hint.unit

import com.fasterxml.jackson.databind.ObjectMapper
import com.nhaarman.mockito_kotlin.any
import com.nhaarman.mockito_kotlin.doReturn
import com.nhaarman.mockito_kotlin.mock
import com.nhaarman.mockito_kotlin.verify
import org.assertj.core.api.Assertions.assertThat
import org.imperial.mrc.hint.AppProperties
import org.imperial.mrc.hint.FileType
import org.imperial.mrc.hint.LocalFileManager
import org.imperial.mrc.hint.clients.ADRClient
import org.imperial.mrc.hint.db.VersionRepository
import org.imperial.mrc.hint.exceptions.AdrException
import org.imperial.mrc.hint.helpers.TranslationAssert
import org.imperial.mrc.hint.models.AdrResource
import org.imperial.mrc.hint.models.VersionFile
import org.imperial.mrc.hint.security.Session
import org.imperial.mrc.hint.service.ADRService
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.Test
import org.mockito.ArgumentMatchers.anyString
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.mock.web.MockMultipartFile
import java.io.BufferedInputStream
import java.io.File
import java.io.InputStream
import java.net.URI
import java.net.http.HttpResponse

class LocalFileManagerTests
{

    private val tmpUploadDirectory = "tmp"

    private val mockProperties = mock<AppProperties> {
        on { uploadDirectory } doReturn tmpUploadDirectory
        on { adrUrl } doReturn "https://adr.org"
    }

    private val mockSession = mock<Session> {
        on { getVersionId() } doReturn "fake-id"
    }

    private val allFilesMap = FileType.values().associate {
        it.toString() to VersionFile("${it}hash", "${it}filename", false)
    }

    private val mockAdrActivityResponse = mock<ResponseEntity<String>>{
        on { body } doReturn """{"data": [{"id": "3"}]}"""
    }

    private val objectMapper = ObjectMapper()

    private val mockInputStream = mock<HttpResponse<InputStream>> {
        on { body() } doReturn BufferedInputStream("test content".byteInputStream())
        on { statusCode() } doReturn 200
        on { uri() } doReturn URI("https://adr")
    }

    @AfterEach
    fun tearDown()
    {
        File(tmpUploadDirectory).deleteRecursively()
    }

    @Test
    fun `saves file if file is new and returns details`()
    {

        val mockStateRepository = mock<VersionRepository> {
            on { saveNewHash(any()) } doReturn true
        }

        val sut = LocalFileManager(mockSession, mockStateRepository, mockProperties, mock(), objectMapper)
        val mockFile = MockMultipartFile("data", "some-file-name.pjnz",
                "application/zip", "pjnz content".toByteArray())

        val file = sut.saveFile(mockFile, FileType.Survey)
        val savedFile = File(file.path)
        assertThat(savedFile.readLines().first()).isEqualTo("pjnz content")
        assertThat(file.path).isEqualTo("tmp/C7FF8823DAD31FE80CBB73D9B1FB779E.pjnz")
        assertThat(file.filename).isEqualTo("some-file-name.pjnz")
        assertThat(file.hash).isEqualTo("C7FF8823DAD31FE80CBB73D9B1FB779E.pjnz")
        assertThat(file.fromADR).isEqualTo(false)
    }

    @Test
    fun `does not save file if file matches an existing hash and returns details`()
    {

        val mockStateRepository = mock<VersionRepository> {
            on { saveNewHash(any()) } doReturn false
        }

        val sut = LocalFileManager(mockSession, mockStateRepository, mockProperties, mock(), mock())
        val mockFile = MockMultipartFile("data", "some-file-name.pjnz",
                "application/zip", "pjnz content".toByteArray())

        val file = sut.saveFile(mockFile, FileType.Survey)
        assertThat(File(file.path).exists()).isFalse() // shouldn't have actually saved the file
        assertThat(file.path).isEqualTo("tmp/C7FF8823DAD31FE80CBB73D9B1FB779E.pjnz")
        assertThat(file.filename).isEqualTo("some-file-name.pjnz")
        assertThat(file.hash).isEqualTo("C7FF8823DAD31FE80CBB73D9B1FB779E.pjnz")
        assertThat(file.fromADR).isEqualTo(false)
    }

    @Test
    fun `saves file from ADR if file is new and returns details`()
    {

        val mockStateRepository = mock<VersionRepository> {
            on { saveNewHash(any()) } doReturn true
        }
        val mockClient = mock<ADRClient> {
            on { getInputStream(any()) } doReturn mockInputStream
            on { get(anyString()) } doReturn mockAdrActivityResponse
        }
        val mockBuilder = mock<ADRService> {
            on { build() } doReturn mockClient
        }
        val sut = LocalFileManager(mockSession, mockStateRepository, mockProperties, mockBuilder, objectMapper)

        val file = sut.saveFile(AdrResource("some-url/name.csv", "1", "2"), FileType.Survey)
        val savedFile = File(file.path)
        assertThat(savedFile.readLines().first()).isEqualTo("test content")
        assertThat(file.path).isEqualTo("tmp/9473FDD0D880A43C21B7778D34872157.csv")
        assertThat(file.filename).isEqualTo("name.csv")
        assertThat(file.hash).isEqualTo("9473FDD0D880A43C21B7778D34872157.csv")
        assertThat(file.fromADR).isEqualTo(true)
        assertThat(file.resourceUrl).isEqualTo("https://adr.org/dataset/1/resource/2/download/name.csv?activity_id=3")
    }

    @Test
    fun `throws ADR exception when a user does not have permission to load resource`()
    {
        val mockStateRepository = mock<VersionRepository> {
            on { saveNewHash(any()) } doReturn true
        }

        val mockLocalInputStream = mock<HttpResponse<InputStream>> {
            on { body() } doReturn BufferedInputStream("test content".byteInputStream())
            on { statusCode() } doReturn 503
            on { uri() } doReturn URI("https://adr")
        }

        val mockClient = mock<ADRClient> {
            on { getInputStream(any()) } doReturn mockLocalInputStream
            on { get(anyString()) } doReturn mockAdrActivityResponse
        }

        val mockBuilder = mock<ADRService> {
            on { build() } doReturn mockClient
        }

        val sut = LocalFileManager(mockSession, mockStateRepository, mockProperties, mockBuilder, objectMapper)

        TranslationAssert.assertThatThrownBy { sut.saveFile(AdrResource("some-url/name.csv", "1", "2"), FileType.PJNZ) }
            .isInstanceOf(AdrException::class.java)
            .matches { (it as AdrException).httpStatus == HttpStatus.SERVICE_UNAVAILABLE }
            .hasTranslatedMessage("Unable to load resource, check resource in ADR {0}.")
    }

    @Test
    fun `throws ADR exception when any error is encountered when loading resource`()
    {
        val mockStateRepository = mock<VersionRepository> {
            on { saveNewHash(any()) } doReturn true
        }

        val mockLocalInputStream = mock<HttpResponse<InputStream>> {
            on { body() } doReturn BufferedInputStream("test content".byteInputStream())
            on { statusCode() } doReturn 302
            on { uri() } doReturn URI("https://tenant.eu.auth0.com/login/extra")
        }

        val mockClient = mock<ADRClient> {
            on { getInputStream(any()) } doReturn mockLocalInputStream
            on { get(anyString()) } doReturn mockAdrActivityResponse
        }

        val mockBuilder = mock<ADRService> {
            on { build() } doReturn mockClient
        }

        val sut = LocalFileManager(mockSession, mockStateRepository, mockProperties, mockBuilder, objectMapper)

        TranslationAssert.assertThatThrownBy { sut.saveFile(AdrResource("some-url/name.csv", "1", "2"), FileType.PJNZ) }
            .isInstanceOf(AdrException::class.java)
            .hasTranslatedMessage("You do not have permission to load this resource from ADR." +
                    " Contact dataset admin for permission.")
    }

    @Test
    fun `returns empty resourceUrl when activity list is empty`()
    {
        val mockEmptyResponse = mock<ResponseEntity<String>> {
            on { body } doReturn """{"data": []}"""
        }

        assertEmptyResourceUrl(
            AdrResource("some-url/name.csv", "1", "2"),
            mockEmptyResponse
        )
    }

    @Test
    fun `returns empty resourceUrl when resourceId is null`()
    {
        assertEmptyResourceUrl(
            AdrResource("some-url/name.csv", "1", null),
            mockAdrActivityResponse
        )
    }

    @Test
    fun `returns empty resourceUrl when filename is blank`()
    {
        assertEmptyResourceUrl(
            AdrResource("", "1", "123"),
            mockAdrActivityResponse
        )
    }

    @Test
    fun `saves file from ADR if URL has query string`()
    {

        val mockClient = mock<ADRClient> {
            on { getInputStream(any()) } doReturn mockInputStream
            on { get(anyString()) } doReturn mockAdrActivityResponse
        }
        val mockBuilder = mock<ADRService> {
            on { build() } doReturn mockClient
        }

        val sut = LocalFileManager(mock(), mock(), mock(), mockBuilder, objectMapper)
        val file = sut.saveFile(AdrResource("some-url/name.csv?version=1.0"), FileType.Survey)
        assertThat(file.filename).isEqualTo("name.csv")
        assertThat(file.resourceUrl).isEqualTo("")
    }

    @Test
    fun `does not save file from ADR if file matches an existing hash and returns details`()
    {

        val mockStateRepository = mock<VersionRepository> {
            on { saveNewHash(any()) } doReturn false
        }
        val mockClient = mock<ADRClient> {
            on { getInputStream(any()) } doReturn mockInputStream
            on { get(anyString()) } doReturn mockAdrActivityResponse
        }
        val mockBuilder = mock<ADRService> {
            on { build() } doReturn mockClient
        }
        val sut = LocalFileManager(mockSession, mockStateRepository, mockProperties, mockBuilder, objectMapper)
        val file = sut.saveFile(AdrResource("some-url/name.csv", "1", "2"), FileType.Survey)
        assertThat(File(file.path).exists()).isFalse // shouldn't have actually saved the file
        assertThat(file.path).isEqualTo("tmp/9473FDD0D880A43C21B7778D34872157.csv")
        assertThat(file.filename).isEqualTo("name.csv")
        assertThat(file.hash).isEqualTo("9473FDD0D880A43C21B7778D34872157.csv")
        assertThat(file.fromADR).isEqualTo(true)
        assertThat(file.resourceUrl).isEqualTo("https://adr.org/dataset/1/resource/2/download/name.csv?activity_id=3")
    }

    @Test
    fun `gets file if it exists`()
    {

        val mockStateRepository = mock<VersionRepository> {
            on { saveNewHash(any()) } doReturn true
            on { getVersionFile(any(), any()) } doReturn VersionFile("test", "filename", false)
        }

        val sut = LocalFileManager(mockSession, mockStateRepository, mockProperties, mock(), mock())
        val mockFile = MockMultipartFile("data", "some-file-name.pjnz",
                "application/zip", "pjnz content".toByteArray())

        sut.saveFile(mockFile, FileType.Survey)
        assertThat(sut.getFile(FileType.Survey)!!.path).isEqualTo("tmp/test")
    }

    @Test
    fun `returns null if no file exists`()
    {

        val sut = LocalFileManager(mockSession, mock(), mockProperties, mock(), mock())
        assertThat(sut.getFile(FileType.Survey))
                .isNull()
    }

    @Test
    fun `gets all file paths`()
    {

        val stateRepo = mock<VersionRepository> {
            on { getHashesForVersion("fake-id") } doReturn mapOf("survey" to "hash.csv")
        }

        val sut = LocalFileManager(mockSession, stateRepo, mockProperties, mock(), mock())
        val result = sut.getAllHashes()

        assertThat(result["survey"]).isEqualTo("$tmpUploadDirectory/hash.csv")
        assertThat(result.count()).isEqualTo(1)
    }

    @Test
    fun `gets all files`()
    {

        val stateRepo = mock<VersionRepository> {
            on { getVersionFiles("fake-id") } doReturn allFilesMap
        }

        val sut = LocalFileManager(mockSession, stateRepo, mockProperties, mock(), mock())
        val result = sut.getFiles()

        assertThat(result["survey"]!!.path).isEqualTo("$tmpUploadDirectory/surveyhash")
        assertThat(result["survey"]!!.filename).isEqualTo("surveyfilename")
        assertThat(result["survey"]!!.hash).isEqualTo("surveyhash")
        assertThat(result["pjnz"]!!.path).isEqualTo("$tmpUploadDirectory/pjnzhash")
        assertThat(result["pjnz"]!!.filename).isEqualTo("pjnzfilename")
        assertThat(result["pjnz"]!!.hash).isEqualTo("pjnzhash")
        assertThat(result.count()).isEqualTo(7)
    }

    @Test
    fun `gets model fit files`()
    {

        val stateRepo = mock<VersionRepository> {
            on { getVersionFiles("fake-id") } doReturn allFilesMap
        }

        val sut = LocalFileManager(mockSession, stateRepo, mockProperties, mock(), mock())
        val result = sut.getModelFitFiles()

        assertThat(result["survey"]!!.path).isEqualTo("$tmpUploadDirectory/surveyhash")
        assertThat(result["survey"]!!.filename).isEqualTo("surveyfilename")
        assertThat(result["survey"]!!.hash).isEqualTo("surveyhash")
        assertThat(result["pjnz"]!!.path).isEqualTo("$tmpUploadDirectory/pjnzhash")
        assertThat(result["pjnz"]!!.filename).isEqualTo("pjnzfilename")
        assertThat(result["pjnz"]!!.hash).isEqualTo("pjnzhash")
        assertThat(result.count()).isEqualTo(6)
    }

    @Test
    fun `only gets files that match the given includes`()
    {

        val stateRepo = mock<VersionRepository> {
            on { getVersionFiles("fake-id") } doReturn allFilesMap
        }

        val sut = LocalFileManager(mockSession, stateRepo, mockProperties, mock(), mock())
        val result = sut.getFiles(FileType.ANC, FileType.Programme)

        assertThat(result.count()).isEqualTo(2)
        assertThat(result.keys).containsExactlyInAnyOrder("programme", "anc")
    }

    @Test
    fun `sets files for session`()
    {

        val stateRepo = mock<VersionRepository>()

        val sut = LocalFileManager(mockSession, stateRepo, mockProperties, mock(), mock())
        val files = mapOf("pjnz" to VersionFile("hash1", "file1", false))
        sut.setAllFiles(files)

        verify(stateRepo).setFilesForVersion("fake-id", files)
    }

    private fun assertEmptyResourceUrl(adrResource: AdrResource, activityResponse: ResponseEntity<String>)
    {
        val mockStateRepository = mock<VersionRepository> {
            on { saveNewHash(any()) } doReturn true
        }

        val mockClient = mock<ADRClient> {
            on { getInputStream(any()) } doReturn mockInputStream
            on { get(anyString()) } doReturn activityResponse
        }
        val mockBuilder = mock<ADRService> {
            on { build() } doReturn mockClient
        }
        val sut = LocalFileManager(mockSession, mockStateRepository, mockProperties, mockBuilder, objectMapper)

        val file = sut.saveFile(adrResource, FileType.Survey)

        assertThat(file.resourceUrl).isEqualTo("")
    }

}
