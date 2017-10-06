package org.graylog.plugins.aggregates.rule;


import org.graylog2.indexer.rotation.strategies.MessageCountRotationStrategyConfig;

import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;

public interface Job {

    public String getAggrigationType();

    public String getField();

    public String getStartDate();

    public String getEndDate();

    public String getStreamName();

    public String getJobid();

}
