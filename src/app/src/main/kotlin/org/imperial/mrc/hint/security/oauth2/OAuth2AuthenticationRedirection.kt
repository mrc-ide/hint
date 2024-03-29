package org.imperial.mrc.hint.security.oauth2

import org.imperial.mrc.hint.AppProperties
import org.imperial.mrc.hint.security.Session
import org.springframework.http.HttpHeaders
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.util.UriComponentsBuilder
import java.net.URI

open class OAuth2AuthenticationRedirection(
    protected val appProperties: AppProperties,
    protected val session: Session? = null,
)
{
    private fun urlComponent(): UriComponentsBuilder
    {
        return UriComponentsBuilder
            .fromHttpUrl("https://${appProperties.oauth2ClientUrl}")
            .path("/authorize")
            .queryParam("response_type", "code")
            .queryParam("client_id", appProperties.oauth2ClientId)
            .queryParam("state", session?.generateStateParameter())
            .queryParam("scope", appProperties.oauth2ClientScope)
            .queryParam("audience", appProperties.oauth2ClientAudience)
            .queryParam("redirect_uri", "${appProperties.applicationUrl}/callback/oauth2Client")
    }

    fun oauth2LoginRedirect(): ResponseEntity<String>
    {
        val url = urlComponent().build()
        val httpHeader = HttpHeaders()
        httpHeader.location = URI(url.toUriString())
        return ResponseEntity(httpHeader, HttpStatus.SEE_OTHER)
    }

    fun oauth2RegisterRedirect(): ResponseEntity<String>
    {
        val url = urlComponent()
            .queryParam("screen_hint", "signup")
            .build()

        val httpHeader = HttpHeaders()
        httpHeader.location = URI(url.toUriString())
        return ResponseEntity(httpHeader, HttpStatus.SEE_OTHER)
    }

    fun oauth2LogoutRedirect(): String
    {
        return UriComponentsBuilder
            .fromHttpUrl("https://${appProperties.oauth2ClientUrl}")
            .path("/v2/logout")
            .queryParam("client_id", appProperties.oauth2ClientId)
            .queryParam("returnTo", "${appProperties.applicationUrl}/login")
            .build().toString()
    }
}
