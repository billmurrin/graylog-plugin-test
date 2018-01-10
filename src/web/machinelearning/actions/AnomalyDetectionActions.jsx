import Reflux from 'reflux';

const AnomalyDetectionActions = Reflux.createActions({
  list: { asyncResult: true },
  deletejob: { asyncResult: true },
  startStreaming: { asyncResult: true },
  startJob: { asyncResult: true },
  getFields: { asyncResult: true },
});

export default AnomalyDetectionActions;
