package com.enonic.app.standartidprovider.handler;

import java.util.HashMap;
import java.util.Map;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

public class ConfigurationHandlerTest
{
    @Test
    public void test()
    {
        Map<String, String> configurations = new HashMap<>();

        configurations.put( "loginWithoutUser", "false" );
        configurations.put( "idprovider.system.autologin.jwt.enabled", "true" );
        configurations.put( "idprovider.system.autologin.jwt.acceptLeewaySeconds", "10" );
        configurations.put( "idprovider.system.autologin.jwt.maxLifetimeSeconds", "35" );

        StandardProviderConfigServiceImpl service = new StandardProviderConfigServiceImpl();
        service.activate( configurations );

        assertFalse( service.isLoginWithoutUserEnabled() );
        assertTrue( service.isAutologinJwtEnabled( "system" ) );
        assertTrue( service.isAutologinJwtEnabled( "unknown" ) );
        assertEquals( 35L, service.getAutologinJwtLifetimeSeconds( "system" ) );
        assertEquals( 10L, service.getAutologinJwtAcceptLeewaySeconds( "system" ) );
        assertEquals( 30L, service.getAutologinJwtLifetimeSeconds( "unknown" ) );
        assertEquals( -1L, service.getAutologinJwtAcceptLeewaySeconds( "unknown" ) );

        configurations.put( "loginWithoutUser", "true" );
        configurations.put( "idprovider.system.autologin.jwt.enabled", "false" );

        service = new StandardProviderConfigServiceImpl();
        service.activate( configurations );

        assertTrue( service.isLoginWithoutUserEnabled() );
        assertFalse( service.isAutologinJwtEnabled( "system" ) );
        assertTrue( service.isAutologinJwtEnabled( "unknown" ) );
    }
}
