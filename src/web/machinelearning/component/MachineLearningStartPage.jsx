import React from 'react';
import $ from 'jquery';
import JobsDisplay from './JobsDisplay';
import Reflux from 'reflux';
import { IfPermitted, PageHeader } from 'components/common';
import { Row, Col, Button, ButtonToolbar} from 'react-bootstrap';
import AggregatesActions from 'machinelearning/AggregatesActions';
import { LinkContainer } from 'react-router-bootstrap';


const MachineLearningStartPage = React.createClass({
  componentDidMount(){
  },
  getInitialState() {
    return {
      jobs: [],
    };
  },
  _handelClick(evt){
    let tmpl = this;
    AggregatesActions.getJobs(evt.currentTarget.id).then(jobs => {
      tmpl.setState({ jobs: jobs });
    });
  },
  render() {
    let tmpl = this;
    let jobTabs = [];
      [ {code: "anomaly", name: "Anomaly Detection", "text" : "Detect anomalies in a numeric time-series metric over a period of time"},
        {code: "forecasting", name: "Forecasting", text: "Forecast the future values of any time-series metric with seasonal and trending nature"}
      ].map(function(j) {
        jobTabs.push(
          <LinkContainer to={"/machineLearning/"+j.code}>
            <div  className="col-md-6" >
                <Button bsStyle="primary" bsSize="large" block>
                    <Row>
                      <Col className="col-md-12 ">
                        <span><b>{j.name}</b></span>
                      </Col>
                      <Col className="col-md-12">
                        <span>{j.text}</span>
                      </Col>
                    </Row>
                  </Button>
            </div>
            </LinkContainer>
        )
    })
      return (
        <span>
            <PageHeader title="Machine Learning">
              <span>
                Leverage SmartThink’s out-of-the-box machine learning algorithms to solve complex problems
              </span>
            </PageHeader>
            <PageHeader>
              <div>
                <ButtonToolbar>
                  {jobTabs}
                </ButtonToolbar>
              </div>
            </PageHeader>
        </span>
      );
    },
  });

  export default MachineLearningStartPage;
