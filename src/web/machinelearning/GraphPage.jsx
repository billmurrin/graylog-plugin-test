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

const MachineLearningPage = React.createClass({

  componentDidMount(){
    let tmpl = this;
    // console.log("componentDidMount");
    var client = new elasticsearch.Client({
      host: '35.185.240.124:9200',
      log: 'trace'
    });
    // console.log(client);
    client.search({
  index: 'raw_index2',
  size:10000,
  body: {
    query: {
       "match_all": {}
    }
  }
}).then(function (resp) {
    var hits = resp.hits.hits;
    // console.log(resp);
    var res = [];
    resp.hits.hits.map(function(h) {
      res.push({date : new Date(h._source.timestamp), close: h._source.count })
    })
    tmpl.setState({data: res})

}, function (err) {
    // console.trace(err.message);
});
    client.search({
  index: 'anomaly_index2',
  size:10000,
  body: {
    query: {
       "match_all": {}
    }
  }
}).then(function (resp) {
    var hits = resp.hits.hits;
    console.log(resp, "anom");
    var res = [];
    resp.hits.hits.map(function(h) {
      res.push({ deviation_expected: h._source.deviation_expected, xpected_value: h._source.expected_value, date : new Date(h._source.timestamp), close: h._source.anoms })
    })
    tmpl.setState({anmdata: res})

}, function (err) {
    console.trace(err.message);
});
fetch('GET', "http://localhost:9000/api/plugins/org.graylog.plugins.machinelearning/rules").then(function(x) {
      tmpl.setState({jobs: x.jobs})
  }, function(err) {
    console.log(err);
  });
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
  render() {
    console.log(this.state);
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
      .text("Count )");
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

console.log(this.state.anmdata);
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
    return tooltip.style("visibility", "visible").html("Expected value is: "+d.xpected_value + "<br/>"  + "but value was: "+d.close +"<br/>"  + "deviation_expected is: "+d.deviation_expected)
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
