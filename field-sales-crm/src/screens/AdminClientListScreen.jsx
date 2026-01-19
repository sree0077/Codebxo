import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, FlatList, RefreshControl, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { SearchBar, LoadingSpinner, EmptyState } from '../components/common';
import { ClientCard } from '../components/client';
import { useClients } from '../hooks/useClients';
import { getAllUsers } from '../services/firebase';
import { SCREENS } from '../utils/constants';

const AdminClientListScreen = () => {
    const navigation = useNavigation();
    const {
        filteredClients,
        isLoading,
        searchQuery,
        updateSearchQuery,
        loadAllClients,
        selectClient,
    } = useClients();

    const [usersMap, setUsersMap] = useState({});

    useEffect(() => {
        loadAllClients();
        fetchUsers();
    }, [loadAllClients]);

    const fetchUsers = async () => {
        const result = await getAllUsers();
        if (result.success) {
            const map = {};
            result.users.forEach(u => {
                map[u.id] = u.email;
            });
            setUsersMap(map);
        }
    };

    const handleClientPress = useCallback((client) => {
        selectClient(client);
        navigation.navigate(SCREENS.ADMIN_CLIENT_DETAIL, { clientId: client.id });
    }, [navigation, selectClient]);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Global Client Data</Text>
                <Text style={styles.subtitle}>{filteredClients.length} records total</Text>
            </View>

            <SearchBar
                value={searchQuery}
                onChangeText={updateSearchQuery}
                placeholder="Search all clients..."
            />

            {isLoading && filteredClients.length === 0 ? (
                <LoadingSpinner />
            ) : (
                <FlatList
                    data={filteredClients}
                    renderItem={({ item }) => (
                        <ClientCard
                            client={item}
                            onPress={() => handleClientPress(item)}
                            creatorEmailOverride={usersMap[item.userId]}
                        />
                    )}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl refreshing={isLoading} onRefresh={loadAllClients} />
                    }
                    ListEmptyComponent={
                        <EmptyState
                            title="No clients found"
                            message="All organization records will appear here."
                        />
                    }
                />
            )}
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
        paddingHorizontal: 20,
        paddingVertical: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#eceff8',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#2a2e3a',
    },
    subtitle: {
        fontSize: 14,
        color: '#7c85a0',
        marginTop: 4,
    },
    listContent: {
        padding: 16,
    },
});

export default AdminClientListScreen;
