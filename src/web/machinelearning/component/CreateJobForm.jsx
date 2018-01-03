import React from 'react';
import $ from 'jquery';
import SchedulesActions from 'machinelearning/SchedulesActions';
import Reflux from 'reflux';
import { IfPermitted, PageHeader } from 'components/common';
import { Row, Col, Button, ButtonToolbar } from 'react-bootstrap';
import { Input } from 'components/bootstrap';
import DateTime from 'logic/datetimes/DateTime';
import { TextField } from 'components/configurationforms';
import "machinelearning/style.css"
import { DatePicker } from 'components/common';
import moment from 'moment';
import {Form, Field} from 'simple-react-form'
import URLUtils from 'util/URLUtils';
import fetch from 'logic/rest/FetchProvider';
import * as d3 from "d3";
import "./style.css"
import { Line } from "react-chartjs";
import AggregatesActions from 'machinelearning/AggregatesActions';
import UserNotification from 'util/UserNotification';
var chartOptions = {
  bezierCurve : false,
  datasetFill : false,
  pointDotStrokeWidth: 4,
  scaleShowVerticalLines: false,
  responsive: true
};

const CreateJobForm = React.createClass({
  componentDidMount(){
    let tmpl =this;
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
      tmpl.setState({
        streams: res
      })
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
      jobs: [],
    };
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
  _onDateSelected(field) {
    return (date, _, event) => {
      const inputField = this.refs[`${field}Formatted`].getInputDOMNode();
      const midnightDate = date.setHours(0);
      inputField.value = DateTime.ignoreTZ(midnightDate).toString(DateTime.Formats.DATETIME);
      this._rangeParamsChanged(field)();
    };
  },
  _save(){
    let tmpl = this;
    if(!tmpl.state.saveJob) UserNotification.error("can't save this job gaph id not displayed/ no data is feched please re-frame the query params ");
    const failCallback = (errorThrown) => {
      console.log("errorThrown", errorThrown)
    };
    var callback = function(k) {
      tmpl.props.handelState("showJobs")
      AggregatesActions.getJobs("anomaly").then(jobs => {
        tmpl.setState({ jobs: jobs });
      });
    }
    fetch('PUT', URLUtils.qualifyUrl("/plugins/org.graylog.plugins.machinelearning/rules"), {job: this.state.job}).then(callback, failCallback);
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
  _setDateTimeToNow(field) {
    return () => {
      const inputNode = this.refs[`${field}Formatted`].getInputDOMNode();
      inputNode.value = new DateTime().toString(DateTime.Formats.DATETIME);
      this._rangeParamsChanged(field)();
    };
  },
  _onValueChanged(event) {
    var job = this.state.job;
    console.log("on change");
    const parameter = event.target.name;
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    if(!job)  job = {};
    job[parameter] = value.trim();
    console.log(job);
    this.setState({ job: job });
  },
  showGraph() {
    let tmpl = this;
    console.log("show graph");
    console.log(this.state.job);
    var job = this.state.job;

    var data =   {
      "elastic_index_name": job.indexSetName+ "*",
      "start_date": moment(job.startDate).format("YYYY-MM-DD HH:mm:ss.SSS"),
      "end_date": moment(job.endDate).format("YYYY-MM-DD HH:mm:ss.SSS"),
      "field_name": job.field,
      "query_size": 100,
      "time_stamp_field":"timestamp"
    }
    console.log(data);
    var callback = function(res) {
      $("#graph svg").remove()
      if(res.length) {
        tmpl.setState({saveJob: true})
      }
      tmpl._createGraph(res);
    }
    var failCallback = function(err) {
      console.log(err);
    }
    var url = URLUtils.qualifyUrl("/plugins/org.graylog.plugins.machinelearning/jobs/graph/search");
    fetch('POST', url, data).then(callback, failCallback);

  },
  _createGraph(data){

    function mapDate(d) {
      return new Date(d.date);
    }
    var aggregationType = "avg";
    function mapValue(d) {
      switch (aggregationType) {
        case "min":
        case "max":
        return d[aggregationType];
        break;

        case "sum":
        return d.total;
        break

        case "avg":
        return d.mean;
        break
      }
    }

    const margin = {
      top: 30,
      right: 40,
      bottom: 30,
      left: 40,
    };

    const svgWidth = 1200;
    const svgHeight = 500;
    const width = svgWidth - margin.left - margin.right;
    const height = svgHeight - margin.top - margin.bottom;

    const svg = d3.select("#graph")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight)
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);


    const xScale = d3.scaleTime()
    .domain([d3.min(data, mapDate), d3.max(data, mapDate)])
    .range([0, width]);

    const yScale = d3.scaleLinear()
    .domain([d3.min(data, mapValue), d3.max(data, mapValue)*1.05])
    .range([height, 0]);

    const xAxis = d3.axisBottom()
    .scale(xScale)
    .ticks(3);

    const yAxis = d3.axisLeft()
    .scale(yScale)
    .ticks(3);

    const gX = svg
    .append("g")
    .attr("class", "xAxis")
    .attr("transform", `translate(0, ${height})`)
    .call(xAxis);

    const gY = svg
    .append("g")
    .attr("class", "yAxis")
    .call(yAxis);

    svg.append("rect")
    .attr("fill", "transparent")
    .attr("width", width)
    .attr("height", height);

    const valueLine = d3
    .line()
    .x((d) => xScale(mapDate(d)))
    .y((d) => yScale(mapValue(d)));

    const valuePath = svg
    .append("path")
    .data([data])
    .attr("class", "line")
    .attr("d", valueLine);


    function zoomed() {
      const transform = d3.event.transform;
      const xNewScale = transform.rescaleX(xScale);
      xAxis.scale(xNewScale);
      gX.call(xAxis);
      valueLine.x((d) => xNewScale(mapDate(d)));
      valuePath.attr("d", valueLine);
    }
    const zoom = d3.zoom()
    .scaleExtent([1, 40])
    .translateExtent([[0,0], [width, height]])
    .on("zoom", zoomed);
     svg.call(zoom);
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
      console.log(job.indexSetName+"*");
      SchedulesActions.getFields( job.indexSetName+"*").then(fields => {
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
  render() {
console.log(this.props);
    return (
      <div>
      <Form state={this.state} onChange={state => this.setState(state)}>
            <fieldset>
              <Row className="row-sm">
                <Col sm={2}>
                  <Input ref="jobid" name="jobid" id="jobid" type="text" maxLength={100} defaultValue={this.state.originalName}
                  labelClassName="col-sm-12" wrapperClassName="col-sm-12"
                  label="Name" help="Enter a unique job id." required
                  onChange={this._onValueChanged} autoFocus />
                </Col>
                <Col sm={2}>
                  <Input ref="jobType" name="jobType" id="jobType" type="select" value={this.state.jobType}
                  labelClassName="col-sm-12" wrapperClassName="col-sm-12"
                  label="Job Type" help="Select a job Type." required
                  onChange={this._onValueChanged} ><option value="true">Select</option>
                  {this.state.jobTypeops}
                  </Input>
                </Col>
                <Col sm={2}>
                  <Input ref="type" name="aggregationType" id="aggregationType" type="select" value={this.state.type}
                  labelClassName="col-sm-12" wrapperClassName="col-sm-12"
                  label="Aggregation Type" help="Select a aggregation type." required
                  onChange={this._onValueChanged} ><option value="true">Select</option>
                  {this.state.typeOPs}
                  </Input>
                </Col>
                <Col sm={2}>
                  <Input ref="streamName" name="streamName" id="streamName" type="select" value={this.state.streamName}
                  labelClassName="col-sm-12" wrapperClassName="col-sm-12"
                  label="Stream's" help="Select a stream." required
                  onChange={this.handelStreamChange} > <option value="true">Select</option>
                  {this.state.opts}
                  </Input>
                </Col>
                <Col sm={2}>
                  <Input ref="fields" name="field" id="fields" type="select" value={this.state.field}
                  labelClassName="col-sm-12" wrapperClassName="col-sm-12"
                  label="Field's" help="Select a field." required
                  onChange={this._onValueChanged} > {this.state.optsFields}
                  </Input>
                </Col>
                <Col sm={2}>
                  <Input ref="bucketSpan" name="bucketSpan" id="bucketSpan" type="select" value={this.state.bucket}
                  labelClassName="col-sm-12" wrapperClassName="col-sm-12"
                  label="Bucket span" help="Select time span." required
                  onChange={this._onValueChanged} > {this.state.buck}
                  </Input>
                </Col>
              </Row>
              <Row className="row-sm">
                <Col md={6}>
                  <div className="row no-bm" style={{ marginLeft: 17 }}>
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
                      <div className="col-md-6" style={{ paddingleft : 10 }}>
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
                </Col>
                <Col md={6}>
                  <Col sm={3}>
                    <button onClick={this.showGraph} id="view-job" type="button" className="btn btn-lg btn-primary pull-right padd-top buttonBg" title="View Job">
                    Show Graph
                    </button>
                  </Col>
                  <Col sm={3}>
                    <button onClick={this._save} id="save-job" type="button" className="btn btn-lg btn-primary pull-right padd-top buttonBg" title="Save Job">
                    Save  Graph
                    </button>
                  </Col>
                </Col>
              </Row>
            </fieldset>
          </Form>

      </div>
    );
  },
});

export default CreateJobForm;
