package com.enonic.app.standartidprovider.handler;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneId;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import com.auth0.jwt.interfaces.DecodedJWT;

import com.enonic.xp.data.PropertySet;
import com.enonic.xp.data.PropertyTree;
import com.enonic.xp.portal.PortalRequest;
import com.enonic.xp.portal.PortalRequestAccessor;
import com.enonic.xp.script.ScriptValue;
import com.enonic.xp.security.IdProvider;
import com.enonic.xp.security.IdProviderKey;
import com.enonic.xp.security.Principal;
import com.enonic.xp.security.PrincipalKey;
import com.enonic.xp.security.SecurityService;
import com.enonic.xp.security.User;
import com.enonic.xp.security.auth.AuthenticationInfo;
import com.enonic.xp.security.auth.AuthenticationToken;
import com.enonic.xp.testing.ScriptTestSupport;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

public class JwtHandlerTest
    extends ScriptTestSupport
{
    private final Map<String, String> configurations = new HashMap<>();

    private StandardProviderConfigServiceImpl standardProviderConfig;

    @Override
    protected void initialize()
        throws Exception
    {
        super.initialize();

        SecurityService securityService = Mockito.mock( SecurityService.class );

        this.standardProviderConfig = new StandardProviderConfigServiceImpl();
        this.standardProviderConfig.activate( configurations );

        DecodedJWT decodedJWT = Mockito.mock( DecodedJWT.class );

        JwtVerifierService jwtVerifierService = Mockito.mock( JwtVerifierService.class );
        Mockito.when( jwtVerifierService.verify( Mockito.any(), Mockito.any() ) ).thenReturn( decodedJWT );

        addService( SecurityService.class, securityService );
        addService( StandardProviderConfigService.class, standardProviderConfig );
        addService( JwtVerifierService.class, jwtVerifierService );

        PropertySet publicKeySet = new PropertySet();
        publicKeySet.setString( "kid", TestHelper.KID );
        publicKeySet.setString( "publicKey", TestHelper.ENCODED_PUBLIC_KEY );

        PropertyTree profile = new PropertyTree();
        profile.addSet( "publicKeys", publicKeySet );

        User user = User.create().key( PrincipalKey.from( "user:system:username" ) ).displayName( "Username" ).login( "username" ).email(
            "username@enonic.com" ).profile( profile ).build();

        Mockito.<Optional<? extends Principal>>when( securityService.getPrincipal( Mockito.any( PrincipalKey.class ) ) ).thenReturn(
            Optional.of( user ) );

        Mockito.when( securityService.authenticate( Mockito.any( AuthenticationToken.class ) ) ).thenReturn(
            AuthenticationInfo.create().user( user ).build() );
    }

    @BeforeEach
    public void setUp()
    {
        PortalRequest portalRequest = Mockito.mock( PortalRequest.class );
        Mockito.when( portalRequest.getIdProvider() ).thenReturn( IdProvider.create().key( IdProviderKey.system() ).build() );
        PortalRequestAccessor.set( portalRequest );
    }

    @Test
    public void testAutoLogin()
        throws Exception
    {
        Clock clock = Clock.fixed( Instant.now(), ZoneId.of( "UTC" ) );
        ScriptValue result = runFunction( "/test/autologin-test.js", "autoLogin", TestHelper.generateJwtToken( 10, clock ) );
        assertTrue( result.getValue( Boolean.class ) );
    }

    @Test
    public void testAutoLoginDisabled()
        throws Exception
    {
        this.configurations.put( "idprovider.system.autologin.jwt.enabled", "false" );
        this.standardProviderConfig.activate( configurations );

        Clock clock = Clock.fixed( Instant.now(), ZoneId.of( "UTC" ) );
        ScriptValue result = runFunction( "/test/autologin-test.js", "autoLogin", TestHelper.generateJwtToken( 10, clock ) );
        assertFalse( result.getValue( Boolean.class ) );
    }
}
