import Reflux from 'reflux';

const AggregatesActions = Reflux.createActions({
  list: { asyncResult: true },
  create: { asyncResult: true },
  deleteByName: { asyncResult: true },
  update: { asyncResult: true },
  createSchedule: { asyncResult: true },
  listSchedules: { asyncResult: true },
  deleteScheduleByName: { asyncResult: true },
  updateSchedule: { asyncResult: true },
  getJobs: { asyncResult: true },
  startJob: { asyncResult: true },
  startJob2: { asyncResult: true },
  deletejob: { asyncResult: true },
  getConfigs: { asyncResult: false },
  getJob: { asyncResult: false },
  getJobs2: { asyncResult: false },
  getJobDetails: { asyncResult: false },
  getFields: { asyncResult: false },
});

export default AggregatesActions;
