import { View, Text, TextInput, Pressable, StyleSheet, Alert, Image, ScrollView, Platform } from "react-native";
import React, { useState } from "react";
import { supabase } from "../../../utils/supabase";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from 'expo-image-picker';
import { MaterialIcons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

export default function AddProductScreen() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [unit, setUnit] = useState('unidade');
  const [image, setImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  // Novos estados
  const [isFragile, setIsFragile] = useState(false);
  const [harvestDate, setHarvestDate] = useState<Date | undefined>(new Date());
  const [expirationDate, setExpirationDate] = useState<Date | undefined>(undefined);
  const [showHarvestPicker, setShowHarvestPicker] = useState(false);
  const [showExpirationPicker, setShowExpirationPicker] = useState(false);

  // Função genérica para lidar com a mudança de data
  const onDateChange = (event: DateTimePickerEvent, selectedDate: Date | undefined, dateType: 'harvest' | 'expiration') => {
    if (dateType === 'harvest') {
      setShowHarvestPicker(false);
      if (event.type === 'set' && selectedDate) {
        setHarvestDate(selectedDate);
      }
    } else {
      setShowExpirationPicker(false);
      if (event.type === 'set' && selectedDate) {
        setExpirationDate(selectedDate);
      }
    }
  };
  
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Desculpe, precisamos de permissão para acessar suas fotos.');
      return;
    }
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [4, 3], quality: 1,
    });
    if (!result.canceled) { setImage(result.assets[0].uri); }
  };

  async function handleSaveProduct() {
    if (!name.trim() || !price.trim() || !unit.trim()) {
      Alert.alert("Atenção", "Nome, preço e unidade são obrigatórios.");
      return;
    }
    setUploading(true);
    let imageUrl = '';
    if (image) {
      try {
        const fileExt = image.split('.').pop()?.toLowerCase() ?? 'jpeg';
        const fileName = `${Date.now()}.${fileExt}`;
        const formData = new FormData();
        formData.append('file', { uri: image, name: fileName, type: `image/${fileExt}` } as any);
        const { data: uploadData, error: uploadError } = await supabase.storage.from('product-images').upload(fileName, formData);
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(uploadData.path);
        imageUrl = urlData.publicUrl;
      } catch (error: any) {
        Alert.alert("Erro no Upload", "Não foi possível enviar a imagem.");
        setUploading(false); return;
      }
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      Alert.alert("Erro", "Você precisa estar logado.");
      setUploading(false); return;
    }

    const { error: insertError } = await supabase.from('products').insert({
      name, description, price: parseFloat(price.replace(',', '.')), unit, farmer_id: user.id, image_url: imageUrl,
      is_fragile: isFragile,
      harvest_date: harvestDate?.toISOString().split('T')[0],
      expiration_date: expirationDate?.toISOString().split('T')[0],
    });

    setUploading(false);
    if (insertError) {
      Alert.alert("Erro ao Salvar", "Não foi possível salvar o produto.");
    } else {
      Alert.alert("Sucesso!", "Produto adicionado.");
      router.back();
    }
  }

  return (
    <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={{padding: 20}}>
            <Text style={styles.title}>Adicionar Novo Produto</Text>
            
            <Pressable style={styles.imagePicker} onPress={pickImage}>
                {image ? <Image source={{ uri: image }} style={styles.imagePreview} /> : <Text>Selecionar Imagem</Text>}
            </Pressable>

            <TextInput style={styles.input} placeholder="Nome do Produto" value={name} onChangeText={setName} />
            <TextInput style={styles.input} placeholder="Descrição" value={description} onChangeText={setDescription} />
            <TextInput style={styles.input} placeholder="Preço (ex: 3,50)" value={price} onChangeText={setPrice} keyboardType="numeric" />

            <View style={styles.unitSelectorContainer}>
                <Text style={styles.label}>Unidade:</Text>
                <Pressable style={[styles.radioBase, unit === 'unidade' && styles.radioSelected]} onPress={() => setUnit('unidade')}><Text style={[styles.radioText, unit === 'unidade' && {color: '#fff'}]}>Unidade</Text></Pressable>
                <Pressable style={[styles.radioBase, unit === 'kg' && styles.radioSelected]} onPress={() => setUnit('kg')}><Text style={[styles.radioText, unit === 'kg' && {color: '#fff'}]}>KG</Text></Pressable>
            </View>

            {/* Checkbox para Produto Frágil */}
            <Pressable style={styles.checkboxContainer} onPress={() => setIsFragile(!isFragile)}>
                <MaterialIcons name={isFragile ? 'check-box' : 'check-box-outline-blank'} size={24} color="#299640" />
                <Text style={styles.checkboxLabel}>Este produto é frágil</Text>
            </Pressable>

            {/* Seletor de Data da Colheita */}
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

            {/* Seletor de Data de Validade */}
            <Pressable onPress={() => setShowExpirationPicker(true)}>
                <View style={styles.input}>
                    <Text style={{color: expirationDate ? '#000' : '#aaa'}}>
                        Data de Validade: {expirationDate ? expirationDate.toLocaleDateString('pt-BR') : 'Selecione...'}
                    </Text>
                </View>
            </Pressable>
            {showExpirationPicker && (
                <DateTimePicker value={expirationDate || new Date()} mode="date" display="default" onChange={(e, d) => onDateChange(e, d, 'expiration')} />
            )}

            <Pressable style={styles.button} onPress={handleSaveProduct} disabled={uploading}>
                <Text style={styles.buttonText}>{uploading ? "Salvando..." : "Salvar Produto"}</Text>
            </Pressable>
        </ScrollView>
    </SafeAreaView>
  );
}

// Adicione os novos estilos ao seu StyleSheet
const styles = StyleSheet.create({
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        alignSelf: 'center',
    },
    checkboxLabel: {
        marginLeft: 8,
        fontSize: 16,
    },
    // O resto dos seus estilos
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