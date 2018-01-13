package org.graylog.plugins.analytics.alert;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.io.UnsupportedEncodingException;
import java.text.ParseException;
import java.util.HashMap;

import org.graylog.plugins.analytics.job.Rule;
import org.graylog.plugins.analytics.job.RuleImpl;
import org.graylog.plugins.analytics.job.RuleService;
import org.graylog2.alarmcallbacks.AlarmCallbackConfigurationService;
import org.graylog2.alarmcallbacks.AlarmCallbackFactory;
import org.graylog2.alarmcallbacks.AlarmCallbackHistoryService;
import org.graylog2.alarmcallbacks.EmailAlarmCallback;
import org.graylog2.alarmcallbacks.HTTPAlarmCallback;
import org.graylog2.alerts.AlertImpl;
import org.graylog2.alerts.AlertService;
import org.graylog2.configuration.EmailConfiguration;
import org.graylog2.database.NotFoundException;
import org.graylog2.plugin.alarms.callbacks.AlarmCallbackConfigurationException;
import org.graylog2.plugin.alarms.callbacks.AlarmCallbackException;
import org.graylog2.plugin.configuration.ConfigurationException;
import org.graylog2.plugin.database.ValidationException;
import org.graylog2.plugin.streams.Stream;
import org.graylog2.streams.StreamImpl;
import org.graylog2.streams.StreamService;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mock;
import org.mockito.runners.MockitoJUnitRunner;

@RunWith(MockitoJUnitRunner.class)
public class RuleAlertSenderTest {

	
	@Mock
	EmailConfiguration configuration;
	
	@Mock
	AlarmCallbackConfigurationService alarmCallbackConfigurationService;
	
	@Mock
	AlarmCallbackFactory alarmCallbackFactory;
	
	@Mock
	StreamService streamService;
	
	@Mock
	AlarmCallbackHistoryService alarmCallbackHistoryService;
	
	@Mock
	AlertService alertService;

	@Mock
	RuleService ruleService;

	
	
	@Test
	public void testEmailAlarmCallback() throws ParseException, ClassNotFoundException, AlarmCallbackConfigurationException, UnsupportedEncodingException, NotFoundException, AlarmCallbackException, ValidationException, ConfigurationException {
		/*
		TimeRange range = AbsoluteRange.create(DateTime.now(), DateTime.now());

		Rule job = getMockRule();
		Map<String, Object> parameters = new HashMap<String, Object>();
		parameters.put("time", job.getInterval());

		parameters.put("description", "Machinelearning Alert description");
		parameters.put("threshold_type", AggregatesAlertCondition.ThresholdType.HIGHER.toString());
		parameters.put("threshold", job.getNumberOfMatches());
		parameters.put("grace", 0);
		parameters.put("type", "Machinelearning Rule");
		parameters.put("field", job.getField());
		parameters.put("backlog", 0);

		String title = "Aggregate job [" + job.getName() + "] triggered an alert.";

		AlarmCallbackConfiguration alarmCallbackConfiguration = AlarmCallbackConfigurationImpl.create("id", "streamId", "type", "title", new HashMap<String, Object>(), new Date(),"user");
		
		when(alarmCallbackConfigurationService.load(Mockito.any(String.class))).thenReturn(alarmCallbackConfiguration);

		Stream stream = getStream();
rl+F1)
		when(streamService.load(Mockito.anyString())).thenReturn(stream);

		AlertCondition alertCondition = getAlertCondition();
		when(alertConditionFactory.createAlertCondition("Machinelearning Alert", stream, "", range.getFrom(), "",parameters,title)).thenReturn(alertCondition);

		when(AlertImpl.fromCheckResult(alertCondition.runCheck())).thenReturn(getAlert());

		EmailAlarmCallback callback = getMockEmailAlarmCallback();

		Map<String, Long> map = new HashMap<String, Long>();
		AggregatesUtil aggregatesUtil = mock(AggregatesUtil.class);
		ruleAlertSender.setAggregatesUtil(aggregatesUtil);
		
		when(alarmCallbackFactory.create(alarmCallbackConfiguration)).thenReturn(callback);
		when(aggregatesUtil.buildSummary(job,configuration,map,range)).thenReturn("");
		
		ruleAlertSender.send(job, map, range);
		
		verify(aggregatesUtil).buildSummary(job, configuration, map, range);

		verify(callback).call(Mockito.any(Stream.class), Mockito.any(CheckResult.class));
		*/
	}
	
	
	@Test
	public void testHTTPAlarmCallback() throws ParseException, ClassNotFoundException, AlarmCallbackConfigurationException, UnsupportedEncodingException, NotFoundException, AlarmCallbackException, ValidationException, ConfigurationException {
		/*
		TimeRange range = AbsoluteRange.create(DateTime.now(), DateTime.now());


		Rule job = getMockRule();
		Map<String, Object> parameters = new HashMap<String, Object>();
		parameters.put("time", job.getInterval());
		//parameters.put("job", job);
		parameters.put("description", "Machinelearning Alert description");
		parameters.put("threshold_type", AggregatesAlertCondition.ThresholdType.HIGHER.toString());
		parameters.put("threshold", job.getNumberOfMatches());
		parameters.put("grace", 0);
		parameters.put("type", "Machinelearning Rule");
		parameters.put("field", job.getField());
		parameters.put("backlog", 0);

		String title = "Aggregate job [" + job.getName() + "] triggered an alert.";


		AlarmCallbackConfiguration alarmCallbackConfiguration = AlarmCallbackConfigurationImpl.create("id", "streamId", "type", "title", new HashMap<String, Object>(), new Date(),"user");
		when(alarmCallbackConfigurationService.load(Mockito.any(String.class))).thenReturn(alarmCallbackConfiguration);
		when(streamService.load(Mockito.anyString())).thenReturn(getStream());

		Stream stream = getStream();

		when(streamService.load(Mockito.anyString())).thenReturn(stream);

		AlertCondition alertCondition = getAlertCondition();
		when(alertConditionFactory.createAlertCondition("Machinelearning Alert", stream, "", range.getFrom(), "",parameters,title)).thenReturn(alertCondition);
		Mockito.doReturn(getAlert()).when(ruleAlertSender).getAlert(alertCondition);


		HTTPAlarmCallback callback = getMockHTTPAlarmCallback();
		AggregatesUtil aggregatesUtil = mock(AggregatesUtil.class);
		ruleAlertSender.setAggregatesUtil(aggregatesUtil);
		Map<String, Long> map = new HashMap<String, Long>();

		when(alarmCallbackFactory.create(alarmCallbackConfiguration)).thenReturn(callback);
		when(aggregatesUtil.buildSummary(job,configuration,map,range)).thenReturn("");


		ruleAlertSender.send(job, map, range);
		
		verify(aggregatesUtil).buildSummary((Rule)parameters.get("job"), configuration, map, range);

		verify(callback).call(Mockito.any(Stream.class), Mockito.any(CheckResult.class));
		*/
	}

	private AlertImpl getAlert(){
		AlertImpl alert = mock(AlertImpl.class);
		return alert;
	}

	private Rule getMockRule(){
		Rule rule = mock(RuleImpl.class);
		when(rule.getQuery()).thenReturn("query");
		when(rule.getField()).thenReturn("field");
		when(rule.getNumberOfMatches()).thenReturn(1L);
		when(rule.isMatchMoreOrEqual()).thenReturn(true);
		when(rule.getInterval()).thenReturn(1);
		when(rule.getName()).thenReturn("name");
		when(rule.isEnabled()).thenReturn(true);		
		when(rule.getStreamId()).thenReturn("streamId");

	
		return rule;
	}
	
	private Stream getStream() {
		Stream stream = new StreamImpl(new HashMap<String, Object>()); 				

		return stream;
	}
	
	private EmailAlarmCallback getMockEmailAlarmCallback(){
		EmailAlarmCallback callback = mock(EmailAlarmCallback.class);
				
		return callback;
	}
	
	private HTTPAlarmCallback getMockHTTPAlarmCallback(){
		HTTPAlarmCallback callback = mock(HTTPAlarmCallback.class);
				
		return callback;
	}
	
}
