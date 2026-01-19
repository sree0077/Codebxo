import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../hooks/useAuth';
import { SCREENS } from '../utils/constants';
import { getAllUsers } from '../services/firebase';

const AdminDashboardScreen = () => {
    const navigation = useNavigation();
    const { user, logout } = useAuth();
    const [stats, setStats] = useState({ totalUsers: 0, totalClients: 0 });
    const [isLoading, setIsLoading] = useState(false);

    const fetchStats = async () => {
        setIsLoading(true);
        try {
            const usersResult = await getAllUsers();
            if (usersResult.success) {
                setStats({
                    totalUsers: usersResult.users.length,
                    totalClients: '...', // Would require a separate global client count call
                });
            }
        } catch (error) {
            console.error('Error fetching admin stats:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    const handleManageUsers = () => {
        navigation.navigate(SCREENS.USER_MANAGEMENT);
    };

    const handleViewAllData = () => {
        navigation.navigate(SCREENS.CLIENT_LIST);
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl refreshing={isLoading} onRefresh={fetchStats} />
                }
            >
                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.title}>Admin Panel</Text>
                        <Text style={styles.subtitle}>Welcome, {user?.displayName}</Text>
                    </View>
                    <TouchableOpacity onPress={logout} style={styles.logoutButton}>
                        <Text style={styles.logoutText}>Logout</Text>
                    </TouchableOpacity>
                </View>

                {/* Stats Grid */}
                <View style={styles.statsGrid}>
                    <View style={[styles.statCard, { backgroundColor: '#7f68ea' }]}>
                        <Text style={styles.statLabel}>Total Users</Text>
                        <Text style={styles.statValue}>{stats.totalUsers}</Text>
                    </View>
                    <View style={[styles.statCard, { backgroundColor: '#3f4555' }]}>
                        <Text style={styles.statLabel}>System Health</Text>
                        <Text style={styles.statValue}>Optimal</Text>
                    </View>
                </View>

                {/* Quick Actions */}
                <Text style={styles.sectionTitle}>Quick Actions</Text>
                <TouchableOpacity style={styles.actionButton} onPress={handleManageUsers}>
                    <View style={styles.actionIconContainer}>
                        <Text style={styles.actionIcon}>👥</Text>
                    </View>
                    <View>
                        <Text style={styles.actionTitle}>Manage Users</Text>
                        <Text style={styles.actionSubtitle}>Create, edit and remove accounts</Text>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionButton} onPress={handleViewAllData}>
                    <View style={styles.actionIconContainer}>
                        <Text style={styles.actionIcon}>📂</Text>
                    </View>
                    <View>
                        <Text style={styles.actionTitle}>Global Client Data</Text>
                        <Text style={styles.actionSubtitle}>View and manage all client records</Text>
                    </View>
                </TouchableOpacity>

                {/* System Info */}
                <View style={styles.infoBox}>
                    <Text style={styles.infoText}>
                        You are logged in with Administrative privileges. All data actions are logged for security purposes.
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#eceff8',
    },
    scrollContent: {
        padding: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 30,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#2a2e3a',
    },
    subtitle: {
        fontSize: 16,
        color: '#7c85a0',
    },
    logoutButton: {
        padding: 10,
        backgroundColor: '#ffffff',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#d4d9e8',
    },
    logoutText: {
        color: '#ef4444',
        fontWeight: '600',
    },
    statsGrid: {
        flexDirection: 'row',
        gap: 15,
        marginBottom: 30,
    },
    statCard: {
        flex: 1,
        padding: 20,
        borderRadius: 16,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    statLabel: {
        color: 'rgba(255, 255, 255, 0.8)',
        fontSize: 14,
        marginBottom: 5,
    },
    statValue: {
        color: '#ffffff',
        fontSize: 24,
        fontWeight: 'bold',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2a2e3a',
        marginBottom: 15,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        padding: 15,
        borderRadius: 12,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#eceff8',
    },
    actionIconContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#f0eeff',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    actionIcon: {
        fontSize: 24,
    },
    actionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#2a2e3a',
    },
    actionSubtitle: {
        fontSize: 13,
        color: '#7c85a0',
    },
    infoBox: {
        marginTop: 20,
        padding: 15,
        backgroundColor: '#fef3c7',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#fde68a',
    },
    infoText: {
        color: '#92400e',
        fontSize: 12,
        textAlign: 'center',
        lineHeight: 18,
    },
});

export default AdminDashboardScreen;
