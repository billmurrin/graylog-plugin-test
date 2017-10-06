package org.graylog.plugins.aggregates.rule;

import com.fasterxml.jackson.annotation.JsonAutoDetect;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.google.auto.value.AutoValue;
import org.graylog2.indexer.rotation.strategies.MessageCountRotationStrategyConfig;

import java.util.List;
import java.util.Map;

@JsonAutoDetect
@AutoValue
public abstract class KeyValue
{
    @JsonProperty("key")
    public abstract String getKey();

    @JsonProperty("value")
    public abstract String getValue();

    public static KeyValue create( @JsonProperty("key") String key,
                                  @JsonProperty("value") String value) {
        return new AutoValue_KeyValue(key, value);
    }
}
