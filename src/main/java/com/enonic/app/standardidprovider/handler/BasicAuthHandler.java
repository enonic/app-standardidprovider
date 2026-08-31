package com.enonic.app.standardidprovider.handler;

import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.function.Supplier;

import org.jspecify.annotations.Nullable;

import jakarta.servlet.http.HttpServletRequest;

import com.enonic.xp.context.ContextAccessor;
import com.enonic.xp.context.LocalScope;
import com.enonic.xp.portal.PortalRequest;
import com.enonic.xp.script.bean.BeanContext;
import com.enonic.xp.script.bean.ScriptBean;
import com.enonic.xp.security.IdProviderKey;
import com.enonic.xp.security.SecurityService;
import com.enonic.xp.security.auth.AuthenticationInfo;
import com.enonic.xp.security.auth.EmailPasswordAuthToken;
import com.enonic.xp.security.auth.UsernamePasswordAuthToken;
import com.enonic.xp.session.Session;
import com.enonic.xp.web.dispatch.DispatchConstants;

/**
 * HTTP Basic authentication for the {@code autoLogin} flow: logs in with the base64-encoded
 * credentials of the Authorization header. Supported for the system id provider on the management
 * endpoint only. Deprecated and left only for backwards compatibility: enabled by default,
 * disabled with {@code idprovider.system.autologin.basic.enabled = false}.
 */
public class BasicAuthHandler
    implements ScriptBean
{
    private Supplier<SecurityService> securityServiceSupplier;

    private Supplier<StandardProviderConfigService> configServiceSupplier;

    private Supplier<PortalRequest> requestSupplier;

    @Override
    public void initialize( final BeanContext beanContext )
    {
        this.securityServiceSupplier = beanContext.getService( SecurityService.class );
        this.configServiceSupplier = beanContext.getService( StandardProviderConfigService.class );
        this.requestSupplier = beanContext.getBinding( PortalRequest.class );
    }

    public boolean login( final String credentials, @Nullable final String idProviderKey )
    {
        if ( !IdProviderKey.system().toString().equals( idProviderKey ) ||
            !configServiceSupplier.get().isAutologinBasicEnabled( idProviderKey ) )
        {
            return false;
        }

        final PortalRequest request = requestSupplier.get();
        final HttpServletRequest rawRequest = request == null ? null : request.getRawRequest();
        if ( rawRequest == null ||
            !DispatchConstants.API_CONNECTOR.equals( rawRequest.getAttribute( DispatchConstants.CONNECTOR_ATTRIBUTE ) ) )
        {
            return false;
        }

        final String decoded;
        try
        {
            decoded = new String( Base64.getDecoder().decode( credentials ), StandardCharsets.UTF_8 );
        }
        catch ( IllegalArgumentException e )
        {
            return false;
        }

        final int pos = decoded.indexOf( ':' );
        if ( pos == -1 )
        {
            return false;
        }
        final String user = decoded.substring( 0, pos );
        final String password = decoded.substring( pos + 1 );

        final IdProviderKey idProvider = IdProviderKey.from( idProviderKey );
        AuthenticationInfo authInfo = AuthenticationInfo.unAuthenticated();
        if ( user.chars().filter( ch -> ch == '@' ).count() == 1 )
        {
            authInfo = securityServiceSupplier.get().authenticate( new EmailPasswordAuthToken( idProvider, user, password ) );
        }
        if ( !authInfo.isAuthenticated() )
        {
            authInfo = securityServiceSupplier.get().authenticate( new UsernamePasswordAuthToken( idProvider, user, password ) );
        }
        if ( !authInfo.isAuthenticated() )
        {
            return false;
        }

        final LocalScope localScope = ContextAccessor.current().getLocalScope();
        final Session session = localScope.getSession();
        if ( session != null )
        {
            // A new session prevents session fixation.
            final var attributes = session.getAttributes();
            session.invalidate();

            final Session newSession = localScope.getSession();
            if ( newSession != null )
            {
                attributes.forEach( newSession::setAttribute );
                newSession.setAttribute( authInfo );
                return true;
            }
        }
        localScope.setAttribute( authInfo );
        return true;
    }
}
