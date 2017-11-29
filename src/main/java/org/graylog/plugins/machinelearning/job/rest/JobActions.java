package org.graylog.plugins.machinelearning.job.rest;


import com.codahale.metrics.annotation.Timed;
import com.fasterxml.jackson.databind.JsonNode;
import io.swagger.annotations.*;
import org.apache.shiro.authz.annotation.RequiresAuthentication;
import org.graylog.plugins.machinelearning.Machinelearning;
import org.graylog.plugins.machinelearning.job.Rule;
import org.graylog2.Configuration;
import org.graylog2.indexer.cluster.Cluster;
import org.graylog2.indexer.results.SearchResult;
import org.graylog2.indexer.results.TermsResult;
import org.graylog2.indexer.searches.Searches;
import org.graylog2.indexer.searches.SearchesConfig;
import org.graylog2.indexer.searches.Sorting;
import org.graylog2.plugin.cluster.ClusterConfigService;
import org.graylog2.plugin.indexer.searches.timeranges.AbsoluteRange;
import org.graylog2.plugin.indexer.searches.timeranges.RelativeRange;
import org.graylog2.plugin.rest.PluginRestResource;
import org.graylog2.shared.rest.resources.RestResource;
import org.joda.time.DateTime;
import org.joda.time.DateTimeZone;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import sun.net.www.protocol.http.HttpURLConnection;

import javax.inject.Inject;
import javax.ws.rs.*;
import javax.ws.rs.core.HttpHeaders;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import java.net.URL;
import java.util.Iterator;
import java.util.List;

import static com.google.common.base.Strings.isNullOrEmpty;
import static org.joda.time.DateTimeZone.UTC;

@Api(value = "Machinelearning", description = " Machinelearning rest service.")
    @Path("/jobaction")
@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
public class JobActions extends RestResource implements PluginRestResource {

    @POST
    @Timed
    @RequiresAuthentication
    @ApiOperation(value = "Start a job")
    @ApiResponses(value = {
            @ApiResponse(code = 400, message = "The supplied request is not valid.")
    })

    public Response startJob(){

        try {

            String url = "http://localhost:8004/ocpu/library/smartthink/R/smartanomaly/json";
            URL obj = new URL(url);
            HttpURLConnection con = (HttpURLConnection) obj.openConnection();
            con.setRequestMethod("POST");
            con.setRequestProperty("User-Agent", HttpHeaders.USER_AGENT);
            con.connect();
            int responseCode = con.getResponseCode();
            System.out.println("\nSending 'GET' request to URL : " + url);
            System.out.println("Response Code : " + responseCode);
           if(responseCode == 200 || responseCode == 201 ) {
                       return Response.accepted().build();
           }
           else {
               return Response.serverError().build();
           }
        }
        catch (Exception e) {
            e.printStackTrace();
            return Response.serverError().build();
        }
    }
}