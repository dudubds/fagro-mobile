// src/app/dashboard/agricultor.tsx

import { View, Text, StyleSheet, Pressable, FlatList, Alert, Image, Modal, TouchableOpacity } from "react-native";
import React, { useState, useCallback } from 'react';
import { supabase } from "../../utils/supabase";
import { Link, router, useFocusEffect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from '@expo/vector-icons';

export default function AgricultorDashboard() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [menuVisible, setMenuVisible] = useState(false); // Estado para o menu

  // Busca os produtos do agricultor logado
  const fetchProducts = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('farmer_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      Alert.alert("Erro", "Não foi possível carregar seus produtos.");
    } else {
      setProducts(data);
    }
    setLoading(false);
  };

  // Recarrega os produtos sempre que a tela ganha foco
  useFocusEffect(
    useCallback(() => {
      fetchProducts();
    }, [])
  );

  // Função para excluir um produto
  const handleDelete = async (productId: string) => {
    Alert.alert(
      "Confirmar Exclusão",
      "Você tem certeza que quer excluir este produto? Esta ação não pode ser desfeita.",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Excluir", 
          style: "destructive",
          onPress: async () => {
            const { error } = await supabase
              .from('products')
              .delete()
              .eq('id', productId);

            if (error) {
              Alert.alert("Erro", "Não foi possível excluir o produto.");
            } else {
              setProducts(products.filter(p => p.id !== productId));
              Alert.alert("Sucesso", "Produto excluído.");
            }
          }
        }
      ]
    );
  };

  // Função de logout
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace('/');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Modal do Menu Hambúrguer */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={menuVisible}
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

      {/* Cabeçalho da Tela */}
      <View style={styles.header}>
        <Text style={styles.title}>Meus Produtos</Text>
        <Pressable onPress={() => setMenuVisible(true)}>
          <MaterialIcons name="menu" size={32} color="black" />
        </Pressable>
      </View>

      {loading && <Text style={styles.loadingText}>Carregando...</Text>}

      {/* Lista de Produtos */}
      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.productItem}>
            <Image source={{ uri: item.image_url || 'https://placehold.co/100' }} style={styles.productImage} />
            <View style={styles.productInfo}>
              <Text style={styles.productName}>{item.name}</Text>
              <Text>R$ {item.price.toFixed(2)} / {item.unit}</Text>
            </View>
            <View style={styles.actionsContainer}>
              <Link href={`/dashboard/agricultor/edit-product/${item.id}`} asChild>
                <Pressable style={styles.editButton}>
                  <MaterialIcons name="edit" size={20} color="#fff" />
                </Pressable>
              </Link>
              <Pressable style={styles.deleteButton} onPress={() => handleDelete(item.id)}>
                <MaterialIcons name="delete-outline" size={20} color="#fff" />
              </Pressable>
            </View>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>Você ainda não tem produtos cadastrados.</Text>}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }} // Padding no final
      />
      
      {/* Botão Flutuante para Adicionar Produto */}
      <Link href="/dashboard/agricultor/add-product" asChild>
        <Pressable style={styles.addButton}>
          <Text style={styles.addButtonText}>+</Text>
        </Pressable>
      </Link>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        backgroundColor: '#F0F8E4' 
    },
    header: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        padding: 20, 
        borderBottomWidth: 1, 
        borderColor: '#ddd' 
    },
    title: { 
        fontSize: 24, 
        fontWeight: 'bold' 
    },
    menuBackdrop: { 
        flex: 1 
    },
    menuContainer: {
        position: 'absolute',
        top: 85, 
        right: 20,
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 10,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    menuItem: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        paddingVertical: 10, 
        paddingHorizontal: 15
    },
    menuItemText: { 
        fontSize: 18, 
        marginLeft: 10 
    },
    loadingText: { 
        textAlign: 'center', 
        marginTop: 20, 
        fontSize: 16 
    },
    productItem: { 
      backgroundColor: '#fff', 
      padding: 10, 
      borderRadius: 10, 
      marginVertical: 8, 
      borderWidth: 1, 
      borderColor: '#eee',
      flexDirection: 'row', 
      alignItems: 'center', 
      elevation: 2,
    },
    productImage: { 
        width: 60, 
        height: 60, 
        borderRadius: 8, 
        marginRight: 10 
    },
    productInfo: { 
        flex: 1 
    },
    productName: { 
        fontSize: 18, 
        fontWeight: 'bold' 
    },
    actionsContainer: { 
        flexDirection: 'column', 
        gap: 8 
    },
    editButton: { 
        backgroundColor: '#3498db', 
        padding: 8, 
        borderRadius: 20 
    },
    deleteButton: { 
        backgroundColor: '#e74c3c', 
        padding: 8, 
        borderRadius: 20 
    },
    emptyText: { 
        textAlign: 'center', 
        marginTop: 50, 
        color: 'gray', 
        fontSize: 16 
    },
    addButton: {
        position: 'absolute',
        bottom: 30,
        right: 30,
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: "#7ECB29",
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
    },
    addButtonText: { 
        fontSize: 30, 
        color: '#fff', 
        fontWeight: 'bold' 
    },
});