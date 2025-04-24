import { useMemo, useState, useCallback, useEffect, useRef } from "react"
import { PermissionsAndroid, Platform } from "react-native"
import { BleManager, Device, Subscription } from 'react-native-ble-plx'
import * as ExpoDevice from 'expo-device'
import { Buffer } from 'buffer'
import * as haptics from 'expo-haptics'
import { bleDeviceNames, bleNameCharacteristicsMap, parseBookooThemisData } from "./scripts/ble.constants"

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
    timerValue: number | null
    scaleBatteryPercentage: number | null
    flowRate: number | null
    connectionErrors: {
        pressure: string | null,
        scale: string | null
    }
    isConnecting: boolean
    connectToBothDevices: (pressureSensor: Device, scale: Device) => Promise<void>,
    sendStartTimerCommand: () => Promise<void>
    sendStopTimerCommand: () => Promise<void>
    sendResetTimerCommand: () => Promise<void>
    timerStatus: 'running' | 'stopped' | 'reset'
}

function useBle(): bleAPI {
    const bleManager = useMemo(() => new BleManager(), [])
    const [allDevices, setAllDevices] = useState<Device[]>([])
    const [connectedPressureSensor, setConnectedPressureSensor] = useState<Device | null>(null)
    const [connectedScale, setConnectedScale] = useState<Device | null>(null)
    const [pressureValue, setPressureValue] = useState<number | null>(null)
    const [scaleValue, setScaleValue] = useState<number | null>(null)
    const [timerValue, setTimerValue] = useState<number | null>(null)
    const [isConnecting, setIsConnecting] = useState(false)
    const [flowRate, setFlowRate] = useState<number | null>(null)
    const [scaleBatteryPercentage, setScaleBatteryPercentage] = useState<number | null>(null)
    const connectionLockRef = useRef(false)
    const [connectionErrors, setConnectionErrors] = useState<{
        pressure: string | null,
        scale: string | null
    }>({
        pressure: null,
        scale: null
    })
    const [timerStatus, setTimerStatus] = useState<'running' | 'stopped' | 'reset'>("reset");
    const timerStatusRef = useRef<'running' | 'stopped' | 'reset'>('reset');
    const prevTimerValueRef = useRef<number | null>(null);

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
                    if (device.name && bleDeviceNames.includes(device.name)) {
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
                
                setConnectedPressureSensor(null);
                setPressureValue(null);
                setConnectionErrors(prev => ({ ...prev, pressure: null }));
                
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

    const connectToPressureSensor = useCallback(async (device: Device, retryCount = 0) => {
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
                timeout: 30000,  
                autoConnect: true,
                requestMTU: 512,  
            });
            
            console.log("Connected to pressure sensor");
    
            // Longer delay after connection
            await new Promise(resolve => setTimeout(resolve, 2000));
    
            const discoveredDevice = await connectedDevice.discoverAllServicesAndCharacteristics();
            console.log("Discovered services and characteristics for pressure sensor");
    
            // Another delay after discovery
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            setConnectedPressureSensor(discoveredDevice);
    
            // Add error handling in the monitoring function
            const subscription = discoveredDevice.monitorCharacteristicForService(
                PRESSURE_SERVICE_UUID,
                PRESSURE_CHARACTERISTIC_UUID,
                (error, characteristic) => {
                    if (error) {
                        console.log("Pressure monitoring error:", error);
                        // Don't disconnect on monitoring errors
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
            haptics.impactAsync(haptics.ImpactFeedbackStyle.Heavy)
        } catch (error) {
            console.log("Pressure sensor connection error:", error);
            const errorMessage = error instanceof Error ? error.message : String(error);
            setConnectionErrors(prev => ({ ...prev, pressure: errorMessage }));
            
            if (retryCount < 3) {
                console.log(`Retrying connection (attempt ${retryCount + 1}/3)...`);
                setTimeout(() => {
                    connectToPressureSensor(device, retryCount + 1);
                }, 3000);
                return;
            }
            
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
        let dataCharacteristicUuid;
        let commandCharacteristicUuid;
        let serviceUuid;
    
        if (device.name) {
            console.log("DEVICE NAME: ", device.name);
            if (bleNameCharacteristicsMap[device.name]) {
                const deviceConfig = bleNameCharacteristicsMap[device.name];
                console.log("DEVICE characteristic: ", deviceConfig);
                serviceUuid = deviceConfig.serviceUuid;
                dataCharacteristicUuid = deviceConfig.dataCharacteristicsUuid;
                commandCharacteristicUuid = deviceConfig.commandCharacteristicsUuid;
            } else {
                console.log("Error: device name does not exist in devices map");
                return;
            }
        }
        
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

            console.log("Setting up monitoring for weight data characteristic:", dataCharacteristicUuid);
            discoveredDevice.monitorCharacteristicForService(
                serviceUuid,
                dataCharacteristicUuid,
                (error, characteristic) => {
                    if (error) {
                        console.log("Scale monitoring error:", error);
                        return;
                    }
                                        
                    if (characteristic?.value) {
                        const buffer = Buffer.from(characteristic.value, 'base64');
                        
                        try {
                            const parsedData = parseBookooThemisData(buffer.toString('hex'));
                            
                            if (parsedData.weightValue !== undefined && parsedData.weightSymbol) {
                                if(parsedData.weightSymbol === "+"){
                                    setScaleValue(parsedData.weightValue);
                                }else{
                                    setScaleValue(-parsedData.weightValue)
                                }
                            }
                            
                            if (parsedData.milliseconds !== undefined) {
                                const currentMillis = parsedData.milliseconds;
                                setTimerValue(currentMillis);
                                let newStatus = timerStatusRef.current;
                                const prevMillis = prevTimerValueRef.current;
                            
                                if (prevMillis !== null) {
                                    if (currentMillis === 0) {
                                        newStatus = "reset";
                                    } else if (currentMillis > prevMillis) {
                                        newStatus = "running";
                                    } else if (currentMillis === prevMillis && currentMillis > 0) {
                                        newStatus = "stopped";
                                    }
                                } else {
                                    if (currentMillis > 0) {
                                        newStatus = "running";
                                    } else {
                                        newStatus = "reset";
                                    }
                                }
                            
                                if (newStatus !== timerStatusRef.current) {
                                    console.log("Timer status changing from:", timerStatusRef.current, "to:", newStatus);
                                    timerStatusRef.current = newStatus;
                                    setTimerStatus(newStatus);
                                }
                            
                                prevTimerValueRef.current = currentMillis;
                            }
                            
                            if(parsedData.batteryPercentage !== undefined){
                                setScaleBatteryPercentage(parsedData.batteryPercentage)
                            }
                            
                            if(parsedData.flowRate !== undefined && parsedData.flowRateSymbol){
                                if(parsedData.flowRateSymbol === "+"){
                                    setFlowRate(parsedData.flowRate)
                                }else{
                                    setFlowRate(-parsedData.flowRate)
                                }
                            }
                        } catch (parseError) {
                            console.log("Error parsing weight data:", parseError);
                        }
                    }
                }
            );
    
            await new Promise(resolve => setTimeout(resolve, 500));
            
            console.log("Scale connection and monitoring set up successfully");
            haptics.impactAsync(haptics.ImpactFeedbackStyle.Heavy);
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

    const sendStartTimerCommand = useCallback(async (): Promise<void> => {
        if (!connectedScale) {
            console.log("Cannot send start timer command: No scale connected");
            return;
        }

        try {
            console.log("Sending start timer command to scale...");
            
            const deviceConfig = bleNameCharacteristicsMap[connectedScale.name || ""];
            if (!deviceConfig) {
                console.log("Error: Unknown device, cannot determine UUIDs");
                return;
            }
            
            const serviceUuid = deviceConfig.serviceUuid;
            const commandCharacteristicUuid = deviceConfig.commandCharacteristicsUuid;
            
            const startTimerCommandBytes = [0x03, 0x0A, 0x04, 0x00, 0x00];
            
            let checksum = 0;
            for (const byte of startTimerCommandBytes) {
                checksum ^= byte;
            }
            
            const fullCommand = Buffer.from([...startTimerCommandBytes, checksum]);
            
            console.log("Start timer command bytes:", 
                        Array.from(fullCommand).map(b => b.toString(16).padStart(2, '0')).join(' '));
            
            await connectedScale.writeCharacteristicWithResponseForService(
                serviceUuid,
                commandCharacteristicUuid,
                fullCommand.toString('base64')
            );
            
            console.log("Start timer command sent successfully");
            
            haptics.impactAsync(haptics.ImpactFeedbackStyle.Medium);
            
        } catch (error) {
            console.log("Error sending start timer command:", error);
            throw error;
        }
    }, [connectedScale]);

    const sendResetTimerCommand = useCallback(async (): Promise<void> => {
        if (!connectedScale) {
            console.log("Cannot send reset timer command: No scale connected");
            return;
        }

        try {
            console.log("Sending reset timer command to scale...");
            
            const deviceConfig = bleNameCharacteristicsMap[connectedScale.name || ""];
            if (!deviceConfig) {
                console.log("Error: Unknown device, cannot determine UUIDs");
                return;
            }
            
            const serviceUuid = deviceConfig.serviceUuid;
            const commandCharacteristicUuid = deviceConfig.commandCharacteristicsUuid;
            
            const resetTimerCommandBytes = [0x03, 0x0A, 0x06, 0x00, 0x00];
            
            let checksum = 0;
            for (const byte of resetTimerCommandBytes) {
                checksum ^= byte;
            }
            
            const fullCommand = Buffer.from([...resetTimerCommandBytes, checksum]);
            
            console.log("reset timer command bytes:", 
                        Array.from(fullCommand).map(b => b.toString(16).padStart(2, '0')).join(' '));
            
            await connectedScale.writeCharacteristicWithResponseForService(
                serviceUuid,
                commandCharacteristicUuid,
                fullCommand.toString('base64')
            );
            
            console.log("reset timer command sent successfully");
            
        } catch (error) {
            console.log("Error sending start timer command:", error);
            throw error;
        }
    }, [connectedScale]);

    const sendStopTimerCommand = useCallback(async (): Promise<void> => {
        if (!connectedScale) {
            console.log("Cannot send stop timer command: No scale connected");
            return;
        }

        try {
            console.log("Sending stop timer command to scale...");
            
            const deviceConfig = bleNameCharacteristicsMap[connectedScale.name || ""];
            if (!deviceConfig) {
                console.log("Error: Unknown device, cannot determine UUIDs");
                return;
            }
            
            const serviceUuid = deviceConfig.serviceUuid;
            const commandCharacteristicUuid = deviceConfig.commandCharacteristicsUuid;
            
            const commandBytes = [0x03, 0x0A, 0x05, 0x00, 0x00];
            
            let checksum = 0;
            for (const byte of commandBytes) {
                checksum ^= byte;
            }
            
            const fullCommand = Buffer.from([...commandBytes, checksum]);
            
            console.log("stop timer command bytes:", 
                        Array.from(fullCommand).map(b => b.toString(16).padStart(2, '0')).join(' '));
            
            await connectedScale.writeCharacteristicWithResponseForService(
                serviceUuid,
                commandCharacteristicUuid,
                fullCommand.toString('base64')
            );
            
            console.log("stop timer command sent successfully");
            
            haptics.impactAsync(haptics.ImpactFeedbackStyle.Medium);
            
        } catch (error) {
            console.log("Error sending start timer command:", error);
            throw error;
        }
    }, [connectedScale]);

    

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
        timerValue,
        connectionErrors,
        isConnecting,
        connectToBothDevices,
        scaleBatteryPercentage,
        flowRate,
        sendStartTimerCommand,
        sendStopTimerCommand,
        sendResetTimerCommand,
        timerStatus,

    }
}

export default useBle
