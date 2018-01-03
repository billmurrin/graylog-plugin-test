import React from 'react';
import $ from 'jquery';
import DateTime from 'logic/datetimes/DateTime';
import { DatePicker } from 'components/common';
import { Row, Col, Button } from 'react-bootstrap';
import {FormGroup, ControlLabel, FormControl} from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import AggregatesActions from 'machinelearning/AggregatesActions';
// import StreamSelactBox from './StreamSelac
import { IfPermitted, PageHeader } from 'components/common';
import fetch from 'logic/rest/FetchProvider';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import "machinelearning/style.css"
import GraphPage from 'machinelearning/GraphPage'
import CreateJobForm from './CreateJobForm'
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

import  data from './data.json'

const JobResultDisplay = React.createClass({
  componentDidMount(){
    console.log("componentDidMount");
    let tmpl = this;
    console.log(tmpl.props , "componentDidMount props ");
    AnomalyDetectionActions.list("anomaly").then(jobs => {
      tmpl.setState({jobs: jobs})
      tmpl.createInteractiveGraph()
    });

  },
  getInitialState() {
    return {
      jobs: [],
      loading: true,
    };
  },

createInteractiveGraph() {

  let tmpl = this;
  var job = this.state.job;
  // console.log(job);
  // try {
    console.log(data);
    tmpl.setState({loading: false});
    var svg = d3.select("svg"),
    margin = {top: 20, right: 20, bottom: 110, left: 40},
    margin2 = {top: 430, right: 20, bottom: 30, left: 40},
    width = +svg.attr("width") - margin.left - margin.right,
    height = +svg.attr("height") - margin.top - margin.bottom,
    height2 = +svg.attr("height") - margin2.top - margin2.bottom;

var parseDate = d3.timeParse("%m/%d/%Y %H:%M");
var g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

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
      var tooltip = d3.select("body")
        .append("div")
        .style("position", "absolute")
        .style("z-index", "10")
        .style("visibility", "hidden")
        .text("a simple tooltip");
        var anoms  =
        [
    {
      "date": "2017-04-22T11:45:00.000Z",
      "total": 731.6047915220261,
      "min": 1.8769680261611938,
      "key_field": "1492861500000",
      "max": 2.7165653705596924,
      "price": 1.8769680261611938,
      "total_count": 315,
      "mean": 2.3225548937207177,
      "count": 315
    },

    {
      "date": "2017-03-31T01:45:00.000Z",
      "total": 701.7422981262207,
      "min": 1.8062856197357178,
      "key_field": "1490924700000",
      "max": 2.5804450511932373,
      "price": 1.8062856197357178,
      "total_count": 315,
      "mean": 2.2277533273848276,
      "count": 315
    },
    {
      "date": "2017-03-31T01:30:00.000Z",
      "total": 706.3951338529587,
      "min": 1.8176854848861694,
      "key_field": "1490923800000",
      "max": 2.584993600845337,
      "price": 1.8176854848861694,
      "total_count": 315,
      "mean": 2.242524234453837,
      "count": 315
    },

    {
      "date": "2017-03-28T18:00:00.000Z",
      "total": 728.67049741745,
      "min": 1.8837289810180664,
      "key_field": "1490724000000",
      "max": 2.706052541732788,
      "price": 1.8837289810180664,
      "total_count": 315,
      "mean": 2.3132396743411108,
      "count": 315
    },
    {
      "date": "2017-03-28T17:45:00.000Z",
      "total": 726.2018908262253,
      "min": 1.8992395401000977,
      "key_field": "1490723100000",
      "max": 2.7374281883239746,
      "price": 1.8992395401000977,
      "total_count": 315,
      "mean": 2.305402828019763,
      "count": 315
    },
    {
      "date": "2017-03-28T17:30:00.000Z",
      "total": 730.83118724823,
      "min": 1.8232735395431519,
      "key_field": "1490722200000",
      "max": 2.696560859680176,
      "price": 1.8232735395431519,
      "total_count": 315,
      "mean": 2.320099007137238,
      "count": 315
    },
    {
      "date": "2017-03-28T17:15:00.000Z",
      "total": 728.1204907894135,
      "min": 1.8851990699768066,
      "key_field": "1490721300000",
      "max": 2.654668092727661,
      "price": 1.8851990699768066,
      "total_count": 315,
      "mean": 2.3114936215536934,
      "count": 315
    },

    {
      "date": "2017-03-27T02:45:00.000Z",
      "total": 702.2468013763428,
      "min": 1.7651863098144531,
      "key_field": "1490582700000",
      "max": 2.6390604972839355,
      "price": 1.7651863098144531,
      "total_count": 315,
      "mean": 2.229354925004263,
      "count": 315
    },
    {
      "date": "2017-03-27T02:30:00.000Z",
      "total": 700.9137979745865,
      "min": 1.8334004878997803,
      "key_field": "1490581800000",
      "max": 2.620957136154175,
      "price": 1.8334004878997803,
      "total_count": 315,
      "mean": 2.2251231681732904,
      "count": 315
    },
    {
      "date": "2017-03-27T02:15:00.000Z",
      "total": 700.9274371862411,
      "min": 1.8098258972167969,
      "key_field": "1490580900000",
      "max": 2.6065454483032227,
      "price": 1.8098258972167969,
      "total_count": 315,
      "mean": 2.2251664672579086,
      "count": 315
    },
    {
      "date": "2017-03-27T02:00:00.000Z",
      "total": 703.2963272333145,
      "min": 1.7968274354934692,
      "key_field": "1490580000000",
      "max": 2.549198865890503,
      "price": 1.7968274354934692,
      "total_count": 315,
      "mean": 2.2326867531216332,
      "count": 315
    },
    {
      "date": "2017-03-27T01:45:00.000Z",
      "total": 700.4703311920166,
      "min": 1.8429771661758423,
      "key_field": "1490579100000",
      "max": 2.518679141998291,
      "price": 1.8429771661758423,
      "total_count": 315,
      "mean": 2.223715337117513,
      "count": 315
    },
    {
      "date": "2017-03-27T01:30:00.000Z",
      "total": 701.4555011987686,
      "min": 1.7773451805114746,
      "key_field": "1490578200000",
      "max": 2.635554790496826,
      "price": 1.7773451805114746,
      "total_count": 315,
      "mean": 2.2268428609484716,
      "count": 315
    },

    {
      "date": "2017-03-26T20:00:00.000Z",
      "total": 721.6712145805359,
      "min": 1.8257900476455688,
      "key_field": "1490558400000",
      "max": 2.762291669845581,
      "price": 1.8257900476455688,
      "total_count": 315,
      "mean": 2.291019728827098,
      "count": 315
    },
    {
      "date": "2017-03-26T19:45:00.000Z",
      "total": 724.9882735013962,
      "min": 1.80784010887146,
      "key_field": "1490557500000",
      "max": 2.6430490016937256,
      "price": 0.40784010887146,
      "total_count": 315,
      "mean": 2.301550074607607,
      "count": 315
    },


  ]
      g.selectAll(".dot")
        .data(anoms)
        .enter()
        .append("circle")
        .attr("class", "dot")
        .attr("r", 3.5)
        .attr("cx", function(d) { return x(new Date(d.date)); })
        .attr("cy", function(d) { return y(d.price); })
        .on("mouseover", function(d){
          return tooltip.style("visibility", "visible").html("Expected value is: "+d.expected_value + "<br/>"  + "value : "+d.close +"<br/>"  + "deviation is: "+d.deviation_expected)
        })
        .on("mousemove", function(){return tooltip.style("top", (event.pageY-10)+"px").style("left",(event.pageX+10)+"px");})
        .on("mouseout", function(){return tooltip.style("visibility", "hidden");});


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
},

  render() {
    if(this.state.loading) {
      return (
        <RingLoader  color={'#1ab394'} loading={true}  />
      )
    }
    else {
      return (
        <PageHeader>
        <svg width="960" height="500"></svg>
        </PageHeader>
      );
    }
    }
  });

  export default JobResultDisplay;
