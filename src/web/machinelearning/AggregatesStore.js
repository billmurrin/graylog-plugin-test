import Reflux from 'reflux';
import URLUtils from 'util/URLUtils';
import UserNotification from 'util/UserNotification';
import fetch from 'logic/rest/FetchProvider';
import AggregatesActions from './AggregatesActions';
import AppConfig from 'util/AppConfig';
const fetchOpenCpu = require('logic/rest/FetchProvider').fetchOpenCpu;
import moment from 'moment';

const AggregatesStore = Reflux.createStore({
  listenables: [AggregatesActions],
  sourceUrl: '/plugins/org.graylog.plugins.machinelearning/rules',
  sourceJobUrl: '/plugins/org.graylog.plugins.machinelearning/jobaction',
  sourceFethJobid: '/plugins/org.graylog.plugins.machinelearning/jobs',
  startJoburl: '/plugins/org.graylog.plugins.machinelearning/jobaction',
  rules: undefined,
  init() {
    this.trigger({ rules: this.rules });
    this.trigger({ jobData: this.jobData });
  },
  getFields(){
    console.log("in get fields ");
    const promise = fetch('POST', "http://localhost:9000/api/plugins/org.graylog.plugins.machinelearning/jobs/fields")
      .then(
        response => {
          console.log(response);
            return response;
        },
        error => {
          UserNotification.error(`Fetching aggregate rules failed with status: ${error}`,
            'Could not retrieve rules');
        });
    AggregatesActions.getFields.promise(promise);
  },
  getJobs(jobType){
    console.log("in get jobs", jobType);
    console.log(URLUtils.qualifyUrl(this.sourceUrl));
    const promise = fetch('POST', URLUtils.qualifyUrl(this.sourceUrl), {"job_type": jobType})
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
  startJob(obj){
    const promise = fetch('POST', URLUtils.qualifyUrl(this.startJoburl), obj)
      .then(
        response => {
          console.log(response);
          // this.jobs = response.jobs;
          // this.trigger({ jobs: this.jobs });
          // return this.jobs;
        },
        error => {
          UserNotification.error("starting job failed   ");
        });
    AggregatesActions.startJob.promise(promise);
  },
  deletejob(jobid){
    console.log(jobid);
    var url = URLUtils.qualifyUrl("/plugins/org.graylog.plugins.machinelearning/rules/"+jobid);
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


});

export default AggregatesStore;
