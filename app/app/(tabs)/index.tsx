import { Box } from "@gluestack-ui/themed";
import React, { useEffect, useRef, useState } from "react";
import {
  useFont
} from "@shopify/react-native-skia";
import { View, StyleSheet, Dimensions, SafeAreaView, Platform, StatusBar, Button, Modal, TextInput, TouchableOpacity, Text } from "react-native";
import { CartesianChart, Line, useChartPressState } from "victory-native";
import { DataPoint } from "@/constants/data";

const height = Dimensions.get("window").height;
const width = Dimensions.get("window").width;
const statusBarHeight = StatusBar.currentHeight || 0;

const LineChart = () => {
  type ShotPhase = 'preinfusion' | 'rampup' | 'extraction' | 'decline' | 'done';
  const [shotPhase, setShotPhase] = useState<ShotPhase>('preinfusion');
  const [chartData, setChartData] = useState<DataPoint[]>([]);
  const [sensorData, setSensorData] = useState<DataPoint>({
    timestamp: 0,
    pressure: 0,
    flowrate: 0,
    weight: 0
  });
  const [startTime, setStartTime] = useState<number | null>(null);
  const [isModalVisible, setModalVisible] = useState(false);
  const [dose, setDose] = useState('');
  const [basketSize, setBasketSize] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [timer, setTimer] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const dataIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const currentTimerRef = useRef(0);
  const lastValuesRef = useRef({
    pressure: 0,
    weight: 0
  });

  const font = useFont("app/assets/fonts/SpaceMono-Regular.ttf", 12)

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

  useEffect(() => {
    console.log('State Update:', {
      isRunning,
      timer,
      sensorDataLength: chartData.length
    });
  }, [isRunning, timer, chartData]);

  useEffect(() => {
    if (isRunning) {
      console.log('Starting timer');
      timerRef.current = setInterval(() => {
        setTimer(prev => {
          const newTime = prev + 0.1;
          currentTimerRef.current = newTime;
          return newTime;
        });
      }, 100);

      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
          console.log('Timer cleared');
        }
      };
    }
  }, [isRunning]);

  useEffect(() => {
    if (isRunning) {
      console.log('Starting data generation');
      
      dataIntervalRef.current = setInterval(() => {
        const { pressure, weight } = getNextValues(
          lastValuesRef.current.pressure,
          lastValuesRef.current.weight,
          currentTimerRef.current
        );

        const newDataPoint: DataPoint = {
          timestamp: currentTimerRef.current,
          pressure,
          flowrate: pressure / 4,
          weight
        };

        console.log('Generated new data point:', newDataPoint);

        lastValuesRef.current = { pressure, weight };
        setSensorData(newDataPoint);
        
        setChartData(prevData => {
          const newData = [...prevData, newDataPoint];
          console.log('Chart data updated, length:', newData.length);
          return newData;
        });
      }, 500);

      return () => {
        if (dataIntervalRef.current) {
          clearInterval(dataIntervalRef.current);
          console.log('Data generation cleared');
        }
      };
    }
  }, [isRunning]);

  const handleStart = () => {
    if (dose && basketSize) {
      console.log('Starting new shot');
      currentTimerRef.current = 0;
      setTimer(0);
      setChartData([]);
      lastValuesRef.current = { pressure: 0, weight: 0 };
      setSensorData({
        timestamp: 0,
        pressure: 0,
        flowrate: 0,
        weight: 0
      });
      setIsRunning(true);
      setModalVisible(false);
    }
  };

  const handleStop = () => {
    console.log('Stopping shot');
    setIsRunning(false);
    if (timerRef.current) clearInterval(timerRef.current);
    if (dataIntervalRef.current) clearInterval(dataIntervalRef.current);
  };


  const formatTime = (time: number): string => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    const decimals = Math.floor((time % 1) * 10);
    return `${minutes}:${seconds.toString().padStart(2, '0')}.${decimals}`;
  };

  useEffect(() => {
    console.log('Chart data:', chartData);
    console.log('Sensor data:', sensorData);
    console.log('Is running:', isRunning);
    console.log('Timer:', timer);
  }, [chartData, sensorData, isRunning, timer]);

  const getChartDomains = (data: DataPoint[]) => {
    if (data.length === 0) {
      return {
        x: [0, 20] as [number, number],
        y: [0, 80] as [number, number]
      };
    }

    // Always show from 0 to current time, with some padding
    return {
      x: [0, Math.max(20, timer + 5)] as [number, number], // Add 5 seconds padding
      y: [0, 80] as [number, number]
    };
  };

  console.log(sensorData, chartData)

  return (
    <>
      <SafeAreaView style={styles.cont}>
        <View style={styles.timerContainer}>
          <Text style={styles.timerText}>{formatTime(timer)}</Text>
        </View>
        <Box style={styles.chart}>
        <CartesianChart
            data={chartData}
            xKey="timestamp"
            yKeys={["pressure", "flowrate", "weight"]}
            domain={getChartDomains(chartData)}
            domainPadding={{ left: 20, right: 20 }}
            xAxis={{
              tickCount: 10,
              lineWidth: 1,
              formatXLabel: (value: number) => formatTime(value)
            }}
            yAxis={[
              {
                yKeys: ["pressure"],
                axisSide: "left",
                labelColor: "lightgreen",
                formatYLabel: (value: number) => `${value.toFixed(1)} bar`
              },
              {
                yKeys: ["flowrate", "weight"],
                axisSide: "right",
                labelColor: "blue",
                formatYLabel: (value: number) => `${value.toFixed(1)}g`
              }
            ]}
          >
            {({points}) => (
              <>
                {points.pressure && (
                  <Line
                    points={points.pressure}
                    color="lightgreen"
                    strokeWidth={3}
                  />
                )}
                {points.flowrate && (
                  <Line
                    points={points.flowrate}
                    color="red"
                    strokeWidth={3}
                  />
                )}
                {points.weight && (
                  <Line
                    points={points.weight}
                    color="blue"
                    strokeWidth={3}
                  />
                )}
              </>
            )}
          </CartesianChart>
        </Box>
      <View style={styles.controlsContainer}>
          {!isRunning ? (
            <Button 
              title="Set Parameters" 
              onPress={() => setModalVisible(true)} 
            />
          ) : (
            <Button 
              title="Stop" 
              onPress={handleStop}
              color="red"
            />
          )}
        </View>

        <Modal
          animationType="slide"
          transparent={true}
          visible={isModalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Set Parameters</Text>
              
              <TextInput
                style={styles.input}
                placeholder="Dose (g)"
                value={dose}
                onChangeText={setDose}
                keyboardType="numeric"
              />
              
              <TextInput
                style={styles.input}
                placeholder="Basket Size (g)"
                value={basketSize}
                onChangeText={setBasketSize}
                keyboardType="numeric"
              />

              <View style={styles.modalButtons}>
                <TouchableOpacity 
                  style={styles.button} 
                  onPress={() => setModalVisible(false)}
                >
                  <Text>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.button, styles.startButton]} 
                  onPress={handleStart}
                >
                  <Text style={styles.startButtonText}>Start</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
    </SafeAreaView>
    </>
  );
};



const styles = StyleSheet.create({
  timerContainer: {
    position: 'absolute',
    top: 70,
    right: 235,
    width: '100%',
    alignItems: 'center',
    zIndex: 1,
  },
  timerText: {
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  container: {
    flex: 1,
    backgroundColor: 'white', 
    paddingTop: Platform.OS === 'android' ? statusBarHeight : 0,
  },
  chart: {
    flex: 1,
    paddingLeft: 250,
    paddingRight: 10
  },
  cont: {
      width: height,
      height: width,
      transform: [{ rotate: '90deg' }],
      top: 150,
      right: 200,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    transform: [{ rotate: '90deg' }],
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    padding: 10,
    borderRadius: 5,
    minWidth: 100,
    alignItems: 'center',
  },
  startButton: {
    backgroundColor: '#007AFF',
  },
  startButtonText: {
    color: 'white',
  },
  controlsContainer: {
    position: 'absolute',
    bottom: 20,
    width: '100%',
    alignItems: 'center',
  }
});
export default LineChart