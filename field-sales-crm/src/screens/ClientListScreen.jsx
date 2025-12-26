import React, { useCallback } from 'react';
import { View, Text, SafeAreaView, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
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

  const renderClient = useCallback(({ item }) => (
    <ClientCard
      client={item}
      onPress={() => handleClientPress(item)}
    />
  ), [handleClientPress]);

  const keyExtractor = useCallback((item) => item.id, []);

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-4 py-4 border-b border-gray-100">
        <View className="flex-row items-center justify-between mb-4">
          <View>
            <Text className="text-2xl font-bold text-gray-800">Clients</Text>
            <Text className="text-gray-500 text-sm">
              Welcome, {user?.displayName || 'User'}
            </Text>
          </View>
          <TouchableOpacity
            onPress={logout}
            className="bg-gray-100 px-4 py-2 rounded-full"
          >
            <Text className="text-gray-600">Logout</Text>
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <SearchBar
          value={searchQuery}
          onChangeText={updateSearchQuery}
          placeholder="Search clients..."
          onClear={() => updateSearchQuery('')}
        />
      </View>

      {/* Content */}
      {isLoading && filteredClients.length === 0 ? (
        <LoadingSpinner fullScreen message="Loading clients..." />
      ) : (
        <FlatList
          data={filteredClients}
          renderItem={renderClient}
          keyExtractor={keyExtractor}
          contentContainerStyle={{ padding: 16, flexGrow: 1 }}
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
        className="absolute bottom-6 right-6 w-14 h-14 bg-blue-500 rounded-full items-center justify-center shadow-lg"
        activeOpacity={0.8}
      >
        <Text className="text-white text-2xl">+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default ClientListScreen;

