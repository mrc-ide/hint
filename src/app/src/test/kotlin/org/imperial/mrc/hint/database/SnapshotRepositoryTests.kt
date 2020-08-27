package org.imperial.mrc.hint.database

import org.assertj.core.api.AssertionsForClassTypes.assertThat
import org.assertj.core.api.AssertionsForClassTypes.assertThatThrownBy
import org.imperial.mrc.hint.FileType
import org.imperial.mrc.hint.db.SnapshotRepository
import org.imperial.mrc.hint.logic.UserLogic
import org.imperial.mrc.hint.db.Tables.VERSION_FILE
import org.imperial.mrc.hint.db.Tables.PROJECT_VERSION
import org.imperial.mrc.hint.db.VersionRepository
import org.imperial.mrc.hint.exceptions.SnapshotException
import org.imperial.mrc.hint.helpers.TranslationAssert
import org.imperial.mrc.hint.models.SnapshotFile
import org.jooq.DSLContext
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.test.context.ActiveProfiles
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDateTime
import java.time.ZoneOffset
import java.time.format.DateTimeFormatter.ISO_LOCAL_DATE_TIME

@ActiveProfiles(profiles = ["test"])
@SpringBootTest
@Transactional
class SnapshotRepositoryTests {

    @Autowired
    private lateinit var sut: SnapshotRepository

    @Autowired
    private lateinit var versionRepo: VersionRepository

    @Autowired
    private lateinit var userRepo: UserLogic

    @Autowired
    private lateinit var dsl: DSLContext

    private val snapshotId = "sid"
    private val testEmail = "test.user@test.com"

    @Test
    fun `can save snapshot without version id`() {
        sut.saveSnapshot(snapshotId, null)

        val snapshot = dsl.selectFrom(PROJECT_VERSION)
                .fetchOne()
        assertThat(snapshot[PROJECT_VERSION.ID]).isEqualTo(snapshotId)

        val versionId: Int? = snapshot[PROJECT_VERSION.PROJECT_ID]
        assertThat(versionId).isEqualTo(null)
    }

    @Test
    fun `can save snapshot with version id`()
    {
        val uid = setupUser()
        val versionId = setupVersion(uid)
        sut.saveSnapshot(snapshotId, versionId)

        val snapshot = dsl.selectFrom(PROJECT_VERSION)
                .fetchOne()

        assertThat(snapshot[PROJECT_VERSION.ID]).isEqualTo(snapshotId)
        assertThat(snapshot[PROJECT_VERSION.PROJECT_ID]).isEqualTo(versionId)
    }

    @Test
    fun `saveSnapshot is idempotent`() {

        sut.saveSnapshot(snapshotId, null)
        sut.saveSnapshot(snapshotId, null)
        val snapshot = dsl.selectFrom(PROJECT_VERSION)
                .fetchOne()

        assertThat(snapshot[PROJECT_VERSION.ID]).isEqualTo(snapshotId)
    }

    @Test
    fun `can save snapshot state`() {
        val uid = setupUser()
        val versionId = setupVersion(uid)
        sut.saveSnapshot(snapshotId, versionId)

        val anotherId = "another snapshot id"
        sut.saveSnapshot(anotherId, versionId)

        val testState = "{\"state\": \"testState\"}";
        sut.saveSnapshotState(snapshotId, versionId, uid, testState)

        val savedSnapshot = dsl.select(PROJECT_VERSION.STATE)
                .from(PROJECT_VERSION)
                .where(PROJECT_VERSION.ID.eq(snapshotId))
                .fetchOne()
        assertThat(savedSnapshot[PROJECT_VERSION.STATE]).isEqualTo(testState)

        val anotherSnapshot = dsl.select(PROJECT_VERSION.STATE)
                .from(PROJECT_VERSION)
                .where(PROJECT_VERSION.ID.eq(anotherId))
                .fetchOne()
        assertThat(anotherSnapshot[PROJECT_VERSION.STATE]).isEqualTo(null)
    }

    @Test
    fun `save snapshot state throws error if snapshot does not exist`()
    {
        val uid = setupUser()
        val versionId = setupVersion(uid)
        assertThatThrownBy{ sut.saveSnapshotState("nonexistentSnapshot", versionId, uid, "testState") }
                .isInstanceOf(SnapshotException::class.java)
                .hasMessageContaining("snapshotDoesNotExist")
    }

    @Test
    fun `save snapshot state throws error if snapshot belongs to another version`()
    {
        val uid = setupUser()
        val versionId = setupVersion(uid)
        assertThatThrownBy{ sut.saveSnapshotState(snapshotId, versionId+1, uid, "testState") }
                .isInstanceOf(SnapshotException::class.java)
                .hasMessageContaining("snapshotDoesNotExist")
    }

    @Test
    fun `save snapshot state throws error if snapshot belongs to another user`()
    {
        val uid = setupUser()
        val versionId = setupVersion(uid)
        assertThatThrownBy{ sut.saveSnapshotState(snapshotId, versionId, "not$uid", "testState") }
                .isInstanceOf(SnapshotException::class.java)
                .hasMessageContaining("snapshotDoesNotExist")
    }

    @Test
    fun `can copy snapshot`() {
        val now = LocalDateTime.now(ZoneOffset.UTC)
        val soon = now.plusSeconds(5)

        val uid = setupUser()
        val versionId = setupVersion(uid)
        sut.saveSnapshot(snapshotId, versionId)
        setUpHashAndSnapshotFile("pjnz_hash", "pjnz_file", snapshotId, "pjnz", false)
        setUpHashAndSnapshotFile("survey_hash", "survey_file", snapshotId, "survey", false)
        sut.saveSnapshotState(snapshotId, versionId, uid, "TEST STATE")

        sut.copySnapshot(snapshotId, "newSnapshotId", versionId, uid)

        val newSnapshot = sut.getSnapshot("newSnapshotId")
        assertThat(newSnapshot.id).isEqualTo("newSnapshotId")
        val created = LocalDateTime.parse(newSnapshot.created, ISO_LOCAL_DATE_TIME)
        assertThat(created).isBetween(now, soon)

        val updated = LocalDateTime.parse(newSnapshot.updated, ISO_LOCAL_DATE_TIME)
        assertThat(updated).isBetween(now, soon)

        val newSnapshotRecord = dsl.select(PROJECT_VERSION.STATE, PROJECT_VERSION.PROJECT_ID)
                .from(PROJECT_VERSION)
                .where(PROJECT_VERSION.ID.eq("newSnapshotId"))
                .fetchOne()

        assertThat(newSnapshotRecord[PROJECT_VERSION.STATE]).isEqualTo("TEST STATE")
        assertThat(newSnapshotRecord[PROJECT_VERSION.PROJECT_ID]).isEqualTo(versionId)

        val files = sut.getSnapshotFiles("newSnapshotId")
        assertThat(files.keys.count()).isEqualTo(2)
        assertThat(files["pjnz"]!!.hash).isEqualTo("pjnz_hash")
        assertThat(files["pjnz"]!!.filename).isEqualTo("pjnz_file")
        assertThat(files["survey"]!!.hash).isEqualTo("survey_hash")
        assertThat(files["survey"]!!.filename).isEqualTo("survey_file")
    }

    @Test
    fun `copy snapshot throws error if snapshot does not exist`()
    {
        val uid = setupUser()
        val versionId = setupVersion(uid)
        assertThatThrownBy{ sut.copySnapshot("nonexistentSnapshot", "newSnapshot", versionId, uid) }
                .isInstanceOf(SnapshotException::class.java)
                .hasMessageContaining("snapshotDoesNotExist")
    }

    @Test
    fun `copy snapshot throws error if snapshot belongs to another version`()
    {
        val uid = setupUser()
        val versionId = setupVersion(uid)
        assertThatThrownBy{ sut.copySnapshot(snapshotId, "newSnapshot", versionId+1, uid) }
                .isInstanceOf(SnapshotException::class.java)
                .hasMessageContaining("snapshotDoesNotExist")
    }

    @Test
    fun `copy snapshot throws error if snapshot belongs to another user`()
    {
        val uid = setupUser()
        val versionId = setupVersion(uid)
        assertThatThrownBy{ sut.copySnapshot(snapshotId, "newSnapshot", versionId, "not$uid") }
                .isInstanceOf(SnapshotException::class.java)
                .hasMessageContaining("snapshotDoesNotExist")
    }

    @Test
    fun `can get snapshot`()
    {
        val now = LocalDateTime.now(ZoneOffset.UTC)
        val soon = now.plusSeconds(5)
        setUpSnapshot()
        val snapshot = sut.getSnapshot(snapshotId)

        assertThat(snapshot.id).isEqualTo(snapshotId)

        val created = LocalDateTime.parse(snapshot.created, ISO_LOCAL_DATE_TIME)
        assertThat(created).isBetween(now, soon)

        val updated = LocalDateTime.parse(snapshot.updated, ISO_LOCAL_DATE_TIME)
        assertThat(updated).isBetween(now, soon)
    }

    @Test
    fun `saveNewHash returns true if a new hash is saved`() {
        val result = sut.saveNewHash("newhash")
        assertThat(result).isTrue()
    }

    @Test
    fun `saveNewHash returns false if the hash already exists`() {
        sut.saveNewHash("newhash")
        val result = sut.saveNewHash("newhash")
        assertThat(result).isFalse()
    }

    @Test
    fun `saves new snapshot file`() {
        setUpSnapshotAndHash()
        sut.saveSnapshotFile(snapshotId, FileType.PJNZ, "newhash", "original.pjnz")

        val record = dsl.selectFrom(VERSION_FILE)
                .fetchOne()

        assertThat(record[VERSION_FILE.FILENAME]).isEqualTo("original.pjnz")
        assertThat(record[VERSION_FILE.HASH]).isEqualTo("newhash")
        assertThat(record[VERSION_FILE.VERSION]).isEqualTo(snapshotId)
        assertThat(record[VERSION_FILE.TYPE]).isEqualTo("pjnz")
    }

    @Test
    fun `correct snapshot file is removed`() {
        setUpSnapshotAndHash()
        val hash = "newhash"
        sut.saveSnapshotFile(snapshotId, FileType.PJNZ, hash, "original.pjnz")
        assertSnapshotFileExists(hash)

        // different file type
        sut.removeSnapshotFile(snapshotId, FileType.Survey)
        assertSnapshotFileExists(hash)

        // different snapshot
        sut.removeSnapshotFile("wrongid", FileType.PJNZ)
        assertSnapshotFileExists(hash)

        // correct details
        sut.removeSnapshotFile(snapshotId, FileType.PJNZ)
        val records = dsl.selectFrom(VERSION_FILE)
                .where(VERSION_FILE.HASH.eq(hash))

        assertThat(records.count()).isEqualTo(0)
    }

    @Test
    fun `updates snapshot file if an entry for the given type already exists`() {
        setUpSnapshotAndHash()
        sut.saveSnapshotFile(snapshotId, FileType.PJNZ, "newhash", "original.pjnz")

        sut.saveNewHash("anotherhash")
        sut.saveSnapshotFile(snapshotId, FileType.PJNZ, "anotherhash", "anotherfilename.pjnz")

        val records = dsl.selectFrom(VERSION_FILE)
                .fetch()

        assertThat(records.count()).isEqualTo(1)
        assertThat(records[0][VERSION_FILE.FILENAME]).isEqualTo("anotherfilename.pjnz")
        assertThat(records[0][VERSION_FILE.HASH]).isEqualTo("anotherhash")
        assertThat(records[0][VERSION_FILE.VERSION]).isEqualTo(snapshotId)
        assertThat(records[0][VERSION_FILE.TYPE]).isEqualTo("pjnz")
    }

    @Test
    fun `can get snapshot file hash`() {
        setUpSnapshotAndHash()
        sut.saveSnapshotFile(snapshotId, FileType.PJNZ, "newhash", "original.pjnz")
        val result = sut.getSnapshotFile(snapshotId, FileType.PJNZ)!!
        assertThat(result.hash).isEqualTo("newhash")
        assertThat(result.filename).isEqualTo("original.pjnz")
    }

    @Test
    fun `can get all snapshot file hashes`() {
        setUpSnapshotAndHash()
        sut.saveNewHash("pjnzhash")
        sut.saveNewHash("surveyhash")
        sut.saveSnapshotFile(snapshotId, FileType.PJNZ, "pjnzhash", "original.pjnz")
        sut.saveSnapshotFile(snapshotId, FileType.Survey, "surveyhash", "original.csv")
        val result = sut.getHashesForSnapshot(snapshotId)
        assertThat(result["survey"]).isEqualTo("surveyhash")
        assertThat(result["pjnz"]).isEqualTo("pjnzhash")
    }

    @Test
    fun `can get all snapshot files`() {
        setUpSnapshotAndHash()
        sut.saveNewHash("pjnzhash")
        sut.saveNewHash("surveyhash")
        sut.saveSnapshotFile(snapshotId, FileType.PJNZ, "pjnzhash", "original.pjnz")
        sut.saveSnapshotFile(snapshotId, FileType.Survey, "surveyhash", "original.csv")
        val result = sut.getSnapshotFiles(snapshotId)
        assertThat(result["survey"]!!.filename).isEqualTo("original.csv")
        assertThat(result["survey"]!!.hash).isEqualTo("surveyhash")
        assertThat(result["pjnz"]!!.filename).isEqualTo("original.pjnz")
        assertThat(result["pjnz"]!!.hash).isEqualTo("pjnzhash")
    }

    @Test
    fun `can set files for snapshot`() {
        setUpSnapshot()
        sut.saveNewHash("pjnz_hash")
        sut.saveNewHash("shape_hash")

        sut.setFilesForSnapshot(snapshotId, mapOf(
                "pjnz" to SnapshotFile("pjnz_hash", "pjnz_file"),
                "shape" to SnapshotFile("shape_hash", "shape_file"),
                "population" to null //should not attempt to save a null file
        ));

        val records = dsl.selectFrom(VERSION_FILE)
                .orderBy(VERSION_FILE.TYPE)
                .fetch()

        assertThat(records.count()).isEqualTo(2);

        assertThat(records[0][VERSION_FILE.FILENAME]).isEqualTo("pjnz_file")
        assertThat(records[0][VERSION_FILE.HASH]).isEqualTo("pjnz_hash")
        assertThat(records[0][VERSION_FILE.VERSION]).isEqualTo(snapshotId)
        assertThat(records[0][VERSION_FILE.TYPE]).isEqualTo("pjnz")

        assertThat(records[1][VERSION_FILE.FILENAME]).isEqualTo("shape_file")
        assertThat(records[1][VERSION_FILE.HASH]).isEqualTo("shape_hash")
        assertThat(records[1][VERSION_FILE.VERSION]).isEqualTo(snapshotId)
        assertThat(records[1][VERSION_FILE.TYPE]).isEqualTo("shape")
    }

    @Test
    fun `setFilesForSnapshot deletes existing files for this snapshot only`() {
        sut.saveSnapshot("sid2", null);

        sut.saveNewHash("shape_hash")
        setUpHashAndSnapshotFile("old_pjnz_hash", "old_pjnz", snapshotId, "pjnz")
        setUpHashAndSnapshotFile("other_shape_hash", "other_shape_file", "sid2", "shape")

        sut.setFilesForSnapshot(snapshotId, mapOf(
                "shape" to SnapshotFile("shape_hash", "shape_file")))

        val records = dsl.selectFrom(VERSION_FILE)
                .orderBy(VERSION_FILE.VERSION)
                .fetch()

        assertThat(records.count()).isEqualTo(2)

        assertThat(records[0][VERSION_FILE.FILENAME]).isEqualTo("shape_file")
        assertThat(records[0][VERSION_FILE.HASH]).isEqualTo("shape_hash")
        assertThat(records[0][VERSION_FILE.VERSION]).isEqualTo(snapshotId)
        assertThat(records[0][VERSION_FILE.TYPE]).isEqualTo("shape")

        assertThat(records[1][VERSION_FILE.FILENAME]).isEqualTo("other_shape_file")
        assertThat(records[1][VERSION_FILE.HASH]).isEqualTo("other_shape_hash")
        assertThat(records[1][VERSION_FILE.VERSION]).isEqualTo("sid2")
        assertThat(records[1][VERSION_FILE.TYPE]).isEqualTo("shape")
    }

    @Test
    fun `setFilesForSession rolls back transaction on error, leaving existing session files unchanged`() {
        setUpSnapshot()
        setUpHashAndSnapshotFile("pjnz_hash", "pjnz_file", snapshotId, "pjnz")

        TranslationAssert.assertThatThrownBy {
            sut.setFilesForSnapshot(snapshotId, mapOf(
                    "shape" to SnapshotFile("bad_hash", "bad_file")))
        }
                .isInstanceOf(SnapshotException::class.java)
                .hasTranslatedMessage("Unable to load files for session. Specified files do not exist on the server.")

        val records = dsl.selectFrom(VERSION_FILE)
                .orderBy(VERSION_FILE.VERSION)
                .fetch();

        assertThat(records.count()).isEqualTo(1);

        assertThat(records[0][VERSION_FILE.FILENAME]).isEqualTo("pjnz_file")
        assertThat(records[0][VERSION_FILE.HASH]).isEqualTo("pjnz_hash")
        assertThat(records[0][VERSION_FILE.VERSION]).isEqualTo(snapshotId)
        assertThat(records[0][VERSION_FILE.TYPE]).isEqualTo("pjnz")

    }

    @Test
    fun `can get snapshot details`() {
        val now = LocalDateTime.now(ZoneOffset.UTC)
        val soon = now.plusSeconds(5)

        val uid = setupUser()
        val versionId = setupVersion(uid)
        sut.saveSnapshot(snapshotId, versionId)
        setUpHashAndSnapshotFile("pjnz_hash", "pjnz_file", snapshotId, "pjnz", false)
        setUpHashAndSnapshotFile("survey_hash", "survey_file", snapshotId, "survey", false)
        sut.saveSnapshotState(snapshotId, versionId, uid, "TEST STATE")

        val result = sut.getSnapshotDetails(snapshotId, versionId, uid)
        assertThat(result.state).isEqualTo("TEST STATE")

        val files = result.files
        assertThat(files.keys.count()).isEqualTo(2)
        assertThat(files["pjnz"]!!.hash).isEqualTo("pjnz_hash")
        assertThat(files["pjnz"]!!.filename).isEqualTo("pjnz_file")
        assertThat(files["survey"]!!.hash).isEqualTo("survey_hash")
        assertThat(files["survey"]!!.filename).isEqualTo("survey_file")
    }

    @Test
    fun `get snapshot details throws error if snapshot does not exist`()
    {
        val uid = setupUser()
        val versionId = setupVersion(uid)
        assertThatThrownBy{ sut.getSnapshotDetails("nonexistentSnapshot", versionId, uid) }
                .isInstanceOf(SnapshotException::class.java)
                .hasMessageContaining("snapshotDoesNotExist")
    }

    private fun assertSnapshotFileExists(hash: String) {
        val records = dsl.selectFrom(VERSION_FILE)
                .where(VERSION_FILE.HASH.eq(hash))

        assertThat(records.count()).isEqualTo(1)
    }

    private fun setupUser(): String
    {
        userRepo.addUser(testEmail, "pw")
        return userRepo.getUser(testEmail)!!.id
    }

    private fun setupVersion(userId: String): Int
    {
       return versionRepo.saveNewVersion(userId, "testVersion")
    }

    private fun setUpSnapshotAndHash() {
        sut.saveNewHash("newhash")
        setUpSnapshot()
    }

    private fun setUpSnapshot() {
        sut.saveSnapshot(snapshotId,null)
    }

    private fun setUpHashAndSnapshotFile(hash: String, filename: String, snapshotId: String, type: String, setUpSnapshot: Boolean = true) {
        sut.saveNewHash(hash)
        if (setUpSnapshot) {
            setUpSnapshot()
        }
        dsl.insertInto(VERSION_FILE)
                .set(VERSION_FILE.FILENAME, filename)

                .set(VERSION_FILE.HASH, hash)
                .set(VERSION_FILE.VERSION, snapshotId)
                .set(VERSION_FILE.TYPE, type)
                .execute()
    }

}
