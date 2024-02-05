package org.imperial.mrc.hint.unit.controllers

import com.nhaarman.mockito_kotlin.doReturn
import com.nhaarman.mockito_kotlin.mock
import com.nhaarman.mockito_kotlin.verify
import org.imperial.mrc.hint.FileManager
import org.imperial.mrc.hint.FileType
import org.imperial.mrc.hint.clients.HintrAPIClient
import org.imperial.mrc.hint.controllers.DiseaseController
import org.imperial.mrc.hint.controllers.HintrController
import org.imperial.mrc.hint.db.VersionRepository
import org.imperial.mrc.hint.exceptions.HintException
import org.imperial.mrc.hint.helpers.TranslationAssert
import org.imperial.mrc.hint.models.VersionFileWithPath
import org.imperial.mrc.hint.security.Session
import org.junit.jupiter.api.Test
import org.mockito.internal.verification.Times
import org.springframework.http.HttpStatus
import javax.servlet.http.HttpServletRequest

class DiseaseControllerTests : HintrControllerTests()
{

    override fun getSut(mockFileManager: FileManager, mockAPIClient: HintrAPIClient,
                        mockSession: Session, mockVersionRepository: VersionRepository,
                        mockRequest: HttpServletRequest): HintrController
    {
        return DiseaseController(mockFileManager, mockAPIClient, mockSession, mockVersionRepository, mockRequest)
    }

    @Test
    fun `validates survey file`()
    {
        assertSavesAndValidates(FileType.Survey) { sut ->
            (sut as DiseaseController).uploadSurvey(mockFile)
        }
    }

    @Test
    fun `validates program file`()
    {
        assertSavesAndValidates(FileType.Programme) { sut ->
            (sut as DiseaseController).uploadProgramme(mockFile)
        }
    }

    @Test
    fun `validates anc file`()
    {
        assertSavesAndValidates(FileType.ANC) { sut ->
            (sut as DiseaseController).uploadANC(mockFile)
        }
    }

    @Test
    fun `validates vmmc file`()
    {
        assertSavesAndValidates(FileType.Vmmc) { sut ->
            (sut as DiseaseController).uploadVmmc(mockFile)
        }
    }

    @Test
    fun `deletes survey file`()
    {
        assertDeletes(FileType.Survey) { sut ->
            (sut as DiseaseController).removeSurvey()
        }
    }

    @Test
    fun `deletes programme file`()
    {
        assertDeletes(FileType.Programme) { sut ->
            (sut as DiseaseController).removeProgramme()
        }
    }

    @Test
    fun `deletes anc file`()
    {
        assertDeletes(FileType.ANC) { sut ->
            (sut as DiseaseController).removeANC()
        }
    }

    @Test
    fun `deletes vmmc file`()
    {
        assertDeletes(FileType.Vmmc) { sut ->
            (sut as DiseaseController).removeVmmc()
        }
    }

    @Test
    fun `throws error if the shape file does not exist`()
    {
        val mockPjnz = VersionFileWithPath("pjnzPath", "pjnzHash", "pjnzFile", false)
        val mockFileManager = mock<FileManager> {
            on { getFiles(FileType.PJNZ, FileType.Shape) } doReturn mapOf(FileType.PJNZ.toString() to mockPjnz)
        }

        val mockApiClient = getMockAPIClient(FileType.Survey)
        val sut = DiseaseController(mockFileManager, mockApiClient, mock(), mock(), mock())

        TranslationAssert.assertThatThrownBy { sut.uploadSurvey(mockFile) }
                .isInstanceOf(HintException::class.java)
                .matches { (it as HintException).key == "missingShapeFile"}
                .matches { (it as HintException).httpStatus == HttpStatus.BAD_REQUEST }
                .hasTranslatedMessage("You must upload a shape file before uploading survey or programme data.")
    }

    @Test
    fun `throws error if the shape file path is empty`()
    {
        val mockPjnz = VersionFileWithPath("pjnzPath", "pjnzHash", "pjnzFile", false)
        val mockShape = VersionFileWithPath(" ", "shapeHash", "shapeFile", false)
        val mockFileManager = mock<FileManager> {
            on { getFiles(FileType.PJNZ, FileType.Shape) } doReturn mapOf(
                    FileType.PJNZ.toString() to mockPjnz,
                    FileType.Shape.toString() to mockShape)
        }

        val mockApiClient = getMockAPIClient(FileType.Survey)
        val sut = DiseaseController(mockFileManager, mockApiClient, mock(), mock(), mock())

        TranslationAssert.assertThatThrownBy { sut.uploadSurvey(mockFile) }
                .isInstanceOf(HintException::class.java)
                .matches { (it as HintException).key == "missingShapeFile"}
                .matches { (it as HintException).httpStatus == HttpStatus.BAD_REQUEST }
                .hasTranslatedMessage("You must upload a shape file before uploading survey or programme data.")
    }

    @Test
    fun `throws error if the pjnz file does not exist`()
    {
        val mockShape = VersionFileWithPath("shapePath", "shapeHash", "shapeFile", false)
        val mockFileManager = mock<FileManager> {
            on { getFiles(FileType.PJNZ, FileType.Shape) } doReturn mapOf(FileType.Shape.toString() to mockShape)
        }

        val mockApiClient = getMockAPIClient(FileType.Survey)
        val sut = DiseaseController(mockFileManager, mockApiClient, mock(), mock(), mock())

        TranslationAssert.assertThatThrownBy { sut.uploadSurvey(mockFile) }
                .isInstanceOf(HintException::class.java)
                .matches { (it as HintException).key == "missingPjnzFile"}
                .matches { (it as HintException).httpStatus == HttpStatus.BAD_REQUEST }
                .hasTranslatedMessage("You must upload a Spectrum file before uploading survey or programme data.")
    }

    @Test
    fun `throws error if the pjnz file path is empty`()
    {
        val mockPjnz = VersionFileWithPath(" ", "pjnzHash", "pjnzFile", false)
        val mockShape = VersionFileWithPath("shapePath", "shapeHash", "shapeFile", false)
        val mockFileManager = mock<FileManager> {
            on { getFiles(FileType.PJNZ, FileType.Shape) } doReturn mapOf(
                    FileType.PJNZ.toString() to mockPjnz,
                    FileType.Shape.toString() to mockShape)
        }

        val mockApiClient = getMockAPIClient(FileType.Survey)
        val sut = DiseaseController(mockFileManager, mockApiClient, mock(), mock(), mock())

        TranslationAssert.assertThatThrownBy { sut.uploadSurvey(mockFile) }
                .isInstanceOf(HintException::class.java)
                .matches { (it as HintException).key == "missingPjnzFile"}
                .matches { (it as HintException).httpStatus == HttpStatus.BAD_REQUEST }
                .hasTranslatedMessage("You must upload a Spectrum file before uploading survey or programme data.")
    }

    @Test
    fun `requests strict validation by default`()
    {
        val mockApiClient = getMockAPIClient(FileType.ANC)
        val mockRequest = mock<HttpServletRequest>()
        val mockFileManager = getMockFileManager(FileType.ANC)
        val sut = DiseaseController(mockFileManager, mockApiClient, mock(), mock(), mockRequest)
        // test both GET and POST
        sut.getANC()
        sut.uploadANC(mockFile)
        verify(mockApiClient, Times(2))
                .validateSurveyAndProgramme(
                        VersionFileWithPath("test-path", "hash", "some-file-name.csv", false),
                        "shape-path", FileType.ANC, true)
    }

    @Test
    fun `requests lax validation when query param is false`()
    {
        val mockApiClient = getMockAPIClient(FileType.ANC)
        val mockRequest = mock<HttpServletRequest> {
            on { getParameter("strict") } doReturn "false"
        }
        val mockFileManager = getMockFileManager(FileType.ANC)
        val sut = DiseaseController(mockFileManager, mockApiClient, mock(), mock(), mockRequest)
        // test both GET and POST
        sut.getANC()
        sut.uploadANC(mockFile)
        verify(mockApiClient, Times(2))
                .validateSurveyAndProgramme(
                        VersionFileWithPath("test-path", "hash", "some-file-name.csv", false),
                        "shape-path", FileType.ANC, false)
    }

    @Test
    fun `requests strict validation when query param is true`()
    {
        val mockApiClient = getMockAPIClient(FileType.ANC)
        val mockRequest = mock<HttpServletRequest> {
            on { getParameter("strict") } doReturn "true"
        }
        val mockFileManager = getMockFileManager(FileType.ANC)
        val sut = DiseaseController(mockFileManager, mockApiClient, mock(), mock(), mockRequest)
        // test both GET and POST
        sut.getANC()
        sut.uploadANC(mockFile)
        verify(mockApiClient, Times(2))
                .validateSurveyAndProgramme(
                        VersionFileWithPath("test-path", "hash", "some-file-name.csv", false),
                        "shape-path", FileType.ANC, true)
    }

    @Test
    fun `gets and validates VMMC`()
    {
        val mockApiClient = getMockAPIClient(FileType.Vmmc)
        val mockRequest = mock<HttpServletRequest> {
            on { getParameter("strict") } doReturn "true"
        }
        val mockFileManager = getMockFileManager(FileType.Vmmc)
        val sut = DiseaseController(mockFileManager, mockApiClient, mock(), mock(), mockRequest)

        sut.getVmmc()
        verify(mockApiClient, Times(1))
            .validateSurveyAndProgramme(
                VersionFileWithPath("test-path", "hash", "some-file-name.csv", false),
                "shape-path", FileType.Vmmc, true)
    }
}
