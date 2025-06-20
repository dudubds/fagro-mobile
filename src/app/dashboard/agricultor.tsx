import { View, Text, StyleSheet, Pressable, FlatList, Alert, Image } from "react-native";
import React, { useState, useCallback } from 'react';
import { supabase } from "../../utils/supabase";
import { Link, router, useFocusEffect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AgricultorDashboard() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

  useFocusEffect(
    useCallback(() => {
      fetchProducts();
    }, [])
  );

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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace('/');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Meus Produtos</Text>
        <Pressable onPress={handleLogout}>
          <Text style={styles.logoutText}>Sair</Text>
        </Pressable>
      </View>

      {loading && <Text>Carregando...</Text>}

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
                  <Text style={styles.buttonText}>Editar</Text>
                </Pressable>
              </Link>
              <Pressable style={styles.deleteButton} onPress={() => handleDelete(item.id)}>
                <Text style={styles.buttonText}>Excluir</Text>
              </Pressable>
            </View>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>Você ainda não tem produtos cadastrados.</Text>}
        contentContainerStyle={{ paddingHorizontal: 20 }}
      />
      
      <Link href="/dashboard/agricultor/add-product" asChild>
        <Pressable style={styles.addButton}>
          <Text style={styles.addButtonText}>Adicionar Novo Produto</Text>
        </Pressable>
      </Link>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F0F8E4' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20 },
    title: { fontSize: 24, fontWeight: 'bold' },
    logoutText: { color: '#299640', fontSize: 16 },
    productItem: { 
      backgroundColor: '#fff', padding: 10, borderRadius: 10, marginBottom: 10, borderWidth: 1, borderColor: '#ddd',
      flexDirection: 'row', alignItems: 'center'
    },
    productImage: { width: 60, height: 60, borderRadius: 8, marginRight: 10 },
    productInfo: { flex: 1 },
    productName: { fontSize: 18, fontWeight: 'bold' },
    actionsContainer: { flexDirection: 'column', gap: 5 },
    editButton: { backgroundColor: '#3498db', paddingVertical: 5, paddingHorizontal: 10, borderRadius: 5 },
    deleteButton: { backgroundColor: '#e74c3c', paddingVertical: 5, paddingHorizontal: 10, borderRadius: 5 },
    buttonText: { color: '#fff' },
    emptyText: { textAlign: 'center', marginTop: 50, color: 'gray' },
    addButton: { backgroundColor: "#7ECB29", padding: 15, borderRadius: 30, margin: 20, alignItems: 'center' },
    addButtonText: { fontSize: 18, color: '#fff', fontWeight: 'bold' },
});