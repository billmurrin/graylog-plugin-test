package org.graylog.plugins.machinelearning.job.rest;

import com.codahale.metrics.annotation.Timed;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiParam;
import io.swagger.annotations.ApiResponse;
import io.swagger.annotations.ApiResponses;
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
import javax.ws.rs.Consumes;
import javax.ws.rs.GET;
import javax.ws.rs.PUT;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import java.util.List;

@Api(value = "Machinelearning", description = " Machinelearning rest service.")
    @Path("/rules")
@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
public class RuleResource extends RestResource implements PluginRestResource {
    private final JobService jobService;

    @Inject
    public RuleResource(JobService jobService) {
        this.jobService = jobService;
    }

    @GET
    @Timed
    @ApiOperation(value = "Lists all existing jobs")
    @RequiresAuthentication
    public JobList list() {
        final List<Job> jobs = jobService.all();
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
//
//    @POST
//    @Path("/{name}")
//    @Timed
//    @RequiresAuthentication
//    @ApiOperation(value = "Update a job")
//    @ApiResponses(value = {
//            @ApiResponse(code = 400, message = "The supplied request is not valid.")
//    })
//    public Response update(@ApiParam(name = "name", required = true)
//                           @PathParam("name") String name,
//                           @ApiParam(name = "JSON body", required = true) @Valid @NotNull UpdateRuleRequest request
//    ) throws UnsupportedEncodingException {
//        final Rule rule = ruleService.fromRequest(request);
//
//        ruleService.update(java.net.URLDecoder.decode(name, "UTF-8"), rule);
//
//        return Response.accepted().build();
//    }

//    @DELETE
//    @Path("/{name}")
//    @RequiresAuthentication
//    @ApiOperation(value = "Delete a job")
//    @ApiResponses(value = {
//            @ApiResponse(code = 404, message = "Rule not found."),
//            @ApiResponse(code = 400, message = "Invalid ObjectId.")
//    })
//    public void delete(@ApiParam(name = "name", required = true)
//                       @PathParam("name") String name
//    ) throws NotFoundException, MongoException, UnsupportedEncodingException {
//        ruleService.destroy(java.net.URLDecoder.decode(name, "UTF-8"));
//    }
}