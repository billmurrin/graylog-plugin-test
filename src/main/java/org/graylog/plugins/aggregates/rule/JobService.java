package org.graylog.plugins.aggregates.rule;

import org.graylog.plugins.aggregates.rule.rest.models.requests.AddJobRequest;

import java.util.List;

public interface JobService {

    Job update(String name, Job job);
    Job fromRequest(AddJobRequest request);
    Job create(Job job);

    List<Job> all();

}
