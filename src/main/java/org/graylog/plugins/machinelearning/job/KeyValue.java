package org.graylog.plugins.machinelearning.job;

import com.fasterxml.jackson.annotation.JsonAutoDetect;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.google.auto.value.AutoValue;

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
