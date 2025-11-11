import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// 1. Importe o Constants
import Constants from 'expo-constants';

// 2. Leia as chaves do "extra" que você definiu no app.config.js
// Cuidado: 'Constants.expoConfig.extra' é o tipo correto.
const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl;
const supabaseKey = Constants.expoConfig?.extra?.supabaseKey;

// 3. Verifique se as chaves foram carregadas (para debug)
if (!supabaseUrl || !supabaseKey) {
  console.error("ERRO: Variáveis do Supabase não carregadas! Verifique o app.config.js e o .env");
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});