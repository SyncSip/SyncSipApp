import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  FlatList
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/components/AuthContext';
import { machinesApi } from '@/api/machines';
import { grindersApi } from '@/api/grinders';
import { beansApi } from '@/api/beans';
import { ReadMachineDto, ReadGrinderDto, ReadBeanDto } from '@/api/generated';

type TabType = 'machines' | 'grinders' | 'beans';

export default function EquipmentScreen() {
  const [activeTab, setActiveTab] = useState<TabType>('machines');
  const [brandName, setBrandName] = useState('');
  const [model, setModel] = useState('');
  const [roastery, setRoastery] = useState('');
  const [bean, setBean] = useState('');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [machines, setMachines] = useState<ReadMachineDto[]>([]);
  const [grinders, setGrinders] = useState<ReadGrinderDto[]>([]);
  const [beans, setBeans] = useState<ReadBeanDto[]>([]);

  const { isAuthenticated, userId } = useAuth();

  useEffect(() => {
    if (isAuthenticated && userId) {
      fetchData();
    }
  }, [isAuthenticated, userId]);

  const fetchData = async () => {
    if (!isAuthenticated || !userId) return;
    
    setLoading(true);
    try {
      const [machinesData, grindersData, beansData] = await Promise.all([
        machinesApi.getAll(userId),
        grindersApi.getAll(userId),
        beansApi.getAll(userId),
      ]);
      
      setMachines(machinesData);
      setGrinders(grindersData);
      setBeans(beansData);
    } catch (error) {
      console.error('Error fetching data:', error);
      Alert.alert('Error', 'Failed to load your equipment. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const resetForm = () => {
    setBrandName('');
    setModel('');
    setRoastery('');
    setBean('');
  };

  const handleAddMachine = async () => {
    if (!isAuthenticated || !userId) {
      Alert.alert('Error', 'You must be logged in to add a machine.');
      return;
    }

    if (!brandName || !model) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    setLoading(true);
    try {
      await machinesApi.create({
        brandName,
        model,
        userId,
      });
      
      resetForm();
      fetchData();
    } catch (error) {
      console.error('Error adding machine:', error);
      Alert.alert('Error', 'Failed to add machine. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddGrinder = async () => {
    if (!isAuthenticated || !userId) {
      Alert.alert('Error', 'You must be logged in to add a grinder.');
      return;
    }

    if (!brandName || !model) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    setLoading(true);
    try {
      await grindersApi.create({
        brandName,
        model,
        userId,
      });
      
      resetForm();
      fetchData();
    } catch (error) {
      console.error('Error adding grinder:', error);
      Alert.alert('Error', 'Failed to add grinder. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddBean = async () => {
    if (!isAuthenticated || !userId) {
      Alert.alert('Error', 'You must be logged in to add beans.');
      return;
    }

    if (!roastery || !bean) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    setLoading(true);
    try {
      await beansApi.create({
        roastery,
        bean,
        userId,
      });
      
      resetForm();
      fetchData();
    } catch (error) {
      console.error('Error adding beans:', error);
      Alert.alert('Error', 'Failed to add beans. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMachine = async (id: string) => {
    try {
      await machinesApi.delete(id);
      setMachines(machines.filter(machine => machine.id !== id));
    } catch (error) {
      console.error('Error deleting machine:', error);
      Alert.alert('Error', 'Failed to delete machine. Please try again.');
    }
  };

  const handleDeleteGrinder = async (id: string) => {
    try {
      await grindersApi.delete(id);
      setGrinders(grinders.filter(grinder => grinder.id !== id));
    } catch (error) {
      console.error('Error deleting grinder:', error);
      Alert.alert('Error', 'Failed to delete grinder. Please try again.');
    }
  };

  const handleDeleteBean = async (id: string) => {
    try {
      await beansApi.delete(id);
      setBeans(beans.filter(bean => bean.id !== id));
    } catch (error) {
      console.error('Error deleting beans:', error);
      Alert.alert('Error', 'Failed to delete beans. Please try again.');
    }
  };

  const renderMachineItem = ({ item }: { item: ReadMachineDto }) => (
    <View style={styles.itemContainer}>
      <View style={styles.itemContent}>
        <Text style={styles.itemTitle}>{item.brandName}</Text>
        <Text style={styles.itemSubtitle}>{item.model}</Text>
      </View>
      <TouchableOpacity 
        style={styles.deleteButton}
        onPress={() => {
          Alert.alert(
            'Delete Machine',
            `Are you sure you want to delete ${item.brandName} ${item.model}?`,
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Delete', onPress: () => handleDeleteMachine(item.id), style: 'destructive' }
            ]
          );
        }}
      >
        <Text style={styles.deleteButtonText}>Delete</Text>
      </TouchableOpacity>
    </View>
  );

  const renderGrinderItem = ({ item }: { item: ReadGrinderDto }) => (
    <View style={styles.itemContainer}>
      <View style={styles.itemContent}>
        <Text style={styles.itemTitle}>{item.brandName}</Text>
        <Text style={styles.itemSubtitle}>{item.model}</Text>
      </View>
      <TouchableOpacity 
        style={styles.deleteButton}
        onPress={() => {
          Alert.alert(
            'Delete Grinder',
            `Are you sure you want to delete ${item.brandName} ${item.model}?`,
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Delete', onPress: () => handleDeleteGrinder(item.id), style: 'destructive' }
            ]
          );
        }}
      >
        <Text style={styles.deleteButtonText}>Delete</Text>
      </TouchableOpacity>
    </View>
  );

  const renderBeanItem = ({ item }: { item: ReadBeanDto }) => (
    <View style={styles.itemContainer}>
      <View style={styles.itemContent}>
        <Text style={styles.itemTitle}>{item.roastery}</Text>
        <Text style={styles.itemSubtitle}>{item.bean}</Text>
      </View>
      <TouchableOpacity 
        style={styles.deleteButton}
        onPress={() => {
          Alert.alert(
            'Delete Beans',
            `Are you sure you want to delete ${item.roastery} - ${item.bean}?`,
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Delete', onPress: () => handleDeleteBean(item.id), style: 'destructive' }
            ]
          );
        }}
      >
        <Text style={styles.deleteButtonText}>Delete</Text>
      </TouchableOpacity>
    </View>
  );

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centeredContainer}>
          <Text style={styles.messageText}>Please log in to manage your equipment</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'machines' && styles.activeTabButton]}
          onPress={() => setActiveTab('machines')}
        >
          <Text style={[styles.tabText, activeTab === 'machines' && styles.activeTabText]}>Machines</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'grinders' && styles.activeTabButton]}
          onPress={() => setActiveTab('grinders')}
        >
          <Text style={[styles.tabText, activeTab === 'grinders' && styles.activeTabText]}>Grinders</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'beans' && styles.activeTabButton]}
          onPress={() => setActiveTab('beans')}
        >
          <Text style={[styles.tabText, activeTab === 'beans' && styles.activeTabText]}>Beans</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.contentContainer}>
        <View style={styles.formContainer}>
          <Text style={styles.sectionTitle}>
            {activeTab === 'machines' ? 'Add a Machine' : 
             activeTab === 'grinders' ? 'Add a Grinder' : 'Add Beans'}
          </Text>

          {(activeTab === 'machines' || activeTab === 'grinders') && (
            <>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Brand Name</Text>
                <TextInput
                  style={styles.input}
                  value={brandName}
                  onChangeText={setBrandName}
                  placeholder="Enter brand name"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Model</Text>
                <TextInput
                  style={styles.input}
                  value={model}
                  onChangeText={setModel}
                  placeholder="Enter model name"
                />
              </View>
            </>
          )}

          {activeTab === 'beans' && (
            <>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Roastery</Text>
                <TextInput
                  style={styles.input}
                  value={roastery}
                  onChangeText={setRoastery}
                  placeholder="Enter roastery name"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Bean</Text>
                <TextInput
                  style={styles.input}
                  value={bean}
                  onChangeText={setBean}
                  placeholder="Enter bean name/type"
                />
              </View>
            </>
          )}

          <TouchableOpacity
            style={styles.addButton}
            onPress={
              activeTab === 'machines' ? handleAddMachine :
              activeTab === 'grinders' ? handleAddGrinder : handleAddBean
            }
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Text style={styles.addButtonText}>
                {activeTab === 'machines' ? 'Add Machine' :
                 activeTab === 'grinders' ? 'Add Grinder' : 'Add Beans'}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.listContainer}>
          <Text style={styles.sectionTitle}>
            {activeTab === 'machines' ? 'Your Machines' : 
             activeTab === 'grinders' ? 'Your Grinders' : 'Your Beans'}
          </Text>

          {activeTab === 'machines' && (
            machines.length > 0 ? (
              <FlatList
                data={machines}
                renderItem={renderMachineItem}
                keyExtractor={(item) => `machine-${item.id}`}
                scrollEnabled={false}
                ListEmptyComponent={
                  <Text style={styles.emptyText}>No machines added yet</Text>
                }
              />
            ) : (
              <Text style={styles.emptyText}>No machines added yet</Text>
            )
          )}

          {activeTab === 'grinders' && (
            grinders.length > 0 ? (
              <FlatList
                data={grinders}
                renderItem={renderGrinderItem}
                keyExtractor={(item) => `grinder-${item.id}`}
                scrollEnabled={false}
                ListEmptyComponent={
                  <Text style={styles.emptyText}>No grinders added yet</Text>
                }
              />
            ) : (
              <Text style={styles.emptyText}>No grinders added yet</Text>
            )
          )}

          {activeTab === 'beans' && (
            beans.length > 0 ? (
              <FlatList
                data={beans}
                renderItem={renderBeanItem}
                keyExtractor={(item) => `bean-${item.id}`}
                scrollEnabled={false}
                ListEmptyComponent={
                  <Text style={styles.emptyText}>No beans added yet</Text>
                }
              />
            ) : (
              <Text style={styles.emptyText}>No beans added yet</Text>
            )
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#f5f5f5',
    },
    centeredContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    messageText: {
      fontSize: 16,
      color: '#666',
      textAlign: 'center',
    },
    tabContainer: {
      flexDirection: 'row',
      backgroundColor: 'white',
      borderBottomWidth: 1,
      borderBottomColor: '#e0e0e0',
    },
    tabButton: {
      flex: 1,
      paddingVertical: 12,
      alignItems: 'center',
    },
    activeTabButton: {
      borderBottomWidth: 2,
      borderBottomColor: '#007AFF',
    },
    tabText: {
      fontSize: 16,
      color: '#666',
    },
    activeTabText: {
      color: '#007AFF',
      fontWeight: '600',
    },
    contentContainer: {
      flex: 1,
      padding: 16,
    },
    formContainer: {
      backgroundColor: 'white',
      borderRadius: 12,
      padding: 16,
      marginBottom: 20,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 3.84,
      elevation: 5,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      marginBottom: 16,
      color: '#333',
    },
    inputContainer: {
      marginBottom: 16,
    },
    label: {
      fontSize: 14,
      fontWeight: '500',
      color: '#666',
      marginBottom: 6,
    },
    input: {
      borderWidth: 1,
      borderColor: '#e0e0e0',
      borderRadius: 8,
      padding: 12,
      fontSize: 16,
      backgroundColor: '#f9f9f9',
    },
    addButton: {
      borderRadius: 8,
      padding: 14,
      alignItems: 'center',
      marginTop: 8,
    },
    addButtonText: {
      color: '#007AFF',
      fontSize: 17,
      fontWeight: '400',
    },
    listContainer: {
      backgroundColor: 'white',
      borderRadius: 12,
      padding: 16,
      marginBottom: 20,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 3.84,
      elevation: 5,
    },
    itemContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: '#f0f0f0',
    },
    itemContent: {
      flex: 1,
    },
    itemTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: '#333',
    },
    itemSubtitle: {
      fontSize: 14,
      color: '#666',
      marginTop: 2,
    },
    deleteButton: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 6,
    },
    deleteButtonText: {
      color: 'red', 
      fontSize: 17,
      fontWeight: '400',
    },
    emptyText: {
      fontSize: 14,
      color: '#999',
      fontStyle: 'italic',
      textAlign: 'center',
      marginTop: 20,
      marginBottom: 20,
    },
  });
  