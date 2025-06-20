import { View, Text, StyleSheet, FlatList, Pressable, Image, Alert } from "react-native";
import { useCart } from "../context/CartContext";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";

export default function CartScreen() {
  const { items, totalPrice, addToCart, decreaseQuantity, removeFromCart } = useCart();

  const handleCheckout = () => {
    router.push('/checkout');
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Meu Carrinho</Text>

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.cartItem}>
            <Image source={{ uri: (item as any).image_url || 'https://placehold.co/100' }} style={styles.itemImage} />
            <View style={styles.itemInfo}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemPrice}>R$ {item.price.toFixed(2)}</Text>
            </View>
            <View style={styles.quantityContainer}>
              <Pressable onPress={() => decreaseQuantity(item.id)} style={styles.quantityButton}>
                <Text style={styles.quantityButtonText}>-</Text>
              </Pressable>
              <Text style={styles.quantityText}>{item.quantity}</Text>
              <Pressable onPress={() => addToCart(item)} style={styles.quantityButton}>
                <Text style={styles.quantityButtonText}>+</Text>
              </Pressable>
            </View>
            <Pressable onPress={() => removeFromCart(item.id)} style={styles.removeButton}>
                <Text style={styles.removeButtonText}>🗑️</Text>
            </Pressable>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>Seu carrinho está vazio.</Text>}
        contentContainerStyle={{ padding: 15 }}
      />

      <View style={styles.footer}>
        <Text style={styles.totalText}>Total: R$ {totalPrice.toFixed(2)}</Text>
        <Pressable 
            style={[styles.checkoutButton, items.length === 0 && styles.disabledButton]} 
            onPress={handleCheckout}
            disabled={items.length === 0}
        >
          <Text style={styles.checkoutButtonText}>Finalizar Compra</Text>
        </Pressable>
      </View>
       <Pressable onPress={() => router.back()}>
          <Text style={styles.backLink}>Continuar Comprando</Text>
       </Pressable>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', padding: 20 },
    cartItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f9f9f9', padding: 10, borderRadius: 10, marginBottom: 10 },
    itemImage: { width: 60, height: 60, borderRadius: 8, marginRight: 10 },
    itemInfo: { flex: 1 },
    itemName: { fontSize: 16, fontWeight: 'bold' },
    itemPrice: { fontSize: 14, color: 'gray' },
    quantityContainer: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 10 },
    quantityButton: { backgroundColor: '#ddd', width: 30, height: 30, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
    quantityButtonText: { fontSize: 18, fontWeight: 'bold' },
    quantityText: { fontSize: 16, marginHorizontal: 10, fontWeight: 'bold' },
    removeButton: { padding: 5 },
    removeButtonText: { fontSize: 20 },
    footer: { borderTopWidth: 1, borderTopColor: '#eee', padding: 20 },
    totalText: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
    checkoutButton: { backgroundColor: '#7ECB29', padding: 15, borderRadius: 10, alignItems: 'center' },
    disabledButton: { backgroundColor: 'gray' },
    checkoutButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
    emptyText: { textAlign: 'center', marginTop: 50, fontSize: 16, color: 'gray' },
    backLink: { textAlign: 'center', color: '#299640', padding: 10 }
});