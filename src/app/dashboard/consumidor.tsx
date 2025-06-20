// src/app/dashboard/consumidor.tsx

import { View, Text, StyleSheet, FlatList, Image, Pressable, TextInput, Alert, Modal, TouchableOpacity } from "react-native";
import React, { useState, useCallback, useMemo } from 'react';
import { supabase } from "../../utils/supabase";
import { useFocusEffect, router, Link } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useCart } from "../../context/CartContext";
import { MaterialIcons } from '@expo/vector-icons';

export default function ConsumidorDashboard() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Estados para os modais
  const [isProductModalVisible, setProductModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [isMenuVisible, setMenuVisible] = useState(false);

  const { addToCart, items: cartItems } = useCart();

  // Funções para o modal de produto
  const openProductModal = (product: any) => {
    setSelectedProduct(product);
    setProductModalVisible(true);
  };
  const closeProductModal = () => {
    setProductModalVisible(false);
    setSelectedProduct(null);
  };

  // Busca os produtos do banco de dados
  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('products')
      .select('*, profiles (full_name)')
      .order('created_at', { ascending: false });
    if (error) { Alert.alert("Erro", "Não foi possível carregar os produtos."); } 
    else { setProducts(data); }
    setLoading(false);
  };

  useFocusEffect(useCallback(() => { fetchProducts(); }, []));

  // Filtra os produtos com base na busca
  const filteredProducts = useMemo(() => {
    return products.filter(product =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [products, searchQuery]);

  // Função de logout
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace('/');
  };

  const cartItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // Componente para renderizar cada item da lista
  const renderProductItem = ({ item }: { item: any }) => {
    const firstName = item.profiles?.full_name ? item.profiles.full_name.split(' ')[0] : 'Desconhecido';
    return (
      <Pressable onPress={() => openProductModal(item)}>
        <View style={styles.productItem}>
          <Image source={{ uri: item.image_url || 'https://placehold.co/150' }} style={styles.productImage} />
          <View style={styles.productInfo}>
            <Text style={styles.productName}>{item.name}</Text>
            <Text style={styles.farmerName}>Vendido por: {firstName}</Text>
            <Text style={styles.productPrice}>R$ {item.price.toFixed(2)} / {item.unit}</Text>
          </View>
          <Pressable style={styles.addToCartButton} onPress={(e) => { e.stopPropagation(); addToCart(item); Alert.alert("Adicionado!", `${item.name} foi adicionado ao carrinho.`)}}>
            <Text style={styles.addToCartText}>+</Text>
          </Pressable>
        </View>
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Modal do Menu Hambúrguer */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={isMenuVisible}
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableOpacity style={styles.menuBackdrop} onPressOut={() => setMenuVisible(false)}>
          <View style={styles.menuContainer}>
            <Link href="/profile" asChild>
              <Pressable onPress={() => setMenuVisible(false)} style={styles.menuItem}>
                <MaterialIcons name="person-outline" size={24} color="black" />
                <Text style={styles.menuItemText}>Meu Perfil</Text>
              </Pressable>
            </Link>
            <Pressable onPress={handleLogout} style={styles.menuItem}>
              <MaterialIcons name="logout" size={24} color="black" />
              <Text style={styles.menuItemText}>Sair</Text>
            </Pressable>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Modal de Detalhes do Produto */}
      <Modal animationType="fade" transparent={true} visible={isProductModalVisible} onRequestClose={closeProductModal}>
        <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPressOut={closeProductModal}>
          <Pressable><View style={styles.modalContent}>
            {selectedProduct && (<>
              <Image source={{ uri: selectedProduct.image_url || 'https://placehold.co/400' }} style={styles.modalImage} />
              <Text style={styles.modalTitle}>{selectedProduct.name}</Text>
              <Text style={styles.modalFarmer}>Vendido por: {selectedProduct.profiles?.full_name?.split(' ')[0] || 'Desconhecido'}</Text>
              <Text style={styles.modalDescription}>{selectedProduct.description || 'Sem descrição.'}</Text>
              <Text style={styles.modalPrice}>R$ {selectedProduct.price.toFixed(2)} / {selectedProduct.unit}</Text>
              <Pressable style={styles.modalAddToCartButton} onPress={() => { addToCart(selectedProduct); Alert.alert("Sucesso", `${selectedProduct.name} foi adicionado ao carrinho!`); closeProductModal(); }}>
                <Text style={styles.modalButtonText}>Adicionar ao Carrinho</Text>
              </Pressable>
              <Pressable onPress={closeProductModal} style={{marginTop: 10}}><Text style={styles.closeButtonText}>Fechar</Text></Pressable>
            </>)}
          </View></Pressable>
        </TouchableOpacity>
      </Modal>

      {/* Cabeçalho da Tela */}
      <View style={styles.header}>
        <Text style={styles.title}>Produtos</Text>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <Link href="/cart" asChild><Pressable><View style={styles.cartIconContainer}><MaterialIcons name="shopping-cart" size={28} color="black" />{cartItemCount > 0 && <Text style={styles.cartBadge}>{cartItemCount}</Text>}</View></Pressable></Link>
          <Pressable onPress={() => setMenuVisible(true)}>
            <MaterialIcons name="menu" size={32} color="black" />
          </Pressable>
        </View>
      </View>

      <TextInput style={styles.searchBar} placeholder="Pesquisar por produto..." value={searchQuery} onChangeText={setSearchQuery}/>
      
      {loading && <Text style={styles.loadingText}>Carregando produtos...</Text>}
      
      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.id}
        renderItem={renderProductItem}
        ListEmptyComponent={<Text style={styles.emptyText}>Nenhum produto encontrado.</Text>}
        contentContainerStyle={{ paddingHorizontal: 15 }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 10, borderBottomWidth: 1, borderColor: '#eee' },
    title: { fontSize: 24, fontWeight: 'bold' },
    cartIconContainer: { flexDirection: 'row', padding: 5, marginRight: 15 },
    cartBadge: { backgroundColor: '#e74c3c', color: '#fff', borderRadius: 10, paddingHorizontal: 5, fontSize: 12, position: 'absolute', right: -5, top: -5 },
    menuBackdrop: { flex: 1 },
    menuContainer: { position: 'absolute', top: 85, right: 20, backgroundColor: 'white', borderRadius: 10, padding: 10, elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84, },
    menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 15},
    menuItemText: { fontSize: 18, marginLeft: 10 },
    searchBar: { height: 40, margin: 15, paddingHorizontal: 15, backgroundColor: '#f0f0f0', borderRadius: 20 },
    productItem: { backgroundColor: '#f9f9f9', padding: 10, borderRadius: 10, marginBottom: 10, borderWidth: 1, borderColor: '#eee', flexDirection: 'row', alignItems: 'center' },
    productImage: { width: 80, height: 80, borderRadius: 8, marginRight: 15 },
    productInfo: { flex: 1 },
    productName: { fontSize: 18, fontWeight: 'bold' },
    farmerName: { fontSize: 14, color: 'gray' },
    productPrice: { fontSize: 16, color: '#299640', fontWeight: 'bold', marginTop: 5 },
    addToCartButton: { backgroundColor: '#7ECB29', width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
    addToCartText: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
    emptyText: { textAlign: 'center', marginTop: 50, color: 'gray' },
    loadingText: { textAlign: 'center', marginTop: 20, fontSize: 16 },
    modalBackdrop: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'center', alignItems: 'center' },
    modalContent: { backgroundColor: '#fff', padding: 20, borderRadius: 15, width: '90%', alignItems: 'center' },
    modalImage: { width: '100%', height: 200, borderRadius: 10, marginBottom: 15 },
    modalTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 5 },
    modalFarmer: { fontSize: 16, color: 'gray', marginBottom: 15 },
    modalDescription: { fontSize: 16, textAlign: 'center', marginBottom: 15 },
    modalPrice: { fontSize: 20, fontWeight: 'bold', color: '#299640', marginBottom: 20 },
    modalAddToCartButton: { backgroundColor: '#7ECB29', paddingVertical: 12, paddingHorizontal: 30, borderRadius: 25 },
    modalButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
    closeButtonText: { color: '#e74c3c', fontSize: 16, marginTop: 10 },
});