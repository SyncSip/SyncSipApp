import { useMemo, useState, useCallback, useEffect, useRef } from "react"
import { PermissionsAndroid, Platform } from "react-native"
import { BleManager, Device, Subscription } from 'react-native-ble-plx'
import * as ExpoDevice from 'expo-device'
import { Buffer } from 'buffer'

// Service and characteristic UUIDs
const PRESSURE_SERVICE_UUID = "0000181A-0000-1000-8000-00805F9B34FB"
const PRESSURE_CHARACTERISTIC_UUID = "00002A6D-0000-1000-8000-00805F9B34FB"
const SCALE_SERVICE_UUID = "9999181A-0000-1000-8000-00805F9B34FB"
const SCALE_CHARACTERISTIC_UUID = "99992A6D-0000-1000-8000-00805F9B34FB"

interface bleAPI {
    requestPermissions(): Promise<boolean>
    scanForPeripherals(): void
    allDevices: Device[]
    connectToPressureSensor: (device: Device) => Promise<void>
    connectToScale: (device: Device) => Promise<void>
    disconnectFromPressureSensor: () => Promise<void>
    disconnectFromScale: () => Promise<void>
    connectedPressureSensor: Device | null
    connectedScale: Device | null
    pressureValue: number | null
    scaleValue: number | null
    connectionErrors: {
        pressure: string | null,
        scale: string | null
    }
    isConnecting: boolean
    connectToBothDevices: (pressureSensor: Device, scale: Device) => Promise<void>
}

function useBle(): bleAPI {
    const bleManager = useMemo(() => new BleManager(), [])
    const [allDevices, setAllDevices] = useState<Device[]>([])
    const [connectedPressureSensor, setConnectedPressureSensor] = useState<Device | null>(null)
    const [connectedScale, setConnectedScale] = useState<Device | null>(null)
    const [pressureValue, setPressureValue] = useState<number | null>(null)
    const [scaleValue, setScaleValue] = useState<number | null>(null)
    const [isConnecting, setIsConnecting] = useState(false)
    const connectionLockRef = useRef(false)
    const [connectionErrors, setConnectionErrors] = useState<{
        pressure: string | null,
        scale: string | null
    }>({
        pressure: null,
        scale: null
    })

    useEffect(() => {
        return () => {
            disconnectFromPressureSensor();
            disconnectFromScale();
            bleManager.destroy();
        };
    }, []);

    const requestAndroid31Permissions = async (): Promise<boolean> => {
        const bluetoothScanPermissions = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
            {
                title: "Scan for Permissions",
                message: "App Requires Bluetooth for scanning",
                buttonPositive: "OK"
            }
        )
        const bluetoothConnectPermissions = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
            {
                title: "Scan for Permissions",
                message: "App Requires Bluetooth for scanning",
                buttonPositive: "OK"
            }
        )
        const bluetoothFineLocationPermissions = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            {
                title: "Scan for Permissions",
                message: "App Requires Bluetooth for scanning",
                buttonPositive: "OK"
            }
        )
        return (
            bluetoothConnectPermissions === "granted" &&
            bluetoothScanPermissions === "granted" &&
            bluetoothFineLocationPermissions === "granted"
        )
    }

    const requestPermissions = async (): Promise<boolean> => {
        if (Platform.OS === "android") {
            if ((ExpoDevice.platformApiLevel ?? -1) < 31) {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                    {
                        title: "Scan for Permissions",
                        message: "App Requires Bluetooth for scanning",
                        buttonPositive: "OK"
                    }
                )
                return granted === PermissionsAndroid.RESULTS.GRANTED;
            } else {
                const isAndroid31PermissionGranted = await requestAndroid31Permissions();
                return isAndroid31PermissionGranted;
            }
        } else {
            return true;
        }
    }

    const isDuplicateDevice = (devices: Device[], nextDevice: Device) => {
        return devices.findIndex((device) => nextDevice.id === device.id) > -1
    }

    const scanForPeripherals = useCallback(() => {
        setAllDevices([]);
        
        console.log("Starting scan...");
        bleManager.startDeviceScan(
            null,
            { allowDuplicates: false },
            async (error, device) => {
                if (error) {
                    console.log("Scanning error:", error);
                    return;
                }
                if (device) {
                    console.log("Found device:", {
                        name: device.name,
                        id: device.id,
                    });
                    
                    if (device.name === "PressureSensor" || device.name === "Scale") {
                        setAllDevices((prevState) => {
                            if (!isDuplicateDevice(prevState, device)) {
                                return [...prevState, device];
                            }
                            return prevState;
                        });
                    }
                }
            }
        );

        setTimeout(() => {
            bleManager.stopDeviceScan();
            console.log("Scan stopped");
        }, 5000);
    }, [bleManager]);

    const disconnectFromPressureSensor = useCallback(async () => {
        try {
            if (connectedPressureSensor) {
                console.log("Disconnecting from pressure sensor:", connectedPressureSensor.id);
                await bleManager.cancelDeviceConnection(connectedPressureSensor.id);
                console.log("Disconnected from pressure sensor");
                
                // Clear state
                setConnectedPressureSensor(null);
                setPressureValue(null);
                setConnectionErrors(prev => ({ ...prev, pressure: null }));
                
                // Add a delay after disconnection
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        } catch (error) {
            console.log("Pressure sensor disconnect error:", error);
            setConnectedPressureSensor(null);
            setPressureValue(null);
        }
    }, [connectedPressureSensor, bleManager]);

    const disconnectFromScale = useCallback(async () => {
        try {
            if (connectedScale) {
                console.log("Disconnecting from scale:", connectedScale.id);
                await bleManager.cancelDeviceConnection(connectedScale.id);
                console.log("Disconnected from scale");
                
                setConnectedScale(null);
                setScaleValue(null);
                setConnectionErrors(prev => ({ ...prev, scale: null }));
                
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        } catch (error) {
            console.log("Scale disconnect error:", error);
            setConnectedScale(null);
            setScaleValue(null);
        }
    }, [connectedScale, bleManager]);

    const connectToPressureSensor = useCallback(async (device: Device) => {
        if (isConnecting || connectionLockRef.current) {
            console.log("Connection already in progress, please wait");
            return;
        }
        
        try {
            setIsConnecting(true);
            connectionLockRef.current = true;
            setConnectionErrors(prev => ({ ...prev, pressure: null }));
            
            if (connectedPressureSensor) {
                await disconnectFromPressureSensor();
            }
            
            console.log("Connecting to pressure sensor:", device.id);
            const connectedDevice = await device.connect({
                timeout: 15000,
            });
            console.log("Connected to pressure sensor");

            await new Promise(resolve => setTimeout(resolve, 1000));

            const discoveredDevice = await connectedDevice.discoverAllServicesAndCharacteristics();
            console.log("Discovered services and characteristics for pressure sensor");

            await new Promise(resolve => setTimeout(resolve, 1000));
            
            setConnectedPressureSensor(discoveredDevice);

            discoveredDevice.monitorCharacteristicForService(
                PRESSURE_SERVICE_UUID,
                PRESSURE_CHARACTERISTIC_UUID,
                (error, characteristic) => {
                    if (error) {
                        console.log("Pressure monitoring error:", error);
                        return;
                    }
                    if (characteristic?.value) {
                        const buffer = Buffer.from(characteristic.value, 'base64');
                        const pressure = buffer.readFloatLE(0);
                        console.log("Received pressure:", pressure);
                        setPressureValue(pressure);
                    }
                }
            );
            
            console.log("Pressure sensor connection and monitoring set up successfully");
        } catch (error) {
            console.log("Pressure sensor connection error:", error);
            const errorMessage = error instanceof Error ? error.message : String(error);
            setConnectionErrors(prev => ({ ...prev, pressure: errorMessage }));
            setConnectedPressureSensor(null);
            setPressureValue(null);
        } finally {
            setIsConnecting(false);
            setTimeout(() => {
                connectionLockRef.current = false;
            }, 2000);
        }
    }, [connectedPressureSensor, disconnectFromPressureSensor, bleManager]);

    const connectToScale = useCallback(async (device: Device) => {

        if (isConnecting || connectionLockRef.current) {
            console.log("Connection already in progress, please wait");
            return;
        }
        
        try {
            setIsConnecting(true);
            connectionLockRef.current = true;
            setConnectionErrors(prev => ({ ...prev, scale: null }));
            
            if (connectedScale) {
                await disconnectFromScale();
            }
            
            console.log("Connecting to scale:", device.id);
            const connectedDevice = await device.connect({
                timeout: 15000,
            });
            console.log("Connected to scale");

            await new Promise(resolve => setTimeout(resolve, 1000));

            const discoveredDevice = await connectedDevice.discoverAllServicesAndCharacteristics();
            console.log("Discovered services and characteristics for scale");


            await new Promise(resolve => setTimeout(resolve, 1000));
            
            setConnectedScale(discoveredDevice);

            discoveredDevice.monitorCharacteristicForService(
                SCALE_SERVICE_UUID,
                SCALE_CHARACTERISTIC_UUID,
                (error, characteristic) => {
                    if (error) {
                        console.log("Scale monitoring error:", error);
                        return;
                    }
                    if (characteristic?.value) {
                        const buffer = Buffer.from(characteristic.value, 'base64');
                        const weight = buffer.readFloatLE(0);
                        console.log("Received weight:", weight);
                        setScaleValue(weight);
                    }
                }
            );
            
            console.log("Scale connection and monitoring set up successfully");
        } catch (error) {
            console.log("Scale connection error:", error);
            const errorMessage = error instanceof Error ? error.message : String(error);
            setConnectionErrors(prev => ({ ...prev, scale: errorMessage }));
            setConnectedScale(null);
            setScaleValue(null);
        } finally {
            setIsConnecting(false);
            setTimeout(() => {
                connectionLockRef.current = false;
            }, 2000);
        }
    }, [connectedScale, disconnectFromScale, bleManager]);

    const connectToBothDevices = useCallback(async (pressureSensor: Device, scale: Device) => {
        try {
            await disconnectFromPressureSensor();
            await disconnectFromScale();
            
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            console.log("Starting connection sequence - pressure sensor first");
            await connectToPressureSensor(pressureSensor);
            
            await new Promise(resolve => setTimeout(resolve, 3000));
            
            console.log("Now connecting to scale");
            await connectToScale(scale);
            
            console.log("Both devices connected successfully");
        } catch (error) {
            console.log("Error in connection sequence:", error);
        }
    }, [connectToPressureSensor, connectToScale, disconnectFromPressureSensor, disconnectFromScale]);

    useEffect(() => {
        const subscriptions: Subscription[] = [];
        
        if (connectedPressureSensor) {
            const pressureSubscription = bleManager.onDeviceDisconnected(
                connectedPressureSensor.id,
                (error, device) => {
                    console.log("Pressure sensor disconnected:", device?.id);
                    setConnectedPressureSensor(null);
                    setPressureValue(null);
                }
            );
            subscriptions.push(pressureSubscription);
        }
        
        if (connectedScale) {
            const scaleSubscription = bleManager.onDeviceDisconnected(
                connectedScale.id,
                (error, device) => {
                    console.log("Scale disconnected:", device?.id);
                    setConnectedScale(null);
                    setScaleValue(null);
                }
            );
            subscriptions.push(scaleSubscription);
        }
        
        return () => {
            subscriptions.forEach(subscription => {
                if (subscription) {
                    subscription.remove();
                }
            });
        };
    }, [connectedPressureSensor, connectedScale, bleManager]);

    return {
        scanForPeripherals,
        requestPermissions,
        allDevices,
        connectToPressureSensor,
        connectToScale,
        disconnectFromPressureSensor,
        disconnectFromScale,
        connectedPressureSensor,
        connectedScale,
        pressureValue,
        scaleValue,
        connectionErrors,
        isConnecting,
        connectToBothDevices
    }
}

export default useBle
