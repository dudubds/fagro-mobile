// src/app/dashboard/agricultor/pedidos.tsx

import { View, Text, StyleSheet, Pressable, FlatList, Alert, ActivityIndicator } from "react-native";
import React, { useState, useCallback } from 'react';
import { supabase } from "../../../utils/supabase";
import { router, useFocusEffect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from '@expo/vector-icons';

// --- Componente para o Card de Pedido ---
type OrderItem = {
    id: string;
    quantity: number;
    products: { name: string };
};

type Consumer = {
    full_name?: string;
};

type DeliveryAddress = {
    street?: string;
    number?: string;
    city?: string;
};

type Order = {
    id: string;
    total_price: number;
    status: string;
    created_at: string;
    delivery_address?: DeliveryAddress;
    consumer?: Consumer;
    order_items: OrderItem[];
};

const OrderCard = ({ order, onUpdate }: { order: Order; onUpdate: () => void }) => {
    const { delivery_address, total_price, order_items, consumer } = order;
    const address = delivery_address 
        ? `${delivery_address.street}, ${delivery_address.number} - ${delivery_address.city}` 
        : 'Endereço não informado';

    const handleUpdateStatus = async (status: 'accepted' | 'rejected') => {
        const { error } = await supabase
            .from('orders')
            .update({ status: status })
            .eq('id', order.id);

        if (error) {
            Alert.alert("Erro", `Não foi possível ${status === 'accepted' ? 'aceitar' : 'recusar'} o pedido.`);
        } else {
            Alert.alert("Sucesso!", `Pedido ${status === 'accepted' ? 'aceito' : 'recusado'}.`);
            onUpdate();
        }
    };

    return (
        <View style={styles.orderCard}>
            <Text style={styles.orderTitle}>Pedido de {consumer?.full_name?.split(' ')[0]}</Text>
            
            <View style={styles.orderInfoRow}>
                <MaterialIcons name="home" size={20} color="#555" />
                <Text style={styles.orderText}>Entregar em: {address}</Text>
            </View>

            <View style={styles.orderInfoRow}>
                <MaterialIcons name="shopping-cart" size={20} color="#555" />
                <Text style={styles.orderText}>{order_items.reduce((acc, item) => acc + item.quantity, 0)} item(ns)</Text>
            </View>

            <Text style={styles.orderTotal}>Total: R$ {total_price.toFixed(2)}</Text>

            <View style={styles.itemsContainer}>
                {order_items.map(item => (
                    <Text key={item.id} style={styles.itemText}>- {item.quantity}x {item.products.name}</Text>
                ))}
            </View>
            
            {order.status === 'pending' && (
                <View style={styles.orderActions}>
                    <Pressable style={[styles.orderButton, styles.rejectButton]} onPress={() => handleUpdateStatus('rejected')}>
                        <Text style={styles.orderButtonText}>Recusar</Text>
                    </Pressable>
                    <Pressable style={[styles.orderButton, styles.acceptButton]} onPress={() => handleUpdateStatus('accepted')}>
                        <Text style={[styles.orderButtonText, {color: '#fff'}]}>Aceitar</Text>
                    </Pressable>
                </View>
            )}
        </View>
    );
};

// --- Componente Principal da Tela ---
export default function PedidosScreen() {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'pending' | 'accepted' | 'rejected'>('pending');

    const fetchOrders = useCallback(async () => {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            setLoading(false);
            return;
        }

        // ======================= CORREÇÃO PRINCIPAL AQUI =======================
        // Especificamos a chave estrangeira (consumer_id) para remover a ambiguidade.
        // A sintaxe profiles!consumer_id diz ao Supabase para usar a relação
        // através da coluna 'consumer_id' da tabela 'orders'.
        const { data, error } = await supabase
            .from('orders')
            .select(`
                id, total_price, status, created_at, delivery_address,
                consumer:profiles!consumer_id ( full_name ), 
                order_items ( id, quantity, products ( name ) )
            `)
            .eq('farmer_id', user.id)
            .eq('status', activeTab)
            .order('created_at', { ascending: false });
        // ======================================================================
        
        if (error) {
            console.error("Erro ao buscar pedidos:", error.message);
            Alert.alert("Erro", "Não foi possível carregar os pedidos.");
        } else {
            setOrders(data || []);
        }
        setLoading(false);
    }, [activeTab]);

    useFocusEffect(useCallback(() => {
        fetchOrders();
    }, [fetchOrders]));
    
    // ... (O resto do ficheiro, incluindo as abas e os estilos, permanece igual)
    const tabs = [
        { key: 'pending', label: 'Pendentes' },
        { key: 'accepted', label: 'Aceites' },
        { key: 'rejected', label: 'Recusados' },
    ];

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                 <Pressable onPress={() => router.back()}>
                    <MaterialIcons name="arrow-back" size={28} color="#333" />
                </Pressable>
                <Text style={styles.title}>Meus Pedidos</Text>
                <View style={{width: 28}} />
            </View>

            <View style={styles.tabContainer}>
                {tabs.map(tab => (
                    <Pressable 
                        key={tab.key}
                        style={[styles.tab, activeTab === tab.key && styles.tabActive]}
                        onPress={() => setActiveTab(tab.key as any)}
                    >
                        <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>{tab.label}</Text>
                    </Pressable>
                ))}
            </View>

            {loading ? (
                <ActivityIndicator size="large" color="#299640" style={{ marginTop: 50 }} />
            ) : (
                <FlatList
                    data={orders}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => <OrderCard order={item} onUpdate={fetchOrders} />}
                    ListEmptyComponent={<Text style={styles.emptyText}>Nenhum pedido encontrado nesta categoria.</Text>}
                    contentContainerStyle={{ padding: 15 }}
                />
            )}
        </SafeAreaView>
    );
}

// ... (Estilos permanecem os mesmos)
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F0F8E4' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 15, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' },
    title: { fontSize: 22, fontWeight: 'bold' },
    tabContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        backgroundColor: '#fff',
        paddingVertical: 10,
    },
    tab: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
    },
    tabActive: {
        backgroundColor: '#299640',
    },
    tabText: {
        fontSize: 16,
        color: '#555',
    },
    tabTextActive: {
        color: '#fff',
        fontWeight: 'bold',
    },
    emptyText: { textAlign: 'center', marginTop: 50, color: 'gray', fontSize: 16 },
    orderCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 15,
        marginBottom: 15,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    orderTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
    orderInfoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
    orderText: { fontSize: 16, marginLeft: 10, color: '#555', flexShrink: 1 },
    itemsContainer: {
        marginTop: 10,
        paddingTop: 10,
        borderTopWidth: 1,
        borderColor: '#f0f0f0',
    },
    itemText: {
        fontSize: 15,
        color: '#666',
        marginBottom: 3,
    },
    orderTotal: { fontSize: 16, fontWeight: 'bold', textAlign: 'right', marginTop: 10 },
    orderActions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 15, gap: 10 },
    orderButton: { paddingVertical: 8, paddingHorizontal: 20, borderRadius: 20 },
    orderButtonText: { fontSize: 16, fontWeight: 'bold' },
    rejectButton: { borderWidth: 1.5, borderColor: '#e74c3c' },
    acceptButton: { backgroundColor: '#28a745' },
});