import { View, Text, StyleSheet, Pressable, Alert, ActivityIndicator, ScrollView } from "react-native";
import { useCart } from "../context/CartContext";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import { router } from "expo-router";

export default function CheckoutScreen() {
    const { items, totalPrice, clearCart } = useCart();
    const [isProcessing, setIsProcessing] = useState(false);

    async function handleConfirmPurchase() {
        setIsProcessing(true);
        setTimeout(() => {
            Alert.alert(
                "Compra Finalizada!",
                "Seu pedido foi registrado com sucesso."
            );
            clearCart();
            router.replace('/dashboard/consumidor');
            setIsProcessing(false);
        }, 1000);
    }
    
    return (
        <SafeAreaView style={styles.container}>
            <ScrollView>
                <Text style={styles.title}>Finalizar Compra</Text>
                
                <View style={styles.summaryBox}>
                    <Text style={styles.summaryTitle}>Resumo do Pedido</Text>
                    {items.map(item => (
                        <View key={item.id} style={styles.summaryItem}>
                            <Text style={styles.itemName}>{item.name} (x{item.quantity})</Text>
                            <Text style={styles.itemPrice}>R$ {(item.price * item.quantity).toFixed(2)}</Text>
                        </View>
                    ))}
                    <View style={styles.summaryTotal}>
                        <Text style={styles.totalText}>Total</Text>
                        <Text style={styles.totalText}>R$ {totalPrice.toFixed(2)}</Text>
                    </View>
                </View>

                <Pressable 
                    style={[styles.confirmButton, isProcessing && styles.disabledButton]} 
                    onPress={handleConfirmPurchase}
                    disabled={isProcessing}
                >
                    {isProcessing ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.confirmButtonText}>Confirmar Compra</Text>
                    )}
                </Pressable>

                <Pressable onPress={() => router.back()} disabled={isProcessing}>
                    <Text style={styles.backLink}>Voltar para o Carrinho</Text>
                </Pressable>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        backgroundColor: '#fff', 
        paddingVertical: 20
    },
    title: { 
        fontSize: 28, 
        fontWeight: 'bold', 
        textAlign: 'center', 
        marginBottom: 20,
        paddingHorizontal: 20,
    },
    summaryBox: { 
        backgroundColor: '#f9f9f9', 
        padding: 20, 
        borderRadius: 10, 
        marginBottom: 30,
        marginHorizontal: 20,
    },
    summaryTitle: { 
        fontSize: 20, 
        fontWeight: 'bold', 
        marginBottom: 15 
    },
    summaryItem: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        marginBottom: 8 
    },
    itemName: {
        flex: 1,
    },
    itemPrice: {
        fontWeight: '500',
    },
    summaryTotal: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        marginTop: 15, 
        paddingTop: 15, 
        borderTopWidth: 1, 
        borderTopColor: '#eee' 
    },
    totalText: { 
        fontSize: 18, 
        fontWeight: 'bold' 
    },
    confirmButton: { 
        backgroundColor: '#28a745', 
        padding: 15, 
        borderRadius: 10, 
        alignItems: 'center',
        marginHorizontal: 20,
    },
    disabledButton: {
        backgroundColor: 'gray',
    },
    confirmButtonText: { 
        color: '#fff', 
        fontSize: 18, 
        fontWeight: 'bold' 
    },
    backLink: { 
        textAlign: 'center', 
        color: '#299640', 
        padding: 20 
    }
});