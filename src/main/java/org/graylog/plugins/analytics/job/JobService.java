package org.graylog.plugins.analytics.job;

import org.graylog.plugins.analytics.job.rest.models.requests.AddJobRequest;

import java.util.List;

public interface JobService {
    void update(String jobid);
    Job fromRequest(AddJobRequest request);
    Job create(Job job);
    void delete(String jobid);
    List<Job> all(String type);

}
