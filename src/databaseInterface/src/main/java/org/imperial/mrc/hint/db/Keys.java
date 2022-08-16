/*
 * This file is generated by jOOQ.
 */
package org.imperial.mrc.hint.db;


import org.imperial.mrc.hint.db.tables.AdrKey;
import org.imperial.mrc.hint.db.tables.File;
import org.imperial.mrc.hint.db.tables.OnetimeToken;
import org.imperial.mrc.hint.db.tables.Project;
import org.imperial.mrc.hint.db.tables.ProjectVersion;
import org.imperial.mrc.hint.db.tables.SessionFile;
import org.imperial.mrc.hint.db.tables.UserSession;
import org.imperial.mrc.hint.db.tables.Users;
import org.imperial.mrc.hint.db.tables.VersionFile;
import org.imperial.mrc.hint.db.tables.records.AdrKeyRecord;
import org.imperial.mrc.hint.db.tables.records.FileRecord;
import org.imperial.mrc.hint.db.tables.records.OnetimeTokenRecord;
import org.imperial.mrc.hint.db.tables.records.ProjectRecord;
import org.imperial.mrc.hint.db.tables.records.ProjectVersionRecord;
import org.imperial.mrc.hint.db.tables.records.SessionFileRecord;
import org.imperial.mrc.hint.db.tables.records.UserSessionRecord;
import org.imperial.mrc.hint.db.tables.records.UsersRecord;
import org.imperial.mrc.hint.db.tables.records.VersionFileRecord;
import org.jooq.ForeignKey;
import org.jooq.TableField;
import org.jooq.UniqueKey;
import org.jooq.impl.DSL;
import org.jooq.impl.Internal;


/**
 * A class modelling foreign key relationships and constraints of tables in 
 * public.
 */
@SuppressWarnings({ "all", "unchecked", "rawtypes" })
public class Keys {

    // -------------------------------------------------------------------------
    // UNIQUE and PRIMARY KEY definitions
    // -------------------------------------------------------------------------

    public static final UniqueKey<AdrKeyRecord> ADR_KEY_PKEY = Internal.createUniqueKey(AdrKey.ADR_KEY, DSL.name("adr_key_pkey"), new TableField[] { AdrKey.ADR_KEY.API_KEY }, true);
    public static final UniqueKey<FileRecord> FILE_PKEY = Internal.createUniqueKey(File.FILE, DSL.name("file_pkey"), new TableField[] { File.FILE.HASH }, true);
    public static final UniqueKey<OnetimeTokenRecord> ONETIME_TOKEN_PKEY = Internal.createUniqueKey(OnetimeToken.ONETIME_TOKEN, DSL.name("onetime_token_pkey"), new TableField[] { OnetimeToken.ONETIME_TOKEN.TOKEN }, true);
    public static final UniqueKey<ProjectRecord> PROJECT_PKEY = Internal.createUniqueKey(Project.PROJECT, DSL.name("project_pkey"), new TableField[] { Project.PROJECT.ID }, true);
    public static final UniqueKey<ProjectVersionRecord> PROJECT_VERSION_PKEY = Internal.createUniqueKey(ProjectVersion.PROJECT_VERSION, DSL.name("project_version_pkey"), new TableField[] { ProjectVersion.PROJECT_VERSION.ID }, true);
    public static final UniqueKey<SessionFileRecord> SESSION_FILE_PKEY = Internal.createUniqueKey(SessionFile.SESSION_FILE, DSL.name("session_file_pkey"), new TableField[] { SessionFile.SESSION_FILE.SESSION, SessionFile.SESSION_FILE.HASH, SessionFile.SESSION_FILE.TYPE }, true);
    public static final UniqueKey<UserSessionRecord> USER_SESSION_PKEY = Internal.createUniqueKey(UserSession.USER_SESSION, DSL.name("user_session_pkey"), new TableField[] { UserSession.USER_SESSION.SESSION }, true);
    public static final UniqueKey<UsersRecord> USERS_PKEY = Internal.createUniqueKey(Users.USERS, DSL.name("users_pkey"), new TableField[] { Users.USERS.ID }, true);
    public static final UniqueKey<VersionFileRecord> VERSION_FILE_PKEY = Internal.createUniqueKey(VersionFile.VERSION_FILE, DSL.name("version_file_pkey"), new TableField[] { VersionFile.VERSION_FILE.VERSION, VersionFile.VERSION_FILE.HASH, VersionFile.VERSION_FILE.TYPE }, true);

    // -------------------------------------------------------------------------
    // FOREIGN KEY definitions
    // -------------------------------------------------------------------------

    public static final ForeignKey<AdrKeyRecord, UsersRecord> ADR_KEY__ADR_KEY_USER_ID_FKEY = Internal.createForeignKey(AdrKey.ADR_KEY, DSL.name("adr_key_user_id_fkey"), new TableField[] { AdrKey.ADR_KEY.USER_ID }, Keys.USERS_PKEY, new TableField[] { Users.USERS.ID }, true);
    public static final ForeignKey<ProjectRecord, UsersRecord> PROJECT__PROJECT_SHARED_BY_FKEY = Internal.createForeignKey(Project.PROJECT, DSL.name("project_shared_by_fkey"), new TableField[] { Project.PROJECT.SHARED_BY }, Keys.USERS_PKEY, new TableField[] { Users.USERS.ID }, true);
    public static final ForeignKey<ProjectRecord, UsersRecord> PROJECT__PROJECT_USER_ID_FKEY = Internal.createForeignKey(Project.PROJECT, DSL.name("project_user_id_fkey"), new TableField[] { Project.PROJECT.USER_ID }, Keys.USERS_PKEY, new TableField[] { Users.USERS.ID }, true);
    public static final ForeignKey<ProjectVersionRecord, ProjectRecord> PROJECT_VERSION__PROJECT_VERSION_PROJECT_ID_FKEY = Internal.createForeignKey(ProjectVersion.PROJECT_VERSION, DSL.name("project_version_project_id_fkey"), new TableField[] { ProjectVersion.PROJECT_VERSION.PROJECT_ID }, Keys.PROJECT_PKEY, new TableField[] { Project.PROJECT.ID }, true);
    public static final ForeignKey<SessionFileRecord, FileRecord> SESSION_FILE__SESSION_FILE_HASH_FKEY = Internal.createForeignKey(SessionFile.SESSION_FILE, DSL.name("session_file_hash_fkey"), new TableField[] { SessionFile.SESSION_FILE.HASH }, Keys.FILE_PKEY, new TableField[] { File.FILE.HASH }, true);
    public static final ForeignKey<SessionFileRecord, UserSessionRecord> SESSION_FILE__SESSION_FILE_SESSION_FKEY = Internal.createForeignKey(SessionFile.SESSION_FILE, DSL.name("session_file_session_fkey"), new TableField[] { SessionFile.SESSION_FILE.SESSION }, Keys.USER_SESSION_PKEY, new TableField[] { UserSession.USER_SESSION.SESSION }, true);
    public static final ForeignKey<UserSessionRecord, UsersRecord> USER_SESSION__USER_SESSION_USER_ID_FKEY = Internal.createForeignKey(UserSession.USER_SESSION, DSL.name("user_session_user_id_fkey"), new TableField[] { UserSession.USER_SESSION.USER_ID }, Keys.USERS_PKEY, new TableField[] { Users.USERS.ID }, true);
    public static final ForeignKey<VersionFileRecord, FileRecord> VERSION_FILE__VERSION_FILE_HASH_FKEY = Internal.createForeignKey(VersionFile.VERSION_FILE, DSL.name("version_file_hash_fkey"), new TableField[] { VersionFile.VERSION_FILE.HASH }, Keys.FILE_PKEY, new TableField[] { File.FILE.HASH }, true);
    public static final ForeignKey<VersionFileRecord, ProjectVersionRecord> VERSION_FILE__VERSION_FILE_VERSION_FKEY = Internal.createForeignKey(VersionFile.VERSION_FILE, DSL.name("version_file_version_fkey"), new TableField[] { VersionFile.VERSION_FILE.VERSION }, Keys.PROJECT_VERSION_PKEY, new TableField[] { ProjectVersion.PROJECT_VERSION.ID }, true);
}
