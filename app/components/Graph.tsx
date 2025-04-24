import React, { useEffect, useRef, useState } from 'react';
import { View, Dimensions, StyleSheet, Text as RNText, TextInput, TouchableOpacity, Modal, Alert, ScrollView } from 'react-native';
import Svg, { Path, G, Line, Text, Rect } from 'react-native-svg';
import * as d3 from 'd3';
import { useBluetooth } from './BluetoothContext';
import { CreateShotDto, ReadBeanDto, ReadGrinderDto, ReadMachineDto } from '@/api/generated';
import { shotsApi } from '@/api/shots';
import { useAuth } from '@/components/AuthContext';
import { Picker } from '@react-native-picker/picker';
import { machinesApi } from '@/api/machines';
import { grindersApi } from '@/api/grinders';
import { beansApi } from '@/api/beans';

interface DataPoint {
  time: number;
  pressure: number;
  weight: number;
  flowRate: number|null;
}

interface EspressoGraphProps {
  isStarted: boolean;
  data?: DataPoint[];
  isHistorical?: boolean;
  shotId?: string;
}

const EspressoGraph = ({ isStarted, data, isHistorical = false, shotId }: EspressoGraphProps) => {
  const [dataPoints, setData] = useState<DataPoint[]>(data ? data : []);
  const [currentPressure, setCurrentPressure] = useState(0);
  const [currentWeight, setCurrentWeight] = useState(0);
  const [currentFlowRate, setCurrentFlowRate] = useState<number |null>(0);
  const [doseWeight, setDoseWeight] = useState('18');
  const [ratio, setRatio] = useState(0);
  const [pressurePathString, setPressurePathString] = useState('');
  const [weightPathString, setWeightPathString] = useState('');
  const [isEditingDose, setIsEditingDose] = useState(false);
  const [isSaveModalVisible, setIsSaveModalVisible] = useState(false);
  const [shotName, setShotName] = useState('');
  
  const [machines, setMachines] = useState<ReadMachineDto[]>([]);
  const [grinders, setGrinders] = useState<ReadGrinderDto[]>([]);
  const [beans, setBeans] = useState<ReadBeanDto[]>([]);
  const [selectedMachineId, setSelectedMachineId] = useState<string | null>(null);
  const [selectedGrinderId, setSelectedGrinderId] = useState<string | null>(null);
  const [selectedBeanId, setSelectedBeanId] = useState<string | null>(null);
  const [isLoadingEquipment, setIsLoadingEquipment] = useState(false);
  
  const { isAuthenticated, userId } = useAuth();
  
  const animationFrameId = useRef<number | null>(null);
  const startTime = useRef<number>(0);
  const lastWeight = useRef<number>(0);
  const lastWeightTime = useRef<number>(0);
  const [xDomain, setXDomain] = useState([0, 50]);
  
  const { pressureValue, scaleValue, flowRate, timerValue } = useBluetooth();
  
  const SCREEN_WIDTH = Dimensions.get('window').height;
  const margin = { top: 10, right: 250, bottom: 10, left: 120 };
  const width = SCREEN_WIDTH - margin.left - margin.right;
  const height = 300;

  const xScale = d3.scaleLinear()
  .domain(xDomain)
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

  const calculateRatio = (weight: number) => {
    if (weight <= 0) return 0;
    const dose = parseFloat(doseWeight);
    return dose / weight;
  };

  // Fetch equipment data when save modal opens
  const fetchEquipmentData = async () => {
    if (!isAuthenticated || !userId) return;
    
    try {
      setIsLoadingEquipment(true);
      const [machinesData, grindersData, beansData] = await Promise.all([
        machinesApi.getAll(userId),
        grindersApi.getAll(userId),
        beansApi.getAll(userId),
      ]);
      
      setMachines(machinesData);
      setGrinders(grindersData);
      setBeans(beansData);
    } catch (error) {
      console.error('Error fetching equipment data:', error);
      Alert.alert('Error', 'Failed to load equipment data');
    } finally {
      setIsLoadingEquipment(false);
    }
  };

  const fetchShotDetails = async (id: string) => {
    try {
      const shotDetails = await shotsApi.get(id);
      if (shotDetails && shotDetails.dose) {
        setDoseWeight(shotDetails.dose.toString());
        if (shotDetails.weight > 0) {
          setRatio(calculateRatio(shotDetails.weight));
        }
      }
    } catch (error) {
      console.error('Error fetching shot details:', error);
    }
  };

  useEffect(() => {
    if (isHistorical && data && data.length > 0) {
      setData(data);
      
      const lastTimePoint = data[data.length - 1].time;
      setXDomain([0, Math.ceil(lastTimePoint * 1.1)]);
      
      const newPressurePathString = pressureLineGenerator(data) || '';
      setPressurePathString(newPressurePathString);
      
      const newWeightPathString = weightLineGenerator(data) || '';
      setWeightPathString(newWeightPathString);
      
      const lastPoint = data[data.length - 1];
      setCurrentPressure(lastPoint.pressure);
      setCurrentWeight(lastPoint.weight);
      setCurrentFlowRate(lastPoint.flowRate);
      
      if (shotId) {
        fetchShotDetails(shotId);
      }
    }
  }, [isHistorical, data, shotId]);

  useEffect(() => {
    if (isHistorical) return;
    
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
      setCurrentFlowRate(flowRate);
      addDataPoint(
        currentTime, 
        pressureValue !== null ? pressureValue : 0,
        weight,
        flowRate
      );
    }
  }, [pressureValue, scaleValue, isStarted, isHistorical]);

  useEffect(() => {
    if (isHistorical) return;
    
    if (isStarted) {
      setData([]);
      setPressurePathString('');
      setWeightPathString('');
      startTime.current = Date.now();
      lastWeight.current = 0;
      lastWeightTime.current = 0;
      setCurrentFlowRate(0);
      setXDomain([0, 50])
      
      addDataPoint(0, pressureValue || 0, scaleValue || 0, 0);
      
      console.log("Graph recording started");
    } else {
      console.log("Graph recording stopped");
      
      // If we have data points and we just stopped, show save modal
      if (dataPoints.length > 0 && startTime.current > 0) {
        setIsSaveModalVisible(true);
        fetchEquipmentData();
      }
    }

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
        animationFrameId.current = null;
      }
    };
  }, [isStarted, isHistorical]);

  const addDataPoint = (time: number, pressure: number, weight: number, flowRate: number|null) => {
    setData(prevData => {
      const newData = [...prevData, { time, pressure, weight, flowRate }];

      if (time > xDomain[1] - 5) {
        const newMax = Math.ceil(time * 1.1);
        setXDomain([0, newMax]);
      }
      
      const newPressurePathString = pressureLineGenerator(newData) || '';
      setPressurePathString(newPressurePathString);
      
      const newWeightPathString = weightLineGenerator(newData) || '';
      setWeightPathString(newWeightPathString);
      
      return newData;
    });
  };

  const saveShot = async () => {
    if (!isAuthenticated || !userId) {
      Alert.alert('Not Logged In', 'Please log in to save shots');
      return;
    }

    if (dataPoints.length === 0) {
      Alert.alert('No Data', 'There is no shot data to save');
      return;
    }

    try {
      // Calculate brew time from the last data point
      const brewTime = dataPoints[dataPoints.length - 1]?.time || 0;
      
      // Get the final weight from the last data point
      const finalWeight = dataPoints[dataPoints.length - 1]?.weight || 0;
      
      // Create the shot data object
      const shotData: CreateShotDto = {
        time: brewTime,
        weight: finalWeight,
        dose: parseFloat(doseWeight),
        machineId: selectedMachineId,
        grinderId: selectedGrinderId,
        beansId: selectedBeanId,
        userId: userId,
        // Store the full graph data
        graphData: dataPoints.map(point => ({
          time: point.time,
          pressure: point.pressure,
          weight: point.weight,
          flowRate: point.flowRate
        })),
        group: shotName || null,
        starred: false,
        customFields: [
          { key: 'Peak Pressure', value: Math.max(...dataPoints.map(dp => dp.pressure)).toFixed(1) + ' bar' },
          { key: 'Peak Flow Rate', value: Math.max(...dataPoints.filter(dp => dp.flowRate !== null).map(dp => dp.flowRate || 0)).toFixed(1) + ' g/s' },
          { key: 'Brew Ratio', value: '1:' + (finalWeight / parseFloat(doseWeight)).toFixed(1) }
        ]
      };

      // Save the shot
      await shotsApi.create(shotData);
      
      Alert.alert('Success', 'Shot saved successfully');
      setIsSaveModalVisible(false);
      
      // Reset states for next time
      setShotName('');
      setSelectedMachineId(null);
      setSelectedGrinderId(null);
      setSelectedBeanId(null);
      
    } catch (error) {
      console.error('Error saving shot:', error);
      Alert.alert('Error', 'Failed to save shot. Please try again.');
    }
  };

  const handleDismissSave = () => {
    setIsSaveModalVisible(false);
    setShotName('');
    setSelectedMachineId(null);
    setSelectedGrinderId(null);
    setSelectedBeanId(null);
  };

  const xTicks = xScale.ticks(10);
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
      {/* Graph */}
      <View>
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
      
      {!isHistorical && (
        <View style={styles.statusContainer}>
          <View style={[styles.statusIndicator, { backgroundColor: isStarted ? 'green' : 'red' }]} />
          <RNText style={styles.statusText}>
            {isStarted ? 'Recording' : 'Stopped'}
          </RNText>
          
          {!isStarted && dataPoints.length > 0 && (
            <TouchableOpacity 
              style={styles.saveButton}
              onPress={() => {
                setIsSaveModalVisible(true);
                fetchEquipmentData();
              }}
            >
              <RNText style={styles.saveButtonText}>Save Shot</RNText>
            </TouchableOpacity>
          )}
        </View>
      )}
      
      {isHistorical && (
        <View style={styles.historicalLabel}>
          <RNText style={styles.historicalText}>Saved Shot</RNText>
        </View>
      )}
      
      {!isHistorical && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={isSaveModalVisible}
          onRequestClose={handleDismissSave}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <ScrollView contentContainerStyle={styles.modalScrollContent}>
                <RNText style={styles.modalTitle}>Save Espresso Shot</RNText>
                
                <View style={styles.shotInfoContainer}>
                  <View style={styles.shotInfoRow}>
                    <RNText style={styles.shotInfoLabel}>Dose:</RNText>
                    <RNText style={styles.shotInfoValue}>{doseWeight}g</RNText>
                  </View>
                  
                  <View style={styles.shotInfoRow}>
                    <RNText style={styles.shotInfoLabel}>Yield:</RNText>
                    <RNText style={styles.shotInfoValue}>
                      {dataPoints.length > 0 ? dataPoints[dataPoints.length - 1].weight.toFixed(1) : '0'}g
                    </RNText>
                  </View>
                  
                  <View style={styles.shotInfoRow}>
                    <RNText style={styles.shotInfoLabel}>Time:</RNText>
                    <RNText style={styles.shotInfoValue}>
                      {dataPoints.length > 0 ? dataPoints[dataPoints.length - 1].time.toFixed(1) : '0'}s
                    </RNText>
                  </View>
                  
                  <View style={styles.shotInfoRow}>
                    <RNText style={styles.shotInfoLabel}>Ratio:</RNText>
                    <RNText style={styles.shotInfoValue}>
                      1:{dataPoints.length > 0 ? (dataPoints[dataPoints.length - 1].weight / parseFloat(doseWeight)).toFixed(1) : '0'}
                    </RNText>
                  </View>
                  
                  <View style={styles.shotInfoRow}>
                    <RNText style={styles.shotInfoLabel}>Peak Pressure:</RNText>
                    <RNText style={styles.shotInfoValue}>
                      {dataPoints.length > 0 ? Math.max(...dataPoints.map(dp => dp.pressure)).toFixed(1) : '0'} bar
                    </RNText>
                  </View>
                </View>
                
                <View style={styles.inputContainer}>
                  <RNText style={styles.inputLabel}>Shot Name (optional):</RNText>
                  <TextInput
                    style={styles.input}
                    value={shotName}
                    onChangeText={setShotName}
                    placeholder="Morning espresso, Test shot, etc."
                  />
                </View>
                
                {isLoadingEquipment ? (
                  <View style={styles.loadingContainer}>
                    <RNText>Loading equipment data...</RNText>
                  </View>
                ) : (
                  <>
                    <View style={styles.pickerContainer}>
                      <RNText style={styles.inputLabel}>Machine:</RNText>
                      <View style={styles.pickerWrapper}>
                        <Picker
                          selectedValue={selectedMachineId}
                          onValueChange={(value) => setSelectedMachineId(value)}
                          style={styles.picker}
                        >
                          <Picker.Item label="Select a machine" value={null} />
                          {machines.map((machine) => (
                            <Picker.Item
                              key={`machine-${machine.id}`}
                              label={`${machine.brandName} ${machine.model}`}
                              value={machine.id}
                            />
                          ))}
                        </Picker>
                      </View>
                    </View>
                    
                    <View style={styles.pickerContainer}>
                      <RNText style={styles.inputLabel}>Grinder:</RNText>
                      <View style={styles.pickerWrapper}>
                        <Picker
                          selectedValue={selectedGrinderId}
                          onValueChange={(value) => setSelectedGrinderId(value)}
                          style={styles.picker}
                        >
                          <Picker.Item label="Select a grinder" value={null} />
                          {grinders.map((grinder) => (
                            <Picker.Item
                              key={`grinder-${grinder.id}`}
                              label={`${grinder.brandName} ${grinder.model}`}
                              value={grinder.id}
                            />
                          ))}
                        </Picker>
                      </View>
                    </View>
                    
                    <View style={styles.pickerContainer}>
                      <RNText style={styles.inputLabel}>Beans:</RNText>
                      <View style={styles.pickerWrapper}>
                        <Picker
                          selectedValue={selectedBeanId}
                          onValueChange={(value) => setSelectedBeanId(value)}
                          style={styles.picker}
                        >
                          <Picker.Item label="Select beans" value={null} />
                          {beans.map((bean) => (
                            <Picker.Item
                              key={`bean-${bean.id}`}
                              label={`${bean.roastery} - ${bean.bean}`}
                              value={bean.id}
                            />
                          ))}
                        </Picker>
                      </View>
                    </View>
                  </>
                )}
                
                <View style={styles.modalButtons}>
                  <TouchableOpacity 
                    style={[styles.modalButton, styles.cancelButton]}
                    onPress={handleDismissSave}
                  >
                    <RNText style={styles.cancelButtonText}>Cancel</RNText>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.modalButton, styles.confirmButton]}
                    onPress={saveShot}
                  >
                    <RNText style={styles.confirmButtonText}>Save Shot</RNText>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    transform: [{rotate: "90deg"}],
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
    marginRight: 15,
  },
  saveButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 5,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: '80%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  modalScrollContent: {
    paddingBottom: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  shotInfoContainer: {
    marginBottom: 15,
    backgroundColor: '#f9f9f9',
    padding: 10,
    borderRadius: 5,
  },
  shotInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  shotInfoLabel: {
    fontSize: 14,
    color: '#555',
  },
  shotInfoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  inputContainer: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 14,
    color: '#555',
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
    color: '#333',
  },
  pickerContainer: {
    marginBottom: 15,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    overflow: 'hidden',
    backgroundColor: '#f9f9f9',
  },
  picker: {
    height: 50,
    width: '100%',
    color: '#333',
    backgroundColor: '#f9f9f9',
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 10,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f2f2f2',
    marginRight: 10,
  },
  confirmButton: {
    backgroundColor: '#007AFF',
  },
  cancelButtonText: {
    color: '#555',
    fontSize: 16,
    fontWeight: '500',
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
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
  },
  historicalLabel: {
    marginTop: 10,
    backgroundColor: '#e6f7ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 5,
    alignSelf: 'center',
  },
  historicalText: {
    color: '#0066cc',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default EspressoGraph;


