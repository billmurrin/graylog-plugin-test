import React from 'react';
import $ from 'jquery';
import MachinelearningActions from 'machinelearning/MachinelearningActions';
import JobTypesTab from './JobTypesTab';
import JobsDisplay from './JobsDisplay';
import Reflux from 'reflux';
import { IfPermitted, PageHeader } from 'components/common';
import { Row, Col, Button, ButtonToolbar} from 'react-bootstrap';

const MachineLearningStartPage = React.createClass({
  componentDidMount(){
    console.log("???????????");
  },
  getInitialState() {
    return {
      jobs: [],
    };
  },
  _handelClick(evt){
    this.setState({jobType: evt.currentTarget.id})
  },
  render() {
    let tmpl = this;
    let jobTabs = [];
      [ {code: "anomaly", name: "Anomaly Detection"},
        {code: "forcasting", name: "Forcasting"}
      ].map(function(j) {
        jobTabs.push(
            <div className="col-sm-3" >
                <Button id={j.code} onClick={tmpl._handelClick}  key={j.code} bsStyle="primary" bsSize="large">{j.name}</Button>
            </div>
        )
    })
      return (
        <span>
            <PageHeader title="Machine learning">
              <span>
              This tab gives  ability to learn/deap learn of your log data
              </span>
            </PageHeader>
            <PageHeader>
              <div className="row-sm-12">
                <ButtonToolbar>
                  {jobTabs}
                </ButtonToolbar>
              </div>
            </PageHeader>
            <div className="row-sm-12">
              <JobsDisplay jobType={this.state.jobType}/>
            </div>
        </span>
      );
    },
  });

  export default MachineLearningStartPage;
