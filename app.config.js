// Carrega o .env na raiz do projeto
require('dotenv').config();

// Exporta a configuração
export default {
  "expo": {
    //
    // ----------------------------------------------------
    // (Esta parte é o seu app.json original)
    // ----------------------------------------------------
    //
    "name": "fagro-mobile",
    "slug": "fagro-mobile",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "splash": {
      "image": "./assets/splash-icon.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "ios": {
      "supportsTablet": true
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      },
      "package": "com.fagromobile"
    },
    "web": {
      "favicon": "./assets/favicon.png"
    },
    "plugins": [
      "expo-router"
    ],
    
    //
    // ----------------------------------------------------
    // (Esta é a nova seção que corrige o seu erro)
    // ----------------------------------------------------
    //
    "extra": {
      // Chaves do Supabase (lidas do .env)
      "supabaseUrl": "https://popqguxjvrrjoyvhrqnh.supabase.co",
      "supabaseKey": process.env.EXPO_PUBLIC_SUPABASE_KEY,
      
      // O ID do Projeto EAS (que o terminal pediu)
      "eas": {
        "projectId": "a2b310c4-03c7-4929-9d23-1085f7ff3b6d"
      }
    }
  }
}