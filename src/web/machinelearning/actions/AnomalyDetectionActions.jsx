import Reflux from 'reflux';

const AnomalyDetectionActions = Reflux.createActions({
  list: { asyncResult: true },
  deletejob: { asyncResult: true },
  startStreaming: { asyncResult: true },
});

export default AnomalyDetectionActions;
