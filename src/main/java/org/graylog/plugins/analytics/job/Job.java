package org.graylog.plugins.analytics.job;


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

    public String getLuceneQuery();

    public String getStreamId();


    public String getDescription();

    public Boolean getStreaming();

}
