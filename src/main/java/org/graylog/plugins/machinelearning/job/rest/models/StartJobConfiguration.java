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

    @JsonProperty("host_ip")
    @ObjectId
    @Nullable
    public abstract String hostIp();


    @JsonProperty("jobid")
    @ObjectId
    public abstract String jobId();


    @JsonProperty("aggregationType")
    @ObjectId
    public abstract String aggregationType();

    @JsonProperty("endDate")
    @ObjectId
    @Nullable
    public abstract String endDate();

    @JsonProperty("startDate")
    @ObjectId
    public abstract String startDate();

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

    @JsonProperty("anom_index")
    @ObjectId
    public abstract String anomIndex();

    @JsonProperty("anom_type")
    @ObjectId
    public abstract String anomType();

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

    @JsonCreator
    public static StartJobConfiguration create(
            @JsonProperty("field") String field,
            @JsonProperty("host_ip") String hostIp,
            @JsonProperty("jobid") String jobid,
            @JsonProperty("aggregationType") String aggregationType,
            @JsonProperty("endDate") String endDate,
            @JsonProperty("startDate") String startDate,
            @JsonProperty("bucketSpan") String bucketSpan,
            @JsonProperty("indexSetName") String indexSetName,
            @JsonProperty("sourceindextype") String sourceindextype,
            @JsonProperty("timestampfield") String timestampfield,
            @JsonProperty("anom_index") String anomIndex,
            @JsonProperty("anom_type") String anomType,
            @JsonProperty("anomaly_direction") String anomalyDirection,
            @JsonProperty("max_ratio_of_anomaly") String maxRatioOfAnomaly,
            @JsonProperty("alpha_parameter") String alphaParameter,
            @JsonProperty("host_port") String hostPort,
            @JsonProperty("max_docs") String maxDocs,
            @JsonProperty("streaming") String streaming
    ){
        return new AutoValue_StartJobConfiguration(field, hostIp,jobid, aggregationType,endDate, startDate, bucketSpan, indexSetName, sourceindextype, timestampfield,
                anomIndex, anomType, anomalyDirection, maxRatioOfAnomaly, alphaParameter, hostPort , maxDocs, streaming);
    }

}
