import React from 'react';
import $ from 'jquery';
import DateTime from 'logic/datetimes/DateTime';
import { DatePicker } from 'components/common';
import { Row, Col, Button } from 'react-bootstrap';
import {FormGroup, ControlLabel, FormControl} from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import AggregatesActions from 'machinelearning/AggregatesActions';
import MachinelearningActions from 'machinelearning/MachinelearningActions';
// import StreamSelactBox from './StreamSelac
import { IfPermitted, PageHeader } from 'components/common';
import fetch from 'logic/rest/FetchProvider';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import "machinelearning/style.css"
import GraphPage from 'machinelearning/GraphPage'
import CreateJobForm from './CreateJobForm'
import JobResultDisplay from './JobResultDisplay'
import ViewGraph from 'machinelearning/ViewGraph'
import BootstrapModalForm from 'components/bootstrap/BootstrapModalForm';
import Input from 'components/bootstrap/Input';
import moment from 'moment';
import { DataTable } from 'components/common';
import UserNotification from 'util/UserNotification';
import URLUtils from 'util/URLUtils';
import Reflux from 'reflux';
import StoreProvider from 'injection/StoreProvider';
const StreamsStore = StoreProvider.getStore('Streams');
const CurrentUserStore = StoreProvider.getStore('CurrentUser');
import CombinedProvider from 'injection/CombinedProvider';
const { AlertNotificationsStore } = CombinedProvider.get('AlertNotifications');
import AnomalyDetectionActions from 'machinelearning/actions/AnomalyDetectionActions';
import * as d3 from "d3";
import "./style.css"
import { RingLoader } from 'react-spinners';


const JobsDisplay = React.createClass({
  componentDidMount(){
    console.log("componentDidMount");
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
  _ruleInfoFormatter(job) {
    console.log(job);
    const view = (
      <i className="fa fa-table fa-2x"  onClick={this._viewjob} id={job.jobid}  title="view job"></i>
    );
    const start = (
      <i onClick={this._startjob} id={job.jobid} className="fa fa-play fa-2x" title="start job" ></i>
    );
    const del = (
      <i onClick={this._deletejob} id={job.jobid} className="fa fa-trash fa-2x" title="deletejob" ></i>
    );
    var st = null;
    if(job.streaming) {
      st= <i id={job.jobid} onClick={this._startStreaming} className="fa fa-pause fa-2x" title="streaming" ></i>
    } else {
      st=<i id={job.jobid} onClick={this._startStreaming} className="fa fa-forward fa-2x" title="streaming" ></i>
    }
    // const stream = ({st});
    const actions = (
        <td  className="actiontable">
        {start}&nbsp;&nbsp;
        {st} &nbsp;&nbsp;
        {view}&nbsp;&nbsp;
        {del}&nbsp;
        </td>
    );

    return (
      <tr key={job.jobid}>
      <td className="limited">{job.jobid}</td>
      <td className="limited">{job.streamName}</td>
      <td className="limited">{job.aggregationType}</td>
      <td className="limited">{job.field}</td>
      <td className="limited">{job.description}</td>
      {actions}
      </tr>

    );
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
_deletejob(evt){
  let tmpl = this;
  if (window.confirm(`Do you really want to delete job`)) {
    AnomalyDetectionActions.deletejob(evt.currentTarget.id).then(status => {
      if(status) {
        AnomalyDetectionActions.list("anomaly").then(jobs => {
          tmpl.setState({jobs: jobs})
        });
      }
    });
  }
},
_startStreaming(evt){
  let tmpl = this;
  console.log(evt.currentTarget.id);

    AnomalyDetectionActions.startStreaming(evt.currentTarget.id).then(status => {
      if(status) {
        AnomalyDetectionActions.list("anomaly").then(jobs => {
          tmpl.setState({jobs: jobs})
        });
      }
    });
},
 _viewjob(evt) {
  //  this.createInteractiveGraph();
   this.setState({viewGraphContent: true })
   this.setState({currentJobId:evt.currentTarget.id})
},
 _startjob(evt) {
   console.log(this.state);
   var job =this.state.jobs[this.state.jobs.findIndex(x => x.jobid==evt.currentTarget.id)];
   var obj = {
     "host_ip" : "SmartThink-Demo",
     "jobid" : job.jobid,
     "host_port" : "9200",
     "max_docs": "100000",
     "aggregationType" : job.aggregationType,
     "field" : job.field,
     "startDate" :moment(job.startDate).format("YYYY-MM-DD HH:mm:ss.SSS"),
     "endDate" : moment(job.endDate).format("YYYY-MM-DD HH:mm:ss.SSS"),
     "bucketSpan" : job.bucketSpan,
     "indexSetName" : job.indexSetName,
     "sourceindextype" : "message",
     "timestampfield" : "timestamp",
     "anom_index" : "anomaly_result",
     "anom_type" : "anomaly_type",
     "anomaly_direction" : "both",
     "max_ratio_of_anomaly" : "0.02",
     "alpha_parameter" : "0.1",
     "streaming" : "FALSE"
   }
   console.log(obj ," starting obj");
   AggregatesActions.startJob(obj).then(response => {
     console.log(response);
   });
},
createInteractiveGraph() {

  let tmpl = this;
  var job = this.state.job;
  try {
      var data =   {
        "elastic_index_name": "manju"+ "*",
          "field_name": "response",
        "lucene_query": "*",
        "time_stamp_field":"timestamp",
        "aggregation_type": "mean",
        "bucket_span": "15m",

      }
      var callback = function(data) {
        // console.log(res);
        var svg = d3.select("svg"),
        margin = {top: 20, right: 20, bottom: 110, left: 40},
        margin2 = {top: 430, right: 20, bottom: 30, left: 40},
        width = +svg.attr("width") - margin.left - margin.right,
        height = +svg.attr("height") - margin.top - margin.bottom,
        height2 = +svg.attr("height") - margin2.top - margin2.bottom;

    var parseDate = d3.timeParse("%m/%d/%Y %H:%M");

    var x = d3.scaleTime().range([0, width]),
        x2 = d3.scaleTime().range([0, width]),
        y = d3.scaleLinear().range([height, 0]),
        y2 = d3.scaleLinear().range([height2, 0]);

    var xAxis = d3.axisBottom(x),
        xAxis2 = d3.axisBottom(x2),
        yAxis = d3.axisLeft(y);

    var brush = d3.brushX()
        .extent([[0, 0], [width, height2]])
        .on("brush end", brushed);

    var zoom = d3.zoom()
        .scaleExtent([1, Infinity])
        .translateExtent([[0, 0], [width, height]])
        .extent([[0, 0], [width, height]])
        .on("zoom", zoomed);

        var line = d3.line()
            .x(function (d) { return x(new Date(d.date)); })
            .y(function (d) { return y(d.price); });

        var line2 = d3.line()
            .x(function (d) { return x2(new Date(d.date)); })
            .y(function (d) { return y2(d.price); });

        var clip = svg.append("defs").append("svg:clipPath")
            .attr("id", "clip")
            .append("svg:rect")
            .attr("width", width)
            .attr("height", height)
            .attr("x", 0)
            .attr("y", 0);


        var Line_chart = svg.append("g")
            .attr("class", "focus")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
            .attr("clip-path", "url(#clip)");


        var focus = svg.append("g")
            .attr("class", "focus")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var context = svg.append("g")
        .attr("class", "context")
        .attr("transform", "translate(" + margin2.left + "," + margin2.top + ")");

      x.domain(d3.extent(data, function(d) { return new Date(d.date); }));
      y.domain([0, d3.max(data, function (d) { return d.price; })]);
      x2.domain(x.domain());
      y2.domain(y.domain());


        focus.append("g")
            .attr("class", "axis axis--x")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);

        focus.append("g")
            .attr("class", "axis axis--y")
            .call(yAxis);

        Line_chart.append("path")
            .datum(data)
            .attr("class", "line")
            .attr("d", line);

        context.append("path")
            .datum(data)
            .attr("class", "line")
            .attr("d", line2);


      context.append("g")
          .attr("class", "axis axis--x")
          .attr("transform", "translate(0," + height2 + ")")
          .call(xAxis2);

      context.append("g")
          .attr("class", "brush")
          .call(brush)
          .call(brush.move, x.range());

      svg.append("rect")
          .attr("class", "zoom")
          .attr("width", width)
          .attr("height", height)
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
          .call(zoom);



    function brushed() {
      if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return; // ignore brush-by-zoom
      var s = d3.event.selection || x2.range();
      x.domain(s.map(x2.invert, x2));
      Line_chart.select(".line").attr("d", line);
      focus.select(".axis--x").call(xAxis);
      svg.select(".zoom").call(zoom.transform, d3.zoomIdentity
          .scale(width / (s[1] - s[0]))
          .translate(-s[0], 0));
    }

    function zoomed() {
      if (d3.event.sourceEvent && d3.event.sourceEvent.type === "brush") return; // ignore zoom-by-brush
      var t = d3.event.transform;
      x.domain(t.rescaleX(x2).domain());
      Line_chart.select(".line").attr("d", line);
      focus.select(".axis--x").call(xAxis);
      context.select(".brush").call(brush.move, x.range().map(t.invertX, t));
    }

    function type(d) {
      d.date = new Date(d.date);
      d.price = +d.price;
      return d;
    }

      }
        var failCallback = function(err) {
              UserNotification.error(err);
        }
          var url = URLUtils.qualifyUrl("/plugins/org.graylog.plugins.machinelearning/jobs/graph/search");
          fetch('POST', url, data).then(callback, failCallback);
      }
    catch(err) {
    UserNotification.error(err);
    }
      // var data = [
      //   {date: "June 22, 2015", price: 1377.42},
      //   {date: "June 23, 2015", price: 1377.42},
      //   {date: "June 24, 2015", price: 1377.42},
      //   {date: "June 29, 2015", price: 20.42},
      //   {date: "June 29, 2015", price: 20.42},
      //   {date: "June 30 2015", price: 1394.46},
      // ]

},

  render() {
    if(!this.state.jobs) {
      return null
    }
    else {
      let tmpl = this;
      let showCreateJob = null;
      let jobs = null;
      let dispContent = null;
      let table = null;
      let chart = null;
      let jobResult = null;

      const filterKeys = ['jobid','field', 'aggregationType'];
      const headers = ['Job Id', 'Stream Name',   'Aggregation Type', 'Field', 'Actions'];
      dispContent = (
        <DataTable id="job-list"
        className="table-hover table-condensed table-striped"
        headers={headers}
        headerCellFormatter={this._headerCellFormatter}
        rows={this.state.jobs}
        filterBy="field"
        noDataText="There are no anomaly jobs"
        dataRowFormatter={this._ruleInfoFormatter}
        filterLabel="Filter Jobs"
        filterKeys={filterKeys}/>
      );

      // dispContent += (
      //   <RingLoader
      //      color={'#123abc'}
      //      loading={true}
      //    />
      // )
      if(tmpl.state.viewGraphContent) {
        jobResult=<JobResultDisplay jobid={tmpl.state.currentJobId}/>
      }
        return (
            <div>
              <PageHeader>
                  {dispContent}
              </PageHeader>
              {jobResult}
            </div>
        );
    }
    },
  });

  export default JobsDisplay;
