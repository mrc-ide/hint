package org.imperial.mrc.hint.controllers

import org.imperial.mrc.hint.FileManager
import org.imperial.mrc.hint.FileType
import org.imperial.mrc.hint.clients.HintrAPIClient
import org.imperial.mrc.hint.db.VersionRepository
import org.imperial.mrc.hint.models.EmptySuccessResponse
import org.imperial.mrc.hint.models.asResponseEntity
import org.imperial.mrc.hint.security.Session
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import org.springframework.web.multipart.MultipartFile
import javax.servlet.http.HttpServletRequest

@RestController
@RequestMapping("/disease")
class DiseaseController(fileManager: FileManager,
                        apiClient: HintrAPIClient,
                        session: Session,
                        versionRepository: VersionRepository,
                        request: HttpServletRequest) :
        HintrController(fileManager, apiClient, session, versionRepository, request)
{

    @PostMapping("/survey/")
    @ResponseBody
    fun uploadSurvey(@RequestParam("file") file: MultipartFile): ResponseEntity<String>
    {
        return saveAndValidate(file, FileType.Survey)
    }

    @PostMapping("/programme/")
    @ResponseBody
    fun uploadProgramme(@RequestParam("file") file: MultipartFile): ResponseEntity<String>
    {
        return saveAndValidate(file, FileType.Programme)
    }

    @PostMapping("/anc/")
    @ResponseBody
    fun uploadANC(@RequestParam("file") file: MultipartFile): ResponseEntity<String>
    {
        return saveAndValidate(file, FileType.ANC)
    }

    @PostMapping("/vmmc/")
    @ResponseBody
    fun uploadVmmc(@RequestParam("file") file: MultipartFile): ResponseEntity<String>
    {
        return saveAndValidate(file, FileType.Vmmc)
    }

    @GetMapping("/survey/")
    @ResponseBody
    fun getSurvey(): ResponseEntity<String>
    {
        return getAndValidate(FileType.Survey)
    }

    @GetMapping("/programme/")
    @ResponseBody
    fun getProgramme(): ResponseEntity<String>
    {
        return getAndValidate(FileType.Programme)
    }

    @GetMapping("/anc/")
    @ResponseBody
    fun getANC(): ResponseEntity<String>
    {
        return getAndValidate(FileType.ANC)
    }

    @GetMapping("/vmmc/")
    @ResponseBody
    fun getVmmc(): ResponseEntity<String>
    {
        return getAndValidate(FileType.Vmmc)
    }

    @DeleteMapping("/survey/")
    @ResponseBody
    fun removeSurvey(): ResponseEntity<String>
    {
        versionRepository.removeVersionFile(session.getVersionId(), FileType.Survey)
        return EmptySuccessResponse.asResponseEntity()
    }

    @DeleteMapping("/programme/")
    @ResponseBody
    fun removeProgramme(): ResponseEntity<String>
    {
        versionRepository.removeVersionFile(session.getVersionId(), FileType.Programme)
        return EmptySuccessResponse.asResponseEntity()
    }

    @DeleteMapping("/anc/")
    @ResponseBody
    fun removeANC(): ResponseEntity<String>
    {
        versionRepository.removeVersionFile(session.getVersionId(), FileType.ANC)
        return EmptySuccessResponse.asResponseEntity()
    }

    @DeleteMapping("/vmmc/")
    @ResponseBody
    fun removeVmmc(): ResponseEntity<String>
    {
        versionRepository.removeVersionFile(session.getVersionId(), FileType.Vmmc)
        return EmptySuccessResponse.asResponseEntity()
    }
}
