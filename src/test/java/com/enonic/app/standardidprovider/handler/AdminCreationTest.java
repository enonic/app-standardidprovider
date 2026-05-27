package com.enonic.app.standardidprovider.handler;

import java.util.Arrays;

import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import com.enonic.xp.portal.PortalRequest;
import com.enonic.xp.script.ScriptValue;
import com.enonic.xp.security.IdProvider;
import com.enonic.xp.security.IdProviderKey;
import com.enonic.xp.security.Group;
import com.enonic.xp.security.Principal;
import com.enonic.xp.security.PrincipalKey;
import com.enonic.xp.security.PrincipalKeys;
import com.enonic.xp.security.PrincipalRelationship;
import com.enonic.xp.security.PrincipalRelationships;
import com.enonic.xp.security.Principals;
import com.enonic.xp.security.RoleKeys;
import com.enonic.xp.security.SecurityService;
import com.enonic.xp.security.User;
import com.enonic.xp.testing.ScriptTestSupport;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

public class AdminCreationTest
    extends ScriptTestSupport
{
    private SecurityService securityService;

    private StandardProviderConfigService configService;

    @Override
    protected void initialize()
        throws Exception
    {
        super.initialize();

        securityService = Mockito.mock( SecurityService.class );
        configService = Mockito.mock( StandardProviderConfigService.class );

        addService( SecurityService.class, securityService );
        addService( StandardProviderConfigService.class, configService );

        // getIdProviderKey() reads the bound PortalRequest; make it the system id provider.
        this.portalRequest = Mockito.mock( PortalRequest.class );
        Mockito.when( this.portalRequest.getIdProvider() ).thenReturn( IdProvider.create().key( IdProviderKey.system() ).build() );

        // getPrincipals returns a bare principal for each requested key (key prefix decides type).
        Mockito.when( securityService.getPrincipals( Mockito.any( PrincipalKeys.class ) ) ).thenAnswer( invocation -> {
            final PrincipalKeys keys = invocation.getArgument( 0 );
            return Principals.from( keys.stream().map( AdminCreationTest::principalOf ).toArray( Principal[]::new ) );
        } );

        // Default: only su is a member of the admin role.
        adminRoleMembers( PrincipalKey.ofSuperUser() );
    }

    private static Principal principalOf( final PrincipalKey key )
    {
        if ( key.isGroup() )
        {
            return Group.create().key( key ).displayName( key.getId() ).build();
        }
        return User.create().key( key ).login( key.getId() ).build();
    }

    private void membersOf( final PrincipalKey container, final PrincipalKey... members )
    {
        Mockito.when( securityService.getRelationships( container ) ).thenReturn( PrincipalRelationships.from(
            Arrays.stream( members ).map( m -> PrincipalRelationship.from( container ).to( m ) ).toArray( PrincipalRelationship[]::new ) ) );
    }

    private void adminRoleMembers( final PrincipalKey... members )
    {
        membersOf( RoleKeys.ADMIN, members );
    }

    private boolean firstLoginEnabled()
    {
        final ScriptValue result = runFunction( "/test/admin-creation-test.js", "firstLoginEnabled" );
        return result.getValue( Boolean.class );
    }

    @Test
    public void enabled_when_dev_no_su_password_and_only_su_is_admin()
    {
        Mockito.when( configService.isDevMode() ).thenReturn( true );
        Mockito.when( configService.isSuPasswordConfigured() ).thenReturn( false );

        assertTrue( firstLoginEnabled() );
    }

    @Test
    public void disabled_when_not_dev_mode()
    {
        Mockito.when( configService.isDevMode() ).thenReturn( false );
        Mockito.when( configService.isSuPasswordConfigured() ).thenReturn( false );

        assertFalse( firstLoginEnabled() );
    }

    @Test
    public void disabled_when_su_password_configured()
    {
        Mockito.when( configService.isDevMode() ).thenReturn( true );
        Mockito.when( configService.isSuPasswordConfigured() ).thenReturn( true );

        assertFalse( firstLoginEnabled() );
    }

    @Test
    public void disabled_when_a_non_su_user_is_admin()
    {
        Mockito.when( configService.isDevMode() ).thenReturn( true );
        Mockito.when( configService.isSuPasswordConfigured() ).thenReturn( false );

        adminRoleMembers( PrincipalKey.ofSuperUser(), PrincipalKey.from( "user:system:alice" ) );

        assertFalse( firstLoginEnabled() );
    }

    @Test
    public void disabled_when_admin_granted_via_group()
    {
        Mockito.when( configService.isDevMode() ).thenReturn( true );
        Mockito.when( configService.isSuPasswordConfigured() ).thenReturn( false );

        final PrincipalKey admins = PrincipalKey.from( "group:system:admins" );
        adminRoleMembers( PrincipalKey.ofSuperUser(), admins );
        membersOf( admins, PrincipalKey.from( "user:system:bob" ) );

        assertFalse( firstLoginEnabled() );
    }
}