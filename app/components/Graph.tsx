import React, { useEffect, useRef, useState } from 'react';
import { View, Dimensions, StyleSheet } from 'react-native';
import Svg, { Path, G, Line, Text } from 'react-native-svg';
import * as d3 from 'd3';
import { useBluetooth } from './BluetoothContext';

interface DataPoint {
  time: number;
  pressure: number;
  weight: number;
  flowRate: number;
}

const EspressoGraph = ({ isStarted }: { isStarted: boolean }) => {
  const [data, setData] = useState<DataPoint[]>([]);
  const animationFrameId = useRef<number>();
  const startTime = useRef<number>(0);
  const xDomainRef = useRef([0, 60]);
  const lastUpdateTime = useRef<number>(0);

  const {
    pressureValue,
  } = useBluetooth()

  const SCREEN_WIDTH = Dimensions.get('window').width;
  const SCREEN_HEIGHT = Dimensions.get('window').height;
  const margin = { top: 50, right: 50, bottom: 50, left: 50 };
  const width = SCREEN_HEIGHT - margin.left - margin.right - 200;
  const height = 400 - margin.top - margin.bottom;

  const xScale = d3.scaleLinear()
    .domain(xDomainRef.current)
    .range([0, width]);

  const yPressureScale = d3.scaleLinear()
    .domain([0, 12])
    .range([height, 0]);

  const yWeightScale = d3.scaleLinear()
    .domain([0, 80])
    .range([height, 0]);

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
      setData([]);
      xDomainRef.current = [0, 60];
      startTime.current = Date.now();
      lastUpdateTime.current = Date.now();
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
    // const currentTime = (Date.now() - startTime.current) / 1000;
    // const { pressure, weight } = getNextValues(0, 0, currentTime);
    
    // const flowRate = data.length > 1 
      // ? (weight - data[data.length - 1].weight) / 
        // (currentTime - data[data.length - 1].time)
      // : 0;

    const newDataPoint = {
      time: 0,
      pressure: pressureValue || 0,
      weight: 0,
      flowRate: 0
    };

    setData(prevData => {
      const newData = [...prevData, newDataPoint];
      
      const now = Date.now();
      if (now - lastUpdateTime.current > 500) {
        const maxTime = Math.max(...newData.map(d => d.time));
        if (maxTime > xDomainRef.current[1] * 0.8) {
          xDomainRef.current = [0, Math.ceil(maxTime * 1.2)];
          xScale.domain(xDomainRef.current);
          lastUpdateTime.current = now;
        }
      }
      
      return newData;
    });

    animationFrameId.current = requestAnimationFrame(updateGraph);
  };

  const xAxisTicks = xScale.ticks(10).map(tick => ({
    value: tick,
    xOffset: xScale(tick)
  }));

  return (
    <View style={styles.container}>
      <View style={styles.graphWrapper}>
        <Svg width={SCREEN_HEIGHT} height={500}>
          <G transform={`translate(${margin.left},${margin.top})`}>
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
              y={height + 25}
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    bottom: 150,
    right: 110
  },
  graphWrapper: {
    transform: [{ rotate: '90deg' }],
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
    position: 'absolute',
    right: Dimensions.get('window').width / 3,
    top: 0,
  }
});

export default EspressoGraph;
