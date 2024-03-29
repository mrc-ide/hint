package org.imperial.mrc.hint.unit.security.oauth2

import com.nhaarman.mockito_kotlin.doReturn
import com.nhaarman.mockito_kotlin.mock
import org.imperial.mrc.hint.AppProperties
import org.imperial.mrc.hint.security.Session
import org.imperial.mrc.hint.security.oauth2.OAuth2AuthenticationRedirection
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test
import org.springframework.http.HttpHeaders
import org.springframework.http.HttpStatus
import java.net.URI

class OAuth2AuthenticationRedirectionTests
{
    private val clientId = "fakeId"
    private val appUrl = "https://naomi.com"
    private val clientUrl = "oAuth2tenant.com"
    private val audience = "naomi"
    private val scope = "openid+profile+email+access:adr"

    private val mockProperties = mock<AppProperties> {
        on { oauth2ClientUrl } doReturn clientUrl
        on { applicationUrl } doReturn appUrl
        on { oauth2ClientId } doReturn clientId
        on { oauth2ClientAudience } doReturn audience
        on { oauth2ClientScope } doReturn scope
    }

    @Test
    fun`can redirect login to auth2 login`()
    {
        val encodedState = "encodedStateCode"

        val mockSession = mock<Session>{
            on { generateStateParameter() } doReturn encodedState
        }

        val sut = OAuth2AuthenticationRedirection(mockProperties, mockSession)

        val result = sut.oauth2LoginRedirect()

        val httpHeader = HttpHeaders()

        httpHeader.location = URI(
            "https://$clientUrl/authorize?response_type=code&client_id=$clientId&" +
                    "state=$encodedState&" +
                    "scope=$scope&audience=$audience&" +
                    "redirect_uri=$appUrl/callback/oauth2Client"
        )

        assertEquals(result.statusCode, HttpStatus.SEE_OTHER)

        assertEquals(result.headers.location, httpHeader.location)
    }

    @Test
    fun`can redirect to oauth2 logout`()
    {
        val sut = OAuth2AuthenticationRedirection(mockProperties, null)

        val result = sut.oauth2LogoutRedirect()

        val logoutUrl = "https://$clientUrl/v2/logout?client_id=$clientId&returnTo=$appUrl/login"

        assertEquals(result, logoutUrl)
    }

    @Test
    fun`can redirect to auth2 signup page`()
    {
        val encodedState = "encodedStateCode"

        val mockSession = mock<Session>{
            on { generateStateParameter() } doReturn encodedState
        }

        val sut = OAuth2AuthenticationRedirection(mockProperties, mockSession)

        val result = sut.oauth2RegisterRedirect()

        val httpHeader = HttpHeaders()

        httpHeader.location = URI(
            "https://$clientUrl/authorize?response_type=code&client_id=$clientId&" +
                    "state=$encodedState&" +
                    "scope=$scope&audience=$audience&" +
                    "redirect_uri=$appUrl/callback/oauth2Client&screen_hint=signup"
        )

        assertEquals(result.statusCode, HttpStatus.SEE_OTHER)

        assertEquals(result.headers.location, httpHeader.location)
    }
}