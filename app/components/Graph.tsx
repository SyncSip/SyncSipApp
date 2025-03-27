import React, { useEffect, useRef, useState } from 'react';
import { View, Dimensions, StyleSheet, Text as RNText, TextInput, TouchableOpacity } from 'react-native';
import Svg, { Path, G, Line, Text, Rect } from 'react-native-svg';
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
  const [currentPressure, setCurrentPressure] = useState(0);
  const [currentWeight, setCurrentWeight] = useState(0);
  const [currentFlowRate, setCurrentFlowRate] = useState(0);
  const [doseWeight, setDoseWeight] = useState('18');
  const [ratio, setRatio] = useState(0);
  const [pressurePathString, setPressurePathString] = useState('');
  const [weightPathString, setWeightPathString] = useState('');
  const [isEditingDose, setIsEditingDose] = useState(false);
  
  const animationFrameId = useRef<number | null>(null);
  const startTime = useRef<number>(0);
  const lastWeight = useRef<number>(0);
  const lastWeightTime = useRef<number>(0);
  
  const { pressureValue, scaleValue } = useBluetooth();
  
  const SCREEN_WIDTH = Dimensions.get('window').width;
  const margin = { top: 40, right: 60, bottom: 50, left: 50 };
  const width = SCREEN_WIDTH - margin.left - margin.right;
  const height = 300;

  const xScale = d3.scaleLinear()
    .domain([0, 30])
    .range([0, width]);

  const pressureYScale = d3.scaleLinear()
    .domain([0, 12])
    .range([height, 0]);
    
  const weightYScale = d3.scaleLinear()
    .domain([0, 50])
    .range([height, 0]);

  const pressureLineGenerator = d3.line<DataPoint>()
    .x(d => xScale(d.time))
    .y(d => pressureYScale(d.pressure))
    .curve(d3.curveLinear);
    
  const weightLineGenerator = d3.line<DataPoint>()
    .x(d => xScale(d.time))
    .y(d => weightYScale(d.weight))
    .curve(d3.curveLinear);

  const calculateFlowRate = (currentTime: number, currentWeight: number) => {
    if (lastWeightTime.current === 0) {
      lastWeightTime.current = currentTime;
      lastWeight.current = currentWeight;
      return 0;
    }
    
    const timeDiff = currentTime - lastWeightTime.current;
    if (timeDiff < 0.1) return currentFlowRate;
    
    const weightDiff = currentWeight - lastWeight.current;
    const flowRate = weightDiff / timeDiff;
    
    lastWeightTime.current = currentTime;
    lastWeight.current = currentWeight;
    
    return 0.7 * currentFlowRate + 0.3 * flowRate;
  };

  const calculateRatio = (weight: number) => {
    if (weight <= 0) return 0;
    const dose = parseFloat(doseWeight);
    return dose / weight;
  };

  useEffect(() => {
    if (pressureValue !== null) {
      setCurrentPressure(pressureValue);
    }
    
    if (scaleValue !== null) {
      setCurrentWeight(scaleValue);
      setRatio(calculateRatio(scaleValue));
    }
    
    if (isStarted && startTime.current > 0) {
      const currentTime = (Date.now() - startTime.current) / 1000;
      const weight = scaleValue !== null ? scaleValue : 0;
      const flowRate = calculateFlowRate(currentTime, weight);
      setCurrentFlowRate(flowRate);
      
      addDataPoint(
        currentTime, 
        pressureValue !== null ? pressureValue : 0,
        weight,
        flowRate
      );
    }
  }, [pressureValue, scaleValue, isStarted]);

  useEffect(() => {
    if (isStarted) {
      setData([]);
      setPressurePathString('');
      setWeightPathString('');
      startTime.current = Date.now();
      lastWeight.current = 0;
      lastWeightTime.current = 0;
      setCurrentFlowRate(0);
      
      addDataPoint(0, pressureValue || 0, scaleValue || 0, 0);
      
      console.log("Graph recording started");
    } else {
      console.log("Graph recording stopped");
    }

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
        animationFrameId.current = null;
      }
    };
  }, [isStarted]);

  const addDataPoint = (time: number, pressure: number, weight: number, flowRate: number) => {
    setData(prevData => {
      const newData = [...prevData, { time, pressure, weight, flowRate }];
      
      const trimmedData = newData.length > 300 ? newData.slice(-300) : newData;
      
      const newPressurePathString = pressureLineGenerator(trimmedData) || '';
      setPressurePathString(newPressurePathString);
      
      const newWeightPathString = weightLineGenerator(trimmedData) || '';
      setWeightPathString(newWeightPathString);
      
      if (time > 25 && xScale.domain()[1] <= 30) {
        xScale.domain([0, 60]);
      } else if (time > 50 && xScale.domain()[1] <= 60) {
        xScale.domain([0, 120]);
      }
      
      return trimmedData;
    });
  };

  const xTicks = xScale.ticks(5);
  const pressureYTicks = pressureYScale.ticks(6);
  const weightYTicks = weightYScale.ticks(5);

  const handleDoseChange = (text: string) => {
    const filtered = text.replace(/[^0-9.]/g, '');
    setDoseWeight(filtered);
  };

  const finishDoseEdit = () => {
    setIsEditingDose(false);
    if (currentWeight > 0) {
      setRatio(calculateRatio(currentWeight));
    }
  };

  return (
    <View style={styles.container}>
      {/* Dose Input and Ratio Display */}
      <View style={styles.doseRatioContainer}>
        <View style={styles.doseInputContainer}>
          <RNText style={styles.label}>Dose:</RNText>
          {isEditingDose ? (
            <View style={styles.doseEditContainer}>
              <TextInput
                style={styles.doseInput}
                keyboardType="numeric"
                value={doseWeight}
                onChangeText={handleDoseChange}
                autoFocus
                selectTextOnFocus
              />
              <TouchableOpacity 
                style={styles.doseButton}
                onPress={finishDoseEdit}
              >
                <RNText style={styles.doseButtonText}>✓</RNText>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity onPress={() => setIsEditingDose(true)}>
              <RNText style={styles.doseValue}>{doseWeight}g</RNText>
            </TouchableOpacity>
          )}
        </View>
        
        <View style={styles.ratioContainer}>
          <RNText style={styles.label}>Ratio:</RNText>
          <RNText style={styles.ratioValue}>
            1:{ratio.toFixed(2)}
          </RNText>
        </View>
      </View>
      
      {/* Flow Rate Display */}
      <View style={styles.flowRateContainer}>
        <RNText style={styles.label}>Flow Rate:</RNText>
        <RNText style={styles.flowRateValue}>
          {currentFlowRate.toFixed(2)} g/s
        </RNText>
      </View>
      
      {/* Current Values Display */}
      <View style={styles.currentValueContainer}>
        <View style={styles.valueItem}>
          <RNText style={styles.currentValueLabel}>Pressure:</RNText>
          <RNText style={[styles.currentValueText, {color: 'red'}]}>
            {currentPressure.toFixed(2)} bar
          </RNText>
        </View>
        <View style={styles.valueDivider} />
        <View style={styles.valueItem}>
          <RNText style={styles.currentValueLabel}>Weight:</RNText>
          <RNText style={[styles.currentValueText, {color: 'blue'}]}>
            {currentWeight.toFixed(2)} g
          </RNText>
        </View>
      </View>
      
      {/* Debug info */}
      <View style={styles.debugContainer}>
        <RNText style={styles.debugText}>
          Data points: {data.length} | 
          Recording: {isStarted ? 'Yes' : 'No'}
        </RNText>
      </View>
      
      {/* Graph */}
      <View style={styles.graphContainer}>
        <Svg width={SCREEN_WIDTH} height={height + margin.top + margin.bottom}>
          <G transform={`translate(${margin.left},${margin.top})`}>
            {/* Background */}
            <Rect 
              x={0} 
              y={0} 
              width={width} 
              height={height} 
              fill="#f8f8f8" 
              stroke="#ddd"
            />
            
            {/* Grid lines */}
            {pressureYTicks.map(tick => (
              <Line 
                key={`grid-y-${tick}`}
                x1={0}
                y1={pressureYScale(tick)}
                x2={width}
                y2={pressureYScale(tick)}
                stroke="#eee"
                strokeWidth={1}
              />
            ))}
            
            {xTicks.map(tick => (
              <Line 
                key={`grid-x-${tick}`}
                x1={xScale(tick)}
                y1={0}
                x2={xScale(tick)}
                y2={height}
                stroke="#eee"
                strokeWidth={1}
              />
            ))}
            
            {/* X and Y axes */}
            <Line x1={0} y1={height} x2={width} y2={height} stroke="black" strokeWidth={1} />
            <Line x1={0} y1={0} x2={0} y2={height} stroke="black" strokeWidth={1} />
            
            {/* Right Y-axis for weight */}
            <Line x1={width} y1={0} x2={width} y2={height} stroke="blue" strokeWidth={1} strokeDasharray="4,4" />
            
            {/* X-axis ticks */}
            {xTicks.map(tick => (
              <G key={`tick-x-${tick}`}>
                <Line x1={xScale(tick)} y1={height} x2={xScale(tick)} y2={height + 5} stroke="black" />
                <Text x={xScale(tick)} y={height + 20} textAnchor="middle" fontSize={10}>
                  {tick}s
                </Text>
              </G>
            ))}
            
            {/* Left Y-axis ticks (Pressure) */}
            {pressureYTicks.map(tick => (
              <G key={`tick-y-pressure-${tick}`}>
                <Line x1={0} y1={pressureYScale(tick)} x2={-5} y2={pressureYScale(tick)} stroke="black" />
                <Text x={-10} y={pressureYScale(tick)} textAnchor="end" fontSize={10} alignmentBaseline="middle" fill="red">
                  {tick}
                </Text>
              </G>
            ))}
            
            {/* Right Y-axis ticks (Weight) */}
            {weightYTicks.map(tick => (
              <G key={`tick-y-weight-${tick}`}>
                <Line x1={width} y1={weightYScale(tick)} x2={width + 5} y2={weightYScale(tick)} stroke="blue" />
                <Text x={width + 10} y={weightYScale(tick)} textAnchor="start" fontSize={10} alignmentBaseline="middle" fill="blue">
                  {tick}
                </Text>
              </G>
            ))}
            
            {/* Axis labels */}
            <Text x={width / 2} y={height + 40} textAnchor="middle" fontSize={12}>
              Time (seconds)
            </Text>
            
            <Text x={-35} y={height / 2} textAnchor="middle" transform={`rotate(-90, -35, ${height / 2})`} fontSize={12} fill="red">
              Pressure (bar)
            </Text>
            
            <Text x={width + 35} y={height / 2} textAnchor="middle" transform={`rotate(-90, ${width + 35}, ${height / 2})`} fontSize={12} fill="blue">
              Weight (g)
            </Text>
            
            {/* Data lines */}
            <Path d={pressurePathString} stroke="red" strokeWidth={2} fill="none" />
            <Path d={weightPathString} stroke="blue" strokeWidth={2} fill="none" />
            
            {/* Legend */}
            <G transform={`translate(${width - 120}, 10)`}>
              <Line x1={0} y1={0} x2={20} y2={0} stroke="red" strokeWidth={2} />
              <Text x={25} y={5} fontSize={10} fill="red">Pressure</Text>
              
              <Line x1={0} y1={15} x2={20} y2={15} stroke="blue" strokeWidth={2} />
              <Text x={25} y={20} fontSize={10} fill="blue">Weight</Text>
            </G>
          </G>
        </Svg>
      </View>
      
      {/* Status indicator */}
      <View style={styles.statusContainer}>
        <View style={[styles.statusIndicator, { backgroundColor: isStarted ? 'green' : 'red' }]} />
        <RNText style={styles.statusText}>
          {isStarted ? 'Recording' : 'Stopped'}
        </RNText>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  graphContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  doseRatioContainer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    backgroundColor: '#e6f7ff',
    padding: 10,
    borderRadius: 5,
    marginTop: 5,
  },
  doseInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  doseEditContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  doseInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 4,
    width: 50,
    fontSize: 16,
    textAlign: 'center',
  },
  doseButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 4,
    padding: 4,
    marginLeft: 5,
    width: 30,
    alignItems: 'center',
  },
  doseButtonText: {
    color: 'white',
    fontSize: 16,
  },
  doseValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
    color: '#333',
  },
  ratioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratioValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
    color: '#333',
  },
  flowRateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff0e6',
    padding: 10,
    borderRadius: 5,
    marginTop: 5,
    width: '100%',
    justifyContent: 'center',
  },
  flowRateValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
    color: '#ff6600',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#555',
  },
  currentValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 5,
    marginTop: 5,
    width: '100%',
    justifyContent: 'space-around',
  },
  valueItem: {
    alignItems: 'center',
  },
  valueDivider: {
    width: 1,
    height: '100%',
    backgroundColor: '#ddd',
  },
  currentValueLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  currentValueText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  statusIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 5,
  },
  statusText: {
    fontSize: 14,
  },
  debugContainer: {
    width: '100%',
    padding: 5,
    backgroundColor: '#eee',
    marginVertical: 5,
  },
  debugText: {
    fontSize: 10,
    color: '#666',
  }
});

export default EspressoGraph
