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


const MachineLearningPage = React.createClass({

  componentDidMount(){
    let tmpl = this;

    fetch('GET', "http://localhost:9000/api/plugins/org.graylog.plugins.aggregates/rules").then(function(x) {
      tmpl.setState({jobs: x.jobs})
  }, function(err) {
    console.log(err);
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
  render() {
    let showCreateJob = null;
    let streamsform = null;
    let jobs = null;
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
        <PageHeader title="Job lists">
        <BootstrapTable data={this.state.jobs} striped={true} hover={true}>
            <TableHeaderColumn dataField="jobid" isKey={true} dataAlign="center">Job name</TableHeaderColumn>
            <TableHeaderColumn dataField="aggrigationType"  >Aggrigation Type</TableHeaderColumn>
            <TableHeaderColumn dataField="endDate" dataSort={true}>End Date</TableHeaderColumn>
            <TableHeaderColumn dataField="startDate" dataSort={true}>Start Date</TableHeaderColumn>
            <TableHeaderColumn dataField="field" >Field</TableHeaderColumn>
        </BootstrapTable>
        </PageHeader>
      );
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
      </span>
    );
  },
});

export default MachineLearningPage;
