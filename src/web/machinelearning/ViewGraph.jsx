import React from 'react';
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
import * as d3 from "d3";
import client from 'machinelearning/ElasticSearch'

const MachineLearningPage = React.createClass({

  componentDidMount(){
    let tmpl = this;
    // var client = new elasticsearch.Client({
    //   host: '35.193.61.95:9200',
    //   log: 'trace'
    // });
    client.search({
      index: 'anomaly_result',
      size:10000,
      body: {
        query: {
          "match": {
            "jobid":  this.props.jobid,
         }
        }
      }
    }).then(function (resp) {
    var hits = resp.hits.hits;
    var res = [];
    var anom = [];
    resp.hits.hits.map(function(h) {
      res.push({date : new Date(h._source.timestamp), close: h._source.actual_value })
      if(h._source.flag) {
        anom.push({deviation_expected: h._source.deviation_expected, expected_value: h._source.expected_value ,date : new Date(h._source.timestamp), close: h._source.anoms })
      }
      // console.log(anom, "sdfjhsd****888");
    })
    tmpl.setState({data: res})
    tmpl.setState({anmdata: anom})
}, function (err) {
    console.trace(err.message);
});
// fetch('GET', "http://localhost:9000/api/plugins/org.graylog.plugins.machinelearning/rules").then(function(x) {
//       tmpl.setState({jobs: x.jobs})
//   }, function(err) {
//     console.log(err);
//   });
  },

  getInitialState() {
    return {
      showCreateJob: false,
    };
  },
  handelCreatejob(evt) {
    this.setState({showCreateJob: !this.state.showCreateJob})

  },
  render() {
    if(this.state.data) {
      var data = this.state.data;
      var svg = d3.select("svg");
      var margin = {top: 20, right: 20, bottom: 30, left: 50};
      var width = +960 - margin.left - margin.right;
      var height = +500 - margin.top - margin.bottom;
      var g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      var parseTime = d3.timeParse("%d-%b-%y");

      var x = d3.scaleTime()
      .rangeRound([0, width]);


      var y = d3.scaleLinear()
      .rangeRound([height, 0]);


      var line = d3.line().x(function(d) {  return x(d.date); }).y(function(d) { return y(d.close); });
      x.domain(d3.extent(data, function(d) { return d.date; }));
      y.domain(d3.extent(data, function(d) { return d.close; }));
      g.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x))
      .select(".domain")
      .remove();
      g.append("g")
      .call(d3.axisLeft(y))
      .append("text")
      .attr("fill", "#000")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", "0.71em")
      .attr("text-anchor", "end")
      .text("Count");
      g.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-linejoin", "round")
      .attr("stroke-linecap", "round")
      .attr("stroke-width", 1.5)
      .attr("d", line);
      var tooltip = d3.select("body")
      	.append("div")
      	.style("position", "absolute")
      	.style("z-index", "10")
      	.style("visibility", "hidden")
      	.text("a simple tooltip");
if(this.state.anmdata) {
  g.selectAll(".dot")
  .data(this.state.anmdata)
  .enter()
  .append("circle")
  .attr("class", "dot")
  .attr("r", 3.5)
  .attr("cx", function(d) { return x(d.date); })
  .attr("cy", function(d) { return y(d.close); })
  .on("mouseover", function(d){
    return tooltip.style("visibility", "visible").html("Expected value is: "+d.expected_value + "<br/>"  + "value : "+d.close +"<br/>"  + "deviation is: "+d.deviation_expected)
  })
  	.on("mousemove", function(){return tooltip.style("top", (event.pageY-10)+"px").style("left",(event.pageX+10)+"px");})
  	.on("mouseout", function(){return tooltip.style("visibility", "hidden");});


}
}

    return (
      <svg width="960" height="500"></svg>
    );
  },
});

export default MachineLearningPage;
