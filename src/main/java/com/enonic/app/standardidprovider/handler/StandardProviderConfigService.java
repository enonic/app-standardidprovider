package com.enonic.app.standardidprovider.handler;

public interface StandardProviderConfigService
{
    boolean isLoginWithoutUserEnabled();

    boolean isAutologinJwtEnabled( String idProviderKey );

    long getAutologinJwtAcceptLeewaySeconds( String idProviderKey );

    long getAutologinJwtLifetimeSeconds( String idProviderKey );
}
