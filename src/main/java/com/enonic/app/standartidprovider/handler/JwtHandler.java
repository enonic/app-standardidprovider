package com.enonic.app.standartidprovider.handler;

import java.security.KeyFactory;
import java.security.NoSuchAlgorithmException;
import java.security.interfaces.RSAPublicKey;
import java.security.spec.InvalidKeySpecException;
import java.security.spec.X509EncodedKeySpec;
import java.util.Base64;
import java.util.Objects;
import java.util.function.Supplier;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.interfaces.DecodedJWT;

import com.enonic.xp.context.Context;
import com.enonic.xp.context.ContextAccessor;
import com.enonic.xp.context.ContextBuilder;
import com.enonic.xp.data.PropertySet;
import com.enonic.xp.script.bean.BeanContext;
import com.enonic.xp.script.bean.ScriptBean;
import com.enonic.xp.security.PrincipalKey;
import com.enonic.xp.security.RoleKeys;
import com.enonic.xp.security.SecurityService;
import com.enonic.xp.security.User;
import com.enonic.xp.security.auth.AuthenticationInfo;
import com.enonic.xp.security.auth.VerifiedUsernameAuthToken;

public class JwtHandler
    implements ScriptBean
{
    private static final Logger LOG = LoggerFactory.getLogger( JwtHandler.class );

    private static final User SU_USER = User.create().key( PrincipalKey.ofSuperUser() ).displayName( "Super User" ).login( "su" ).build();

    private static final AuthenticationInfo AUTHENTICATION_INFO =
        AuthenticationInfo.create().principals( RoleKeys.ADMIN ).user( SU_USER ).build();

    private Supplier<SecurityService> securityServiceSupplier;

    public void verifyAndLogin( final String jwtToken )
    {
        final DecodedJWT decodedJwt = JWT.decode( jwtToken );

        final String kid = Objects.requireNonNull( decodedJwt.getKeyId() );
        final String serviceAccountKey = Objects.requireNonNull( decodedJwt.getSubject() );
        final User serviceAccount = findUser( serviceAccountKey );

        if ( serviceAccount != null && serviceAccount.getProfile() != null && serviceAccount.getProfile().getSets( "publicKeys" ) != null )
        {
            for ( PropertySet propertySet : serviceAccount.getProfile().getSets( "publicKeys" ) )
            {
                if ( Objects.equals( kid, propertySet.getString( "kid" ) ) )
                {
                    verifyJwtToken( propertySet.getString( "publicKey" ), decodedJwt );
                    final AuthenticationInfo authenticationInfo = authenticate( serviceAccount );
                    if ( authenticationInfo.isAuthenticated() )
                    {
                        ContextAccessor.current().getLocalScope().setAttribute( authenticationInfo );
                    }
                }
            }
        }
    }

    private User findUser( String userKey )
    {
        return createContext().callWith(
            () -> (User) securityServiceSupplier.get().getPrincipal( PrincipalKey.from( userKey ) ).orElse( null ) );
    }

    private void verifyJwtToken( final String publicKey, final DecodedJWT decodedJwt )
    {
            JWT.require( Algorithm.RSA256( getPublicKey( publicKey ) ) ).acceptLeeway( 1 ).build().verify( decodedJwt );
    }

    private byte[] extractPublicKey( final String rawPublicKey )
    {
        return Base64.getDecoder()
            .decode( Objects.requireNonNull( rawPublicKey )
                         .replace( "-----BEGIN PUBLIC KEY-----", "" )
                         .replace( "-----END PUBLIC KEY-----", "" )
                         .replaceAll( "[\\t\\n\\r]+", "" ) );
    }

    private AuthenticationInfo authenticate( final User serviceAccount )
    {
        VerifiedUsernameAuthToken authenticationToken = new VerifiedUsernameAuthToken();
        authenticationToken.setUsername( serviceAccount.getLogin() );

        return securityServiceSupplier.get().authenticate( authenticationToken );
    }

    private RSAPublicKey getPublicKey( final String publicKey )
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

    private static Context createContext()
    {
        return ContextBuilder.create().authInfo( AUTHENTICATION_INFO ).build();
    }

    @Override
    public void initialize( final BeanContext beanContext )
    {
        this.securityServiceSupplier = beanContext.getService( SecurityService.class );
    }
}
