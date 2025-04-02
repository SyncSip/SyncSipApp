import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Platform } from 'react-native';
import { useBluetooth } from '@/components/BluetoothContext';
import DeviceModal from '@/components/DeviceConnectionModal';

const SplitConnectScreen = () => {
  const {
    requestPermissions,
    scanForPeripherals,
    allDevices,
    connectToPressureSensor,
    connectToScale,
    disconnectFromPressureSensor,
    disconnectFromScale,
    connectedPressureSensor,
    connectedScale,
    pressureValue,
    scaleValue
  } = useBluetooth();

  const [isPressureModalVisible, setPressureModalVisible] = useState(false);
  const [isScaleModalVisible, setScaleModalVisible] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);

  useEffect(() => {
    const checkPermissions = async () => {
      const isGranted = await requestPermissions();
      setPermissionGranted(isGranted);
    };
    
    checkPermissions();
  }, []);

  const openPressureModal = async () => {
    if (!permissionGranted) {
      const isGranted = await requestPermissions();
      setPermissionGranted(isGranted);
      if (!isGranted) return;
    }
    
    scanForPeripherals();
    setPressureModalVisible(true);
  };

  const openScaleModal = async () => {
    if (!permissionGranted) {
      const isGranted = await requestPermissions();
      setPermissionGranted(isGranted);
      if (!isGranted) return;
    }
    
    scanForPeripherals();
    setScaleModalVisible(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header Section */}
      <View style={styles.headerContainer}>
        <View style={styles.headerSection}>
          <Text style={styles.sectionTitle}>Pressure Sensor</Text>
        </View>
        <View style={styles.headerDivider} />
        <View style={styles.headerSection}>
          <Text style={styles.sectionTitle}>Scale</Text>
        </View>
      </View>

      {/* Content Section */}
      <View style={styles.splitContainer}>
        {/* Pressure Sensor Side */}
        <View style={styles.sensorSection}>
          {connectedPressureSensor ? (
            <View style={styles.connectedContainer}>
              <Text style={styles.connectedText}>
                Connected to: {connectedPressureSensor.name || 'Unknown Device'}
              </Text>
              <Text style={styles.valueText}>
                {pressureValue !== null ? `${pressureValue.toFixed(2)} bar` : 'Reading...'}
              </Text>
              <TouchableOpacity
                style={styles.disconnectButton}
                onPress={disconnectFromPressureSensor}
              >
                <Text style={styles.disconnectButtonText}>Disconnect</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              onPress={openPressureModal}
            >
              <Text style={styles.connectButtonText}>Connect</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Scale Side */}
        <View style={styles.sensorSection}>
          {connectedScale ? (
            <View style={styles.connectedContainer}>
              <Text style={styles.connectedText}>
                Connected to: {connectedScale.name || 'Unknown Device'}
              </Text>
              <Text style={styles.valueText}>
                {scaleValue !== null ? `${scaleValue.toFixed(2)} g` : 'Reading...'}
              </Text>
              <TouchableOpacity
                style={styles.disconnectButton}
                onPress={disconnectFromScale}
              >
                <Text style={styles.disconnectButtonText}>Disconnect</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              onPress={openScaleModal}
            >
              <Text style={styles.connectButtonText}>Connect</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Device Selection Modals */}
      <DeviceModal
        devices={allDevices}
        visible={isPressureModalVisible}
        connectToPeripheral={connectToPressureSensor}
        closeModal={() => setPressureModalVisible(false)}
        sensorType="pressure"
      />

      <DeviceModal
        devices={allDevices}
        visible={isScaleModalVisible}
        connectToPeripheral={connectToScale}
        closeModal={() => setScaleModalVisible(false)}
        sensorType="scale"
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7', // iOS background color
  },
  headerContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#C6C6C8', // iOS light gray border
    paddingBottom: 10,
  },
  headerSection: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
  },
  headerDivider: {
    width: 1,
    backgroundColor: '#C6C6C8', // iOS light gray border
  },
  splitContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  sensorSection: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  divider: {
    width: 1,
    backgroundColor: '#C6C6C8', // iOS light gray border
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000',
    textAlign: 'center',
  },
  connectButtonText: {
    color: '#007AFF', // iOS blue
    fontSize: 17,
    fontWeight: '400',
  },
  disconnectButton: {
    backgroundColor: '#FF3B30', // iOS red
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
    width: '80%',
    maxWidth: 220,
  },
  disconnectButtonText: {
    color: 'white',
    fontSize: 17,
    fontWeight: '600',
  },
  connectedContainer: {
    alignItems: 'center',
    width: '100%',
  },
  connectedText: {
    fontSize: 15,
    color: '#8E8E93', // iOS gray
    marginBottom: 10,
    textAlign: 'center',
  },
  valueText: {
    fontSize: 34,
    fontWeight: '500',
    marginTop: 20,
    marginBottom: 10,
    color: '#000',
  },
});

export default SplitConnectScreen;
