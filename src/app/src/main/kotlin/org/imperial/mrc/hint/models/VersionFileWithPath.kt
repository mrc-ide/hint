package org.imperial.mrc.hint.models

data class VersionFile(val hash: String, val filename: String, val fromAdr: Boolean, val resource_url: String? = "")
{
    fun toVersionFileWithPath(pathDirectory: String): VersionFileWithPath
    {
        return VersionFileWithPath("$pathDirectory/$hash", hash, filename, fromAdr, resource_url)
    }
}

data class VersionFileWithPath(
    val path: String,
    val hash: String,
    val filename: String,
    val fromADR: Boolean,
    val resource_url: String? = ""
)
