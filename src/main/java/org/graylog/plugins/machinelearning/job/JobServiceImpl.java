package org.graylog.plugins.machinelearning.job;

import com.google.common.collect.Lists;
import com.mongodb.DBCollection;
import org.graylog.plugins.machinelearning.job.rest.models.requests.AddJobRequest;
import org.graylog2.bindings.providers.MongoJackObjectMapperProvider;
import org.graylog2.database.CollectionName;
import org.graylog2.database.MongoConnection;
import org.mongojack.DBCursor;
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
        //this.coll.createIndex(new BasicDBObject("jobid", 1), new BasicDBObject("unique", true));


    }

    @Override
    public Job update(String name, Job job) {
        return null;
    }


    @Override
    public List<Job> all() {        return  toAbstractListType(coll.find());}


    @Override
    public Job create(Job job) {
        System.out.println("here you need to create it ");
        if (job instanceof JobImpl) {
            final JobImpl jobImpl = (JobImpl) job;
            final Set<ConstraintViolation<JobImpl>> violations = validator.validate(jobImpl);
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

        return JobImpl.create(request.getJob().getAggrigationType(), request.getJob().getField(), request.getJob().getStartDate(), request.getJob().getEndDate(), request.getJob().getStreamName(), request.getJob().getJobid());
    }

    private List<Job> toAbstractListType(DBCursor<JobImpl> job) {
        return toAbstractListType(job.toArray());
    }
    private List<Job> toAbstractListType(List<JobImpl> job) {
        final List<Job> result = Lists.newArrayListWithCapacity(job.size());
        result.addAll(job);
        return result;
    }



}
