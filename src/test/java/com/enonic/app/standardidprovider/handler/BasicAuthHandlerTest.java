package com.enonic.app.standardidprovider.handler;

import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.Mockito;

import jakarta.servlet.http.HttpServletRequest;

import com.enonic.xp.context.ContextAccessor;
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
import com.enonic.xp.session.Session;
import com.enonic.xp.testing.ScriptTestSupport;
import com.enonic.xp.web.dispatch.DispatchConstants;

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

        // basic authentication is only supported on the management endpoint
        setConnector( DispatchConstants.API_CONNECTOR );
    }

    private void setConnector( final String connector )
    {
        HttpServletRequest rawRequest = Mockito.mock( HttpServletRequest.class );
        Mockito.when( rawRequest.getAttribute( DispatchConstants.CONNECTOR_ATTRIBUTE ) ).thenReturn( connector );
        this.portalRequest.setRawRequest( rawRequest );
    }

    @Test
    public void testBasicAuthDisabled()
        throws Exception
    {
        this.configurations.put( "idprovider.system.autologin.basic.enabled", "false" );
        this.standardProviderConfig.activate( configurations );

        ScriptValue result = runFunction( "/test/autologin-test.js", "autoLoginBasic", "username", "password" );
        assertFalse( result.getValue( Boolean.class ) );
        Mockito.verifyNoInteractions( securityService );
    }

    @Test
    public void testBasicAuthFlowNotListed()
        throws Exception
    {
        // an explicit flow list without "basic" disables basic authentication for the vhost
        ScriptValue result = runFunction( "/test/autologin-test.js", "autoLoginBasicWithFlows", "username", "password", "autologin" );
        assertFalse( result.getValue( Boolean.class ) );
        Mockito.verifyNoInteractions( securityService );
    }

    @Test
    public void testBasicAuthFlowListed()
        throws Exception
    {
        Mockito.when( securityService.authenticate( Mockito.any( AuthenticationToken.class ) ) )
            .thenReturn( AuthenticationInfo.create().user( user ).build() );

        ScriptValue result =
            runFunction( "/test/autologin-test.js", "autoLoginBasicWithFlows", "username", "password", "autologin,basic" );
        assertTrue( result.getValue( Boolean.class ) );
    }

    @Test
    public void testBasicAuthWithUsername()
        throws Exception
    {
        // enabled by default
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
    public void testBasicAuthOnWebEndpoint()
        throws Exception
    {
        setConnector( DispatchConstants.XP_CONNECTOR );

        ScriptValue result = runFunction( "/test/autologin-test.js", "autoLoginBasic", "username", "password" );
        assertFalse( result.getValue( Boolean.class ) );
        Mockito.verifyNoInteractions( securityService );
    }

    @Test
    public void testBasicAuthNonSystemIdProvider()
        throws Exception
    {
        this.portalRequest.setIdProvider( IdProvider.create().key( IdProviderKey.from( "other" ) ).build() );

        ScriptValue result = runFunction( "/test/autologin-test.js", "autoLoginBasic", "username", "password" );
        assertFalse( result.getValue( Boolean.class ) );
        Mockito.verifyNoInteractions( securityService );
    }

    @Test
    public void testBasicAuthWrongCredentials()
        throws Exception
    {
        Mockito.when( securityService.authenticate( Mockito.any( AuthenticationToken.class ) ) )
            .thenReturn( AuthenticationInfo.unAuthenticated() );

        ScriptValue result = runFunction( "/test/autologin-test.js", "autoLoginBasic", "username", "wrong" );
        assertFalse( result.getValue( Boolean.class ) );
    }

    @Test
    public void testBasicAuthMalformedCredentials()
        throws Exception
    {
        ScriptValue result = runFunction( "/test/autologin-test.js", "autoLoginHeader", "Basic !!!not-base64!!!" );
        assertFalse( result.getValue( Boolean.class ) );
        Mockito.verifyNoInteractions( securityService );
    }

    @Test
    public void testBasicAuthCredentialsWithoutColon()
        throws Exception
    {
        final String credentials = Base64.getEncoder().encodeToString( "nocolon".getBytes( StandardCharsets.UTF_8 ) );

        ScriptValue result = runFunction( "/test/autologin-test.js", "autoLoginHeader", "Basic " + credentials );
        assertFalse( result.getValue( Boolean.class ) );
        Mockito.verifyNoInteractions( securityService );
    }

    @Test
    public void testBasicAuthExtraWhitespaceAfterScheme()
        throws Exception
    {
        Mockito.when( securityService.authenticate( Mockito.any( AuthenticationToken.class ) ) )
            .thenReturn( AuthenticationInfo.create().user( user ).build() );

        final String credentials = Base64.getEncoder().encodeToString( "username:password".getBytes( StandardCharsets.UTF_8 ) );

        ScriptValue result = runFunction( "/test/autologin-test.js", "autoLoginHeader", "Basic \t " + credentials );
        assertTrue( result.getValue( Boolean.class ) );
    }

    @Test
    public void testBasicAuthUnknownScheme()
        throws Exception
    {
        ScriptValue result = runFunction( "/test/autologin-test.js", "autoLoginHeader", "Digest username=\"username\"" );
        assertFalse( result.getValue( Boolean.class ) );
        Mockito.verifyNoInteractions( securityService );
    }

    @Test
    public void testBasicAuthWithoutRawRequest()
        throws Exception
    {
        this.portalRequest.setRawRequest( null );

        ScriptValue result = runFunction( "/test/autologin-test.js", "autoLoginBasic", "username", "password" );
        assertFalse( result.getValue( Boolean.class ) );
        Mockito.verifyNoInteractions( securityService );
    }

    @Test
    public void testBasicAuthReplacesSession()
        throws Exception
    {
        final AuthenticationInfo authenticationInfo = AuthenticationInfo.create().user( user ).build();
        Mockito.when( securityService.authenticate( Mockito.any( AuthenticationToken.class ) ) ).thenReturn( authenticationInfo );

        final Session session = Mockito.mock( Session.class );
        Mockito.when( session.getAttributes() ).thenReturn( Map.of( "attribute", "value" ) );
        ContextAccessor.current().getLocalScope().setSession( session );

        ScriptValue result = runFunction( "/test/autologin-test.js", "autoLoginBasic", "username", "password" );
        assertTrue( result.getValue( Boolean.class ) );

        // a new session prevents session fixation, and keeps the old session's attributes
        Mockito.verify( session ).invalidate();
        Mockito.verify( session ).setAttribute( "attribute", "value" );
        Mockito.verify( session ).setAttribute( authenticationInfo );
    }
}
