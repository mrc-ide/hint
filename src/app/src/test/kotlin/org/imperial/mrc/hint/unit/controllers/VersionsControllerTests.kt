package org.imperial.mrc.hint.unit.controllers

import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.databind.node.ArrayNode
import org.imperial.mrc.hint.controllers.VersionsController
import org.imperial.mrc.hint.security.Session
import org.junit.jupiter.api.Test
import com.nhaarman.mockito_kotlin.doReturn
import com.nhaarman.mockito_kotlin.mock
import com.nhaarman.mockito_kotlin.verify
import org.assertj.core.api.Assertions.assertThat
import org.imperial.mrc.hint.db.SnapshotRepository
import org.imperial.mrc.hint.db.VersionRepository
import org.imperial.mrc.hint.models.Snapshot
import org.imperial.mrc.hint.models.Version
import org.pac4j.core.profile.CommonProfile
import org.springframework.http.HttpStatus

class VersionsControllerTests {
    private val mockProfile = mock<CommonProfile> {
        on { id } doReturn "testUser"
    }

    private val mockSession = mock<Session> {
        on { getUserProfile() } doReturn mockProfile
        on { generateNewSnapshotId() } doReturn "testSnapshot"
        on { userIsGuest() } doReturn false
    }

    private val parser = ObjectMapper()

    @Test
    fun `creates new version`()
    {

        val snapshot = Snapshot("testSnapshot", "createdTime", "updatedTime")
        val mockSnapshotRepo = mock<SnapshotRepository> {
            on { getSnapshot("testSnapshot") } doReturn snapshot
        }

        val mockVersionRepo = mock<VersionRepository> {
            on { saveNewVersion("testUser", "testVersion") } doReturn 99
        }

        val sut = VersionsController(mockSession, mockSnapshotRepo, mockVersionRepo)

        val result = sut.newVersion("testVersion")

        verify(mockSnapshotRepo).saveSnapshot("testSnapshot", 99)

        val resultJson = parser.readTree(result.body)["data"]

        assertThat(resultJson["id"].asInt()).isEqualTo(99)
        assertThat(resultJson["name"].asText()).isEqualTo("testVersion")
        val snapshots = resultJson["snapshots"] as ArrayNode
        assertThat(snapshots.count()).isEqualTo(1)
        assertThat(snapshots[0]["id"].asText()).isEqualTo("testSnapshot")
        assertThat(snapshots[0]["created"].asText()).isEqualTo("createdTime")
        assertThat(snapshots[0]["updated"].asText()).isEqualTo("updatedTime")
    }

    @Test
    fun `gets versions`()
    {
        val mockSnapshots = listOf(Snapshot("testSnapshot", "createdTime", "updatedTime"))
        val mockVersions = listOf(Version(99, "testVersion", mockSnapshots))
        val mockVersionRepo = mock<VersionRepository>{
            on { getVersions("testUser") } doReturn mockVersions
        }

        val sut = VersionsController(mockSession, mock(), mockVersionRepo)
        val result = sut.getVersions()

        val resultJson = parser.readTree(result.body)["data"]
        val versions = resultJson as ArrayNode
        assertThat(versions.count()).isEqualTo(1)
        assertThat(versions[0]["id"].asInt()).isEqualTo(99)
        assertThat(versions[0]["name"].asText()).isEqualTo("testVersion")
        val snapshots = versions[0]["snapshots"] as ArrayNode
        assertThat(snapshots.count()).isEqualTo(1)
        assertThat(snapshots[0]["id"].asText()).isEqualTo("testSnapshot")
        assertThat(snapshots[0]["created"].asText()).isEqualTo("createdTime")
        assertThat(snapshots[0]["updated"].asText()).isEqualTo("updatedTime")
    }

    @Test
    fun `gets empty versions list if user is guest`()
    {
        val guestSession = mock<Session> {
            on { userIsGuest() } doReturn true
        }
        val sut = VersionsController(guestSession, mock(), mock())
        val result = sut.getVersions()

        val resultJson = parser.readTree(result.body)["data"]
        val versions = resultJson as ArrayNode
        assertThat(versions.count()).isEqualTo(0)
    }

    @Test
    fun `can upload state`()
    {
        val mockRepo = mock<SnapshotRepository>();
        val sut = VersionsController(mockSession, mockRepo, mock())

        val result = sut.uploadState(99, "testSnapshot", "testState")

        verify(mockRepo).saveSnapshotState("testSnapshot", 99, "testUser", "testState")

        assertThat(result.statusCode).isEqualTo(HttpStatus.OK)
    }
}
