package org.graylog.plugins.machinelearning.job;

import javax.validation.constraints.NotNull;

import org.graylog2.database.CollectionName;

import com.fasterxml.jackson.annotation.JsonAutoDetect;
import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import com.google.auto.value.AutoValue;

@AutoValue
@JsonAutoDetect
@JsonIgnoreProperties(ignoreUnknown = true)
@CollectionName("job_config")
public abstract class JobImpl implements Job{


    @JsonProperty("aggrigationType")
    @Override
    @NotNull
    public abstract String getAggrigationType();

    @JsonProperty("field")
    @Override
    @NotNull
    public abstract String getField();

    @JsonProperty("startDate")
    @Override
    @NotNull
    public abstract String getStartDate();


    @JsonProperty("endDate")
    @Override
    @NotNull
    public abstract String getEndDate();


    @JsonProperty("streamName")
    @Override
    @NotNull
    public abstract String getStreamName();


    @JsonProperty("jobid")
    @Override
    @NotNull
    public abstract String getJobid();


    @JsonProperty("bucketSpan")
    @Override
    @NotNull
    public abstract String getBucketSpan();


    @JsonProperty("indexSetName")
    @Override
    @NotNull
    public abstract String getIndexSetName();


    @JsonProperty("jobType")
    @Override
    @NotNull
    public abstract String getJobType();

    @JsonCreator
    public static JobImpl create( @JsonProperty("aggrigationType") String aggrigationType,
                                  @JsonProperty("field") String field,
                                  @JsonProperty("startDate") String startDate,
                                  @JsonProperty("endDate") String endDate,
                                  @JsonProperty("streamName") String streamName,
                                  @JsonProperty("jobid") String  jobid,
                                  @JsonProperty("bucketSpan") String  bucketSpan,
                                  @JsonProperty("indexSetName") String  indexSetName,
                                  @JsonProperty("jobType") String  jobType
                                  ) {
        return new AutoValue_JobImpl(aggrigationType, field, startDate, endDate, streamName, jobid, bucketSpan, indexSetName, jobType);
    }


}

