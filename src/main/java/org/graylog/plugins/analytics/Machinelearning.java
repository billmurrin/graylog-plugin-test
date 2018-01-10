package org.graylog.plugins.analytics;


import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;
import javax.inject.Inject;

import net.minidev.json.JSONObject;
import org.apache.http.HttpResponse;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClientBuilder;
import org.apache.http.util.EntityUtils;
import org.graylog.plugins.analytics.job.Job;
import org.graylog.plugins.analytics.job.JobService;
import org.graylog2.configuration.ElasticsearchClientConfiguration;
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

	private final ElasticsearchClientConfiguration elasticConfiguration;

	private static final Logger LOG = LoggerFactory.getLogger(Machinelearning.class);
	private List<Job> list;

	@Inject
	public Machinelearning(Searches searches, ClusterConfigService clusterConfigService,
						   Cluster cluster, JobService jobService, ElasticsearchClientConfiguration elasticsearchClientConfiguration) {
		this.searches = searches;
		this.clusterConfigService = clusterConfigService;
		this.cluster = cluster;
		this.jobService = jobService;
		this.elasticConfiguration = elasticsearchClientConfiguration;
	}

	@VisibleForTesting
	boolean shouldRun(){
		System.out.println(cluster.isHealthy());
		return cluster.isHealthy();
	}


	@Override
	public void doRun()  {
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

				final List<String> hosts = elasticConfiguration.getElasticsearchHosts().stream()
						.map(hostUri -> {
							return hostUri.toString();
						})
						.collect(Collectors.toList());
				JSONObject json = new JSONObject();
				json.put("jobid", job.getJobid());
				json.put("aggregationType", job.getAggregationType());
				json.put("field", job.getField());
				json.put("elastic_url", hosts.get(0));

				json.put("indexSetName" , job.getIndexSetName());
				json.put("sourceindextype" , "message");

				json.put("bucketSpan" , job.getBucketSpan());
				json.put("timestampfield" , "timestamp");
				json.put("max_docs" , 1000000);
				json.put("anomaly_direction" , "both");
				json.put("max_ratio_of_anomaly" , "0.10");
				json.put("alpha_parameter" , "0.1");
				json.put("gelf_url", "localhost:12201/gelf");
				json.put("streaming" , "T");
				json.put("query" , job.getLuceneQuery());

				CloseableHttpClient httpClient = HttpClientBuilder.create().build();
				System.out.println(json.toJSONString().toString()+ "json string");
				try {
					HttpPost request = new HttpPost("http://localhost:8004/ocpu/library/smartthink/R/smartanomaly/json");
					StringEntity params = new StringEntity(json.toString());
					request.addHeader("content-type", "application/json");
					request.setEntity(params);
					HttpResponse result = httpClient.execute(request);

					String json1 = EntityUtils.toString(result.getEntity(), "UTF-8");
					if (result.getStatusLine().getStatusCode()== 201) {
						LOG.info("job streaming is success :"+job.getJobid());
					}
					else {
						LOG.info("job streaming is failed with messge :"+json1);
					}

				} catch (Exception ex) {
					ex.printStackTrace();
				} finally {
					try {
						httpClient.close();

					} catch (IOException e) {
						e.printStackTrace();
					}

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
		return 1800;
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
