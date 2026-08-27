package com.enonic.app.standardidprovider.handler;

import java.util.HashMap;
import java.util.Map;

import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.Mockito;

import com.enonic.xp.script.ScriptValue;
import com.enonic.xp.security.IdProvider;
import com.enonic.xp.security.IdProviderKey;
import com.enonic.xp.security.PrincipalKey;
import com.enonic.xp.security.SecurityService;
import com.enonic.xp.security.User;
import com.enonic.xp.security.auth.AuthenticationInfo;
import com.enonic.xp.security.auth.AuthenticationToken;
import com.enonic.xp.security.auth.EmailPasswordAuthToken;
import com.enonic.xp.security.auth.UsernamePasswordAuthToken;
import com.enonic.xp.testing.ScriptTestSupport;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.verify;

public class BasicAuthHandlerTest
    extends ScriptTestSupport
{
    private final Map<String, String> configurations = new HashMap<>();

    private StandardProviderConfigServiceImpl standardProviderConfig;

    private SecurityService securityService;

    private User user;

    @Override
    protected void initialize()
        throws Exception
    {
        super.initialize();

        securityService = Mockito.mock( SecurityService.class );

        this.standardProviderConfig = new StandardProviderConfigServiceImpl();
        this.standardProviderConfig.activate( configurations );

        addService( SecurityService.class, securityService );
        addService( StandardProviderConfigService.class, standardProviderConfig );

        user = User.create()
            .key( PrincipalKey.from( "user:system:username" ) )
            .displayName( "Username" )
            .login( "username" )
            .email( "username@enonic.com" )
            .build();

        // getIdProviderKey() reads the id provider from the bound portal request
        this.portalRequest.setIdProvider( IdProvider.create().key( IdProviderKey.system() ).build() );
    }

    @Test
    public void testBasicAuthDisabledByDefault()
        throws Exception
    {
        ScriptValue result = runFunction( "/test/autologin-test.js", "autoLoginBasic", "username", "password" );
        assertFalse( result.getValue( Boolean.class ) );
        Mockito.verifyNoInteractions( securityService );
    }

    @Test
    public void testBasicAuthWithUsername()
        throws Exception
    {
        enableBasicAuth();
        Mockito.when( securityService.authenticate( Mockito.any( AuthenticationToken.class ) ) )
            .thenReturn( AuthenticationInfo.create().user( user ).build() );

        ScriptValue result = runFunction( "/test/autologin-test.js", "autoLoginBasic", "username", "password" );
        assertTrue( result.getValue( Boolean.class ) );

        ArgumentCaptor<UsernamePasswordAuthToken> captor = ArgumentCaptor.forClass( UsernamePasswordAuthToken.class );
        verify( securityService ).authenticate( captor.capture() );

        assertEquals( "username", captor.getValue().getUsername() );
        assertEquals( "password", captor.getValue().getPassword() );
        assertEquals( IdProviderKey.system(), captor.getValue().getIdProvider() );
    }

    @Test
    public void testBasicAuthWithEmail()
        throws Exception
    {
        enableBasicAuth();
        Mockito.when( securityService.authenticate( Mockito.any( AuthenticationToken.class ) ) )
            .thenReturn( AuthenticationInfo.create().user( user ).build() );

        ScriptValue result = runFunction( "/test/autologin-test.js", "autoLoginBasic", "username@enonic.com", "password" );
        assertTrue( result.getValue( Boolean.class ) );

        ArgumentCaptor<EmailPasswordAuthToken> captor = ArgumentCaptor.forClass( EmailPasswordAuthToken.class );
        verify( securityService ).authenticate( captor.capture() );

        assertEquals( "username@enonic.com", captor.getValue().getEmail() );
        assertEquals( IdProviderKey.system(), captor.getValue().getIdProvider() );
    }

    @Test
    public void testBasicAuthWrongCredentials()
        throws Exception
    {
        enableBasicAuth();
        Mockito.when( securityService.authenticate( Mockito.any( AuthenticationToken.class ) ) )
            .thenReturn( AuthenticationInfo.unAuthenticated() );

        ScriptValue result = runFunction( "/test/autologin-test.js", "autoLoginBasic", "username", "wrong" );
        assertFalse( result.getValue( Boolean.class ) );
    }

    private void enableBasicAuth()
    {
        this.configurations.put( "idprovider.system.autologin.basic.enabled", "true" );
        this.standardProviderConfig.activate( configurations );
    }
}
