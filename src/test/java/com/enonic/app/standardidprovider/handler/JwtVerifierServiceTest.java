package com.enonic.app.standardidprovider.handler;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneId;
import java.util.HashMap;
import java.util.Map;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import com.auth0.jwt.JWT;

import com.enonic.xp.portal.PortalRequest;
import com.enonic.xp.portal.PortalRequestAccessor;
import com.enonic.xp.security.IdProvider;
import com.enonic.xp.security.IdProviderKey;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

public class JwtVerifierServiceTest
{
    private Clock clock;

    private JwtVerifierService jwtVerifierService;

    @BeforeEach
    public void setUp()
    {
        Map<String, String> configurations = new HashMap<>();
        configurations.put( "idprovider.system.autologin.jwt.maxLifetimeSeconds", "30" );

        StandardProviderConfigServiceImpl standardProviderConfig = new StandardProviderConfigServiceImpl();
        standardProviderConfig.activate( configurations );

        this.jwtVerifierService = new JwtVerifierServiceImpl( standardProviderConfig );

        PortalRequest portalRequest = Mockito.mock( PortalRequest.class );
        Mockito.when( portalRequest.getIdProvider() ).thenReturn( IdProvider.create().key( IdProviderKey.system() ).build() );
        PortalRequestAccessor.set( portalRequest );
    }

    @Test
    public void testJwtTokeWithWrongExpirationTime()
        throws Exception
    {
        Instant now = Instant.now();
        this.clock = Clock.fixed( now, ZoneId.of( "UTC" ) );
        String jwtToken = TestHelper.generateJwtToken( 50, this.clock );

        IllegalStateException exception = assertThrows( IllegalStateException.class,
                                                        () -> jwtVerifierService.verify( JWT.decode( jwtToken ), RSAKeyHelper.getPublicKey(
                                                            TestHelper.ENCODED_PUBLIC_KEY ) ) );

        assertEquals( "Expiration time is greater than issued time by more than 30 seconds", exception.getMessage() );
    }

    @Test
    public void testJwtTokeWithValidExpirationTime()
        throws Exception
    {
        Instant now = Instant.now();
        this.clock = Clock.fixed( now, ZoneId.of( "UTC" ) );

        String jwtToken = TestHelper.generateJwtToken( 30, this.clock );

        assertDoesNotThrow(
            () -> jwtVerifierService.verify( JWT.decode( jwtToken ), RSAKeyHelper.getPublicKey( TestHelper.ENCODED_PUBLIC_KEY ) ) );
    }

}
