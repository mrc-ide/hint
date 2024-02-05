package org.imperial.mrc.hint.controllers

import org.imperial.mrc.hint.FileManager
import org.imperial.mrc.hint.FileType
import org.imperial.mrc.hint.clients.HintrAPIClient
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import org.springframework.web.servlet.mvc.method.annotation.StreamingResponseBody

@RestController
@RequestMapping("/download")
class DownloadController(val apiClient: HintrAPIClient,
                         protected val fileManager: FileManager)
{
    @PostMapping("/submit/{type}/{id}")
    @ResponseBody
    fun getDownloadOutput(
            @PathVariable("type") type: String,
            @PathVariable("id") id: String,
            @RequestBody projectPayload: Map<String, Any?>? = null): ResponseEntity<String>
    {
        val payload = projectPayload?.toMutableMap() ?: mutableMapOf()
        if (type == "agyw") {
            val file = fileManager.getFile(FileType.PJNZ)
            payload["pjnz"] = file
        } else if (type == "spectrum") {
            val file = fileManager.getFile(FileType.Vmmc)
            if (file != null) {
                payload["vmmc"] = file
            }
        }
        return apiClient.downloadOutputSubmit(type, id, payload)
    }

    @GetMapping("/status/{id}")
    @ResponseBody
    fun getDownloadOutputStatus(@PathVariable("id") id: String): ResponseEntity<String>
    {
        return apiClient.downloadOutputStatus(id)
    }

    @GetMapping("/result/{id}")
    @ResponseBody
    fun getDownloadOutputResult(@PathVariable("id") id: String): ResponseEntity<StreamingResponseBody>
    {
        return apiClient.downloadOutputResult(id)
    }
}
