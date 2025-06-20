import { View, Text, TextInput, Pressable, StyleSheet, Alert, Image } from "react-native";
import React, { useState } from "react";
import { supabase } from "../../../utils/supabase";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from 'expo-image-picker';

export default function AddProductScreen() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [unit, setUnit] = useState('unidade');
  const [image, setImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Desculpe, precisamos de permissão para acessar suas fotos.');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
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
      formData.append('file', {
        uri: image,
        name: fileName,
        type: `image/${fileExt}`,
      } as any);

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(fileName, formData);

      if (uploadError) {
        throw uploadError;
      }

      const { data: urlData } = supabase.storage
        .from('product-images')
        .getPublicUrl(uploadData.path);
      
      imageUrl = urlData.publicUrl;

    } catch (error: any) {
      Alert.alert("Erro no Upload", "Não foi possível enviar a imagem. Verifique as permissões do Storage.");
      console.error("Erro do Supabase Storage:", error.message || error);
      setUploading(false);
      return;
    }
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    Alert.alert("Erro", "Você precisa estar logado.");
    setUploading(false);
    return;
  }

  const { error: insertError } = await supabase.from('products').insert({
    name: name,
    description: description,
    price: parseFloat(price.replace(',', '.')),
    unit: unit,
    farmer_id: user.id,
    image_url: imageUrl,
  });

  setUploading(false);

  if (insertError) {
    Alert.alert("Erro ao Salvar", "Não foi possível salvar o produto.");
    console.error("Erro do Supabase Database:", insertError);
  } else {
    Alert.alert("Sucesso!", "Produto adicionado.");
    router.back();
  }
}

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Adicionar Novo Produto</Text>

      <Pressable style={styles.imagePicker} onPress={pickImage}>
        {image ? (
          <Image source={{ uri: image }} style={styles.imagePreview} />
        ) : (
          <Text>Selecionar Imagem</Text>
        )}
      </Pressable>

      <TextInput style={styles.input} placeholder="Nome do Produto" value={name} onChangeText={setName} />
      <TextInput style={styles.input} placeholder="Descrição" value={description} onChangeText={setDescription} />
      <TextInput style={styles.input} placeholder="Preço (ex: 3,50)" value={price} onChangeText={setPrice} keyboardType="numeric" />

      <View style={styles.unitSelectorContainer}>
        <Text style={styles.label}>Unidade:</Text>
        <Pressable style={[styles.radioBase, unit === 'unidade' && styles.radioSelected]} onPress={() => setUnit('unidade')}>
          <Text style={[styles.radioText, unit === 'unidade' && {color: '#fff'}]}>Unidade</Text>
        </Pressable>
        <Pressable style={[styles.radioBase, unit === 'kg' && styles.radioSelected]} onPress={() => setUnit('kg')}>
          <Text style={[styles.radioText, unit === 'kg' && {color: '#fff'}]}>Kg</Text>
        </Pressable>
      </View>

      <Pressable style={styles.button} onPress={handleSaveProduct} disabled={uploading}>
        <Text style={styles.buttonText}>{uploading ? "Salvando..." : "Salvar Produto"}</Text>
      </Pressable>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#F0F8E4',
      },
      title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
      },
      input: {
        height: 45,
        backgroundColor: '#FFFFE4',
        marginBottom: 15,
        paddingHorizontal: 15,
        borderRadius: 25,
        borderColor: '#299640',
        borderWidth: 1.5,
      },
      label: {
        fontSize: 16,
        fontWeight: '500',
        marginRight: 10,
      },
      unitSelectorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        alignSelf: 'center',
      },
      radioBase: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        borderWidth: 1.5,
        borderColor: '#299640',
        marginHorizontal: 5,
      },
      radioSelected: {
        backgroundColor: '#299640',
      },
      radioText: {
        fontSize: 16,
        color: '#000'
      },
      imagePicker: {
        width: '100%',
        height: 150,
        backgroundColor: '#FFFFE4',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
        borderWidth: 1.5,
        borderColor: '#299640',
        marginBottom: 20,
        overflow: 'hidden',
      },
      imagePreview: {
        width: '100%',
        height: '100%',
      },
      button: {
        backgroundColor: "#7ECB29",
        padding: 12,
        borderRadius: 20,
        alignItems: 'center',
        marginTop: 15,
      },
      buttonText: {
        fontSize: 18,
        color: '#fff',
        fontWeight: 'bold',
      },
});