import React from 'react'
import Reflux from 'reflux'
import PermissionsMixin from 'util/PermissionsMixin'
import SchedulesStore from './SchedulesStore'
import SchedulesActions from './SchedulesActions'
import EditScheduleModal from './EditScheduleModal'
import StoreProvider from 'injection/StoreProvider'
import { DataTable, Spinner, IfPermitted } from 'components/common'

const SchedulesList = React.createClass({
  mixins: [Reflux.connect(SchedulesStore)],
  getInitialState () {
    return {
      reportSchedules: undefined
    }
  },
  _editSchedule (originalName, reportSchedules, callback) {
    SchedulesActions.update.triggerPromise(originalName, reportSchedules)
      .then(() => {
        callback()
      })
  },
  componentDidMount () {
    this.list()
  },
  list () {
    SchedulesActions.list().then(newSchedules => {
      this.setState({reportSchedules: newSchedules})
      console.log('list() state.reportSchedules: ' + JSON.stringify(this.state.reportSchedules));
    })
  },
  delete (id) {
    SchedulesActions.delete(id)
  },
  _deleteScheduleFunction (id, name) {
    return () => {
      if (window.confirm('Do you really want to delete schedule ' + name + '?')) {
        this.delete(id)
      }
    }
  },
  _headerCellFormatter (header) {
    let formattedHeaderCell

    switch (header.toLocaleLowerCase()) {
      case '':
        formattedHeaderCell = <th className="user-type">{header}</th>
        break
      case 'actions':
        formattedHeaderCell = <th className="actions">{header}</th>
        break
      default:
        formattedHeaderCell = <th>{header}</th>
    }

    return formattedHeaderCell
  },
  _scheduleInfoFormatter (reportSchedule) {
    const deleteAction = (
      <IfPermitted permissions="aggregate_rules:delete">
        <button id="delete-reportSchedule" type="button" className="btn btn-xs btn-primary" title="Delete schedule"
              onClick={this._deleteScheduleFunction(reportSchedule._id, reportSchedule.name)} disabled={reportSchedule.default}>
          Delete
        </button>
      </IfPermitted>
    );


    const editAction = (
      <IfPermitted permissions="aggregate_rules:update">
        <EditScheduleModal create={false} createReportSchedule={this._editSchedule} reportSchedule={reportSchedule}/>
      </IfPermitted>
    );

	  

    const actions = (
      <div>
        {deleteAction}
        &nbsp;
        {editAction}
      </div>
    );
        
    
    return (
      <tr key={reportSchedule.name}>
      	<td className="limited">{reportSchedule.name}</td>
        <td className="limited">{reportSchedule.expression}</td>
        <td className="limited">{reportSchedule.timespan}</td>
        <td className="limited">{reportSchedule.nextFireTime != null ? new Date(reportSchedule.nextFireTime).toString() : 'unknown'}</td>
        <td>{actions}</td>
      </tr>
    );
  },
  render () {
    const filterKeys = ['name'];
    const headers = ['Schedule name', 'Cron Expression', 'Timespan', 'Next Fire Time'];
    
    console.log('state: ' + JSON.stringify(this.state));
    
    if (this.state.reportSchedules) {
      return (
        <div>
          <DataTable id="schedule-list"
                     className="table-hover"
                     headers={headers}
                     headerCellFormatter={this._headerCellFormatter}
                     sortByKey={"name"}
                     rows={this.state.reportSchedules}
                     filterBy="field"                     
                     dataRowFormatter={this._scheduleInfoFormatter}
                     filterLabel="Filter Rules"
                     filterKeys={filterKeys}/>
        </div>
      );
    }

    return <Spinner />;
  },
});

export default SchedulesList;
