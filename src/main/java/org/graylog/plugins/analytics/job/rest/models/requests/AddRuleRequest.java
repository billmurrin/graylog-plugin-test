package org.graylog.plugins.analytics.job.rest.models.requests;


import com.fasterxml.jackson.annotation.JsonAutoDetect;
import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.google.auto.value.AutoValue;

import org.graylog.plugins.analytics.job.RuleImpl;

import javax.validation.Valid;
import javax.validation.constraints.NotNull;


@AutoValue
@JsonAutoDetect
public abstract class AddRuleRequest {
	
    @JsonProperty("job")
    @NotNull
    public abstract RuleImpl getRule();
    
    @JsonCreator    
    public static AddRuleRequest create(//@JsonProperty("name") @Valid String name,
    		@JsonProperty("job") @Valid RuleImpl rule

    		) {
        return new AutoValue_AddRuleRequest(rule);
    }
}
