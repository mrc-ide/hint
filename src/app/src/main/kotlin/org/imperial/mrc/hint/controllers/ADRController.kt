package org.imperial.mrc.hint.controllers

import com.fasterxml.jackson.databind.ObjectMapper
import org.imperial.mrc.hint.AppProperties
import org.imperial.mrc.hint.FileManager
import org.imperial.mrc.hint.FileType
import org.imperial.mrc.hint.clients.HintrAPIClient
import org.imperial.mrc.hint.db.UserRepository
import org.imperial.mrc.hint.db.VersionRepository
import org.imperial.mrc.hint.exceptions.AdrException
import org.imperial.mrc.hint.md5sum
import org.imperial.mrc.hint.models.*
import org.imperial.mrc.hint.security.Encryption
import org.imperial.mrc.hint.security.Session
import org.imperial.mrc.hint.service.ADRService
import org.slf4j.LoggerFactory
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import org.springframework.web.servlet.mvc.method.annotation.StreamingResponseBody
import java.io.ByteArrayOutputStream
import java.io.File
import java.io.FileOutputStream
import java.io.IOException
import java.nio.file.Files
import javax.servlet.http.HttpServletRequest

@RestController
@RequestMapping("/adr")
@Suppress("LongParameterList")
class ADRController(private val encryption: Encryption,
                    private val userRepository: UserRepository,
                    private val adrService: ADRService,
                    private val objectMapper: ObjectMapper,
                    private val appProperties: AppProperties,
                    fileManager: FileManager,
                    apiClient: HintrAPIClient,
                    session: Session,
                    versionRepository: VersionRepository,
                    request: HttpServletRequest) :
        HintrController(fileManager, apiClient, session, versionRepository, request)
{

    private val logger = LoggerFactory.getLogger(ADRController::class.java);

    companion object
    {
        const val MAX_DATASETS = 1000
    }

    @GetMapping("/key")
    fun getAPIKey(): ResponseEntity<String>
    {
        val userId = session.getUserProfile().id
        val encryptedKey = userRepository.getADRKey(userId)
        val key = if (encryptedKey != null)
        {
            encryption.decrypt(encryptedKey)
        }
        else
        {
            null
        }
        return SuccessResponse(key).asResponseEntity()
    }

    @PostMapping("/key")
    fun saveAPIKey(@RequestParam("key") key: String): ResponseEntity<String>
    {
        val userId = session.getUserProfile().id
        val encryptedKey = encryption.encrypt(key)
        userRepository.saveADRKey(userId, encryptedKey)
        return SuccessResponse(key).asResponseEntity()
    }

    @DeleteMapping("/key")
    fun deleteAPIKey(): ResponseEntity<String>
    {
        val userId = session.getUserProfile().id
        userRepository.deleteADRKey(userId)
        return SuccessResponse(null).asResponseEntity()
    }

    @GetMapping("/datasets")
    fun getDatasets(@RequestParam showInaccessible: Boolean = false): ResponseEntity<String>
    {
        val adr = adrService.build()

        var url = "package_search?q=type:${appProperties.adrDatasetSchema}&rows=$MAX_DATASETS&include_private=true"
        url = if (showInaccessible)
        {
            // this flag is used for testing but will never
            // actually be passed by the front-end
            url
        }
        else
        {
            "$url&hide_inaccessible_resources=true"
        }
        val response = adr.get(url)
        if (response.statusCode != HttpStatus.OK)
        {
            var errorKey = "adrFetchingDatasetsError"
            if (response.body?.contains("has not yet logged into ADR") == true)
            {
                errorKey = "adrFetchingDatasetsNoAccountError"
            }
            val message = response.body
            logger.error(message)
            throw AdrException(
                errorKey,
                response.statusCode,
                url
            )
        }
        else
        {
            val data = objectMapper.readTree(response.body!!)["data"]["results"]
            return SuccessResponse(data.filter { it["resources"].count() > 0 }).asResponseEntity()
        }
    }

    @GetMapping("/datasets/{id}")
    fun getDataset(@PathVariable id: String, @RequestParam release: String? = null): ResponseEntity<String>
    {
        val adr = adrService.build()
        var url = "package_show?id=${id}"
        if (release != null) {
            url = "$url&release=${release}"
        }
        return adr.get(url)
    }

    @GetMapping("/datasets/{id}/releases")
    fun getReleases(@PathVariable id: String): ResponseEntity<String>
    {
        val adr = adrService.build()
        return adr.get("/dataset_version_list?dataset_id=${id}")
    }

    @GetMapping("/schemas")
    fun getFileTypeMappings(): ResponseEntity<String>
    {
        return SuccessResponse(
                mapOf("baseUrl" to appProperties.adrUrl,
                        "anc" to appProperties.adrANCSchema,
                        "programme" to appProperties.adrARTSchema,
                        "pjnz" to appProperties.adrPJNZSchema,
                        "population" to appProperties.adrPopSchema,
                        "shape" to appProperties.adrShapeSchema,
                        "survey" to appProperties.adrSurveySchema,
                        "vmmc" to appProperties.adrVmmcSchema,
                        "outputZip" to appProperties.adrOutputZipSchema,
                        "outputSummary" to appProperties.adrOutputSummarySchema,
                        "outputComparison" to appProperties.adrOutputComparisonSchema)).asResponseEntity()
    }

    @GetMapping("/orgs")
    fun getOrgsWithPermission(@RequestParam permission: String): ResponseEntity<String>
    {
        val adr = adrService.build()
        return adr.get("organization_list_for_user?permission=${permission}")
    }

    @PostMapping("/pjnz")
    fun importPJNZ(@RequestBody data: AdrResource): ResponseEntity<String>
    {
        return saveAndValidate(data, FileType.PJNZ)
    }

    @PostMapping("/shape")
    fun importShape(@RequestBody data: AdrResource): ResponseEntity<String>
    {
        return saveAndValidate(data, FileType.Shape)
    }

    @PostMapping("/population")
    fun importPopulation(@RequestBody data: AdrResource): ResponseEntity<String>
    {
        return saveAndValidate(data, FileType.Population)
    }

    @PostMapping("/survey")
    fun importSurvey(@RequestBody data: AdrResource): ResponseEntity<String>
    {
        return saveAndValidate(data, FileType.Survey)
    }

    @PostMapping("/programme")
    fun importProgramme(@RequestBody data: AdrResource): ResponseEntity<String>
    {
        return saveAndValidate(data, FileType.Programme)
    }

    @PostMapping("/anc")
    fun importANC(@RequestBody data: AdrResource): ResponseEntity<String>
    {
        return saveAndValidate(data, FileType.ANC)
    }

    @PostMapping("/vmmc")
    fun importVmmc(@RequestBody data: AdrResource): ResponseEntity<String>
    {
        return saveAndValidate(data, FileType.Vmmc)
    }

    @PostMapping("/datasets/{id}/releases")
    @Suppress("ReturnCount")
    fun createRelease(@PathVariable id: String, @RequestParam name: String): ResponseEntity<String>
    {
        val adr = adrService.build()
        // checks for existing releases on ADR with the same name as the release being created
        val releasesResponse = adr.get("/dataset_version_list?dataset_id=${id}")
        if (releasesResponse.statusCode != HttpStatus.OK) 
        {
            return releasesResponse
        }
        val releases = objectMapper.readTree(releasesResponse.body!!)["data"]
        val duplicateRelease = releases.find { it["name"]?.asText() == name }
        if (duplicateRelease != null)
        {
            val duplicateReleaseId = duplicateRelease["id"].asText()
            // if a release of the same name exists on ADR, request that it is deleted
            val deleteResponse = adr.post("/version_delete", listOf("version_id" to duplicateReleaseId))
            if (deleteResponse.statusCode != HttpStatus.OK)
            {
                return deleteResponse
            }
        }
        return adr.post("/dataset_version_create", listOf("dataset_id" to id, "name" to name))
    }

    @PostMapping("/datasets/{id}/resource/{resourceType}/{downloadId}")
    @Suppress("ReturnCount", "LongParameterList", "UnsafeCallOnNullableType")
    fun pushFileToADR(@PathVariable id: String,
                      @PathVariable resourceType: String,
                      @PathVariable downloadId: String,
                      @RequestParam resourceFileName: String,
                      @RequestParam resourceId: String?,
                      @RequestParam resourceName: String,
                      @RequestParam description: String?) : ResponseEntity<String>
    {
        return when (resourceType)
        {
            appProperties.adrOutputSummarySchema,
            appProperties.adrOutputComparisonSchema,
            appProperties.adrOutputZipSchema ->
                pushOutputFileToADR(id, resourceType, downloadId, resourceFileName, resourceId, resourceName,
                        description)
            appProperties.adrPJNZSchema,
            appProperties.adrShapeSchema,
            appProperties.adrPopSchema,
            appProperties.adrSurveySchema,
            appProperties.adrARTSchema,
            appProperties.adrANCSchema,
            appProperties.adrVmmcSchema ->
                pushInputFileToADR(id, resourceType, resourceId, resourceName)
            else -> ErrorDetail(HttpStatus.BAD_REQUEST, "Invalid resourceType").toResponseEntity()

        }
    }

    private fun pushOutputFileToADR(datasetId: String,
                                   resourceType: String,
                                   downloadId: String,
                                   resourceFileName: String,
                                   resourceId: String?,
                                   resourceName: String,
                                   description: String?): ResponseEntity<String>
    {
        if (description == null)
        {
            return ErrorDetail(HttpStatus.BAD_REQUEST, "description must be provided for output resourceType")
                    .toResponseEntity()
        }
        // 1. Download relevant artefact from hintr
        val artefact: ResponseEntity<StreamingResponseBody> = when (resourceType)
        {
            appProperties.adrOutputZipSchema -> apiClient.downloadOutputResult(downloadId)
            appProperties.adrOutputSummarySchema -> apiClient.downloadOutputResult(downloadId)
            appProperties.adrOutputComparisonSchema -> apiClient.downloadOutputResult(downloadId)
            else -> throw IllegalArgumentException("$resourceType is not an output resource type")
        }

        // 2. Return error if artefact can't be retrieved
        return if (!artefact.statusCode.is2xxSuccessful)
        {
            val baos = ByteArrayOutputStream()
            artefact.body?.writeTo(baos)
            ErrorDetail(artefact.statusCode, baos.toString()).toResponseEntity()
        }
        else
        {
            // 3. Stream artefact to file
            val tmpDir = Files.createTempDirectory("adr").toFile()
            val file = File(tmpDir, resourceFileName)
            FileOutputStream(file).use { fis ->
                artefact.body!!.writeTo(fis)
            }

            // 4. Checksum file and upload with metadata to ADR
            postFileToADR(file, datasetId, resourceType, resourceName, resourceId, description, tmpDir)
        }
    }

    private fun pushInputFileToADR(datasetId: String,
                                   resourceType: String,
                                   resourceId: String?,
                                   resourceName: String): ResponseEntity<String>
    {
        if (resourceId == null)
        {
            return ErrorDetail(HttpStatus.BAD_REQUEST, "resourceId must be provided for input resourceType")
                    .toResponseEntity()
        }

        // Map adr schema to version file type
        val fileType = when (resourceType)
        {
            appProperties.adrPJNZSchema -> FileType.PJNZ
            appProperties.adrShapeSchema -> FileType.Shape
            appProperties.adrPopSchema -> FileType.Population
            appProperties.adrSurveySchema -> FileType.Survey
            appProperties.adrARTSchema -> FileType.Programme
            appProperties.adrANCSchema -> FileType.ANC
            appProperties.adrVmmcSchema -> FileType.Vmmc
            else -> throw IllegalArgumentException("$resourceType is not an input resource type")
        }

        //Find input file on disk and copy to tmp dir with original file name
        val versionFile = fileManager.getFile(fileType)
        return if (versionFile == null)
        {
            ErrorDetail(HttpStatus.BAD_REQUEST, "File does not exist").toResponseEntity()
        }
        else
        {
            val tmpDir = Files.createTempDirectory("adr").toFile()
            val file = File(tmpDir, versionFile.filename)
            File(versionFile.path).copyTo(file)

            postFileToADR(file, datasetId, resourceType, resourceName, resourceId, null, tmpDir)
        }
    }

    private fun postFileToADR(file: File,
                              datasetId: String,
                              resourceType: String,
                              resourceName: String,
                              resourceId: String?,
                              description: String?,
                              tmpDir: File): ResponseEntity<String>
    {
        val filePart = Pair("upload", file)
        val fileHash = file.md5sum()

        val commonParameters =
                mutableListOf("name" to resourceName, "hash" to fileHash,"resource_type" to resourceType)
        if (description != null)
        {
            commonParameters.add("description" to description)
        }

        val adr = adrService.build()
        return try
        {
            when (resourceId)
            {
                null -> adr.postFile("resource_create", commonParameters + listOf("restricted" to
                        "{\"allowed_organizations\":\"unaids\",\"allowed_users\":\"\",\"level\":\"restricted\"}",
                        "package_id" to datasetId), filePart)
                else ->
                {
                    if (uploadFileHasChanges(resourceId, fileHash))
                    {
                        adr.postFile("resource_patch", commonParameters + listOf("id" to resourceId), filePart)
                    }
                    else
                    {
                        EmptySuccessResponse.asResponseEntity()
                    }
                }
            }
        }
        catch (e: IOException)
        {
            ErrorDetail(HttpStatus.INTERNAL_SERVER_ERROR, e.message!!).toResponseEntity()
        }
        finally
        {
            tmpDir.deleteRecursively()
        }
    }

    fun uploadFileHasChanges(resourceId: String, newDatasetHash: String): Boolean
    {
        val adr = adrService.build()
        val response = adr.get("resource_show?id=${resourceId}")
        if (response.statusCode.isError)
        {
            throw IOException("Unable to retrieve hash from ADR")
        }
        val hash = objectMapper.readTree(response.body!!)["data"]["hash"].asText()
        return hash != newDatasetHash
    }
}
