// src/components/FilterModal.tsx
import React, { useState } from 'react';
import {
  View,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  ScrollView,
  Switch,
} from 'react-native';
import { ReadShotDto } from '@/api/generated';
import { MaterialIcons } from '@expo/vector-icons';

type FilterCategory = 'machines' | 'grinders' | 'beans';

export type FilterOptions = {
  onlyStarred: boolean;
  machines: string[];
  grinders: string[];
  beans: string[];
  timeRange: {
    min: number;
    max: number;
  };
};

type FilterModalProps = {
  visible: boolean;
  onClose: () => void;
  onApplyFilters: (filters: FilterOptions) => void;
  shots: ReadShotDto[];
  currentFilters: FilterOptions;
};

type CollapsibleSectionProps = {
  title: string;
  items: string[];
  selectedItems: string[];
  onToggleItem: (item: string) => void;
};

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  items,
  selectedItems,
  onToggleItem,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <View style={styles.filterSection}>
      <TouchableOpacity 
        style={styles.sectionHeader}
        onPress={() => setIsExpanded(!isExpanded)}
      >
        <Text style={styles.sectionTitle}>{title}</Text>
        <MaterialIcons 
          name={isExpanded ? 'keyboard-arrow-up' : 'keyboard-arrow-down'} 
          size={24} 
          color="#333"
        />
      </TouchableOpacity>
      
      {isExpanded && (
        <View style={styles.checkboxList}>
          {items.map((item) => (
            <TouchableOpacity
              key={item}
              style={styles.checkboxItem}
              onPress={() => onToggleItem(item)}
            >
              <View style={styles.checkboxRow}>
                <View style={[
                  styles.checkbox,
                  selectedItems.includes(item) && styles.checkboxSelected
                ]}>
                  {selectedItems.includes(item) && (
                    <MaterialIcons name="check" size={16} color="white" />
                  )}
                </View>
                <Text style={styles.checkboxLabel}>{item}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

export default function FilterModal({
  visible,
  onClose,
  onApplyFilters,
  shots,
  currentFilters,
}: FilterModalProps) {
  const [filters, setFilters] = useState<FilterOptions>(currentFilters);

  // Extract unique values from shots
  const uniqueMachines = [...new Set(shots
    .map(s => s.machine ? `${s.machine.brandName} ${s.machine.model}` : null)
    .filter(Boolean) as string[])];

  const uniqueGrinders = [...new Set(shots
    .map(s => s.grinder ? `${s.grinder.brandName} ${s.grinder.model}` : null)
    .filter(Boolean) as string[])];

  const uniqueBeans = [...new Set(shots
    .map(s => s.beans ? `${s.beans.roastery} ${s.beans.bean}` : null)
    .filter(Boolean) as string[])];

  const handleApply = () => {
    onApplyFilters(filters);
    onClose();
  };

  const handleReset = () => {
    setFilters({
      onlyStarred: false,
      machines: [],
      grinders: [],
      beans: [],
      timeRange: { min: 0, max: 100 },
    });
  };

  const toggleItem = (category: FilterCategory, item: string) => {
    setFilters(prev => ({
      ...prev,
      [category]: prev[category].includes(item)
        ? prev[category].filter((i: string) => i !== item)
        : [...prev[category], item],
    }));
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
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Filter Shots</Text>
            <TouchableOpacity onPress={handleReset}>
              <Text style={styles.resetText}>Reset</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.scrollContent}>
            <View style={styles.filterSection}>
              <View style={styles.starredRow}>
                <Text style={styles.sectionTitle}>Show Only Starred</Text>
                <Switch
                  value={filters.onlyStarred}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, onlyStarred: value }))}
                />
              </View>
            </View>

            <CollapsibleSection
              title="Machines"
              items={uniqueMachines}
              selectedItems={filters.machines}
              onToggleItem={(item) => toggleItem('machines', item)}
            />

            <CollapsibleSection
              title="Grinders"
              items={uniqueGrinders}
              selectedItems={filters.grinders}
              onToggleItem={(item) => toggleItem('grinders', item)}
            />

            <CollapsibleSection
              title="Beans"
              items={uniqueBeans}
              selectedItems={filters.beans}
              onToggleItem={(item) => toggleItem('beans', item)}
            />
          </ScrollView>

          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[styles.button, styles.cancelButton]} 
              onPress={onClose}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.button, styles.applyButton]} 
              onPress={handleApply}
            >
              <Text style={[styles.buttonText, styles.applyButtonText]}>Apply</Text>
            </TouchableOpacity>
          </View>
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
    maxHeight: '80%',
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
  resetText: {
    color: '#007AFF',
    fontSize: 16,
  },
  scrollContent: {
    maxHeight: '80%',
  },
  filterSection: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  starredRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  checkboxList: {
    marginTop: 10,
  },
  checkboxItem: {
    paddingVertical: 8,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#ccc',
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#333',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f2f2f2',
  },
  applyButton: {
    backgroundColor: '#007AFF',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  applyButtonText: {
    color: 'white',
  },
});
