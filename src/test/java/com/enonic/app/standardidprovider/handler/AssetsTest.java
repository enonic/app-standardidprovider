package com.enonic.app.standardidprovider.handler;

import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.Mockito;

import com.enonic.xp.portal.PortalRequest;
import com.enonic.xp.portal.url.IdentityUrlParams;
import com.enonic.xp.portal.url.PortalUrlService;
import com.enonic.xp.security.IdProvider;
import com.enonic.xp.security.IdProviderKey;
import com.enonic.xp.testing.ScriptTestSupport;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

public class AssetsTest
    extends ScriptTestSupport
{
    private PortalUrlService portalUrlService;

    @Override
    protected void initialize()
        throws Exception
    {
        super.initialize();

        portalUrlService = Mockito.mock( PortalUrlService.class );
        Mockito.when( portalUrlService.identityUrl( Mockito.any() ) ).thenAnswer(
            i -> "/_/idprovider/" + i.<IdentityUrlParams>getArgument( 0 ).getIdProviderKey() );
        addService( PortalUrlService.class, portalUrlService );

        this.portalRequest = Mockito.mock( PortalRequest.class );
        Mockito.when( this.portalRequest.getIdProvider() ).thenReturn( IdProvider.create().key( IdProviderKey.system() ).build() );
    }

    @Test
    public void assets_are_served_by_the_id_provider_the_page_runs_as()
    {
        final String prefix = runFunction( "/test/assets-test.js", "assetUrlPrefix" ).getValue( String.class );

        final ArgumentCaptor<IdentityUrlParams> params = ArgumentCaptor.forClass( IdentityUrlParams.class );
        Mockito.verify( portalUrlService ).identityUrl( params.capture() );
        assertEquals( IdProviderKey.system(), params.getValue().getIdProviderKey() );
        assertTrue( prefix.matches( "/_/idprovider/system/_static/\\d+" ), prefix );
    }
}
