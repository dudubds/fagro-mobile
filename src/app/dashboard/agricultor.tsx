import { View, Text, StyleSheet } from "react-native";

export default function AgricultorDashboard() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Painel do Agricultor</Text>
      <Text>Bem-vindo! Aqui você poderá gerenciar seus produtos.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
  }
});