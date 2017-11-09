package org.graylog.plugins.machinelearning.job.rest;


import com.codahale.metrics.annotation.Timed;
import io.swagger.annotations.*;
import org.apache.shiro.authz.annotation.RequiresAuthentication;
import org.graylog.plugins.machinelearning.job.Job;
import org.graylog.plugins.machinelearning.job.JobService;
import org.graylog.plugins.machinelearning.job.rest.models.requests.AddJobRequest;
import org.graylog.plugins.machinelearning.job.rest.models.responses.JobList;
import org.graylog2.plugin.rest.PluginRestResource;
import org.graylog2.shared.rest.resources.RestResource;

import javax.inject.Inject;
import javax.validation.Valid;
import javax.validation.constraints.NotNull;
import javax.ws.rs.*;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import java.io.UnsupportedEncodingException;
import java.util.List;

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
    public Response startJob(
                           @ApiParam(name = "JSON body", required = true) @Valid @NotNull String jobId
    ) throws UnsupportedEncodingException {
        try {
            ProcessBuilder pb = new ProcessBuilder("/usr/bin/Rscript", "/home/manju/Documents/rscript/r_anomaly_v11.r", jobId);
            Process p = pb.start();
            System.out.println(p);
//
        }
        catch (Exception e) {

        }
    

        return Response.accepted().build();
    }

}