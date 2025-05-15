package com.enonic.app.standardidprovider.handler;

import java.util.Objects;
import java.util.function.Supplier;

import com.auth0.jwt.JWT;
import com.auth0.jwt.interfaces.DecodedJWT;

import com.enonic.xp.context.Context;
import com.enonic.xp.context.ContextAccessor;
import com.enonic.xp.context.ContextBuilder;
import com.enonic.xp.data.PropertySet;
import com.enonic.xp.script.bean.BeanContext;
import com.enonic.xp.script.bean.ScriptBean;
import com.enonic.xp.security.IdProviderKey;
import com.enonic.xp.security.PrincipalKey;
import com.enonic.xp.security.RoleKeys;
import com.enonic.xp.security.SecurityService;
import com.enonic.xp.security.User;
import com.enonic.xp.security.auth.AuthenticationInfo;
import com.enonic.xp.security.auth.VerifiedUsernameAuthToken;

public class JwtHandler
    implements ScriptBean
{
    private static final User SU_USER = User.create().key( PrincipalKey.ofSuperUser() ).displayName( "Super User" ).login( "su" ).build();

    private static final AuthenticationInfo AUTHENTICATION_INFO =
        AuthenticationInfo.create().principals( RoleKeys.ADMIN ).user( SU_USER ).build();

    private Supplier<SecurityService> securityServiceSupplier;

    private Supplier<JwtVerifierService> jwtVerifierServiceSupplier;

    private Supplier<StandardProviderConfigService> standardProviderConfigServiceSupplier;

    @Override
    public void initialize( final BeanContext beanContext )
    {
        this.securityServiceSupplier = beanContext.getService( SecurityService.class );
        this.jwtVerifierServiceSupplier = beanContext.getService( JwtVerifierService.class );
        this.standardProviderConfigServiceSupplier = beanContext.getService( StandardProviderConfigService.class );
    }

    public boolean verifyAndLogin( final String jwtToken )
    {
        if ( !standardProviderConfigServiceSupplier.get().isAutologinJwtEnabled( IdProviderKey.system().toString() ) )
        {
            return false;
        }

        final DecodedJWT decodedJwt = JWT.decode( jwtToken );
        final String kid = Objects.requireNonNull( decodedJwt.getKeyId() );
        final String principalKey = Objects.requireNonNull( decodedJwt.getSubject() );
        final User user = findUser( principalKey );

        if ( user != null && IdProviderKey.system().equals( user.getKey().getIdProviderKey() ) && user.getProfile() != null &&
            user.getProfile().getSets( "publicKeys" ) != null )
        {
            for ( PropertySet propertySet : user.getProfile().getSets( "publicKeys" ) )
            {
                if ( Objects.equals( kid, propertySet.getString( "kid" ) ) )
                {
                    jwtVerifierServiceSupplier.get().verify( decodedJwt,
                                                             RSAKeyHelper.getPublicKey( propertySet.getString( "publicKey" ) ) );

                    final AuthenticationInfo authenticationInfo = authenticate( user );
                    if ( authenticationInfo.isAuthenticated() )
                    {
                        ContextAccessor.current().getLocalScope().setAttribute( authenticationInfo );
                        return true;
                    }
                }
            }
        }
        return false;
    }

    private User findUser( String userKey )
    {
        return createContext().callWith(
            () -> (User) securityServiceSupplier.get().getPrincipal( PrincipalKey.from( userKey ) ).orElse( null ) );
    }

    private AuthenticationInfo authenticate( final User serviceAccount )
    {
        VerifiedUsernameAuthToken authenticationToken = new VerifiedUsernameAuthToken();
        authenticationToken.setIdProvider( IdProviderKey.system() );
        authenticationToken.setUsername( serviceAccount.getLogin() );

        return securityServiceSupplier.get().authenticate( authenticationToken );
    }

    private static Context createContext()
    {
        return ContextBuilder.create().authInfo( AUTHENTICATION_INFO ).build();
    }
}
