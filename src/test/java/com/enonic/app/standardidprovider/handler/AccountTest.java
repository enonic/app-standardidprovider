package com.enonic.app.standardidprovider.handler;

import org.junit.jupiter.api.Test;

import com.enonic.xp.testing.ScriptTestSupport;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

public class AccountTest
    extends ScriptTestSupport
{
    private static final String KEY = "user:enonic-cloud:auth0-650962adda4ba0b4a352a436";

    private static final String LOGIN = "auth0-650962adda4ba0b4a352a436";

    private static final String EMAIL = "jane@example.com";

    @Test
    public void account_is_named_by_its_display_name()
    {
        assertEquals( "Jane Doe", accountName( "Jane Doe" ) );
    }

    @Test
    public void account_without_display_name_is_named_by_its_email()
    {
        assertEquals( EMAIL, accountName( null, EMAIL ) );
        assertEquals( EMAIL, accountName( " ", EMAIL ) );
    }

    @Test
    public void account_without_display_name_and_email_is_named_by_its_login()
    {
        assertEquals( LOGIN, accountName( null ) );
        assertEquals( LOGIN, accountName( " " ) );
        assertEquals( LOGIN, accountName( null, "" ) );
    }

    @Test
    public void named_account_is_told_apart_by_its_email()
    {
        assertEquals( EMAIL, accountId( "Jane Doe", EMAIL ) );
    }

    @Test
    public void named_account_without_email_is_told_apart_by_its_login()
    {
        assertEquals( LOGIN, accountId( "Jane Doe", null ) );
        assertEquals( LOGIN, accountId( "Jane Doe", " " ) );
    }

    @Test
    public void account_without_display_name_needs_nothing_to_tell_it_apart()
    {
        assertNull( accountId( null, EMAIL ) );
        assertNull( accountId( "", null ) );
    }

    @Test
    public void display_name_that_is_the_email_is_not_repeated()
    {
        assertNull( accountId( EMAIL, EMAIL ) );
        assertNull( accountId( "Jane@Example.com", EMAIL ) );
        assertNull( accountId( " " + EMAIL + " ", EMAIL ) );
    }

    @Test
    public void display_name_that_is_the_login_is_not_repeated()
    {
        assertNull( accountId( LOGIN, null ) );
        assertNull( accountId( LOGIN.toUpperCase(), " " ) );
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
        return accountName( displayName, null );
    }

    private String accountName( final String displayName, final String email )
    {
        return runFunction( "/test/account-test.js", "accountName", KEY, LOGIN, displayName, email ).getValue( String.class );
    }

    private String accountId( final String displayName, final String email )
    {
        final var value = runFunction( "/test/account-test.js", "accountId", KEY, LOGIN, displayName, email );
        return value == null ? null : value.getValue( String.class );
    }

    private String signedInAs( final String displayName )
    {
        return runFunction( "/test/account-test.js", "signedInAs", KEY, LOGIN, displayName ).getValue( String.class );
    }
}
