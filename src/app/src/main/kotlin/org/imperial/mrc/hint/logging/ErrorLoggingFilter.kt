package org.imperial.mrc.hint.logging

import org.springframework.http.HttpStatus
import org.springframework.stereotype.Component
import org.springframework.web.util.ContentCachingResponseWrapper
import java.nio.charset.Charset
import javax.servlet.Filter
import javax.servlet.FilterChain
import javax.servlet.ServletRequest
import javax.servlet.ServletResponse
import javax.servlet.http.HttpServletRequest
import javax.servlet.http.HttpServletResponse

@Component
class ErrorLoggingFilter(private val logger: GenericLogger)
    : Filter
{

    override fun doFilter(request: ServletRequest, response: ServletResponse, chain: FilterChain)
    {
        //ContentCachingResponseWrapper doesn't play nicely with streamed data, so don't use wrapper for a download.
        //We'll still be able to log any status errors
        request as HttpServletRequest
        response as HttpServletResponse

        val isDownload = request.servletPath.startsWith("/download")

        val responseWrapper = ContentCachingResponseWrapper(response)

        if (isDownload)
        {
            chain.doFilter(request, response)
        }
        else
        {
            chain.doFilter(request, responseWrapper)
        }

        if (HttpStatus.valueOf(response.status) >= HttpStatus.NOT_FOUND)
        {
            val message = "ERROR: ${response.status} response for ${request.method} ${request.servletPath}"
            logger.error(request, response, message)

            //log content
            if (!isDownload)
            {
                val bytes = responseWrapper.contentAsByteArray
                val content = String(bytes, Charset.forName(responseWrapper.characterEncoding))
                logger.error(request, response, content)
            }
        }

        if (!isDownload)
        {
            responseWrapper.copyBodyToResponse()
        }
    }
}
