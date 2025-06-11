import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://popqguxjvrrjoyvhrqnh.supabase.co'
const supabaseKey = 'process.env.eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBvcHFndXhqdnJyam95dmhycW5oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk2NDg0MTEsImV4cCI6MjA2NTIyNDQxMX0.jBJHnoipG-REBWmt6491yhH748zNIjpEg0XsiaXMs9I'

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
