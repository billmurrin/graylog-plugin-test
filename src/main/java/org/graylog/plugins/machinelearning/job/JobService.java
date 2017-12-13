package org.graylog.plugins.machinelearning.job;

import org.graylog.plugins.machinelearning.job.rest.models.requests.AddJobRequest;

import javax.ws.rs.core.Response;
import java.util.List;

public interface JobService {

    Job update(String name, Job job);
    Job fromRequest(AddJobRequest request);
    Job create(Job job);
    void delete(String jobid);
    List<Job> all(String type);

}
