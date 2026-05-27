package com.enonic.app.standardidprovider.handler;

public interface StandardProviderConfigService
{
    boolean isDevMode();

    boolean isSuPasswordConfigured();

    boolean isAutologinJwtEnabled( String idProviderKey );

    long getAutologinJwtAcceptLeewaySeconds( String idProviderKey );

    long getAutologinJwtLifetimeSeconds( String idProviderKey );
}
