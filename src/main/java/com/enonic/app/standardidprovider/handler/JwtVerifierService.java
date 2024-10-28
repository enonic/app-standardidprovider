package com.enonic.app.standardidprovider.handler;

import java.security.interfaces.RSAPublicKey;

import com.auth0.jwt.interfaces.DecodedJWT;

public interface JwtVerifierService
{
    DecodedJWT verify( final DecodedJWT decodedJwt, final RSAPublicKey publicKey );
}
