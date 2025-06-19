import { View, Text, StyleSheet, TextInput, Pressable, Alert } from "react-native";
import React, { useState, useCallback } from "react";
import { router, useFocusEffect } from "expo-router";
import { supabase } from "../../utils/supabase";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ConsumidorCadastro() {
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useFocusEffect(
    useCallback(() => {
      setEmail('');
      setFullName('');
      setPassword('');
      setConfirmPassword('');
    }, [])
  );

  async function handleSignUp() {
    if (!fullName.trim() || !email.trim() || !password) {
      Alert.alert("Atenção", "Por favor, preencha todos os campos.");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Erro", "As senhas não coincidem!");
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          full_name: fullName,
          user_type: 'consumidor'
        }
      }
    });

    if (error) {
      Alert.alert("Erro no Cadastro", error.message);
    } else if (data.user) {
      Alert.alert(
        "Cadastro realizado!",
        "Enviamos um link de confirmação para o seu email para ativar sua conta."
      );
      router.push('/login');
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Cadastro de Consumidor</Text>

      <TextInput
        style={styles.input}
        placeholder="Nome Completo"
        value={fullName}
        onChangeText={setFullName}
        autoCapitalize="words"
      />

      <TextInput
        style={styles.input}
        placeholder="seuemail@gmail.com"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Crie uma senha"
        value={password}
        onChangeText={setPassword}
        secureTextEntry={true}
      />

      <TextInput
        style={styles.input}
        placeholder="Confirme sua senha"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry={true}
      />

      <Pressable style={styles.button} onPress={handleSignUp}>
        <Text style={styles.buttonText}>Cadastrar</Text>
      </Pressable>
    </SafeAreaView>
  )
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
});