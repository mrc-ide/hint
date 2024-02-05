package org.imperial.mrc.hint.unit.controllers

import com.fasterxml.jackson.databind.ObjectMapper
import com.nhaarman.mockito_kotlin.*
import org.assertj.core.api.Assertions.assertThat
import org.assertj.core.api.Assertions.assertThatThrownBy
import org.imperial.mrc.hint.AppProperties
import org.imperial.mrc.hint.FileManager
import org.imperial.mrc.hint.FileType
import org.imperial.mrc.hint.clients.ADRClient
import org.imperial.mrc.hint.clients.HintrAPIClient
import org.imperial.mrc.hint.controllers.ADRController
import org.imperial.mrc.hint.controllers.HintrController
import org.imperial.mrc.hint.db.UserRepository
import org.imperial.mrc.hint.db.VersionRepository
import org.imperial.mrc.hint.exceptions.AdrException
import org.imperial.mrc.hint.helpers.TranslationAssert
import org.imperial.mrc.hint.md5sum
import org.imperial.mrc.hint.models.VersionFileWithPath
import org.imperial.mrc.hint.security.Encryption
import org.imperial.mrc.hint.security.Session
import org.imperial.mrc.hint.service.ADRService
import org.junit.jupiter.api.AfterAll
import org.junit.jupiter.api.BeforeAll
import org.junit.jupiter.api.Test
import org.pac4j.core.profile.CommonProfile
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.servlet.mvc.method.annotation.StreamingResponseBody
import java.io.File
import java.lang.reflect.InvocationTargetException
import java.nio.file.Files
import javax.servlet.http.HttpServletRequest
import kotlin.reflect.full.memberFunctions
import kotlin.reflect.jvm.isAccessible

class ADRControllerTests : HintrControllerTests()
{
    companion object
    {
        private var tmpTestDir: File? = null

        @BeforeAll
        @JvmStatic
        fun setUp()
        {
            tmpTestDir = Files.createTempDirectory("adrTest").toFile()
        }

        @AfterAll
        @JvmStatic
        fun `delete tmpdir for test files`()
        {
            tmpTestDir?.deleteRecursively()
        }
    }

    private val mockEncryption = mock<Encryption> {
        on { encrypt(any()) } doReturn "encrypted".toByteArray()
        on { decrypt(any()) } doReturn "decrypted"
    }

    private val mockProperties = mock<AppProperties> {
        on { adrUrl } doReturn "adr-url"
        on { adrDatasetSchema } doReturn "adr-schema"
        on { adrANCSchema } doReturn "adr-anc"
        on { adrARTSchema } doReturn "adr-art"
        on { adrPJNZSchema } doReturn "adr-pjnz"
        on { adrPopSchema } doReturn "adr-pop"
        on { adrShapeSchema } doReturn "adr-shape"
        on { adrSurveySchema } doReturn "adr-survey"
        on { adrVmmcSchema } doReturn "adr-vmmc"
        on { adrOutputZipSchema } doReturn "adr-output-zip"
        on { adrOutputSummarySchema } doReturn "adr-output-summary"
        on { adrOutputComparisonSchema } doReturn "adr-output-comparison"
    }

    private val objectMapper = ObjectMapper()

    private val mockUserRepo = mock<UserRepository> {
        on { getADRKey("test") } doReturn "encrypted".toByteArray()
    }

    private val mockSession = mock<Session> {
        on { getUserProfile() } doReturn CommonProfile().apply { id = "test" }
    }

    private fun writeTestFile(filename: String, contents: String): String
    {
        val file = File(filename)
        file.writeText(contents)
        return file.md5sum()
    }

    @Test
    fun `encrypts key before saving it`()
    {
        val mockRepo = mock<UserRepository>()
        val sut = ADRController(mockEncryption, mockRepo, mock(), mock(), mock(), mock(), mock(),
                mockSession, mock(), mock())
        sut.saveAPIKey("plainText")
        verify(mockRepo).saveADRKey("test", "encrypted".toByteArray())
    }

    @Test
    fun `decrypts key before returning it`()
    {

        val sut = ADRController(mockEncryption, mockUserRepo, mock(), mock(), mock(), mock(), mock(),
                mockSession, mock(), mock())
        val result = sut.getAPIKey()
        val data = objectMapper.readTree(result.body!!)["data"].asText()
        assertThat(data).isEqualTo("decrypted")
    }

    @Test
    fun `returns null if key does not exist`()
    {
        val sut = ADRController(mock(), mock(), mock(), mock(), mock(), mock(), mock(),
                mockSession, mock(), mock())
        val result = sut.getAPIKey()
        val data = objectMapper.readTree(result.body!!)["data"]
        assertThat(data.isNull).isTrue
    }

    @Test
    fun `gets datasets without inaccessible resources by default`()
    {
        val expectedUrl = "package_search?q=type:adr-schema&rows=1000&include_private=true&hide_inaccessible_resources=true"
        val mockClient = mock<ADRClient> {
            on { get(expectedUrl) } doReturn makeFakeSuccessResponse()
        }
        val mockBuilder = mock<ADRService> {
            on { build() } doReturn mockClient
        }
        val sut = ADRController(
                mock(),
                mock(),
                mockBuilder,
                objectMapper,
                mockProperties,
                mock(),
                mock(),
                mockSession,
                mock(),
                mock())
        val result = sut.getDatasets()
        val data = objectMapper.readTree(result.body!!)["data"]
        assertThat(data.isArray).isTrue
        assertThat(data[0]["resources"].count()).isEqualTo(2)
    }

    @Test
    fun `gets datasets including inaccessible resources if flag is passed`()
    {
        val expectedUrl = "package_search?q=type:adr-schema&rows=1000&include_private=true"
        val mockClient = mock<ADRClient> {
            on { get(expectedUrl) } doReturn makeFakeSuccessResponse()
        }
        val mockBuilder = mock<ADRService> {
            on { build() } doReturn mockClient
        }
        val sut = ADRController(
                mock(),
                mock(),
                mockBuilder,
                objectMapper,
                mockProperties,
                mock(),
                mock(),
                mockSession,
                mock(),
                mock())
        val result = sut.getDatasets(true)
        val data = objectMapper.readTree(result.body!!)["data"]
        assertThat(data.isArray).isTrue
        assertThat(data[0]["resources"].count()).isEqualTo(2)
    }

    @Test
    fun `filters datasets to only those with resources`()
    {
        val expectedUrl = "package_search?q=type:adr-schema&rows=1000&include_private=true&hide_inaccessible_resources=true"
        val mockClient = mock<ADRClient> {
            on { get(expectedUrl) } doReturn makeFakeSuccessResponse()
        }
        val mockBuilder = mock<ADRService> {
            on { build() } doReturn mockClient
        }
        val sut = ADRController(
                mock(),
                mock(),
                mockBuilder,
                objectMapper,
                mockProperties,
                mock(),
                mock(),
                mockSession,
                mock(),
                mock())
        val result = sut.getDatasets()
        val data = objectMapper.readTree(result.body!!)["data"]
        assertThat(data.isArray).isTrue
        assertThat(data.count()).isEqualTo(1)
        assertThat(data[0]["resources"].count()).isEqualTo(2)
    }

    @Test
    fun `throws generic error message if unexpected error`()
    {
        val badResponse = ResponseEntity<String>(HttpStatus.BAD_REQUEST)
        val expectedUrl = "package_search?q=type:adr-schema&rows=1000&include_private=true&hide_inaccessible_resources=true"
        val mockClient = mock<ADRClient> {
            on { get(expectedUrl) } doReturn badResponse
        }
        val mockBuilder = mock<ADRService> {
            on { build() } doReturn mockClient
        }
        val sut = ADRController(
                mock(),
                mock(),
                mockBuilder,
                objectMapper,
                mockProperties,
                mock(),
                mock(),
                mockSession,
                mock(),
                mock())
        TranslationAssert.assertThatThrownBy { sut.getDatasets() }
            .isInstanceOf(AdrException::class.java)
            .matches { (it as AdrException).httpStatus == HttpStatus.BAD_REQUEST }
            .hasTranslatedMessage("There was an error fetching datasets from ADR.")
    }

    @Test
    fun `returns more specific error message if cause known`()
    {
        val badResponse = ResponseEntity<String>(
            "User 'auth0|6502e7f40954910c0ee93263' has not yet logged into ADR",
            HttpStatus.BAD_REQUEST)
        val expectedUrl = "package_search?q=type:adr-schema&rows=1000&include_private=true&hide_inaccessible_resources=true"
        val mockClient = mock<ADRClient> {
            on { get(expectedUrl) } doReturn badResponse
        }
        val mockBuilder = mock<ADRService> {
            on { build() } doReturn mockClient
        }
        val sut = ADRController(
            mock(),
            mock(),
            mockBuilder,
            objectMapper,
            mockProperties,
            mock(),
            mock(),
            mockSession,
            mock(),
            mock())
        TranslationAssert.assertThatThrownBy { sut.getDatasets() }
            .isInstanceOf(AdrException::class.java)
            .matches { (it as AdrException).httpStatus == HttpStatus.BAD_REQUEST }
            .hasTranslatedMessage("Cannot fetch datasets from the ADR as you do not yet have an " +
                    "account. Please login to the ADR with your Auth0 credentials and then return here and try again.")
    }

    @Test
    fun `gets dataset by id`()
    {
        val expectedUrl = "package_show?id=1234"
        val mockClient = mock<ADRClient> {
            on { get(expectedUrl) } doReturn ResponseEntity
                    .ok()
                    .body("whatever")
        }
        val mockBuilder = mock<ADRService> {
            on { build() } doReturn mockClient
        }
        val sut = ADRController(
                mock(),
                mock(),
                mockBuilder,
                objectMapper,
                mockProperties,
                mock(),
                mock(),
                mockSession,
                mock(),
                mock())
        val result = sut.getDataset("1234")
        assertThat(result.body!!).isEqualTo("whatever")
    }

    @Test
    fun `gets releases by id`()
    {
        val expectedUrl = "/dataset_version_list?dataset_id=1234"
        val mockClient = mock<ADRClient> {
            on { get(expectedUrl) } doReturn ResponseEntity
                    .ok()
                    .body("whatever")
        }
        val mockBuilder = mock<ADRService> {
            on { build() } doReturn mockClient
        }
        val sut = ADRController(
                mock(),
                mock(),
                mockBuilder,
                objectMapper,
                mockProperties,
                mock(),
                mock(),
                mockSession,
                mock(),
                mock())
        val result = sut.getReleases("1234")
        assertThat(result.body!!).isEqualTo("whatever")
    }

    @Test
    fun `gets dataset by id and version`()
    {
        val expectedUrl = "package_show?id=1234&release=1.0"
        val mockClient = mock<ADRClient> {
            on { get(expectedUrl) } doReturn ResponseEntity
                    .ok()
                    .body("whatever")
        }
        val mockBuilder = mock<ADRService> {
            on { build() } doReturn mockClient
        }
        val sut = ADRController(
                mock(),
                mock(),
                mockBuilder,
                objectMapper,
                mockProperties,
                mock(),
                mock(),
                mockSession,
                mock(),
                mock())
        val result = sut.getDataset("1234", "1.0")
        assertThat(result.body!!).isEqualTo("whatever")
    }

    @Test
    fun `returns map of names to adr file schemas`()
    {
        val sut = ADRController(
                mock(),
                mock(),
                mock(),
                objectMapper,
                mockProperties,
                mock(),
                mock(),
                mockSession,
                mock(),
                mock())
        val result = sut.getFileTypeMappings()
        val data = objectMapper.readTree(result.body!!)["data"]
        assertThat(data["pjnz"].textValue()).isEqualTo("adr-pjnz")
        assertThat(data["population"].textValue()).isEqualTo("adr-pop")
        assertThat(data["programme"].textValue()).isEqualTo("adr-art")
        assertThat(data["anc"].textValue()).isEqualTo("adr-anc")
        assertThat(data["shape"].textValue()).isEqualTo("adr-shape")
        assertThat(data["survey"].textValue()).isEqualTo("adr-survey")
        assertThat(data["vmmc"].textValue()).isEqualTo("adr-vmmc")
        assertThat(data["outputZip"].textValue()).isEqualTo("adr-output-zip")
        assertThat(data["outputSummary"].textValue()).isEqualTo("adr-output-summary")
        assertThat(data["baseUrl"].textValue()).isEqualTo("adr-url")
        assertThat(data["outputComparison"].textValue()).isEqualTo("adr-output-comparison")
    }

    // used for the import{FileType} tests below
    override fun getSut(mockFileManager: FileManager,
                        mockAPIClient: HintrAPIClient,
                        mockSession: Session,
                        mockVersionRepository: VersionRepository,
                        mockRequest: HttpServletRequest): HintrController
    {
        return ADRController(mockEncryption,
                mockUserRepo,
                mock(),
                objectMapper,
                mockProperties,
                mockFileManager,
                mockAPIClient,
                mockSession,
                mockVersionRepository,
                mockRequest)
    }

    @Test
    fun `imports anc`()
    {
        assertSavesAndValidatesUrl(FileType.ANC) { sut ->
            (sut as ADRController).importANC(adrResource)
        }
    }

    @Test
    fun `imports pjnz`()
    {
        assertSavesAndValidatesUrl(FileType.PJNZ) { sut ->
            (sut as ADRController).importPJNZ(adrResource)
        }
    }

    @Test
    fun `imports programme`()
    {
        assertSavesAndValidatesUrl(FileType.Programme) { sut ->
            (sut as ADRController).importProgramme(adrResource)
        }
    }

    @Test
    fun `imports population`()
    {
        assertSavesAndValidatesUrl(FileType.Population) { sut ->
            (sut as ADRController).importPopulation(adrResource)
        }
    }

    @Test
    fun `imports shape file`()
    {
        assertSavesAndValidatesUrl(FileType.Shape) { sut ->
            (sut as ADRController).importShape(adrResource)
        }
    }

    @Test
    fun `imports survey`()
    {
        assertSavesAndValidatesUrl(FileType.Survey) { sut ->
            (sut as ADRController).importSurvey(adrResource)
        }
    }

    @Test
    fun `imports vmmc`()
    {
        assertSavesAndValidatesUrl(FileType.Vmmc) { sut ->
            (sut as ADRController).importVmmc(adrResource)
        }
    }

    @Test
    fun `requests strict validation by default`()
    {
        val mockApiClient = getMockAPIClient(FileType.Survey)
        val mockRequest = mock<HttpServletRequest>()
        val mockFileManager = getMockFileManager(FileType.Survey)
        val sut = getSut(mockFileManager, mockApiClient, mock(), mock(), mockRequest) as ADRController
        sut.importSurvey(adrResource)
        verify(mockApiClient)
                .validateSurveyAndProgramme(
                        VersionFileWithPath("test-path", "hash", "some-file-name.csv", false),
                        "shape-path", FileType.Survey, true)
    }

    @Test
    fun `requests lax validation when query param is false`()
    {
        val mockApiClient = getMockAPIClient(FileType.Survey)
        val mockRequest = mock<HttpServletRequest> {
            on { getParameter("strict") } doReturn "false"
        }
        val mockFileManager = getMockFileManager(FileType.Survey)
        val sut = getSut(mockFileManager, mockApiClient, mock(), mock(), mockRequest) as ADRController
        sut.importSurvey(adrResource)
        verify(mockApiClient)
                .validateSurveyAndProgramme(
                        VersionFileWithPath("test-path", "hash", "some-file-name.csv", false),
                        "shape-path", FileType.Survey, false)
    }

    @Test
    fun `requests strict validation when query param is true`()
    {
        val mockApiClient = getMockAPIClient(FileType.Survey)
        val mockRequest = mock<HttpServletRequest> {
            on { getParameter("strict") } doReturn "true"
        }
        val mockFileManager = getMockFileManager(FileType.Survey)
        val sut = getSut(mockFileManager, mockApiClient, mock(), mock(), mockRequest) as ADRController
        sut.importSurvey(adrResource)
        verify(mockApiClient)
                .validateSurveyAndProgramme(
                        VersionFileWithPath("test-path", "hash", "some-file-name.csv", false),
                        "shape-path", FileType.Survey, true)
    }

    @Test
    fun `pushes output zip to ADR`()
    {
        val id = mapOf("id" to "downloadId")
        val data = mapOf("data" to id)
        val mockAPIClient: HintrAPIClient = mock {
            on { downloadOutputSubmit("spectrum", "model1") } doReturn ResponseEntity.ok().body(objectMapper.writeValueAsString(data))
            on { downloadOutputResult("downloadId") } doReturn ResponseEntity.ok().body(StreamingResponseBody { it.write("".toByteArray()) })
        }
        val mockClient: ADRClient = mock {
            on {
                postFile(eq("resource_create"),
                        eq(listOf("name" to "Output zip", "" +
                                "hash" to "D41D8CD98F00B204E9800998ECF8427E",
                                "resource_type" to "adr-output-zip",
                                "description" to "Naomi model outputs",
                                "restricted" to "{\"allowed_organizations\":\"unaids\",\"allowed_users\":\"\",\"level\":\"restricted\"}",
                                "package_id" to "dataset1")), any())
            } doReturn ResponseEntity.ok().body("whatever")
        }
        val mockBuilder: ADRService = mock {
            on { build() } doReturn mockClient
        }
        val sut = ADRController(mock(), mock(), mockBuilder, objectMapper, mockProperties, mock(), mockAPIClient,
                mock(), mock(), mock())
        val result = sut.pushFileToADR("dataset1", "adr-output-zip",
                "downloadId", "output1.zip", null, "Output zip",
                "Naomi model outputs")
        verify(mockClient).postFile(any(), any(), argForWhich { first == "upload" && second.name == "output1.zip" })
        assertThat(result.statusCode).isEqualTo(HttpStatus.OK)
        assertThat(result.body!!).isEqualTo("whatever")
    }

    @Test
    fun `pushes output summary to ADR`()
    {
        val id = mapOf("id" to "downloadId")
        val data = mapOf("data" to id)
        val mockAPIClient: HintrAPIClient = mock {
            on { downloadOutputSubmit("summary", "model1") } doReturn ResponseEntity.ok().body(objectMapper.writeValueAsString(data))
            on { downloadOutputResult("downloadId") } doReturn ResponseEntity.ok().body(StreamingResponseBody { it.write("".toByteArray()) })
        }
        val mockClient: ADRClient = mock {
            on {
                postFile(eq("resource_create"),
                        eq(listOf("name" to "Output summary",
                                "hash" to "D41D8CD98F00B204E9800998ECF8427E",
                                "resource_type" to "adr-output-summary",
                                "description" to "Naomi summary report",
                                "restricted" to "{\"allowed_organizations\":\"unaids\",\"allowed_users\":\"\",\"level\":\"restricted\"}",
                                "package_id" to "dataset1")),
                        any())
            } doReturn ResponseEntity.ok().body("whatever")
        }
        val mockBuilder: ADRService = mock {
            on { build() } doReturn mockClient
        }
        val sut = ADRController(mock(), mock(), mockBuilder, objectMapper, mockProperties, mock(), mockAPIClient,
                mock(), mock(), mock())
        val result = sut.pushFileToADR("dataset1", "adr-output-summary", "downloadId", "output1.html", null, "Output summary", "Naomi summary report")
        verify(mockClient).postFile(any(), any(), argForWhich { first == "upload" && second.name == "output1.html" })
        assertThat(result.statusCode).isEqualTo(HttpStatus.OK)
        assertThat(result.body!!).isEqualTo("whatever")
    }

    @Test
    fun `pushes output comparison to ADR`()
    {
        val id = mapOf("id" to "downloadId")
        val data = mapOf("data" to id)
        val mockAPIClient: HintrAPIClient = mock {
            on { downloadOutputSubmit("comparison", "model1") } doReturn ResponseEntity.ok().body(objectMapper.writeValueAsString(data))
            on { downloadOutputResult("downloadId") } doReturn ResponseEntity.ok().body(StreamingResponseBody { it.write("".toByteArray()) })
        }
        val mockClient: ADRClient = mock {
            on {
                postFile(eq("resource_create"),
                        eq(listOf("name" to "Output comparison",
                                "hash" to "D41D8CD98F00B204E9800998ECF8427E",
                                "resource_type" to "adr-output-comparison",
                                "description" to "Naomi comparison report",
                                "restricted" to "{\"allowed_organizations\":\"unaids\",\"allowed_users\":\"\",\"level\":\"restricted\"}",
                                "package_id" to "dataset1")),
                        any())
            } doReturn ResponseEntity.ok().body("whatever")
        }
        val mockBuilder: ADRService = mock {
            on { build() } doReturn mockClient
        }
        val sut = ADRController(mock(), mock(), mockBuilder, objectMapper, mockProperties, mock(), mockAPIClient,
                mock(), mock(), mock())
        val result = sut.pushFileToADR(
                "dataset1",
                "adr-output-comparison",
                "downloadId",
                "output1.html",
                null,
                "Output comparison",
                "Naomi comparison report")

        verify(mockClient).postFile(any(), any(), argForWhich { first == "upload" && second.name == "output1.html" })
        assertThat(result.statusCode).isEqualTo(HttpStatus.OK)
        assertThat(result.body!!).isEqualTo("whatever")
    }

    private fun testPushesInputFile(fileType: FileType, fileExt: String, resourceType: String)
    {
        val testFilePath = "${tmpTestDir!!.path}/1234.$fileExt"
        val fileHash = writeTestFile(testFilePath, "hello")

        val versionFile = VersionFileWithPath(testFilePath, "abc123", "original-test.$fileExt", false)

        val mockFileManager = mock<FileManager> {
            on { getFile(fileType) } doReturn versionFile
        }

        val mockClient = mock<ADRClient> {
            on {
                postFile(eq("resource_patch"),
                        eq(listOf("name" to "testResName",
                                "hash" to fileHash,
                                "resource_type" to resourceType,
                                "id" to "testResId")),
                        any())
            } doReturn ResponseEntity.ok().body("whatever")
            on { get("resource_show?id=testResId") } doReturn ResponseEntity.ok()
                    .body("""{"data": {"hash": "xyz987"}}""")
        }
        val mockBuilder: ADRService = mock {
            on { build() } doReturn mockClient
        }

        val sut = ADRController(mock(), mock(), mockBuilder, objectMapper, mockProperties, mockFileManager,
                mock(), mock(), mock(), mock())
        val result = sut.pushFileToADR("datasetId", resourceType, "calId",
                "testResFilename.", "testResId", "testResName", null)

        assertThat(result.statusCode).isEqualTo(HttpStatus.OK)
        assertThat(result.body!!).isEqualTo("whatever")

        val argumentCaptor = argumentCaptor<Pair<String, File>>()
        verify(mockClient).postFile(any(), any(), argumentCaptor.capture())
        assertThat(argumentCaptor.firstValue.first).isEqualTo("upload")
        val uploadedFile = argumentCaptor.firstValue.second
        assertThat(uploadedFile.name).isEqualTo("original-test.$fileExt")
    }

    @Test
    fun `pushes pjnz to ADR`()
    {
        testPushesInputFile(FileType.PJNZ, "pjnz", "adr-pjnz")
    }

    @Test
    fun `pushes shape file to ADR`()
    {
        testPushesInputFile(FileType.Shape, "geojson", "adr-shape")
    }

    @Test
    fun `pushes population file to ADR`()
    {
        testPushesInputFile(FileType.Population, "csv", "adr-pop")
    }

    @Test
    fun `pushes survey file to ADR`()
    {
        testPushesInputFile(FileType.Survey, "csv", "adr-survey")
    }

    @Test
    fun `pushes art file to ADR`()
    {
        testPushesInputFile(FileType.Programme, "csv", "adr-art")
    }

    @Test
    fun `pushes anc file to ADR`()
    {
        testPushesInputFile(FileType.ANC, "csv", "adr-anc")
    }

    @Test
    fun `returns error on upload input file without resourceId`()
    {
        val sut = ADRController(mock(), mock(), mock(), mock(), mockProperties,
                mock(), mock(), mock(), mock(), mock())
        val result = sut.pushFileToADR("datasetId", "adr-pjnz", "calId",
                "testResFilename.", null, "testResName", null)
        assertThat(result.statusCode).isEqualTo(HttpStatus.BAD_REQUEST)
        assertThat(result.body!!).contains("resourceId must be provided for input resourceType")
    }

    @Test
    fun `returns error on upload output file without description`()
    {
        val sut = ADRController(mock(), mock(), mock(), mock(), mockProperties,
                mock(), mock(), mock(), mock(), mock())
        val result = sut.pushFileToADR("datasetId", "adr-output-zip", "calId",
                "testResFilename.", "testResName", "resId", null)
        assertThat(result.statusCode).isEqualTo(HttpStatus.BAD_REQUEST)
        assertThat(result.body!!).contains("description must be provided for output resourceType")
    }

    @Test
    fun `returns error on upload input file which does not exist in version`()
    {
        val sut = ADRController(mock(), mock(), mock(), mock(), mockProperties,
                mock(), mock(), mock(), mock(), mock())
        val result = sut.pushFileToADR("datasetId", "adr-pjnz", "calId",
                "testResFilename.", "testResName", "testResId", null)
        assertThat(result.statusCode).isEqualTo(HttpStatus.BAD_REQUEST)
        assertThat(result.body!!).contains("File does not exist")
    }

    @Test
    fun `throws exception on push input file to ADR if not input resource type`()
    {
        val sut = ADRController(mock(), mock(), mock(), mock(), mockProperties,
                mock(), mock(), mock(), mock(), mock())
        val pushInputFileMethod = sut::class.memberFunctions.find { it.name == "pushInputFileToADR" }
        pushInputFileMethod!!.isAccessible = true
        assertThatThrownBy { pushInputFileMethod.call(sut, "dataset1", mockProperties.adrOutputZipSchema, "testResId", "testResName") }
                .isInstanceOf(InvocationTargetException::class.java)
                .hasCauseInstanceOf(IllegalArgumentException::class.java)
    }

    @Test
    fun `throws exception on push output file to ADR if not output resource type`()
    {
        val sut = ADRController(mock(), mock(), mock(), mock(), mockProperties,
                mock(), mock(), mock(), mock(), mock())
        val pushOutputFileMethod = sut::class.memberFunctions.find { it.name == "pushOutputFileToADR" }
        pushOutputFileMethod!!.isAccessible = true
        assertThatThrownBy {
            pushOutputFileMethod.call(sut, "dataset1", mockProperties.adrPJNZSchema,
                    "testCalId", "testOutput.zip", "testResId", "testResName", "testDesc")
        }
                .isInstanceOf(InvocationTargetException::class.java)
                .hasCauseInstanceOf(IllegalArgumentException::class.java)
    }

    @Test
    fun `pushes updated file to ADR`()
    {
        val hash = mapOf("hash" to "D41D8CD98F00B204E9800998ECF8427EXXXXX", "id" to "downloadId")
        val data = mapOf("data" to hash)
        val mockAPIClient: HintrAPIClient = mock {
            on { downloadOutputSubmit("spectrum", "model1") } doReturn ResponseEntity.ok().body(objectMapper.writeValueAsString(data))
            on { downloadOutputResult("downloadId") } doReturn ResponseEntity.ok().body(StreamingResponseBody { it.write("".toByteArray()) })
        }
        val mockClient: ADRClient = mock {
            on {
                postFile(eq("resource_patch"),
                        eq(listOf("name" to "Output zip",
                                "hash" to "D41D8CD98F00B204E9800998ECF8427E",
                                "resource_type" to "adr-output-zip",
                                "description" to "Naomi model outputs",
                                "id" to "resource1")), any())
            } doReturn ResponseEntity.ok().body("whatever")

            on { get("resource_show?id=resource1") } doReturn ResponseEntity.ok().body(objectMapper.writeValueAsString(data))
        }
        val mockBuilder: ADRService = mock {
            on { build() } doReturn mockClient
        }

        val sut = ADRController(mock(), mock(), mockBuilder, objectMapper, mockProperties,
                mock(), mockAPIClient, mock(), mock(), mock())
        val result = sut.pushFileToADR("dataset1", "adr-output-zip", "downloadId",
                "output1.zip", "resource1", "Output zip", "Naomi model outputs")
        assertThat(result.statusCode).isEqualTo(HttpStatus.OK)
        assertThat(result.body!!).isEqualTo("whatever")
    }

    @Test
    fun `uploading returns error and does not update ADR if exception occurs while comparing hash codes`()
    {
        val id = mapOf("id" to "downloadId")
        val data = mapOf("data" to id)
        val mockAPIClient: HintrAPIClient = mock {
            on { downloadOutputSubmit("spectrum", "model1") } doReturn ResponseEntity.ok().body(objectMapper.writeValueAsString(data))
            on { downloadOutputResult("downloadId") } doReturn ResponseEntity.ok().body(StreamingResponseBody { it.write("".toByteArray()) })
        }
        val mockClient: ADRClient = mock {
            on { get("resource_show?id=resource1") } doReturn ResponseEntity.status(HttpStatus.BAD_GATEWAY).body(null)
        }
        val mockBuilder: ADRService = mock {
            on { build() } doReturn mockClient
        }

        val sut = ADRController(mock(), mock(), mockBuilder, objectMapper, mockProperties,
                mock(), mockAPIClient, mock(), mock(), mock())
        val result = sut.pushFileToADR("dataset1", "adr-output-zip",
                "downloadId", "output1.zip", "resource1",
                "Naomi model outputs", "Naomi model outputs description")
        verify(mockClient, never()).postFile(any(), any(), any())
        assertThat(result.statusCode).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR)
        assertThat(objectMapper.readTree(result.body)["data"].textValue()).isEqualTo(null)
    }

    @Test
    fun `does not update ADR if uploaded file has no changes`()
    {
        val hash = mapOf("hash" to "D41D8CD98F00B204E9800998ECF8427E", "id" to "modelResponseId")
        val data = mapOf("data" to hash)
        val mockAPIClient: HintrAPIClient = mock {
            on { downloadOutputSubmit("spectrum", "model1") } doReturn ResponseEntity.ok().body(objectMapper.writeValueAsString(data))
            on { downloadOutputResult("downloadId") } doReturn ResponseEntity.ok().body(StreamingResponseBody { it.write("".toByteArray()) })
        }
        val mockClient: ADRClient = mock {
            on { get("resource_show?id=resource1") } doReturn ResponseEntity.ok().body(objectMapper.writeValueAsString(data))
        }
        val mockBuilder: ADRService = mock {
            on { build() } doReturn mockClient
        }
        val sut = ADRController(mock(), mock(), mockBuilder, objectMapper, mockProperties,
                mock(), mockAPIClient, mock(), mock(), mock())
        val hasOldHash = sut.uploadFileHasChanges("resource1", "D41D8CD98F00B204E9800998ECF8427E")
        assertThat(hasOldHash).isFalse

        val result = sut.pushFileToADR("dataset1", "adr-output-zip",
                "downloadId", "output1.zip", "resource1",
                "Naomi model outputs", "Naomi model output description")
        verify(mockClient, never()).postFile(any(), any(), any())
        assertThat(result.statusCode).isEqualTo(HttpStatus.OK)
        assertThat(objectMapper.readTree(result.body)["data"].textValue()).isEqualTo(null)
    }

    @Test
    fun `pushes file to ADR fails if resourceType invalid`()
    {
        val id = mapOf("id" to "modelResponseId")
        val data = mapOf("data" to id)
        val mockAPIClient: HintrAPIClient = mock {
            on { downloadOutputSubmit("spectrum", "model1") } doReturn ResponseEntity.ok().body(objectMapper.writeValueAsString(data))
            on { downloadOutputResult("modelResponseId") } doReturn ResponseEntity.ok().body(StreamingResponseBody { it.write("".toByteArray()) })
        }
        val sut = ADRController(mock(), mock(), mock(), objectMapper, mockProperties,
                mock(), mockAPIClient, mock(), mock(), mock())
        val result = sut.pushFileToADR("dataset1", "adr-output-unknown", "model1", "output1.zip", "resource1", "Output zip", "Naomi model outputs")
        assertThat(result.statusCode).isEqualTo(HttpStatus.BAD_REQUEST)
        assertThat(objectMapper.readTree(result.body)["errors"][0]["detail"].textValue()).isEqualTo("Invalid resourceType")
    }

    @Test
    fun `pushes file to ADR fails if retrieval from hintr fails`()
    {
        val id = mapOf("id" to "downloadId")
        val data = mapOf("data" to id)
        val mockAPIClient: HintrAPIClient = mock {
            on { downloadOutputSubmit("spectrum", "model1") } doReturn ResponseEntity.ok().body(objectMapper.writeValueAsString(data))
            on { downloadOutputResult("downloadId") } doReturn ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(StreamingResponseBody { it.write("Internal Server Error".toByteArray()) })
            on { downloadOutputResult("downloadId") } doReturn ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(StreamingResponseBody { it.write("Internal Server Error".toByteArray()) })
        }
        val sut = ADRController(mock(), mock(), mock(), objectMapper, mockProperties,
                mock(), mockAPIClient, mock(), mock(), mock())

        val result = sut.pushFileToADR("dataset1", "adr-output-zip", "downloadId", "output1.zip", "resource1", "Output zip", "Naomi model outputs")
        assertThat(result.statusCode).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR)
        assertThat(result.body!!).contains("Internal Server Error")
    }

    @Test
    fun `returns error if ADR upload fails`()
    {
        val hash = mapOf("hash" to "", "id" to "downloadId")
        val data = mapOf("data" to hash)
        val mockAPIClient: HintrAPIClient = mock {
            on { downloadOutputSubmit("spectrum", "model1") } doReturn ResponseEntity.ok().body(objectMapper.writeValueAsString(data))
            on { downloadOutputResult("downloadId") } doReturn ResponseEntity.ok().body(StreamingResponseBody { it.write("".toByteArray()) })
        }
        val mockClient: ADRClient = mock {
            on { postFile(any(), any(), any()) } doReturn ResponseEntity.status(HttpStatus.BAD_GATEWAY).body("Bad Gateway")
            on { get(any()) } doReturn ResponseEntity.ok().body(objectMapper.writeValueAsString(data))
        }
        val mockBuilder: ADRService = mock {
            on { build() } doReturn mockClient
        }
        val sut = ADRController(mock(), mock(), mockBuilder, objectMapper, mockProperties,
                mock(), mockAPIClient, mock(), mock(), mock())
        val result = sut.pushFileToADR("dataset1", "adr-output-zip", "downloadId", "output1.zip", "resource1", "Output zip", "Naomi model outputs")

        assertThat(result.statusCode).isEqualTo(HttpStatus.BAD_GATEWAY)
        assertThat(result.body!!).isEqualTo("Bad Gateway")
    }

    @Test
    fun `pushes file to ADR fails if retrieval from hintr fails with empty response`()
    {
        val id = mapOf("id" to "downloadId")
        val data = mapOf("data" to id)
        val mockAPIClient: HintrAPIClient = mock {
            on { downloadOutputSubmit("spectrum", "model1") } doReturn ResponseEntity.ok().body(objectMapper.writeValueAsString(data))
            on { downloadOutputResult("downloadId") } doReturn ResponseEntity.status(HttpStatus.BAD_GATEWAY).body(null)
        }
        val sut = ADRController(mock(), mock(), mock(), objectMapper, mockProperties,
                mock(), mockAPIClient, mock(), mock(), mock())
        val result = sut.pushFileToADR("dataset1", "adr-output-zip",
                "downloadId", "output1.zip", "resource1",
                "Naomi model outputs", "Naomi output description")
        assertThat(result.statusCode).isEqualTo(HttpStatus.BAD_GATEWAY)
    }

    @Test
    fun `gets orgs with permission`()
    {
        val expectedUrl = "organization_list_for_user?permission=test_perm"
        val mockClient = mock<ADRClient> {
            on { get(expectedUrl) } doReturn ResponseEntity
                    .ok()
                    .body("whatever")
        }
        val mockBuilder = mock<ADRService> {
            on { build() } doReturn mockClient
        }
        val sut = ADRController(
                mock(),
                mock(),
                mockBuilder,
                objectMapper,
                mockProperties,
                mock(),
                mock(),
                mockSession,
                mock(),
                mock())
        val result = sut.getOrgsWithPermission("test_perm")
        assertThat(result.body!!).isEqualTo("whatever")
    }

    @Test
    fun `creates a release if no release exists on ADR with the same name`()
    {
        val data = mapOf("data" to listOf<Any>())
        val mockClient = mock<ADRClient> {
            on { get("/dataset_version_list?dataset_id=dataset-1") } doReturn ResponseEntity
                    .ok()
                    .body(objectMapper.writeValueAsString(data))
            on { post("/dataset_version_create", listOf("dataset_id" to "dataset-1", "name" to "release-1")) } doReturn ResponseEntity
                    .ok()
                    .body("whatever")
        }
        val mockBuilder = mock<ADRService> {
            on { build() } doReturn mockClient
        }
        val sut = ADRController(
                mock(),
                mock(),
                mockBuilder,
                objectMapper,
                mockProperties,
                mock(),
                mock(),
                mockSession,
                mock(),
                mock())
        val result = sut.createRelease("dataset-1", "release-1")
        assertThat(result.body!!).isEqualTo("whatever")
    }

    @Test
    fun `deletes release of same name on ADR and creates a new release`()
    {
        val existingRelease = mapOf("name" to "release-1", "id" to "other-id")
        val data = mapOf("data" to listOf(existingRelease))
        val mockClient = mock<ADRClient> {
            on { get("/dataset_version_list?dataset_id=dataset-1") } doReturn ResponseEntity
                    .ok()
                    .body(objectMapper.writeValueAsString(data))
            on { post("/dataset_version_create", listOf("dataset_id" to "dataset-1", "name" to "release-1")) } doReturn ResponseEntity
                    .ok()
                    .body("created release")
            on { post("/version_delete", listOf("version_id" to "other-id")) } doReturn ResponseEntity
                    .ok()
                    .body("deleted release")
        }
        val mockBuilder = mock<ADRService> {
            on { build() } doReturn mockClient
        }
        val sut = ADRController(
                mock(),
                mock(),
                mockBuilder,
                objectMapper,
                mockProperties,
                mock(),
                mock(),
                mockSession,
                mock(),
                mock())
        val result = sut.createRelease("dataset-1", "release-1")
        assertThat(result.body!!).isEqualTo("created release")
    }

    @Test
    fun `returns error if create release endpoint fails`()
    {
        val existingRelease = mapOf("name" to "release-1", "id" to "other-id")
        val data = mapOf("data" to listOf(existingRelease))
        val mockClient = mock<ADRClient> {
            on { get("/dataset_version_list?dataset_id=dataset-1") } doReturn ResponseEntity
                    .ok()
                    .body(objectMapper.writeValueAsString(data))
            on { post("/dataset_version_create", listOf("dataset_id" to "dataset-1", "name" to "release-1")) } doReturn ResponseEntity.status(HttpStatus.BAD_GATEWAY).body("Bad Gateway")
            on { post("/version_delete", listOf("version_id" to "other-id")) } doReturn ResponseEntity
                    .ok()
                    .body("whatever")
        }
        val mockBuilder = mock<ADRService> {
            on { build() } doReturn mockClient
        }
        val sut = ADRController(
                mock(),
                mock(),
                mockBuilder,
                objectMapper,
                mockProperties,
                mock(),
                mock(),
                mockSession,
                mock(),
                mock())
        val result = sut.createRelease("dataset-1", "release-1")
        assertThat(result.statusCode).isEqualTo(HttpStatus.BAD_GATEWAY)
        assertThat(result.body!!).isEqualTo("Bad Gateway")
    }

    @Test
    fun `returns error if delete release endpoint fails while trying to create a release`()
    {
        val existingRelease = mapOf("name" to "release-1", "id" to "other-id")
        val data = mapOf("data" to listOf(existingRelease))
        val mockClient = mock<ADRClient> {
            on { get("/dataset_version_list?dataset_id=dataset-1") } doReturn ResponseEntity
                    .ok()
                    .body(objectMapper.writeValueAsString(data))
            on { post("/version_delete", listOf("version_id" to "other-id")) } doReturn ResponseEntity.status(HttpStatus.BAD_GATEWAY).body("Bad Gateway")
        }
        val mockBuilder = mock<ADRService> {
            on { build() } doReturn mockClient
        }
        val sut = ADRController(
                mock(),
                mock(),
                mockBuilder,
                objectMapper,
                mockProperties,
                mock(),
                mock(),
                mockSession,
                mock(),
                mock())
        val result = sut.createRelease("dataset-1", "release-1")
        assertThat(result.statusCode).isEqualTo(HttpStatus.BAD_GATEWAY)
        assertThat(result.body!!).isEqualTo("Bad Gateway")
    }

    @Test
    fun `returns error if get releases endpoint fails while trying to create a release`()
    {
        val mockClient = mock<ADRClient> {
            on { get("/dataset_version_list?dataset_id=dataset-1") } doReturn ResponseEntity.status(HttpStatus.BAD_GATEWAY).body("Bad Gateway")
        }
        val mockBuilder = mock<ADRService> {
            on { build() } doReturn mockClient
        }
        val sut = ADRController(
                mock(),
                mock(),
                mockBuilder,
                objectMapper,
                mockProperties,
                mock(),
                mock(),
                mockSession,
                mock(),
                mock())
        val result = sut.createRelease("dataset-1", "release-1")
        assertThat(result.statusCode).isEqualTo(HttpStatus.BAD_GATEWAY)
        assertThat(result.body!!).isEqualTo("Bad Gateway")
    }

    @Test
    fun `attempts to create a release if a release exists on ADR with no name (purely theoretical)`()
    {
        val existingRelease = mapOf("id" to "other-id")
        val data = mapOf("data" to listOf(existingRelease))
        val mockClient = mock<ADRClient> {
            on { get("/dataset_version_list?dataset_id=dataset-1") } doReturn ResponseEntity
                    .ok()
                    .body(objectMapper.writeValueAsString(data))
            on { post("/dataset_version_create", listOf("dataset_id" to "dataset-1", "name" to "release-1")) } doReturn ResponseEntity
                    .ok()
                    .body("whatever")
        }
        val mockBuilder = mock<ADRService> {
            on { build() } doReturn mockClient
        }
        val sut = ADRController(
                mock(),
                mock(),
                mockBuilder,
                objectMapper,
                mockProperties,
                mock(),
                mock(),
                mockSession,
                mock(),
                mock())
        val result = sut.createRelease("dataset-1", "release-1")
        assertThat(result.body!!).isEqualTo("whatever")
    }

    private fun makeFakeSuccessResponse(): ResponseEntity<String>
    {
        val resultWithResources = mapOf("resources" to listOf(1, 2))
        val resultWithoutResources = mapOf("resources" to listOf<Any>())
        val data = mapOf("results" to listOf(resultWithResources, resultWithoutResources))
        val body = mapOf("data" to data)
        return ResponseEntity
                .ok()
                .body(objectMapper.writeValueAsString(body))
    }

}
