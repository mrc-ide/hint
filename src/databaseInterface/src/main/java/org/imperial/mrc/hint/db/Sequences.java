/*
 * This file is generated by jOOQ.
 */
package org.imperial.mrc.hint.db;


import org.jooq.Sequence;
import org.jooq.impl.Internal;
import org.jooq.impl.SQLDataType;


/**
 * Convenience access to all sequences in public.
 */
@SuppressWarnings({ "all", "unchecked", "rawtypes" })
public class Sequences {

    /**
     * The sequence <code>public.project_id_seq</code>
     */
    public static final Sequence<Integer> PROJECT_ID_SEQ = Internal.createSequence("project_id_seq", Public.PUBLIC, SQLDataType.INTEGER.nullable(false), null, null, null, null, false, null);
}
