// src/app/profile.tsx

import { View, Text, StyleSheet, TextInput, Pressable, Alert, ScrollView, Image } from "react-native";
import React, { useState, useCallback } from "react";
import { supabase } from "../utils/supabase";
import { useFocusEffect, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from 'expo-image-picker';
import { MaterialIcons } from '@expo/vector-icons';

export default function ProfileScreen() {
    const [loading, setLoading] = useState(true);
    const [fullName, setFullName] = useState('');
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [newAvatar, setNewAvatar] = useState<string | null>(null); // Para a nova imagem selecionada
    // ... (outros estados para endereço)
    const [street, setStreet] = useState('');
    const [number, setNumber] = useState('');
    const [neighborhood, setNeighborhood] = useState('');
    const [city, setCity] = useState('');
    const [state, setState] = useState('');
    const [zipCode, setZipCode] = useState('');


    useFocusEffect(
        useCallback(() => {
            const fetchProfile = async () => {
                setLoading(true);
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    const { data: profileData, error } = await supabase
                        .from('profiles')
                        .select('*')
                        .eq('id', user.id)
                        .single();
                    if (error) { Alert.alert("Erro", "Não foi possível carregar seu perfil."); } 
                    else if (profileData) {
                        setFullName(profileData.full_name || '');
                        setAvatarUrl(profileData.avatar_url || null);
                        setStreet(profileData.street || '');
                        setNumber(profileData.number || '');
                        setNeighborhood(profileData.neighborhood || '');
                        setCity(profileData.city || '');
                        setState(profileData.state || '');
                        setZipCode(profileData.zip_code || '');
                    }
                }
                setLoading(false);
            };
            fetchProfile();
        }, [])
    );

    const pickAvatar = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Desculpe, precisamos de permissão para acessar suas fotos.');
          return;
        }
        let result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1], // Quadrado para fotos de perfil
          quality: 1,
        });
        if (!result.canceled) {
          setNewAvatar(result.assets[0].uri);
        }
    };

    const handleUpdateProfile = async () => {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        let finalAvatarUrl = avatarUrl;
        // Se uma nova imagem foi escolhida, faz o upload dela
        if (newAvatar) {
            try {
                const fileExt = newAvatar.split('.').pop()?.toLowerCase() ?? 'jpeg';
                const fileName = `${user.id}.${fileExt}`; // Nome de arquivo único por usuário
                const formData = new FormData();
                formData.append('file', { uri: newAvatar, name: fileName, type: `image/${fileExt}` } as any);

                const { error: uploadError } = await supabase.storage
                  .from('avatars')
                  .upload(fileName, formData, { upsert: true }); // upsert: true substitui a imagem antiga
                  
                if (uploadError) throw uploadError;

                finalAvatarUrl = supabase.storage.from('avatars').getPublicUrl(fileName).data.publicUrl;
            } catch (error: any) {
                Alert.alert("Erro no Upload", "Não foi possível enviar a nova imagem.");
                console.error(error);
                setLoading(false);
                return;
            }
        }

        const updates = {
            id: user.id,
            full_name: fullName,
            avatar_url: finalAvatarUrl,
            street, number, neighborhood, city, state, zip_code: zipCode,
            updated_at: new Date(),
        };

        const { error } = await supabase.from('profiles').upsert(updates);

        if (error) { Alert.alert("Erro", "Não foi possível atualizar o perfil."); } 
        else { Alert.alert("Sucesso", "Perfil atualizado!"); router.back(); }
        setLoading(false);
    };

    if (loading) { return <View style={styles.container}><Text>Carregando perfil...</Text></View>; }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={{alignItems: 'center', marginBottom: 20}}>
                    <Pressable onPress={pickAvatar}>
                        <Image 
                            source={{ uri: newAvatar || avatarUrl || 'https://placehold.co/150' }} 
                            style={styles.avatar} 
                        />
                        <View style={styles.editIconContainer}>
                           <MaterialIcons name="edit" size={20} color="white" />
                        </View>
                    </Pressable>
                </View>

                <Text style={styles.title}>Meu Perfil</Text>
                
                <Text style={styles.label}>Nome Completo</Text>
                <TextInput style={styles.input} value={fullName} onChangeText={setFullName} />
                <Text style={styles.label}>CEP</Text>
                <TextInput style={styles.input} placeholder="99999-999" value={zipCode} onChangeText={setZipCode} keyboardType="numeric" />
                <Text style={styles.label}>Rua / Logradouro</Text>
                <TextInput style={styles.input} value={street} onChangeText={setStreet} />
                <Text style={styles.label}>Número</Text>
                <TextInput style={styles.input} value={number} onChangeText={setNumber} />
                <Text style={styles.label}>Bairro</Text>
                <TextInput style={styles.input} value={neighborhood} onChangeText={setNeighborhood} />
                <Text style={styles.label}>Cidade</Text>
                <TextInput style={styles.input} value={city} onChangeText={setCity} />
                <Text style={styles.label}>Estado</Text>
                <TextInput style={styles.input} placeholder="Ex: RS" value={state} onChangeText={setState} maxLength={2} autoCapitalize="characters" />

                <Pressable style={styles.button} onPress={handleUpdateProfile} disabled={loading}>
                    <Text style={styles.buttonText}>{loading ? 'Salvando...' : 'Salvar Alterações'}</Text>
                </Pressable>
            </ScrollView>
        </SafeAreaView>
    );
}

// Adicione os novos estilos de avatar
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F0F8E4' },
    scrollContent: { padding: 20 },
    avatar: { width: 120, height: 120, borderRadius: 60, borderWidth: 3, borderColor: '#7ECB29' },
    editIconContainer: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#299640', padding: 8, borderRadius: 20 },
    title: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
    label: { fontSize: 16, fontWeight: '500', marginBottom: 5, color: '#333' },
    input: { height: 45, backgroundColor: '#FFFFE4', marginBottom: 15, paddingHorizontal: 15, borderRadius: 10, borderColor: '#299640', borderWidth: 1 },
    button: { backgroundColor: "#7ECB29", padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 20 },
    buttonText: { fontSize: 18, color: '#fff', fontWeight: 'bold' },
});