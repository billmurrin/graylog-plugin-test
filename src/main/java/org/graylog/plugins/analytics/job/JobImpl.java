package org.graylog.plugins.analytics.job;

import javax.annotation.Nullable;
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


    @JsonProperty("aggregationType")
    @Override
    @NotNull
    public abstract String getAggregationType();

    @JsonProperty("field")
    @Override
    @NotNull
    public abstract String getField();

    @JsonProperty("startDate")
    @Override
    @Nullable
    public abstract String getStartDate();


    @JsonProperty("endDate")
    @Override
    @Nullable
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

    @JsonProperty("luceneQuery")
    @Override
    @NotNull
    public abstract String getLuceneQuery();

    @JsonProperty("streamId")
    @Override
    @NotNull
    public abstract String getStreamId();



    @JsonProperty("streaming")
    @Override
    @Nullable
    public abstract Boolean getStreaming();


    @JsonProperty("description")
    @Override
    @Nullable
    public abstract String getDescription();

    @JsonCreator
    public static JobImpl create( @JsonProperty("aggregationType") String aggregationType,
                                  @JsonProperty("field") String field,
                                  @JsonProperty("startDate") String startDate,
                                  @JsonProperty("endDate") String endDate,
                                  @JsonProperty("streamName") String streamName,
                                  @JsonProperty("jobid") String  jobid,
                                  @JsonProperty("bucketSpan") String  bucketSpan,
                                  @JsonProperty("indexSetName") String  indexSetName,
                                  @JsonProperty("jobType") String  jobType,
                                  @JsonProperty("luceneQuery") String  luceneQuery,
                                  @JsonProperty("streamId") String  streamId,
                                  @JsonProperty("streaming") Boolean  streaming,
                                  @JsonProperty("description") String  description
                                  ) {
        return new AutoValue_JobImpl(aggregationType, field, startDate, endDate, streamName, jobid, bucketSpan, indexSetName, jobType, luceneQuery, streamId, streaming, description);
    }


}

