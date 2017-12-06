import React from 'react';
import * as d3 from "d3";

import "./style.css"
const LineGraph = React.createClass({
  componentDidMount(){

  },
  getInitialState() {
    return {
      jobs: [],
    };
  },
  render() {
    const data = [{
     "date": "1-May-12",
     "close": 58.13
   },
   {
     "date": "30-Apr-12",
     "close": 53.98
   },
   {
     "date": "27-Apr-12",
     "close": 67
   },
   {
     "date": "26-Apr-12",
     "close": 89.7
   },
   {
     "date": "25-Apr-12",
     "close": 99
   },
   {
     "date": "24-Apr-12",
     "close": 130.28
   },
   {
     "date": "23-Apr-12",
     "close": 166.7
   },
   {
     "date": "20-Apr-12",
     "close": 234.98
   },
   {
     "date": "19-Apr-12",
     "close": 345.44
   },
   {
     "date": "18-Apr-12",
     "close": 443.34
   },
   {
     "date": "17-Apr-12",
     "close": 543.7
   },
   {
     "date": "16-Apr-12",
     "close": 580.13
   },
   {
     "date": "13-Apr-12",
     "close": 605.23
   },
   {
     "date": "12-Apr-12",
     "close": 622.77
   },
   {
     "date": "11-Apr-12",
     "close": 626.2
   },
   {
     "date": "10-Apr-12",
     "close": 628.44
   },
   {
     "date": "9-Apr-12",
     "close": 636.23
   },
   {
     "date": "5-Apr-12",
     "close": 633.68
   },
   {
     "date": "4-Apr-12",
     "close": 624.31
   },
   {
     "date": "3-Apr-12",
     "close": 629.32
   },
   {
     "date": "2-Apr-12",
     "close": 618.63
   },
   {
     "date": "30-Mar-12",
     "close": 599.55
   },
   {
     "date": "29-Mar-12",
     "close": 609.86
   },
   {
     "date": "28-Mar-12",
     "close": 617.62
   },
   {
     "date": "27-Mar-12",
     "close": 614.48
   },
   {
     "date": "26-Mar-12",
     "close": 606.98
   }];

    function mapDate(d) {
      return new Date(d.date);
    }

    function mapValue(d) {
      return d.close;
    }

    const margin = {
      top: 30,
      right: 40,
      bottom: 30,
      left: 40,
    };


    const svgWidth = 960;
    const svgHeight = 500;
    const width = svgWidth - margin.left - margin.right;
    const height = svgHeight - margin.top - margin.bottom;

    $("#graph svg").remove();
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

      console.log(transform.x);
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
  });

  export default LineGraph;
