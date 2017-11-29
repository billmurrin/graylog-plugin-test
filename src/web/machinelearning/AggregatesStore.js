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
  sourceJobUrltest: '/ocpu/library/smartthink/R/smartanomaly/json',
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
     // this.jobs = response.jobs;
          // this.trigger({ jobs: this.jobs });
          return response;
        },
        error => {
          UserNotification.error(`Fetching aggregate rules failed with status: ${error}`,
            'Could not retrieve rules');
        });
    AggregatesActions.getFields.promise(promise);
  },
  getJobs(){
    const promise = fetch('GET', URLUtils.qualifyUrl(this.sourceUrl))
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
  getJobs2(){
    const promise = fetch('POST', URLUtils.qualifyUrl(this.sourceFethJobid+"/fdgfsd"))
      .then(
        response => {
          this.jobData = response;
          this.trigger({ jobData: this.jobData });
          return this.jobData;
        },
        error => {
          UserNotification.error(`Fetching aggregate rules failed with status: ${error}`,
            'Could not retrieve rules');
        });
    AggregatesActions.getJobs2.promise(promise);
  },
  startJob(jobid){
    const promise = fetch('POST', URLUtils.qualifyUrl(this.sourceJobUrl), jobid)
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
    var hostname = AppConfig.gl2ServerUrl().split("9000")[0]+"8004";
    console.log(hostname);
    var json = {};
    var url = hostname+"/ocpu/library/smartthink/R/smartanomaly/json";
          job["host_ip"] = AppConfig.gl2ServerUrl().split(":")[1].replace("//", "");
          job["indexSetName"] =job.indexSetName+"_0";
          job["aggregationType"] =job.aggrigationType;

          job["sourceindextype"] = "message";
          job["timestampfield"] = "timestamp";
          job["anom_index"] = "anomaly_result";
          job["anom_type"] = "anomaly_type";
          job["anomaly_direction"] = "both";
          job["max_ratio_of_anomaly"] = "0.02";
          job["alpha_parameter"] = "0.1";
          // job["bucketSpan"] = "3h";

          job["startDate"] = moment(job.startDate).format("YYYY-MM-DD HH:mm:ss.SSS");
          job["endDate"] = moment(job.endDate).format("YYYY-MM-DD HH:mm:ss.SSS");

         delete job.streamName;
         delete job.jobType;
         delete job.aggrigationType;
         console.log(job, "final sending");
         console.log(url, "final url");
         var js = {}
         for (var k in job) {
           if (job.hasOwnProperty(k) && k !== "aggrigationType") {
              js[k] = job[k]
           }
         }
         var urlios = "http://localhost:8004"+this.sourceJobUrltest
    const promise = fetchOpenCpu('POST',  urlios, js)
      .then(
        response => {
          console.log(response, "response");
          return this.jobs;
        },
        error => {
          UserNotification.error('starting job failed');
        });
    AggregatesActions.startJob2.promise(promise);
  },
  deletejob(jobid){
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
