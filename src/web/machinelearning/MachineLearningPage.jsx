import React from 'react';
import $ from 'jquery';
import DateTime from 'logic/datetimes/DateTime';
import { DatePicker } from 'components/common';
import { Row, Col, Button } from 'react-bootstrap';
import {FormGroup, ControlLabel, FormControl} from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import AggregatesActions from './AggregatesActions';
import MachinelearningActions from './MachinelearningActions';
// import StreamSelactBox from './StreamSelactBox';
import RulesList from './RulesList';
import EditRuleModal from './EditRuleModal';
import { IfPermitted, PageHeader } from 'components/common';
import elasticsearch from 'elasticsearch';
import fetch from 'logic/rest/FetchProvider';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import "./style.css"
import GraphPage from 'machinelearning/GraphPage'
import client from 'machinelearning/ElasticSearch'
import ViewGraph from 'machinelearning/ViewGraph'
import BootstrapModalForm from 'components/bootstrap/BootstrapModalForm';
import Input from 'components/bootstrap/Input';
import moment from 'moment';
import { DataTable } from 'components/common';
import { Line } from "react-chartjs";
import UserNotification from 'util/UserNotification';
import URLUtils from 'util/URLUtils';

import Reflux from 'reflux';
import AggregatesStore from './AggregatesStore';


import StoreProvider from 'injection/StoreProvider';
const StreamsStore = StoreProvider.getStore('Streams');
const CurrentUserStore = StoreProvider.getStore('CurrentUser');

import CombinedProvider from 'injection/CombinedProvider';
const { AlertNotificationsStore } = CombinedProvider.get('AlertNotifications');

import { Spinner } from 'components/common';
import PermissionsMixin from 'util/PermissionsMixin';
import SchedulesActions from './SchedulesActions';
var chartOptions = {
  bezierCurve : false,
  datasetFill : false,
  pointDotStrokeWidth: 4,
  scaleShowVerticalLines: false,
  responsive: true
};

// var client = ElasticSearch;
const MachineLearningPage = React.createClass({
  mixins: [Reflux.connect(CurrentUserStore), Reflux.connect(AggregatesStore), Reflux.connect(AlertNotificationsStore)],
  componentDidMount(){
    let tmpl = this;
    AggregatesActions.getJobs().then(jobs => {
      tmpl.setState({ jobs: jobs });
    });
    var aggs = [
      {code: 'avg', value: "Mean"},
      {code: 'sum', value: "Sum"},
      {code: 'min', value: "Min"},
      {code: 'max', value: "Max"},
    ]
    var an = [];
    aggs.map(function(a) {
      an.push(<option key={a.code} value={a.code}> {a.value} </option>);
    })
    tmpl.setState({
      typeOPs: an
    })
    var jobTypes = [
      {code: 'anomaly', value: "Anomaly"},
      {code: 'forcast', value: "Forcast"}
    ]
    var jt = [];
    jobTypes.map(function(a) {
      jt.push(<option key={a.code} value={a.code}> {a.value} </option>);
    })
    tmpl.setState({
      jobTypeops: jt
    })

    var buckets = [
      {code: '5m', value: "5m"},
      {code: '10m', value: "10m"},
      {code: '20m', value: "20m"},
      {code: '30m', value: "30m"},
      {code: '40m', value: "40m"},
      {code: '50m', value: "50m"},
      {code: '60m', value: "60m"},
      {code: '70m', value: "70m"},
      {code: '80m', value: "80m"},
      {code: '3h', value: "3h"},
      {code: '5h', value: "5h"},
      {code: '10h', value: "10h"},
      {code: '20h', value: "20h"},
      {code: '30h', value: "30h"},

    ]
    var buck = []
    buckets.map(function(k) {
      buck.push(<option key={k.code} value={k.code}> {k.value} </option>);
    })
    tmpl.setState({
      buck: buck
    })
    const failCallback = (errorThrown) => {
      console.log("errorThrown", errorThrown)
    };
    var callback = function(res) {
      var arrTen = [];
      console.log(res);
      // console.log(res.streams);
      res.streams.map(function(s) {
        arrTen.push(<option id={s.index_set_id} key={s.id} value={s.id}> {s.description} </option>);
      })
      tmpl.setState({
        opts: arrTen
      });
    }
    fetch('GET', URLUtils.qualifyUrl("/streams/")).then(callback, failCallback);
  },
  getInitialState() {
    return {
      showCreateJob: false,
    };
  },
  showJobDetails(jobid){
    this.setState({showJobDetails: true})
    this.setState({currentJobId: jobid})
  },
  _ruleInfoFormatter(job) {
    const view = (
      <i className="fa fa-eye fa-2x" onClick={this._viewjob} id={job.jobid}  title="view job"></i>
    );
    const start = (
      <i onClick={this._startjob} id={job.jobid} className="fa fa-play fa-2x" title="start job" ></i>
    );
    const del = (
      <i onClick={this._deletejob} id={job.jobid} className="fa fa-trash fa-2x" title="deletejob" ></i>
    );
    const actions = (
      <div>
        {view}&nbsp;&nbsp;{start}&nbsp;&nbsp;{del}&nbsp;
      </div>
    );
    return (
      <tr key={job.jobid}>
      <td className="limited">{job.aggrigationType}</td>
      <td className="limited">{job.startDate}</td>
      <td className="limited">{job.endDate}</td>
      <td className="limited">{job.field}</td>
      <td className="limited">{job.jobid}</td>
      <td className="limited">{job.jobType}</td>
      <td>{actions}</td>
      </tr>
    );
  },
  _isValidDateString(dateString) {
    try {
      if (dateString !== undefined) {
        DateTime.parseFromString(dateString);
      }
      return true;
    } catch (e) {
      return false;
    }
  },
  _headerCellFormatter(header) {
    let formattedHeaderCell;

    switch (header.toLocaleLowerCase()) {
      case '':
      formattedHeaderCell = <th className="user-type">{header}</th>;
      break;
      case 'actions':
      formattedHeaderCell = <th className="actions">{header}</th>;
      break;
      default:
      formattedHeaderCell = <th>{header}</th>;
    }

    return formattedHeaderCell;
  },
  openModal(){
    this.refs.modal.open();
  },
  _onValueChanged(event) {
    var job = this.state.job;

    const parameter = event.target.name;
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    if(!job)  job = {};
    job[parameter] = value.trim();
    this.setState({ job: job });
  },
  _viewjob(evt){
    let tmpl = this;
    tmpl.setState({showJobDetails:true})
    tmpl.setState({currentJobId:evt.currentTarget.id})
  },
  _startjob(evt){
    let tmpl = this;;
     var job = this.state.jobs.find(x => x.jobid === evt.currentTarget.id);
    AggregatesActions.startJob2(job).then(status => {
      console.log(status);
    });
  },
  _deletejob(evt){
    let tmpl = this;
    if (window.confirm(`Do you really want to delete job`)) {
      AggregatesActions.deletejob(evt.currentTarget.id).then(status => {
        AggregatesActions.getJobs().then(jobs => {
          tmpl.setState({ jobs: jobs ? jobs: [] });
        });
      });
    }
  },
  handelStreamChange(evt){
    let tmpl = this;
    var streamName = evt.currentTarget.value;
    const job = this.state.job;
    const parameter = evt.target.name;
    const value = evt.target.type === 'checkbox' ? evt.target.checked : evt.target.value;
    job[parameter] =value;
    var url = URLUtils.qualifyUrl("/system/indices/index_sets/"+ $(evt.target).find('option:selected').attr('id'));
      var callback = function(res) {
        job.indexSetName = res.index_prefix;
        tmpl.setState({ job: job });
        SchedulesActions.getFields( job.indexSetName+"_0").then(fields => {
          var arrTen = [];
          fields.map(function(k) {
            arrTen.push(<option key={k} value={k}> {k} </option>);
          })
            tmpl.setState({
              optsFields: arrTen
            });
        });
      }
      var failCallback = function(err) {
        console.log(err);
      }
      fetch('GET', url).then(callback, failCallback);
  },
  _setDateTimeToNow(field) {
    return () => {
      const inputNode = this.refs[`${field}Formatted`].getInputDOMNode();
      inputNode.value = new DateTime().toString(DateTime.Formats.DATETIME);
      this._rangeParamsChanged(field)();
    };
  },
  showGraph(){
    let tmpl = this;
    const job = this.state.job;
    var query = {
        "range": {
          "timestamp": {
            "gte": moment(job.startDate).format("YYYY-MM-DD HH:mm:ss.SSS"),
            "lte": moment(job.endDate).format("YYYY-MM-DD HH:mm:ss.SSS")
          }
        }
    }
    var aggs = {
          bucket_time: {
            "date_histogram": {
              "field": "timestamp",
              "interval": this.state.job.bucketSpan,
            },
            aggs: {
              "server_stats": {
              }
            }
          }
        }
        aggs.bucket_time.aggs.server_stats[job.aggrigationType] = {"field": this.state.job.field}
        console.log(JSON.stringify({query, aggs}));
        client.search({
          index: job.indexSetName+"_0",
          body: {query, aggs}
        }).then(function (resp) {
          var hits = resp.hits.hits;
          console.log(hits);
          var d =    {
            chartData: {
              labels: [],
              datasets: [
                {
                  fillColor: "#25BDFF",
                  strokeColor: "#25BDFF",
                  data: []
                }
              ]
            }}
            resp.aggregations.bucket_time.buckets.map(function(b) {
              d.chartData.labels.push(moment(b.key_as_string).format("YYYY-MM-DD"))
              d.chartData.datasets[0].data.push(b.server_stats.value)
            })
            tmpl.setState({rawData:resp.aggregations.bucket_time.buckets});
            tmpl.setState({chartData:d.chartData})
            tmpl.setState({showLine:true})
          }, function (err) {
            // console.trace(err.message);
          });
        this.setState({graphDisplayed: true})
        return;
  },
  _save(){
    let tmpl = this;
    const failCallback = (errorThrown) => {
      console.log("errorThrown", errorThrown)
    };
    var callback = function(k) {
        tmpl.refs.modal.close();
        AggregatesActions.getJobs().then(jobs => {
          tmpl.setState({ jobs: jobs });
        });
    }
    fetch('PUT', URLUtils.qualifyUrl("/plugins/org.graylog.plugins.machinelearning/rules"), {job: this.state.job}).then(callback, failCallback);
  },
  _onDateSelected(field) {
    return (date, _, event) => {
      const inputField = this.refs[`${field}Formatted`].getInputDOMNode();
      const midnightDate = date.setHours(0);
      inputField.value = DateTime.ignoreTZ(midnightDate).toString(DateTime.Formats.DATETIME);
      this._rangeParamsChanged(field)();
    };
  },
  _rangeParamsChanged(key) {
    var job = this.state.job;
    let tmpl = this;
    if(!job)  job = {};
    return () => {
      let refInput;
      switch (key) {
        case 'startDate':
        case 'endDate':
          const ref = `${key}Formatted`;
          refInput = this.refs[ref];
          if (!this._isValidDateString(refInput.getValue())) {
            refInput.getInputDOMNode().setCustomValidity('Invalid date time provided');
          } else {
            refInput.getInputDOMNode().setCustomValidity('');
          }
          break;
        default:
          refInput = this.refs[key];
      }
      job[key] = moment(refInput.getValue()).format("YYYY-MM-DD"),
      tmpl.setState({job: job});
    };
  },
  render() {

    let tmpl = this;
    let showCreateJob = null;
    let jobs = null;
    let jobsdetails = null;
    let table = null;
    let chart = null;
   const filterKeys = ['jobid','field', 'aggrigationType'];
    const headers = ['Aggrigation Type', 'Start Date', 'EndDate', 'Field', 'Job Id', 'Job Type'];
    if(this.state.jobs && !this.state.showJobDetails) {
      jobsdetails = (
        <PageHeader>
        <DataTable id="job-list"
        className="table-hover"
        headers={headers}
        headerCellFormatter={this._headerCellFormatter}
        rows={this.state.jobs}
        filterBy="field"
        dataRowFormatter={this._ruleInfoFormatter}
        filterLabel="Filter Jobs"
        filterKeys={filterKeys}/>
        </PageHeader>)

      }
      else {
        jobsdetails = (
            <PageHeader title="JobDetails"> JobDetails
              <ViewGraph jobid={this.state.currentJobId}/>
            </PageHeader>
            )
      }
      if(this.state.showLine) {
        // console.log(this.state.chartData);
        chart = (<Line data={this.state.chartData} options={chartOptions} width="1100" height="540" />);
      }
      return (
        <span>
          <PageHeader title="Machine learning">
              <span>
              please define Machine learning here
              </span>
            <span>
              <div>
                <Button className="buttonColor buttonBg" onClick={this.openModal}>Create Job </Button>
              </div>
              <BootstrapModalForm ref="modal"
                title={'Create Job' }
                onSubmitForm={this._save}
                submitButtonText="Save"
                submitButtonDisabled={!this.state.graphDisplayed}>
                  <fieldset>
                      <Input ref="jobid" name="jobid" id="jobid" type="text" maxLength={100} defaultValue={this.state.originalName}
                      labelClassName="col-sm-2" wrapperClassName="col-sm-10"
                      label="Name" help="Enter a unique job id." required
                      onChange={this._onValueChanged} autoFocus />
                     <Input ref="jobType" name="jobType" id="jobType" type="select" value={this.state.jobType}
                        labelClassName="col-sm-2" wrapperClassName="col-sm-10"
                        label="Job Type" help="Select a job Type." required
                        onChange={this._onValueChanged} ><option value="true">Select</option>
                         {this.state.jobTypeops}
                      </Input>
                     <Input ref="type" name="aggrigationType" id="aggrigationType" type="select" value={this.state.type}
                        labelClassName="col-sm-2" wrapperClassName="col-sm-10"
                        label="Aggrigation Type" help="Select a aggrigation type." required
                        onChange={this._onValueChanged} ><option value="true">Select</option>
                         {this.state.typeOPs}
                      </Input>
                      <Input ref="streamName" name="streamName" id="streamName" type="select" value={this.state.streamName}
                        labelClassName="col-sm-2" wrapperClassName="col-sm-10"
                        label="Stream" help="Select a stream." required
                        onChange={this.handelStreamChange} > <option value="true">Select</option>
                         {this.state.opts}
                      </Input>
                      <Input ref="fields" name="field" id="fields" type="select" value={this.state.field}
                        labelClassName="col-sm-2" wrapperClassName="col-sm-10"
                        label="Field" help="Select a field." required
                        onChange={this._onValueChanged} > {this.state.optsFields}
                      </Input>
                      <Input ref="bucketSpan" name="bucketSpan" id="bucketSpan" type="select" value={this.state.bucket}
                        labelClassName="col-sm-2" wrapperClassName="col-sm-10"
                        label="time span" help="Select time span." required
                        onChange={this._onValueChanged} > {this.state.buck}
                      </Input>
                      <div className="row no-bm" style={{ marginLeft: 50 }}>
                        <div className="col-md-6" style={{ padding: 0 }}>
                          <DatePicker id="searchFromDatePicker"
                            title="Search start date"
                            onChange={this._onDateSelected('startDate')} className="form-control">
                            <Input type="text"
                            ref="startDateFormatted"
                            onChange={this._rangeParamsChanged('startDate')}
                            placeholder={DateTime.Formats.DATETIME}
                            label="Start"
                            buttonAfter={<Button bsSize="small" onClick={this._setDateTimeToNow('startDate')}><i className="fa fa-magic" /></Button>}
                            bsSize="small"
                            required />
                          </DatePicker>
                        </div>
                        <div className="col-md-5" style={{ padding: 0 }}>
                          <DatePicker id="searchToDatePicker"
                            title="Search End date"
                            onChange={this._onDateSelected('endDate')} className="form-control">
                            <Input type="text"
                            ref="endDateFormatted"
                            labelClassName="col-sm-2"
                            label="End"
                            onChange={this._rangeParamsChanged('endDate')}
                            placeholder={DateTime.Formats.DATETIME}
                            buttonAfter={<Button bsSize="small" onClick={this._setDateTimeToNow('startDate')}><i className="fa fa-magic" /></Button>}
                            bsSize="small"
                            required />
                          </DatePicker>
                        </div>
                      </div>
                      <button onClick={this.showGraph} id="view-job" type="button" className="btn btn-xs btn-primary pull-right" title="view job">
                        View graph
                      </button>
                      {chart}
                  </fieldset>
              </BootstrapModalForm>
            </span>
          </PageHeader>
          {jobsdetails}
        </span>
      );
    },
  });

  export default MachineLearningPage;
