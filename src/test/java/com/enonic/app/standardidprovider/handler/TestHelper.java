package com.enonic.app.standardidprovider.handler;

import java.security.KeyFactory;
import java.security.PrivateKey;
import java.security.interfaces.RSAPrivateKey;
import java.security.spec.PKCS8EncodedKeySpec;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;

import com.auth0.jwt.JWT;
import com.auth0.jwt.JWTCreator;
import com.auth0.jwt.algorithms.Algorithm;

import com.enonic.xp.app.ApplicationKey;
import com.enonic.xp.portal.PortalRequest;
import com.enonic.xp.portal.RenderMode;

public class TestHelper
{
    public static final String ENCODED_PUBLIC_KEY =
        "-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAk7fIjR1FxDMoPiiN1JZ3kkF9ZCgA86hhm58CYkMLjqQgPHNWhufMM7kum1UBUYv/HcmnATBjuNh/h9D/HLYJZw/dBZK9w5AsYTXHoBcFzIrortpMBPaeVxZYjELDcF6ruhw1Gh002B3lvNfbO7ZmwKD4qOFUNUxEMIoBrWH2RYMgoG/tftjU+I8B32NxCVMnCsQl0pxRJEkxan1D6Dq0ENf4uDUdseEQO175peUVGGP6lebO0qYQdbm6VbmetbOE40OlT2q7DGU70N2gI5Kkm3p8rrSu++kPYzobIENjdOk2Mr85X2cpMyK69DR4k3myJJmV4ZmPoCTt6rXIroUfDwIDAQAB\n-----END PUBLIC KEY-----";

    public static final String ENCODED_PRIVATE_KEY =
        "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCTt8iNHUXEMyg+KI3UlneSQX1kKADzqGGbnwJiQwuOpCA8c1aG58wzuS6bVQFRi/8dyacBMGO42H+H0P8ctglnD90Fkr3DkCxhNcegFwXMiuiu2kwE9p5XFliMQsNwXqu6HDUaHTTYHeW819s7tmbAoPio4VQ1TEQwigGtYfZFgyCgb+1+2NT4jwHfY3EJUycKxCXSnFEkSTFqfUPoOrQQ1/i4NR2x4RA7Xvml5RUYY/qV5s7SphB1ubpVuZ61s4TjQ6VParsMZTvQ3aAjkqSbenyutK776Q9jOhsgQ2N06TYyvzlfZykzIrr0NHiTebIkmZXhmY+gJO3qtciuhR8PAgMBAAECggEAAaTxhV1pLDOdlJV4vg+L1+oj1LS0AyEOYokqq8lYOzCSRyGq02M2cX/VAvuOYB8ML2TwxZxL4nC1O1qus1j1ABPQaIJGDtBvooMkvklNj59STf4NC7NWmuv3ZaW+DChU0x3uYqxFhCht1yGp6WcM3Ug6PF/63LUFMC3F5ZER1Ztv0ESDCpCwGUtemXWSkgV2XvSK4te5W42n+8gfD23Ij1io0BPY1if6TPa2YLR6Uhj4WnfDBME3NT2DwZFujD9YYFXTxPHUerwEf88NW4c7qXVYyqh4Y9cyE7MlFII8HkKvRU8U+RgsJjhzyW1T3QZGoqJAUU3nk0AxijRYRefqQQKBgQDItyczWXFVCBtd1WPpRY7dbC6f9swMeEL8yismo+n+gPboXcBae1wvuXQPz5iW2RHlW70QZWZOieyWv5FevOVpW77xnMM9NmYcYIiHcNVvyIrit0nX0Dh0PnWPtMhyh+uQEhHZpEcaP/670MxXxiDQ41LTb3CYTuzq//pvJ90gHwKBgQC8Z6sAX1SKucFM8hqGwZf2bqa7N5FB+lRpZ5qkEGR6CxX7df0vxWgqiw0HZ/q/tXL3hsM7bJPLOMb6aokeOmTISsCoZOtvNUyfCVlDXMSfAc0YjAsizZ8W1DfK2Lqk14OGvncth74C4XfK77KhgbmgnrOv0iYTIB2ZBnsI5VZjEQKBgEs+HbvqM8okl929OQ8hvETVYUUmR6gFDVemkjaSDA4UWnsRaiKBTDW32AJ1WEZ0aXkJwv56hLe8jKyWc/CH75hnhFUe5zHzSqQorAXaDqkxDJ+hBlWZARDSuU99/gaxXWVM4NQt+Vml0+CkjXX6GCM2lL4ecJ8oNziBbWhuET8RAoGBAIggfzVtq6/wNvJZm0Dyb9HmcSGkLJf3PzZJXTpdfbuQdvmRbrYtc+4JOgi34DzT5ZVjEXzGHqMfCuW0RA5LMrZlDH6fLFzVrd7a6lv5kzcwHfg2d3VWDDR6cTVnErQ34xhgVcvX4DpEnkFKn06CZJThFgNbW5dGBRyjyhHLYneBAoGAd3ClWaVTb7YcrjyMxmbbu3XrY/LlQZiTkxQT6kxCMiX6Uap8cZ3FW4Uzx+AGIQSPYTm4UbucJHF86/V10D0Gku0MUQ7IOJAV06JETz0fsIX5mn1ZqYJoExu3V/V67qReCzzYmeT8Rsh28YF/0qTw3dusRd9iN3vktm/3RsOmXaY=\n-----END PRIVATE KEY-----\n";

    public static final String KID = "a46340a4-9d2c-4558-9524-df7f79cf2e36";

    public PortalRequest createPortalRequestWithBearerToken( final String jwtToken )
    {
        final PortalRequest request = new PortalRequest();

        request.setMode( RenderMode.LIVE );
        request.setApplicationKey( ApplicationKey.SYSTEM );
        request.setBaseUri( "/endpoint" );
        request.getHeaders().put( "Authorization", "Bearer " + jwtToken );

        return request;
    }

    public static String generateJwtToken( final long expiresAt, final Clock clock )
        throws Exception
    {
        String encodedPrivateKey =
            TestHelper.ENCODED_PRIVATE_KEY.replace( "-----BEGIN PRIVATE KEY-----", "" ).replace( "-----END PRIVATE KEY-----",
                                                                                                 "" ).replaceAll( "[\\t\\n\\r]+", "" );

        Algorithm algorithm = Algorithm.RSA256( getPrivateKey( encodedPrivateKey ) );

        JWTCreator.Builder builder = JWT.create();

        builder.withKeyId( TestHelper.KID );
        builder.withSubject( "user:system:username" );
        builder.withIssuer( "issuer" );
        final Instant now = clock.instant();
        builder.withIssuedAt( now );

        if ( expiresAt > -1 )
        {
            builder.withExpiresAt( now.plus( Duration.ofSeconds( expiresAt ) ) );
        }

        return builder.sign( algorithm );
    }

    private static RSAPrivateKey getPrivateKey( String encodedPrivateKey )
        throws Exception
    {
        byte[] decodedPrivateKey = Base64.getDecoder().decode( encodedPrivateKey );

        PKCS8EncodedKeySpec ks = new PKCS8EncodedKeySpec( decodedPrivateKey );
        KeyFactory kf = KeyFactory.getInstance( "RSA" );
        PrivateKey pvt = kf.generatePrivate( ks );

        return (RSAPrivateKey) pvt;
    }
}
