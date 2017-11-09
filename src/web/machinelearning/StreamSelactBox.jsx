import React from 'react';
import serialize from 'form-serialize';
import randomId from 'random-id';
import {FormGroup, ControlLabel, FormControl} from 'react-bootstrap';
import fetch from 'logic/rest/FetchProvider';
import { Row, Col, Button } from 'react-bootstrap';
import $ from 'jquery';
import elasticsearch from 'elasticsearch';
import { Line } from "react-chartjs";
import { Input } from 'components/bootstrap';
import { TextField } from 'components/configurationforms';
import DatePicker from 'react-simple-datepicker';

import moment from 'moment';
import { Graph } from 'react-d3-graph';
import {Form, Field} from 'simple-react-form'

var client = new elasticsearch.Client({
  host: 'localhost:9200',
  log: 'trace',
});

const myConfig = {
    highlightBehavior: true,
    node: {
        color: 'lightgreen',
        size: 120,
        highlightStrokeColor: 'blue'
    },
    link: {
        highlightColor: 'lightblue'
    }
};

const onClickNode = function(nodeId) {
     window.alert('Clicked node', nodeId);
};

const onMouseOverNode = function(nodeId) {
     window.alert('Mouse over node', nodeId);
};

const onMouseOutNode = function(nodeId) {
     window.alert('Mouse out node', nodeId);
};

const onClickLink = function(source, target) {
     window.alert(`Clicked link between ${source} and ${target}`);
};
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
const StreamSelactBox = React.createClass({
  getInitialState: function() {
    return {
      opts:[],
      optsFields:[],
      optsBuckets:[],
      chartData: {},
      job: {}
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
      console.log(res.streams, "streams*********************");
      res.streams.map(function(s) {
        arrTen.push(<option key={s.id} value={s.id}> {s.description} </option>);
      })
      tmpl.setState({
        opts: arrTen
      });
    }
    fetch('GET', "http://localhost:9000/api/streams/").then(callback, failCallback);
  },
  handelBucketsChange(evt){
    this.setState({bucket: evt.currentTarget.value});
  },
  handelStreamChange(evt){
    const job = this.state.job;

    const parameter = evt.target.name;
    const value = evt.target.type === 'checkbox' ? evt.target.checked : evt.target.value;
    console.log(parameter);
    console.log(value);
    job[parameter] =value;
    this.setState({ job: job });
    // this.setState({streamName: evt.currentTarget.value})
    console.log(this.state);
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

    var streamName = evt.currentTarget.value;
    //  fetch('GET', "http://localhost:9000/api/search/universal/relative?query=*&filter=streams:"+streamName).then(cb, fb)

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
    let tmpl = this;
    const failCallback = (errorThrown) => {
      console.log("errorThrown", errorThrown)
    };
    var callback = function(k) {
        tmpl.props.handler({showCreateJob: true})
    }
    fetch('PUT', "http://localhost:9000/api/plugins/org.graylog.plugins.machinelearning/rules", {job: this.state.job}).then(callback, failCallback);

  },
  _createStreamSelectItems(){
    const items = [];
    for (let i = 0; i < this.state.opts.length; i++) {
      items.push(<option key={i} value={this.state.streams[i].id}>{this.state.streams[i].title}</option>);
    }
    return items;
  },

  _onValueChanged(event) {
    const job = this.state.job;
    const parameter = event.target.name;
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    job[parameter] =value;
    this.setState({ job: job });
  },
  handelSubmit(evt) {
    let tmpl = this;
    const job = this.state.job;
    // TODO: change this to real date
    var start = "2016-04-05";
    var end = "2017-04-05";
    job["startDate"] = start;
    job["endDate"] = end;
    this.setState({ job: job });
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
              "interval": this.state.job.buckets,
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
    },
    render(){
      const titleField = { is_optional: false, attributes: [], human_name: 'Title', description: "job id details" };
      let chart = null;
      if(this.state.showLine) {
        console.log(this.state.chartData);
        chart = (<Line data={this.state.chartData} options={chartOptions} width="1100" height="540" />);
      }
      return(
        <div>
             <Form state={this.state} onChange={state => this.setState(state)}>
                 <Row className="content">
                 <Col md={6}>
                 <DatePicker onChange={this.onStartSelected} inputClassName="start-date" date={new Date()} />
                 </Col>
                 <Col md={6}>
                 <DatePicker onChange={this.onEndSelected}   inputClassName="end-date" date={new Date()}  />
                 </Col>
                 </Row>
               <Input ref="jobid" name="jobid" id="jobid" type="text" maxLength={100}
                 labelClassName="col-sm-2" wrapperClassName="col-sm-10"
                 label="Name" help="Job name" required
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
                 <Input ref="buckets" name="buckets" id="buckets" type="select" value={this.state.bucket}
                   labelClassName="col-sm-2" wrapperClassName="col-sm-10"
                   label="time span" help="Select time span." required
                   onChange={this._onValueChanged} > {buck}
                 </Input>
                 <Button onClick={this.handelSubmit}> go </Button>
                 <Button onClick={this.handelSaveSubmit}> save </Button>
             </Form>
              <div>
                {chart}
               </div>
             </div>


      )
    }
  })

  export default StreamSelactBox;
