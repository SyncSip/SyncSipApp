export const bleDeviceNames = ["PressureSensor", "Scale", "Bookoo_SC", "BOOKOO_SC 232759"]


interface ScaleDeviceMap {
    syncSipScale: {
      serviceUuid: string;
      weightCharacteristicUuid: string;
      timerCharacteristicsUuid: string;
    };
    [key: string]: any;
  }

  export const bleNameCharacteristicsMap: ScaleDeviceMap = {
    syncSipScale: {
        serviceUuid: "9999181A-0000-1000-8000-00805F9B34FB",
        weightCharacteristicUuid: "99992A6D-0000-1000-8000-00805F9B34FB",
        timerCharacteristicsUuid: ""
    },
    "BOOKOO_SC 232759": {
        serviceUuid: '00000ffe-0000-1000-8000-00805f9b34fb',
        commandCharacteristicsUuid: '0000ff12-0000-1000-8000-00805f9b34fb',
        dataCharacteristicsUuid: '0000ff11-0000-1000-8000-00805f9b34fb',
    }
}

export function calculateChecksum(bytes: number[]): number {
    let checksum = 0;
    for (const byte of bytes) {
        checksum ^= byte;
    }
    return checksum;
}

export function createCommand(commandType: number, data1: number = 0, data2: number = 0): Buffer {
    const bytes = [0x03, 0x0A, commandType, data1, data2];
    const checksum = calculateChecksum(bytes);
    return Buffer.from([...bytes, checksum]);
}


export function parseBookooThemisData(hexString: string) {
    try {
        const cleanHex = hexString.replace(/\s/g, '');
        
        const bytes: string[] = [];
        for (let i = 0; i < cleanHex.length; i += 2) {
            bytes.push(cleanHex.substring(i, i + 2));
        }
    
        const byteValues = bytes.map(byte => parseInt(byte, 16));
        
        if (byteValues.length < 20) {
            console.log("Not enough bytes in data, received:", byteValues.length);
            return {};
        }
        
        const productNumber = byteValues[0];
        const type = byteValues[1];
        
        const milliseconds = (byteValues[2] << 16) | (byteValues[3] << 8) | byteValues[4];
        
        const weightUnit = byteValues[5];
        
        const weightSymbolByte = byteValues[6];
        const weightSymbol = weightSymbolByte === 0x2B ? '+' : '-';
        
        const weightRaw = (byteValues[7] << 16) | (byteValues[8] << 8) | byteValues[9];
        const weightValue = parseFloat((weightRaw / 100).toFixed(2));
        
        const flowRateSymbolByte = byteValues[10];
        const flowRateSymbol = flowRateSymbolByte === 0x2B ? '+' : '-';
        
        const flowRateRaw = (byteValues[11] << 8) | byteValues[12];
        const flowRate = parseFloat((flowRateRaw / 100).toFixed(2));
        
        const batteryPercentage = byteValues[13];
        
        const standbyTimeMinutes = (byteValues[14] << 8) | byteValues[15];
        
        const buzzerGear = byteValues[16];
        
        const flowRateSmoothingEnabled = byteValues[17] === 1;
        
        const receivedChecksum = byteValues[byteValues.length - 1];
        let calculatedChecksum = 0;
        
        for (let i = 0; i < byteValues.length - 1; i++) {
            calculatedChecksum ^= byteValues[i];
        }
        
        const isChecksumValid = calculatedChecksum === receivedChecksum;
        
        return {
            productNumber,
            type,
            milliseconds,
            weightUnit,
            weightSymbol,
            weightValue,
            flowRateSymbol,
            flowRate,
            batteryPercentage,
            standbyTimeMinutes,
            buzzerGear,
            flowRateSmoothingEnabled,
            isChecksumValid
        };
    } catch (error) {
        console.log("Error in parseBookooThemisData:", error);
        return {};
    }
}

export function parseTimemoreScaleData(hexString: string) {
    try {
        const cleanHex = hexString.replace(/\s/g, '');
        
        const bytes: string[] = [];
        for (let i = 0; i < cleanHex.length; i += 2) {
            bytes.push(cleanHex.substring(i, i + 2));
        }
    
        const byteValues = bytes.map(byte => parseInt(byte, 16));
        
        if (byteValues.length < 8) {
            console.log("Not enough bytes in data, received:", byteValues.length);
            return {};
        }
        
        const statusByte = byteValues[0];
        
        const weightRaw = (byteValues[1] << 16) | (byteValues[2] << 8) | byteValues[3];
        const weightValue = parseFloat((weightRaw / 10).toFixed(1));
        
        const secondWeightRaw = (byteValues[5] << 16) | (byteValues[6] << 8) | byteValues[7];
        const secondWeightValue = parseFloat((secondWeightRaw / 10).toFixed(1));
        
        let batteryPercentage = null;
        if (byteValues.length > 8) {
            batteryPercentage = byteValues[8];
        }
        
        const isChecksumValid = true;
        
        return {
            statusByte,
            weightValue,
            secondWeightValue,
            batteryPercentage,
            isChecksumValid,
            weightRaw,
            secondWeightRaw
        };
    } catch (error) {
        console.log("Error in parseTimemoreScaleData:", error);
        return {};
    }
}
