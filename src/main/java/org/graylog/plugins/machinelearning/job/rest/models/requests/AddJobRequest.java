package org.graylog.plugins.machinelearning.job.rest.models.requests;

import com.fasterxml.jackson.annotation.JsonAutoDetect;
import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.google.auto.value.AutoValue;
import org.graylog.plugins.machinelearning.job.Job;
import org.graylog.plugins.machinelearning.job.JobImpl;

import javax.validation.Valid;
import javax.validation.constraints.NotNull;

@AutoValue
@JsonAutoDetect
public abstract class AddJobRequest {

    @JsonProperty("job")
    @NotNull
    public abstract Job getJob();

    @JsonCreator
    public static AddJobRequest create(//@JsonProperty("name") @Valid String name,
                                        @JsonProperty("job") @Valid JobImpl job

    ) {
        return new AutoValue_AddJobRequest(job);
    }
}
