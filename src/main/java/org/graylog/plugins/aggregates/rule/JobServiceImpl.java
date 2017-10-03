package org.graylog.plugins.aggregates.rule;

import com.mongodb.BasicDBObject;
import com.mongodb.DBCollection;
import org.graylog.plugins.aggregates.rule.rest.models.requests.AddJobRequest;
import org.graylog2.bindings.providers.MongoJackObjectMapperProvider;
import org.graylog2.database.CollectionName;
import org.graylog2.database.MongoConnection;
import org.mongojack.JacksonDBCollection;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.inject.Inject;
import javax.validation.ConstraintViolation;
import javax.validation.Validator;
import java.util.List;
import java.util.Set;

public class JobServiceImpl implements JobService {

    private final JacksonDBCollection<JobImpl, String> coll;
    private final Validator validator;
    private static final Logger LOG = LoggerFactory.getLogger(JobServiceImpl.class);
    @Inject
    public JobServiceImpl(MongoConnection mongoConnection, MongoJackObjectMapperProvider mapperProvider,
                           Validator validator) {
        this.validator = validator;
        final String collectionName = JobImpl.class.getAnnotation(CollectionName.class).value();
        final DBCollection dbCollection = mongoConnection.getDatabase().getCollection(collectionName);
        this.coll = JacksonDBCollection.wrap(dbCollection, JobImpl.class, String.class, mapperProvider.get());
        this.coll.createIndex(new BasicDBObject("name", 1), new BasicDBObject("unique", true));


    }

    @Override
    public Job update(String name, Job job) {
        return null;
    }

    @Override
    public Job create(Job job) {
        System.out.println("here you need to create it ");
        if (job instanceof JobImpl) {
            final JobImpl jobImpl = (JobImpl) job;
            final Set<ConstraintViolation<JobImpl>> violations = validator.validate(jobImpl);
            System.out.println(jobImpl.toString());
            if (violations.isEmpty()) {
                return coll.insert(jobImpl).getSavedObject();
            } else {
                throw new IllegalArgumentException("Specified object failed validation: " + violations);
            }
        } else
            throw new IllegalArgumentException(
                    "Specified object is not of correct implementation type (" + job.getClass() + ")!");
    }


    @Override
    public Job fromRequest(AddJobRequest request) {

        return JobImpl.create(request.getJob().getQuery(), request.getJob().getField());
    }


    @Override
    public List<Rule>  all() {
            return  null;
    }


}
