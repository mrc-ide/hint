/*
 * This file is generated by jOOQ.
*/
package org.imperial.mrc.hint.db;


import javax.annotation.Generated;

import org.imperial.mrc.hint.db.tables.OnetimeToken;
import org.imperial.mrc.hint.db.tables.Users;


/**
 * Convenience access to all tables in public
 */
@Generated(
    value = {
        "http://www.jooq.org",
        "jOOQ version:3.10.5"
    },
    comments = "This class is generated by jOOQ"
)
@SuppressWarnings({ "all", "unchecked", "rawtypes" })
public class Tables {

    /**
     * The table <code>public.onetime_token</code>.
     */
    public static final OnetimeToken ONETIME_TOKEN = org.imperial.mrc.hint.db.tables.OnetimeToken.ONETIME_TOKEN;

    /**
     * The table <code>public.users</code>.
     */
    public static final Users USERS = org.imperial.mrc.hint.db.tables.Users.USERS;
}
