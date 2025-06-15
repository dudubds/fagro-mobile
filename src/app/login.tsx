// src/app/login.tsx

import { View, Text, StyleSheet, TextInput, Pressable, Alert } from "react-native";
import React, { useState } from "react";
import { Link, router } from "expo-router";
import { supabase } from "../utils/supabase";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

async function handleLogin() {
  if (!email.trim() || !password.trim()) {
    Alert.alert("Atenção", "Preencha email e senha.");
    return;
  }

  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: email,
    password: password,
  });

  if (authError) {
    Alert.alert("Erro no Login", "Email ou senha inválidos.");
    return;
  }

  if (authData.user) {
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('user_type')
      .eq('id', authData.user.id)
      .single();

    if (profileError) {
      Alert.alert("Erro", "Não foi possível encontrar os dados do perfil do usuário.");
      return;
    }

    if (profileData) {
      if (profileData.user_type === 'agricultor') {
        router.replace('/dashboard/agricultor');
      } else if (profileData.user_type === 'consumidor') {
        router.replace('/dashboard/consumidor');
      } else {
        router.replace('/home');
      }
    }
  }
}

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Entrar</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Senha"
        value={password}
        onChangeText={setPassword}
        secureTextEntry={true}
      />

      <Pressable style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Acessar</Text>
      </Pressable>

      <Link href="/home" asChild>
        <Pressable>
            <Text style={styles.backLink}>Voltar</Text>
        </Pressable>
      </Link>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#ddffb2',
      },
      title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
      },
      input: {
        width: '80%',
        height: 45,
        backgroundColor: '#FFFFE4',
        marginBottom: 15,
        paddingHorizontal: 15,
        borderRadius: 25,
        borderColor: '#299640',
        borderWidth: 1.5,
      },
      button: {
        width: 250,
        backgroundColor: "#7ECB29",
        textAlign: "center",
        padding: 8,
        borderRadius: 20,
        marginTop: 15,
        fontSize: 18,
      },
      buttonText: {
        fontSize: 18,
        color: '#fff',
        fontWeight: 'bold',
        textAlign: 'center'
      },
      backLink: {
        marginTop: 20,
        color: '#299640',
        fontSize: 16,
      }
});