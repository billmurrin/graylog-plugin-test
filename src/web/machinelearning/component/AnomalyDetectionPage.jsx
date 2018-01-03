import React from 'react';
import $ from 'jquery';
import JobsDisplay from './JobsDisplay';
import Reflux from 'reflux';
import { IfPermitted, PageHeader } from 'components/common';
import { Row, Col, Button, ButtonToolbar} from 'react-bootstrap';
import AnomalyDetectionStore from 'machinelearning/stores/AnomalyDetectionStore';
import AnomalyDetectionActions from 'machinelearning/actions/AnomalyDetectionActions';
import { LinkContainer } from 'react-router-bootstrap';
const AnomalyDetectionPage = React.createClass({
  componentDidMount(){
    let tmpl = this;
    AnomalyDetectionActions.list("anomaly").then(jobs => {
        tmpl.setState({jobs: jobs})
      });
  },
  handelState(){
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
  render() {
      return (
        <div>
            <PageHeader title="Anomaly Detection">
              <span>
                Detect anomalies in a numeric time-series metric over a period of time
              </span>
              <span>
                You can learn more about the Anomaly Detection  in the{' '}
              </span>
              <span>
                <LinkContainer to={"/machineLearning/anomaly/createjob"}>
                  <Button className="buttonColor buttonBg" >Create Job </Button>
                </LinkContainer>
              </span>
            </PageHeader>
            <PageHeader >
              <JobsDisplay  handelState={this.handelState} />
            </PageHeader>
          </div>
      );
    },
  });

  export default AnomalyDetectionPage;
