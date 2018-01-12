package org.graylog.plugins.machinelearning.job.rest;

import com.google.common.collect.Maps;
import com.google.common.collect.Sets;
import com.mongodb.MongoException;
import io.searchbox.client.JestClient;
import io.searchbox.core.Search;
import io.searchbox.core.search.aggregation.FilterAggregation;
import io.searchbox.core.search.aggregation.StatsAggregation;
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
import org.elasticsearch.search.aggregations.AggregationBuilders;
import org.elasticsearch.search.aggregations.bucket.filter.FilterAggregationBuilder;
import org.elasticsearch.search.aggregations.bucket.histogram.DateHistogramBuilder;
import org.elasticsearch.search.aggregations.bucket.histogram.DateHistogramInterval;
import org.elasticsearch.search.aggregations.bucket.histogram.Histogram;
import org.graylog.plugins.machinelearning.job.JobServiceImpl;
import org.graylog.plugins.machinelearning.job.rest.models.GraphConfigurations;
import org.graylog.plugins.machinelearning.job.rest.models.JobConfiguration;
import org.graylog.plugins.machinelearning.job.rest.models.StartJobConfiguration;
import org.graylog2.Configuration;
import org.graylog2.configuration.ElasticsearchClientConfiguration;
import org.graylog2.indexer.ElasticsearchException;
import org.graylog2.indexer.cluster.jest.JestUtils;
import org.graylog2.indexer.results.ResultMessage;
import org.graylog2.indexer.searches.Searches;
import org.graylog2.plugin.Message;
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
import java.io.UnsupportedEncodingException;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import static org.elasticsearch.index.query.QueryBuilders.matchAllQuery;
import static org.elasticsearch.index.query.QueryBuilders.queryStringQuery;
import static org.elasticsearch.search.builder.SearchSourceBuilder.searchSource;

@Api(value = "Machinelearning", description = " Machinelearning rest service for AnomalyJobs")
@Path("/startjob")
@Produces(MediaType.APPLICATION_JSON)
public class AnomalyJob extends RestResource implements PluginRestResource {
    private final Configuration conf;
    private final JestClient jestClient;
    private static final Logger LOG = LoggerFactory.getLogger(JobServiceImpl.class);
    private final ElasticsearchClientConfiguration elasticConfiguration;


    @Inject
    public AnomalyJob(final  ElasticsearchClientConfiguration  elasticConfiguration, Configuration conf, JestClient jestClient) {
        this.conf= conf;
        this.jestClient = jestClient;
        this.elasticConfiguration= elasticConfiguration;
    }



    @POST
    @Path("/anomaly")
    @RequiresAuthentication
    @ApiOperation(value = "start anomaly jobs")
    @ApiResponses(value = {
            @ApiResponse(code = 404, message = "job not found."),
    })
    public Response startJob(
            @ApiParam(name = "JSON body", required = true)
            @Valid @NotNull StartJobConfiguration obj
    ){

        try {

            final List<String> hosts = elasticConfiguration.getElasticsearchHosts().stream()
                    .map(hostUri -> {
                        return hostUri.toString();
                    })
                    .collect(Collectors.toList());
            JSONObject json = new JSONObject();
            json.put("jobid", obj.jobId());
            json.put("aggregationType", obj.aggregationType());
            json.put("field", obj.field());
            json.put("elastic_url", hosts.get(0));

            json.put("indexSetName" , obj.indexSetName());
            json.put("sourceindextype" , obj.sourceindextype());

            json.put("bucketSpan" , obj.bucketSpan());
            json.put("timestampfield" , obj.timestampfield());
            json.put("max_docs" , obj.maxDocs());
            json.put("anomaly_direction" , obj.anomalyDirection() );
            json.put("max_ratio_of_anomaly" , obj.maxRatioOfAnomaly());
            json.put("alpha_parameter" , obj.alphaParameter());
            json.put("gelf_url", "localhost:12201/gelf");
            json.put("streaming" , "F");
            json.put("query" , obj.query());

            CloseableHttpClient httpClient = HttpClientBuilder.create().build();
            System.out.println(json.toJSONString().toString()+ "json string");
            LOG.info(json.toJSONString().toString()+ "data");
            LOG.debug(json.toJSONString().toString()+ "data");

            try {
                HttpPost request = new HttpPost("http://localhost:8004/ocpu/library/smartthink/R/smartanomaly/json");
                StringEntity params = new StringEntity(json.toString());
                request.addHeader("content-type", "application/json");
                request.setEntity(params);
                HttpResponse result = httpClient.execute(request);

                String json1 = EntityUtils.toString(result.getEntity(), "UTF-8");
                if (result.getStatusLine().getStatusCode()== 201) {
                    JSONObject resp = new JSONObject();
                    resp.put("message", json1);
                    resp.put("stausCode", result.getStatusLine().getStatusCode());
                    return Response.accepted(resp).build();
                }
                else {
                    JSONObject resp = new JSONObject();
                    resp.put("message", json1);
                    resp.put("errorcode", result.getStatusLine().getStatusCode());
                    return Response.accepted(resp).build();
                }

            } catch (Exception ex) {
                ex.printStackTrace();
                return Response.serverError().build();
            } finally {
                httpClient.close();
            }

        }
        catch (Exception e) {
            e.printStackTrace();
            return Response.serverError().build();
        }
    }
}