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

export function parseBlackcoffeeScaleData(hexString: string) {
    try {
        const cleanHex = hexString.replace(/\s/g, '');
        
        const bytes: string[] = [];
        for (let i = 0; i < cleanHex.length; i += 2) {
            bytes.push(cleanHex.substring(i, i + 2));
        }
    
        const byteValues = bytes.map(byte => parseInt(byte, 16));
        
        if (byteValues.length < 14) {
            console.log("Not enough bytes in data, received:", byteValues.length);
            return {};
        }
        
        const isNegative = bytes[4] === '8' || bytes[4] === 'c';
        const isStill = bytes[5] === '1';
        
        const hexWeight = cleanHex.slice(7, 14);
        const weightValue = ((isNegative ? -1 : 1) * parseInt(hexWeight, 16)) / 1000;
        
        const statusByte = byteValues[0];
        
        const isChecksumValid = true;
        
        return {
            statusByte,
            weightValue,
            isNegative,
            isStill,
            hexWeight,
            isChecksumValid
        };
    } catch (error) {
        console.log("Error in parseBlackcoffeeScaleData:", error);
        return {};
    }
}

export function parseDecentScaleData(hexString: string) {
    try {
        const cleanHex = hexString.replace(/\s/g, '');
        
        const bytes: string[] = [];
        for (let i = 0; i < cleanHex.length; i += 2) {
            bytes.push(cleanHex.substring(i, i + 2));
        }
    
        const byteValues = bytes.map(byte => parseInt(byte, 16));
        
        const apiVersion = byteValues.length === 10 ? '>1.3' : '<1.3';
        
        if (byteValues.length < 7) {
            console.log("Not enough bytes in data, received:", byteValues.length);
            return { apiVersion };
        }
        
        const header = byteValues[0];
        const commandByte = byteValues[1];
        
        let weightValue = null;
        let weightIsStable = false;
        let buttonEvent = null;
        

        if (commandByte === 0xce || commandByte === 0xca) {
            const weightRaw = (byteValues[2] << 8) | byteValues[3];
            weightValue = parseFloat((weightRaw / 10.0).toFixed(1));
            weightIsStable = commandByte === 0xce;
        } else if (commandByte === 0xaa && byteValues[2] === 0x01) {
            buttonEvent = 'tare';
        } else if (commandByte === 0xaa && byteValues[2] === 0x02) {
            buttonEvent = 'timer';
        }
        
        const receivedChecksum = byteValues[byteValues.length - 1];
        let calculatedChecksum = 0;
        
        if (byteValues.length >= 6) {
            calculatedChecksum = byteValues[0] ^ byteValues[1] ^ byteValues[2] ^ 
                                byteValues[3] ^ byteValues[4] ^ byteValues[5];
        }
        
        const isChecksumValid = calculatedChecksum === receivedChecksum;
        
        return {
            apiVersion,
            header,
            commandByte,
            weightValue,
            weightIsStable,
            buttonEvent,
            isChecksumValid,
            rawData: byteValues
        };
    } catch (error) {
        console.log("Error in parseDecentScaleData:", error);
        return {};
    }
}


export function parseEurekaPrecisaScaleData(hexString: string) {
    try {
        const cleanHex = hexString.replace(/\s/g, '');
        
        const bytes: string[] = [];
        for (let i = 0; i < cleanHex.length; i += 2) {
            bytes.push(cleanHex.substring(i, i + 2));
        }
    
        const byteValues = bytes.map(byte => parseInt(byte, 16));
        
        if (byteValues.length < 9) {
            console.log("Not enough bytes in data, received:", byteValues.length);
            return {};
        }
        
        const isNegative = byteValues[6] !== 0;
        
        const weightRaw = (byteValues[8] << 8) + byteValues[7];

        const signedWeightRaw = isNegative ? weightRaw * -1 : weightRaw;
        const weightValue = parseFloat((signedWeightRaw / 10).toFixed(1));
        
        let unit = 'g'; 
        if (byteValues.length > 9) {
            const unitByte = byteValues[9];
            if (unitByte === 0x01) {
                unit = 'oz';
            } else if (unitByte === 0x02) {
                unit = 'ml';
            }
        }
        
        let batteryPercentage = null;
        if (byteValues.length > 10) {
            batteryPercentage = byteValues[10];
        }
        
        const isChecksumValid = true;
        
        return {
            weightValue,
            isNegative,
            unit,
            batteryPercentage,
            isChecksumValid,
            weightRaw,
            signedWeightRaw
        };
    } catch (error) {
        console.log("Error in parseEurekaPrecisaScaleData:", error);
        return {};
    }
}


export function parseFelicitaScaleData(hexString: string) {
    try {
        const cleanHex = hexString.replace(/\s/g, '');
        
        const bytes: string[] = [];
        for (let i = 0; i < cleanHex.length; i += 2) {
            bytes.push(cleanHex.substring(i, i + 2));
        }
    
        const byteValues = bytes.map(byte => parseInt(byte, 16));
        
        if (byteValues.length !== 18) {
            console.log("Invalid data length, expected 18 bytes, received:", byteValues.length);
            return {};
        }
        
        const weightBytes = byteValues.slice(3, 9).map(value => value - 48);
        const weightRaw = parseInt(weightBytes.join(''));
        const weightValue = parseFloat((weightRaw / 100).toFixed(2));
        
        const unitBytes = byteValues.slice(9, 11);
        const unit = String.fromCharCode(...unitBytes);
        
        const MIN_BATTERY_LEVEL = 170; 
        const MAX_BATTERY_LEVEL = 180; 
        
        const batteryRaw = byteValues[15];
        const batteryPercentage = Math.round(
            ((batteryRaw - MIN_BATTERY_LEVEL) / (MAX_BATTERY_LEVEL - MIN_BATTERY_LEVEL)) * 100
        );
        
        const isChecksumValid = true;
        
        return {
            weightValue,
            unit,
            batteryPercentage,
            isChecksumValid,
            weightRaw,
            batteryRaw
        };
    } catch (error) {
        console.log("Error in parseFelicitaScaleData:", error);
        return {};
    }
}

export function parseAcaiaScaleData(hexString: string) {
    try {
        const cleanHex = hexString.replace(/\s/g, '');
        
        const bytes: string[] = [];
        for (let i = 0; i < cleanHex.length; i += 2) {
            bytes.push(cleanHex.substring(i, i + 2));
        }
    
        const byteValues = bytes.map(byte => parseInt(byte, 16));
        
        const MAGIC1 = 0xef;
        const MAGIC2 = 0xdd;
        
        let messageStart = -1;
        for (let i = 0; i < byteValues.length - 1; i++) {
            if (byteValues[i] === MAGIC1 && byteValues[i + 1] === MAGIC2) {
                messageStart = i;
                break;
            }
        }
        
        if (messageStart < 0 || byteValues.length - messageStart < 6) {
            console.log("Invalid Acaia data format or incomplete message");
            return {};
        }
        
        const messageType = byteValues[messageStart + 2];
        
        let result: any = {
            messageType
        };
        
        if (messageType === 12) {
            const msgType = byteValues[messageStart + 4];
            
            if (msgType === 5) {
                result.msgType = 'WEIGHT';
                result.weightValue = decodeWeight(byteValues.slice(messageStart + 5));
            } else if (msgType === 8) {
                result.msgType = 'BUTTON_EVENT';
                
                const buttonType = byteValues[messageStart + 5];
                const buttonSubType = byteValues[messageStart + 6];
                
                if (buttonType === 0 && buttonSubType === 5) {
                    result.buttonEvent = 'TARE';
                    result.weightValue = decodeWeight(byteValues.slice(messageStart + 7));
                } else if (buttonType === 8 && buttonSubType === 5) {
                    result.buttonEvent = 'START';
                    result.weightValue = decodeWeight(byteValues.slice(messageStart + 7));
                } else if (buttonType === 10 && buttonSubType === 7) {
                    result.buttonEvent = 'STOP';
                    result.time = decodeTime(byteValues.slice(messageStart + 7));
                    result.weightValue = decodeWeight(byteValues.slice(messageStart + 11));
                } else if (buttonType === 9 && buttonSubType === 7) {
                    result.buttonEvent = 'RESET';
                    result.time = decodeTime(byteValues.slice(messageStart + 7));
                    result.weightValue = decodeWeight(byteValues.slice(messageStart + 11));
                } else {
                    result.buttonEvent = 'UNKNOWN';
                }
            } else if (msgType === 7) {
                result.msgType = 'TIMER';
                result.time = decodeTime(byteValues.slice(messageStart + 5));
            } else if (msgType === 11) {
                result.msgType = 'HEARTBEAT';
                
                if (byteValues[messageStart + 7] === 5) {
                    result.weightValue = decodeWeight(byteValues.slice(messageStart + 8));
                } else if (byteValues[messageStart + 7] === 7) {
                    result.time = decodeTime(byteValues.slice(messageStart + 8));
                }
            }
        } else if (messageType === 8) {
            result.msgType = 'SETTINGS';
            
            const payload = byteValues.slice(messageStart + 3);
            result.battery = payload[1] & 127;
            
            if (payload[2] === 2) {
                result.units = 'grams';
            } else if (payload[2] === 5) {
                result.units = 'ounces';
            }
            
            result.autoOff = !!(payload[4] * 5);
            result.beepOn = payload[6] === 1;
        }
        
        return result;
    } catch (error) {
        console.log("Error in parseAcaiaScaleData:", error);
        return {};
    }
}

function decodeWeight(weightPayload: number[]): number {
    let value = ((weightPayload[1] & 0xff) << 8) + (weightPayload[0] & 255);
    const unit = weightPayload[4] & 0xff;
    
    if (unit === 1) {
        value /= 10.0;
    } else if (unit === 2) {
        value /= 100.0;
    } else if (unit === 3) {
        value /= 1000.0;
    } else if (unit === 4) {
        value /= 10000.0;
    }
    
    if ((weightPayload[5] & 2) === 2) {
        value *= -1;
    }
    
    return parseFloat(value.toFixed(3));
}


function decodeTime(timePayload: number[]): number {
    let value = (timePayload[0] & 0xff) * 60;
    value = value + timePayload[1];
    value = value + timePayload[2] / 10.0;
    return Math.round(value * 1000); 
}



