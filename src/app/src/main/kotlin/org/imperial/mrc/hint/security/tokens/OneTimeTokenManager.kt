package org.imperial.mrc.hint.security.tokens

import org.imperial.mrc.hint.AppProperties
import org.imperial.mrc.hint.db.TokenRepository
import org.pac4j.core.profile.CommonProfile
import org.pac4j.core.profile.UserProfile
import org.pac4j.jwt.config.signature.SignatureConfiguration
import org.pac4j.jwt.credentials.authenticator.JwtAuthenticator
import org.pac4j.jwt.profile.JwtGenerator
import org.springframework.stereotype.Component
import java.security.SecureRandom
import java.time.Duration
import java.time.Instant
import java.util.*

@Component
class OneTimeTokenManager(
        appProperties: AppProperties,
        private val tokenRepository: TokenRepository,
        signatureConfiguration: SignatureConfiguration,
        private val authenticator: JwtAuthenticator
)
{
    private val generator = JwtGenerator(signatureConfiguration)
    private val issuer = appProperties.tokenIssuer
    private val random = SecureRandom()

    companion object
    {
        private const val NONCE_LENGTH = 32
    }

    fun generateOnetimeSetPasswordToken(username: String): String
    {
        val token = generator.generate(mapOf(
                "iss" to issuer,
                "sub" to username,
                "exp" to Date.from(Instant.now().plus(Duration.ofDays(1))),
                "nonce" to getNonce()
        ))

        tokenRepository.storeOneTimeToken(token)

        return token
    }

    fun validateToken(token: String): UserProfile?
    {
        return authenticator.validateToken(token)
    }

    fun validateTokenAndGetClaims(token: String): Map<String, Any>
    {
        return authenticator.validateTokenAndGetClaims(token)
    }

    private fun getNonce(): String
    {
        val bytes = ByteArray(NONCE_LENGTH)
        random.nextBytes(bytes)
        return Base64.getEncoder().encodeToString(bytes)
    }
}
