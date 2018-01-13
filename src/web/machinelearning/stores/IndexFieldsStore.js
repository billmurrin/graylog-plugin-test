import Reflux from 'reflux';
import URLUtils from 'util/URLUtils';
import UserNotification from 'util/UserNotification';
import fetch from 'logic/rest/FetchProvider';
import IndexFieldsAction from 'machinelearning/actions/IndexFieldsAction';

const IndexFieldsStore = Reflux.createStore({
  listenables: [IndexFieldsAction],
  sourceUrl: '/plugins/org.graylog.plugins.analytics/jobs/fields',
  fields: undefined,

  init() {
    this.trigger({ fields: this.fields });
  },

  getmanju(index) {
    console.log(index);
    console.log("in storessdfh");
    console.log(this.sourceUrl);
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
    IndexFieldsAction.getFields.promise(promise);
  },
});

export default IndexFieldsStore;
