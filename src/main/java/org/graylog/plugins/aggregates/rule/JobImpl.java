package org.graylog.plugins.aggregates.rule;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.annotation.Nullable;
import javax.validation.constraints.Min;
import javax.validation.constraints.NotNull;
import javax.ws.rs.DefaultValue;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import org.bson.types.ObjectId;
import org.graylog.plugins.aggregates.report.schedule.ReportSchedule;
import org.graylog2.database.CollectionName;
import org.graylog2.database.PersistedImpl;
import org.graylog2.indexer.rotation.strategies.MessageCountRotationStrategyConfig;
import org.graylog2.plugin.streams.Stream;
import org.graylog2.streams.StreamImpl;

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
    @JsonCreator
    public static JobImpl create( @JsonProperty("aggrigationType") String aggrigationType,
                                  @JsonProperty("field") String field,
                                  @JsonProperty("startDate") String startDate,
                                  @JsonProperty("endDate") String endDate,
                                  @JsonProperty("streamName") String streamName,
                                  @JsonProperty("jobid") String  jobid
                                   ) {
        return new AutoValue_JobImpl(aggrigationType, field, startDate, endDate, streamName, jobid);
    }


}

