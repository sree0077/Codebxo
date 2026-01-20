import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, Modal, TextInput, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getAllUsers, deleteUserAccount, registerUser, updateUserStatus, updateUserDetails, auth, SUPER_ADMIN_EMAIL } from '../services/firebase';
import { Button, Input, LoadingSpinner, Dropdown } from '../components/common';

const UserManagementScreen = () => {
    console.log('[DEBUG] UserManagementScreen rendered, auth object:', auth ? 'Defined' : 'UNDEFINED');
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);

    // Form state
    const [newEmail, setNewEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [newRole, setNewRole] = useState('user');

    // Edit state
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [editRole, setEditRole] = useState('user');
    const [editStatus, setEditStatus] = useState('approved');

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
        setIsLoading(false);
    };

    const handleDeleteUser = (userId, email, role) => {
        console.log('[DEBUG] handleDeleteUser clicked for:', email, 'ID:', userId);
        const currentUser = auth?.currentUser;
        const isSuperAdmin = currentUser?.email === SUPER_ADMIN_EMAIL;

        // 1. Protection for Super Admin
        if (email === SUPER_ADMIN_EMAIL) {
            console.log('[DEBUG] ❌ Blocked: Cannot delete Super Admin.');
            const msg = "The Super Admin account cannot be deleted or modified.";
            if (Platform.OS === 'web') window.alert(msg);
            else Alert.alert("Action Blocked", msg);
            return;
        }

        // 2. Protection for Self
        if (currentUser && currentUser.uid === userId) {
            console.log('[DEBUG] ❌ Blocked: User is trying to delete themselves.');
            const msg = "You cannot delete your own administrator account.";
            if (Platform.OS === 'web') window.alert(msg);
            else Alert.alert("Action Blocked", msg);
            return;
        }

        // 3. Permission Check: Regular Admins cannot delete other Admins
        if (!isSuperAdmin && role === 'admin') {
            const msg = "Regular administrators cannot delete other admin accounts. Only the Super Admin can do this.";
            if (Platform.OS === 'web') window.alert(msg);
            else Alert.alert("Access Denied", msg);
            return;
        }

        const runDelete = async () => {
            console.log('[DEBUG] 🚀 Starting deletion process for:', email);
            setIsLoading(true);
            const result = await deleteUserAccount(userId);
            console.log('[DEBUG] 🛡️ Deletion result:', result);
            if (result.success) {
                console.log('[DEBUG] ✅ Deletion successful, refreshing list...');
                fetchUsers();
            } else {
                console.log('[DEBUG] ❌ Deletion failed:', result.error);
                setIsLoading(false);
                if (Platform.OS === 'web') window.alert("Error: " + result.error);
                else Alert.alert("Error", result.error);
            }
        };

        console.log('[DEBUG] ❓ Showing confirmation dialog...');
        if (Platform.OS === 'web') {
            if (window.confirm(`Are you sure you want to delete ${email}? This will permanently block their access.`)) {
                runDelete();
            }
        } else {
            Alert.alert(
                "Delete User",
                `Are you sure you want to delete ${email}? This will permanently block their access and remove them from this list.`,
                [
                    { text: "Cancel", style: "cancel" },
                    { text: "Delete", style: "destructive", onPress: runDelete }
                ]
            );
        }
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

    const handleEditUser = (user) => {
        setEditingUser(user);
        setEditRole(user.role || 'user');
        setEditStatus(user.status || 'approved');
        setIsEditModalVisible(true);
    };

    const handleUpdateUser = async () => {
        if (!editingUser) return;
        setIsLoading(true);
        const result = await updateUserDetails(editingUser.id, {
            role: editRole,
            status: editStatus,
        });
        if (result.success) {
            setIsEditModalVisible(false);
            setEditingUser(null);
            fetchUsers();
        } else {
            Alert.alert("Error", result.error);
        }
        setIsLoading(false);
    };

    const renderUser = ({ item }) => {
        const currentUser = auth?.currentUser;
        const isSuperAdmin = currentUser?.email === SUPER_ADMIN_EMAIL;
        const isTargetAdmin = item.role === 'admin';
        const isTargetSuperAdmin = item.email === SUPER_ADMIN_EMAIL;

        // SECURITY: Regular Admins cannot see actions for other Admins
        const canManageTarget = isSuperAdmin || !isTargetAdmin;

        return (
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
                        {isTargetSuperAdmin && <View style={[styles.statusBadge, { backgroundColor: '#fef3c7', marginLeft: 5 }]}><Text style={[styles.statusText, { color: '#d97706' }]}>SUPER ADMIN</Text></View>}
                    </View>
                </TouchableOpacity>

                <View style={styles.cardActions}>
                    {item.status === 'pending' && canManageTarget && (
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
                    <View style={styles.mainActions}>
                        {canManageTarget && !isTargetSuperAdmin && (
                            <>
                                <TouchableOpacity
                                    onPress={() => handleEditUser(item)}
                                    style={styles.editButton}
                                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                >
                                    <Text style={styles.editIcon}>✏️</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => handleDeleteUser(item.id, item.email, item.role)}
                                    style={styles.deleteButton}
                                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                >
                                    <Text style={styles.deleteIcon}>🗑️</Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </View>
                </View>
            </View>
        );
    };

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
                data={users.filter(u => u.status !== 'deleted')}
                renderItem={renderUser}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={<Text style={styles.emptyText}>No users found.</Text>}
            />

            {/* Create User Modal */}
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
                                variant="secondary"
                                fullWidth={false}
                                style={styles.modalBtn}
                            />
                            <Button
                                title="Create"
                                onPress={handleCreateUser}
                                fullWidth={false}
                                style={styles.modalBtn}
                                loading={isLoading}
                            />
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Edit User Modal */}
            <Modal
                visible={isEditModalVisible}
                animationType="slide"
                transparent={true}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Edit User: {editingUser?.email}</Text>
                        <Dropdown
                            label="Account Type"
                            value={editRole}
                            options={[
                                { label: 'User', value: 'user' },
                                { label: 'Admin', value: 'admin' },
                            ]}
                            onSelect={setEditRole}
                        />
                        <Dropdown
                            label="Status"
                            value={editStatus}
                            options={[
                                { label: 'Approved', value: 'approved' },
                                { label: 'Pending', value: 'pending' },
                                { label: 'Rejected', value: 'rejected' },
                            ]}
                            onSelect={setEditStatus}
                        />
                        <View style={styles.modalButtons}>
                            <Button
                                title="Cancel"
                                onPress={() => setIsEditModalVisible(false)}
                                variant="secondary"
                                fullWidth={false}
                                style={styles.modalBtn}
                            />
                            <Button
                                title="Update"
                                onPress={handleUpdateUser}
                                fullWidth={false}
                                style={styles.modalBtn}
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
    cardActions: {
        flexDirection: 'row',
        alignItems: 'center',
        zIndex: 10,
    },
    approvalActions: {
        flexDirection: 'row',
        borderRightWidth: 1,
        borderRightColor: '#eceff8',
        paddingRight: 8,
        marginRight: 8,
    },
    mainActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    actionBtn: {
        width: 28,
        height: 28,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 6,
    },
    approveBtn: {
        backgroundColor: '#d1fae5',
    },
    rejectBtn: {
        backgroundColor: '#fee2e2',
    },
    actionBtnText: {
        fontWeight: 'bold',
        fontSize: 14,
    },
    editButton: {
        padding: 8,
        backgroundColor: '#e0f2fe',
        borderRadius: 8,
        marginLeft: 4,
    },
    editIcon: {
        fontSize: 16,
    },
    deleteButton: {
        padding: 8,
        backgroundColor: '#fecaca',
        borderRadius: 8,
        marginLeft: 8,
    },
    deleteIcon: {
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
        gap: 12,
        marginTop: 20,
    },
    modalBtn: {
        flex: 1,
    },
});

export default UserManagementScreen;
