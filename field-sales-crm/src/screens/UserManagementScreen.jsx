import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, Modal, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getAllUsers, deleteUserAccount, registerUser, updateUserStatus } from '../services/firebase';
import { Button, Input, LoadingSpinner, Dropdown } from '../components/common';

const UserManagementScreen = () => {
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);

    // Form state
    const [newEmail, setNewEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [newRole, setNewRole] = useState('user');

    const fetchUsers = async () => {
        setIsLoading(true);
        const result = await getAllUsers();
        if (result.success) {
            setUsers(result.users);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleUpdateStatus = async (userId, status) => {
        setIsLoading(true);
        const result = await updateUserStatus(userId, status);
        if (result.success) {
            fetchUsers();
        } else {
            Alert.alert("Error", result.error);
        }
        setIsLoading(true);
    };

    const handleDeleteUser = (userId, email) => {
        Alert.alert(
            "Delete User",
            `Are you sure you want to delete ${email}?`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        const result = await deleteUserAccount(userId);
                        if (result.success) {
                            fetchUsers();
                        }
                    }
                }
            ]
        );
    };

    const handleCreateUser = async () => {
        if (!newEmail || !newPassword) return;
        setIsLoading(true);
        const result = await registerUser(newEmail, newPassword, newRole, 'approved');
        if (result.success) {
            setIsModalVisible(false);
            setNewEmail('');
            setNewPassword('');
            fetchUsers();
        } else {
            Alert.alert("Error", result.error);
        }
        setIsLoading(false);
    };

    const renderUser = ({ item }) => (
        <View style={styles.userCard}>
            <TouchableOpacity
                style={styles.userInfo}
                onPress={() => Alert.alert("User Details", `Email: ${item.email}\nRole: ${item.role || 'user'}\nStatus: ${item.status || 'approved'}`)}
            >
                <Text style={styles.userEmail}>{item.email}</Text>
                <View style={styles.roleContainer}>
                    <Text style={styles.userRole}>Role: {item.role || 'user'}</Text>
                    <View style={[styles.statusBadge, item.status === 'pending' ? styles.pendingBadge : item.status === 'rejected' ? styles.rejectedBadge : styles.approvedBadge]}>
                        <Text style={styles.statusText}>{item.status || 'approved'}</Text>
                    </View>
                </View>
            </TouchableOpacity>
            {item.status === 'pending' && (
                <View style={styles.approvalActions}>
                    <TouchableOpacity
                        onPress={() => handleUpdateStatus(item.id, 'approved')}
                        style={[styles.actionBtn, styles.approveBtn]}
                    >
                        <Text style={styles.actionBtnText}>✓</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => handleUpdateStatus(item.id, 'rejected')}
                        style={[styles.actionBtn, styles.rejectBtn]}
                    >
                        <Text style={styles.actionBtnText}>✗</Text>
                    </TouchableOpacity>
                </View>
            )}
            <TouchableOpacity
                onPress={() => handleDeleteUser(item.id, item.email)}
                style={styles.deleteButton}
            >
                <Text style={styles.deleteIcon}>🗑️</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            {isLoading && <LoadingSpinner fullScreen />}

            <View style={styles.header}>
                <Text style={styles.title}>Users</Text>
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => setIsModalVisible(true)}
                >
                    <Text style={styles.addButtonText}>+ Add User</Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={users}
                renderItem={renderUser}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={<Text style={styles.emptyText}>No users found.</Text>}
            />

            <Modal
                visible={isModalVisible}
                animationType="slide"
                transparent={true}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Create New Account</Text>
                        <Input
                            label="Email"
                            value={newEmail}
                            onChangeText={setNewEmail}
                            placeholder="user@example.com"
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                        <Input
                            label="Password"
                            value={newPassword}
                            onChangeText={setNewPassword}
                            placeholder="Minimum 6 characters"
                            secureTextEntry={true}
                        />
                        <Dropdown
                            label="Account Type"
                            value={newRole}
                            options={[
                                { label: 'User', value: 'user' },
                                { label: 'Admin', value: 'admin' },
                            ]}
                            onSelect={setNewRole}
                        />
                        <View style={styles.modalButtons}>
                            <Button
                                title="Cancel"
                                onPress={() => setIsModalVisible(false)}
                                style={styles.cancelBtn}
                                textStyle={{ color: '#5a6278' }}
                            />
                            <Button
                                title="Create"
                                onPress={handleCreateUser}
                                loading={isLoading}
                            />
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#eceff8',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#2a2e3a',
    },
    addButton: {
        backgroundColor: '#7f68ea',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
    },
    addButtonText: {
        color: '#ffffff',
        fontWeight: '600',
    },
    listContent: {
        padding: 20,
    },
    userCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        padding: 15,
        borderRadius: 12,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#eceff8',
    },
    userEmail: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2a2e3a',
    },
    userInfo: {
        flex: 1,
    },
    userRole: {
        fontSize: 12,
        color: '#7c85a0',
        marginTop: 2,
    },
    deleteButton: {
        padding: 8,
        backgroundColor: '#fecaca',
        borderRadius: 8,
        marginLeft: 10,
    },
    deleteIcon: {
        fontSize: 16,
    },
    roleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    statusBadge: {
        marginLeft: 10,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
    },
    approvedBadge: {
        backgroundColor: '#d1fae5',
    },
    pendingBadge: {
        backgroundColor: '#fef3c7',
    },
    rejectedBadge: {
        backgroundColor: '#fee2e2',
    },
    statusText: {
        fontSize: 10,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    approvalActions: {
        flexDirection: 'row',
        marginRight: 10,
    },
    actionBtn: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 8,
    },
    approveBtn: {
        backgroundColor: '#d1fae5',
    },
    rejectBtn: {
        backgroundColor: '#fee2e2',
    },
    actionBtnText: {
        fontWeight: 'bold',
        fontSize: 16,
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 50,
        color: '#7c85a0',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#2a2e3a',
        marginBottom: 20,
        textAlign: 'center',
    },
    modalButtons: {
        flexDirection: 'row',
        gap: 10,
        marginTop: 10,
    },
    cancelBtn: {
        backgroundColor: '#eceff8',
        flex: 1,
    },
});

export default UserManagementScreen;
