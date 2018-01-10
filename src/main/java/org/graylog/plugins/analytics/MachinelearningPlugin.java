package org.graylog.plugins.analytics;

import org.graylog2.plugin.Plugin;
import org.graylog2.plugin.PluginMetaData;
import org.graylog2.plugin.PluginModule;

import java.util.Collection;
import java.util.Collections;

/**
 * Implement the Plugin interface here.
 */
public class MachinelearningPlugin implements Plugin {
    @Override
    public PluginMetaData metadata() {
        return new MachinelearningMetaData();
    }

    @Override
    public Collection<PluginModule> modules () {
        return Collections.<PluginModule>singletonList(new MachinelearningModule());
    }
}
