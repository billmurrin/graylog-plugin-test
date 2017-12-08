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


const JobsDisplay = React.createClass({
  componentDidMount(){
    let tmpl = this;
    AggregatesActions.getJobs(this.props.jobType).then(jobs => {
      tmpl.setState({ jobs: jobs });
    });
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
      <td className="limited">{job.aggregationType}</td>
      <td className="limited">{job.startDate}</td>
      <td className="limited">{job.endDate}</td>
      <td className="limited">{job.field}</td>
      <td className="limited">{job.jobid}</td>
      <td className="limited">{job.jobType}</td>
      <td>{actions}</td>
      </tr>

    );
  },
  _isValidDateString(dateString) {
    try {
      if (dateString !== undefined) {
        DateTime.parseFromString(dateString);
      }
      return true;
    } catch (e) {
      return false;
    }
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
  showCreateJobForm(){
      this.setState({ createJobForm: !this.state.createJobForm });
  },
 handler(state) {

   switch (state) {
     case "showJobs":
     this.setState({createJobForm: false })
       break;
     case "showCreateJob":
     this.setState({createJobForm: true })
       break;
     case "closeGraphDetails":
     this.setState({viewGraphContent: false })
     this.setState({createJobForm: false })
       break;
     default:

   }
   console.log(this.state);
},
 _viewjob(evt) {
   this.setState({viewGraphContent: true })
   this.setState({currentJobId:evt.currentTarget.id})
},
 _startjob(evt) {
   console.log(this.state);
   console.log(this.state.jobs);
   console.log(this.state.jobs[this.state.jobs.findIndex(x => x.jobid==evt.currentTarget.id)]);
   var job =this.state.jobs[this.state.jobs.findIndex(x => x.jobid==evt.currentTarget.id)];

   var obj = {
     "host_ip" : "localhost",
     "jobid" : job.jobid,
     "aggregationType" : job.aggregationType,
     "field" : job.field,
     "startDate" : job.startDate,
     "end_date" : job.endDate,
     "bucketSpan" : job.bucketSpan,
     "indexSetName" : job.indexSetName,
     "sourceindextype" : "message",
     "timestampfield" : "timestamp",
     "anom_index" : "anomaly_result",
     "anom_type" : "anomaly_type",
     "anomaly_direction" : "both",
     "max_ratio_of_anomaly" : "0.02",
     "alpha_parameter" : "0.1"
   }

console.log(obj ," starting obj");
   AggregatesActions.startJob(obj).then(response => {
     console.log(response);
   });
},

  render() {
    if(!this.props.jobType) {
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
      const headers = ['Aggregation Type', 'Start Date', 'EndDate', 'Field', 'Job Id', 'Job Type'];
      if(this.state.viewGraphContent) {
          dispContent = ( <ViewGraph jobid={this.state.currentJobId} handler={this.handler}/> )
      }
      else {
          if(this.state.createJobForm ) {
            dispContent = (
              <div>
                <CreateJobForm handelState={tmpl.handler} />
                <div id="graph"></div>
              </div>
            );
          }
          else {
            dispContent = (
              <DataTable id="job-list"
              className="table-hover"
              headers={headers}
              headerCellFormatter={this._headerCellFormatter}
              rows={this.state.jobs}
              filterBy="field"
              dataRowFormatter={this._ruleInfoFormatter}
              filterLabel="Filter Jobs"
              filterKeys={filterKeys}/>
            );
          }
      }

        return (
          <div>
          <Button className="buttonColor buttonBg" onClick={this.showCreateJobForm}>Create Job </Button>
            <PageHeader>
                <div>
                  {dispContent}
                </div>
            </PageHeader>
          </div>
        );
    }
    },
  });

  export default JobsDisplay;
