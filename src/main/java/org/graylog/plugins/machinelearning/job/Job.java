package org.graylog.plugins.machinelearning.job;


public interface Job {

    public String getAggrigationType();

    public String getField();

    public String getStartDate();

    public String getEndDate();

    public String getStreamName();

    public String getJobid();

}
