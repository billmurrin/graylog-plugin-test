package org.graylog.plugins.machinelearning.job.rest.models.responses;

import com.fasterxml.jackson.annotation.JsonAutoDetect;
import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.google.auto.value.AutoValue;
import org.graylog.plugins.machinelearning.job.Job;

import java.util.List;


@AutoValue
@JsonAutoDetect
public abstract class JobList {

    @JsonProperty
    public abstract List<Job> getJobs();

    @JsonCreator
    public static JobList create(@JsonProperty("jobs") List<Job> jobs) {
        return new AutoValue_JobList(jobs);
    }

}
