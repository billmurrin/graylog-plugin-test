package org.graylog.plugins.machinelearning.job.rest.models;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.google.auto.value.AutoValue;
import org.mongojack.ObjectId;

import javax.annotation.Nullable;

@AutoValue
public abstract class JobConfiguration {

    @JsonProperty("jobid")
    @ObjectId
    public abstract String jobid();

    @JsonProperty("field_name")
    @Nullable
    @ObjectId
    public abstract String fieldName();

    @JsonProperty("start_date")
    @ObjectId
    @Nullable
    public abstract String startDate();

    @JsonProperty("end_date")
    @ObjectId
    @Nullable
    public abstract String endDate();

    @JsonProperty("query_size")
    @ObjectId
    public abstract int querySize();

    @JsonProperty("elastic_index_name")
    @ObjectId
    public abstract String elasticIndexName();


    @JsonProperty("result_elastic_index_name")
    @ObjectId
    @Nullable
    public abstract String resultElasticIndexName();


    @JsonProperty("query_timestamp_field")
    @ObjectId
    @Nullable
    public abstract String queryTimestampField();

    @JsonCreator
    public static JobConfiguration create(@Nullable @JsonProperty("jobid") String jobid,
                                          @Nullable @JsonProperty("field_name") String fieldName,
                                          @Nullable @JsonProperty("end_date") String endDate,
                                          @Nullable @JsonProperty("start_date") String startDate,
                                          @Nullable @JsonProperty("query_size") int querySize,
                                          @Nullable @JsonProperty("elastic_index_name") String elasticIndexName,
                                          @Nullable @JsonProperty("query_timestamp_field") String queryTimestampField,
                                          @Nullable  @JsonProperty("result_elastic_index_name") String resultElasticIndexName
                                          ) {

        return new AutoValue_JobConfiguration(jobid,fieldName, startDate, endDate, querySize, elasticIndexName, queryTimestampField, resultElasticIndexName);
    }

}
