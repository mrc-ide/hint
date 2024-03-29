package org.imperial.mrc.hint.clients

import com.github.kittinunf.fuel.core.FileDataPart
import com.github.kittinunf.fuel.core.Parameters
import com.github.kittinunf.fuel.core.Request
import com.github.kittinunf.fuel.httpGet
import com.github.kittinunf.fuel.httpPost
import com.github.kittinunf.fuel.httpUpload
import org.imperial.mrc.hint.asResponseEntity
import org.springframework.http.ResponseEntity
import java.io.File
import java.io.InputStream
import java.net.URI
import java.net.http.HttpClient
import java.net.http.HttpClient.Builder
import java.net.http.HttpRequest
import java.net.http.HttpResponse

abstract class FuelClient(protected val baseUrl: String)
{

    companion object
    {
        private const val TIMEOUT = 120000
    }

    abstract fun standardHeaders(): Map<String, Any>

    abstract fun httpRequestHeaders(): Array<String>

    open fun get(url: String): ResponseEntity<String>
    {
        return "$baseUrl/$url".httpGet()
                .header(standardHeaders())
                .addTimeouts()
                .response()
                .second
                .asResponseEntity()
    }

    fun post(url: String, params: List<Pair<String, String>>): ResponseEntity<String>
    {
        return "$baseUrl/$url".httpPost(params)
                .addTimeouts()
                .header(standardHeaders())
                .response()
                .second
                .asResponseEntity()
    }

    protected open fun postJson(urlPath: String?, json: String): ResponseEntity<String>
    {
        val url = if (urlPath === null)
        {
            baseUrl
        }
        else
        {
            "$baseUrl/$urlPath"
        }

        return url.httpPost()
                .addTimeouts()
                .header(standardHeaders())
                .header("Content-Type" to "application/json")
                .body(json)
                .response()
                .second
                .asResponseEntity()
    }

    protected fun postEmpty(url: String): ResponseEntity<String>
    {
        return "$baseUrl/$url".httpPost()
                .addTimeouts()
                .header(standardHeaders())
                .response()
                .second
                .asResponseEntity()
    }

    protected fun Request.addTimeouts(): Request
    {
        return this.timeout(TIMEOUT)
                .timeoutRead(TIMEOUT)
    }

    open fun postFile(url: String, parameters: Parameters, file: Pair<String, File>): ResponseEntity<String>
    {
        return "$baseUrl/$url".httpUpload(parameters)
                .add(FileDataPart(file.second, file.first))
                .addTimeouts()
                .header(standardHeaders())
                .response()
                .second
                .asResponseEntity()
    }

    private fun getRequest(uri: URI): HttpRequest
    {
        return HttpRequest
            .newBuilder()
            .uri(uri)
            .headers(*httpRequestHeaders())
            .GET()
            .build()
    }

    private fun clientBuilder(): Builder
    {
        return HttpClient
            .newBuilder()
            .followRedirects(HttpClient.Redirect.ALWAYS)
    }

    protected fun getStream(uri: URI): HttpResponse<InputStream>
    {
        return this.clientBuilder()
            .build()
            .send(this.getRequest(uri), HttpResponse.BodyHandlers.ofInputStream())
    }
}
