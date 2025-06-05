import { View, Text, StyleSheet, Image, Pressable, Alert, } from 'react-native';

export default function Home() {
  return (
    <View style={styles.container}>
      <Image source={require('../../assets/logo-normal.png')} style={styles.logo} />
      <Text style={styles.text}>Bem-vindo (a)</Text>

      <View>

        <Pressable onPress={() => Alert.alert('pressionou')}>
          <Text>Entrar</Text>
        </Pressable>

        <Pressable onPress={() => Alert.alert('pressionou')}>
          <Text>Cadastrar</Text>
        </Pressable>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#C1FF72',
  },
  text: {
    fontSize: 20,
  },
  logo: {
    width: 150,
    height: 150,
  },
});
