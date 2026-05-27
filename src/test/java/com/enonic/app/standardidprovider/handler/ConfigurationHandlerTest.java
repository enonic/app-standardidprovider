package com.enonic.app.standardidprovider.handler;

import java.util.HashMap;
import java.util.Map;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

public class ConfigurationHandlerTest
{
    @Test
    public void autologin_jwt_config()
    {
        Map<String, String> configurations = new HashMap<>();

        configurations.put( "idprovider.system.autologin.jwt.enabled", "true" );
        configurations.put( "idprovider.system.autologin.jwt.acceptLeewaySeconds", "10" );
        configurations.put( "idprovider.system.autologin.jwt.maxLifetimeSeconds", "35" );

        StandardProviderConfigServiceImpl service = new StandardProviderConfigServiceImpl();
        service.activate( configurations );

        assertTrue( service.isAutologinJwtEnabled( "system" ) );
        assertTrue( service.isAutologinJwtEnabled( "unknown" ) );
        assertEquals( 35L, service.getAutologinJwtLifetimeSeconds( "system" ) );
        assertEquals( 10L, service.getAutologinJwtAcceptLeewaySeconds( "system" ) );
        assertEquals( 30L, service.getAutologinJwtLifetimeSeconds( "unknown" ) );
        assertEquals( -1L, service.getAutologinJwtAcceptLeewaySeconds( "unknown" ) );

        configurations.put( "idprovider.system.autologin.jwt.enabled", "false" );

        service = new StandardProviderConfigServiceImpl();
        service.activate( configurations );

        assertFalse( service.isAutologinJwtEnabled( "system" ) );
        assertTrue( service.isAutologinJwtEnabled( "unknown" ) );
    }

    @Test
    public void isDevMode_is_false_in_prod_test_runtime()
    {
        StandardProviderConfigServiceImpl service = new StandardProviderConfigServiceImpl();
        service.activate( new HashMap<>() );

        // Tests run with the default PROD run mode.
        assertFalse( service.isDevMode() );
    }

    @Test
    public void isSuPasswordConfigured_reflects_system_property()
    {
        StandardProviderConfigServiceImpl service = new StandardProviderConfigServiceImpl();
        service.activate( new HashMap<>() );

        final String previous = System.getProperty( "xp.suPassword" );
        try
        {
            System.clearProperty( "xp.suPassword" );
            assertFalse( service.isSuPasswordConfigured() );

            System.setProperty( "xp.suPassword", "{sha512}abc" );
            assertTrue( service.isSuPasswordConfigured() );

            System.setProperty( "xp.suPassword", "" );
            assertFalse( service.isSuPasswordConfigured() );
        }
        finally
        {
            if ( previous == null )
            {
                System.clearProperty( "xp.suPassword" );
            }
            else
            {
                System.setProperty( "xp.suPassword", previous );
            }
        }
    }
}