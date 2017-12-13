import React from 'react';
import $ from 'jquery';
import DateTime from 'logic/datetimes/DateTime';
import { DatePicker } from 'components/common';
import { Row, Col, Button } from 'react-bootstrap';
import {FormGroup, ControlLabel, FormControl} from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import AggregatesActions from 'machinelearning/AggregatesActions';
import MachinelearningActions from 'machinelearning/MachinelearningActions';
// import StreamSelactBox from './StreamSelac
import { IfPermitted, PageHeader } from 'components/common';
import fetch from 'logic/rest/FetchProvider';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import "machinelearning/style.css"
import GraphPage from 'machinelearning/GraphPage'
import CreateJobForm from './CreateJobForm'
import ViewGraph from 'machinelearning/ViewGraph'
import BootstrapModalForm from 'components/bootstrap/BootstrapModalForm';
import Input from 'components/bootstrap/Input';
import moment from 'moment';
import { DataTable } from 'components/common';
import UserNotification from 'util/UserNotification';
import URLUtils from 'util/URLUtils';
import Reflux from 'reflux';
import StoreProvider from 'injection/StoreProvider';
const StreamsStore = StoreProvider.getStore('Streams');
const CurrentUserStore = StoreProvider.getStore('CurrentUser');
import CombinedProvider from 'injection/CombinedProvider';
const { AlertNotificationsStore } = CombinedProvider.get('AlertNotifications');
import AnomalyDetectionActions from 'machinelearning/actions/AnomalyDetectionActions';

const JobsDisplay = React.createClass({
  componentDidMount(){
    this.setState({jobs: this.props.jobs})
  },
  getInitialState() {
    return {
      jobs: [],
    };
  },
  _ruleInfoFormatter(job) {
    const view = (
      <i className="fa fa-eye fa-2x" onClick={this._viewjob} id={job.jobid}  title="view job"></i>
    );
    const start = (
      <i onClick={this._startjob} id={job.jobid} className="fa fa-play fa-2x" title="start job" ></i>
    );
    const del = (
      <i onClick={this._deletejob} id={job.jobid} className="fa fa-trash fa-2x" title="deletejob" ></i>
    );
    const actions = (
      <div>
        {view}&nbsp;&nbsp;{start}&nbsp;&nbsp;{del}&nbsp;
      </div>
    );

    return (
      <tr key={job.jobid}>
      <td className="limited">{job.jobid}</td>
      <td className="limited">{job.streamName}</td>
      <td className="limited">{job.aggregationType}</td>
      <td className="limited">{job.field}</td>
      <td>{actions}</td>
      </tr>

    );
  },
  _headerCellFormatter(header) {
    let formattedHeaderCell;

    switch (header.toLocaleLowerCase()) {
      case '':
      formattedHeaderCell = <th className="user-type">{header}</th>;
      break;
      case 'actions':
      formattedHeaderCell = <th className="actions">{header}</th>;
      break;
      default:
      formattedHeaderCell = <th>{header}</th>;
    }

    return formattedHeaderCell;
  },
_deletejob(evt){
  let tmpl = this;
  if (window.confirm(`Do you really want to delete job`)) {
    AnomalyDetectionActions.deletejob(evt.currentTarget.id).then(status => {
      tmpl.props.handelState()
    });
  }
},
 _viewjob(evt) {
   this.setState({viewGraphContent: true })
   this.setState({currentJobId:evt.currentTarget.id})
},
 _startjob(evt) {
   var job =this.props.jobs[this.props.jobs.findIndex(x => x.jobid==evt.currentTarget.id)];
   var obj = {
     "host_ip" : "SmartThink-Demo",
     "jobid" : job.jobid,
     "host_port" : "9200",
     "max_docs": "100000",
     "aggregationType" : job.aggregationType,
     "field" : job.field,
     "startDate" :moment(job.startDate).format("YYYY-MM-DD HH:mm:ss.SSS"),
     "endDate" : moment(job.endDate).format("YYYY-MM-DD HH:mm:ss.SSS"),
     "bucketSpan" : job.bucketSpan,
     "indexSetName" : job.indexSetName,
     "sourceindextype" : "message",
     "timestampfield" : "timestamp",
     "anom_index" : "anomaly_result",
     "anom_type" : "anomaly_type",
     "anomaly_direction" : "both",
     "max_ratio_of_anomaly" : "0.02",
     "alpha_parameter" : "0.1",
     "streaming" : "FALSE"
   }
   console.log(obj ," starting obj");
   AggregatesActions.startJob(obj).then(response => {
     console.log(response);
   });
},

  render() { 
    if(!this.props.jobs) {
      return null
    }
    else {
      let tmpl = this;
      let showCreateJob = null;
      let jobs = null;
      let dispContent = null;
      let table = null;
      let chart = null;

      const filterKeys = ['jobid','field', 'aggregationType'];
      const headers = ['Job Id', 'Stream Name',   'Aggregation Type', 'Field', 'Actions'];
      dispContent = (
        <DataTable id="job-list"
        className="table-hover table-condensed table-striped"
        headers={headers}
        headerCellFormatter={this._headerCellFormatter}
        rows={this.props.jobs}
        filterBy="field"
        noDataText="There are no anomaly jobs"
        dataRowFormatter={this._ruleInfoFormatter}
        filterLabel="Filter Jobs"
        filterKeys={filterKeys}/>
      );
        return (
            <PageHeader>
                  {dispContent}
            </PageHeader>
        );
    }
    },
  });

  export default JobsDisplay;
