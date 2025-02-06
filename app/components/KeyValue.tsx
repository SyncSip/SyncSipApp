import React from 'react';
import { View, TextInput, Button, StyleSheet } from 'react-native';

interface KeyValueInputProps {
  keyValue: string;
  setKeyValue: (value: string) => void;
  valueValue: string;
  setValueValue: (value: string) => void;
  onAddField: () => void;
}

const KeyValueInput: React.FC<KeyValueInputProps> = ({
  keyValue,
  setKeyValue,
  valueValue,
  setValueValue,
  onAddField,
}) => {
  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Enter key"
        value={keyValue}
        onChangeText={setKeyValue}
      />
      <TextInput
        style={styles.input}
        placeholder="Enter value"
        value={valueValue}
        onChangeText={setValueValue}
      />
      <Button title="Add Field" onPress={onAddField} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 20,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
});

export default KeyValueInput;
