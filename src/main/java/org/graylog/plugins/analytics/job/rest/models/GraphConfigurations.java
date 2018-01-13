package org.graylog.plugins.analytics.job.rest.models;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.google.auto.value.AutoValue;
import org.mongojack.ObjectId;

import javax.annotation.Nullable;

@AutoValue
public abstract class GraphConfigurations {


    // TODO: 1/12/17 remove this
    @JsonProperty("jobid")
    @ObjectId
    @Nullable
    public abstract String jobid();

    @JsonProperty("field_name")
    @ObjectId
    public abstract String fieldName();
//
//    @JsonProperty("start_date")
//    @ObjectId
//    public abstract String startDate();
//
//    @JsonProperty("end_date")
//    @ObjectId
//    public abstract String endDate();

    @JsonProperty("query_size")
    @ObjectId
    public abstract int querySize();

    @JsonProperty("elastic_index_name")
    @ObjectId
    public abstract String elasticIndexName();



    @JsonProperty("time_stamp_field")
    @ObjectId
    public abstract String timeStampField();


    @JsonProperty("lucene_query")
    @ObjectId
    public abstract String luceneQuery();



    @JsonProperty("aggregation_type")
    @ObjectId
    public abstract String aggregationType();


    @JsonProperty("bucket_span")
    @ObjectId
    public abstract String bucketSpan();



    @JsonCreator
    public static GraphConfigurations create(
                                            @JsonProperty("jobid") String jobid,
                                            @JsonProperty("field_name") String fieldName,
                                             @JsonProperty("query_size") int querySize,
                                            @JsonProperty("elastic_index_name") String elasticIndexName,
                                            @JsonProperty("time_stamp_field") String timeStampField,
                                            @JsonProperty("lucene_query") String luceneQuery,
                                            @JsonProperty("aggregation_type") String aggregationType,
                                            @JsonProperty("bucket_span") String bucketSpan
                                            ){
        return new AutoValue_GraphConfigurations(jobid,fieldName, querySize, elasticIndexName, timeStampField , luceneQuery, aggregationType , bucketSpan);
    }

}
