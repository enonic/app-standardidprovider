package com.enonic.app.standartidprovider.handler;

import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import com.enonic.xp.data.PropertySet;
import com.enonic.xp.data.PropertyTree;
import com.enonic.xp.script.ScriptValue;
import com.enonic.xp.security.Principal;
import com.enonic.xp.security.PrincipalKey;
import com.enonic.xp.security.SecurityService;
import com.enonic.xp.security.User;
import com.enonic.xp.security.auth.AuthenticationInfo;
import com.enonic.xp.security.auth.AuthenticationToken;
import com.enonic.xp.testing.ScriptTestSupport;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

public class JwtHandlerTest
    extends ScriptTestSupport
{

    private static final String ENCODED_PUBLIC_KEY =
        "-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA2GYdAGzE+u05pbAIfmLstb2tp57kDgk1rdEcuKZsFEy63/PI1RdzLATVkPoJgBgmQkXYsz+Qy74TsWe2JeurfRT+YKdGKvyZebn9xJFMfh54op8A9cr/GU43F/vVI1Qs+DC74ZugkG4GMrBtFZEiBQmMZmOMPAvZSFg4/j7b4Vo+Fo5kpXYMIGTvugoPQX0quRai04xOscYc7JGTiHgq2DLPuFyaN/Wpnb97HUQB65V0BvyQoF1TZpwdgMlQzAQ2jPVd71MqxizQlk7Z2YmSlrPsO2A3qb/BbvXpGRFoMB5+FURcxwSLG5Dhl8AmyVlHoA2THTeDWG/OfdDjtMpVUQIDAQAB\n-----END PUBLIC KEY-----\n";

    private SecurityService securityService;

    @Override
    protected void initialize()
        throws Exception
    {
        super.initialize();

        this.securityService = Mockito.mock( SecurityService.class );
        addService( SecurityService.class, securityService );
    }

    @Test
    public void testAutoLogin()
    {
        PropertySet publicKeySet = new PropertySet();
        publicKeySet.setString( "kid", "a46340a4-9d2c-4558-9524-df7f79cf2e36" );
        publicKeySet.setString( "publicKey", ENCODED_PUBLIC_KEY );

        PropertyTree profile = new PropertyTree();
        profile.addSet( "publicKeys", publicKeySet );

        User user = User.create().key( PrincipalKey.from( "user:system:username" ) ).displayName( "Username" ).login( "username" ).email(
            "username@enonic.com" ).profile( profile ).build();

        Mockito.<Optional<? extends Principal>>when( securityService.getPrincipal( Mockito.any( PrincipalKey.class ) ) ).thenReturn(
            Optional.of( user ) );

        Mockito.when( securityService.authenticate( Mockito.any( AuthenticationToken.class ) ) ).thenReturn(
            AuthenticationInfo.create().user( user ).build() );

        ScriptValue result = runFunction( "/test/autologin-test.js", "autoLogin" );
        assertTrue( result.getValue( Boolean.class ) );
    }

    @Test
    public void testAutoLoginWithInvalidToken()
    {
        ScriptValue result = runFunction( "/test/autologin-test.js", "autoLoginWithInvalidToken" );
        assertFalse( result.getValue( Boolean.class ) );
    }
}
