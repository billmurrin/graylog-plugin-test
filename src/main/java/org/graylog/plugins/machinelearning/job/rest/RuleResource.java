package org.graylog.plugins.machinelearning.job.rest;

import com.codahale.metrics.annotation.Timed;
import com.mongodb.MongoException;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiParam;
import io.swagger.annotations.ApiResponse;
import io.swagger.annotations.ApiResponses;
import org.apache.shiro.authz.annotation.RequiresAuthentication;
import org.graylog.plugins.machinelearning.MachinelearningConfiguration;
import org.graylog.plugins.machinelearning.job.Job;
import org.graylog.plugins.machinelearning.job.JobService;
import org.graylog.plugins.machinelearning.job.rest.models.JobsTypeConfiguration;
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
import org.graylog2.Configuration;

@Api(value = "Machinelearning", description = " Machinelearning rest service.")
    @Path("/rules")
@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
public class RuleResource extends RestResource implements PluginRestResource {
    private final JobService jobService;
    private final Configuration conf;


    @Inject
    public RuleResource(JobService jobService, Configuration conf) {
        this.jobService = jobService;
        this.conf= conf;

    }

    @POST
    @Timed
    @ApiOperation(value = "Lists all existing jobs")
    @RequiresAuthentication
    public JobList list(
            @ApiParam(name = "JSON body", required = true) @Valid @NotNull JobsTypeConfiguration request
    ) {
        System.out.println(request.jobType()+ "TYpe");
        final List<Job> jobs = jobService.all(request.jobType());
        return JobList.create(jobs);
    }

    @PUT
    @Timed
    @ApiOperation(value = "Create a job")
    @RequiresAuthentication
    @ApiResponses(value = {
            @ApiResponse(code = 400, message = "The supplied request is not valid.")
    })
    public Response create(
            @ApiParam(name = "JSON body", required = true) @Valid @NotNull AddJobRequest request
    ) {
        final Job job = jobService.fromRequest(request);
        jobService.create(job);
        return Response.accepted().build();
    }


    @DELETE
    @Path("/{jobid}")
    @RequiresAuthentication
    @ApiOperation(value = "Delete a job")
    @ApiResponses(value = {
            @ApiResponse(code = 404, message = "job not found."),
    })
    public Response delete(@ApiParam(name = "jobid", required = true)
                       @PathParam("jobid") String jobid
    ) throws NotFoundException, MongoException, UnsupportedEncodingException {
        jobService.delete(jobid);
        return Response.accepted().build();
    }

    @POST
    @Path("/update/{jobid}")
    @RequiresAuthentication
    @ApiOperation(value = "Delete a job")
    @ApiResponses(value = {
            @ApiResponse(code = 404, message = "job not found."),
    })
    public Response updateStreaming(@ApiParam(name = "jobid", required = true)
                           @PathParam("jobid") String jobid
    ) throws NotFoundException, MongoException, UnsupportedEncodingException {
        jobService.update(jobid);
        return Response.accepted().build();
    }
}