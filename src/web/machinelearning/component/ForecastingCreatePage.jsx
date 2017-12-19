import React from 'react';
import $ from 'jquery';
import MachinelearningActions from 'machinelearning/MachinelearningActions';
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
import { browserHistory } from 'react-router';

import Routes from 'routing/Routes';


var chartOptions = {
  bezierCurve : false,
  datasetFill : false,
  pointDotStrokeWidth: 4,
  scaleShowVerticalLines: false,
  responsive: true
};

const ForecastingCreatePage = React.createClass({
  componentDidMount(){
    let tmpl =this;

    var aggs = [
      {code: 'count', value: "Count"},
      {code: 'distinctcount', value: "Distinct Count"},
      {code: 'highCount', value: "High Count"},
      {code: 'lowCount', value: "Low Count"},
      {code: 'avg', value: "Mean"},
      {code: 'highMean', value: "High Mean"},
      {code: 'lowMean', value: "Low Mean"},
      {code: 'sum', value: "Sum"},
      {code: 'highSum', value: "High Sum"},
      {code: 'lowSum', value: "Low Sum"},
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
      {code: '15m', value: "15m"},
      {code: '30m', value: "30m"},
      {code: '1h', value: "1h"},
      {code: '3h', value: "3h"},
      {code: '6h', value: "6h"},
      {code: '12h', value: "12h"},
      {code: '1d', value: "1d"},
      {code: '7d', value: "7d"},

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
      tmpl.setState({
        streams: res.streams
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
  _saveJob(){
    let tmpl = this;
    if(!tmpl.state.saveJob) UserNotification.error("can't save this job gaph id not displayed/ no data is feched please re-frame the query params ");
    const failCallback = (errorThrown) => {
      console.log("errorThrown", errorThrown)
    };
    var callback = function(k) {
      tmpl.props.history.goBack()
    }
    var job = this.state.job;
    var streams = this.state.streams;
    job.jobType ="forecasting";
    job.streamName =streams[streams.findIndex(x => x.id==job.streamId)].title;
    fetch('PUT', URLUtils.qualifyUrl( "/plugins/org.graylog.plugins.machinelearning/rules"), {job: this.state.job}).then(callback, failCallback);
  },

  _onValueChanged(event) {
    var job = this.state.job;
    const parameter = event.target.name;
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    if(!job)  job = {};
    job[parameter] = value.trim();
    console.log(job);
    this.setState({ job: job });
  },
  _showGraph() {
    let tmpl = this;
    var job = this.state.job;
    try {
        var data =   {
          "elastic_index_name": job.indexSetName+ "*",
          "field_name": job.field,
          "lucene_query": job.luceneQuery,
          "time_stamp_field":"timestamp",
          "aggregation_type": job.aggregationType,
          "bucket_span": job.bucketSpan,

        }
        var callback = function(res) {
          $("#graph svg").remove()
          tmpl._createGraph(res, function(status) {
            if(status)tmpl.setState({saveJob: true})
            else {
              tmpl.setState({saveJob: false})
            }
          });
        }
          var failCallback = function(err) {
                UserNotification.error(err);
          }
            var url = URLUtils.qualifyUrl("/plugins/org.graylog.plugins.machinelearning/jobs/graph/search");
            console.log(data);
            fetch('POST', url, data).then(callback, failCallback);
        }
      catch(err) {
      UserNotification.error(err);
      }

  },
  _createGraph(data, cb){

    function mapDate(d) {
      return new Date(d.date);
    }
    var aggregationType = this.state.job.aggregationType;
    function mapValue(d) {
      switch (aggregationType) {
        case "min":
        case "max":
        return d[aggregationType];
        break;

        case "sum":
        case "highSum":
        case "lowSum":
        return d.total;
        break

        case "avg":
        case "highMean":
        case "lowMean":
        return d.mean;

        case "count":
        case "distinctcount":
        case "highCount":
        case "lowCount":
        return d.count;
        break
      }
    }

    const margin = {
      top: 30,
      right: 40,
      bottom: 30,
      left: 40,
    };

    const svgWidth = 1500;
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
     cb(true);
  },
  handelStreamChange(evt){
    let tmpl = this;
    var streamId = evt.currentTarget.value;
    var  job = this.state.job;
    const parameter = evt.target.name;
    const value = evt.target.type === 'checkbox' ? evt.target.checked : evt.target.value;
    if(!job)  job = {};
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
    return (
      <div>
      <PageHeader title="Create Forecasting  Job" >
        <Form state={this.state} onChange={state => this.setState(state)}>
          <fieldset>
            <Col sm={6}>
            <Input ref="streamId" name="streamId" id="streamId" type="select" value={this.state.streamId}
              labelClassName="col-sm-6" wrapperClassName="col-sm-6"
              label="Select stream" help="Select a stream." required
              onChange={this.handelStreamChange} > <option value="true">Select</option>
              {this.state.opts}
            </Input>
            <Input ref="type" name="luceneQuery" id="luceneQuery" type="text" value={this.state.luceneQuery}
              labelClassName="col-sm-6" wrapperClassName="col-sm-6"
              label="Filter results (Lucene Search)" help="lucene Query" required
              onChange={this._onValueChanged} >
            </Input>
            <Input ref="type" name="aggregationType" id="aggregationType" type="select" value={this.state.type}
              labelClassName="col-sm-6" wrapperClassName="col-sm-6"
              label="Aggregation Type" help="Select a aggregation type." required
              onChange={this._onValueChanged} ><option value="true">Select</option>
              {this.state.typeOPs}
            </Input>
            <Input ref="fields" name="field" id="fields" type="select" value={this.state.field}
              labelClassName="col-sm-6" wrapperClassName="col-sm-6"
              label="Select Field" help="Select a field." required
              onChange={this._onValueChanged} > <option value="true">Select</option>{this.state.optsFields}
            </Input>
            <Input ref="bucketSpan" name="bucketSpan" id="bucketSpan" type="select" value={this.state.bucket}
            labelClassName="col-sm-6" wrapperClassName="col-sm-6"
            label="Select Aggregation Window  " help="Select time span." required
            onChange={this._onValueChanged} > <option value="true">Select</option>{this.state.buck}
            </Input>
            <Input ref="jobid" name="jobid" id="jobid" type="text" value={this.state.jobid}
            labelClassName="col-sm-6" wrapperClassName="col-sm-6"
            label="Give an unique name for job " help="unique name." required
            onChange={this._onValueChanged} >
            </Input>
            <Row sm={6}>
              <Button   style={{   marginLeft:"150px" }}  onClick={this._showGraph}  bsStyle="primary" >
              <i className="fa fa-play fa-2x"  title="View job"></i>
              </Button>
              <Button  disabled={!this.state.saveJob}  style={{   marginLeft:"250px" }} onClick={this._saveJob}  bsStyle="primary" >
              <i className="fa fa-cloud fa-2x"  title="Save job"></i>
              </Button>
            </Row>
            </Col>
            <Col sm={6}>
              <Button    bsStyle="primary small" >
                <i className="fa fa-plus fa-2x"  title="Advanced "></i>
              </Button>
            </Col>
          </fieldset>
        </Form>
      </PageHeader>
      <PageHeader>
        <div id="graph"></div>
      </PageHeader>
      </div>
    );
  },
});

export default ForecastingCreatePage;
