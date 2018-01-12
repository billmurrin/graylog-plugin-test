package org.graylog.plugins.machinelearning.job.rest.models;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.google.auto.value.AutoValue;
import org.mongojack.ObjectId;

import javax.annotation.Nullable;

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
