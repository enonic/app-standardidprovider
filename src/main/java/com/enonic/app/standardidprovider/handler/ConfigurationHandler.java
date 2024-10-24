package com.enonic.app.standardidprovider.handler;

import java.util.function.Supplier;

import com.enonic.xp.script.bean.BeanContext;
import com.enonic.xp.script.bean.ScriptBean;

public class ConfigurationHandler
    implements ScriptBean
{
    private Supplier<StandardProviderConfigService> configServiceSupplier;

    @Override
    public void initialize( final BeanContext beanContext )
    {
        this.configServiceSupplier = beanContext.getService( StandardProviderConfigService.class );
    }

    public boolean isLoginWithoutUserEnabled()
    {
        return configServiceSupplier.get().isLoginWithoutUserEnabled();
    }
}
