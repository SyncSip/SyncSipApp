import { useMemo, useState, useCallback, useEffect } from "react"
import { PermissionsAndroid, Platform } from "react-native"
import { BleManager, Device, Characteristic } from 'react-native-ble-plx'
import * as ExpoDevice from 'expo-device'
import { Buffer } from 'buffer'

const PRESSURE_SERVICE_UUID = "181A"
const PRESSURE_CHARACTERISTIC_UUID = "2A6D"

interface bleAPI {
    requestPermissions(): Promise<boolean>
    scanForPeripherals(): void
    allDevices: Device[]
    connectToDevice: (device: Device) => Promise<void>
    disconnectFromDevice: () => Promise<void>
    connectedDevice: Device | null
    pressureValue: number | null
}

function useBle(): bleAPI {
    const bleManager = useMemo(() => new BleManager(), [])
    const [allDevices, setAllDevices] = useState<Device[]>([])
    const [connectedDevice, setConnectedDevice] = useState<Device | null>(null)
    const [pressureValue, setPressureValue] = useState<number | null>(null)

    const requestAndroid31Permissions = async () => {
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

    const requestPermissions = async () => {
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
                return granted === PermissionsAndroid.RESULTS.GRANTED
            } else {
                const isAndroid31PermissionGranted = await requestAndroid31Permissions()
                return isAndroid31PermissionGranted
            }
        } else {
            return true
        }
    }

    const isDuplicateDevice = (devices: Device[], nextDevice: Device) => {
        return devices.findIndex((device) => nextDevice.id === device.id) > -1
    }

    const scanForPeripherals = useCallback(() => {
        setAllDevices([])
        
        console.log("Starting scan...")
        bleManager.startDeviceScan(
            null,
            {
                allowDuplicates: false,
            },
            async (error, device) => {
                if (error) {
                    console.log("Scanning error:", error)
                    return
                }
                if (device) {
                    console.log("Found device:", {
                        name: device.name,
                        id: device.id,
                        manufacturerData: device.manufacturerData,
                        serviceUUIDs: device.serviceUUIDs,
                    })
                    
                    if (device.name === "PressureSensor") {
                        setAllDevices((prevState) => {
                            if (!isDuplicateDevice(prevState, device)) {
                                return [...prevState, device]
                            }
                            return prevState
                        })
                    }
                }
            }
        )

        setTimeout(() => {
            bleManager.stopDeviceScan()
            console.log("Scan stopped")
        }, 5000)
    }, [bleManager])

    const connectToDevice = useCallback(async (device: Device) => {
        try {
            console.log("Connecting to device:", device.id)
            const connectedDevice = await device.connect()
            console.log("Connected to device")

            const discoveredDevice = await connectedDevice.discoverAllServicesAndCharacteristics()
            console.log("Discovered services and characteristics")

            setConnectedDevice(discoveredDevice)


            discoveredDevice.monitorCharacteristicForService(
                PRESSURE_SERVICE_UUID,
                PRESSURE_CHARACTERISTIC_UUID,
                (error, characteristic) => {
                    if (error) {
                        console.log("Monitoring error:", error)
                        return
                    }
                    if (characteristic?.value) {
                        const buffer = Buffer.from(characteristic.value, 'base64')
                        const pressure = buffer.readFloatLE(0)
                        console.log("Received pressure:", pressure)
                        setPressureValue(pressure)
                    }
                }
            )
        } catch (error) {
            console.log("Connection error:", error)
        }
    }, [])

    const disconnectFromDevice = useCallback(async () => {
        try {
            if (connectedDevice) {
                await bleManager.cancelDeviceConnection(connectedDevice.id)
                setConnectedDevice(null)
                setPressureValue(null)
                console.log("Disconnected from device")
            }
        } catch (error) {
            console.log("Disconnect error:", error)
        }
    }, [connectedDevice, bleManager])


    useEffect(() => {
        return () => {
            disconnectFromDevice()
        }
    }, [])

    return {
        scanForPeripherals,
        requestPermissions,
        allDevices,
        connectToDevice,
        disconnectFromDevice,
        connectedDevice,
        pressureValue
    }
}

export default useBle