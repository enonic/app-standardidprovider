package com.enonic.app.standardidprovider.handler;

import java.util.Map;
import java.util.function.Function;

import org.osgi.service.component.annotations.Activate;
import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Modified;

import com.enonic.xp.server.RunMode;

@Component(immediate = true, configurationPid = "com.enonic.xp.app.standardidprovider")
public class StandardProviderConfigServiceImpl
    implements StandardProviderConfigService
{
    private static final String SU_PASSWORD_PROPERTY_KEY = "xp.suPassword";

    private static final String AUTOLOGIN_JWT_ENABLED_CONFIG = "idprovider.{{idProvider}}.autologin.jwt.enabled";

    private static final String AUTOLOGIN_JWT_ACCEPT_LEEWAY_CONFIG = "idprovider.{{idProvider}}.autologin.jwt.acceptLeewaySeconds";

    private static final String AUTOLOGIN_JWT_MAX_LIFETIME_CONFIG = "idprovider.{{idProvider}}.autologin.jwt.maxLifetimeSeconds";

    private static final String AUTOLOGIN_BASIC_ENABLED_CONFIG = "idprovider.{{idProvider}}.autologin.basic.enabled";

    private static final boolean DEFAULT_JWT_ENABLED = true;

    // Basic authentication is opt-out: enabled by default for backwards compatibility.
    private static final boolean DEFAULT_BASIC_ENABLED = true;

    private static final long DEFAULT_JWT_ACCEPT_LEEWAY = -1L;

    private static final long DEFAULT_JWT_LIFETIME = 30L;

    private volatile Map<String, String> configuration;

    @Activate
    @Modified
    public void activate( final Map<String, String> configuration )
    {
        this.configuration = configuration;
    }

    @Override
    public boolean isDevMode()
    {
        return RunMode.isDev();
    }

    @Override
    public boolean isSuPasswordConfigured()
    {
        return !System.getProperty( SU_PASSWORD_PROPERTY_KEY, "" ).isEmpty();
    }

    @Override
    public boolean isAutologinJwtEnabled( final String idProviderKey )
    {
        return getProperty( AUTOLOGIN_JWT_ENABLED_CONFIG, idProviderKey, DEFAULT_JWT_ENABLED, Boolean::parseBoolean );
    }

    @Override
    public boolean isAutologinBasicEnabled( final String idProviderKey )
    {
        return getProperty( AUTOLOGIN_BASIC_ENABLED_CONFIG, idProviderKey, DEFAULT_BASIC_ENABLED, Boolean::parseBoolean );
    }

    @Override
    public long getAutologinJwtAcceptLeewaySeconds( final String idProviderKey )
    {
        return getProperty( AUTOLOGIN_JWT_ACCEPT_LEEWAY_CONFIG, idProviderKey, DEFAULT_JWT_ACCEPT_LEEWAY, Long::parseLong );
    }

    @Override
    public long getAutologinJwtLifetimeSeconds( final String idProviderKey )
    {
        return getProperty( AUTOLOGIN_JWT_MAX_LIFETIME_CONFIG, idProviderKey, DEFAULT_JWT_LIFETIME, Long::parseLong );
    }

    private <T> T getProperty( String propertyKey, String idProviderKey, T defaultValue, Function<String, T> converter )
    {
        T property = defaultValue;
        if ( idProviderKey != null )
        {
            String value = configuration.get( propertyKey.replace( "{{idProvider}}", idProviderKey ) );
            if ( value != null )
            {
                property = converter.apply( value );
            }
        }
        return property;
    }
}
