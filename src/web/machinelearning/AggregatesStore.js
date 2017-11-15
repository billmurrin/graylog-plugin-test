import Reflux from 'reflux';
import URLUtils from 'util/URLUtils';
import UserNotification from 'util/UserNotification';
import fetch from 'logic/rest/FetchProvider';
import AggregatesActions from './AggregatesActions';

const fetchOpenCpu = require('logic/rest/FetchProvider').fetchOpenCpu;

const AggregatesStore = Reflux.createStore({
  listenables: [AggregatesActions],
  sourceUrl: '/plugins/org.graylog.plugins.aggregates/rules',
  rules: undefined,
  init() {
    this.trigger({ rules: this.rules });
  },
  getJobs(){
    var url = "http://localhost:9000/api/plugins/org.graylog.plugins.machinelearning/rules";
    const promise = fetch('GET', url)
      .then(
        response => {
          this.jobs = response.jobs;
          this.trigger({ jobs: this.jobs });
          return this.jobs;
        },
        error => {
          UserNotification.error(`Fetching aggregate rules failed with status: ${error}`,
            'Could not retrieve rules');
        });
    AggregatesActions.getJobs.promise(promise);
  },
  startJob(jobid){
    console.log("startJob", jobid);

    var url = "http://localhost:9000/api/plugins/org.graylog.plugins.machinelearning/jobaction";
    const promise = fetch('POST', url, jobid)
      .then(
        response => {
          this.jobs = response.jobs;
          this.trigger({ jobs: this.jobs });
          return this.jobs;
        },
        error => {
          UserNotification.error(`Fetching aggregate rules failed with status: ${error}`,
            'Could not retrieve rules');
        });
    AggregatesActions.getJobs.promise(promise);
  },
  startJob2(job){
            var url = "http://35.184.46.103/ocpu/library/smartanomalyv3/R/anomaly/json";
              job["host_ip"] =  "35.184.46.103";
               job["indexSetName"] =job.indexSetName+"_0";
               delete job.streamName;
               delete job.jobType;
               console.log(job);

    const promise = fetchOpenCpu('POST', url, job)
      .then(
        response => {
          console.log(response, "cvall response");
          // this.jobs = response.jobs;
          // this.trigger({ jobs: this.jobs });
          return this.jobs;
        },
        error => {
          UserNotification.error(`Fetching aggregate rules failed with status: ${error}`,
            'Could not retrieve rules');
        });
    AggregatesActions.startJob2.promise(promise);
  },
  deletejob(jobid){
    console.log("deletejob", jobid);
    var url = "http://localhost:9000/api/plugins/org.graylog.plugins.machinelearning/rules/"+jobid
    const promise = fetch('DELETE', url)
      .then(
        response => {
          UserNotification.success('Jod deleted');
          this.trigger({ jobs: this.jobs });
          return this.jobs;
        },
        error => {
          UserNotification.error('deleting job failed');
        });
    AggregatesActions.deletejob.promise(promise);
  },
  list() {
    console.log(this.sourceUrl);
    const promise = fetch('GET', URLUtils.qualifyUrl(this.sourceUrl))
      .then(
        response => {
          this.rules = response.rules;
          this.trigger({ rules: this.rules });
          return this.rules;
        },
        error => {
          UserNotification.error(`Fetching aggregate rules failed with status: ${error}`,
            'Could not retrieve rules');
        });
    AggregatesActions.list.promise(promise);
  },
  create(newRule) {
    const url = URLUtils.qualifyUrl(this.sourceUrl);
    const method = 'PUT';

    const request = {
      rule: {
        name: newRule.name,
        query: newRule.query,
        field: newRule.field,
        numberOfMatches: newRule.numberOfMatches,
        matchMoreOrEqual: newRule.matchMoreOrEqual,
        interval: newRule.interval,
        alertReceivers: newRule.alertReceivers,
        enabled: true,
        streamId: newRule.streamId,
        inReport: newRule.inReport,
        reportSchedules: newRule.reportSchedules,
        sliding: newRule.sliding,
        repeatNotifications: newRule.repeatNotifications,
      },
    };

    const promise = fetch(method, url, request)
      .then(() => {
        UserNotification.success('Rule successfully created');
        this.list();
        return null;
      }, (error) => {
        UserNotification.error(`Creating rule failed with status: ${error.message}`,
          'Could not create rule');
      });

    AggregatesActions.create.promise(promise);
  },
  update(name, updatedRule) {
    const url = URLUtils.qualifyUrl(this.sourceUrl + '/' + encodeURIComponent(name));
    const method = 'POST';

    const request = {
      rule: {
        name: updatedRule.name,
        query: updatedRule.query,
        field: updatedRule.field,
        numberOfMatches: updatedRule.numberOfMatches,
        matchMoreOrEqual: updatedRule.matchMoreOrEqual,
        interval: updatedRule.interval,
        alertReceivers: updatedRule.alertReceivers,
        enabled: updatedRule.enabled,
        streamId: updatedRule.streamId,
        inReport: updatedRule.inReport,
        reportSchedules: updatedRule.reportSchedules,
        sliding: updatedRule.sliding,
        currentAlertId: updatedRule.currentAlertId,
        repeatNotifications: updatedRule.repeatNotifications,
      },
    };

    const promise = fetch(method, url, request)
      .then(() => {
        UserNotification.success('Rule successfully updated');
        this.list();
        return null;
      }, (error) => {
        UserNotification.error(`Updating rule failed with status: ${error.message}`,
          'Could not update rule');
      });

    AggregatesActions.update.promise(promise);
  },
  deleteByName(ruleName) {
    const url = URLUtils.qualifyUrl(this.sourceUrl + '/' + encodeURIComponent(ruleName));
    const method = 'DELETE';

    const promise = fetch(method, url)
      .then(() => {
        UserNotification.success('Rule successfully deleted');
        this.list();
        return null;
      }, (error) => {
        UserNotification.error(`Deleting rule failed with status: ${error.message}`,
        'Could not delete rule');
      });
    AggregatesActions.deleteByName.promise(promise);
  },
});

export default AggregatesStore;
