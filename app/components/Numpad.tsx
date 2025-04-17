import React from 'react';
import { View, StyleSheet, Text, TextInput, TouchableOpacity, Modal, Platform } from 'react-native';

interface NumpadInputProps {
  isVisible: boolean;
  onClose: () => void;
  value: string;
  onValueChange: (value: string) => void;
  onSubmit: () => void;
  title?: string;
}

const NumpadInput: React.FC<NumpadInputProps> = ({ 
  isVisible, 
  onClose, 
  value, 
  onValueChange, 
  onSubmit,
  title = "Enter Value"
}) => {
  const handleNumPress = (num: string) => {
    if (num === 'backspace') {
      onValueChange(value.slice(0, -1));
    } else if (num === '.') {
      if (!value.includes('.')) {
        onValueChange(value + num);
      }
    } else {
      onValueChange(value + num);
    }
  };

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.numpadContainer}>
          <View style={styles.numpadHeader}>
            <Text style={styles.numpadTitle}>{title}</Text>
            <TextInput
              style={styles.numpadInput}
              value={value}
              keyboardType="numeric"
              editable={false}
            />
          </View>
          
          <View style={styles.numpadGrid}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, '.', 0, 'backspace'].map((num) => {
              const isSpecial = num === '.' || num === 'backspace';
              return (
                <TouchableOpacity
                  key={num.toString()}
                  style={[
                    styles.numpadButton,
                    isSpecial && styles.specialButton
                  ]}
                  activeOpacity={0.6}
                  onPress={() => handleNumPress(num.toString())}
                >
                  {num === 'backspace' ? (
                    <Text style={styles.numpadButtonText}>⌫</Text>
                  ) : (
                    <Text style={styles.numpadButtonText}>{num}</Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
          
          <View style={styles.numpadActions}>
            <TouchableOpacity 
              style={styles.numpadCancel} 
              activeOpacity={0.6}
              onPress={onClose}
            >
              <Text style={styles.numpadCancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.numpadConfirm}
              activeOpacity={0.6}
              onPress={() => {
                onSubmit();
                onClose();
              }}
            >
              <Text style={styles.numpadConfirmText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  numpadContainer: {
    width: '100%',
    backgroundColor: '#D1D5DB',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 36 : 16, // Extra padding for iOS
  },
  numpadHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  numpadTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  numpadInput: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#9CA3AF',
    borderRadius: 10,
    fontSize: 24,
    textAlign: 'center',
    backgroundColor: '#F9FAFB',
    color: '#1F2937',
    fontWeight: '500',
  },
  numpadGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  numpadButton: {
    width: '31%',
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  specialButton: {
    backgroundColor: '#E5E7EB',
  },
  numpadButtonText: {
    fontSize: 24,
    fontWeight: '500',
    color: '#1F2937',
  },
  numpadActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  numpadCancel: {
    width: '48%',
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E5E7EB',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  numpadCancelText: {
    color: '#1F2937',
    fontSize: 16,
    fontWeight: '600',
  },
  numpadConfirm: {
    width: '48%',
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  numpadConfirmText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default NumpadInput;
