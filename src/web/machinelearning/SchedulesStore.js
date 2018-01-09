import Reflux from 'reflux';
import URLUtils from 'util/URLUtils';
import UserNotification from 'util/UserNotification';
import fetch from 'logic/rest/FetchProvider';
import SchedulesActions from './SchedulesActions';

const SchedulesStore = Reflux.createStore({
  listenables: [SchedulesActions],
  sourceUrl: '/plugins/org.graylog.plugins.analytics/jobs/fields',
  fields: undefined,

  init() {
    this.trigger({ fields: this.fields });
  },

  getFields(index) {
    const promise = fetch('POST', URLUtils.qualifyUrl(this.sourceUrl)+"/"+index )
      .then(
        response => {
          this.fields = response;
          this.trigger({ fields: this.fields });
          return this.fields;
        },
        error => {
          UserNotification.error(`Fetching schedules failed with status: ${error}`,
            'Could not retrieve schedules');
        });
    SchedulesActions.getFields.promise(promise);
  },
});

export default SchedulesStore;
