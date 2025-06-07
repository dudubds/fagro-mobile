import { View, Text, Image, Pressable } from "react-native";
import { useState } from "react";
import { Link } from "expo-router";

export default function Agricultor() {
  return (  <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
    <Text>Agricultor</Text>
    <Link href="/home" >Home</Link>
  </View>
  )
}
