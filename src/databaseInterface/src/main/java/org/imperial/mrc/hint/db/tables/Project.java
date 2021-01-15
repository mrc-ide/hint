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
import org.imperial.mrc.hint.db.tables.records.ProjectRecord;
import org.jooq.Field;
import org.jooq.ForeignKey;
import org.jooq.Identity;
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
public class Project extends TableImpl<ProjectRecord> {

    private static final long serialVersionUID = 996241108;

    /**
     * The reference instance of <code>public.project</code>
     */
    public static final Project PROJECT = new Project();

    /**
     * The class holding records for this type
     */
    @Override
    public Class<ProjectRecord> getRecordType() {
        return ProjectRecord.class;
    }

    /**
     * The column <code>public.project.id</code>.
     */
    public final TableField<ProjectRecord, Integer> ID = createField("id", org.jooq.impl.SQLDataType.INTEGER.nullable(false).defaultValue(org.jooq.impl.DSL.field("nextval('project_id_seq'::regclass)", org.jooq.impl.SQLDataType.INTEGER)), this, "");

    /**
     * The column <code>public.project.user_id</code>.
     */
    public final TableField<ProjectRecord, String> USER_ID = createField("user_id", org.jooq.impl.SQLDataType.CLOB, this, "");

    /**
     * The column <code>public.project.name</code>.
     */
    public final TableField<ProjectRecord, String> NAME = createField("name", org.jooq.impl.SQLDataType.CLOB.nullable(false), this, "");

    /**
     * The column <code>public.project.note</code>.
     */
    public final TableField<ProjectRecord, String> NOTE = createField("note", org.jooq.impl.SQLDataType.CLOB, this, "");

    /**
     * The column <code>public.project.shared_by</code>.
     */
    public final TableField<ProjectRecord, String> SHARED_BY = createField("shared_by", org.jooq.impl.SQLDataType.CLOB, this, "");

    /**
     * Create a <code>public.project</code> table reference
     */
    public Project() {
        this(DSL.name("project"), null);
    }

    /**
     * Create an aliased <code>public.project</code> table reference
     */
    public Project(String alias) {
        this(DSL.name(alias), PROJECT);
    }

    /**
     * Create an aliased <code>public.project</code> table reference
     */
    public Project(Name alias) {
        this(alias, PROJECT);
    }

    private Project(Name alias, Table<ProjectRecord> aliased) {
        this(alias, aliased, null);
    }

    private Project(Name alias, Table<ProjectRecord> aliased, Field<?>[] parameters) {
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
        return Arrays.<Index>asList(Indexes.PROJECT_PKEY);
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public Identity<ProjectRecord, Integer> getIdentity() {
        return Keys.IDENTITY_PROJECT;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public UniqueKey<ProjectRecord> getPrimaryKey() {
        return Keys.PROJECT_PKEY;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public List<UniqueKey<ProjectRecord>> getKeys() {
        return Arrays.<UniqueKey<ProjectRecord>>asList(Keys.PROJECT_PKEY);
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public List<ForeignKey<ProjectRecord, ?>> getReferences() {
        return Arrays.<ForeignKey<ProjectRecord, ?>>asList(Keys.PROJECT__PROJECT_USER_ID_FKEY, Keys.PROJECT__PROJECT_SHARED_BY_FKEY);
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public Project as(String alias) {
        return new Project(DSL.name(alias), this);
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public Project as(Name alias) {
        return new Project(alias, this);
    }

    /**
     * Rename this table
     */
    @Override
    public Project rename(String name) {
        return new Project(DSL.name(name), null);
    }

    /**
     * Rename this table
     */
    @Override
    public Project rename(Name name) {
        return new Project(name, null);
    }
}
