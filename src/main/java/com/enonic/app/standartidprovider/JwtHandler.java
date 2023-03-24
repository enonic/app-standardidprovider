package com.enonic.app.standartidprovider;

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
import com.auth0.jwt.exceptions.JWTVerificationException;
import com.auth0.jwt.interfaces.DecodedJWT;

import com.enonic.xp.context.Context;
import com.enonic.xp.context.ContextAccessor;
import com.enonic.xp.context.ContextBuilder;
import com.enonic.xp.script.bean.BeanContext;
import com.enonic.xp.script.bean.ScriptBean;
import com.enonic.xp.security.PrincipalKey;
import com.enonic.xp.security.RoleKeys;
import com.enonic.xp.security.SecurityService;
import com.enonic.xp.security.User;
import com.enonic.xp.security.auth.AuthenticationInfo;
import com.enonic.xp.security.auth.VerifiedEmailAuthToken;

public class JwtHandler
    implements ScriptBean
{
    private static final Logger LOG = LoggerFactory.getLogger( JwtHandler.class );

    private static final User SU_USER = User.create().key( PrincipalKey.ofSuperUser() ).displayName( "Super User" ).login( "su" ).build();

    private static final AuthenticationInfo AUTHENTICATION_INFO =
        AuthenticationInfo.create().principals( RoleKeys.ADMIN ).user( SU_USER ).build();

    private Supplier<SecurityService> securityServiceSupplier;

    public boolean verifyAndLogin( final String jwtToken )
    {
        DecodedJWT decodedJwt;
        try
        {
            decodedJwt = JWT.decode( jwtToken );
        }
        catch ( Exception e )
        {
            LOG.error( "Invalid JWT token format", e );
            return false;
        }

        String kid = Objects.requireNonNull( decodedJwt.getKeyId() );
        String serviceAccountKey = Objects.requireNonNull( decodedJwt.getSubject() );

        User serviceAccount = createContext().callWith(
            () -> (User) securityServiceSupplier.get().getPrincipal( PrincipalKey.from( serviceAccountKey ) ).orElse( null ) );

        if ( serviceAccount != null && serviceAccount.getProfile() != null && kid.equals( serviceAccount.getProfile().getString( "kid" ) ) )
        {
            String encodedPublicKey = Objects.requireNonNull( serviceAccount.getProfile().getString( "publicKey" ) );
            try
            {
                JWT.require( Algorithm.RSA256( getPublicKey( encodedPublicKey ) ) ).acceptLeeway( 1 ).build().verify( decodedJwt );

                AuthenticationInfo authenticationInfo = authenticate( serviceAccount );

                if ( authenticationInfo.isAuthenticated() )
                {
                    ContextAccessor.current().getLocalScope().setAttribute( authenticationInfo );
                    return true;
                }
            }
            catch ( JWTVerificationException e )
            {
                LOG.error( "Verification is failed", e );
            }
            catch ( NoSuchAlgorithmException | InvalidKeySpecException e )
            {
                LOG.error( "Invalid publicKey", e );
            }
            catch ( Exception e )
            {
                throw new RuntimeException( e );
            }
        }

        return false;
    }

    private AuthenticationInfo authenticate( final User serviceAccount )
    {
        VerifiedEmailAuthToken authenticationToken = new VerifiedEmailAuthToken();
        authenticationToken.setEmail( serviceAccount.getEmail() );

        return securityServiceSupplier.get().authenticate( authenticationToken );
    }

    private RSAPublicKey getPublicKey( final String encodedPublicKey )
        throws NoSuchAlgorithmException, InvalidKeySpecException
    {
        X509EncodedKeySpec ks = new X509EncodedKeySpec( Base64.getDecoder().decode( encodedPublicKey ) );
        KeyFactory kf = KeyFactory.getInstance( "RSA" );
        return (RSAPublicKey) kf.generatePublic( ks );
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
