import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://popqguxjvrrjoyvhrqnh.supabase.co'
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_KEY;

console.log("-----------------------------------------");
console.log("INICIANDO CLIENTE SUPABASE...");
console.log("URL do Supabase:", supabaseUrl);
console.log("Chave da API que está sendo usada:", supabaseKey);
console.log("-----------------------------------------");

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
