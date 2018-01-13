package org.graylog.plugins.analytics.job;

import com.fasterxml.jackson.annotation.JsonAutoDetect;
import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.google.auto.value.AutoValue;

import javax.validation.constraints.NotNull;


@AutoValue
@JsonAutoDetect
@JsonIgnoreProperties(ignoreUnknown = true)
public abstract class StartJobImpl implements StartJob{



    @JsonProperty("field")
    @Override
    @NotNull
    public abstract String getField();

    @JsonProperty("bucketSpan")
    @Override
    @NotNull
    public abstract String getBucketSpan();



    @JsonCreator
    public static StartJobImpl create(
                                  @JsonProperty("field") String field,
                                  @JsonProperty("bucketSpan") String  bucketSpan
    ) {
        return new AutoValue_StartJobImpl(field, bucketSpan);
    }


}

