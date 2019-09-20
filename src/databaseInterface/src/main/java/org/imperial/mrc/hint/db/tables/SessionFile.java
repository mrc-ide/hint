/*
 * This file is generated by jOOQ.
*/
package org.imperial.mrc.hint.db.tables;


import java.util.Arrays;
import java.util.List;

import javax.annotation.Generated;

import org.imperial.mrc.hint.db.Indexes;
import org.imperial.mrc.hint.db.Keys;
import org.imperial.mrc.hint.db.Public;
import org.imperial.mrc.hint.db.tables.records.SessionFileRecord;
import org.jooq.Field;
import org.jooq.ForeignKey;
import org.jooq.Index;
import org.jooq.Name;
import org.jooq.Schema;
import org.jooq.Table;
import org.jooq.TableField;
import org.jooq.UniqueKey;
import org.jooq.impl.DSL;
import org.jooq.impl.TableImpl;


/**
 * This class is generated by jOOQ.
 */
@Generated(
    value = {
        "http://www.jooq.org",
        "jOOQ version:3.10.5"
    },
    comments = "This class is generated by jOOQ"
)
@SuppressWarnings({ "all", "unchecked", "rawtypes" })
public class SessionFile extends TableImpl<SessionFileRecord> {

    private static final long serialVersionUID = -1805479186;

    /**
     * The reference instance of <code>public.session_file</code>
     */
    public static final SessionFile SESSION_FILE = new SessionFile();

    /**
     * The class holding records for this type
     */
    @Override
    public Class<SessionFileRecord> getRecordType() {
        return SessionFileRecord.class;
    }

    /**
     * The column <code>public.session_file.session</code>.
     */
    public final TableField<SessionFileRecord, String> SESSION = createField("session", org.jooq.impl.SQLDataType.CLOB.nullable(false), this, "");

    /**
     * The column <code>public.session_file.hash</code>.
     */
    public final TableField<SessionFileRecord, String> HASH = createField("hash", org.jooq.impl.SQLDataType.CLOB, this, "");

    /**
     * The column <code>public.session_file.type</code>.
     */
    public final TableField<SessionFileRecord, String> TYPE = createField("type", org.jooq.impl.SQLDataType.CLOB, this, "");

    /**
     * The column <code>public.session_file.filename</code>.
     */
    public final TableField<SessionFileRecord, String> FILENAME = createField("filename", org.jooq.impl.SQLDataType.CLOB, this, "");

    /**
     * Create a <code>public.session_file</code> table reference
     */
    public SessionFile() {
        this(DSL.name("session_file"), null);
    }

    /**
     * Create an aliased <code>public.session_file</code> table reference
     */
    public SessionFile(String alias) {
        this(DSL.name(alias), SESSION_FILE);
    }

    /**
     * Create an aliased <code>public.session_file</code> table reference
     */
    public SessionFile(Name alias) {
        this(alias, SESSION_FILE);
    }

    private SessionFile(Name alias, Table<SessionFileRecord> aliased) {
        this(alias, aliased, null);
    }

    private SessionFile(Name alias, Table<SessionFileRecord> aliased, Field<?>[] parameters) {
        super(alias, null, aliased, parameters, "");
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public Schema getSchema() {
        return Public.PUBLIC;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public List<Index> getIndexes() {
        return Arrays.<Index>asList(Indexes.SESSION_FILE_PKEY);
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public UniqueKey<SessionFileRecord> getPrimaryKey() {
        return Keys.SESSION_FILE_PKEY;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public List<UniqueKey<SessionFileRecord>> getKeys() {
        return Arrays.<UniqueKey<SessionFileRecord>>asList(Keys.SESSION_FILE_PKEY);
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public List<ForeignKey<SessionFileRecord, ?>> getReferences() {
        return Arrays.<ForeignKey<SessionFileRecord, ?>>asList(Keys.SESSION_FILE__SESSION_FILE_SESSION_FKEY, Keys.SESSION_FILE__SESSION_FILE_HASH_FKEY);
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public SessionFile as(String alias) {
        return new SessionFile(DSL.name(alias), this);
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public SessionFile as(Name alias) {
        return new SessionFile(alias, this);
    }

    /**
     * Rename this table
     */
    @Override
    public SessionFile rename(String name) {
        return new SessionFile(DSL.name(name), null);
    }

    /**
     * Rename this table
     */
    @Override
    public SessionFile rename(Name name) {
        return new SessionFile(name, null);
    }
}
