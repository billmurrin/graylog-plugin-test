package org.graylog.plugins.machinelearning.job.rest;

import com.codahale.metrics.annotation.Timed;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.google.common.collect.Maps;
import com.google.common.collect.Sets;
import com.mongodb.MongoException;
import io.searchbox.client.JestClient;
import io.searchbox.core.Search;
import io.searchbox.core.search.aggregation.*;
import io.searchbox.core.search.sort.Sort;
import io.searchbox.params.SearchType;
import io.swagger.annotations.*;
import org.apache.shiro.authz.annotation.RequiresAuthentication;
import org.elasticsearch.action.support.QuerySourceBuilder;
import org.elasticsearch.index.query.*;
import org.elasticsearch.search.aggregations.AggregationBuilders;
import org.elasticsearch.search.aggregations.bucket.filter.FilterAggregationBuilder;
import org.elasticsearch.search.aggregations.bucket.histogram.DateHistogramBuilder;
import org.elasticsearch.search.aggregations.bucket.histogram.DateHistogramInterval;
import org.elasticsearch.search.aggregations.bucket.histogram.Histogram;
import org.elasticsearch.search.builder.SearchSourceBuilder;
import org.elasticsearch.search.sort.SortOrder;
import org.graylog.plugins.machinelearning.job.JobServiceImpl;
import org.graylog.plugins.machinelearning.job.rest.models.GraphConfigurations;
import org.graylog.plugins.machinelearning.job.rest.models.JobConfiguration;
import org.graylog2.Configuration;
import org.graylog2.indexer.ElasticsearchException;
import org.graylog2.indexer.IndexHelper;
import org.graylog2.indexer.IndexNotFoundException;
import org.graylog2.indexer.cluster.jest.JestUtils;
import org.graylog2.indexer.results.ResultMessage;
import org.graylog2.indexer.results.SearchResult;
import org.graylog2.indexer.results.TermsResult;
import org.graylog2.indexer.results.TermsStatsResult;
import org.graylog2.indexer.searches.IndexRangeStats;
import org.graylog2.indexer.searches.Searches;
import org.graylog2.indexer.searches.SearchesConfig;
import org.graylog2.plugin.Message;
import org.graylog2.plugin.indexer.searches.timeranges.AbsoluteRange;
import org.graylog2.plugin.indexer.searches.timeranges.TimeRange;
import org.graylog2.plugin.rest.PluginRestResource;
import org.graylog2.shared.rest.resources.RestResource;

import javax.annotation.Nullable;
import javax.inject.Inject;
import javax.validation.Valid;
import javax.validation.constraints.NotNull;
import javax.ws.rs.*;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

import org.joda.time.DateTime;
import org.joda.time.DateTimeZone;
import org.joda.time.format.DateTimeFormat;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.UnsupportedEncodingException;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.stream.Collectors;
import static com.google.common.base.Strings.isNullOrEmpty;
import static org.elasticsearch.index.query.QueryBuilders.matchAllQuery;
import static org.elasticsearch.index.query.QueryBuilders.queryStringQuery;
import static org.elasticsearch.index.query.QueryBuilders.scriptQuery;
import static org.elasticsearch.search.builder.SearchSourceBuilder.searchSource;

@Api(value = "Machinelearning", description = " Machinelearning rest service. Job result qurying")
@Path("/jobs")
@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
public class JobResource extends RestResource implements PluginRestResource {
    private final Configuration conf;
    private final JestClient jestClient;
    private static final Logger LOG = LoggerFactory.getLogger(JobServiceImpl.class);

    @Inject
    public JobResource(Configuration conf, JestClient jestClient) {
        this.conf= conf;
        this.jestClient = jestClient;
    }


//
//{
//       "jobid": "dfddf",
//        "result_elastic_index_name": "anomaly_result_new",
//        "start_date": "2015-01-01 18:00:00",
//        "end_date": "2018-01-01 18:00:00",
//        "field_name": "anomaly_result_new",
//        "query_size": 1212,
//        "elastic_index_name": "anomaly_result_new"
//
//
//}
//


    @POST
    @Path("/getjobDetails")
    @RequiresAuthentication
    @ApiOperation(value = "get fields of index")
    @ApiResponses(value = {
            @ApiResponse(code = 404, message = "job not found."),
    })
    public Response getData(@ApiParam(name = "JSON body", required = true)
                            @Valid @NotNull JobConfiguration obj
    ) throws NotFoundException, MongoException, UnsupportedEncodingException {
        try {

            String query= "jobid:"+obj.jobid();

            if (query == null || query.trim().isEmpty()) {
                query = "*";
            }
            final QueryBuilder queryBuilder;
            if ("*".equals(query.trim())) {
                queryBuilder = matchAllQuery();
            } else {
                queryBuilder = queryStringQuery(query).allowLeadingWildcard(conf.isAllowLeadingWildcardSearches());
            }

            final String q = searchSource().query(QueryBuilders.boolQuery().must(queryBuilder)).size( 10000).toString();
            final Search request = new Search.Builder(q)
                    .addIndex( obj.elasticIndexName())
                    .setSearchType(SearchType.DFS_QUERY_THEN_FETCH)
                    .ignoreUnavailable(true)
                    .build();
            LOG.info("query"+ q.toString());
            final io.searchbox.core.SearchResult result = JestUtils.execute(jestClient, request, () -> "Couldn't build index range of index " +  obj.elasticIndexName());
            return Response.accepted(result.getJsonObject()).build();
        }
        catch (Exception e) {
            e.printStackTrace();
            return Response.serverError().build();
        }
    }



    @POST
    @Path("/fields/{indexName}")
    @RequiresAuthentication
    @ApiOperation(value = "Delete a job")
    @ApiResponses(value = {
            @ApiResponse(code = 404, message = "job not found."),
    })
    public Response getFields(@ApiParam(name = "indexName", required = true)
                              @PathParam("indexName") String indexName
    ) throws NotFoundException, MongoException, UnsupportedEncodingException {
        try {
            final String query = searchSource().query(QueryBuilders.matchAllQuery())
                    .toString();
            final Search request = new Search.Builder(query)
                    .addIndex(indexName)
                    .setSearchType(SearchType.DFS_QUERY_THEN_FETCH)
                    .ignoreUnavailable(true)
                    .build();
            final io.searchbox.core.SearchResult result = JestUtils.execute(jestClient, request, () -> "Couldn't build index range of index " + indexName);
            final List<ResultMessage> hits = result.getHits(Map.class, false).stream()
                    .map(hit -> ResultMessage.parseFromSource(hit.id, hit.index, (Map<String, Object>)hit.source))
                    .collect(Collectors.toList());
            Set<String> filteredFields = Sets.newHashSet();
            hits.forEach(hit -> {
                final Message message = hit.getMessage();
                for (String field : message.getFieldNames()) {

                    try {
                        Double.parseDouble(hit.getMessage().getField(field).toString());

                        if (!Message.FILTERED_FIELDS.contains(field)) {
                            filteredFields.add(field);
                        }
                    }
                    catch (Exception e) {
                        e.printStackTrace();
                    }
                }
            });
            return Response.accepted(filteredFields).build();
        }
        catch (Exception e) {
            return Response.serverError().build();
        }
    }



//    {
//            "jobid": "dfddf",
//            "elastic_index_name": "server-metrics",
//            "start_date": "2015-01-01 18:00:00",
//            "end_date": "2018-01-01 18:00:00",
//            "field_name": "response",
//            "query_size": 1212,
//            "time_stamp_field":"@timestamp"
//
//
//    }
//


    public  DateHistogramInterval getInterval(String interval) {

        switch (interval) {
            case "5m":
            return DateHistogramInterval.minutes(5);
            case "15m":
                return DateHistogramInterval.minutes(15);
            case "30m":
                return DateHistogramInterval.minutes(30);
            case "1h":
                return DateHistogramInterval.hours(1);
            case "3h":
                return DateHistogramInterval.hours(3);
            case "6h":
                return DateHistogramInterval.hours(6);
            case "12h":
                return DateHistogramInterval.hours(12);
            case "1d":
                return DateHistogramInterval.days(1);
            case "7d":
                return DateHistogramInterval.days(7);
        }
        return  null;
    }


    @POST
    @Path("/graph/search")
    @RequiresAuthentication
    @ApiOperation(value = "Delete a job")
    @ApiResponses(value = {
            @ApiResponse(code = 404, message = "job not found."),
    })
    public Response getDataString(@ApiParam(name = "JSON body", required = true)
                                  @Valid @NotNull GraphConfigurations obj
    ) throws ElasticsearchException {
        try {
            final DateHistogramBuilder dateHistogramBuilder = AggregationBuilders.dateHistogram("gl2_histogram").order(Histogram.Order.KEY_DESC)
                    .field(obj.timeStampField())
                    .subAggregation(AggregationBuilders.stats("gl2_stats").field(obj.fieldName()))
                    .interval(getInterval(obj.bucketSpan()));

//            final DateHistogramBuilder dateHistogramBuilder = AggregationBuilders.dateHistogram("gl2_histogram").order(Histogram.Order.KEY_DESC)
//                    .field(obj.timeStampField())
//                    .subAggregation(AggregationBuilders.stats("gl2_stats").field(obj.fieldName()))
//                    .interval(Searches.DateHistogramInterval.HOUR .toESInterval());
//            RangeQueryBuilder queryDate = QueryBuilders.rangeQuery(obj.timeStampField()).to(obj.endDate()).from(obj.startDate());


            String queryString = "";
            if (obj.luceneQuery() != null && !obj.luceneQuery().isEmpty()) {
                queryString = obj.luceneQuery();

            }else {
                queryString ="*";
            }
            final FilterAggregationBuilder builder = AggregationBuilders.filter("agg").filter(QueryBuilders.queryStringQuery(queryString))
                                                    .subAggregation(dateHistogramBuilder)
                                                    .subAggregation(AggregationBuilders.avg("ts_min").field(obj.fieldName()));
            final String query = searchSource().aggregation(builder).toString();

            LOG.info("query"+ query);
            LOG.info("obj.elasticIndexName()"+ obj.elasticIndexName());
            final Search request = new Search.Builder(query)
                    .addIndex(obj.elasticIndexName())
                    .setSearchType(SearchType.DFS_QUERY_THEN_FETCH)
                    .ignoreUnavailable(true)
                    .build();

            final io.searchbox.core.SearchResult result = JestUtils.execute(jestClient, request, () -> "Couldn't build index range of index " + obj.elasticIndexName());

            final FilterAggregation filterAggregation =  result.getAggregations().getFilterAggregation("agg");
            List<Map<String, Object>> terms;

            terms = filterAggregation.getTermsAggregation("gl2_histogram").getBuckets().stream()
                    .map(e -> {

                        final Map<String, Object> resultMap = Maps.newHashMap();
                        resultMap.put("key_field", e.getKey());
                        resultMap.put("date", e.getKeyAsString());
                        resultMap.put("count", e.getCount());
                        final StatsAggregation stats = e.getStatsAggregation(Searches.AGG_STATS);
                        resultMap.put("price", stats.getMin());
                        resultMap.put("min", stats.getMin());
                        resultMap.put("max", stats.getMax());
                        resultMap.put("total", stats.getSum());
                        resultMap.put("total_count", stats.getCount());
                        resultMap.put("mean", stats.getAvg());
                        return resultMap;
                    }).collect(Collectors.toList());

            LOG.info("total size feached"+ terms.size());
            return Response.accepted(terms).build();
        }
        catch (Exception e) {
            e.printStackTrace();
            return Response.serverError().build();
        }
    }

}