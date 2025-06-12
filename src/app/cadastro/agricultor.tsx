import { View, Text, StyleSheet, TextInput, Pressable, Alert } from "react-native";
import { useState, useCallback } from "react";
import { Link, router, useFocusEffect } from "expo-router";
import { supabase } from "../../utils/supabase";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AgricultorCadastro() {

const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
const [confirmPassword, setConfirmPassword] = useState('');

async function handleSignUp() {
  if (password !== confirmPassword) {
    Alert.alert("Erro", "As senhas não coincidem!");
    return;
  }

  const { data, error } = await supabase.auth.signUp({
    email: email,
    password: password,
  });

  if (error) {
    Alert.alert("Erro no Cadastro", error.message);
  } else if (data.user) {
    Alert.alert(
      "Cadastro realizado!",
      "Enviamos um link de confirmação para o seu email. Por favor, verifique sua caixa de entrada (e spam) para ativar sua conta."
    );
    router.push('/home');
  }
}

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Cadastro Agricultor</Text>

      <TextInput
      style={styles.input}
      placeholder="seuemail@gmail.com"
      value={email}
      onChangeText={setEmail}
      keyboardType="email-address"
      autoCapitalize="none"/>

      <TextInput
        style={styles.input}
        placeholder="Crie uma senha"
        value={password}
        onChangeText={setPassword}
        secureTextEntry={true}
        autoCapitalize="none"/>

      <TextInput
        style={styles.input}
        placeholder="Confirme sua senha"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry={true}
        autoCapitalize="none"/>

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
    width: '80%',
    height: 45,
    backgroundColor: '#299640',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 25,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 500,
  },
});

