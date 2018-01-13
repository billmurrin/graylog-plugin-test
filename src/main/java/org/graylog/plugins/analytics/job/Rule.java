package org.graylog.plugins.analytics.job;

import java.util.List;

public interface Rule {
	
	public String getQuery();

	public String getField();

    public List<String> getAlertReceivers();

	public long getNumberOfMatches();

	public boolean isMatchMoreOrEqual();

	public int getInterval();
	
	public String getName();
	
	public boolean isEnabled();
	
	public String getStreamId();

	public boolean isInReport();

	public List<String> getReportSchedules();

	public boolean isSliding();

	public String getCurrentAlertId();

	public boolean isRepeatNotifications();
}