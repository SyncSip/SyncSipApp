import React, { useEffect, useState } from 'react';
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
import { ReadMachineDto, ReadGrinderDto, ReadBeanDto, CreateShotDto, ReadShotDto, EditShotDto } from '@/api/generated';
import KeyValueInput from './KeyValue';

type AddShotModalProps = {
  visible: boolean;
  onClose: () => void;
  onSave: (shotData: any) => Promise<void>;
  machines: ReadMachineDto[];
  grinders: ReadGrinderDto[];
  beans: ReadBeanDto[];
  handleEdit: (shotData: EditShotDto, id: string) => Promise<void>
  edit?: boolean,
  shot?: ReadShotDto
};

interface keyValueInput {
  key: string,
  value: string
}

export default function AddShotModal({
  visible,
  onClose,
  onSave,
  machines,
  grinders,
  beans,
  edit,
  shot,
  handleEdit
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
    starred: false,
    customFields: null
  });

useEffect(() => {
  if (!visible) {
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
      starred: false,
      customFields: null
    });
    setIndieFields([]);
  } else if (edit && shot) {
    setShotData({
      time: shot.time,
      weight: shot.weight,
      dose: shot.dose,
      machineId: shot.machine?.id || '',
      grinderId: shot.grinder?.id || '',
      beansId: shot.beans?.id || '',
      userId: shot.userId,
      graphData: shot.graphData || {},
      group: shot.group || '',
      starred: shot.starred || false,
      customFields: shot.customFields || null
    });
    if (shot.customFields) {
        setIndieFields(shot.customFields);
    }
  }
}, [visible, edit, shot]);

  const [key, setKey] = useState('');
  const [value, setValue] = useState('');
  const [indieFields, setIndieFields] = useState<keyValueInput[]>([]);

  const handleAddField = () => {
    if (key && value) {
      setIndieFields([...indieFields, { key, value }]);
      setKey('');
      setValue('');
    }
  };

  const handleSave = async () => {
    if (!shotData.time || !shotData.weight || !shotData.dose) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }
  
    try {
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
        starred: false,
        customFields: indieFields || null
      };
  
      console.log('Sending shot data:', formattedData);
      if(edit===false){
        await onSave(formattedData);
      }
      if(edit === true && shot){
        await handleEdit(formattedData, shot.id)
      }
      
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
        starred: false,
        customFields: null
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

  const handleCancel = () => {
    onClose();
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
          <ScrollView style={styles.scrollContent}>
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

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Machine</Text>
              <View style={styles.pickerContainer}>
              <Picker
  selectedValue={shotData.machineId}
  onValueChange={(value: string) => setShotData(prev => ({ ...prev, machineId: value }))}
>
  <Picker.Item key="machine-default" label="Select a machine" value="" />
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

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Grinder</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={shotData.grinderId}
                  onValueChange={(value: string) => setShotData(prev => ({ ...prev, grinderId: value }))}
                >
<Picker.Item key="grinder-default" label="Select a grinder" value="" />
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

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Beans</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={shotData.beansId}
                  onValueChange={(value: string) => setShotData(prev => ({ ...prev, beansId: value }))}
                >
<Picker.Item key="beans-default" label="Select beans" value="" />
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
            <View>
              <Text style={styles.label}>Custom Fields</Text>
              <KeyValueInput
                keyValue={key}
                setKeyValue={setKey}
                valueValue={value}
                setValueValue={setValue}
                onAddField={handleAddField}
              />
<View style={styles.keyValueList}>
  {indieFields.map((field, index) => (
    <View key={`custom-field-${index}-${field.key}`} style={styles.keyValueItem}>
      <View style={styles.keyValueContent}>
        <Text style={styles.keyValueText}>{field.key}: {field.value}</Text>
      </View>
      <TouchableOpacity 
        style={styles.deleteButton}
        onPress={() => {
          const newFields = indieFields.filter((_, i) => i !== index);
          setIndieFields(newFields);
        }}
      >
        <Text style={styles.deleteButtonText}>×</Text>
      </TouchableOpacity>
    </View>
  ))}
</View>
            </View>
          </ScrollView>

          <TouchableOpacity 
            style={styles.saveButton}
            onPress={handleSave}
          >
            {edit == true && (
              <Text>Save Shot</Text>
            )}
            {edit == false && (
              <Text>Create Shot</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.cancelButton}
            onPress={handleCancel}
          >
            <Text style={styles.saveButtonText}>Cancel</Text>
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
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 15,
  },
  cancelButton: {
    backgroundColor: 'grey',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  keyValueList: {
    marginTop: 10,
  },
  keyValueItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
  },
  keyValueContent: {
    flex: 1,
  },
  keyValueText: {
    fontSize: 16,
    color: '#333',
  },
  deleteButton: {
    backgroundColor: '#ff4444',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  }
  
});
