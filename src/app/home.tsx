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

export default function Home() {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const toggleModal = () => {
    setIsModalVisible(!isModalVisible);
  };

  return (
    <View style={styles.container}>
      <Image
        source={require("../../assets/logo-normal.png")}
        style={styles.logo}
      />
      <Text style={styles.titulo}>Bem-vindo (a)</Text>

      <View>
        <Pressable onPress={() => Alert.alert("pressionou")}>
          <Text style={styles.button}>Entrar</Text>
        </Pressable>

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
            <View>
              <View style={styles.modalContent}>
                <View style={styles.imageRow}>
                  <Link href={"/agricultor"}>
                    <Pressable style={styles.modalSubContent}>
                      <Image
                        source={require("../../assets/agricultores.png")}
                        style={styles.imagem}
                      />
                      <Text style={styles.text}>Agricultor</Text>
                    </Pressable>
                  </Link>
                  <Link href={"/agricultor"}>
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
            </View>
          </Pressable>
        </TouchableOpacity>
      </Modal>
    </View>
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
    justifyContent: "center",
    gap: 15,
  },
  modalSubContent: {
    display: "flex",
    width: 150,
    backgroundColor: "#7ECB29",
    padding: 10,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    boxShadow: "1px 2px 6px rgba(0, 0, 0, 0.25)",
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
    boxShadow: "1px 4px 6px rgba(0, 0, 0, 0.25)",
  },
});
