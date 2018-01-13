package org.graylog.plugins.analytics.job;

import com.google.common.collect.Lists;
import com.mongodb.BasicDBObject;
import com.mongodb.DBCollection;
import com.mongodb.DBObject;
import org.graylog.plugins.analytics.job.rest.models.requests.AddJobRequest;
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
        this.coll.createIndex(new BasicDBObject("jobid", 1), new BasicDBObject("unique", true));


    }

    @Override
    public void update(String jobid) {
        boolean streaming = false;
        if(coll.findOne(new BasicDBObject("jobid", jobid)).getStreaming() ==null) {
            streaming = true;
        }
        else {
            streaming = !coll.findOne(new BasicDBObject("jobid", jobid)).getStreaming();
        }
        coll.update( new BasicDBObject("jobid", jobid), new BasicDBObject("$set",  new BasicDBObject("streaming", streaming )));
    }


    @Override
    public List<Job> all(String type) {

        final DBObject query = new BasicDBObject();
        query.put("jobType", type);
        if(type == "all") {
            return toAbstractListType(coll.find());
        }
        else  {
            return  toAbstractListType(coll.find(query));
        }

}


    @Override
    public Job create(Job job) {
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
    public void delete(String jobid) {
            BasicDBObject document = new BasicDBObject();
            document.put("jobid", jobid);
            coll.remove(document);
    }

    @Override
    public Job fromRequest(AddJobRequest request) {
          return JobImpl.create(request.getJob().getAggregationType(), request.getJob().getField(), request.getJob().getStartDate(), request.getJob().getEndDate(), request.getJob().getStreamName(), request.getJob().getJobid(), request.getJob().getBucketSpan(), request.getJob().getIndexSetName(), request.getJob().getJobType(), request.getJob().getLuceneQuery(), request.getJob().getStreamId(), request.getJob().getStreaming(), request.getJob().getDescription());
    }

    private List<Job> toAbstractListType(DBCursor<JobImpl> job) {
        return toAbstractListType(job.toArray());
    }
    private List<Job>   toAbstractListType(List<JobImpl> job) {
        final List<Job> result = Lists.newArrayListWithCapacity(job.size());
        result.addAll(job);
        return result;
    }



}
