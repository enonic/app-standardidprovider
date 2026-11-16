package com.enonic.app.standardidprovider.handler;

import org.junit.jupiter.api.Test;

import com.enonic.xp.testing.ScriptTestSupport;

import static org.junit.jupiter.api.Assertions.assertEquals;

public class AccountTest
    extends ScriptTestSupport
{
    private static final String KEY = "user:enonic-cloud:auth0-650962adda4ba0b4a352a436";

    private static final String LOGIN = "auth0-650962adda4ba0b4a352a436";

    @Test
    public void account_is_named_by_its_display_name()
    {
        assertEquals( "Jane Doe", accountName( "Jane Doe" ) );
    }

    @Test
    public void account_without_display_name_is_named_by_its_login()
    {
        assertEquals( LOGIN, accountName( null ) );
        assertEquals( LOGIN, accountName( " " ) );
    }

    @Test
    public void signed_in_account_shows_display_name_and_key()
    {
        assertEquals( "Jane Doe (" + KEY + ")", signedInAs( "Jane Doe" ) );
    }

    @Test
    public void signed_in_account_without_display_name_shows_key()
    {
        assertEquals( KEY, signedInAs( null ) );
        assertEquals( KEY, signedInAs( "" ) );
    }

    private String accountName( final String displayName )
    {
        return runFunction( "/test/account-test.js", "accountName", KEY, LOGIN, displayName ).getValue( String.class );
    }

    private String signedInAs( final String displayName )
    {
        return runFunction( "/test/account-test.js", "signedInAs", KEY, LOGIN, displayName ).getValue( String.class );
    }
}
