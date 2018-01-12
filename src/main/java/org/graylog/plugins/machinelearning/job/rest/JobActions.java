package org.graylog.plugins.machinelearning.job.rest;


import com.codahale.metrics.annotation.Timed;
import com.fasterxml.jackson.databind.JsonNode;
import io.swagger.annotations.*;
import net.minidev.json.JSONObject;
import org.apache.http.HttpResponse;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClientBuilder;
import org.apache.http.util.EntityUtils;
import org.apache.shiro.authz.annotation.RequiresAuthentication;
import org.graylog.plugins.machinelearning.Machinelearning;
import org.graylog.plugins.machinelearning.job.JobServiceImpl;
import org.graylog.plugins.machinelearning.job.Rule;
import org.graylog.plugins.machinelearning.job.rest.models.JobConfiguration;
import org.graylog.plugins.machinelearning.job.rest.models.StartJobConfiguration;
import org.graylog2.Configuration;
import org.graylog2.configuration.ElasticsearchClientConfiguration;
import org.graylog2.indexer.IndexSetRegistry;
import org.graylog2.indexer.IndexSetStatsCreator;
import org.graylog2.indexer.IndexSetValidator;
import org.graylog2.indexer.cluster.Cluster;
import org.graylog2.indexer.indexset.IndexSetService;
import org.graylog2.indexer.indices.jobs.IndexSetCleanupJob;
import org.graylog2.indexer.results.SearchResult;
import org.graylog2.indexer.results.TermsResult;
import org.graylog2.indexer.searches.Searches;
import org.graylog2.indexer.searches.SearchesConfig;
import org.graylog2.indexer.searches.Sorting;
import org.graylog2.plugin.cluster.ClusterConfigService;
import org.graylog2.plugin.indexer.searches.timeranges.AbsoluteRange;
import org.graylog2.plugin.indexer.searches.timeranges.RelativeRange;
import org.graylog2.plugin.rest.PluginRestResource;
import org.graylog2.shared.initializers.JerseyService;
import org.graylog2.shared.rest.resources.RestResource;
import org.graylog2.system.jobs.SystemJobManager;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.inject.Inject;
import javax.validation.Valid;
import javax.validation.constraints.NotNull;
import javax.ws.rs.*;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.Reader;
import java.net.URI;
import java.net.URL;
import java.net.URLEncoder;
import java.util.Iterator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import static com.google.common.base.Strings.isNullOrEmpty;
import static java.util.Objects.requireNonNull;
import static org.joda.time.DateTimeZone.UTC;

@Api(value = "Machinelearning", description = " Machinelearning rest service.")
    @Path("/jobaction")
@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
public class JobActions extends RestResource implements PluginRestResource {
    private static final Logger LOG = LoggerFactory.getLogger(JobServiceImpl.class);
    private final ElasticsearchClientConfiguration elasticConfiguration;

    @Inject
    public JobActions(final  ElasticsearchClientConfiguration  elasticConfiguration) {
        this.elasticConfiguration= elasticConfiguration;
    }


    @POST
    @Timed
    @RequiresAuthentication
    @ApiOperation(value = "Start a job")
    @ApiResponses(value = {
            @ApiResponse(code = 400, message = "The supplied request is not valid.")
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
//            LOG.info(json.toJSONString().toString()+ "data");

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