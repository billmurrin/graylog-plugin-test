import React from 'react';
import $ from 'jquery';
import MachinelearningActions from 'machinelearning/MachinelearningActions';
import Reflux from 'reflux';
import { IfPermitted, PageHeader } from 'components/common';
import { Row, Col, Button, ButtonToolbar } from 'react-bootstrap';


const JobTypesTab = React.createClass({
  componentDidMount(){
    let jobs = [
                {code: "anomaly", name: "Anomaly Detection"},
                {code: "forcasting", name: "Forcasting"}
              ];
    this.setState(jobs: jobs)
  },
  getInitialState() {
    return {
      jobs: [],
    };
  },
  render() {
      return (
        <div>
              <ButtonToolbar>
                <Button bsStyle="primary" bsSize="large">Large button</Button>
                <Button bsSize="large">Large button</Button>
            </ButtonToolbar>
        </div>
      );
    },
  });

  export default JobTypesTab;
