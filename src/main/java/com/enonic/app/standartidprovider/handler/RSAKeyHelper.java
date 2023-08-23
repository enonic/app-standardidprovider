package com.enonic.app.standartidprovider.handler;

import java.security.KeyFactory;
import java.security.NoSuchAlgorithmException;
import java.security.interfaces.RSAPublicKey;
import java.security.spec.InvalidKeySpecException;
import java.security.spec.X509EncodedKeySpec;
import java.util.Base64;
import java.util.Objects;

public class RSAKeyHelper
{
    public static RSAPublicKey getPublicKey( final String publicKey )
    {
        try
        {
            X509EncodedKeySpec ks = new X509EncodedKeySpec( extractPublicKey( publicKey ) );
            KeyFactory kf = KeyFactory.getInstance( "RSA" );
            return (RSAPublicKey) kf.generatePublic( ks );
        }
        catch ( NoSuchAlgorithmException | InvalidKeySpecException e )
        {
            throw new RuntimeException( e );
        }
    }

    private static byte[] extractPublicKey( final String rawPublicKey )
    {
        return Base64.getDecoder()
            .decode( Objects.requireNonNull( rawPublicKey )
                         .replace( "-----BEGIN PUBLIC KEY-----", "" )
                         .replace( "-----END PUBLIC KEY-----", "" )
                         .replaceAll( "[\\t\\n\\r]+", "" ) );
    }
}
