import React from 'react';
import {
  View,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { ReadShotDto } from '@/api/generated';

type ShotDetailsModalProps = {
  visible: boolean;
  onClose: () => void;
  shot?: ReadShotDto;
};

export default function ShotDetailsModal({
  visible,
  onClose,
  shot,
}: ShotDetailsModalProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
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
            <View style={styles.header}>
              <Text style={styles.title}>Shot Details</Text>
              <Text style={styles.date}>{formatDate((shot?.createdAt) || "")}</Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Basic Information</Text>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Time:</Text>
                <Text style={styles.value}>{shot?.time}s</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Weight:</Text>
                <Text style={styles.value}>{shot?.weight}g</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Dose:</Text>
                <Text style={styles.value}>{shot?.dose}g</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Ratio:</Text>
                <Text style={styles.value}>{((shot?.weight || 0 )/(shot?.dose ||0)).toFixed(2)}</Text>
              </View>
            </View>

            {shot?.customFields && shot?.customFields.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Custom Fields</Text>
                {shot?.customFields.map((field, index) => (
                  <View key={index} style={styles.infoRow}>
                    <Text style={styles.label}>{field.key}:</Text>
                    <Text style={styles.value}>{field.value}</Text>
                  </View>
                ))}
              </View>
            )}

            {shot?.machine && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Machine</Text>
                <Text style={styles.value}>
                  {shot?.machine.brandName} {shot?.machine.model}
                </Text>
              </View>
            )}

            {shot?.grinder && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Grinder</Text>
                <Text style={styles.value}>
                  {shot?.grinder.brandName} {shot?.grinder.model}
                </Text>
              </View>
            )}

            {shot?.beans && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Beans</Text>
                <Text style={styles.value}>
                  {shot?.beans.roastery} - {shot?.beans.bean}
                </Text>
              </View>
            )}


          </ScrollView>

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Close</Text>
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
  scrollContent: {
    maxHeight: '80%',
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  date: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  section: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  label: {
    fontSize: 16,
    color: '#666',
    flex: 1,
  },
  value: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
    flex: 2,
  },
  closeButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
