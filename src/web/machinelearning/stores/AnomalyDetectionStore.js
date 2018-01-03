import Reflux from 'reflux';
import URLUtils from 'util/URLUtils';
import UserNotification from 'util/UserNotification';
import fetch from 'logic/rest/FetchProvider';
import AnomalyDetectionActions from 'machinelearning/actions/AnomalyDetectionActions';
import AppConfig from 'util/AppConfig';
const fetchOpenCpu = require('logic/rest/FetchProvider').fetchOpenCpu;
import moment from 'moment';


const AnomalyDetectionStore = Reflux.createStore({
  listenables: [AnomalyDetectionActions],
  sourceUrl: '/plugins/org.graylog.plugins.machinelearning/rules',
  startJoburl: '/plugins/org.graylog.plugins.machinelearning/jobaction',
  jobs: undefined,
  init() {
    this.trigger({ jobs: this.jobs });
  },
  list(type){
    const promise = fetch('POST', URLUtils.qualifyUrl(this.sourceUrl), {"job_type": type})
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

    console.log("in actions");
    AnomalyDetectionActions.list.promise(promise);
  },
  deletejob(jobid){
    var url = URLUtils.qualifyUrl("/plugins/org.graylog.plugins.machinelearning/rules/"+jobid);
    const promise = fetch('DELETE', url)
      .then(
        response => {
          UserNotification.success('Jod deleted');
          return true;
        },
        error => {
          UserNotification.error('deleting job failed');
        });
    AnomalyDetectionActions.deletejob.promise(promise);
  },
  startStreaming(jobid){
    console.log("startStreaming");
    var url = URLUtils.qualifyUrl("/plugins/org.graylog.plugins.machinelearning/rules/update/"+jobid);
    const promise = fetch('POST', url)
      .then(
        response => {
          UserNotification.success('Streaming updated ');
          return true
        },
        error => {
          UserNotification.error('starting Streaming failed ');
        });
    AnomalyDetectionActions.startStreaming.promise(promise);
  },
  startJob(obj){
    const promise = fetch('POST', URLUtils.qualifyUrl(this.startJoburl), obj)
      .then(
        response => {
          this.response = response
          this.trigger({ response: response });
          return this.response;
        },
        error => {
          UserNotification.error("starting job failed   ");
        });
    AnomalyDetectionActions.startJob.promise(promise);
  },
});

export default AnomalyDetectionStore;
