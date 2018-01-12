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
import ViewGraph from 'machinelearning/ViewGraph'
import BootstrapModalForm from 'components/bootstrap/BootstrapModalForm';
import Input from 'components/bootstrap/Input';
import moment from 'moment';
import { DataTable } from 'components/common';
import URLUtils from 'util/URLUtils';
import Reflux from 'reflux';
import StoreProvider from 'injection/StoreProvider';
import CombinedProvider from 'injection/CombinedProvider';
const { AlertNotificationsStore } = CombinedProvider.get('AlertNotifications');
import AnomalyDetectionActions from 'machinelearning/actions/AnomalyDetectionActions';
import * as d3 from "d3";
import "./style.css"
import { RingLoader } from 'react-spinners';

import  data from './data.json'

const JobResultDisplay = React.createClass({
  componentDidMount(){
    let tmpl = this;
    console.log(this.props.params.jobid);
    AnomalyDetectionActions.list("anomaly").then(jobs => {
      tmpl.setState({jobs: jobs})
      var index = tmpl.state.jobs.findIndex(x => x.jobid==this.props.params.jobid);
      tmpl.setState({currentJob:tmpl.state.jobs[index]})
      var url = URLUtils.qualifyUrl("/plugins/org.graylog.plugins.machinelearning/getjobdetails/anomaly/"+this.props.params.jobid);

      fetch('POST', url)
        .then(
          response => {
            var data = [];
            var anoms = [];
            response.hits.hits.map(function(hits) {
                data.push({
                    date:hits._source.timestamp,
                    value:hits._source.actual_value,

                    })
                    if(hits._source.isAnomaly) {
                        anoms.push({
                          date:hits._source.timestamp,
                          value:hits._source.actual_value,
                          isAnomaly:hits._source.isAnomaly,
                          expectedValue:hits._source.expected_value,
                          deviation:hits._source.deviation,
                          anomalyCategory:hits._source.anomaly_category,
                        })
                    }

            })
            tmpl.setState({graphData: data})
            tmpl.setState({anomData: anoms})
            tmpl.createInteractiveGraph()
          },
          error => {
            // UserNotification.error('deleting job failed');
          });
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
    tmpl.setState({loading: false});
    var data =this.state.graphData;
    var data2 =this.state.anomData;


    var svg = d3.select("svg"),
    margin = {top: 20, right: 20, bottom: 110, left: 80},
    margin2 = {top: 430, right: 20, bottom: 30, left: 80},
    width = +svg.attr("width") - margin.left - margin.right,
    height = +svg.attr("height") - margin.top - margin.bottom,
    height2 = +svg.attr("height") - margin2.top - margin2.bottom;

// var parseDate = d3.timeParse("%H:%M:%S");//"%b % Y");
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

var area = d3.line()
	// .curve(d3.curveMonotoneX)
	.x(function (d) {
		return x(d.date);
	})
	.y(function (d) {
		return y(d.value);
	});

var area2 = d3.line()
	.curve(d3.curveMonotoneX)
	.x(function (d) {
		return x2(d.date);
	})
	.y(function (d) {
		return y2(d.value);
	});


svg.append("defs").append("clipPath")
    .attr("id", "clip")
    .append("rect")
    .attr("width", width)
    .attr("height", height);
    svg.append("rect")
		  .attr("class", "zoom")
		  .attr("width", width)
		  .attr("height", height)
		  .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
		  .call(zoom);

var focus = svg.append("g")
    .attr("class", "focus")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var context = svg.append("g")
    .attr("class", "context")
    .attr("transform", "translate(" + margin2.left + "," + margin2.top + ")");

  function update(){
    for(var k in data) { type(data[k]); }
    for(var m in data2) { type(data2[m]);}
    x.domain(d3.extent(data, function(d) { return d.date; }));
	  y.domain([0, d3.max(data, function(d) { return d.value; })]);
	  x2.domain(x.domain());
	  y2.domain(y.domain());

    var tooltip = d3.select("body")
           .append("div")
           .style("position", "absolute")
           .style("z-index", "10")
           .style("visibility", "hidden")
           .attr('class', 'd3-tip')
           .style('pointer-events', 'all');


      focus.append("path")
		  .datum(data)
      .style("stroke", 'blue')
		  .attr("class", "area")
		  .attr("d", area);

	  focus.append("g")
		  .attr("class", "axis axis--x")
		  .attr("transform", "translate(0," + height + ")")
		  .call(xAxis);

	  focus.append("g")
		  .attr("class", "axis axis--y")
		  .call(yAxis);

	  focus.selectAll("circle")
		  .data(data2)
		  .enter().append("circle")
		  .attr("class","circle")
		  .attr("r", 4)
		  .style("fill", function(d) {
		    console.log(d.anomalyCategory);
        switch (d.anomalyCategory) {
          case "I":
            return "yellow";
          case "C":
            return "red";
          case "W":
            return "green";

        }
		  })
		  .style("stroke", "#FF4500")
		  .style("stroke-width", "1")
      .style('pointer-events', 'all')
		  .attr("cx", function(d) { return x(d.date) })
		  .attr("cy", function(d) { return y(d.value); })
      .on("mouseover", function(d){
        var html = "<strong>Expected:</strong> <span style='color:red'>" + d.expectedValue + "</span> </br>"
              +"<strong>Actual:</strong> <span style='color:red'>" + d.value + "</span> </br>"
              +"<strong>Deviation (%):</strong> <span style='color:red'>" + d.deviation + "</span> </br>"
              +"<strong>Category:</strong> <span style='color:red'>" + d.anomalyCategory + "</span> </br>";

// Expected value is: "+d.expectedValue + "<br/>"  + "value : "+d.value +"<br/>"  + "deviation is: "+d.deviation +"<br/>" + "Anomaly Category is: "+d.anomalyCategory
          return tooltip.style("visibility", "visible")
                .html(html  )
        })
        .on("mousemove", function(){return tooltip.style("top", (event.pageY-10)+"px").style("left",(event.pageX+10)+"px");})
        .on("mouseout", function(){return tooltip.style("visibility", "hidden");});

  // append scatter plot to brush chart area
   var messages = context.append("g");
       messages.attr("clip-path", "url(#clip)");
       messages.selectAll("rect")
          .data(data2)
          .enter().append("rect")
          .attr('class', 'bar')
          .attr("r",3)
          .style("opacity", .6)
          .attr('width', 1)
          .attr('height', function(d, i) {
              return 40; //fixed height
            })
          .style('fill', 'red')
          .style('stroke', 'red')
          .attr("x", function(d) { return x2(d.date); })
          .attr("y", function(d) { return 0 }); //set default y so that line dosn't get dist

  context.append("g").attr("class", "axis x-axis").attr("transform", "translate(0," + height2 + ")").call(xAxis2);

  context.append("g").attr("class", "brush").call(brush).call(brush.move, x.range());



}



function brushed() {
  if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return; // ignore brush-by-zoom
  var s = d3.event.selection || x2.range();
  x.domain(s.map(x2.invert, x2));
  focus.select(".area").attr("d", area);

  focus.selectAll('.circle')
		  .attr("cx", function(d) { return x(d.date) })
		  .attr("cy", function(d) { return y(d.value); });

  focus.select(".axis--x").call(xAxis);
  svg.select(".zoom").call(zoom.transform, d3.zoomIdentity
      .scale(width / (s[1] - s[0]))
      .translate(-s[0], 0));
}

function zoomed() {
  if (d3.event.sourceEvent && d3.event.sourceEvent.type === "brush") return; // ignore zoom-by-brush
  var t = d3.event.transform;
  x.domain(t.rescaleX(x2).domain());
  focus.select(".area").attr("d", area);

  focus.selectAll('.circle')
		  .attr("cx", function(d) { return x(d.date) })
		  .attr("cy", function(d) { return y(d.value); });

  focus.select(".axis--x").call(xAxis);
  context.select(".brush").call(brush.move, x.range().map(t.invertX, t));
  context.selectAll('.circle')
		  .attr("cx", function(d) { return x(d.date) })
		  .attr("cy", function(d) { return y(d.value); });
}

function type(d) {
  d.date = new Date(d.date);
  d.value = +d.value;
  return d;
}
update();
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
_ruleInfoFormatter(anom) {
console.log(anom);
let deviationTxt = null;
var deviationtotal =Math.round(anom.deviation/anom.count * 100) / 100 ;

if(deviationtotal> 0) {
  deviationTxt = (
    <div>
      {deviationtotal} &ensp;
      <i className="fa fa-long-arrow-up" aria-hidden="true"></i>
    </div>
  )
}
else {
  deviationTxt = (
    <div>
      {deviationtotal} &ensp;
      <i className="fa fa-long-arrow-down" aria-hidden="true"></i>
    </div>
  )

}
  return (
    <tr key={""}>
    <td className="limited">{anom.date}</td>
    <td className="limited">{anom.count}</td>
    <td className="limited">
      <strong> C :{anom.catogory.C} </strong>
      <strong> W :{anom.catogory.W} </strong>
      <strong> I :{anom.catogory.I} </strong>
    </td>
    <td className="limited">
      {deviationTxt}
    </td>
    </tr>

  );
},
  render() {
    console.log(this.state.anomData);
    console.log(moment);
    var data = [];
    (this.state.anomData || []  ).map(function(a) {
      var index = data.findIndex(x => x.date==moment(a.date).format("MM-DD-YYYY"));
      if(index == -1) {
      console.log(a)
      var catogory = { I:0, C:0, W:0 }
      catogory[a.anomalyCategory] ++;
      data.push({date:moment(a.date).format("MM-DD-YYYY"), count:1, catogory:catogory, deviation:a.deviation})
      }
      else {
        data[index].count ++;
        data[index].catogory[a.anomalyCategory] ++;
      	data[index].deviation += a.deviation
      }

      })
      console.log(data)
    if(this.state.loading) {
      return (
        <RingLoader  color={'#1ab394'} loading={true}  />
      )
    }
    else {
      const headers = ['Date', 'Total',   'Anomaly Type', 'Deviation Avg(%)'];
      return (
        <PageHeader title={"Job details: "+this.props.params.jobid}>
          <svg width="1200" height="500"></svg>
          <div>
            <DataTable id="anomaly-list"
            className="table-hover table-condensed table-striped"
            headers={headers}
            headerCellFormatter={this._headerCellFormatter}
            rows={data}
            noDataText="There are no anomaly"
            dataRowFormatter={this._ruleInfoFormatter}
            filterKeys={[]}
            />
            </div>
        </PageHeader>
      );
    }
    }
  });

  export default JobResultDisplay;
