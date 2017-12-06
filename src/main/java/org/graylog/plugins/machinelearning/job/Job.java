package org.graylog.plugins.machinelearning.job;


public interface Job {

    public String getAggregationType();

    public String getField();

    public String getStartDate();

    public String getEndDate();

    public String getStreamName();

    public String getJobid();

    public String getBucketSpan();

    public String getIndexSetName();

    public String getJobType();

}
