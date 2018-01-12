package org.graylog.plugins.machinelearning.job.rest.models;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.google.auto.value.AutoValue;
import org.mongojack.ObjectId;

import javax.annotation.Nullable;

@AutoValue
public abstract class StartJobConfiguration {


    @JsonProperty("field")
    @ObjectId
    public abstract String field();

    @JsonProperty("jobid")
    @ObjectId
    public abstract String jobId();


    @JsonProperty("aggregationType")
    @ObjectId
    public abstract String aggregationType();


    @JsonProperty("bucketSpan")
    @ObjectId
    public abstract String bucketSpan();


    @JsonProperty("indexSetName")
    @ObjectId
    public abstract String indexSetName();

    @JsonProperty("sourceindextype")
    @ObjectId
    public abstract String sourceindextype();


    @JsonProperty("timestampfield")
    @ObjectId
    public abstract String timestampfield();



    @JsonProperty("anomaly_direction")
    @ObjectId
    public abstract String anomalyDirection();


    @JsonProperty("max_ratio_of_anomaly")
    @ObjectId
    public abstract String maxRatioOfAnomaly();

    @JsonProperty("alpha_parameter")
    @ObjectId
    public abstract String alphaParameter();


    @JsonProperty("host_port")
    @ObjectId
    @Nullable
    public abstract String hostPort();


    @JsonProperty("max_docs")
    @ObjectId
    @Nullable
    public abstract String maxDocs();

    @JsonProperty("streaming")
    @ObjectId
    @Nullable
    public abstract String streaming();

    @JsonProperty("query")
    @ObjectId
    public abstract String query();

    @JsonCreator
    public static StartJobConfiguration create(
            @JsonProperty("field") String field,
            @JsonProperty("jobid") String jobid,
            @JsonProperty("aggregationType") String aggregationType,
              @JsonProperty("bucketSpan") String bucketSpan,
            @JsonProperty("indexSetName") String indexSetName,
            @JsonProperty("sourceindextype") String sourceindextype,
            @JsonProperty("timestampfield") String timestampfield,
              @JsonProperty("anomaly_direction") String anomalyDirection,
            @JsonProperty("max_ratio_of_anomaly") String maxRatioOfAnomaly,
            @JsonProperty("alpha_parameter") String alphaParameter,
            @JsonProperty("host_port") String hostPort,
            @JsonProperty("max_docs") String maxDocs,
            @JsonProperty("streaming") String streaming,
            @JsonProperty("query") String query
    ){
        return new AutoValue_StartJobConfiguration(field,jobid, aggregationType, bucketSpan, indexSetName, sourceindextype, timestampfield,
                 anomalyDirection, maxRatioOfAnomaly, alphaParameter, hostPort , maxDocs, streaming, query);
    }

}
