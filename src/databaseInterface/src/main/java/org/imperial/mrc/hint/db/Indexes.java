/*
 * This file is generated by jOOQ.
*/
package org.imperial.mrc.hint.db;


import javax.annotation.Generated;

import org.imperial.mrc.hint.db.tables.AdrKey;
import org.imperial.mrc.hint.db.tables.File;
import org.imperial.mrc.hint.db.tables.OnetimeToken;
import org.imperial.mrc.hint.db.tables.Project;
import org.imperial.mrc.hint.db.tables.ProjectVersion;
import org.imperial.mrc.hint.db.tables.SessionFile;
import org.imperial.mrc.hint.db.tables.UserSession;
import org.imperial.mrc.hint.db.tables.Users;
import org.imperial.mrc.hint.db.tables.VersionFile;
import org.jooq.Index;
import org.jooq.OrderField;
import org.jooq.impl.Internal;


/**
 * A class modelling indexes of tables of the <code>public</code> schema.
 */
@Generated(
    value = {
        "http://www.jooq.org",
        "jOOQ version:3.10.5"
    },
    comments = "This class is generated by jOOQ"
)
@SuppressWarnings({ "all", "unchecked", "rawtypes" })
public class Indexes {

    // -------------------------------------------------------------------------
    // INDEX definitions
    // -------------------------------------------------------------------------

    public static final Index ADR_KEY_PKEY = Indexes0.ADR_KEY_PKEY;
    public static final Index FILE_PKEY = Indexes0.FILE_PKEY;
    public static final Index ONETIME_TOKEN_PKEY = Indexes0.ONETIME_TOKEN_PKEY;
    public static final Index PROJECT_PKEY = Indexes0.PROJECT_PKEY;
    public static final Index PROJECT_VERSION_PKEY = Indexes0.PROJECT_VERSION_PKEY;
    public static final Index SESSION_FILE_PKEY = Indexes0.SESSION_FILE_PKEY;
    public static final Index USER_SESSION_PKEY = Indexes0.USER_SESSION_PKEY;
    public static final Index USERS_PKEY = Indexes0.USERS_PKEY;
    public static final Index VERSION_FILE_PKEY = Indexes0.VERSION_FILE_PKEY;

    // -------------------------------------------------------------------------
    // [#1459] distribute members to avoid static initialisers > 64kb
    // -------------------------------------------------------------------------

    private static class Indexes0 {
        public static Index ADR_KEY_PKEY = Internal.createIndex("adr_key_pkey", AdrKey.ADR_KEY, new OrderField[] { AdrKey.ADR_KEY.API_KEY }, true);
        public static Index FILE_PKEY = Internal.createIndex("file_pkey", File.FILE, new OrderField[] { File.FILE.HASH }, true);
        public static Index ONETIME_TOKEN_PKEY = Internal.createIndex("onetime_token_pkey", OnetimeToken.ONETIME_TOKEN, new OrderField[] { OnetimeToken.ONETIME_TOKEN.TOKEN }, true);
        public static Index PROJECT_PKEY = Internal.createIndex("project_pkey", Project.PROJECT, new OrderField[] { Project.PROJECT.ID }, true);
        public static Index PROJECT_VERSION_PKEY = Internal.createIndex("project_version_pkey", ProjectVersion.PROJECT_VERSION, new OrderField[] { ProjectVersion.PROJECT_VERSION.ID }, true);
        public static Index SESSION_FILE_PKEY = Internal.createIndex("session_file_pkey", SessionFile.SESSION_FILE, new OrderField[] { SessionFile.SESSION_FILE.SESSION, SessionFile.SESSION_FILE.HASH, SessionFile.SESSION_FILE.TYPE }, true);
        public static Index USER_SESSION_PKEY = Internal.createIndex("user_session_pkey", UserSession.USER_SESSION, new OrderField[] { UserSession.USER_SESSION.SESSION }, true);
        public static Index USERS_PKEY = Internal.createIndex("users_pkey", Users.USERS, new OrderField[] { Users.USERS.ID }, true);
        public static Index VERSION_FILE_PKEY = Internal.createIndex("version_file_pkey", VersionFile.VERSION_FILE, new OrderField[] { VersionFile.VERSION_FILE.VERSION, VersionFile.VERSION_FILE.HASH, VersionFile.VERSION_FILE.TYPE }, true);
    }
}
