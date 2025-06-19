import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
  Alert,
  Modal,
  TouchableOpacity,
} from "react-native";
import { useState } from "react";
import { Link } from "expo-router";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

export default function Home() {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const toggleModal = () => {
    setIsModalVisible(!isModalVisible);
  };

  return (
    <SafeAreaView style={styles.container}>
        <Image
          source={require("../../assets/logo-normal.png")}
          style={styles.logo}
        />
        <Text style={styles.titulo}>Bem-vindo (a)</Text>
        <View>
          <Link href="/login" asChild>
    <Pressable>
        <Text style={styles.button}>Entrar</Text>
    </Pressable>
</Link>
          <Pressable onPress={() => toggleModal()}>
            <Text style={styles.button}>Cadastrar</Text>
          </Pressable>
        </View>
        <Modal
          animationType="fade"
          transparent={true}
          visible={isModalVisible}
          onRequestClose={toggleModal}
        >
          <TouchableOpacity
            style={styles.modal}
            activeOpacity={1}
            onPressOut={() => setIsModalVisible(false)}
          >
            <Pressable>
                <View style={styles.modalContent}>
                  <View style={styles.imageRow}>
                    <Link href={"/cadastro/agricultor"} asChild>
                      <Pressable style={styles.modalSubContent}>
                        <Image
                          source={require("../../assets/agricultores.png")}
                          style={styles.imagem}
                        />
                        <Text style={styles.text}>Agricultor</Text>
                      </Pressable>
                    </Link>
                    <Link href={"/cadastro/consumidor"} asChild>
                      <Pressable style={styles.modalSubContent}>
                        <Image
                          source={require("../../assets/consumidores.png")}
                          style={styles.imagem}
                        />
                        <Text style={styles.text}>Consumidor</Text>
                      </Pressable>
                    </Link>
                  </View>
                </View>
            </Pressable>
          </TouchableOpacity>
        </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ddffb2",
  },
  titulo: {
    fontSize: 24,
    fontWeight: "bold",
  },
  text: {
    fontSize: 18,
    textAlign: "center",
  },
  logo: {
    width: 150,
    height: 150,
  },
  imagem: {
    width: 100,
    height: 100,
    marginBottom: 5,
  },
  modal: {
    display: "flex",
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.65)",
  },
  modalContent: {
    width: "auto",
    height: "auto",
    backgroundColor: "#FFFFE4",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
    padding: 15,
  },
  imageRow: {
    flexDirection: "row",
    gap: 15,
    justifyContent: "center",
  },
  modalSubContent: {
    display: "flex",
    width: 150,
    backgroundColor: "#7ECB29",
    padding: 10,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 1, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  modalButton: {
    backgroundColor: "#7ECB29",
  },
  button: {
    backgroundColor: "#7ECB29",
    width: 250,
    textAlign: "center",
    padding: 8,
    borderRadius: 20,
    marginTop: 15,
    fontSize: 18,
    shadowColor: "#000",
    shadowOffset: { width: 1, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
});
