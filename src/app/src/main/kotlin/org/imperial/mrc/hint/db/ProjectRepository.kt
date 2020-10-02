package org.imperial.mrc.hint.db

import org.imperial.mrc.hint.db.Tables.PROJECT
import org.imperial.mrc.hint.db.Tables.PROJECT_VERSION
import org.imperial.mrc.hint.exceptions.ProjectException
import org.imperial.mrc.hint.models.Project
import org.imperial.mrc.hint.models.Version
import org.jooq.DSLContext
import org.jooq.Record
import org.springframework.stereotype.Component

interface ProjectRepository {
    fun saveNewProject(userId: String, projectName: String): Int
    fun getProjects(userId: String): List<Project>
    fun deleteProject(projectId: Int, userId: String)
    fun getProject(projectId: Int, userId: String): Project
}

@Component
class JooqProjectRepository(private val dsl: DSLContext) : ProjectRepository {

    override fun getProject(projectId: Int, userId: String): Project {
        val projectRecord = dsl.select(
                PROJECT.ID,
                PROJECT.NAME,
                PROJECT_VERSION.ID,
                PROJECT_VERSION.CREATED,
                PROJECT_VERSION.UPDATED,
                PROJECT_VERSION.VERSION_NUMBER)
                .from(PROJECT)
                .join(PROJECT_VERSION)
                .on(PROJECT.ID.eq(PROJECT_VERSION.PROJECT_ID))
                .where(PROJECT.ID.eq(projectId)
                        .and(PROJECT.USER_ID.eq(userId))
                ).fetch()

        if (!projectRecord.any()) {
            throw ProjectException("projectDoesNotExist")
        }

        return mapProject(projectRecord)
    }

    override fun saveNewProject(userId: String, projectName: String): Int {
        val result = dsl.insertInto(PROJECT, PROJECT.USER_ID, PROJECT.NAME)
                .values(userId, projectName)
                .returning(PROJECT.ID)
                .fetchOne()

        return result[PROJECT.ID]
    }

    override fun getProjects(userId: String): List<Project> {
        val result =
                dsl.select(
                        PROJECT.ID,
                        PROJECT.NAME,
                        PROJECT_VERSION.ID,
                        PROJECT_VERSION.CREATED,
                        PROJECT_VERSION.UPDATED,
                        PROJECT_VERSION.VERSION_NUMBER)
                        .from(PROJECT)
                        .join(PROJECT_VERSION)
                        .on(PROJECT.ID.eq(PROJECT_VERSION.PROJECT_ID))
                        .where(PROJECT.USER_ID.eq(userId))
                        .and(PROJECT_VERSION.DELETED.eq(false))
                        .orderBy(PROJECT_VERSION.UPDATED.desc())
                        .fetch()

        return result.groupBy { it[PROJECT.ID] }
                .values
                .map(::mapProject)
                .sortedByDescending { it.versions[0].updated }
    }

    override fun deleteProject(projectId: Int, userId: String) {
        checkProjectExists(projectId, userId)
        dsl.update(PROJECT_VERSION)
                .set(PROJECT_VERSION.DELETED, true)
                .where(PROJECT_VERSION.PROJECT_ID.eq(projectId))
                .execute()
    }

    private fun checkProjectExists(projectId: Int, userId: String) {
        dsl.select(PROJECT.ID)
                .from(PROJECT)
                .where(PROJECT.ID.eq(projectId))
                .and(PROJECT.USER_ID.eq(userId))
                .fetchAny() ?: throw ProjectException("projectDoesNotExist")
    }

    private fun mapProject(versions: List<Record>): Project {
        return Project(versions[0][PROJECT.ID], versions[0][PROJECT.NAME], mapVersion(versions))
    }

    private fun mapVersion(records: List<Record>): List<Version> {
        return records.map { v ->
            Version(v[PROJECT_VERSION.ID], v[PROJECT_VERSION.CREATED],
                    v[PROJECT_VERSION.UPDATED], v[PROJECT_VERSION.VERSION_NUMBER])
        }
    }

}
