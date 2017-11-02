import React from 'react';
import { Row, Col, Button } from 'react-bootstrap';
import {FormGroup, ControlLabel, FormControl} from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import AggregatesActions from './AggregatesActions';
import StreamSelactBox from './StreamSelactBox';
import RulesList from './RulesList';
import EditRuleModal from './EditRuleModal';
import { IfPermitted, PageHeader } from 'components/common';
import elasticsearch from 'elasticsearch';
import fetch from 'logic/rest/FetchProvider';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import "./style.css"
import GraphPage from 'machinelearning/GraphPage'
import ViewGraph from 'machinelearning/ViewGraph'

import { DataTable } from 'components/common';

const MachineLearningPage = React.createClass({

  componentDidMount(){
    let tmpl = this;
    AggregatesActions.getJobs().then(jobs => {
      tmpl.setState({ jobs: jobs });
    });
  },

  getInitialState() {
    return {
      showCreateJob: false,
    };
  },
  handelCreatejob(evt) {
    this.setState({showCreateJob: !this.state.showCreateJob})

  },
  handleAnomalyDetection(evt){
    console.log(evt, "handleAnomalyDetection");
    console.log(elasticsearch, "elasticsearch instance")
    this.setState({showStreamForm: !this.state.showStreamForm})

  },
  stateChange(obj){
    this.setState({showCreateJob: false});
    this.setState({showStreamForm: false});
  },
  showJobDetails(evt){
    this.setState({showJobDetails: true})
    this.setState({currentJobId: evt.currentTarget.id})
    console.log(evt.currentTarget.id);
  },
  render() {
    const filterKeys = ['name', 'query', 'field', 'stream'];
    const headers = ['Rule name', 'Query', 'Alert condition', 'Stream', 'In report', 'Repeat notifications', 'Report schedule(s)'];

    let tmpl = this;
    let showCreateJob = null;
    let streamsform = null;
    let jobs = null;
    let jobDetails = null;

    let table = null;

    if(this.state.showStreamForm) {
      console.log("true");
      streamsform = (<Row className="content">
          <StreamSelactBox handler={this.stateChange}/>
      </Row>);
    }
    if(this.state.showCreateJob) {
      showCreateJob =  (
        <Row className="content">
          <Button bsSize="large" className="buttonColor buttonBg" onClick={this.handleAnomalyDetection} >Anomaly Detection</Button>
          <Button bsSize="large" disabled={this.state.showStream} className="buttonColor buttonBg" style={{marginLeft: 10}}> Forecasting </Button>
        </Row>
      );

    }else{
      jobs = (
        <PageHeader title="Job lists"> Jobs
        <table>
          <tr>
          <th>Aggrigation Type</th>
          <th>Start Date</th>
          <th>End Date</th>
          <th>Field</th>
          <th>Jobid</th>
          </tr>
          <tbody>
            {
              (tmpl.state.jobs || []).map(obj => {
                return (
                  <tr key={ obj.jobid }>
                    <td>{obj.aggrigationType}</td>
                    <td>{obj.startDate}</td>
                    <td>{obj.endDate}</td>
                    <td>{obj.field}</td>
                    <td>{obj.jobid}</td>
                    <td id={obj.jobid}  onClick={this.showJobDetails}> view</td>
                  </tr>
                 );
               })
            }
          </tbody>
        </table>
        <div>
          {table}
        </div>
        </PageHeader>

      );
    }


if(this.state.showJobDetails) {
  jobDetails = (
    <PageHeader title="JobDetails"> JobDetails
    <ViewGraph jobid={this.state.currentJobId}/>
    </PageHeader>

  )
}


    return (
      <span>
        <PageHeader title="Machine learning">
          <span>
            please define Machine learning here
          </span>
          <span>
          </span>
          <span>
            <div>
              <Button className="buttonColor buttonBg" onClick={this.handelCreatejob}>Create Job </Button>
            </div>
          </span>
        </PageHeader>
        {showCreateJob}
        {streamsform}
        {jobs}
        {jobDetails}
      </span>
    );
  },
});

export default MachineLearningPage;
