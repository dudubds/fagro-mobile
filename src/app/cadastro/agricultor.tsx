import { View, Text, StyleSheet, TextInput, Pressable, Alert } from "react-native";
import { useState } from "react";
import { Link, router } from "expo-router";
import { supabase } from "../../utils/supabase";

export default function AgricultorCadastro() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Cadastro Agricultor</Text>
    </View>
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
});