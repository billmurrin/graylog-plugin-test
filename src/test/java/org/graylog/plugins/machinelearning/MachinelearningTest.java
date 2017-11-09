package org.graylog.plugins.machinelearning;

import static org.junit.Assert.*;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.io.UnsupportedEncodingException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.commons.mail.EmailException;
import org.graylog.plugins.machinelearning.job.Rule;
import org.graylog.plugins.machinelearning.job.RuleImpl;
import org.graylog.plugins.machinelearning.job.RuleService;
import org.graylog2.alerts.AlertService;
import org.graylog2.database.NotFoundException;
import org.graylog2.indexer.results.TermsResult;
import org.graylog2.indexer.searches.Searches;
import org.graylog2.indexer.cluster.Cluster;
import org.graylog2.plugin.alarms.callbacks.AlarmCallbackConfigurationException;
import org.graylog2.plugin.alarms.callbacks.AlarmCallbackException;
import org.graylog2.plugin.alarms.transports.TransportConfigurationException;
import org.graylog2.plugin.cluster.ClusterConfigService;
import org.graylog2.plugin.indexer.searches.timeranges.AbsoluteRange;
import org.graylog2.plugin.indexer.searches.timeranges.TimeRange;
import org.joda.time.DateTime;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.Spy;
import org.mockito.runners.MockitoJUnitRunner;

import static org.hamcrest.CoreMatchers.instanceOf;

@RunWith(MockitoJUnitRunner.class)
public class MachinelearningTest {

	
	@Mock
	Searches searches;
	
	@Mock
	ClusterConfigService clusterConfigService;
	
	@Mock
	Cluster cluster;
	
	@Mock
	RuleService ruleService;

	@Mock
	AlertService alertService;
	
	@InjectMocks
	@Spy
	Machinelearning machinelearning;

	@Test
	public void testBuildRelativeTimeRange() {
		
		TimeRange range = machinelearning.buildRelativeTimeRange(60);
		assertThat(range, instanceOf(AbsoluteRange.class));
	}
	
	@Test
	public void testDoRunIndexerNotRunning(){
		Machinelearning machinelearning = mock(Machinelearning.class);
		
		when(machinelearning.shouldRun()).thenReturn(false);

		
		machinelearning.doRun();
		
	}
	
	@Test
	public void testDoRunIndexerRunningNoRules(){
		when(ruleService.all()).thenReturn(new ArrayList<Rule>());
		Mockito.doReturn(true).when(machinelearning).shouldRun();
		
		Mockito.doCallRealMethod().when(machinelearning).doRun();
		
		machinelearning.doRun();
		
		verify(ruleService).all();
		
	}
	
	@Test
	public void testDoRunIndexerRunningOneRule(){		
		Mockito.doReturn(true).when(machinelearning).shouldRun();
		
		Mockito.doCallRealMethod().when(machinelearning).doRun();
		machinelearning.doRun();
		
		verify(ruleService).all();
		
	}
	
	@Test
	public void testDoRunIndexerRunningOneRuleDisabled(){		
		Mockito.doReturn(true).when(machinelearning).shouldRun();
		List<Rule> ruleList = mockRuleList("query","field",1,true,1,"name",new ArrayList<String>(),false,"streamId");
		when(ruleService.all()).thenReturn(ruleList);
		
		Mockito.doCallRealMethod().when(machinelearning).doRun();
		machinelearning.doRun();
		
		verify(ruleList.get(0), Mockito.never()).getInterval();
		
	}
		
	
	@Test
	public void testDoRunIndexerRunningOneRuleEnabledNullTimerange(){		
		Mockito.doReturn(true).when(machinelearning).shouldRun();
		List<Rule> ruleList = mockRuleList("query","field",1,true,1,"name",new ArrayList<String>(),true,"streamId");
		when(ruleService.all()).thenReturn(ruleList);
		Mockito.doReturn(null).when(machinelearning).buildRelativeTimeRange(60);
		
		Mockito.doCallRealMethod().when(machinelearning).doRun();
		machinelearning.doRun();
		
		verify(ruleList.get(0)).getInterval();
		verify(ruleList.get(0)).getQuery();
		verify(ruleList.get(0)).getStreamId();
		verify(searches, Mockito.never()).terms(Mockito.any(String.class), Mockito.anyInt(), Mockito.any(String.class), Mockito.any(TimeRange.class));
	}
	
	@SuppressWarnings("unchecked")
	@Test
	public void testDoRunIndexerRunningOneRuleEnabledNoMatch() throws EmailException, TransportConfigurationException, ClassNotFoundException, AlarmCallbackException, AlarmCallbackConfigurationException, NotFoundException, UnsupportedEncodingException {
		long occurrences = 5;
		boolean matchMoreOrEqual = true;
		
		Mockito.doReturn(true).when(machinelearning).shouldRun();
		List<Rule> ruleList = mockRuleList("query","field",occurrences,matchMoreOrEqual,1,"name",new ArrayList<String>(),true,"streamId");
		when(ruleService.all()).thenReturn(ruleList);
		Mockito.doReturn(new AbsoluteRange() {
			
			@Override
			public String type() {
				// TODO Auto-generated method stub
				return "type";
			}
			
			@Override
			public DateTime to() {
				// TODO Auto-generated method stub
				return new DateTime();
			}
			
			@Override
			public DateTime from() {
				// TODO Auto-generated method stub
				return new DateTime();
			}
		}).when(machinelearning).buildRelativeTimeRange(60);
		
		Mockito.doCallRealMethod().when(machinelearning).doRun();
		TermsResult result = mockTermsResult("value", occurrences-1);
		when(searches.terms(Mockito.any(String.class), Mockito.anyInt(), Mockito.any(String.class), Mockito.any(TimeRange.class))).thenReturn(result);
		
		
		machinelearning.doRun();
		
		verify(ruleList.get(0)).getInterval();
		verify(ruleList.get(0)).getQuery();
		verify(ruleList.get(0)).getStreamId();

	}
	
	@SuppressWarnings("unchecked")
	@Test
	public void testDoRunIndexerRunningOneRuleEnabledMatch() throws EmailException, TransportConfigurationException, ClassNotFoundException, AlarmCallbackException, AlarmCallbackConfigurationException, NotFoundException, UnsupportedEncodingException {
		long occurrences = 5;
		boolean matchMoreOrEqual = true;
		
		Mockito.doReturn(true).when(machinelearning).shouldRun();
		List<Rule> ruleList = mockRuleList("query","field",occurrences,matchMoreOrEqual,1,"name",new ArrayList<String>(),true,"streamId");
		when(ruleService.all()).thenReturn(ruleList);
		Mockito.doReturn(new AbsoluteRange() {
			
			@Override
			public String type() {
				// TODO Auto-generated method stub
				return "type";
			}
			
			@Override
			public DateTime to() {
				// TODO Auto-generated method stub
				return new DateTime();
			}
			
			@Override
			public DateTime from() {
				// TODO Auto-generated method stub
				return new DateTime();
			}
		}).when(machinelearning).buildRelativeTimeRange(60);
		
		Mockito.doCallRealMethod().when(machinelearning).doRun();
		TermsResult result = mockTermsResult("value", occurrences);
		when(searches.terms(Mockito.any(String.class), Mockito.anyInt(), Mockito.any(String.class), Mockito.any(TimeRange.class))).thenReturn(result);
		

	}
	
	private TermsResult mockTermsResult(String termsValue, Long termsOccurrences ){
		Map<String,Long> terms = new HashMap<String,Long>();
				
		terms.put(termsValue, termsOccurrences);
		
		TermsResult result = mock(TermsResult.class);
		
		
		when(result.getTerms()).thenReturn(terms);
		when(result.getBuiltQuery()).thenReturn("builtQuery");
		when(result.tookMs()).thenReturn(123L);
		return result;
	}
	
	private List<Rule> mockRuleList(String query,
            String field,
            long numberOfMatches,
            boolean matchMoreOrEqual,
            int interval,
            String name,
            List<String> alertReceivers,
            boolean enabled,
            String streamId) {

		Rule rule = mock(RuleImpl.class);
		when(rule.getQuery()).thenReturn(query);
		when(rule.getField()).thenReturn(field);
		when(rule.getNumberOfMatches()).thenReturn(numberOfMatches);
		when(rule.isMatchMoreOrEqual()).thenReturn(matchMoreOrEqual);
		when(rule.getInterval()).thenReturn(interval);
		when(rule.getName()).thenReturn(name);
		when(rule.isEnabled()).thenReturn(enabled);		
		when(rule.getStreamId()).thenReturn(streamId);
		//when(job.getNotificationId()).thenReturn(notificationId);
		
		List<Rule> ruleList = new ArrayList<Rule>();
		ruleList.add(rule);

		return ruleList;
	}
}
