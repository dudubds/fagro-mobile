// Substitua o conteúdo de src/app/checkout.tsx por este código

import { View, Text, StyleSheet, Pressable, Alert, ActivityIndicator, ScrollView, TouchableOpacity } from "react-native";
import { useCart } from "../context/CartContext";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useEffect } from "react";
import { router } from "expo-router";
import { supabase } from "../utils/supabase";
import { MaterialIcons } from '@expo/vector-icons';

// --- Tipos e Dados ---
type PaymentMethod = 'credit_card' | 'pix' | 'meal_voucher' | 'market_voucher';
const PAYMENT_METHODS = [
    { id: 'credit_card',    icon: 'credit-card',     label: 'Cartão de Crédito' },
    { id: 'pix',              icon: 'pix',             label: 'Pix' },
    { id: 'meal_voucher',     icon: 'restaurant-menu', label: 'Vale Alimentação' },
    { id: 'market_voucher',   icon: 'storefront',      label: 'Vale Feira' },
];

// --- Componentes ---
type InfoRowProps = {
    icon: string;
    label: string;
    value: string;
};

const InfoRow = ({ icon, label, value }: InfoRowProps) => (
    <View style={styles.infoRow}>
        <MaterialIcons name={icon as any} size={24} color="#555" style={styles.icon} />
        <View>
            <Text style={styles.infoLabel}>{label}</Text>
            <Text style={styles.infoValue}>{value}</Text>
        </View>
    </View>
);

// --- Componente Principal ---
export default function CheckoutScreen() {
    const { items, totalPrice, clearCart } = useCart();
    const [isProcessing, setIsProcessing] = useState(false);
    const [profile, setProfile] = useState<any>(null);
    const [loadingProfile, setLoadingProfile] = useState(true);
    const [selectedPayment, setSelectedPayment] = useState<PaymentMethod | null>(null);

    useEffect(() => {
        const fetchProfile = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();
                if (error) { Alert.alert("Erro", "Não foi possível carregar os dados do perfil."); } 
                else { setProfile(data); }
            }
            setLoadingProfile(false);
        };
        fetchProfile();
    }, []);

    async function handleConfirmPurchase() {
        if (!selectedPayment) {
            Alert.alert("Atenção", "Por favor, selecione um método de pagamento.");
            return;
        }
        setIsProcessing(true);

        const { data: { user } } = await supabase.auth.getUser();
        if (!user || !profile) {
            Alert.alert("Erro", "Não foi possível identificar o utilizador.");
            setIsProcessing(false);
            return;
        }

        // Agrupar itens por agricultor
        const ordersByFarmer = items.reduce<Record<string, typeof items>>( (acc, item) => {
            const farmerId = item.farmer_id as string; // Garanta que 'farmer_id' está disponível no item do carrinho
            if (!farmerId) {
                console.warn("Produto sem farmer_id no carrinho:", item);
                return acc;
            }
            if (!acc[farmerId]) {
                acc[farmerId] = [];
            }
            acc[farmerId].push(item);
            return acc;
        }, {});

        try {
            // Criar um pedido para cada agricultor
            for (const farmerId in ordersByFarmer) {
                const farmerItems = ordersByFarmer[farmerId];
                const farmerTotalPrice = farmerItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

                // 1. Inserir na tabela 'orders'
                const { data: orderData, error: orderError } = await supabase
                    .from('orders')
                    .insert({
                        consumer_id: user.id,
                        farmer_id: farmerId,
                        total_price: farmerTotalPrice,
                        delivery_address: {
                            street: profile.street,
                            number: profile.number,
                            neighborhood: profile.neighborhood,
                            city: profile.city,
                            state: profile.state,
                            zip_code: profile.zip_code
                        },
                        status: 'pending'
                    })
                    .select('id')
                    .single();

                if (orderError) throw orderError;

                // 2. Inserir na tabela 'order_items'
                const orderItemsData = farmerItems.map(item => ({
                    order_id: orderData.id,
                    product_id: item.id,
                    quantity: item.quantity,
                    price_at_purchase: item.price
                }));

                const { error: itemsError } = await supabase.from('order_items').insert(orderItemsData);
                if (itemsError) throw itemsError;
            }

            Alert.alert( "Compra Finalizada!", "O seu pedido foi enviado para o agricultor." );
            clearCart();
            router.replace('/dashboard/consumidor');

        } catch (error: any) {
            console.error("Erro ao criar o pedido:", error);
            Alert.alert("Erro", "Ocorreu um erro ao registar o seu pedido. Tente novamente.");
        } finally {
            setIsProcessing(false);
        }
    }
    
    const deliveryAddress = profile
        ? `${profile.street}, ${profile.number} - ${profile.neighborhood}, ${profile.city} - ${profile.state}`
        : 'Endereço não cadastrado';

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <Pressable onPress={() => router.back()} disabled={isProcessing}>
                        <MaterialIcons name="arrow-back" size={28} color="#333" />
                    </Pressable>
                    <Text style={styles.title}>Finalizar Compra</Text>
                    <View style={{width: 28}} />
                </View>

                {/* Seção de Entrega */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Detalhes da Entrega</Text>
                    {loadingProfile ? (
                        <ActivityIndicator color="#299640" style={{ marginVertical: 20 }}/>
                    ) : profile ? (
                        <>
                            <InfoRow icon="person-outline" label="Nome" value={profile.full_name} />
                            <InfoRow icon="home" label="Endereço de Entrega" value={deliveryAddress} />
                            <Pressable onPress={() => router.push('/profile')}>
                                <Text style={styles.editLink}>Editar Perfil</Text>
                            </Pressable>
                        </>
                    ) : (
                        <Text style={styles.warningText}>Não foi possível carregar os dados do perfil.</Text>
                    )}
                </View>

                {/* Seção de Pagamento */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Método de Pagamento</Text>
                    {PAYMENT_METHODS.map((method) => (
                        <TouchableOpacity 
                            key={method.id} 
                            style={[styles.paymentOption, selectedPayment === method.id && styles.paymentOptionSelected]} 
                            onPress={() => setSelectedPayment(method.id as PaymentMethod)}
                        >
                            <View style={{flexDirection: 'row', alignItems: 'center'}}>
                                <MaterialIcons name={method.icon as any} size={24} color={selectedPayment === method.id ? '#299640' : '#555'} />
                                <Text style={[styles.paymentLabel, selectedPayment === method.id && styles.paymentLabelSelected]}>{method.label}</Text>
                            </View>
                            <View style={[styles.radioOuter, selectedPayment === method.id && styles.radioOuterSelected]}>
                                {selectedPayment === method.id && <View style={styles.radioInner} />}
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Resumo do Pedido */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Resumo do Pedido</Text>
                    {items.map(item => (
                        <View key={item.id} style={styles.summaryItem}>
                            <Text style={styles.itemName}>{item.name} (x{item.quantity})</Text>
                            <Text style={styles.itemPrice}>R$ {(item.price * item.quantity).toFixed(2)}</Text>
                        </View>
                    ))}
                    <View style={styles.summaryTotal}>
                        <Text style={styles.totalText}>Total do Pedido</Text>
                        <Text style={styles.totalPrice}>R$ {totalPrice.toFixed(2)}</Text>
                    </View>
                </View>
            </ScrollView>

            {/* Rodapé com botão de confirmação */}
            <View style={styles.footer}>
                <Pressable
                    style={[styles.confirmButton, (isProcessing || loadingProfile || !selectedPayment) && styles.disabledButton]}
                    onPress={handleConfirmPurchase}
                    disabled={isProcessing || loadingProfile || !selectedPayment}
                >
                    {isProcessing ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.confirmButtonText}>Confirmar Compra</Text>
                    )}
                </Pressable>
            </View>
        </SafeAreaView>
    );
}
//... Mantenha os mesmos estilos da resposta anterior
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F0F8E4',
    },
    scrollContent: {
        paddingBottom: 120, // Aumentado para mais espaço
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#eee'
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333'
    },
    section: {
        backgroundColor: '#fff',
        marginHorizontal: 15,
        borderRadius: 12,
        padding: 20,
        marginTop: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
        color: '#299640'
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 15,
    },
    icon: {
        marginRight: 15,
        marginTop: 2,
    },
    infoLabel: {
        fontSize: 14,
        color: '#888',
    },
    infoValue: {
        fontSize: 16,
        color: '#333',
        flexWrap: 'wrap'
    },
    editLink: {
        color: '#299640',
        fontWeight: 'bold',
        textAlign: 'right',
        marginTop: 5,
    },
    // Estilos para a seção de pagamento
    paymentOption: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 15,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        paddingHorizontal: 15,
        marginBottom: 10,
    },
    paymentOptionSelected: {
        borderColor: '#299640',
        backgroundColor: '#F0F8E4',
    },
    paymentLabel: {
        fontSize: 16,
        marginLeft: 15,
        color: '#333'
    },
    paymentLabelSelected: {
        fontWeight: 'bold',
        color: '#299640'
    },
    radioOuter: {
        width: 22,
        height: 22,
        borderRadius: 11,
        borderWidth: 2,
        borderColor: '#ccc',
        justifyContent: 'center',
        alignItems: 'center'
    },
    radioOuterSelected: {
        borderColor: '#299640',
    },
    radioInner: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#299640'
    },
    // Fim dos estilos de pagamento
    summaryItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#f5f5f5'
    },
    itemName: {
        fontSize: 16,
        color: '#555'
    },
    itemPrice: {
        fontSize: 16,
        fontWeight: '500',
    },
    summaryTotal: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 15,
        paddingTop: 15,
    },
    totalText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333'
    },
    totalPrice: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#299640'
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 20,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#eee',
    },
    confirmButton: {
        backgroundColor: '#28a745',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        height: 55
    },
    disabledButton: {
        backgroundColor: '#a5d6a7',
    },
    confirmButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold'
    },
    warningText: {
        textAlign: 'center',
        color: '#c0392b',
        fontSize: 16,
        padding: 10
    }
});