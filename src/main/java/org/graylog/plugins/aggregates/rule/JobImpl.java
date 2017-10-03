package org.graylog.plugins.aggregates.rule;
import java.util.List;
import java.util.Map;

import javax.annotation.Nullable;
import javax.validation.constraints.Min;
import javax.validation.constraints.NotNull;
import javax.ws.rs.DefaultValue;

import org.bson.types.ObjectId;
import org.graylog.plugins.aggregates.report.schedule.ReportSchedule;
import org.graylog2.database.CollectionName;
import org.graylog2.database.PersistedImpl;
import org.graylog2.plugin.streams.Stream;
import org.graylog2.streams.StreamImpl;

import com.fasterxml.jackson.annotation.JsonAutoDetect;
import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import com.google.auto.value.AutoValue;

@AutoValue
@JsonAutoDetect
@JsonIgnoreProperties(ignoreUnknown = true)
@CollectionName("test")
public abstract class JobImpl implements Job{


    @JsonProperty("query")
    @Override
    @NotNull
    public abstract String getQuery();

    @JsonProperty("field")
    @Override
    @NotNull
    public abstract String getField();


    @JsonCreator
    public static JobImpl create( @JsonProperty("query") String query,
                                  @JsonProperty("field") String field
                                   ) {
        return new AutoValue_JobImpl(query, field);
    }


}
