import React, { useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { SearchBar, LoadingSpinner, EmptyState } from '../components/common';
import { ClientCard } from '../components/client';
import { useClients } from '../hooks/useClients';
import { useAuth } from '../hooks/useAuth';
import { SCREENS } from '../utils/constants';

const ClientListScreen = () => {
  const navigation = useNavigation();
  const { user, logout } = useAuth();
  const {
    filteredClients,
    isLoading,
    searchQuery,
    updateSearchQuery,
    refreshClients,
    selectClient,
  } = useClients();

  const handleClientPress = useCallback((client) => {
    selectClient(client);
    navigation.navigate(SCREENS.CLIENT_DETAIL, { clientId: client.id });
  }, [navigation, selectClient]);

  const handleAddClient = useCallback(() => {
    navigation.navigate(SCREENS.ADD_CLIENT);
  }, [navigation]);

  const handleMapView = useCallback(() => {
    navigation.navigate(SCREENS.MAP_VIEW);
  }, [navigation]);

  const renderClient = useCallback(({ item }) => (
    <ClientCard
      client={item}
      onPress={() => handleClientPress(item)}
    />
  ), [handleClientPress]);

  const keyExtractor = useCallback((item) => item.id, []);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.headerLeft}>
            <Text style={styles.title}>Clients</Text>
            <Text style={styles.subtitle}>
              Welcome, {user?.displayName || 'User'}
            </Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity
              onPress={logout}
              style={styles.logoutButton}
            >
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Bar */}
        <SearchBar
          value={searchQuery}
          onChangeText={updateSearchQuery}
          placeholder="Search clients..."
          onClear={() => updateSearchQuery('')}
        />

        {/* Map View Button */}
        <TouchableOpacity
          onPress={handleMapView}
          style={styles.mapViewButton}
        >
          <Text style={styles.mapViewIcon}>🗺️</Text>
          <Text style={styles.mapViewText}>Map View</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {isLoading && filteredClients.length === 0 ? (
        <LoadingSpinner fullScreen message="Loading clients..." />
      ) : (
        <FlatList
          data={filteredClients}
          renderItem={renderClient}
          keyExtractor={keyExtractor}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isLoading} onRefresh={refreshClients} />
          }
          ListEmptyComponent={
            <EmptyState
              icon="👥"
              title="No clients yet"
              message="Start by adding your first client to manage your sales pipeline."
              actionTitle="Add Client"
              onAction={handleAddClient}
            />
          }
        />
      )}

      {/* FAB - Add Client */}
      <TouchableOpacity
        onPress={handleAddClient}
        style={styles.fab}
        activeOpacity={0.8}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eceff8',
  },
  header: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eceff8',
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    alignItems: 'flex-end',
    gap: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2a2e3a',
  },
  subtitle: {
    color: '#7c85a0',
    fontSize: 14,
  },
  logoutButton: {
    backgroundColor: '#eceff8',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 4,
  },
  logoutText: {
    color: '#5a6278',
  },
  mapViewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#7f68ea',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 12,
    gap: 8,
  },
  mapViewIcon: {
    fontSize: 18,
  },
  mapViewText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
    flexGrow: 1,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    backgroundColor: '#7f68ea',
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabText: {
    color: '#ffffff',
    fontSize: 24,
  },
});

export default ClientListScreen;

