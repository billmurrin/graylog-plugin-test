import React from 'react';
import { Row, Col, Button } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import AggregatesActions from './AggregatesActions';
import RulesList from './RulesList';
import EditRuleModal from './EditRuleModal';
import { IfPermitted, PageHeader } from 'components/common';

const AggregatesPage = React.createClass({
  mixins: [],
  _createRule(rule, callback) {
    AggregatesActions.create.triggerPromise(rule)
      .then(() => {
        callback();
        return null
      });
  },
  render() {
    return (
      <span>
        <PageHeader title="Machine learning">
          <span>
            please define Machine learning here
          </span>

          <span>
            <IfPermitted permissions="aggregate_rules:create">
              <EditRuleModal create createRule={this._createRule}/>
            </IfPermitted>
          </span>
          <span>
            <IfPermitted permissions="aggregate_report_schedules:read">
              <LinkContainer to="/machinelearning/schedules">
                <Button bsStyle="info" type="submit">Manage Report Schedules</Button>
              </LinkContainer>
            </IfPermitted>
          </span>
        </PageHeader>


        <Row className="content">
          <Col md={12}>
            <IfPermitted permissions={['aggregate_rules:read', 'aggregate_report_schedules:read']}>
              <RulesList />
            </IfPermitted>
          </Col>
        </Row>
      </span>
    );
  },
});

export default AggregatesPage;
