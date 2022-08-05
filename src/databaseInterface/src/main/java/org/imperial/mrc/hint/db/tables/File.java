/*
 * This file is generated by jOOQ.
 */
package org.imperial.mrc.hint.db.tables;


import java.util.Arrays;
import java.util.List;

import org.imperial.mrc.hint.db.Keys;
import org.imperial.mrc.hint.db.Public;
import org.imperial.mrc.hint.db.tables.records.FileRecord;
import org.jooq.Field;
import org.jooq.ForeignKey;
import org.jooq.Name;
import org.jooq.Record;
import org.jooq.Row1;
import org.jooq.Schema;
import org.jooq.Table;
import org.jooq.TableField;
import org.jooq.TableOptions;
import org.jooq.UniqueKey;
import org.jooq.impl.DSL;
import org.jooq.impl.SQLDataType;
import org.jooq.impl.TableImpl;


/**
 * This class is generated by jOOQ.
 */
@SuppressWarnings({ "all", "unchecked", "rawtypes" })
public class File extends TableImpl<FileRecord> {

    private static final long serialVersionUID = 1L;

    /**
     * The reference instance of <code>public.file</code>
     */
    public static final File FILE = new File();

    /**
     * The class holding records for this type
     */
    @Override
    public Class<FileRecord> getRecordType() {
        return FileRecord.class;
    }

    /**
     * The column <code>public.file.hash</code>.
     */
    public final TableField<FileRecord, String> HASH = createField(DSL.name("hash"), SQLDataType.CLOB.nullable(false), this, "");

    private File(Name alias, Table<FileRecord> aliased) {
        this(alias, aliased, null);
    }

    private File(Name alias, Table<FileRecord> aliased, Field<?>[] parameters) {
        super(alias, null, aliased, parameters, DSL.comment(""), TableOptions.table());
    }

    /**
     * Create an aliased <code>public.file</code> table reference
     */
    public File(String alias) {
        this(DSL.name(alias), FILE);
    }

    /**
     * Create an aliased <code>public.file</code> table reference
     */
    public File(Name alias) {
        this(alias, FILE);
    }

    /**
     * Create a <code>public.file</code> table reference
     */
    public File() {
        this(DSL.name("file"), null);
    }

    public <O extends Record> File(Table<O> child, ForeignKey<O, FileRecord> key) {
        super(child, key, FILE);
    }

    @Override
    public Schema getSchema() {
        return Public.PUBLIC;
    }

    @Override
    public UniqueKey<FileRecord> getPrimaryKey() {
        return Keys.FILE_PKEY;
    }

    @Override
    public List<UniqueKey<FileRecord>> getKeys() {
        return Arrays.<UniqueKey<FileRecord>>asList(Keys.FILE_PKEY);
    }

    @Override
    public File as(String alias) {
        return new File(DSL.name(alias), this);
    }

    @Override
    public File as(Name alias) {
        return new File(alias, this);
    }

    /**
     * Rename this table
     */
    @Override
    public File rename(String name) {
        return new File(DSL.name(name), null);
    }

    /**
     * Rename this table
     */
    @Override
    public File rename(Name name) {
        return new File(name, null);
    }

    // -------------------------------------------------------------------------
    // Row1 type methods
    // -------------------------------------------------------------------------

    @Override
    public Row1<String> fieldsRow() {
        return (Row1) super.fieldsRow();
    }
}
