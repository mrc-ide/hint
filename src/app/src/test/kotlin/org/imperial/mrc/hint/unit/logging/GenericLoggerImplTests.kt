package org.imperial.mrc.hint.unit.logging

import com.nhaarman.mockito_kotlin.mock
import com.nhaarman.mockito_kotlin.verify
import net.logstash.logback.argument.StructuredArguments.kv
import org.imperial.mrc.hint.logging.*
import org.junit.jupiter.api.Test

class GenericLoggerImplTests
{
    private val testLogData = LogMetadata(
        "testUser",
        AppOrigin("hint", "backend"),
        Request(
            "POST",
            "/project",
            "hint",
            Client("Safari", "127.0.0.1", "session1")
        ),
        null,
        null,
        "Updating project note",
            listOf("project", "notes")
    )

    private val mockLogger = mock<org.slf4j.Logger>()

    @Test
    fun `can display info logging in key value format`()
    {
        val sut = GenericLoggerImpl(mockLogger)
        sut.info(testLogData, "TEST")
        verify(mockLogger).info("TEST",
                kv("naomi_username", testLogData.username),
                kv("naomi_app", testLogData.app),
                kv("naomi_request", testLogData.request),
                kv("naomi_response", testLogData.response),
                kv("naomi_error", testLogData.error),
                kv("naomi_action", testLogData.action),
                kv("naomi_tags", testLogData.tags))
    }
}
