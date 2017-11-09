import React from 'react';
import $ from 'jquery';
import DateTime from 'logic/datetimes/DateTime';
import { DatePicker } from 'components/common';
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
import "./style.css"
import GraphPage from 'machinelearning/GraphPage'
import ViewGraph from 'machinelearning/ViewGraph'
import BootstrapModalForm from 'components/bootstrap/BootstrapModalForm';
import Input from 'components/bootstrap/Input';
import moment from 'moment';
import { DataTable } from 'components/common';
import { Line } from "react-chartjs";

var chartOptions = {
  bezierCurve : false,
  datasetFill : false,
  pointDotStrokeWidth: 4,
  scaleShowVerticalLines: false,
  responsive: true
};

var client = new elasticsearch.Client({
  host: 'localhost:9200',
  log: 'trace',
});
const MachineLearningPage = React.createClass({

  componentDidMount(){
    let tmpl = this;
    AggregatesActions.getJobs().then(jobs => {
      tmpl.setState({ jobs: jobs });
    });
    var aggs = [
      {code: 'avg', value: "Mean"},
      {code: 'count', value: "Count"},
    ]
    var an = [];
    aggs.map(function(a) {
      an.push(<option key={a.code} value={a.code}> {a.value} </option>);
    })
    tmpl.setState({
      typeOPs: an
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
      console.log(res.streams);
      res.streams.map(function(s) {
        arrTen.push(<option id={s.index_set_id} key={s.id} value={s.id}> {s.description} </option>);
      })
      tmpl.setState({
        opts: arrTen
      });
    }
    fetch('GET', "http://localhost:9000/api/streams/").then(callback, failCallback);
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
  showJobDetails(jobid){
    this.setState({showJobDetails: true})
    this.setState({currentJobId: jobid})
  },
  _ruleInfoFormatter(job) {
    console.log(job);
    const view = (
      <button onClick={this._viewjob} id={job.jobid} type="button" className="btn btn-xs btn-primary" title="view job"       >
      View
      </button>
    );
    const start = (
      <button onClick={this._startjob} id={job.jobid} type="button" className="btn btn-xs btn-primary" title="start job"       >
      Start
      </button>
    );
    const actions = (
      <div>
        {view}
        &nbsp;
        {start}
        &nbsp;
      </div>
    );
    return (
      <tr key={job.jobid}>
      <td className="limited">{job.aggrigationType}</td>
      <td className="limited">{job.startDate}</td>
      <td className="limited">{job.endDate}</td>
      <td className="limited">{job.field}</td>
      <td className="limited">{job.jobid}</td>
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
    console.log(evt.currentTarget.id);
    tmpl.setState({showJobDetails:true})
    tmpl.setState({currentJobId:evt.currentTarget.id})
  },
  _startjob(evt){
    let tmpl = this;
    AggregatesActions.startJob(evt.currentTarget.id).then(status => {
      console.log(status);
    });
    return
  },

  handelStreamChange(evt){
    let tmpl = this;
    var streamName = evt.currentTarget.value;
    const job = this.state.job;
    console.log($(evt.target).find('option:selected').attr('id'), "currentTarget");
    const parameter = evt.target.name;
    const value = evt.target.type === 'checkbox' ? evt.target.checked : evt.target.value;
    job[parameter] =value;
    var url = "http://localhost:9000/api/system/indices/index_sets/"+ $(evt.target).find('option:selected').attr('id');
    const fb = (errorThrown) => {
    console.log("errorThrown", errorThrown)
  };
  var cb = function(res) {
    var indexName = Object.keys(res)[0]
    var arrTen = [];
    var obj = res[indexName].mappings.metric.properties;
    for (var k in obj) {
      if (obj.hasOwnProperty(k) && ( obj[k].type=== "long" || obj[k].type=== "float") ) {
        arrTen.push(<option key={k} value={k}> {k} </option>);
      }
    }
    tmpl.setState({
      optsFields: arrTen
    });
  }

    var callback = function(res) {
      job.indexSetName = res.index_prefix;
      tmpl.setState({ job: job });
      client.indices.getMapping({index: job.indexSetName}, function(error, response) {
        if (error) {
          console.log(error);
        } else {
          cb(response)
        }
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
    client.search({
      index: 'server-metrics',
      body: {
        "query": {
          "range": {
            "@timestamp": {
              "gte": moment(job.startDate).format("YYYY-MM-DD"),
              "lte": moment(job.endDate).format("YYYY-MM-DD")
            }
          }
        },
        aggs: {
          bucket_time: {
            "date_histogram": {
              "field": "@timestamp",
              "interval": this.state.job.bucketSpan,
            },
            aggs: {
                                                                                                                                            "server_stats": {
                "avg": {
                  "field": this.state.job.field,
                }
              }
            }
          }
        }
      }
    }).then(function (resp) {
      var hits = resp.hits.hits;
      var d =    {
        chartData: {
          labels: [],
          datasets: [
            {
              fillColor: "#25BDFF",
              strokeColor: "#25BDFF",
              pointColor: "#25BDFF",
              pointStrokeColor: "#fff",
              pointHighlightFill: "#fff",
              pointHighlightStroke: "#25BDFF",
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
        console.trace(err.message);
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
        // tmpl.props.handler({showCreateJob: true})
        tmpl.refs.modal.close();
    }
    console.log(this.state.job, "before saving");

    fetch('PUT', "http://localhost:9000/api/plugins/org.graylog.plugins.machinelearning/rules", {job: this.state.job}).then(callback, failCallback);
  },
  _onDateSelected(field) {
    console.log(field);
    return (date, _, event) => {
      const inputField = this.refs[`${field}Formatted`].getInputDOMNode();
      const midnightDate = date.setHours(0);
      console.log(date);
      inputField.value = DateTime.ignoreTZ(midnightDate).toString(DateTime.Formats.DATETIME);
      console.log(field);
      this._rangeParamsChanged(field)();
    };
  },
  _rangeParamsChanged(key) {
    var job = this.state.job;
    let tmpl = this;
    if(!job)  job = {};
    return () => {
      let refInput;

      /* eslint-disable no-case-declarations */
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
      /* eslint-enable no-case-declarations */
      job[key] = moment(refInput.getValue()).format("YYYY-MM-DD"),
      tmpl.setState({job: job});
      // SearchStore.rangeParams = this.state.rangeParams.set(key, refInput.getValue());
    };
  },
  render() {

    let tmpl = this;
    let showCreateJob = null;
    let streamsform = null;
    let jobs = null;
    let jobs2 = null;
    let jobDetails = null;

    let table = null;
    let chart = null;

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

    }
    const filterKeys = ['jobid','field', 'aggrigationType'];
    const headers = ['Aggrigation Type', 'Start Date', 'EndDate', 'Field', 'Job Id'];
    if(this.state.jobs && !this.state.showJobDetails) {
      jobs2 = (
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
        console.log(this.state, "ELASE");
        jobs2 = (
            <PageHeader title="JobDetails"> JobDetails
              <ViewGraph jobid={this.state.currentJobId}/>
            </PageHeader>
            )
      }
      if(this.state.showLine) {
        console.log(this.state.chartData);
        chart = (<Line data={this.state.chartData} options={chartOptions} width="1100" height="540" />);
      }
      if(this.state.showJobDetails) {
        jobDetails = (
          <PageHeader title="JobDetails"> JobDetails
          <ViewGraph jobid={this.state.currentJobId}/>
          </PageHeader>

        )
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


                      <Input ref="type" name="aggrigationType" id="aggrigationType" type="select" value={this.state.type}
                        labelClassName="col-sm-2" wrapperClassName="col-sm-10"
                        label="Type" help="Select a aggrigation type." required
                        onChange={this._onValueChanged} ><option value="true">Select</option>
                         {this.state.typeOPs}
                      </Input>

                      <Input ref="streamName" name="streamName" id="streamName" type="select" value={this.state.streamName}
                        labelClassName="col-sm-2" wrapperClassName="col-sm-10"
                        label="Stream" help="Select a stream." required
                        onChange={this.handelStreamChange} > {this.state.opts}
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
          {jobs2}
        </span>
      );
    },
  });

  export default MachineLearningPage;
