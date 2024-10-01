package com.enonic.app.standardidprovider.handler;

import java.security.interfaces.RSAPublicKey;
import java.time.Instant;
import java.time.temporal.ChronoUnit;

import org.osgi.service.component.annotations.Activate;
import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Reference;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.interfaces.DecodedJWT;
import com.auth0.jwt.interfaces.Verification;

import com.enonic.xp.portal.PortalRequestAccessor;
import com.enonic.xp.security.IdProvider;

@Component(immediate = true)
public class JwtVerifierServiceImpl
    implements JwtVerifierService
{
    private final StandardProviderConfigService configurationService;

    @Activate
    public JwtVerifierServiceImpl( final @Reference StandardProviderConfigService configurationService )
    {
        this.configurationService = configurationService;
    }

    @Override
    public DecodedJWT verify( final DecodedJWT decodedJwt, final RSAPublicKey publicKey )
    {
        IdProvider idProvider = PortalRequestAccessor.get().getIdProvider();

        String idProviderKey = idProvider != null ? idProvider.getKey().toString() : null;

        long jwtAcceptLeeway = configurationService.getAutologinJwtAcceptLeewaySeconds( idProviderKey );

        long jwtLifetime = configurationService.getAutologinJwtLifetimeSeconds( idProviderKey );

        Verification verification = JWT.require( Algorithm.RSA256( publicKey ) );

        if ( jwtAcceptLeeway > -1 )
        {
            verification.acceptLeeway( jwtAcceptLeeway );
        }

        final DecodedJWT verifiedJwt = verification.build().verify( decodedJwt );

        validateLifetime( verifiedJwt, jwtLifetime );

        return verifiedJwt;
    }

    private void validateLifetime( final DecodedJWT decodedJWT, long jwtMaxLifetime )
    {
        final Instant issuedAtAsInstant = decodedJWT.getIssuedAtAsInstant();
        final Instant expiresAtAsInstant = decodedJWT.getExpiresAtAsInstant();
        if ( issuedAtAsInstant.plus( jwtMaxLifetime, ChronoUnit.SECONDS ).isBefore( expiresAtAsInstant ) )
        {
            throw new IllegalStateException(
                String.format( "Expiration time is greater than issued time by more than %d seconds", jwtMaxLifetime ) );
        }
    }

}
