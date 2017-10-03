import React from 'react';
import serialize from 'form-serialize';
import {FormGroup, ControlLabel, FormControl} from 'react-bootstrap';
import fetch from 'logic/rest/FetchProvider';
import { Row, Col, Button } from 'react-bootstrap';
import $ from 'jquery';
import elasticsearch from 'elasticsearch';
import { Line } from "react-chartjs";
import { Input } from 'components/bootstrap';
import DatePicker from 'react-simple-datepicker';
import 'react-simple-datepicker/dist/index.css';
var client = new elasticsearch.Client({
  host: 'localhost:9200',
  log: 'trace',
});

import URLUtils from 'util/URLUtils';
import ApiRoutes from 'routing/ApiRoutes';
var chartOptions = {
  bezierCurve : false,
  datasetFill : false,
  pointDotStrokeWidth: 4,
  scaleShowVerticalLines: false,
  responsive: true
};

var aggs = [
  {code: 'mean', value: "Mean"},
  {code: 'count', value: "Count"},
]
const StreamSelactBox = React.createClass({
  getInitialState: function() {
    return {
      opts:[],
      optsFields:[],
      chartData: {},
    };
  },

  componentDidMount: function() {

    let tmpl = this;
    var an = [];
    aggs.map(function(a) {
      an.push(<option key={a.code} value={a.code}> {a.value} </option>);
    })
    tmpl.setState({
      typeOPs: an
    })
    const failCallback = (errorThrown) => {
      console.log("errorThrown", errorThrown)
    };
    var callback = function(res) {
      var arrTen = [];
      res.streams.map(function(s) {
        arrTen.push(<option key={s.id} value={s.id}> {s.description} </option>);
      })
      tmpl.setState({
        opts: arrTen
      });
    }
    fetch('GET', "http://localhost:9000/api/streams/").then(callback, failCallback);
  },
  handelStreamChange(evt){
    this.setState({streamName: evt.currentTarget.value})
    let tmpl = this;
    const fb = (errorThrown) => {
      console.log("errorThrown", errorThrown)
    };
    var cb = function(res) {
      var arrTen = [];
      var obj = res['server-metrics'].mappings.metric.properties;
      for (var k in obj) {
        if (obj.hasOwnProperty(k) && ( obj[k].type=== "long" || obj[k].type=== "float") ) {
          arrTen.push(<option key={k} value={k}> {k} </option>);
        }
      }
      tmpl.setState({
        optsFields: arrTen
      });
    }

    var streamId = evt.currentTarget.value;
    //  fetch('GET', "http://localhost:9000/api/search/universal/relative?query=*&filter=streams:"+streamId).then(cb, fb)

    client.indices.getMapping({index: 'server-metrics'}, function(error, response) {
      if (error) {
        console.log(error);
      } else {
        console.log(response, "response");
        cb(response)
      }
    });
  },
  handelAggrigationChange(evt){
    //todo
  },
  handelFieldChange(evt){
    this.setState({fieldName: evt.currentTarget.value})

  },
  onStartSelected(date) {

    this.setState({startDate: new Date(date)})
    console.log(this.state);
  },
  onEndSelected(date) {
    console.log("on end select");
    this.setState({endDate: new Date(date)})
  },
  handelSaveSubmit(evt) {
    var start = $(".start-date").val();
    var end = $(".end-date").val();
    var field = $("#fields").val();
    var value = $("#aggrigationType").val();
    console.log(this.state.streamName);
    console.log(this.state.rawData);
    var res = {
      startDate: start,
      endDate: end,
      field: field,
      aggrigationType: value,
      streamName: this.state.streamName,
      rawData: this.state.rawData
    }
    console.log(res);

  },

  handelSubmit(evt) {

    let tmpl = this;
    var start = $(".start-date").val();
    var end = $(".end-date").val();
    var value = $("#fields").val();
    client.search({
      index: 'server-metrics',
      body: {
        "query": {
          "range": {
            "@timestamp": {
              "gte": start,
              "lte": end,
            }
          }
        },
        aggs: {
          bucket_time: {
            "date_histogram": {
              "field": "@timestamp",
              "interval": "24h"
            },
            aggs: {
              "server_stats": {
                "avg": {
                  "field": value,
                }
              }
            }
          }
        }
      }
    }).then(function (resp) {
      var hits = resp.hits.hits;
      console.log(resp);
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
          d.chartData.labels.push(new Date(b.key_as_string))
          d.chartData.datasets[0].data.push(b.server_stats.value)
        })
        tmpl.setState({rawData:resp.aggregations.bucket_time.buckets});
        tmpl.setState({chartData:d.chartData})
        tmpl.setState({showLine:true})
      }, function (err) {
        console.trace(err.message);
      });
    },
    render(){
      let chart = null;
      if(this.state.showLine) {
        console.log(this.state.chartData);
        chart = (<Line data={this.state.chartData} options={chartOptions} width="1100" height="540" />);
      }
      return(
        <div>
        <Row className="content">

        <Col md={2}>
          <DatePicker onChange={this.onStartSelected} inputClassName="start-date" date={new Date()} />
        </Col>
        <Col md={2}>
          <DatePicker onChange={this.onEndSelected}   inputClassName="end-date" date={new Date()}  />
        </Col>
        <Col md={2}>
        <ControlLabel>select aggrigation type</ControlLabel>
        <FormControl onChange={this.handelAggrigationChange} componentClass="select" id="aggrigationType">
        {this.state.typeOPs}
        </FormControl>
        </Col>
        <Col md={2}>
        <ControlLabel>From a New Search  Select Index</ControlLabel>
        <FormControl onChange={this.handelStreamChange} componentClass="select" id="streamName">
        {this.state.opts}
        </FormControl>
        </Col>
        <Col md={2}>
        <ControlLabel>Select fields</ControlLabel>
        <FormControl  onChange={this.handelFieldChange}  componentClass="select" id="fields">
        {this.state.optsFields}
        </FormControl>
        </Col>
        <Col md={1}>
        <Button onClick={this.handelSubmit}> go </Button>
        <Button onClick={this.handelSaveSubmit}> save </Button>
        </Col>
        </Row>
        <Row className="content">

        {chart}
        </Row>

        </div>


      )
    }
  })

  export default StreamSelactBox;
