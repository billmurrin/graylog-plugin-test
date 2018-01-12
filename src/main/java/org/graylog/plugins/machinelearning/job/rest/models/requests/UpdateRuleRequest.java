package org.graylog.plugins.machinelearning.job.rest.models.requests;


import com.fasterxml.jackson.annotation.JsonAutoDetect;
import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.google.auto.value.AutoValue;

import org.graylog.plugins.machinelearning.job.RuleImpl;

import javax.validation.Valid;
import javax.validation.constraints.NotNull;


@AutoValue
@JsonAutoDetect
public abstract class UpdateRuleRequest {
	

    @JsonProperty("job")
    @NotNull
    public abstract RuleImpl getRule();
    
    @JsonCreator    
    public static UpdateRuleRequest create(
    		@JsonProperty("job") @Valid RuleImpl rule
    		) {
        return new AutoValue_UpdateRuleRequest(rule);
    }
}
