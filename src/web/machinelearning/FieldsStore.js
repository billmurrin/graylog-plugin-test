import Reflux from 'reflux';
import URLUtils from 'util/URLUtils';
import fetch from 'logic/rest/FetchProvider';

import UserNotification from 'util/UserNotification';
import ApiRoutes from 'routing/ApiRoutes';

import ActionsProvider from 'injection/ActionsProvider';
const AlarmCallbackHistoryActions = ActionsProvider.getActions('AlarmCallbackHistory');
import MachinelearningActions from './MachinelearningActions';


const FieldsStore = Reflux.createStore({
  listenables: [MachinelearningActions],
  histories: undefined,

  getInitialState() {
    return { histories: this.histories };
  },

  getFields() {
    console.log("in new store ");
    // const url = URLUtils.qualifyUrl(ApiRoutes.AlarmCallbackHistoryApiController.list(streamId, alertId).url);
    // const promise = fetch('GET', url)
    //   .then(
    //     (response) => {
    //       this.histories = response.histories;
    //       this.trigger({ histories: this.histories });
    //       return this.histories;
    //     },
    //     (error) => {
    //       UserNotification.error(`Fetching notification history for alert '${alertId}' failed with status: ${error}`,
    //         'Could not retrieve notification history.');
    //     },
    //   );
    //
    // AlarmCallbackHistoryActions.list.promise(promise);
  },
});

export default FieldsStore;
