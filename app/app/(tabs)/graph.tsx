import React, { useEffect, useRef, useState } from "react";
import { View, TouchableOpacity, StyleSheet, Text, SafeAreaView } from "react-native";
import EspressoGraph from "@/components/Graph";
import { useBluetooth } from "@/components/BluetoothContext";
import NumpadInput from "@/components/Numpad";
import { useSegments } from "expo-router";
import { milliseconds } from "date-fns";

export default function Graph() {
  const [isStarted, setIsStarted] = useState(false);
  const [doseWeight, setDoseWeight] = useState('18');
  const [tempDoseWeight, setTempDoseWeight] = useState('18');
  const [isNumpadVisible, setIsNumpadVisible] = useState(false);

  const { pressureValue, scaleValue, scaleBatteryPercentage, timerValue, flowRate, sendStartTimerCommand, sendStopTimerCommand, sendResetTimerCommand, timerStatus } = useBluetooth();
  
  const handleDoseChange = (text: string) => {
    setTempDoseWeight(text);
  };

  const handleDoseSubmit = () => {
    const parsedValue = parseFloat(tempDoseWeight);
    if (!isNaN(parsedValue) && parsedValue > 0) {
      setDoseWeight(tempDoseWeight);
    } else {
      setTempDoseWeight(doseWeight);
    }
  };

  const openNumpad = () => {
    setTempDoseWeight(doseWeight);
    setIsNumpadVisible(true);
  };

  useEffect(() => {
    if(isStarted == true){
      sendResetTimerCommand()
      sendStartTimerCommand()
    }else{
      sendStopTimerCommand()
    }
  }, [isStarted])

  useEffect(() => {
    if(timerStatus === "running"){
      setIsStarted(true)
    }else if( timerStatus === "stopped"){
      setIsStarted(false)
    }else if(timerStatus === "reset"){
      sendResetTimerCommand()
    }
  }, [timerStatus])




  const dose = 18;
  const ratio = scaleValue ? (dose / scaleValue).toFixed(2) : "0.00";
  
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <EspressoGraph isStarted={isStarted} />
        
        <TouchableOpacity
          style={styles.buttonContainer}
          onPress={() => {
            console.log("Button pressed, changing isStarted to:", !isStarted);
            setIsStarted(!isStarted);
          }}
        >
          <Text style={[
            styles.buttonText,
            { color: isStarted ? "#cc0000" : "#007700" }
          ]}>
            {isStarted ? "Stop" : "Start"}
          </Text>
        </TouchableOpacity>
        
        <View style={styles.tilesContainer}>
        <TouchableOpacity 
  style={styles.doseTile}
  onPress={openNumpad}
>
  <Text style={styles.tileTitle}>Dose:</Text>
  <Text style={styles.tileValue}>{doseWeight}g</Text>
</TouchableOpacity>

<NumpadInput
  isVisible={isNumpadVisible}
  onClose={() => setIsNumpadVisible(false)}
  value={tempDoseWeight}
  onValueChange={handleDoseChange}
  onSubmit={handleDoseSubmit}
  title="Enter Dose Weight (g)"
/>
          
          <View style={styles.tile}>
            <Text style={styles.tileTitle}>Yield</Text>
            <Text style={styles.tileValue}>
              {scaleValue ? scaleValue.toFixed(1) : "0.0"}g
            </Text>
          </View>
          
          <View style={styles.tile}>
            <Text style={styles.tileTitle}>Time</Text>
            <Text style={styles.tileValue}>
              {timerValue ? timerValue.toFixed(0) : "0"}s
            </Text>
          </View>
          
          <View style={styles.tile}>
            <Text style={styles.tileTitle}>Flow</Text>
            <Text style={styles.tileValue}>
              {flowRate ? flowRate.toFixed(1) : "0.0"}g/s
            </Text>
          </View>
          
          <View style={styles.tile}>
            <Text style={styles.tileTitle}>Pressure</Text>
            <Text style={styles.tileValue}>
              {pressureValue ? pressureValue.toFixed(1) : "0.0"}bar
            </Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    padding: 20,
  },
  buttonContainer: {
    transform: [{rotate: "90deg"}],
    position: 'absolute',
    bottom: 40,
    right: 30,
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderWidth: 1,
    borderColor: '#ddd',
    width: 60,
    height: 60,
    zIndex: 10,
  },
  buttonText: {
    fontSize: 12,
  },
  tilesContainer: {
    transform: [{rotate: "90deg"}],
    position: 'absolute',
    bottom: 30,

    flexDirection: 'column',
    alignItems: 'center',
    zIndex: 5,
  },
  tile: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 6,
    width: 60,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 1
  },
  doseTile: {
    backgroundColor: '#d1e7ff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 6,
    width: 60,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 1
  },
  tileTitle: {
    fontSize: 10,
    color: '#555',
    marginBottom: 3,
  },
  tileValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
});
