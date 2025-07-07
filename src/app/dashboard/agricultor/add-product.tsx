// src/app/dashboard/agricultor/add-product.tsx

import { View, Text, TextInput, Pressable, StyleSheet, Alert, Image, Platform } from "react-native";
import React, { useState } from "react";
import { supabase } from "../../../utils/supabase";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from 'expo-image-picker';
import { MaterialIcons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

const CATEGORIES = ['Frutas', 'Legumes', 'Verduras', 'Embutidos', 'Outros'];

export default function AddProductScreen() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [unit, setUnit] = useState('unidade');
  const [image, setImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [isFragile, setIsFragile] = useState(false);
  const [harvestDate, setHarvestDate] = useState<Date | undefined>(new Date());
  const [expirationDate, setExpirationDate] = useState<Date | undefined>(undefined);
  const [showHarvestPicker, setShowHarvestPicker] = useState(false);
  const [showExpirationPicker, setShowExpirationPicker] = useState(false);
  const [category, setCategory] = useState('');

  // ... (As funções de lógica como onDateChange, pickImage, e handleSaveProduct continuam as mesmas)
  const onDateChange = (event: DateTimePickerEvent, selectedDate: Date | undefined, dateType: 'harvest' | 'expiration') => {
    setShowHarvestPicker(false);
    setShowExpirationPicker(false);
    if (event.type === 'set' && selectedDate) {
      if (dateType === 'harvest') setHarvestDate(selectedDate);
      else setExpirationDate(selectedDate);
    }
  };
  const pickImage = async () => { /* ... */ };
  const handleSaveProduct = async () => { /* ... */ };


  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Adicionar Produto</Text>
        
        <Pressable style={styles.imagePicker} onPress={pickImage}>
            {image ? <Image source={{ uri: image }} style={styles.imagePreview} /> : <MaterialIcons name="add-a-photo" size={40} color="#aaa" />}
        </Pressable>

        <TextInput style={styles.input} placeholder="Nome do Produto" value={name} onChangeText={setName} />

        {/* Linha para Preço e Unidade */}
        <View style={styles.row}>
            <TextInput style={[styles.input, {flex: 1}]} placeholder="Preço (ex: 3,50)" value={price} onChangeText={setPrice} keyboardType="numeric" />
            <View style={styles.unitSelector}>
                <Pressable style={[styles.radioBase, unit === 'unidade' && styles.radioSelected]} onPress={() => setUnit('unidade')}><Text style={[styles.radioText, unit === 'unidade' && {color: '#fff'}]}>Un</Text></Pressable>
                <Pressable style={[styles.radioBase, unit === 'kg' && styles.radioSelected]} onPress={() => setUnit('kg')}><Text style={[styles.radioText, unit === 'kg' && {color: '#fff'}]}>Kg</Text></Pressable>
            </View>
        </View>

        <Text style={styles.label}>Categoria</Text>
        <View style={styles.categoryContainer}>
            {CATEGORIES.map(cat => (
                <Pressable key={cat} style={[styles.tag, category === cat && styles.tagSelected]} onPress={() => setCategory(cat)}>
                    <Text style={[styles.tagText, category === cat && {color: '#fff'}]}>{cat}</Text>
                </Pressable>
            ))}
        </View>

        {/* Linha para Colheita e Validade */}
        <View style={styles.row}>
            <Pressable onPress={() => setShowHarvestPicker(true)} style={{flex: 1}}>
                <Text style={styles.label}>Colheita</Text>
                <View style={styles.dateInput}><Text>{harvestDate ? harvestDate.toLocaleDateString('pt-BR') : 'Selecione'}</Text></View>
            </Pressable>
            <Pressable onPress={() => setShowExpirationPicker(true)} style={{flex: 1}}>
                <Text style={styles.label}>Validade</Text>
                <View style={styles.dateInput}><Text>{expirationDate ? expirationDate.toLocaleDateString('pt-BR') : 'Selecione'}</Text></View>
            </Pressable>
        </View>
        {showHarvestPicker && <DateTimePicker value={harvestDate || new Date()} mode="date" display="default" onChange={(e,d) => onDateChange(e,d,'harvest')} />}
        {showExpirationPicker && <DateTimePicker value={expirationDate || new Date()} mode="date" display="default" onChange={(e,d) => onDateChange(e,d,'expiration')} />}

        <Pressable style={styles.checkboxContainer} onPress={() => setIsFragile(!isFragile)}>
            <MaterialIcons name={isFragile ? 'check-box' : 'check-box-outline-blank'} size={24} color="#299640" />
            <Text style={styles.checkboxLabel}>Produto Frágil</Text>
        </Pressable>
      </View>

      <View style={styles.footer}>
        <Pressable style={styles.button} onPress={handleSaveProduct} disabled={uploading}>
            <Text style={styles.buttonText}>{uploading ? "Salvando..." : "Salvar Produto"}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

// ESTILOS ATUALIZADOS
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F0F8E4' },
    content: { flex: 1, paddingHorizontal: 20, paddingTop: 10 },
    title: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
    imagePicker: {
        width: 120, height: 120, borderRadius: 60, // <-- Imagem redonda
        backgroundColor: '#E8F5E9', justifyContent: 'center', alignItems: 'center',
        alignSelf: 'center', marginBottom: 20, borderWidth: 2, borderColor: '#C8E6C9', overflow: 'hidden'
    },
    imagePreview: { width: '100%', height: '100%' },
    input: {
        height: 50, backgroundColor: '#fff', marginBottom: 15, paddingHorizontal: 15,
        borderRadius: 10, borderWidth: 1, borderColor: '#ddd'
    },
    label: { fontSize: 16, fontWeight: '500', marginBottom: 5, color: '#333' },
    row: { flexDirection: 'row', gap: 10, alignItems: 'center' },
    unitSelector: {
        flexDirection: 'row', backgroundColor: '#fff', padding: 5,
        borderRadius: 10, borderWidth: 1, borderColor: '#ddd'
    },
    radioBase: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8 },
    radioSelected: { backgroundColor: '#299640' },
    radioText: { fontSize: 16, color: '#333', fontWeight: 'bold' },
    categoryContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-start', marginBottom: 15, gap: 10 },
    tag: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, backgroundColor: '#E8F5E9', borderWidth: 1, borderColor: '#C8E6C9'},
    tagSelected: { backgroundColor: '#299640', borderColor: '#299640' },
    tagText: { fontSize: 14, color: '#333'},
    dateInput: {
        height: 50, backgroundColor: '#fff', paddingHorizontal: 15, borderRadius: 10,
        borderWidth: 1, borderColor: '#ddd', justifyContent: 'center'
    },
    checkboxContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 20, alignSelf: 'center' },
    checkboxLabel: { marginLeft: 8, fontSize: 16 },
    footer: { padding: 20, borderTopWidth: 1, borderColor: '#eee' },
    button: { backgroundColor: "#7ECB29", padding: 15, borderRadius: 10, alignItems: 'center' },
    buttonText: { fontSize: 18, color: '#fff', fontWeight: 'bold' },
});