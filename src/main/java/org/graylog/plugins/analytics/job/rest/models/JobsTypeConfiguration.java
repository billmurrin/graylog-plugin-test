package org.graylog.plugins.analytics.job.rest.models;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.google.auto.value.AutoValue;
import org.mongojack.ObjectId;

@AutoValue
public abstract class JobsTypeConfiguration {


    @JsonProperty("job_type")
    @ObjectId
    public abstract String jobType();


    @JsonCreator
    public static JobsTypeConfiguration create(
            @JsonProperty("job_type") String jobType
    ){
        return new AutoValue_JobsTypeConfiguration(jobType);
    }

}
