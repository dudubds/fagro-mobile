import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// A url pode ficar hardcoded ou vir do .env (preferível hardcoded se for fixa para evitar erros)
const supabaseUrl = 'https://popqguxjvrrjoyvhrqnh.supabase.co';

// AQUI ESTÁ A CORREÇÃO: Usar process.env.EXPO_PUBLIC_...
// O babel-preset-expo vai preencher isso automaticamente no Dev e no Release
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_KEY || "";

if (!supabaseKey) {
  console.error("ERRO CRÍTICO: Chave do Supabase não encontrada! Verifique seu arquivo .env");
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});