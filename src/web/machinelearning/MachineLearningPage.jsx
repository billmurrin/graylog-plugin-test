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

const MachineLearningPage = React.createClass({

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
  render() {
    let showCreateJob = null;
    let streamsform = null;
    if(this.state.showStreamForm) {
      console.log("true");
      streamsform = (<Row className="content">
          <StreamSelactBox/>
      </Row>);
    }
    if(this.state.showCreateJob) {
      showCreateJob =  (
        <Row className="content">
          <Button bsSize="large" className="buttonColor buttonBg" onClick={this.handleAnomalyDetection} >Anomaly Detection</Button>
          <Button bsSize="large" disabled={this.state.showStream} className="buttonColor buttonBg" style={{marginLeft: 10}}> Forecasting </Button>
        </Row>
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
      </span>
    );
  },
});

export default MachineLearningPage;
