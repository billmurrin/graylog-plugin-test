import React from 'react';
import $ from 'jquery';
import JobsDisplay from './JobsDisplay';
import Reflux from 'reflux';
import { IfPermitted, PageHeader } from 'components/common';
import { Row, Col, Button, ButtonToolbar} from 'react-bootstrap';
import AggregatesActions from 'machinelearning/AggregatesActions';
import AnomalyDetectionStore from 'machinelearning/stores/AnomalyDetectionStore';
import AnomalyDetectionActions from 'machinelearning/actions/AnomalyDetectionActions';
import { LinkContainer } from 'react-router-bootstrap';


const ForecastingPage = React.createClass({
  componentDidMount(){
    let tmpl = this;
    AnomalyDetectionActions.list("forecasting").then(jobs => {
        tmpl.setState({jobs: jobs})
      });
  },
  handelState(){
    let tmpl = this;
    AnomalyDetectionActions.list().then(jobs => {
        tmpl.setState({jobs: jobs})
      });
  },
  getInitialState() {
    return {
      jobs: [],
    };
  },
  render() {
      return (
          <div>
            <PageHeader title="Forecasting">
              <span>
                Forecast the future values of any time-series metric with seasonal and trending nature
              </span>
              <span>
                You can learn more about the Forecast  in the{' '}
              </span>
              <span>
                <LinkContainer to={"/machineLearning/forecasting/createjob"}>
                  <Button className="buttonColor buttonBg" >Create Job </Button>
                </LinkContainer>
              </span>
            </PageHeader>
            <PageHeader >
              <JobsDisplay jobs={this.state.jobs} handelState={this.handelState} />
            </PageHeader>
          </div>
      );
    },
  });

  export default ForecastingPage;
