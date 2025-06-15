import { View, Text, StyleSheet } from "react-native";

export default function ConsumidorDashboard() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bem-vindo, Consumidor!</Text>
      <Text>Aqui você poderá ver os produtos disponíveis.</Text>
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