import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  Pressable,
  TextInput,
  Alert,
} from "react-native";
import React, { useState, useCallback, useMemo } from "react";
import { supabase } from "../../utils/supabase";
import { useFocusEffect, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useCart } from "../../context/CartContext"; 
import { Link } from "expo-router";

export default function ConsumidorDashboard() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const { addToCart, items: cartItems } = useCart();

  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("products")
      .select("*, profiles (full_name)") 
      .order("created_at", { ascending: false });

    if (error) {
      Alert.alert("Erro", "Não foi possível carregar os produtos.");
    } else {
      setProducts(data);
    }
    setLoading(false);
  };

  useFocusEffect(
    useCallback(() => {
      fetchProducts();
    }, [])
  );

  const filteredProducts = useMemo(() => {
    return products.filter((product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [products, searchQuery]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/");
  };

  const cartItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Produtos Disponíveis</Text>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Link href="/cart" asChild>
            <Pressable>
              <View style={styles.cartIconContainer}>
                <Text style={styles.cartIcon}>🛒</Text>
                {cartItemCount > 0 && (
                  <Text style={styles.cartBadge}>{cartItemCount}</Text>
                )}
              </View>
            </Pressable>
          </Link>
          <Pressable onPress={handleLogout}>
            <Text style={styles.logoutText}>Sair</Text>
          </Pressable>
        </View>
      </View>

      <TextInput
        style={styles.searchBar}
        placeholder="Pesquisar por produto..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      {loading && (
        <Text style={{ textAlign: "center", margin: 20 }}>Carregando...</Text>
      )}

      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.productItem}>
            <Image
              source={{ uri: item.image_url || "https://placehold.co/150" }}
              style={styles.productImage}
            />
            <View style={styles.productInfo}>
              <Text style={styles.productName}>{item.name}</Text>
              <Text style={styles.farmerName}>
                Vendido por: {item.profiles?.full_name || "Desconhecido"}
              </Text>
              <Text style={styles.productPrice}>
                R$ {item.price.toFixed(2)} / {item.unit}
              </Text>
            </View>
            <Pressable
              style={styles.addToCartButton}
              onPress={() => addToCart(item)}
            >
              <Text style={styles.addToCartText}>+</Text>
            </Pressable>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Nenhum produto encontrado.</Text>
        }
        contentContainerStyle={{ paddingHorizontal: 15 }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  title: { fontSize: 24, fontWeight: "bold" },
  logoutText: { color: "#e74c3c", fontSize: 16, marginLeft: 15 },
  cartIconContainer: { flexDirection: "row" },
  cartIcon: { fontSize: 24 },
  cartBadge: {
    backgroundColor: "#e74c3c",
    color: "#fff",
    borderRadius: 10,
    paddingHorizontal: 5,
    fontSize: 12,
    position: "absolute",
    right: -5,
    top: -5,
  },
  searchBar: {
    height: 40,
    margin: 15,
    paddingHorizontal: 10,
    backgroundColor: "#f0f0f0",
    borderRadius: 20,
  },
  productItem: {
    backgroundColor: "#f9f9f9",
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#eee",
    flexDirection: "row",
    alignItems: "center",
  },
  productImage: { width: 80, height: 80, borderRadius: 8, marginRight: 15 },
  productInfo: { flex: 1 },
  productName: { fontSize: 18, fontWeight: "bold" },
  farmerName: { fontSize: 14, color: "gray" },
  productPrice: {
    fontSize: 16,
    color: "#299640",
    fontWeight: "bold",
    marginTop: 5,
  },
  addToCartButton: {
    backgroundColor: "#7ECB29",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  addToCartText: { color: "#fff", fontSize: 24, fontWeight: "bold" },
  emptyText: { textAlign: "center", marginTop: 50, color: "gray" },
});
