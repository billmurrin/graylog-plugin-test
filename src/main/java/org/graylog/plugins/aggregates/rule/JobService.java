package org.graylog.plugins.aggregates.rule;

import com.mongodb.MongoException;
import org.graylog.plugins.aggregates.rule.rest.models.requests.AddJobRequest;
import org.graylog.plugins.aggregates.rule.rest.models.requests.AddRuleRequest;
import org.graylog.plugins.aggregates.rule.rest.models.requests.UpdateRuleRequest;

import java.io.UnsupportedEncodingException;
import java.util.List;

public interface JobService {

    Job update(String name, Job job);
    Job fromRequest(AddJobRequest request);
    Job create(Job job);

    List<Rule> all();

}
