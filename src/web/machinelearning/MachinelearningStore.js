import Reflux from 'reflux';
import URLUtils from 'util/URLUtils';
import UserNotification from 'util/UserNotification';
import fetch from 'logic/rest/FetchProvider';
import MachinelearningActions from './MachinelearningActions';
import AppConfig from 'util/AppConfig';
const fetchOpenCpu = require('logic/rest/FetchProvider').fetchOpenCpu;
import moment from 'moment';

const MachinelearningStore = Reflux.createStore({
  listenables: [MachinelearningActions],
  sourceUrl: '/plugins/org.graylog.plugins.analytics/mlJobs',
  init() {
    this.trigger({ jobs: this.jobs });
    //
  },
  getFields(){
    console.log("in get fields ");
    const promise = fetch('POST', "http://localhost:9000/api/plugins/org.graylog.plugins.analytics/jobs/fields")
      .then(
        response => {
          console.log(response);
        },
        error => {
          UserNotification.error(`Fetching aggregate rules failed with status: ${error}`,
            'Could not retrieve rules');
        });
    MachinelearningStore.getFields.promise(promise);
  }


});

export default MachinelearningStore;
