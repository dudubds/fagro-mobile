// src/app/dashboard/agricultor/edit-product/[id].tsx

import { View, Text, TextInput, Pressable, StyleSheet, Alert, Image, ScrollView, Platform } from "react-native";
import React, { useState, useEffect } from "react";
import { supabase } from "../../../../utils/supabase";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from 'expo-image-picker';
import { MaterialIcons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

export default function EditProductScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  // Estados dos campos existentes
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [unit, setUnit] = useState('unidade');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [newImage, setNewImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Novos estados para as novas funcionalidades
  const [isFragile, setIsFragile] = useState(false);
  const [harvestDate, setHarvestDate] = useState<Date | undefined>(undefined);
  const [expirationDate, setExpirationDate] = useState<Date | undefined>(undefined);
  const [showHarvestPicker, setShowHarvestPicker] = useState(false);
  const [showExpirationPicker, setShowExpirationPicker] = useState(false);

  // Busca os dados do produto para preencher o formulário
  useEffect(() => {
    if (!id) return;
    
    setLoading(true);
    const fetchProductData = async () => {
      const { data, error } = await supabase.from('products').select('*').eq('id', id).single();
      if (error) { Alert.alert("Erro", "Não foi possível carregar os dados do produto."); } 
      else if (data) {
        setName(data.name);
        setDescription(data.description || '');
        setPrice(data.price.toString());
        setUnit(data.unit);
        setImageUrl(data.image_url);
        // Preenche os novos campos
        setIsFragile(data.is_fragile || false);
        setHarvestDate(data.harvest_date ? new Date(data.harvest_date) : undefined);
        setExpirationDate(data.expiration_date ? new Date(data.expiration_date) : undefined);
      }
      setLoading(false);
    };
    fetchProductData();
  }, [id]);

  const onDateChange = (event: DateTimePickerEvent, selectedDate: Date | undefined, dateType: 'harvest' | 'expiration') => {
    if (dateType === 'harvest') { setShowHarvestPicker(false); } 
    else { setShowExpirationPicker(false); }
    if (event.type === 'set' && selectedDate) {
      if (dateType === 'harvest') setHarvestDate(selectedDate);
      else setExpirationDate(selectedDate);
    }
  };
  
  const pickImage = async () => { /* ... (código do pickImage, igual ao de add-product.tsx) ... */ };
  
  async function handleUpdateProduct() {
    setLoading(true);
    let finalImageUrl = imageUrl;
    
    // ... (lógica de upload da imagem, igual à da tela de edição anterior) ...
    
    const { error } = await supabase.from('products').update({
        name, description, price: parseFloat(price.replace(',', '.')), unit, image_url: finalImageUrl,
        // Novos campos sendo atualizados
        is_fragile: isFragile,
        harvest_date: harvestDate?.toISOString().split('T')[0],
        expiration_date: expirationDate?.toISOString().split('T')[0],
      }).eq('id', id);

    setLoading(false);
    if (error) { Alert.alert("Erro", "Não foi possível atualizar o produto."); } 
    else { Alert.alert("Sucesso", "Produto atualizado!"); router.back(); }
  }
  
  if (loading) { return <View style={styles.container}><Text>Carregando...</Text></View> }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{padding: 20}}>
        <Text style={styles.title}>Editar Produto</Text>

        <Pressable style={styles.imagePicker} onPress={pickImage}>
          <Image source={{ uri: newImage || imageUrl || 'https://placehold.co/400' }} style={styles.imagePreview} />
        </Pressable>

        <TextInput style={styles.input} placeholder="Nome do Produto" value={name} onChangeText={setName} />
        <TextInput style={styles.input} placeholder="Descrição" value={description} onChangeText={setDescription} />
        <TextInput style={styles.input} placeholder="Preço (ex: 3,50)" value={price} onChangeText={setPrice} keyboardType="numeric" />

        <View style={styles.unitSelectorContainer}>
            <Text style={styles.label}>Unidade:</Text>
            <Pressable style={[styles.radioBase, unit === 'unidade' && styles.radioSelected]} onPress={() => setUnit('unidade')}><Text style={[styles.radioText, unit === 'unidade' && {color: '#fff'}]}>Unidade</Text></Pressable>
            <Pressable style={[styles.radioBase, unit === 'kg' && styles.radioSelected]} onPress={() => setUnit('kg')}><Text style={[styles.radioText, unit === 'kg' && {color: '#fff'}]}>KG</Text></Pressable>
        </View>

        <Pressable style={styles.checkboxContainer} onPress={() => setIsFragile(!isFragile)}>
            <MaterialIcons name={isFragile ? 'check-box' : 'check-box-outline-blank'} size={24} color="#299640" />
            <Text style={styles.checkboxLabel}>Este produto é frágil</Text>
        </Pressable>

        <Pressable onPress={() => setShowHarvestPicker(true)}>
            <View style={styles.input}>
                <Text style={{color: harvestDate ? '#000' : '#aaa'}}>
                    Data da Colheita: {harvestDate ? harvestDate.toLocaleDateString('pt-BR') : 'Selecione...'}
                </Text>
            </View>
        </Pressable>
        {showHarvestPicker && (
            <DateTimePicker value={harvestDate || new Date()} mode="date" display="default" onChange={(e, d) => onDateChange(e, d, 'harvest')} />
        )}

        <Pressable onPress={() => setShowExpirationPicker(true)}>
            <View style={styles.input}>
                <Text style={{color: expirationDate ? '#000' : '#aaa'}}>
                    Data de Validade: {expirationDate ? expirationDate.toLocaleDateString('pt-BR') : 'Selecione...'}
                </Text>
            </View>
        </Pressable>
        {showExpirationPicker && (
            <DateTimePicker value={expirationDate || new Date()} mode="date" display="default" minimumDate={harvestDate || new Date()} onChange={(e, d) => onDateChange(e, d, 'expiration')} />
        )}

        <Pressable style={styles.button} onPress={handleUpdateProduct} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? "Salvando..." : "Salvar Alterações"}</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

// Os estilos são os mesmos da tela de Adicionar Produto
const styles = StyleSheet.create({
    checkboxContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, alignSelf: 'center', },
    checkboxLabel: { marginLeft: 8, fontSize: 16, },
    container: { flex: 1, backgroundColor: '#F0F8E4' },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
    input: { height: 45, backgroundColor: '#FFFFE4', marginBottom: 15, paddingHorizontal: 15, borderRadius: 25, borderColor: '#299640', borderWidth: 1.5, justifyContent: 'center' },
    label: { fontSize: 16, fontWeight: '500', marginRight: 10 },
    unitSelectorContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, alignSelf: 'center' },
    radioBase: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, borderWidth: 1.5, borderColor: '#299640', marginHorizontal: 5 },
    radioSelected: { backgroundColor: '#299640' },
    radioText: { fontSize: 16, color: '#000' },
    imagePicker: { width: '100%', height: 150, backgroundColor: '#FFFFE4', justifyContent: 'center', alignItems: 'center', borderRadius: 10, borderWidth: 1.5, borderColor: '#299640', marginBottom: 20, overflow: 'hidden' },
    imagePreview: { width: '100%', height: '100%' },
    button: { backgroundColor: "#7ECB29", padding: 12, borderRadius: 20, alignItems: 'center', marginTop: 15 },
    buttonText: { fontSize: 18, color: '#fff', fontWeight: 'bold' },
});