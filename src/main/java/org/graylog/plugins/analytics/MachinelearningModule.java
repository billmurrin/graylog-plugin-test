package org.graylog.plugins.analytics;

import org.graylog.plugins.analytics.job.JobService;
import org.graylog.plugins.analytics.job.JobServiceImpl;
import org.graylog.plugins.analytics.job.rest.*;
import org.graylog2.plugin.PluginConfigBean;
import org.graylog2.plugin.PluginModule;

import java.util.Collections;
import java.util.Set;

/**
 * Extend the PluginModule abstract class here to add you plugin to the system.
 */
public class MachinelearningModule extends PluginModule {
    /**
     * Returns all configuration beans required by this plugin.
     *
     * Implementing this method is optional. The default method returns an empty {@link Set}.
     */
    @Override
    public Set<? extends PluginConfigBean> getConfigBeans() {
        return Collections.emptySet();
    }

    @Override
    protected void configure() {
//        bind(AlertService.class).to(AlertServiceImpl.class);
//    	bind(RuleService.class).to(RuleServiceImpl.class);
        bind(JobService.class).to(JobServiceImpl.class);


//    	bind(ReportScheduleService.class).to(ReportScheduleServiceImpl.class);


//    	bind(HistoryItemService.class).to(HistoryItemServiceImpl.class);
    	
        addPeriodical(Machinelearning.class);
//        addPeriodical(AggregatesReport.class);
//        addPeriodical(AggregatesMaintenance.class);
//        addPermissions(RuleRestPermissions.class);
//        addPermissions(ReportScheduleRestPermissions.class);
            addRestResource(MlJobResource.class);
            addRestResource(JobActions.class);
            addRestResource(JobResource.class);
            addRestResource(AnomalyJob.class);
            addRestResource(AnomalyDetails.class);
            //        addRestResource(ReportScheduleResource.class);
        //addRestResource(TestRest.class);

        //addAlertCondition(AggregatesUtil.ALERT_CONDITION_TYPE, AggregatesAlertCondition.class, AggregatesAlertCondition.Factory.class);

        /*
         * Register your plugin types here.
         *
         * Examples:
         *
         * addMessageInput(Class<? extends MessageInput>);
         * addMessageFilter(Class<? extends MessageFilter>);
         * addMessageOutput(Class<? extends MessageOutput>);
         * addPeriodical(Class<? extends Periodical>);
         * addAlarmCallback(Class<? extends AlarmCallback>);
         * addInitializer(Class<? extends Service>);
         * addRestResource(Class<? extends PluginRestResource>);
         *
         *
         * Add all configuration beans returned by getConfigBeans():
         *
         * addConfigBeans();
         */
    }
}
