import { View, Text, TextInput, Pressable, StyleSheet, Alert, Image, ScrollView } from "react-native";
import React, { useState, useEffect } from "react";
import { supabase } from "../../../../utils/supabase";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from 'expo-image-picker';

export default function EditProductScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [unit, setUnit] = useState('unidade');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [newImage, setNewImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    
    setLoading(true);
    const fetchProductData = async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        Alert.alert("Erro", "Não foi possível carregar os dados do produto.");
      } else if (data) {
        setName(data.name);
        setDescription(data.description || '');
        setPrice(data.price.toString());
        setUnit(data.unit);
        setImageUrl(data.image_url);
      }
      setLoading(false);
    };
    fetchProductData();
  }, [id]);
  
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
      setNewImage(result.assets[0].uri);
    }
  };
  
  async function handleUpdateProduct() {
    if (!name.trim() || !price.trim()) {
      Alert.alert("Atenção", "Nome e preço são obrigatórios.");
      return;
    }

    setLoading(true);
    let finalImageUrl = imageUrl;

    if (newImage) {
      try {
        const fileExt = newImage.split('.').pop()?.toLowerCase() ?? 'jpeg';
        const fileName = `${Date.now()}.${fileExt}`;
        const formData = new FormData();
        formData.append('file', { uri: newImage, name: fileName, type: `image/${fileExt}` } as any);

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(fileName, formData);
          
        if (uploadError) throw uploadError;

        finalImageUrl = supabase.storage.from('product-images').getPublicUrl(uploadData.path).data.publicUrl;
      } catch (error: any) {
        Alert.alert("Erro no Upload", "Não foi possível enviar a nova imagem.");
        console.error(error);
        setLoading(false);
        return;
      }
    }
    
    const { error } = await supabase
      .from('products')
      .update({
        name: name,
        description: description,
        price: parseFloat(price.replace(',', '.')),
        unit: unit,
        image_url: finalImageUrl
      })
      .eq('id', id);

    setLoading(false);

    if (error) {
      Alert.alert("Erro", "Não foi possível atualizar o produto.");
      console.error("Erro do Supabase Database:", error);
    } else {
      Alert.alert("Sucesso", "Produto atualizado!");
      router.back();
    }
  }
  
  if (loading) {
    return <View style={styles.container}><Text>Carregando...</Text></View>
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{padding: 20}}>
        <Text style={styles.title}>Editar Produto</Text>

        <Pressable style={styles.imagePicker} onPress={pickImage}>
          { (newImage || imageUrl) ? (
            <Image source={{ uri: newImage || imageUrl || undefined }} style={styles.imagePreview} />
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
            <Text style={[styles.radioText, unit === 'kg' && {color: '#fff'}]}>KG</Text>
          </Pressable>
        </View>

        <Pressable style={styles.button} onPress={handleUpdateProduct} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? "Salvando..." : "Salvar Alterações"}</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
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