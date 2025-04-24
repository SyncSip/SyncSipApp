import React from 'react';
import {
  View,
  StyleSheet,
  Text,
  Dimensions,
} from 'react-native';
import Svg, { Path, G, Line, Text as SvgText, Rect } from 'react-native-svg';
import * as d3 from 'd3';

interface DataPoint {
  time: number;
  pressure: number;
  weight: number;
  flowRate: number | null;
}

interface ModalGraphProps {
  data: DataPoint[];
  shotId?: string;
}

const ModalGraph: React.FC<ModalGraphProps> = ({ data, shotId }) => {
  const windowWidth = Dimensions.get('window').width;
  const margin = { top: 20, right: 60, bottom: 40, left: 60 };
  const width = windowWidth - 80 - margin.left - margin.right;
  const height = 250;
  

  if (!data || data.length === 0) {
    return <View style={styles.noDataContainer}><Text>No graph data available</Text></View>;
  }
  

  const xMax = Math.max(...data.map(d => d.time));
  const pressureMax = Math.max(...data.map(d => d.pressure));
  const weightMax = Math.max(...data.map(d => d.weight));
  

  const xScale = d3.scaleLinear()
    .domain([0, xMax * 1.1])
    .range([0, width]);
    
  const pressureScale = d3.scaleLinear()
    .domain([0, Math.max(12, pressureMax * 1.1)])
    .range([height, 0]);
    
  const weightScale = d3.scaleLinear()
    .domain([0, Math.max(50, weightMax * 1.1)])
    .range([height, 0]);
    
  const pressureLine = d3.line<DataPoint>()
    .x(d => xScale(d.time))
    .y(d => pressureScale(d.pressure))
    .curve(d3.curveLinear);
    
  const weightLine = d3.line<DataPoint>()
    .x(d => xScale(d.time))
    .y(d => weightScale(d.weight))
    .curve(d3.curveLinear);
    
  const pressurePath = pressureLine(data) || '';
  const weightPath = weightLine(data) || '';
  
  const xTicks = xScale.ticks(5);
  const pressureTicks = pressureScale.ticks(6);
  const weightTicks = weightScale.ticks(5);
  
  return (
    <View style={styles.modalGraphContainer}>
      <Svg width={width + margin.left + margin.right} height={height + margin.top + margin.bottom}>
        <G transform={`translate(${margin.left},${margin.top})`}>
          <Rect 
            x={0} 
            y={0} 
            width={width} 
            height={height} 
            fill="#f8f8f8" 
            stroke="#ddd"
          />
          
          {xTicks.map((tick, i) => (
            <Line 
              key={`x-grid-${i}`}
              x1={xScale(tick)}
              y1={0}
              x2={xScale(tick)}
              y2={height}
              stroke="#eee"
              strokeWidth={1}
            />
          ))}
          
          {pressureTicks.map((tick, i) => (
            <Line 
              key={`y-grid-${i}`}
              x1={0}
              y1={pressureScale(tick)}
              x2={width}
              y2={pressureScale(tick)}
              stroke="#eee"
              strokeWidth={1}
            />
          ))}
          
          <Line x1={0} y1={height} x2={width} y2={height} stroke="black" strokeWidth={1} />
          <Line x1={0} y1={0} x2={0} y2={height} stroke="black" strokeWidth={1} />
          <Line x1={width} y1={0} x2={width} y2={height} stroke="blue" strokeWidth={1} strokeDasharray="4,4" />
          
          {xTicks.map((tick, i) => (
            <G key={`x-tick-${i}`}>
              <Line 
                x1={xScale(tick)} 
                y1={height} 
                x2={xScale(tick)} 
                y2={height + 5} 
                stroke="black" 
              />
              <SvgText 
                x={xScale(tick)} 
                y={height + 20} 
                textAnchor="middle" 
                fontSize={10}
              >
                {tick}s
              </SvgText>
            </G>
          ))}
          
          {pressureTicks.map((tick, i) => (
            <G key={`pressure-tick-${i}`}>
              <Line 
                x1={0} 
                y1={pressureScale(tick)} 
                x2={-5} 
                y2={pressureScale(tick)} 
                stroke="black" 
              />
              <SvgText 
                x={-10} 
                y={pressureScale(tick)} 
                textAnchor="end" 
                fontSize={10} 
                alignmentBaseline="middle" 
                fill="red"
              >
                {tick}
              </SvgText>
            </G>
          ))}
          
          {weightTicks.map((tick, i) => (
            <G key={`weight-tick-${i}`}>
              <Line 
                x1={width} 
                y1={weightScale(tick)} 
                x2={width + 5} 
                y2={weightScale(tick)} 
                stroke="blue" 
              />
              <SvgText 
                x={width + 10} 
                y={weightScale(tick)} 
                textAnchor="start" 
                fontSize={10} 
                alignmentBaseline="middle" 
                fill="blue"
              >
                {tick}
              </SvgText>
            </G>
          ))}
          
          <SvgText 
            x={width / 2} 
            y={height + 35} 
            textAnchor="middle" 
            fontSize={12}
          >
            Time (seconds)
          </SvgText>
          
          <SvgText 
            x={-40} 
            y={height / 2} 
            textAnchor="middle" 
            transform={`rotate(-90, -40, ${height / 2})`} 
            fontSize={12} 
            fill="red"
          >
            Pressure (bar)
          </SvgText>
          
          <SvgText 
            x={width + 40} 
            y={height / 2} 
            textAnchor="middle" 
            transform={`rotate(-90, ${width + 40}, ${height / 2})`} 
            fontSize={12} 
            fill="blue"
          >
            Weight (g)
          </SvgText>
          
          <Path d={pressurePath} stroke="red" strokeWidth={2} fill="none" />
          <Path d={weightPath} stroke="blue" strokeWidth={2} fill="none" />
          

          <G transform={`translate(${width - 100}, 10)`}>
            <Line x1={0} y1={0} x2={20} y2={0} stroke="red" strokeWidth={2} />
            <SvgText x={25} y={5} fontSize={10} fill="red">Pressure</SvgText>
            
            <Line x1={0} y1={15} x2={20} y2={15} stroke="blue" strokeWidth={2} />
            <SvgText x={25} y={20} fontSize={10} fill="blue">Weight</SvgText>
          </G>
        </G>
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  modalGraphContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 5,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  noDataContainer: {
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 20,
  },
});

export default ModalGraph;
