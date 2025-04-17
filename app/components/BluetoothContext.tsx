import React, { createContext, useContext, ReactNode } from 'react';
import { Device } from 'react-native-ble-plx';
import useBle from '@/useBle';

interface BluetoothContextType {
    requestPermissions: () => Promise<boolean>;
    scanForPeripherals: () => void;
    allDevices: Device[];
    connectToPressureSensor: (device: Device) => Promise<void>;
    connectToScale: (device: Device) => Promise<void>;
    disconnectFromPressureSensor: () => Promise<void>;
    disconnectFromScale: () => Promise<void>;
    connectedPressureSensor: Device | null;
    connectedScale: Device | null;
    pressureValue: number | null;
    scaleValue: number | null;
    timerValue: number | null;
    flowRate: number | null
    scaleBatteryPercentage: number | null
    sendStartTimerCommand: () => Promise<void>
    sendStopTimerCommand: (callback?: () => void) => Promise<void>
    sendResetTimerCommand: () => Promise<void>,
    timerStatus: 'running' | 'stopped' | 'reset'
}

const BluetoothContext = createContext<BluetoothContextType | undefined>(undefined);

export function BluetoothProvider({ children }: { children: ReactNode }) {
    const bluetooth = useBle();

    return (
        <BluetoothContext.Provider value={bluetooth}>
            {children}
        </BluetoothContext.Provider>
    );
}

export function useBluetooth() {
    const context = useContext(BluetoothContext);
    if (context === undefined) {
        throw new Error('useBluetooth must be used within a BluetoothProvider');
    }
    return context;
}
