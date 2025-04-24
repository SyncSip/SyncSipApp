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
import { Animated } from 'react-native';

const ToggleSwitch = ({ value, onValueChange, disabled = false }) => {
  const [animation] = useState(new Animated.Value(value ? 1 : 0));

  useEffect(() => {
    Animated.timing(animation, {
      toValue: value ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [value]);

  const handleToggle = () => {
    if (disabled) return;
    onValueChange(!value);
  };

  const backgroundColorInterpolation = animation.interpolate({
    inputRange: [0, 1],
    outputRange: ['#e9e9ea', '#34c759']
  });

  const circlePositionInterpolation = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [2, 22]
  });

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={handleToggle}
      disabled={disabled}
    >
      <Animated.View 
        style={[
          styles.toggleTrack, 
          { backgroundColor: backgroundColorInterpolation },
          disabled && styles.toggleDisabled
        ]}
      >
        <Animated.View 
          style={[
            styles.toggleThumb,
            { left: circlePositionInterpolation }
          ]} 
        />
      </Animated.View>
    </TouchableOpacity>
  );
};


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

const [altitudeInMeters, setAltitudeInMeters] = useState('');
const [roastDate, setRoastDate] = useState('');
const [process, setProcess] = useState('');
const [genetic, setGenetic] = useState('');
const [variety, setVariety] = useState('');
const [origin, setOrigin] = useState('');
const [customFields, setCustomFields] = useState<{key: string, value: string}[]>([]);
const [showAdditionalFields, setShowAdditionalFields] = useState(false);
const [activeBeans, setActiveBeans] = useState<Record<string, boolean>>({});




  const { isAuthenticated, userId } = useAuth();


useEffect(() => {
  if (beans.length > 0) {
    const initialActiveState: Record<string, boolean> = {};
    beans.forEach(bean => {

      initialActiveState[bean.id] = bean.full
    });
    setActiveBeans(initialActiveState);
  }
}, [beans]);


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
    setAltitudeInMeters('');
    setRoastDate('');
    setProcess('');
    setGenetic('');
    setVariety('');
    setOrigin('');
    setCustomFields([]);
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
      Alert.alert('Error', 'Please fill in all required fields.');
      return;
    }
  
    setLoading(true);
    try {
      await beansApi.create({
        roastery,
        bean,
        userId,
        altitudeInMeters: altitudeInMeters || undefined,
        roastDate: new Date(roastDate) || undefined,
        process: process || undefined,
        genetic: genetic || undefined,
        variety: variety || undefined,
        origin: origin || undefined,
        customFields: customFields,
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

  const handleBeanStatusChange = async (id:string, status: boolean) => {
    try {
      setActiveBeans(prev => ({
        ...prev,
        [id]: status
      }));

      await beansApi.edit(id, {full: status})
    } catch (error) {
      setActiveBeans(prev => ({
        ...prev,
        [id]: !status
      }));
      console.error("Error deleting beans: ", error)
      Alert.alert('Error', "Failed to change the status of the Bean. Please try again")
    }
  }

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

  const [expandedBeans, setExpandedBeans] = useState<Set<string>>(new Set());

  const toggleBeanDetails = (beanId: string) => {
    const newExpanded = new Set(expandedBeans);
    if (newExpanded.has(beanId)) {
      newExpanded.delete(beanId);
    } else {
      newExpanded.add(beanId);
    }
    setExpandedBeans(newExpanded);
  };
  
  const renderBeanItem = ({ item }: { item: ReadBeanDto }) => {
    const isExpanded = expandedBeans.has(item.id);
    const isActive = activeBeans[item.id] !== undefined ? activeBeans[item.id] : true;
    
    return (
      <View style={styles.itemContainer}>
        <TouchableOpacity 
          style={styles.itemContent}
          onPress={() => toggleBeanDetails(item.id)}
        >
          <View style={styles.itemHeader}>
            <View>
              <Text style={[styles.itemTitle, !isActive && styles.inactiveText]}>
                {item.roastery}
              </Text>
              <Text style={[styles.itemSubtitle, !isActive && styles.inactiveText]}>
                {item.bean}
              </Text>
            </View>
            <View style={styles.itemControls}>
              <ToggleSwitch
                value={isActive}
                onValueChange={(value) => handleBeanStatusChange(item.id, value)}
              />
              <Text style={styles.expandIcon}>{isExpanded ? '▲' : '▼'}</Text>
            </View>
          </View>
          
          {isExpanded && (
            <View style={styles.expandedDetails}>
              {item.origin && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Origin:</Text>
                  <Text style={styles.detailValue}>{item.origin}</Text>
                </View>
              )}
              {item.variety && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Variety:</Text>
                  <Text style={styles.detailValue}>{item.variety}</Text>
                </View>
              )}
              {item.process && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Process:</Text>
                  <Text style={styles.detailValue}>{item.process}</Text>
                </View>
              )}
              {item.genetic && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Genetic:</Text>
                  <Text style={styles.detailValue}>{item.genetic}</Text>
                </View>
              )}
              {item.altitudeInMeters && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Altitude:</Text>
                  <Text style={styles.detailValue}>{item.altitudeInMeters}m</Text>
                </View>
              )}
              {item.roastDate && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Roast Date:</Text>
                  <Text style={styles.detailValue}>{item.roastDate.toString()}</Text>
                </View>
              )}
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Status:</Text>
                <Text style={styles.detailValue}>{isActive ? 'Active' : 'Inactive'}</Text>
              </View>
              
              {/* Delete button moved inside expanded details */}
              <TouchableOpacity 
                style={styles.deleteButtonInDropdown}
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
          )}
        </TouchableOpacity>
      </View>
    );
  };
  
  
  

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
                <Text style={styles.label}>Roastery <Text style={styles.requiredField}>*</Text></Text>
                <TextInput
                  style={styles.input}
                  value={roastery}
                  onChangeText={setRoastery}
                  placeholder="Enter roastery name"
                />
              </View>
  
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Bean <Text style={styles.requiredField}>*</Text></Text>
                <TextInput
                  style={styles.input}
                  value={bean}
                  onChangeText={setBean}
                  placeholder="Enter bean name/type"
                />
              </View>
              
              <TouchableOpacity 
                style={styles.dropdownToggle}
                onPress={() => setShowAdditionalFields(!showAdditionalFields)}
              >
                <Text style={styles.dropdownToggleText}>
                  {showAdditionalFields ? 'Hide Additional Details' : 'Show Additional Details'}
                </Text>
                <Text style={styles.dropdownIcon}>{showAdditionalFields ? '▲' : '▼'}</Text>
              </TouchableOpacity>
              
              {showAdditionalFields && (
                <View style={styles.additionalFieldsContainer}>
                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>Origin</Text>
                    <TextInput
                      style={styles.input}
                      value={origin}
                      onChangeText={setOrigin}
                      placeholder="Enter origin country (e.g., Kenya)"
                    />
                  </View>
                  
                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>Altitude (meters)</Text>
                    <TextInput
                      style={styles.input}
                      value={altitudeInMeters}
                      onChangeText={setAltitudeInMeters}
                      placeholder="Enter altitude in meters"
                      keyboardType="numeric"
                    />
                  </View>
                  
                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>Roast Date</Text>
                    <TextInput
                      style={styles.input}
                      value={roastDate}
                      onChangeText={setRoastDate}
                      placeholder="Enter roast date (e.g., 01.04.2025)"
                    />
                  </View>
                  
                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>Process</Text>
                    <TextInput
                      style={styles.input}
                      value={process}
                      onChangeText={setProcess}
                      placeholder="Enter process (e.g., Washed)"
                    />
                  </View>
                  
                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>Genetic</Text>
                    <TextInput
                      style={styles.input}
                      value={genetic}
                      onChangeText={setGenetic}
                      placeholder="Enter genetic (e.g., Arabica)"
                    />
                  </View>
                  
                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>Variety</Text>
                    <TextInput
                      style={styles.input}
                      value={variety}
                      onChangeText={setVariety}
                      placeholder="Enter variety (e.g., Maragogype)"
                    />
                  </View>
                  
                  <View style={styles.customFieldsContainer}>
                    <Text style={styles.label}>Custom Fields</Text>
                    
                    {customFields.map((field, index) => (
                      <View key={index} style={styles.customFieldRow}>
                        <TextInput
                          style={[styles.input, styles.customFieldInput]}
                          value={field.key}
                          onChangeText={(text) => {
                            const updatedFields = [...customFields];
                            updatedFields[index].key = text;
                            setCustomFields(updatedFields);
                          }}
                          placeholder="Key"
                        />
                        <TextInput
                          style={[styles.input, styles.customFieldInput]}
                          value={field.value}
                          onChangeText={(text) => {
                            const updatedFields = [...customFields];
                            updatedFields[index].value = text;
                            setCustomFields(updatedFields);
                          }}
                          placeholder="Value"
                        />
                        <TouchableOpacity
                          style={styles.removeFieldButton}
                          onPress={() => {
                            const updatedFields = customFields.filter((_, i) => i !== index);
                            setCustomFields(updatedFields);
                          }}
                        >
                          <Text style={styles.removeFieldButtonText}>×</Text>
                        </TouchableOpacity>
                      </View>
                    ))}
                    
                    <TouchableOpacity
                      style={styles.addFieldButton}
                      onPress={() => {
                        setCustomFields([...customFields, { key: '', value: '' }]);
                      }}
                    >
                      <Text style={styles.addFieldButtonText}>+ Add Custom Field</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
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
    requiredField: {
      color: '#FF3B30',
    },
    itemDetail: {
      fontSize: 12,
      color: '#888',
      marginTop: 2,
    },
    customFieldsContainer: {
      marginBottom: 16,
    },
    customFieldRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    customFieldInput: {
      flex: 1,
      marginRight: 8,
    },
    addFieldButton: {
      padding: 10,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: '#e0e0e0',
      borderRadius: 8,
      borderStyle: 'dashed',
      marginTop: 8,
    },
    addFieldButtonText: {
      color: '#007AFF',
      fontSize: 14,
    },
    removeFieldButton: {
      width: 30,
      height: 30,
      borderRadius: 15,
      backgroundColor: '#f0f0f0',
      justifyContent: 'center',
      alignItems: 'center',
    },
    removeFieldButtonText: {
      fontSize: 18,
      color: '#FF3B30',
    },
    dropdownToggle: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 12,
      backgroundColor: '#f0f0f0',
      borderRadius: 8,
      marginBottom: 16,
    },
    dropdownToggleText: {
      fontSize: 16,
      color: '#007AFF',
      fontWeight: '500',
    },
    dropdownIcon: {
      fontSize: 14,
      color: '#007AFF',
    },
    additionalFieldsContainer: {
      borderLeftWidth: 2,
      borderLeftColor: '#e0e0e0',
      paddingLeft: 12,
      marginLeft: 4,
    },
    itemHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    expandIcon: {
      fontSize: 12,
      color: '#999',
    },
    expandedDetails: {
      marginTop: 8,
      paddingTop: 8,
      borderTopWidth: 1,
      borderTopColor: '#f0f0f0',
    },
    detailRow: {
      flexDirection: 'row',
      marginBottom: 4,
    },
    detailLabel: {
      fontSize: 14,
      color: '#666',
      fontWeight: '500',
      width: 80,
    },
    detailValue: {
      fontSize: 14,
      color: '#333',
      flex: 1,
    },
    toggleTrack: {
      width: 51,
      height: 31,
      borderRadius: 31 / 2,
      paddingVertical: 2,
      marginRight: 10,
    },
    toggleThumb: {
      width: 27,
      height: 27,
      borderRadius: 27 / 2,
      backgroundColor: 'white',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 2,
      elevation: 2,
    },
    toggleDisabled: {
      opacity: 0.4,
    },
    itemControls: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    inactiveText: {
      color: '#999',
      textDecorationLine: 'line-through',
    },
    deleteButtonInDropdown: {
      alignSelf: 'flex-start',
      marginTop: 12,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 8,
    },
    deleteButton: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 6,
    },
    
  });
  