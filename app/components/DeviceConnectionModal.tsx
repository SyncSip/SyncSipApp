import React, { FC, useCallback } from "react";
import {
  FlatList,
  ListRenderItemInfo,
  Modal,
  SafeAreaView,
  Text,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { Device } from "react-native-ble-plx";

type SensorType = 'pressure' | 'scale';

type DeviceModalListItemProps = {
  item: ListRenderItemInfo<Device>;
  connectToPeripheral: (device: Device) => void;
  closeModal: () => void;
};

type DeviceModalProps = {
  devices: Device[];
  visible: boolean;
  connectToPeripheral: (device: Device) => void;
  closeModal: () => void;
  sensorType: SensorType;
};

const DeviceModalListItem: FC<DeviceModalListItemProps> = (props) => {
  const { item, connectToPeripheral, closeModal } = props;

  const connectAndCloseModal = useCallback(() => {
    console.log("Attempting to connect to:", item.item.name)
    connectToPeripheral(item.item);
    closeModal();
  }, [closeModal, connectToPeripheral, item.item]);

  return (
    <TouchableOpacity
      onPress={connectAndCloseModal}
      style={modalStyle.deviceItem}
    >
      <Text style={modalStyle.deviceName}>
        {item.item.name || 'Unknown Device'}
      </Text>
      <Text style={modalStyle.deviceId}>{item.item.id}</Text>
    </TouchableOpacity>
  );
};

const DeviceModal: FC<DeviceModalProps> = (props) => {
  const { devices, visible, connectToPeripheral, closeModal, sensorType } = props;

  const renderDeviceModalListItem = useCallback(
    (item: ListRenderItemInfo<Device>) => {
      return (
        <DeviceModalListItem
          item={item}
          connectToPeripheral={connectToPeripheral}
          closeModal={closeModal}
        />
      );
    },
    [closeModal, connectToPeripheral]
  );

  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={visible}
    >
      <SafeAreaView style={modalStyle.container}>
        <View style={modalStyle.header}>
          <TouchableOpacity
            onPress={closeModal}
            style={modalStyle.cancelButton}
          >
            <Text style={modalStyle.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={modalStyle.title}>
            Select {sensorType === 'pressure' ? 'Pressure Sensor' : 'Scale'}
          </Text>
          <View style={modalStyle.rightPlaceholder} />
        </View>
        
        {devices.length > 0 ? (
          <FlatList
            contentContainerStyle={modalStyle.listContainer}
            data={devices}
            renderItem={renderDeviceModalListItem}
            ItemSeparatorComponent={() => <View style={modalStyle.separator} />}
          />
        ) : (
          <View style={modalStyle.emptyContainer}>
            <Text style={modalStyle.emptyText}>Scanning for devices...</Text>
          </View>
        )}
      </SafeAreaView>
    </Modal>
  );
};

const modalStyle = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7', // iOS background color
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#C6C6C8', // iOS light gray border
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    textAlign: 'center',
    flex: 1,
  },
  cancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  cancelButtonText: {
    color: '#007AFF', // iOS blue
    fontSize: 17,
    fontWeight: '400',
  },
  rightPlaceholder: {
    width: 60, // Balance the cancel button on the left
  },
  listContainer: {
    backgroundColor: 'white',
    marginTop: 20,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#C6C6C8', // iOS light gray border
  },
  deviceItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'white',
  },
  deviceName: {
    fontSize: 17,
    fontWeight: '400',
    color: '#000',
  },
  deviceId: {
    fontSize: 14,
    color: '#8E8E93', // iOS gray
    marginTop: 4,
  },
  separator: {
    height: 1,
    backgroundColor: '#C6C6C8', // iOS light gray border
    marginLeft: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 17,
    color: '#8E8E93', // iOS gray
    textAlign: 'center',
  },
});

export default DeviceModal;
