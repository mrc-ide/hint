package org.imperial.mrc.hint.unit.controllers

import com.nhaarman.mockito_kotlin.doReturn
import com.nhaarman.mockito_kotlin.mock
import org.assertj.core.api.Assertions.assertThat
import org.imperial.mrc.hint.clients.HintrAPIClient
import org.imperial.mrc.hint.FileManager
import org.imperial.mrc.hint.FileType
import org.imperial.mrc.hint.controllers.BaselineController
import org.imperial.mrc.hint.controllers.HintrController
import org.imperial.mrc.hint.db.SnapshotRepository
import org.imperial.mrc.hint.models.SnapshotFileWithPath
import org.imperial.mrc.hint.security.Session
import org.junit.jupiter.api.Test
import org.springframework.http.ResponseEntity

class BaselineControllerTests : HintrControllerTests() {

    override fun getSut(mockFileManager: FileManager, mockAPIClient: HintrAPIClient,
                        mockSession: Session, mockSnapshotRepository: SnapshotRepository): HintrController {
        return BaselineController(mockFileManager, mockAPIClient, mockSession, mockSnapshotRepository)
    }

    @Test
    fun `validates pjnz file`() {
        assertValidates(FileType.PJNZ) { sut ->
            (sut as BaselineController).uploadPJNZ(mockFile)
        }
    }

    @Test
    fun `validates shape file`() {
        assertValidates(FileType.Shape) { sut ->
            (sut as BaselineController).uploadShape(mockFile)
        }
    }

    @Test
    fun `validates population file`() {
        assertValidates(FileType.Population) { sut ->
            (sut as BaselineController).uploadPopulation(mockFile)
        }
    }

    @Test
    fun `getShape gets the validation result if the file exists`() {
        assertGetsIfExists(FileType.Shape) { sut ->
            (sut as BaselineController).getShape()
        }
    }

    @Test
    fun `getPopulation gets the validation result if the file exists`() {
        assertGetsIfExists(FileType.Population) { sut ->
            (sut as BaselineController).getPopulation()
        }
    }

    @Test
    fun `getPJNZ gets the validation result if the file exists`() {
        assertGetsIfExists(FileType.PJNZ) { sut ->
            (sut as BaselineController).getPJNZ()
        }
    }

    @Test
    fun `deletes pjnz file`() {
        assertDeletes(FileType.PJNZ) { sut ->
            (sut as BaselineController).removePJNZ()
        }
    }

    @Test
    fun `deletes shape file`() {
        assertDeletes(FileType.Shape) { sut ->
            (sut as BaselineController).removeShape()
        }
    }

    @Test
    fun `deletes population file`() {
        assertDeletes(FileType.Population) { sut ->
            (sut as BaselineController).removePopulation()
        }
    }

    @Test
    fun `validates combined files`() {
        val mockPjnz = SnapshotFileWithPath("pjnzPath", "pjnzHash", "pjnzFile")
        val mockShape = SnapshotFileWithPath("shapePath", "shapeHash", "shapeFile")
        val mockPop = SnapshotFileWithPath("popPath", "pjnzHash", "popFile")

        val mockFileManager = mock<FileManager> {
            on { getFile(FileType.PJNZ) } doReturn mockPjnz
            on { getFile(FileType.Shape) } doReturn mockShape
            on { getFile(FileType.Population) } doReturn mockPop
        }

        val mockResponse = mock<ResponseEntity<String>>()
        val files = mapOf(
                "pjnz" to mockPjnz,
                "shape" to mockShape,
                "population" to mockPop
        )
        val mockAPIClient = mock<HintrAPIClient> {
            on { validateBaselineCombined(files) } doReturn mockResponse
        }

        val sut = BaselineController(mockFileManager, mockAPIClient, mock(), mock())
        val result = sut.validate()

        assertThat(result).isSameAs(mockResponse)
    }
}
