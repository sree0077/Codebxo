import React, { useMemo, useEffect, useState } from 'react';
import { View, Text, SafeAreaView, ScrollView, StyleSheet } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { Card } from '../components/common';
import { InteractionCard } from '../components/interaction';
import { useClients } from '../hooks/useClients';
import { useInteractions } from '../hooks/useInteractions';
import { getUserData } from '../services/firebase';
import { BUSINESS_TYPES, CUSTOMER_POTENTIAL } from '../utils/constants';
import { getInitials, getPotentialColor, formatDate, getBusinessTypeIcon } from '../utils/helpers';

const AdminClientDetailScreen = () => {
    const route = useRoute();
    const { clientId } = route.params;

    const { getClientById, loadAllClients, refreshClients } = useClients();
    const { getClientInteractions } = useInteractions();

    const client = useMemo(() => getClientById(clientId), [clientId, getClientById]);

    const [creatorEmail, setCreatorEmail] = useState(client?.creatorEmail || null);

    // If client is not found, try loading all clients
    useEffect(() => {
        if (!client) {
            loadAllClients();
        } else if (!client.creatorEmail && client.userId) {
            fetchCreatorEmail();
        }
    }, [client, loadAllClients]);

    const fetchCreatorEmail = async () => {
        const result = await getUserData(client.userId);
        if (result.success && result.userData?.email) {
            setCreatorEmail(result.userData.email);
        }
    };
    const interactions = useMemo(() => getClientInteractions(clientId), [clientId, getClientInteractions]);

    const businessType = BUSINESS_TYPES.find((b) => b.value === client?.businessType);
    const potential = CUSTOMER_POTENTIAL.find((p) => p.value === client?.customerPotential);
    const businessIcon = getBusinessTypeIcon(client?.businessType);

    if (!client) {
        return (
            <SafeAreaView style={styles.notFoundContainer}>
                <Text style={styles.notFoundText}>Client not found</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header Card */}
                <View style={styles.header}>
                    <View style={styles.headerContent}>
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>
                                {getInitials(client.clientName)}
                            </Text>
                        </View>
                        <Text style={styles.clientName}>{client.clientName}</Text>
                        {client.companyName && (
                            <Text style={styles.companyName}>{client.companyName}</Text>
                        )}
                        {potential && (
                            <View style={styles.potentialBadge}>
                                <Text style={styles.potentialText}>{potential.label} Potential</Text>
                            </View>
                        )}
                    </View>
                </View>

                <View style={styles.content}>
                    {/* Attribution Card */}
                    <Card style={styles.cardMargin}>
                        <Text style={styles.sectionTitle}>Data Attribution</Text>
                        <DetailRow label="Created By" value={creatorEmail || (client?.userId ? `User ${client.userId.substring(0, 8)}...` : 'Unknown')} icon="👤" isHighlight />
                    </Card>

                    {/* Client Details */}
                    <Card style={styles.cardMargin}>
                        <Text style={styles.sectionTitle}>Details</Text>
                        <DetailRow label="Phone" value={client.phoneNumber} icon="📱" />
                        <DetailRow label="Business Type" value={businessType?.label} icon={businessIcon} />
                        <DetailRow label="Using System" value={client.usingSystem === 'yes' ? 'Yes' : 'No'} icon="💻" />
                        {client.location && (
                            <DetailRow
                                label="Location"
                                value={`${client.location.latitude.toFixed(4)}, ${client.location.longitude.toFixed(4)}`}
                                icon="📍"
                            />
                        )}
                        {client.address && <DetailRow label="Address" value={client.address} icon="🏠" />}
                        <DetailRow label="Added" value={formatDate(client.createdAt)} icon="📅" />
                    </Card>

                    {/* Interactions */}
                    <View style={styles.interactionsSection}>
                        <Text style={styles.sectionTitle}>Interactions</Text>
                        {interactions.length === 0 ? (
                            <Card><Text style={styles.emptyText}>No interactions yet</Text></Card>
                        ) : (
                            interactions.map((interaction) => (
                                <InteractionCard key={interaction.id} interaction={interaction} />
                            ))
                        )}
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const DetailRow = ({ label, value, icon, isHighlight }) => (
    <View style={styles.detailRow}>
        <Text style={styles.detailIcon}>{icon}</Text>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={[styles.detailValue, isHighlight && styles.highlightValue]}>{value || 'N/A'}</Text>
    </View>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#eceff8',
    },
    notFoundContainer: {
        flex: 1,
        backgroundColor: '#ffffff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    notFoundText: {
        color: '#7c85a0',
    },
    header: {
        backgroundColor: '#7f68ea',
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 32,
    },
    headerContent: {
        alignItems: 'center',
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#ffffff',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    avatarText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#7f68ea',
    },
    clientName: {
        color: '#ffffff',
        fontSize: 20,
        fontWeight: 'bold',
    },
    companyName: {
        color: '#d4d9e8',
        fontSize: 14,
    },
    potentialBadge: {
        marginTop: 8,
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
    },
    potentialText: {
        color: '#ffffff',
        fontSize: 12,
        textTransform: 'capitalize',
    },
    content: {
        paddingHorizontal: 16,
        marginTop: -16,
    },
    cardMargin: {
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2a2e3a',
        marginBottom: 16,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#eceff8',
    },
    detailIcon: {
        marginRight: 8,
    },
    detailLabel: {
        color: '#7c85a0',
        width: 100,
    },
    detailValue: {
        color: '#2a2e3a',
        flex: 1,
    },
    highlightValue: {
        color: '#7f68ea',
        fontWeight: 'bold',
    },
    interactionsSection: {
        marginBottom: 16,
    },
    emptyText: {
        color: '#7c85a0',
        textAlign: 'center',
        paddingVertical: 16,
    },
});

export default AdminClientDetailScreen;
