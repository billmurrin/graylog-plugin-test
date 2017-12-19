package org.graylog.plugins.machinelearning;


import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import javax.inject.Inject;

import org.apache.http.HttpEntity;
import org.apache.http.HttpResponse;
import org.apache.http.NameValuePair;
import org.apache.http.client.ClientProtocolException;
import org.apache.http.client.entity.UrlEncodedFormEntity;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.DefaultHttpClient;
import org.apache.http.impl.client.HttpClientBuilder;
import org.apache.http.message.BasicNameValuePair;
import org.apache.http.util.EntityUtils;
import org.graylog.plugins.machinelearning.job.Job;
import org.graylog.plugins.machinelearning.job.JobService;
import org.graylog.plugins.machinelearning.job.Rule;
import org.graylog.plugins.machinelearning.job.RuleService;
import org.graylog.plugins.machinelearning.job.rest.JobActions;
import org.graylog.plugins.machinelearning.job.rest.models.StartJobConfiguration;
import org.graylog2.indexer.results.TermsResult;
import org.graylog2.indexer.searches.Searches;
import org.graylog2.indexer.searches.SearchesClusterConfig;
import org.graylog2.indexer.cluster.Cluster;
import org.graylog2.plugin.cluster.ClusterConfigService;
import org.graylog2.plugin.indexer.searches.timeranges.AbsoluteRange;
import org.graylog2.plugin.indexer.searches.timeranges.InvalidRangeParametersException;
import org.graylog2.plugin.indexer.searches.timeranges.RelativeRange;
import org.graylog2.plugin.indexer.searches.timeranges.TimeRange;
import org.graylog2.plugin.periodical.Periodical;
import org.joda.time.DateTime;
import org.joda.time.Period;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import com.google.common.annotations.VisibleForTesting;
import sun.net.www.http.HttpClient;

/**
 * This is the plugin. Your class should implement one of the existing plugin
 * interfaces. (i.e. AlarmCallback, MessageInput, MessageOutput)
 */
public class Machinelearning extends Periodical {
	private int sequence = 0;
	private int maxInterval = 1; // max interval detected in rules

	private final ClusterConfigService clusterConfigService;
	private final Searches searches;
	private final Cluster cluster;
	private final JobService jobService;



	private static final Logger LOG = LoggerFactory.getLogger(Machinelearning.class);
	private List<Job> list;

	@Inject
	public Machinelearning(Searches searches, ClusterConfigService clusterConfigService,
						   Cluster cluster, JobService jobService) {
		this.searches = searches;
		this.clusterConfigService = clusterConfigService;
		this.cluster = cluster;
		this.jobService = jobService;
	}

	@VisibleForTesting
	boolean shouldRun(){
		System.out.println(cluster.isHealthy());
		return cluster.isHealthy();
	}


	@Override
	public void doRun() {
	System.out.println("Runing periodical");
		if (!shouldRun()) {
			LOG.warn("Indexer is not running, not checking any rules this run.");
		} else {
			list = jobService.all("all");

			for (Job job : list) {

				if (!job.getStreaming()){
					LOG.debug("Job'" + job.getJobid() + "' is disabled, skipping.");
					continue;
				}

				CloseableHttpClient httpClient = HttpClientBuilder.create().build();
				HttpPost httpPost = new HttpPost("http://localhost:8004/ocpu/library/smartthink/R/smartanomaly/json");
				// Request parameters and other properties.
				List<NameValuePair> params = new ArrayList<NameValuePair>();
				params.add(new BasicNameValuePair("user", "Bob"));
				System.out.println("params added");
				try {
					httpPost.setEntity(new UrlEncodedFormEntity(params, "UTF-8"));
				} catch (UnsupportedEncodingException e) {
					// writing error to Log
					e.printStackTrace();
				}
				/*
				 * Execute the HTTP Request
				 */
				try {
					HttpResponse response = httpClient.execute(httpPost);
					HttpEntity respEntity = response.getEntity();
					if (respEntity != null) {
						// EntityUtils to get the response content
						String content =  EntityUtils.toString(respEntity);
						System.out.println(content+ "contentcontentcontent");
					}
				} catch (ClientProtocolException e) {
					// writing exception to log
					e.printStackTrace();
				} catch (IOException e) {
					// writing exception to log
					e.printStackTrace();
				}
			}
		}

	}

	@VisibleForTesting
	TimeRange buildRelativeTimeRange(int range) {
		try {
			return restrictTimeRange(RelativeRange.create(range));
		} catch (InvalidRangeParametersException e) {
			LOG.warn("Invalid timerange parameters provided, not executing job");
			return null;
		}
	}

	protected org.graylog2.plugin.indexer.searches.timeranges.TimeRange restrictTimeRange(
			final org.graylog2.plugin.indexer.searches.timeranges.TimeRange timeRange) {
		final DateTime originalFrom = timeRange.getFrom();
		final DateTime to = timeRange.getTo();
		final DateTime from;

		final SearchesClusterConfig config = clusterConfigService.get(SearchesClusterConfig.class);

		if (config == null || Period.ZERO.equals(config.queryTimeRangeLimit())) {
			from = originalFrom;
		} else {
			final DateTime limitedFrom = to.minus(config.queryTimeRangeLimit());
			from = limitedFrom.isAfter(originalFrom) ? limitedFrom : originalFrom;
		}

		return AbsoluteRange.create(from, to);
	}

	@Override
	public int getInitialDelaySeconds() {
		return 0;
	}

	@Override
	protected Logger getLogger() {
		return LOG;
	}

	@Override
	public int getPeriodSeconds() {
		return 60;
	}


	@Override
	public boolean isDaemon() {
		return true;
	}

	@Override
	public boolean masterOnly() {

		return true;
	}

	@Override
	public boolean runsForever() {
		return false;
	}

	@Override
	public boolean startOnThisNode() {
		return true;
	}

	@Override
	public boolean stopOnGracefulShutdown() {
		return true;
	}
}
