import React from 'react';
import $ from 'jquery';
import DateTime from 'logic/datetimes/DateTime';
import { DatePicker } from 'components/common';
import { Row, Col, Button } from 'react-bootstrap';
import {FormGroup, ControlLabel, FormControl} from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import AggregatesActions from 'machinelearning/AggregatesActions';
import { IfPermitted, PageHeader } from 'components/common';
import fetch from 'logic/rest/FetchProvider';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import "machinelearning/style.css"
import GraphPage from 'machinelearning/GraphPage'
import JobResultDisplay from './JobResultDisplay'
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
import * as d3 from "d3";
import "./style.css"
import { RingLoader } from 'react-spinners';


const JobsDisplay = React.createClass({
  componentDidMount(){
    console.log("componentDidMount");
    let tmpl = this;
    AnomalyDetectionActions.list("anomaly").then(jobs => {
      tmpl.setState({jobs: jobs})
    });
  },
  getInitialState() {
    return {
      jobs: [],
    };
  },
  _ruleInfoFormatter(job) {
    const view = (
      <i className="fa fa-table fa-2x"  onClick={this._viewjob} id={job.jobid}  title="view job"></i>
    );
    var start = null;
      if(job.loading) {

      start = <i onClick={this._startjob} id={job.jobid} className="fa fa-spinner fa-2x" title="start job" ></i>
      }else {
      start=  <i onClick={this._startjob} id={job.jobid} disabled className="fa  fa-play fa-2x" title="start job" ></i>

      }


    const del = (
      <i onClick={this._deletejob} id={job.jobid} className="fa fa-trash fa-2x" title="deletejob" ></i>
    );
    var st = null;
    if(job.streaming) {
      st= <i id={job.jobid} onClick={this._startStreaming} className="fa fa-pause fa-2x" title="streaming" ></i>
    } else {
      st=<i id={job.jobid} onClick={this._startStreaming} className="fa fa-forward fa-2x" title="streaming" ></i>
    }
    // const stream = ({st});
    const actions = (
        <td  className="actiontable">
        {start}&nbsp;&nbsp;
        {st} &nbsp;&nbsp;
        {view}&nbsp;&nbsp;
        {del}&nbsp;
        </td>
    );

    return (
      <tr key={job.jobid}>
      <td className="limited">{job.jobid}</td>
      <td className="limited">{job.streamName}</td>
      <td className="limited">{job.aggregationType}</td>
      <td className="limited">{job.field}</td>
      <td className="limited">{job.description}</td>
      {actions}
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
      if(status) {
        AnomalyDetectionActions.list("anomaly").then(jobs => {
          tmpl.setState({jobs: jobs})
        });
      }
    });
  }
},
_startStreaming(evt){
  let tmpl = this;
  console.log(evt.currentTarget.id);

    AnomalyDetectionActions.startStreaming(evt.currentTarget.id).then(status => {
      if(status) {
        AnomalyDetectionActions.list("anomaly").then(jobs => {
          tmpl.setState({jobs: jobs})
        });
      }
    });
},
 _viewjob(evt) {
  //  this.createInteractiveGraph();
   this.setState({viewGraphContent: true })
   this.setState({currentJobId:evt.currentTarget.id})
},
 _startjob(evt) {
   let tmpl = this;
   var index =tmpl.state.jobs.findIndex(x => x.jobid==evt.currentTarget.id);
   tmpl.state.jobs[index].loading = true
   var job =tmpl.state.jobs[index];
   if(job.streaming) return UserNotification.success("This job is on streaming mode cant start it !");
   tmpl.setState({jobs: tmpl.state.jobs});
   var obj = {
     "jobid" : job.jobid,
     "aggregationType" : job.aggregationType,
     "field" : job.field,
     "bucketSpan" : job.bucketSpan,
     "indexSetName" : job.indexSetName,
     "streaming" : job.streaming ? "T": "F",
     "max_docs": "100000",
     "sourceindextype" : "message",
     "timestampfield" : "timestamp",
     "anomaly_direction" : "both",
     "max_ratio_of_anomaly" : "0.02",
     "alpha_parameter" : "0.1",
     "query" : "*"
   }
   AnomalyDetectionActions.startJob(obj).then(response => {
     tmpl.state.jobs[index].loading = false;
     tmpl.setState({jobs: tmpl.state.jobs});
     if(response.stausCode === 201) {
       UserNotification.success("Job started successfully", response.message);
     }else {
       UserNotification.success("Job was not able to start with error messge", response.message, response.errorcode);
     }
   });
},
  render() {
    if(!this.state.jobs) {
      return null
    }
    else {
      let tmpl = this;
      let showCreateJob = null;
      let jobs = null;
      let dispContent = null;
      let table = null;
      let chart = null;
      let jobResult = null;

      const filterKeys = ['jobid','field', 'aggregationType'];
      const headers = ['Job Id', 'Stream Name',   'Aggregation Type', 'Field', 'Actions'];
      dispContent = (
        <DataTable id="job-list"
        className="table-hover table-condensed table-striped"
        headers={headers}
        headerCellFormatter={this._headerCellFormatter}
        rows={this.state.jobs}
        filterBy="field"
        noDataText="There are no anomaly jobs"
        dataRowFormatter={this._ruleInfoFormatter}
        filterLabel="Filter Jobs"
        filterKeys={filterKeys}/>
      );

      if(tmpl.state.viewGraphContent) {
        jobResult=<JobResultDisplay jobid={tmpl.state.currentJobId}/>
      }
        return (
            <div>
              <PageHeader>
                  {dispContent}
              </PageHeader>
              {jobResult}
            </div>
        );
    }
    },
  });

  export default JobsDisplay;
