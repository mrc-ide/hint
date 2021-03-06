package org.imperial.mrc.hint.models

import java.sql.Timestamp
import java.time.format.DateTimeFormatter.ISO_LOCAL_DATE_TIME

data class Project (val id: Int, val name: String, val versions: List<Version>, val sharedBy: String?="")

private val formatter = ISO_LOCAL_DATE_TIME

data class Version(val id: String, val created: String, val updated: String, val versionNumber: Int)
{
    constructor(id: String, created: Timestamp, updated: Timestamp, versionNumber: Int)
            : this(id,
            formatter.format(created.toLocalDateTime()),
            formatter.format(updated.toLocalDateTime()),
            versionNumber)
}
