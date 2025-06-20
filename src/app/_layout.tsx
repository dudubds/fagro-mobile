import { Stack } from 'expo-router';
import { CartProvider } from '../context/CartContext';

export default function RootLayout() {
  return (
    <CartProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="login" />
        <Stack.Screen name="cadastro/agricultor" />
        <Stack.Screen name="cadastro/consumidor" />
        <Stack.Screen name="dashboard/consumidor" />
      </Stack>
    </CartProvider>
  );
}