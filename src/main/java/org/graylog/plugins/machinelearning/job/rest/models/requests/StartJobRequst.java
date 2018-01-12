package org.graylog.plugins.machinelearning.job.rest.models.requests;

import com.fasterxml.jackson.annotation.JsonAutoDetect;
import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.google.auto.value.AutoValue;

import javax.validation.Valid;
import javax.validation.constraints.NotNull;

@AutoValue
@JsonAutoDetect
public abstract class StartJobRequst {

    @JsonProperty("startjob")
    @NotNull
    public abstract StartJobRequst getstartJob();

    @JsonCreator
    public static StartJobRequst create(//@JsonProperty("name") @Valid String name,
                                       @JsonProperty("startjob") @Valid StartJobRequst startJobRequst

    ) {
        return new AutoValue_StartJobRequst(startJobRequst);
    }
}



