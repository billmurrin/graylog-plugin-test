package org.graylog.plugins.analytics;

import org.graylog2.plugin.PluginMetaData;
import org.graylog2.plugin.ServerStatus;
import org.graylog2.plugin.Version;

import java.net.URI;
import java.util.Collections;
import java.util.Set;

/**
 * Implement the PluginMetaData interface here.
 */
public class MachinelearningMetaData implements PluginMetaData {
    @Override
    public String getUniqueId() {
        return "org.graylog.plugins.analytics.AnalyticsPlugin";
    }

    @Override
    public String getName() {
        return "Analytics";
    }

    @Override
    public String getAuthor() {
        return "Manju";
    }

    @Override
    public URI getURL() {
        return URI.create("https://github.com/cvtienhoven/graylog-plugin-machinelearning");
    }

    @Override
    public Version getVersion() {
        return new Version(1, 0, 0);
    }

    @Override
    public String getDescription() {
        return "SmartThink Analytics plugin";
    }

    @Override
    public Version getRequiredVersion() {
        return new Version(2, 0, 0);
    }

    @Override
    public Set<ServerStatus.Capability> getRequiredCapabilities() {
        return Collections.emptySet();
    }
}
