import React, { useEffect, useRef, useState } from 'react';
import { View, Dimensions, StyleSheet } from 'react-native';
import Svg, { Path, G, Line, Text } from 'react-native-svg';
import * as d3 from 'd3';

interface DataPoint {
  time: number;
  pressure: number;
  weight: number;
  flowRate: number;
}

const getNextValues = (currentPressure: number, currentWeight: number, elapsedTime: number): { pressure: number, weight: number } => {
  const PREINFUSION_TIME = 10;
  const RAMPUP_TIME = 3;
  const EXTRACTION_TIME = 27;
  const DECLINE_TIME = 10;
  const TOTAL_TIME = PREINFUSION_TIME + RAMPUP_TIME + EXTRACTION_TIME + DECLINE_TIME;

  const PREINFUSION_PRESSURE = 2;
  const EXTRACTION_PRESSURE = 9;
  const TARGET_WEIGHT = 40;

  if (elapsedTime <= PREINFUSION_TIME) {
    const progress = elapsedTime / PREINFUSION_TIME;
    const pressure = PREINFUSION_PRESSURE * progress;
    const weight = (TARGET_WEIGHT * 0.05) * progress;
    return { pressure, weight };
  } 
  else if (elapsedTime <= PREINFUSION_TIME + RAMPUP_TIME) {
    const progress = (elapsedTime - PREINFUSION_TIME) / RAMPUP_TIME;
    const pressure = PREINFUSION_PRESSURE + (EXTRACTION_PRESSURE - PREINFUSION_PRESSURE) * progress;
    const weight = TARGET_WEIGHT * 0.1;
    return { pressure, weight };
  } 
  else if (elapsedTime <= PREINFUSION_TIME + RAMPUP_TIME + EXTRACTION_TIME) {
    const progress = (elapsedTime - (PREINFUSION_TIME + RAMPUP_TIME)) / EXTRACTION_TIME;
    const pressure = EXTRACTION_PRESSURE;
    const weight = TARGET_WEIGHT * (0.1 + 0.8 * progress); 
    return { pressure, weight };
  } 
  else if (elapsedTime <= TOTAL_TIME) {
    const progress = (elapsedTime - (PREINFUSION_TIME + RAMPUP_TIME + EXTRACTION_TIME)) / DECLINE_TIME;
    const pressure = EXTRACTION_PRESSURE * (1 - progress);
    const weight = TARGET_WEIGHT * (0.9 + 0.1 * progress);
    return { pressure, weight };
  } 
  else {
    return { pressure: 0, weight: TARGET_WEIGHT };
  }
};

const EspressoGraph = ({ isStarted }: { isStarted: boolean }) => {
  const [data, setData] = useState<DataPoint[]>([]);
  const [xDomain, setXDomain] = useState([0, 50]);
  const animationFrameId = useRef<number>();
  const startTime = useRef<number>(0);

  // Dimensions and margins
  const SCREEN_WIDTH = Dimensions.get('window').width;
  const margin = { top: 20, right: 50, bottom: 30, left: 50 };
  const width = SCREEN_WIDTH - margin.left - margin.right;
  const height = 450 - margin.top - margin.bottom;

  // Scales
  const xScale = d3.scaleLinear()
    .domain(xDomain)
    .range([0, width]);

  const yPressureScale = d3.scaleLinear()
    .domain([0, 12])
    .range([height, 0]);

  const yWeightScale = d3.scaleLinear()
    .domain([0, 80])
    .range([height, 0]);

  // Line generators
  const pressureLine = d3.line<DataPoint>()
    .x(d => xScale(d.time))
    .y(d => yPressureScale(d.pressure))
    .curve(d3.curveBasis);

  const weightLine = d3.line<DataPoint>()
    .x(d => xScale(d.time))
    .y(d => yWeightScale(d.weight))
    .curve(d3.curveBasis);

  const flowRateLine = d3.line<DataPoint>()
    .x(d => xScale(d.time))
    .y(d => yWeightScale(d.flowRate * 2))
    .curve(d3.curveBasis);

  useEffect(() => {
    if (isStarted) {
      startTime.current = Date.now();
      updateGraph();
    } else {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    }

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [isStarted]);

  const updateGraph = () => {
    const currentTime = (Date.now() - startTime.current) / 1000;
    const { pressure, weight } = getNextValues(0, 0, currentTime);
    
    const flowRate = data.length > 1 
      ? (weight - data[data.length - 1].weight) / 
        (currentTime - data[data.length - 1].time)
      : 0;

    const newDataPoint = {
      time: currentTime,
      pressure,
      weight,
      flowRate: Math.max(0, flowRate)
    };

    setData(prevData => {
      const newData = [...prevData, newDataPoint];
      
      // Check if we need to rescale the x-axis
      const maxTime = Math.max(...newData.map(d => d.time));
      if (maxTime > xDomain[1]) {
        // Increase the domain by 20%
        const newMax = Math.ceil(maxTime * 1.2);
        setXDomain([0, newMax]);
      }
      
      return newData;
    });

    animationFrameId.current = requestAnimationFrame(updateGraph);
  };

  // Generate x-axis ticks
  const xAxisTicks = xScale.ticks(10).map(tick => ({
    value: tick,
    xOffset: xScale(tick)
  }));

  return (
    <View style={styles.container}>
      <Svg width={SCREEN_WIDTH} height={600}>
        <G transform={`translate(${margin.left},${margin.top})`}>
          {/* X-axis with ticks */}
          <Line
            x1={0}
            y1={height}
            x2={width}
            y2={height}
            stroke="black"
          />
          {xAxisTicks.map(({ value, xOffset }) => (
            <G key={`tick-${value}`}>
              <Line
                x1={xOffset}
                y1={height}
                x2={xOffset}
                y2={height + 5}
                stroke="black"
              />
              <Text
                x={xOffset}
                y={height + 20}
                textAnchor="middle"
                fontSize={10}
              >
                {value}
              </Text>
            </G>
          ))}

          {/* Y-axes */}
          <Line
            x1={0}
            y1={0}
            x2={0}
            y2={height}
            stroke="black"
          />
          <Line
            x1={width}
            y1={0}
            x2={width}
            y2={height}
            stroke="black"
          />

          {/* Data lines */}
          <Path
            d={pressureLine(data) || ''}
            stroke="red"
            strokeWidth={2}
            fill="none"
          />
          <Path
            d={weightLine(data) || ''}
            stroke="blue"
            strokeWidth={2}
            fill="none"
          />
          <Path
            d={flowRateLine(data) || ''}
            stroke="green"
            strokeWidth={2}
            fill="none"
          />

          {/* Axis labels */}
          <Text
            x={width / 2}
            y={height + 35}
            textAnchor="middle"
            fill="black"
          >
            Time (seconds)
          </Text>
          <Text
            x={-height / 2}
            y={-35}
            textAnchor="middle"
            transform={`rotate(-90)`}
            fill="black"
          >
            Pressure (bar)
          </Text>
          <Text
            x={width + height / 2}
            y={-35}
            textAnchor="middle"
            transform={`rotate(90, ${width}, 0)`}
            fill="black"
          >
            Weight (g)
          </Text>
        </G>
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    height: 600,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center'
  }
});

export default EspressoGraph;
