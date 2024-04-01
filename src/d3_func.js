import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const SoilMoistureTable = ({ jsonData }) => {
  const svgRef = useRef();
  const legendRef = useRef();
  const colorScale = d3.scaleSequential(d3.interpolateYlGnBu)
    .domain([0, 1]); // Dummy domain for legend color scale

  useEffect(() => {
    const margin = { top: 20, right: 20, bottom: 30, left: 50 };
    const width = 1200 - margin.left - margin.right;
    const height = 720 - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    //const legend = d3.select(legendRef.current);

    const timeParse = d3.timeParse('%Y-%m-%dT%H:%M');
    const timeFormat = d3.timeFormat('%H:%M');

    // Extract moisture data for each depth level
    const moistureData = jsonData.hourly.time.map((timeStr, i) => ({
      time: timeParse(timeStr),
      depth0_1: jsonData.hourly.soil_moisture_0_to_1cm[i],
      depth1_3: jsonData.hourly.soil_moisture_1_to_3cm[i],
      depth3_9: jsonData.hourly.soil_moisture_3_to_9cm[i],
      depth9_27: jsonData.hourly.soil_moisture_9_to_27cm[i],
      depth27_81: jsonData.hourly.soil_moisture_27_to_81cm[i],
    }));

    // Create x and y scales
    const xScale = d3.scaleBand()
      .domain(moistureData.map(d => d.time))
      .range([0, width])
      .padding(0.1);
    
    const yScale = d3.scaleBand()
      .domain(['27-81cm','9-27cm','3-9cm', '1-3cm', '0-1cm']) // Reversed order
      .range([height, 0])
      .padding(0.1);

    // Add x axis
    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(xScale).tickFormat(timeFormat));

    // Add y axis
    svg.append('g')
      .call(d3.axisLeft(yScale));

    // Add bars
    svg.selectAll('.barGroup')
      .data(moistureData)
      .enter().append('g')
      .attr('class', 'barGroup')
      .attr('transform', d => `translate(${xScale(d.time)},0)`)
      .selectAll('.bar')
      .data(d => [
        { depth: '27-81cm', value: d.depth27_81 },
        { depth: '9-27cm', value: d.depth9_27 },
        { depth: '3-9cm', value: d.depth3_9 },
        { depth: '1-3cm', value: d.depth1_3 },
        { depth: '0-1cm', value: d.depth0_1 }
      ]) // Reversed order
      .enter().append('rect')
      .attr('class', 'bar')
      .attr('y', d => yScale(d.depth))
      .attr('height', yScale.bandwidth())
      .attr('width', xScale.bandwidth())
      .style('fill', d => colorScale(d.value));

    // Add legend
    const legendSize = 20;
    const legendSpacing = 5;
    
    const maxDataValue = d3.max(moistureData, d => d3.max([d.depth0_1, d.depth1_3, d.depth3_9, d.depth9_27, d.depth27_81]));
    const minDataValue = d3.min(moistureData, d => d3.min([d.depth0_1, d.depth1_3, d.depth3_9, d.depth9_27, d.depth27_81]));
     
    const legendScale = d3.scaleLinear()
    .domain([minDataValue, maxDataValue])
    .range([0, legendSize]);
  
  // Add legend
  const legendTicks = 5; // Adjust the number of legend ticks as needed
  const legendDataValues = legendScale.ticks(legendTicks);
  
  const legendGroup = svg.append('g')
    .attr('class', 'legend')
    .attr('transform', `translate(${width - margin.right - 100}, ${margin.top})`);
  
  legendGroup.selectAll('.legendRect')
    .data(legendDataValues)
    .enter()
    .append('rect')
    .attr('class', 'legendRect')
    .attr('x', 0)
    .attr('y', (d, i) => i * (legendSize + legendSpacing))
    .attr('width', legendSize)
    .attr('height', legendSize)
    .style('fill', d => colorScale(d));
  
  legendGroup.selectAll('.legendText')
    .data(legendDataValues)
    .enter()
    .append('text')
    .attr('class', 'legendText')
    .attr('x', legendSize + legendSpacing)
    .attr('y', (d, i) => i * (legendSize + legendSpacing) + legendSize / 2)
    .attr('dy', '0.35em')
    .text(d => d.toFixed(2)); 
  }, [jsonData, colorScale]);

  return (
    <div>
      <svg ref={svgRef}></svg>
      <svg ref={legendRef} width={120} height={70}></svg>
    </div>
  );
};

const SoilTempTable = ({ jsonData }) => {
  const svgRef = useRef();
  const legendRef = useRef();

  useEffect(() => {
    const margin = { top: 20, right: 20, bottom: 30, left: 50 };
    const width = 1200 - margin.left - margin.right;
    const height = 720 - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const legend = d3.select(legendRef.current);

    const timeParse = d3.timeParse('%Y-%m-%dT%H:%M');
    const timeFormat = d3.timeFormat('%H:%M');

    // Extract moisture data for each depth level
    const tempData = jsonData.hourly.time.map((timeStr, i) => ({
      time: timeParse(timeStr),
      depth0: jsonData.hourly.soil_temperature_0cm[i],
      depth6: jsonData.hourly.soil_temperature_6cm[i],
      depth18: jsonData.hourly.soil_temperature_18cm[i],
      depth54: jsonData.hourly.soil_temperature_54cm[i],
    }));

    // Create color scale for each depth level
    const colorScale = d3.scaleOrdinal()
      .domain(['depth0', 'depth6', 'depth18', 'depth54'])
      .range(d3.schemeCategory10);

    // Create x and y scales
    const xScale = d3.scaleTime()
      .domain(d3.extent(tempData, d => d.time))
      .range([0, width]);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(tempData, d => d3.max([d.depth0, d.depth6, d.depth18, d.depth54]))])
      .nice()
      .range([height, 0]);

    // Add x axis
    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(xScale).tickFormat(timeFormat));

    // Add y axis
    svg.append('g')
      .call(d3.axisLeft(yScale));

    // Add lines for each depth level
    ['depth0', 'depth6', 'depth18', 'depth54'].forEach((depth, index) => {
      const line = d3.line()
        .x(d => xScale(d.time))
        .y(d => yScale(d[depth]));

      svg.append('path')
        .datum(tempData)
        .attr('fill', 'none')
        .attr('stroke', colorScale(depth))
        .attr('stroke-width', 2)
        .attr('d', line);

      // Add legend entry
      legend.append('circle')
        .attr('cx', 0)
        .attr('cy', index * 20)
        .attr('r', 5)
        .style('fill', colorScale(depth));

      legend.append('text')
        .attr('x', 10)
        .attr('y', index * 20 + 5)
        .text(depth)
        .style('font-size', '12px')
        .attr('alignment-baseline', 'middle');
    });

  }, [jsonData]);

  return (
    <div>
      <svg ref={svgRef}></svg>
      <svg ref={legendRef} width={150} height={120}></svg>
    </div>
  );
};

const AirGraph = ({ jsonData }) => {
  const svgRef = useRef();
  const legendRef = useRef();

  useEffect(() => {
    const margin = { top: 20, right: 80, bottom: 30, left: 50 };
    const width = 800 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current)
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const legend = d3.select(legendRef.current);

    const parseTime = d3.timeParse("%Y-%m-%dT%H:%M");

    // Parse dates and temperatures
    const data = jsonData.hourly.time.map((timeStr, i) => ({
      time: parseTime(timeStr),
      temperature: jsonData.hourly.temperature_2m[i],
      humidity: jsonData.hourly.relative_humidity_2m[i]
    }));

    // Define scales
    const xScale = d3.scaleTime()
      .domain(d3.extent(data, d => d.time))
      .range([0, width]);

    const yTemperatureScale = d3.scaleLinear()
      .domain([d3.min(data, d => d.temperature), d3.max(data, d => d.temperature)])
      .range([height, 0]);

    const yHumidityScale = d3.scaleLinear()
      .domain([d3.min(data, d => d.humidity), d3.max(data, d => d.humidity)])
      .range([height, 0]);

    // Add temperature line
    const temperatureLine = d3.line()
      .x(d => xScale(d.time))
      .y(d => yTemperatureScale(d.temperature));

    svg.append("path")
      .datum(data)
      .attr("class", "line")
      .attr("d", temperatureLine)
      .style("stroke", "steelblue");

    // Add humidity line
    const humidityLine = d3.line()
      .x(d => xScale(d.time))
      .y(d => yHumidityScale(d.humidity));

    svg.append("path")
      .datum(data)
      .attr("class", "line")
      .attr("d", humidityLine)
      .style("stroke", "green");

    // Add x axis
    svg.append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(d3.axisBottom(xScale));

    // Add y axes
    svg.append("g")
      .call(d3.axisLeft(yTemperatureScale))
      .append("text")
      .attr("fill", "#000")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", "0.71em")
      .attr("text-anchor", "end")
      .text("Temperature (°C)");

    svg.append("g")
      .attr("transform", `translate(${width}, 0)`)
      .call(d3.axisRight(yHumidityScale))
      .append("text")
      .attr("fill", "#000")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", "0.71em")
      .attr("text-anchor", "end")
      .text("Humidity (%)");

    // Add legend
    legend.append("circle")
      .attr("cx", 10)
      .attr("cy", 10)
      .attr("r", 5)
      .style("fill", "steelblue");

    legend.append("text")
      .attr("x", 20)
      .attr("y", 10)
      .attr("dy", ".35em")
      .text("Temperature");

    legend.append("circle")
      .attr("cx", 10)
      .attr("cy", 30)
      .attr("r", 5)
      .style("fill", "green");

    legend.append("text")
      .attr("x", 20)
      .attr("y", 30)
      .attr("dy", ".35em")
      .text("Humidity");

  }, [jsonData]);

  return (
    <div>
      <svg ref={svgRef}></svg>
      <svg ref={legendRef} width={100} height={60}></svg>
    </div>
  );
};



export   {SoilMoistureTable, SoilTempTable, AirGraph};
