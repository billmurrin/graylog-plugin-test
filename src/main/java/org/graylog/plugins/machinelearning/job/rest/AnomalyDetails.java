package org.graylog.plugins.machinelearning.job.rest;

import io.searchbox.client.JestClient;
import io.searchbox.core.Search;
import io.searchbox.params.SearchType;
import io.swagger.annotations.*;
import net.minidev.json.JSONObject;
import org.apache.http.HttpResponse;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClientBuilder;
import org.apache.http.util.EntityUtils;
import org.apache.shiro.authz.annotation.RequiresAuthentication;
import org.elasticsearch.index.query.QueryBuilder;
import org.elasticsearch.index.query.QueryBuilders;
import org.elasticsearch.search.aggregations.bucket.terms.Terms;
import org.elasticsearch.search.sort.SortOrder;
import org.graylog.plugins.machinelearning.job.JobServiceImpl;
import org.graylog.plugins.machinelearning.job.rest.models.StartJobConfiguration;
import org.graylog2.Configuration;
import org.graylog2.configuration.ElasticsearchClientConfiguration;
import org.graylog2.indexer.cluster.jest.JestUtils;
import org.graylog2.plugin.rest.PluginRestResource;
import org.graylog2.shared.rest.resources.RestResource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.inject.Inject;
import javax.validation.Valid;
import javax.validation.constraints.NotNull;
import javax.ws.rs.*;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import java.util.List;
import java.util.stream.Collectors;

import static org.elasticsearch.index.query.QueryBuilders.matchAllQuery;
import static org.elasticsearch.index.query.QueryBuilders.queryStringQuery;
import static org.elasticsearch.search.builder.SearchSourceBuilder.searchSource;


@Api(value = "Machinelearning", description = " Machinelearning rest service for AnomalyJobs")
@Path("/getjobdetails")
@Produces(MediaType.APPLICATION_JSON)
public class AnomalyDetails extends RestResource implements PluginRestResource {
    private final Configuration conf;
    private final JestClient jestClient;
    private static final Logger LOG = LoggerFactory.getLogger(JobServiceImpl.class);
    private final ElasticsearchClientConfiguration elasticConfiguration;


    @Inject
    public AnomalyDetails(final  ElasticsearchClientConfiguration  elasticConfiguration, Configuration conf, JestClient jestClient) {
        this.conf= conf;
        this.jestClient = jestClient;
        this.elasticConfiguration= elasticConfiguration;
    }



    @POST
    @Path("/anomaly/{jobid}")
    @RequiresAuthentication
    @ApiOperation(value = "get anomaly details")
    @ApiResponses(value = {
            @ApiResponse(code = 404, message = "job not found."),
    })
    public Response getJobDetails(@ApiParam(name = "jobid", required = true)
                                      @PathParam("jobid") String jobid){
        try {

            String query= "jobid:"+"metricbeat3";

            if (query == null || query.trim().isEmpty()) {
                query = "*";
            }
            final QueryBuilder queryBuilder;
            if ("*".equals(query.trim())) {
                queryBuilder = matchAllQuery();
            } else {
                queryBuilder = queryStringQuery(query).allowLeadingWildcard(conf.isAllowLeadingWildcardSearches());
            }

            final String q = searchSource().query(QueryBuilders.boolQuery().must(queryBuilder)).size( 10000).sort("timestamp", SortOrder.DESC).toString();
            final Search request = new Search.Builder(q)
                    .addIndex( "anomaly_result_*")
                    .setSearchType(SearchType.DFS_QUERY_THEN_FETCH)
                    .ignoreUnavailable(true)
                    .build();
            LOG.info("query"+ q.toString());
            final io.searchbox.core.SearchResult result = JestUtils.execute(jestClient, request, () -> "Couldn't build index range of index " +  "anomaly_result_*");
            return Response.accepted(result.getJsonObject()).build();
        }
        catch (Exception e) {
            e.printStackTrace();
            return Response.serverError().build();
        }
    }
}