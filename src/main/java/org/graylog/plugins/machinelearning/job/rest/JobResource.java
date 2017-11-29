package org.graylog.plugins.machinelearning.job.rest;

import com.codahale.metrics.annotation.Timed;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.google.common.collect.Maps;
import com.mongodb.MongoException;
import io.searchbox.client.JestClient;
import io.searchbox.core.Search;
import io.searchbox.core.search.aggregation.*;
import io.searchbox.params.SearchType;
import io.swagger.annotations.*;
import org.apache.shiro.authz.annotation.RequiresAuthentication;
import org.elasticsearch.index.query.QueryBuilders;
import org.elasticsearch.search.aggregations.AggregationBuilders;
import org.elasticsearch.search.aggregations.bucket.filter.FilterAggregationBuilder;
import org.elasticsearch.search.aggregations.bucket.histogram.DateHistogramBuilder;
import org.graylog2.Configuration;
import org.graylog2.indexer.IndexNotFoundException;
import org.graylog2.indexer.cluster.jest.JestUtils;
import org.graylog2.indexer.results.SearchResult;
import org.graylog2.indexer.results.TermsResult;
import org.graylog2.indexer.results.TermsStatsResult;
import org.graylog2.indexer.searches.IndexRangeStats;
import org.graylog2.indexer.searches.Searches;
import org.graylog2.indexer.searches.SearchesConfig;
import org.graylog2.plugin.Message;
import org.graylog2.plugin.indexer.searches.timeranges.AbsoluteRange;
import org.graylog2.plugin.rest.PluginRestResource;
import org.graylog2.shared.rest.resources.RestResource;
import javax.inject.Inject;
import javax.ws.rs.*;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

import org.joda.time.DateTime;
import org.joda.time.DateTimeZone;

import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;

import static java.util.stream.Collectors.toList;
import static org.elasticsearch.search.builder.SearchSourceBuilder.searchSource;
import static org.joda.time.DateTimeZone.UTC;

@Api(value = "Machinelearning", description = " Machinelearning rest service.")
@Path("/jobs")
@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
public class JobResource extends RestResource implements PluginRestResource {
    private final Searches searches;
    private final Configuration conf;
    private final JestClient jestClient;

    @Inject
    public JobResource(Searches searches, Configuration conf, JestClient jestClient) {
        this.searches= searches;
        this.conf= conf;
        this.jestClient = jestClient;


    }


    @POST
    @Path("/{jobid}")
    @RequiresAuthentication
    @ApiOperation(value = "get fields of index")
    @ApiResponses(value = {
            @ApiResponse(code = 404, message = "job not found."),
    })
    public Response getData(@ApiParam(name = "jobid", required = true)
                           @PathParam("jobid") String jobid
    ) throws NotFoundException, MongoException, UnsupportedEncodingException {
        try {

             final AbsoluteRange range1 = AbsoluteRange.create("2015-01-01 18:00:00", "2018-01-01 18:00:00");

            final SearchesConfig config = SearchesConfig.builder()
                    .query("jobid:"+jobid)
                    .index("anomaly_result_new")
                    .range(range1)
                    .limit(10000)
                    .offset(0)
                    .build();
            JsonNode result = searches.searchWithSingleIndex(config);
            return Response.accepted(result).build();
        }
        catch (Exception e) {
            return Response.serverError().build();
        }
    }

    private static final Comparator<Map<String, Object>> COMPARATOR = (o1, o2) -> {
        double o1Mean = (double) o1.get("mean");
        double o2Mean = (double) o2.get("mean");
        if (o1Mean > o2Mean) {
            return -1;
        } else if (o1Mean < o2Mean) {
            return 1;
        }
        return 0;
    };

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
            final AbsoluteRange range1 = AbsoluteRange.create("2015-01-01 18:00:00", "2018-01-01 18:00:00");

            final SearchesConfig config = SearchesConfig.builder()
                    .query("*")
                    .index(indexName)
                    .range(range1)
                    .limit(10000)
                    .offset(0)
                    .build();

            SearchResult result = searches.searchFields(config);
            return Response.accepted(result.getFieldsn()).build();
        }
        catch (Exception e) {
            return Response.serverError().build();
        }
    }

    @POST
    @Path("/fields/cvc")
    @RequiresAuthentication
    @ApiOperation(value = "Delete a job")
    @ApiResponses(value = {
            @ApiResponse(code = 404, message = "job not found."),
    })
    public Response getDataString(@ApiParam(name = "indexName", required = true)
                              @PathParam("indexName") String indexName
    ) throws NotFoundException, MongoException, UnsupportedEncodingException {
        try {
            final AbsoluteRange range1 = AbsoluteRange.create("2015-01-01 18:00:00", "2018-01-01 18:00:00");

//            TermsResult resultTest = searches.terms("metricbeat_system_filesystem_total", 100, "*", range1);



            final DateHistogramBuilder dateHistogramBuilder = AggregationBuilders.dateHistogram("gl2_histogram")
                    .field("@timestamp")
                    .subAggregation(AggregationBuilders.stats("gl2_stats").field("response"))
                    .interval(Searches.DateHistogramInterval.HOUR.toESInterval());
            final FilterAggregationBuilder builder = AggregationBuilders.filter("agg")
                    .filter(QueryBuilders.matchAllQuery())
                    .subAggregation(dateHistogramBuilder)
                    .subAggregation(AggregationBuilders.avg("ts_min").field("response"));

            final String query = searchSource()
                    .aggregation(builder)
                    .size(100)
                    .toString();
            System.out.println(query + "**********************8");

            final Search request = new Search.Builder(query)
                    .addIndex("server-metrics")
                    .setSearchType(SearchType.DFS_QUERY_THEN_FETCH)
                    .ignoreUnavailable(true)
                    .build();

            final io.searchbox.core.SearchResult result = JestUtils.execute(jestClient, request, () -> "Couldn't build index range of index " + indexName);
            final FilterAggregation filterAggregation =  result.getAggregations().getFilterAggregation("agg");
                List<Map<String, Object>> terms;
                    System.out.println(filterAggregation.getTermsAggregation("gl2_histogram").getBuckets()+ "buckets");
            terms = filterAggregation.getTermsAggregation("gl2_histogram").getBuckets().stream()
                    .map(e -> {
                        final Map<String, Object> resultMap = Maps.newHashMap();

                        resultMap.put("key_field", e.getKey());

                        resultMap.put("count", e.getCount());

                        final StatsAggregation stats = e.getStatsAggregation(Searches.AGG_STATS);
                        resultMap.put("min", stats.getMin());
                        resultMap.put("max", stats.getMax());
                        resultMap.put("total", stats.getSum());
                        resultMap.put("total_count", stats.getCount());
                        resultMap.put("mean", stats.getAvg());

                        return resultMap;
                    }).sorted(COMPARATOR)
                    .collect(Collectors.toList());
            return Response.accepted(terms).build();
        }
        catch (Exception e) {
            e.printStackTrace();
            return Response.serverError().build();
        }
    }
}