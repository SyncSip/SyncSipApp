import React, { useEffect, useState } from 'react';
import { 
  View, 
  FlatList, 
  StyleSheet, 
  Text, 
  ActivityIndicator, 
  RefreshControl, 
  Button,
  Modal,
  TouchableOpacity,
  Alert
} from 'react-native';
import { format } from 'date-fns';
import { CreateShotDto, EditShotDto, ReadBeanDto, ReadGrinderDto, ReadMachineDto, ReadShotDto } from '@/api/generated';
import { shotsApi } from '../../api/shots';
import { SafeAreaView } from 'react-native-safe-area-context';
import FilterModal, { FilterOptions } from '@/components/filterModal';
import AddShotModal from '@/components/AddShotModal';
import { grindersApi } from '@/api/grinders';
import { machinesApi } from '@/api/machines';
import { beansApi } from '@/api/beans';
import ShotDetailsModal from '@/components/ShotDetailsModal';
import LoginModal from '@/components/LoginModal';
import { useAuth } from '@/components/AuthContext';

type ShotListItemProps = {
  shot: ReadShotDto;
  onToggleStar: (id: string, starred: boolean) => void;
  onViewDetails: (shot: ReadShotDto) => void;
  onUseAsReference: (shot: ReadShotDto) => void;
  onEdit: (shot: ReadShotDto) => void
};

const ShotListItem = ({ shot, onToggleStar, onViewDetails, onUseAsReference, onEdit }: ShotListItemProps) => {
  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.date}>
          {format(new Date(shot.createdAt), 'MMM d, yyyy HH:mm')}
        </Text>
        <TouchableOpacity onPress={() => onToggleStar(shot.id, !shot.starred)}>
          <Text style={[styles.starred, !shot.starred && styles.unstarred]}>★</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.detailsContainer}>
        <View style={styles.detail}>
          <Text style={styles.label}>Bean</Text>
          <Text style={styles.value}>
            {shot.beans ? `${shot.beans.roastery} - ${shot.beans.bean}` : 'N/A'}
          </Text>
        </View>

        <View style={styles.detail}>
          <Text style={styles.label}>Machine</Text>
          <Text style={styles.value}>
            {shot.machine ? `${shot.machine.brandName} ${shot.machine.model}` : 'N/A'}
          </Text>
        </View>

        <View style={styles.detail}>
          <Text style={styles.label}>Grinder</Text>
          <Text style={styles.value}>
            {shot.grinder ? `${shot.grinder.brandName} ${shot.grinder.model}` : 'N/A'}
          </Text>
        </View>

        {shot.customFields && Array.isArray(shot.customFields) && shot.customFields.length > 0 ? (
  <View style={styles.customFieldsContainer}>
    <Text style={styles.customFieldsHeader}>Custom Fields:</Text>
    {shot.customFields.map((field, index) => (
      <View key={`custom-field-${index}`} style={styles.customFieldItem}>
        <Text style={styles.label}>
          {field && typeof field === 'object' && 'key' in field ? field.key : `Field ${index + 1}`}
        </Text>
        <Text style={styles.value}>
          {field && typeof field === 'object' && 'value' in field ? field.value : 'N/A'}
        </Text>
      </View>
    ))}
  </View>
) : null}


        <View style={styles.statsContainer}>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Time</Text>
            <Text style={styles.statValue}>{shot.time}s</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Weight</Text>
            <Text style={styles.statValue}>{shot.weight}g</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Dose</Text>
            <Text style={styles.statValue}>{shot.dose}g</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Ratio</Text>
            <Text style={styles.statValue}>1 : {((shot.weight / shot.dose)).toFixed(1)}</Text>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.button, styles.editButton]}
            onPress={() => onEdit(shot)}
          >
            <Text style={[styles.buttonText, styles.referenceButtonText]}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.button}
            onPress={() => onViewDetails(shot)}
          >
            <Text style={styles.buttonText}>Details</Text>
          </TouchableOpacity>
        </View>
          <TouchableOpacity 
            style={[styles.button, styles.referenceButton]}
            onPress={() => onUseAsReference(shot)}
          >
            <Text style={[styles.buttonText, styles.referenceButtonText]}>Use as Reference</Text>
          </TouchableOpacity>
      </View>
    </View>
  );
};

export default function ShotListScreen() {
  const [shots, setShots] = useState<ReadShotDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    onlyStarred: false,
    machines: [],
    grinders: [],
    beans: [],
    timeRange: { min: 0, max: 100 },
  });

  const [isDetailsModalVisible, setIsDetailsModalVisible] = useState<boolean>(false);
  const [selectedShot, setSelectedShot] = useState<ReadShotDto>();
  const [editShot, setEditShot] = useState<boolean>(false);

  const [addShotModalVisible, setAddShotModalVisible] = useState<boolean>(false);
  const [machines, setMachines] = useState<ReadMachineDto[]>([]);
  const [grinders, setGrinders] = useState<ReadGrinderDto[]>([]);
  const [beans, setBeans] = useState<ReadBeanDto[]>([]);
  
  const { isAuthenticated, userId, login, logout, loading: authLoading } = useAuth();
  
  const [isLoginModalVisible, setIsLoginModalVisible] = useState(!isAuthenticated && !authLoading);

  const handleLoginSuccess = async () => {
    setIsLoginModalVisible(false);
    handleRefresh();
  };

  const handleLogout = async () => {
    try {
      await logout();
      setShots([]);
      setMachines([]);
      setGrinders([]);
      setBeans([]);
      setIsLoginModalVisible(true);
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Error', 'Failed to log out. Please try again.');
    }
  };

  const fetchShots = async () => {
    if (!isAuthenticated || !userId) return;
    
    try {
      setError(null);
      const data = await shotsApi.getAll(userId);
      const sortedShots = data.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setShots(sortedShots);
    } catch (error) {
      setError('Failed to load shots. Please try again later.');
      console.error('Error fetching shots:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!isAuthenticated || !userId) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        const [shotsData, machinesData, grindersData, beansData] = await Promise.all([
          shotsApi.getAll(userId),
          machinesApi.getAll(userId),
          grindersApi.getAll(userId),
          beansApi.getAll(userId),
        ]);
  
        const sortedShots = shotsData.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setShots(sortedShots);
        setMachines(machinesData);
        setGrinders(grindersData);
        setBeans(beansData);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
  
    fetchData();
  }, [isAuthenticated, userId]);

  useEffect(() => {
    if (!authLoading) {
      setIsLoginModalVisible(!isAuthenticated);
    }
  }, [isAuthenticated, authLoading]);

  const handleRefresh = () => {
    if (!isAuthenticated || !userId) return;
    
    setRefreshing(true);
    const fetchData = async () => {
      try {
        const [shotsData, machinesData, grindersData, beansData] = await Promise.all([
          shotsApi.getAll(userId),
          machinesApi.getAll(userId),
          grindersApi.getAll(userId),
          beansApi.getAll(userId),
        ]);
  
        const sortedShots = shotsData.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setShots(sortedShots);
        setMachines(machinesData);
        setGrinders(grindersData);
        setBeans(beansData);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load data. Please try again later.');
      } finally {
        setRefreshing(false);
      }
    };
  
    fetchData();
  };

  const handleToggleStar = async (id: string, starred: boolean) => {
    if (!isAuthenticated || !userId) return;
    try {
      await shotsApi.edit(id, { starred });
      setShots(shots.map(shot => 
        shot.id === id ? { ...shot, starred } : shot
      ));
    } catch (error) {
      console.error('Error toggling star:', error);
    }
  };

  const onEdit = (shot: ReadShotDto) => {
    if (!isAuthenticated) {
      setIsLoginModalVisible(true);
      return;
    }
    
    setSelectedShot(shot);
    setEditShot(true);
    setTimeout(() => {
      setAddShotModalVisible(true);
    }, 0);
  };
  
  const handleCloseModal = () => {
    setAddShotModalVisible(false);
    setTimeout(() => {
      setEditShot(false);
      setSelectedShot(undefined);
    }, 300);
  };
  const handleViewDetails = (shot: ReadShotDto) => {
    setIsDetailsModalVisible(true);
    setSelectedShot(shot);
  };

  const handleUseAsReference = (shot: ReadShotDto) => {
    if (!isAuthenticated) {
      setIsLoginModalVisible(true);
      return;
    }
  };

  const getFilteredShots = () => {
    return shots.filter(shot => {
      if (filterOptions.onlyStarred && !shot.starred) {
        return false;
      }

      if (filterOptions.machines.length > 0) {
        const machineName = shot.machine ? `${shot.machine.brandName} ${shot.machine.model}` : '';
        if (!filterOptions.machines.includes(machineName)) {
          return false;
        }
      }

      if (filterOptions.grinders.length > 0) {
        const grinderName = shot.grinder ? `${shot.grinder.brandName} ${shot.grinder.model}` : '';
        if (!filterOptions.grinders.includes(grinderName)) {
          return false;
        }
      }

      if (filterOptions.beans.length > 0) {
        const beanName = shot.beans ? `${shot.beans.roastery} ${shot.beans.bean}` : '';
        if (!filterOptions.beans.includes(beanName)) {
          return false;
        }
      }

      return true;
    });
  };

  const handleSaveShot = async (shotData: CreateShotDto) => {
    if (!isAuthenticated || !userId) {
      setIsLoginModalVisible(true);
      return;
    }
    
    try {
      const newShot = await shotsApi.create({
        ...shotData,
        userId,
      });
      setShots(prev => [newShot, ...prev]);
      setAddShotModalVisible(false);
    } catch (error:any) {
      console.error('Server error:', error.response?.data || error);
      throw error;
    }
  };
  
  const handleEditShot = async (shotData: CreateShotDto, id: string) => {
    if (!isAuthenticated || !userId) {
      setIsLoginModalVisible(true);
      return;
    }
    
    try {
      const newShot = await shotsApi.edit(id, {
        ...shotData,
      });
      setShots(prev => [newShot, ...prev]);
      setAddShotModalVisible(false);
    } catch (error:any) {
      console.error('Server error:', error.response?.data || error);
      throw error;
    }
  };

  if (authLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Checking authentication...</Text>
      </View>
    );
  }

  if (loading && isAuthenticated) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading your shots...</Text>
      </View>
    );
  }

  if (error && isAuthenticated) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <Button title="Try Again" onPress={handleRefresh} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FilterModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onApplyFilters={setFilterOptions}
        shots={shots}
        currentFilters={filterOptions}
      />

      <LoginModal
        visible={isLoginModalVisible}
        onClose={() => setIsLoginModalVisible(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      <AddShotModal
        key={`modal-${selectedShot?.id || 'new'}-${Date.now()}`}
        visible={addShotModalVisible}
        onClose={handleCloseModal}
        onSave={handleSaveShot}
        machines={machines}
        grinders={grinders}
        beans={beans}
        edit={editShot}
        shot={selectedShot}
        handleEdit={handleEditShot}
      />

      <ShotDetailsModal
        visible={isDetailsModalVisible}
        onClose={() => setIsDetailsModalVisible(false)}
        shot={selectedShot}
      />

<View style={styles.header}>
  <View style={styles.headerLeft}>
    <Button 
      title="Filter" 
      onPress={() => setIsModalVisible(true)} 
      disabled={!isAuthenticated || shots.length === 0}
    />
  </View>
  
  <View style={styles.headerCenter}>
    {isAuthenticated ? (
      <Button 
        title="Logout" 
        onPress={handleLogout} 
        color="#ff6347"
      />
    ) : (
      <Button 
        title="Login" 
        onPress={() => setIsLoginModalVisible(true)} 
      />
    )}
  </View>
  
  <View style={styles.headerRight}>
    <Button 
      title="+" 
      onPress={() => isAuthenticated ? setAddShotModalVisible(true) : setIsLoginModalVisible(true)} 
    />
  </View>
</View>
      
      {isAuthenticated ? (
        <FlatList
          data={getFilteredShots()}
          keyExtractor={(item) => `shot-${item.id}-${Math.random()}`}
          renderItem={({ item }) => (
            <ShotListItem 
              shot={item} 
              onToggleStar={handleToggleStar}
              onViewDetails={handleViewDetails}
              onUseAsReference={handleUseAsReference}
              onEdit={onEdit}
            />
          )}
          contentContainerStyle={styles.listContainer}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
            />
          }
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No shots recorded yet</Text>
              <Button 
                title="Add Your First Shot" 
                onPress={() => setAddShotModalVisible(true)}
                style={styles.emptyButton}
              />
            </View>
          )}
        />
      ) : (
        <View style={styles.unauthenticatedContainer}>
          <Text style={styles.unauthenticatedText}>
            Please log in to view and manage your espresso shots
          </Text>
          <Button 
            title="Log In" 
            onPress={() => setIsLoginModalVisible(true)}
          />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: 16,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  date: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  starred: {
    fontSize: 24,
    color: '#FFD700',
  },
  unstarred: {
    color: '#ccc',
  },
  detailsContainer: {
    gap: 8,
  },
  detail: {
    marginBottom: 8,
  },
  label: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  value: {
    fontSize: 14,
    color: '#333',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  stat: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  separator: {
    height: 12,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    padding: 16,
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    color: '#666',
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    gap: 8,
  },
  button: {
    flex: 1,
    backgroundColor: '#acdae6',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  referenceButton: {
    backgroundColor: '#6F4E37',
  },
  editButton: {
    backgroundColor: '#c99b9d',
  },
  referenceButtonText: {
    color: 'white',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 0,
  },
  headerButtons: {
    position: 'absolute',
    right: 16,
    top: 0,
  },
  headerLeft: {
    flex: 1,
    alignItems: 'flex-start',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  unauthenticatedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  unauthenticatedText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  emptyButton: {
    marginTop: 20,
  },
  customFieldsContainer: {
    marginTop: 8,
    marginBottom: 8,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 8,
  },
  customFieldsHeader: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  customFieldItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  
});
