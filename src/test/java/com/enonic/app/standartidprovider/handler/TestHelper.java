package com.enonic.app.standartidprovider.handler;

import com.enonic.xp.app.ApplicationKey;
import com.enonic.xp.portal.PortalRequest;
import com.enonic.xp.portal.RenderMode;

public class TestHelper
{
    public PortalRequest createPortalRequestWithBearerToken( final String jwtToken )
    {
        final PortalRequest request = new PortalRequest();

        request.setMode( RenderMode.LIVE );
        request.setApplicationKey( ApplicationKey.SYSTEM );
        request.setBaseUri( "/endpoint" );
        request.getHeaders().put( "Authorization", "Bearer " + jwtToken );

        return request;
    }
}
