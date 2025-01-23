// src/components/AddShotModal.tsx
import React, { useState } from 'react';
import {
  View,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { ReadMachineDto, ReadGrinderDto, ReadBeanDto, CreateShotDto } from '@/api/generated';

type AddShotModalProps = {
  visible: boolean;
  onClose: () => void;
  onSave: (shotData: any) => Promise<void>;
  machines: ReadMachineDto[];
  grinders: ReadGrinderDto[];
  beans: ReadBeanDto[];
};

export default function AddShotModal({
  visible,
  onClose,
  onSave,
  machines,
  grinders,
  beans,
}: AddShotModalProps) {
  const [shotData, setShotData] = useState<CreateShotDto>({
    time: 0,
    weight: 0,
    dose: 0,
    machineId: '',
    grinderId: '',
    beansId: '',
    userId: '',
    graphData: {},
    group: '',
    starred: false
  });

  const handleSave = async () => {
    if (!shotData.time || !shotData.weight || !shotData.dose) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }
  
    try {
      // Ensure all number fields are actually numbers
      const formattedData: CreateShotDto = {
        ...shotData,
        time: Number(shotData.time),
        weight: Number(shotData.weight),
        dose: Number(shotData.dose),
        machineId: shotData.machineId || '',
        grinderId: shotData.grinderId || '',
        beansId: shotData.beansId || '',
        graphData: shotData.graphData || {},
        group: shotData.group || 'lol',
        starred: false
      };
  
      console.log('Sending shot data:', formattedData);
      await onSave(formattedData);
      
      setShotData({
        time: 0,
        weight: 0,
        dose: 0,
        machineId: '',
        grinderId: '',
        beansId: '',
        userId: '',
        graphData: {},
        group: '',
        starred: false
      });
      onClose();
    } catch (error: any) {
      console.error('Validation error:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
        Alert.alert('Error', error.response.data.message || 'Failed to save shot');
      } else {
        Alert.alert('Error', 'Failed to save shot');
      }
    }
  };

  const handleNumberInput = (value: string, field: 'time' | 'weight' | 'dose') => {
    const numberValue = parseFloat(value) || 0;
    setShotData(prev => ({ ...prev, [field]: numberValue }));
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          {/* Modal Header remains the same */}

          <ScrollView style={styles.scrollContent}>
            {/* Time Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Time (seconds) *</Text>
              <TextInput
                style={styles.input}
                value={shotData.time > 0 ? shotData.time.toString() : ''}
                onChangeText={(value) => handleNumberInput(value, 'time')}
                keyboardType="decimal-pad"
                placeholder="Enter shot time"
              />
            </View>

            {/* Weight Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Weight (grams) *</Text>
              <TextInput
                style={styles.input}
                value={shotData.weight > 0 ? shotData.weight.toString() : ''}
                onChangeText={(value) => handleNumberInput(value, 'weight')}
                keyboardType="decimal-pad"
                placeholder="Enter shot weight"
              />
            </View>

            {/* Dose Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Dose (grams) *</Text>
              <TextInput
                style={styles.input}
                value={shotData.dose > 0 ? shotData.dose.toString() : ''}
                onChangeText={(value) => handleNumberInput(value, 'dose')}
                keyboardType="decimal-pad"
                placeholder="Enter dose weight"
              />
            </View>

            {/* Machine Picker */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Machine</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={shotData.machineId}
                  onValueChange={(value: string) => setShotData(prev => ({ ...prev, machineId: value }))}
                >
                  <Picker.Item label="Select a machine" value="" />
                  {machines.map((machine) => (
                    <Picker.Item
                      key={machine.id}
                      label={`${machine.brandName} ${machine.model}`}
                      value={machine.id}
                    />
                  ))}
                </Picker>
              </View>
            </View>

            {/* Grinder Picker */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Grinder</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={shotData.grinderId}
                  onValueChange={(value: string) => setShotData(prev => ({ ...prev, grinderId: value }))}
                >
                  <Picker.Item label="Select a grinder" value="" />
                  {grinders.map((grinder) => (
                    <Picker.Item
                      key={grinder.id}
                      label={`${grinder.brandName} ${grinder.model}`}
                      value={grinder.id}
                    />
                  ))}
                </Picker>
              </View>
            </View>

            {/* Beans Picker */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Beans</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={shotData.beansId}
                  onValueChange={(value: string) => setShotData(prev => ({ ...prev, beansId: value }))}
                >
                  <Picker.Item label="Select beans" value="" />
                  {beans.map((bean) => (
                    <Picker.Item
                      key={bean.id}
                      label={`${bean.roastery} - ${bean.bean}`}
                      value={bean.id}
                    />
                  ))}
                </Picker>
              </View>
            </View>
          </ScrollView>

          <TouchableOpacity 
            style={styles.saveButton}
            onPress={handleSave}
          >
            <Text style={styles.saveButtonText}>Save Shot</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}


const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeText: {
    color: '#007AFF',
    fontSize: 16,
  },
  scrollContent: {
    maxHeight: '80%',
  },
  inputContainer: {
    marginBottom: 20
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    backgroundColor: '#fff'
  },
  saveButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
